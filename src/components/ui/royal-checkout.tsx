'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { RoyalCard } from './royal-components';
import { cn } from '@/lib/cn';

interface CheckoutStep {
  id: string;
  title: string;
  status: 'pending' | 'current' | 'completed';
}

interface RoyalCheckoutProps {
  steps?: CheckoutStep[];
  onStepChange?: (step: number) => void;
  className?: string;
}

const defaultSteps: CheckoutStep[] = [
  { id: 'shipping', title: 'Shipping', status: 'current' },
  { id: 'payment', title: 'Payment', status: 'pending' },
  { id: 'review', title: 'Review', status: 'pending' },
];

export function RoyalCheckoutStepper({
  steps = defaultSteps,

  onStepChange,
  className,
}: RoyalCheckoutProps) {
  return (
    <div className={cn('w-full', className)}>
      <nav aria-label="Checkout progress">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isPending = step.status === 'pending';

            return (
              <li key={step.id} className="flex-1 relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      initial={{ width: '0%' }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}

                <button
                  onClick={() => onStepChange?.(index)}
                  className="relative flex flex-col items-center group"
                  disabled={isPending}
                >
                  {/* Step circle */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center relative z-10',
                      'transition-all duration-200',
                      isCompleted &&
                        'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
                      isCurrent &&
                        'bg-white border-4 border-purple-600 text-purple-600',
                      isPending && 'bg-gray-200 text-gray-500',
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.svg
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      ) : (
                        <motion.span
                          key="number"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="text-sm font-semibold"
                        >
                          {index + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Step label */}
                  <motion.span
                    className={cn(
                      'mt-2 text-sm font-medium transition-colors',
                      isCurrent && 'text-purple-600',
                      isCompleted && 'text-purple-600',
                      isPending && 'text-gray-500',
                    )}
                  >
                    {step.title}
                  </motion.span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

// Royal Order Summary Component
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface RoyalOrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  className?: string;
}

export function RoyalOrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
  className,
}: RoyalOrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <RoyalCard className={cn('p-6', className)} glow>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden text-purple-600 text-sm font-medium"
        >
          {isExpanded ? 'Hide' : 'Show'} details
        </motion.button>
      </div>

      <AnimatePresence>
        {(isExpanded || true) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 mb-6"
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex items-center space-x-3"
              >
                {item.image && (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
                      aria-label={item.name}
                    >
                      IMG
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${total.toFixed(2)}</span>
        </div>
      </div>
    </RoyalCard>
  );
}

// Royal Payment Methods Component
interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

interface RoyalPaymentMethodsProps {
  methods: PaymentMethod[];
  selectedMethod?: string;
  onMethodSelect?: (methodId: string) => void;
  className?: string;
}

export function RoyalPaymentMethods({
  methods,
  selectedMethod,
  onMethodSelect,
  className,
}: RoyalPaymentMethodsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Payment Method
      </h3>
      {methods.map((method) => (
        <motion.div
          key={method.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <label
            className={cn(
              'relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all',
              selectedMethod === method.id
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300',
              method.disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onMethodSelect?.(method.id)}
              disabled={method.disabled}
              className="sr-only"
            />

            <div className="flex items-center space-x-3 flex-1">
              <div className="text-gray-600">{method.icon}</div>
              <div>
                <p className="font-medium text-gray-900">{method.name}</p>
                {method.description && (
                  <p className="text-sm text-gray-500">{method.description}</p>
                )}
              </div>
            </div>

            {selectedMethod === method.id && (
              <motion.div
                layoutId="payment-selection"
                className="w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </label>
        </motion.div>
      ))}
    </div>
  );
}

// Royal Form Field Component
interface RoyalFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function RoyalFormField({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  error,
  className,
}: RoyalFormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <motion.input
        whileFocus={{ scale: 1.02 }}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={cn(
          'block w-full px-3 py-2 border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-purple-600 focus:border-transparent',
          'transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500',
        )}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
