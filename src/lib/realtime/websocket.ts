// WebSocket connection manager for real-time features
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  timeout: number;
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  id: string;
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  reconnectAttempts: number;
  latency?: number;
}

type MessageHandler = (message: WebSocketMessage) => void;
type StateChangeHandler = (state: ConnectionState) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private stateChangeHandlers: StateChangeHandler[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState;
  private messageQueue: WebSocketMessage[] = [];
  private lastHeartbeat: number = 0;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || `ws://localhost:3001`,
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      timeout: config.timeout || 5000,
    };

    this.connectionState = {
      status: 'disconnected',
      reconnectAttempts: 0,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.updateConnectionState({ status: 'connecting' });

      try {
        this.ws = new WebSocket(this.config.url);

        const connectionTimeout = setTimeout(() => {
          this.ws?.close();
          reject(new Error('WebSocket connection timeout'));
        }, this.config.timeout);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          this.updateConnectionState({
            status: 'connected',
            lastConnected: new Date(),
            reconnectAttempts: 0,
          });

          this.startHeartbeat();
          this.processMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          this.stopHeartbeat();
          this.updateConnectionState({ status: 'disconnected' });

          if (
            !event.wasClean &&
            this.connectionState.reconnectAttempts <
              this.config.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = () => {
          clearTimeout(connectionTimeout);
          this.updateConnectionState({ status: 'error' });
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        this.updateConnectionState({ status: 'error' });
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopReconnect();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.updateConnectionState({ status: 'disconnected' });
  }

  send(type: string, payload: unknown): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateMessageId(),
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  subscribe(messageType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }

    this.messageHandlers.get(messageType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.stateChangeHandlers.indexOf(handler);
      if (index > -1) {
        this.stateChangeHandlers.splice(index, 1);
      }
    };
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  getLatency(): number | null {
    return this.connectionState.latency || null;
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      // Handle heartbeat responses
      if (message.type === 'heartbeat_response') {
        this.connectionState.latency = Date.now() - this.lastHeartbeat;
        return;
      }

      // Dispatch to registered handlers
      const handlers = this.messageHandlers.get(message.type) || [];
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };

    this.stateChangeHandlers.forEach((handler) => {
      try {
        handler(this.connectionState);
      } catch (error) {
        console.error('Error in state change handler:', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.connectionState.reconnectAttempts++;

    const delay = Math.min(
      this.config.reconnectInterval *
        Math.pow(2, this.connectionState.reconnectAttempts - 1),
      30000, // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(() => {
        // Reconnection failed, will try again if under limit
      });
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.lastHeartbeat = Date.now();
        this.send('heartbeat', { timestamp: this.lastHeartbeat });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private processMessageQueue(): void {
    while (
      this.messageQueue.length > 0 &&
      this.ws?.readyState === WebSocket.OPEN
    ) {
      const message = this.messageQueue.shift()!;
      this.ws.send(JSON.stringify(message));
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Live Chat Implementation
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
  type: 'user' | 'agent' | 'system';
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

export interface ChatSession {
  id: string;
  userId: string;
  agentId?: string;
  status: 'waiting' | 'active' | 'closed';
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  metadata: {
    userAgent?: string;
    currentPage?: string;
    referrer?: string;
    customerInfo?: Record<string, unknown>;
  };
}

class LiveChatManager {
  private wsManager: WebSocketManager;
  private currentSession: ChatSession | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private sessionHandlers: ((session: ChatSession) => void)[] = [];
  private typingIndicator: NodeJS.Timeout | null = null;

  constructor(wsManager: WebSocketManager) {
    this.wsManager = wsManager;
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    this.wsManager.subscribe('chat_message', (wsMessage) => {
      const chatMessage = wsMessage.payload as ChatMessage;
      if (this.currentSession) {
        this.currentSession.messages.push(chatMessage);
        this.currentSession.updatedAt = Date.now();
      }
      this.notifyMessageHandlers(chatMessage);
    });

    this.wsManager.subscribe('chat_session_update', (wsMessage) => {
      const session = wsMessage.payload as ChatSession;
      this.currentSession = session;
      this.notifySessionHandlers(session);
    });

    this.wsManager.subscribe('agent_typing', (wsMessage) => {
      const payload = wsMessage.payload as { isTyping: boolean };
      this.handleAgentTyping(payload.isTyping);
    });
  }

  async startChat(userInfo: {
    name: string;
    email?: string;
  }): Promise<ChatSession> {
    if (this.currentSession?.status === 'active') {
      return this.currentSession;
    }

    const session: ChatSession = {
      id: this.generateSessionId(),
      userId: userInfo.email || 'anonymous',
      status: 'waiting',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      metadata: {
        userAgent: navigator.userAgent,
        currentPage: window.location.href,
        referrer: document.referrer,
        customerInfo: userInfo,
      },
    };

    this.currentSession = session;
    this.wsManager.send('start_chat_session', session);

    return session;
  }

  sendMessage(message: string, attachments?: ChatMessage['attachments']): void {
    if (!this.currentSession) {
      throw new Error('No active chat session');
    }

    const chatMessage: ChatMessage = {
      id: this.generateMessageId(),
      userId: this.currentSession.userId,
      userName:
        (this.currentSession.metadata?.customerInfo as { name?: string })
          ?.name || 'User',
      message,
      timestamp: Date.now(),
      type: 'user',
      attachments,
    };

    this.wsManager.send('chat_message', {
      sessionId: this.currentSession.id,
      message: chatMessage,
    });
  }

  sendTypingIndicator(): void {
    if (!this.currentSession) return;

    this.wsManager.send('user_typing', {
      sessionId: this.currentSession.id,
      isTyping: true,
    });

    // Clear existing timeout
    if (this.typingIndicator) {
      clearTimeout(this.typingIndicator);
    }

    // Stop typing indicator after 3 seconds
    this.typingIndicator = setTimeout(() => {
      this.wsManager.send('user_typing', {
        sessionId: this.currentSession!.id,
        isTyping: false,
      });
    }, 3000);
  }

  endChat(): void {
    if (this.currentSession) {
      this.wsManager.send('end_chat_session', {
        sessionId: this.currentSession.id,
      });
      this.currentSession.status = 'closed';
    }
  }

  onMessage(handler: (message: ChatMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onSessionUpdate(handler: (session: ChatSession) => void): () => void {
    this.sessionHandlers.push(handler);
    return () => {
      const index = this.sessionHandlers.indexOf(handler);
      if (index > -1) {
        this.sessionHandlers.splice(index, 1);
      }
    };
  }

  getCurrentSession(): ChatSession | null {
    return this.currentSession;
  }

  private notifyMessageHandlers(message: ChatMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifySessionHandlers(session: ChatSession): void {
    this.sessionHandlers.forEach((handler) => {
      try {
        handler(session);
      } catch (error) {
        console.error('Error in session handler:', error);
      }
    });
  }

  private handleAgentTyping(isTyping: boolean): void {
    // This would update UI to show typing indicator
    const event = new CustomEvent('agent-typing', { detail: { isTyping } });
    window.dispatchEvent(event);
  }

  private generateSessionId(): string {
    return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Real-time Notifications
export interface Notification {
  id: string;
  type:
    | 'stock_update'
    | 'price_change'
    | 'promotion'
    | 'order_update'
    | 'system'
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'analytics';
  title: string;
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  productId?: string;
  actionUrl?: string;
  imageUrl?: string;
  expiresAt?: number;
  autoClose?: boolean;
  read?: boolean;
  metadata?: Record<string, unknown>;
}

class NotificationManager {
  private wsManager: WebSocketManager;
  private notifications: Notification[] = [];
  private notificationHandlers: ((notification: Notification) => void)[] = [];
  private maxNotifications: number = 50;

  constructor(wsManager: WebSocketManager) {
    this.wsManager = wsManager;
    this.setupNotificationHandlers();
  }

  private setupNotificationHandlers(): void {
    this.wsManager.subscribe('notification', (wsMessage) => {
      const notification = wsMessage.payload as Notification;
      this.addNotification(notification);
    });

    this.wsManager.subscribe('bulk_notifications', (wsMessage) => {
      const notifications = wsMessage.payload as Notification[];
      notifications.forEach((notification) =>
        this.addNotification(notification),
      );
    });
  }

  subscribeToProduct(productId: string): void {
    this.wsManager.send('subscribe_product_updates', { productId });
  }

  unsubscribeFromProduct(productId: string): void {
    this.wsManager.send('unsubscribe_product_updates', { productId });
  }

  subscribeToCategory(categoryId: string): void {
    this.wsManager.send('subscribe_category_updates', { categoryId });
  }

  subscribeToUser(userId: string): void {
    this.wsManager.send('subscribe_user_updates', { userId });
  }

  markAsRead(notificationId: string): void {
    this.wsManager.send('mark_notification_read', { notificationId });

    const notification = this.notifications.find(
      (n) => n.id === notificationId,
    );
    if (notification) {
      notification.metadata = { ...notification.metadata, read: true };
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.metadata = { ...notification.metadata, read: true };
    });

    this.wsManager.send('mark_all_notifications_read', {});
  }

  dismissNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId,
    );
  }

  getNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) => b.timestamp - a.timestamp);
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.metadata?.read).length;
  }

  showNotification(notification: Notification): void {
    this.addNotification(notification);
  }

  subscribe(): void {
    // Enable real-time notifications
    this.wsManager.send('subscribe_notifications', {});
  }

  unsubscribe(): void {
    // Disable real-time notifications
    this.wsManager.send('unsubscribe_notifications', {});
  }

  onNotification(handler: (notification: Notification) => void): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  private addNotification(notification: Notification): void {
    // Check if notification already exists
    if (this.notifications.some((n) => n.id === notification.id)) {
      return;
    }

    // Add to beginning of array
    this.notifications.unshift(notification);

    // Trim to max notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Notify handlers
    this.notificationHandlers.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });

    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
  }

  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.imageUrl || '/favicon.ico',
        tag: notification.id,
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }
}

// Export singleton instances
export const wsManager = new WebSocketManager();
export const liveChatManager = new LiveChatManager(wsManager);
export const notificationManager = new NotificationManager(wsManager);
