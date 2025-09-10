import React from "react";
import { IconQuality, IconWarranty } from "./Icons";

const signals = [
  {
    Icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
      </svg>
    ),
    title: "120-Night Trial",
    description: "No-stress returns if you don't love it.",
  },
  {
    Icon: IconWarranty,
    title: "5-Year Warranty",
    description: "We stand by our quality for the long haul.",
  },
  {
    Icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5a1.125 1.125 0 001.125-1.125V6.75a1.125 1.125 0 00-1.125-1.125H3.375A1.125 1.125 0 002.25 6.75v10.5a1.125 1.125 0 001.125 1.125z"
        />
      </svg>
    ),
    title: "Fast & Free Delivery",
    description: "Shipped straight from our warehouse to your door.",
  },
  {
    Icon: IconQuality,
    title: "Award-Winning Comfort",
    description: "Loved by customers and critics alike.",
  },
];

export default function TrustSignals() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {signals.map((signal) => (
            <div
              key={signal.title}
              className="bg-white p-6 text-center flex flex-col items-center"
            >
              <signal.Icon className="h-8 w-8 mb-3 text-blue-600" />
              <h3 className="text-base font-bold text-gray-800">
                {signal.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{signal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
