import React from 'react';

const faqs = [
  {
    question: 'How long is the trial period?',
    answer:
      "You have 120 nights to try your Koala product at home. If you don't love it, returns are easy and free.",
  },
  {
    question: 'Is delivery really free?',
    answer:
      'Yes! We offer fast & free delivery Australia-wide on all products.',
  },
  {
    question: 'What warranty is included?',
    answer: 'All Koala products come with a 5-year warranty for peace of mind.',
  },
];

export default function FAQ() {
  return (
    <section className="py-12 bg-white border-t">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-koala-green mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b pb-4">
              <h3 className="text-lg font-semibold text-koala-dark-grey mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
