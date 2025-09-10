import React from "react";

export default function DeliveryCalculator() {
  return (
    <section className="py-8 bg-white border-b">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h3 className="text-xl font-bold text-koala-green mb-2">
          Check Delivery
        </h3>
        <form className="flex flex-col sm:flex-row gap-2 justify-center items-center">
          <input
            type="text"
            placeholder="Enter your postcode"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-48 focus:outline-none focus:ring-koala-green"
          />
          <button
            type="submit"
            className="bg-koala-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-koala-dark-green transition"
          >
            Check
          </button>
        </form>
        <div className="text-sm text-gray-500 mt-2">
          Fast & free delivery Australia-wide
        </div>
      </div>
    </section>
  );
}
