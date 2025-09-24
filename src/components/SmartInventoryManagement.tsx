'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  Bell,
  Zap,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface InventoryData {
  productId: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  leadTime: number;
  demandTrend: 'increasing' | 'stable' | 'decreasing';
  nextShipment?: {
    quantity: number;
    expectedDate: string;
  };
  preOrderEnabled: boolean;
  preOrderCount: number;
}

interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'high_demand' | 'restock_available';
  message: string;
  severity: 'critical' | 'warning' | 'info';
  action?: string;
}

interface SmartInventoryProps {
  productId: string;
  productTitle: string;
  currentPrice: number;
}

const generateInventoryData = (productId: string): InventoryData => {
  // In production, this would fetch from Shopify Admin API
  // For now, use conservative realistic estimates
  const defaultStock = 25; // Conservative stock level
  const reserved = 2; // Small reservation

  return {
    productId,
    currentStock: defaultStock,
    reservedStock: reserved,
    availableStock: defaultStock - reserved,
    reorderPoint: 15,
    leadTime: 7, // Standard 1 week lead time
    demandTrend: 'stable' as const,
    nextShipment: {
      quantity: 50,
      expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
    preOrderEnabled: true,
    preOrderCount: 0,
  };
};

const generateStockAlerts = (inventory: InventoryData): StockAlert[] => {
  const alerts: StockAlert[] = [];

  if (inventory.availableStock === 0) {
    alerts.push({
      id: 'out-of-stock',
      type: 'out_of_stock',
      message: 'Currently out of stock',
      severity: 'critical',
      action: inventory.preOrderEnabled
        ? 'Enable pre-order'
        : 'Notify when available',
    });
  } else if (inventory.availableStock <= inventory.reorderPoint) {
    alerts.push({
      id: 'low-stock',
      type: 'low_stock',
      message: `Only ${inventory.availableStock} units remaining`,
      severity: 'warning',
      action: 'Order soon',
    });
  }

  if (inventory.demandTrend === 'increasing') {
    alerts.push({
      id: 'high-demand',
      type: 'high_demand',
      message: 'High demand - stock moving quickly',
      severity: 'warning',
      action: 'Order now to avoid delays',
    });
  }

  if (inventory.nextShipment) {
    const daysUntilShipment = Math.ceil(
      (new Date(inventory.nextShipment.expectedDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysUntilShipment <= 7) {
      alerts.push({
        id: 'restock-soon',
        type: 'restock_available',
        message: `${inventory.nextShipment.quantity} units arriving in ${daysUntilShipment} days`,
        severity: 'info',
      });
    }
  }

  return alerts;
};

export default function SmartInventoryManagement({
  productId,
  productTitle,
  currentPrice,
}: SmartInventoryProps) {
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [notifyWhenAvailable, setNotifyWhenAvailable] = useState(false);
  const [preOrderQuantity, setPreOrderQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInventoryData = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const inventoryData = generateInventoryData(productId);
      setInventory(inventoryData);
      setAlerts(generateStockAlerts(inventoryData));
      setIsLoading(false);
    };

    loadInventoryData();
  }, [productId]);

  const getStockStatus = () => {
    if (!inventory) return { status: 'loading', color: 'text-gray-500' };

    if (inventory.availableStock === 0) {
      return { status: 'Out of Stock', color: 'text-red-600' };
    } else if (inventory.availableStock <= inventory.reorderPoint) {
      return { status: 'Low Stock', color: 'text-orange-600' };
    } else if (inventory.availableStock > 30) {
      return { status: 'In Stock', color: 'text-green-600' };
    } else {
      return { status: 'Limited Stock', color: 'text-yellow-600' };
    }
  };

  const getStockIcon = () => {
    const { status } = getStockStatus();
    switch (status) {
      case 'Out of Stock':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Low Stock':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'Limited Stock':
        return <Package className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getDemandIcon = () => {
    if (!inventory) return null;
    switch (inventory.demandTrend) {
      case 'increasing':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'stable':
        return <Package className="h-3 w-3 text-blue-500" />;
      case 'decreasing':
        return <Package className="h-3 w-3 text-gray-500" />;
    }
  };

  const handleNotifySignup = () => {
    setNotifyWhenAvailable(true);
    // Track notification signup
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (
        window as {
          gtag: (event: string, action: string, params: object) => void;
        }
      ).gtag;
      gtag('event', 'stock_notification_signup', {
        event_category: 'inventory',
        event_label: productTitle,
        product_id: productId,
      });
    }
  };

  const handlePreOrder = () => {
    // Track pre-order attempt
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (
        window as {
          gtag: (event: string, action: string, params: object) => void;
        }
      ).gtag;
      gtag('event', 'pre_order_attempt', {
        event_category: 'inventory',
        event_label: productTitle,
        product_id: productId,
        quantity: preOrderQuantity,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 border-t border-border/50 pt-6">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-16 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-4 border-t border-border/50 pt-6">
      {/* Stock Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStockIcon()}
          <span className={`font-medium ${stockStatus.color}`}>
            {stockStatus.status}
          </span>
        </div>
        {inventory && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getDemandIcon()}
            <span className="capitalize">
              {inventory.demandTrend.replace('_', ' ')} demand
            </span>
          </div>
        )}
      </div>

      {/* Stock Information */}
      {inventory && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-lg font-semibold text-foreground">
              {inventory.availableStock} units
            </div>
          </div>
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Lead Time</div>
            <div className="text-lg font-semibold text-foreground">
              {inventory.leadTime} days
            </div>
          </div>
        </div>
      )}

      {/* Stock Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-2 p-3 rounded-lg border ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  : alert.severity === 'warning'
                  ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
              }`}
            >
              {alert.severity === 'critical' && (
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              {alert.severity === 'warning' && (
                <Bell className="h-4 w-4 text-orange-600 mt-0.5" />
              )}
              {alert.severity === 'info' && (
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
              )}

              <div className="flex-1">
                <div
                  className={`text-sm font-medium ${
                    alert.severity === 'critical'
                      ? 'text-red-800 dark:text-red-200'
                      : alert.severity === 'warning'
                      ? 'text-orange-800 dark:text-orange-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}
                >
                  {alert.message}
                </div>
                {alert.action && (
                  <div
                    className={`text-xs mt-1 ${
                      alert.severity === 'critical'
                        ? 'text-red-700 dark:text-red-300'
                        : alert.severity === 'warning'
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {alert.action}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Out of Stock Actions */}
      {inventory && inventory.availableStock === 0 && (
        <div className="space-y-3">
          {inventory.preOrderEnabled ? (
            <div className="border border-border/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">
                Pre-Order Available
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Secure your order now. You&apos;ll be charged when the item
                ships.
              </p>
              <div className="flex items-center gap-2 mb-3">
                <label
                  htmlFor="preorder-quantity"
                  className="text-sm text-foreground"
                >
                  Quantity:
                </label>
                <select
                  id="preorder-quantity"
                  value={preOrderQuantity}
                  onChange={(e) => setPreOrderQuantity(Number(e.target.value))}
                  className="px-2 py-1 border border-border/30 rounded text-sm"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handlePreOrder}
                className="w-full bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                <Zap className="h-4 w-4 inline mr-1" />
                Pre-Order ${(currentPrice * preOrderQuantity).toLocaleString()}
              </button>
              {inventory.preOrderCount > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  {inventory.preOrderCount} others have pre-ordered
                </div>
              )}
            </div>
          ) : (
            <div className="border border-border/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Get Notified</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Be the first to know when this item is back in stock.
              </p>
              {!notifyWhenAvailable ? (
                <button
                  onClick={handleNotifySignup}
                  className="w-full bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  <Bell className="h-4 w-4 inline mr-1" />
                  Notify Me When Available
                </button>
              ) : (
                <div className="text-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  You&apos;ll be notified when available!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Next Shipment Info */}
      {inventory && inventory.nextShipment && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Next Shipment
            </span>
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            {inventory.nextShipment.quantity} units arriving{' '}
            {inventory.nextShipment.expectedDate}
          </div>
        </div>
      )}

      {/* Stock Analytics */}
      {inventory && inventory.availableStock > 0 && (
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Stock Level:</span>
            <span>
              {Math.round(
                (inventory.availableStock / (inventory.currentStock + 20)) *
                  100,
              )}
              %
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-1 mt-1">
            <div
              className={`h-1 rounded-full ${
                inventory.availableStock <= inventory.reorderPoint
                  ? 'bg-red-500'
                  : inventory.availableStock <= 30
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(
                  (inventory.availableStock / (inventory.currentStock + 20)) *
                    100,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
