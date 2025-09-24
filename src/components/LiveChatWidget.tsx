'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Clock, Shield } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  agentName?: string;
}

interface ChatAgent {
  name: string;
  role: string;
  expertise: string[];
  avatar: string;
  status: 'online' | 'busy' | 'offline';
}

const chatAgents: ChatAgent[] = [
  {
    name: 'Dr. Lisa Park',
    role: 'Senior Technical Specialist',
    expertise: ['Analytical Instruments', 'Calibration', 'Method Development'],
    avatar: 'LP',
    status: 'online',
  },
  {
    name: 'Mike Rodriguez',
    role: 'Lab Equipment Expert',
    expertise: ['Centrifuges', 'Microscopy', 'Safety Equipment'],
    avatar: 'MR',
    status: 'online',
  },
  {
    name: 'Sarah Chen',
    role: 'Applications Scientist',
    expertise: ['Sample Prep', 'Quality Control', 'Troubleshooting'],
    avatar: 'SC',
    status: 'busy',
  },
];

const quickResponses = [
  'What are the specifications?',
  'Do you have installation guides?',
  "What's the warranty coverage?",
  'Can I get a demo?',
  'Technical support needed',
];

const systemMessages = [
  'Welcome to Lab Essentials Technical Support! How can we help with your equipment needs today?',
  'Our lab specialists typically respond within 2-3 minutes during business hours.',
  "For urgent technical issues, please mention 'URGENT' and we'll prioritize your request.",
];

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<ChatAgent | null>(null);
  const [chatSession, setChatSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize chat with welcome message
      const welcomeMessage: Message = {
        id: '1',
        type: 'system',
        content: systemMessages[0],
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      // Assign an available agent
      const availableAgent = chatAgents.find(
        (agent) => agent.status === 'online',
      );
      if (availableAgent) {
        setCurrentAgent(availableAgent);
        setTimeout(() => {
          const agentMessage: Message = {
            id: '2',
            type: 'agent',
            content: `Hi! I'm ${availableAgent.name}, ${
              availableAgent.role
            }. I specialize in ${availableAgent.expertise
              .slice(0, 2)
              .join(' and ')}. What equipment can I help you with today?`,
            timestamp: new Date(),
            agentName: availableAgent.name,
          };
          setMessages((prev) => [...prev, agentMessage]);
        }, 1500);
      }

      setChatSession(Date.now().toString());
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you with that! Let me pull up the technical specifications for you.",
        "That's a great question. Based on your requirements, I have a few recommendations.",
        'I can definitely assist with that. Could you tell me more about your specific lab setup?',
        'For that type of application, we typically recommend our premium series. Let me explain why.',
        "That's actually one of our most popular items. I can walk you through the features.",
      ];

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        agentName: currentAgent?.name || 'Support Agent',
      };

      setMessages((prev) => [...prev, agentResponse]);
      setIsTyping(false);
    }, 2000 + Math.random() * 2000);

    // Track chat engagement
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (
        window as {
          gtag: (event: string, action: string, params: object) => void;
        }
      ).gtag;
      gtag('event', 'chat_message_sent', {
        event_category: 'engagement',
        event_label: 'live_chat',
        session_id: chatSession,
      });
    }
  };

  const sendQuickResponse = (response: string) => {
    setCurrentMessage(response);
    setTimeout(() => sendMessage(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:shadow-xl group"
          aria-label="Open chat support"
        >
          <MessageCircle className="h-6 w-6" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            !
          </div>
        </button>

        {/* Chat preview bubble */}
        <div className="absolute bottom-16 right-0 bg-background border border-border/30 rounded-lg p-3 shadow-lg max-w-64 animate-bounce">
          <div className="text-sm font-medium text-foreground">
            Lab Equipment Questions?
          </div>
          <div className="text-xs text-muted-foreground">
            Chat with our technical specialists
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-background border border-border/30 rounded-lg shadow-xl flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-[hsl(var(--brand))] text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-semibold">
              {currentAgent?.avatar || 'LS'}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                currentAgent?.status === 'online'
                  ? 'bg-green-500'
                  : currentAgent?.status === 'busy'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
              }`}
            />
          </div>
          <div>
            <div className="font-semibold text-sm">Lab Essentials Support</div>
            <div className="text-xs opacity-90">
              {currentAgent
                ? `${currentAgent.name} • ${currentAgent.status}`
                : 'Connecting...'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-[hsl(var(--brand))] text-white'
                  : message.type === 'system'
                  ? 'bg-muted/50 text-muted-foreground border border-border/30'
                  : 'bg-muted text-foreground'
              } rounded-lg p-3`}
            >
              {message.type === 'agent' && (
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {message.agentName}
                  </span>
                </div>
              )}
              {message.type === 'user' && (
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3 w-3" />
                  <span className="text-xs font-medium">You</span>
                </div>
              )}
              <div className="text-sm">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.type === 'user'
                    ? 'text-white/70'
                    : 'text-muted-foreground'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {currentAgent?.name || 'Support'}
                </span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Responses */}
      {messages.length <= 2 && (
        <div className="p-3 border-t border-border/30">
          <div className="text-xs text-muted-foreground mb-2">
            Quick questions:
          </div>
          <div className="flex flex-wrap gap-1">
            {quickResponses.slice(0, 3).map((response, index) => (
              <button
                key={index}
                onClick={() => sendQuickResponse(response)}
                className="text-xs bg-muted hover:bg-muted/80 text-foreground rounded-full px-3 py-1 transition-colors"
              >
                {response}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about lab equipment..."
            className="flex-1 px-3 py-2 border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20 focus:border-[hsl(var(--brand))]"
          />
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim()}
            className="bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg p-2 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Secure & confidential</span>
          <Clock className="h-3 w-3 ml-2" />
          <span>Usually responds in 2-3 minutes</span>
        </div>
      </div>
    </div>
  );
}
