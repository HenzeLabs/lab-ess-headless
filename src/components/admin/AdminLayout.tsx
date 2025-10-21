'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  ShoppingCart,
  Settings,
  TrendingUp,
  Bell,
  Search,
  Menu,
  Home,
  Package,
  Activity,
  FileText,
  Shield,
  Brain,
  MessageSquare,
  Zap,
  Eye,
  Target,
  Filter,
  Download,
  Calendar,
  Globe,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  submenu?: NavItem[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentPage = 'dashboard',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/admin',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      submenu: [
        {
          id: 'performance',
          label: 'Performance',
          icon: Activity,
          href: '/admin/analytics/performance',
        },
        {
          id: 'realtime',
          label: 'Real-time',
          icon: Zap,
          href: '/admin/analytics/realtime',
        },
        {
          id: 'conversions',
          label: 'Conversions',
          icon: Target,
          href: '/admin/analytics/conversions',
        },
        {
          id: 'behavior',
          label: 'User Behavior',
          icon: Eye,
          href: '/admin/analytics/behavior',
        },
      ],
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      href: '/admin/products',
      badge: 12,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      badge: 5,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      href: '/admin/customers',
    },
    {
      id: 'testing',
      label: 'A/B Testing',
      icon: FileText,
      href: '/admin/testing',
      submenu: [
        {
          id: 'experiments',
          label: 'Experiments',
          icon: Target,
          href: '/admin/testing/experiments',
        },
        {
          id: 'results',
          label: 'Results',
          icon: BarChart3,
          href: '/admin/testing/results',
        },
        {
          id: 'audiences',
          label: 'Audiences',
          icon: Filter,
          href: '/admin/testing/audiences',
        },
      ],
    },
    {
      id: 'ai',
      label: 'AI & ML',
      icon: Brain,
      href: '/admin/ai',
      submenu: [
        {
          id: 'recommendations',
          label: 'Recommendations',
          icon: TrendingUp,
          href: '/admin/ai/recommendations',
        },
        {
          id: 'search',
          label: 'Smart Search',
          icon: Search,
          href: '/admin/ai/search',
        },
        {
          id: 'personalization',
          label: 'Personalization',
          icon: Users,
          href: '/admin/ai/personalization',
        },
      ],
    },
    {
      id: 'realtime',
      label: 'Real-time',
      icon: MessageSquare,
      href: '/admin/realtime',
      submenu: [
        {
          id: 'chat',
          label: 'Live Chat',
          icon: MessageSquare,
          href: '/admin/realtime/chat',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          href: '/admin/realtime/notifications',
        },
        {
          id: 'websockets',
          label: 'WebSocket Monitor',
          icon: Activity,
          href: '/admin/realtime/websockets',
        },
      ],
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      href: '/admin/security',
      submenu: [
        {
          id: 'audit',
          label: 'Audit Logs',
          icon: FileText,
          href: '/admin/security/audit',
        },
        {
          id: 'compliance',
          label: 'GDPR Compliance',
          icon: Shield,
          href: '/admin/security/compliance',
        },
        {
          id: 'headers',
          label: 'Security Headers',
          icon: Globe,
          href: '/admin/security/headers',
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
    },
  ];

  const [expandedMenus, setExpandedMenus] = useState<string[]>(['analytics']);

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  const handleNavClick = (item: NavItem) => {
    if (item.submenu && item.submenu.length > 0) {
      toggleSubmenu(item.id);
    } else {
      router.push(item.href);
    }
  };
  const sidebarVariants = {
    open: { width: '280px' },
    closed: { width: '80px' },
  };

  const NavItemComponent: React.FC<{ item: NavItem; level?: number }> = ({
    item,
    level = 0,
  }) => {
    const isActive = pathname === item.href;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus.includes(item.id);

    return (
      <div>
        <motion.div
          whileHover={{ x: level === 0 ? 4 : 2 }}
          transition={{ duration: 0.2 }}
          className={`relative flex items-center justify-between px-4 py-3 rounded-lg mx-2 mb-1 cursor-pointer transition-all duration-200 ${
            isActive
              ? 'bg-[hsl(var(--brand-dark))] text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          } ${level > 0 ? 'ml-6 py-2' : ''}`}
          onClick={() => handleNavClick(item)}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          <div className="flex items-center space-x-3 flex-1">
            <item.icon
              className={`w-5 h-5 ${
                !sidebarOpen && level === 0 ? 'mx-auto' : ''
              }`}
            />
            <AnimatePresence>
              {(sidebarOpen || level > 0) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {(sidebarOpen || level > 0) && (
            <div className="flex items-center space-x-2">
              {item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full"
                >
                  {item.badge}
                </motion.span>
              )}
              {hasSubmenu && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {hasSubmenu && isExpanded && (sidebarOpen || level > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {item.submenu!.map((subItem) => (
                <NavItemComponent
                  key={subItem.id}
                  item={subItem}
                  level={level + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        className="fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 z-40 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-[hsl(var(--brand-dark))] rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-xs text-gray-500">Lab Essentials</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border-b border-gray-200"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-[hsl(var(--brand))] text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navigationItems.map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <AnimatePresence>
              {sidebarOpen ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-[hsl(var(--brand))]/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-[hsl(var(--brand-dark))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      Admin User
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      admin@labessentials.com
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <div className="w-10 h-10 bg-[hsl(var(--brand))]/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-[hsl(var(--brand-dark))]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '280px' : '80px' }}
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {currentPage.replace('-', ' ')}
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Calendar className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
              </div>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[hsl(var(--brand))]/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-[hsl(var(--brand-dark))]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
