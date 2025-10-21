'use client';

import React, { useState } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status === 'loading') {
      return;
    }

    setStatus('loading');
    setErrors({});
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Field-specific validation errors
          setErrors(data.errors);
          setStatus('error');
        } else {
          // General error
          setErrorMessage(
            data.error || 'Failed to send message. Please try again.',
          );
          setStatus('error');
        }
        return;
      }

      setStatus('success');
      setSuccessMessage(
        data.message ||
          'Thank you for contacting us! We will respond within 24 hours.',
      );
      // Clear form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Contact form submission failed', error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[hsl(var(--border))] p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-[hsl(var(--ink))] mb-4">
        Send Us a Message
      </h2>
      <p className="text-[hsl(var(--muted-foreground))] mb-6">
        Fill out the form below and we&apos;ll get back to you within 24 hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-semibold text-[hsl(var(--ink))] mb-2"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
            className={`w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } bg-white px-4 py-2 text-[hsl(var(--ink))] transition focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20 disabled:opacity-50`}
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-[hsl(var(--ink))] mb-2"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
            className={`w-full rounded-md border ${
              errors.email ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } bg-white px-4 py-2 text-[hsl(var(--ink))] transition focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20 disabled:opacity-50`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Subject Field */}
        <div>
          <label
            htmlFor="contact-subject"
            className="block text-sm font-semibold text-[hsl(var(--ink))] mb-2"
          >
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            id="contact-subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
            className={`w-full rounded-md border ${
              errors.subject ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } bg-white px-4 py-2 text-[hsl(var(--ink))] transition focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20 disabled:opacity-50`}
          >
            <option value="">Select a subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Product Support">Product Support</option>
            <option value="Sales Question">Sales Question</option>
            <option value="Order Status">Order Status</option>
            <option value="Return/Exchange">Return/Exchange</option>
            <option value="Warranty Claim">Warranty Claim</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Other">Other</option>
          </select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="contact-message"
            className="block text-sm font-semibold text-[hsl(var(--ink))] mb-2"
          >
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            disabled={status === 'loading'}
            className={`w-full rounded-md border ${
              errors.message ? 'border-red-500' : 'border-[hsl(var(--border))]'
            } bg-white px-4 py-2 text-[hsl(var(--ink))] transition focus:border-[hsl(var(--brand))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))]/20 disabled:opacity-50 resize-y`}
            placeholder="Tell us how we can help..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">{errors.message}</p>
          )}
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Minimum 10 characters
          </p>
        </div>

        {/* Success Message */}
        {status === 'success' && successMessage && (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-md bg-[hsl(var(--brand))] px-6 py-3 text-base font-semibold text-white transition hover:bg-[hsl(var(--brand-dark))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand))] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
}
