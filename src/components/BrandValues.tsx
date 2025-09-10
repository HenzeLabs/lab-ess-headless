const values = [
  {
    icon: (
      // Simple star icon for experience/quality
      <svg
        className="h-12 w-12 text-koala-green"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "25+ Years in Business",
    description: "Proudly serving labs and researchers for over 25 years.",
  },
  {
    icon: (
      // Simple truck icon
      <svg
        className="h-12 w-12 text-koala-green"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M3 17h2c0 1.1.9 2 2 2s2-.9 2-2h6c0 1.1.9 2 2 2s2-.9 2-2h2v-2h-2c0-1.1-.9-2-2-2s-2 .9-2 2H9c0-1.1-.9-2-2-2s-2 .9-2 2H3v2zM1 11v4h2v-4H1zm18-4h3l2 2v2h-5V7zm-4 0V6c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v5h14V7z" />
      </svg>
    ),
    title: "Free Shipping $300+",
    description: "We offer free shipping on orders over $300+.",
  },
  {
    icon: (
      // Simple phone/support icon
      <svg
        className="h-12 w-12 text-koala-green"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
    ),
    title: "U.S. Support",
    description:
      "You'll receive reliable, U.S.-based support from our tech staff.",
  },
  {
    icon: (
      // Simple checkmark in circle
      <svg
        className="h-12 w-12 text-koala-green"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    title: "Satisfaction Guaranteed",
    description:
      "We stand by our products and aim for your complete satisfaction",
  },
];

export default function BrandValues() {
  return (
    <section className="py-10 bg-white">
      <div className="container-koala">
        {/* Why Lab Essentials Section */}
        <div className="text-center mb-6">
          <h2 className="text-section text-koala-green mb-4">
            Why Lab Essentials?
          </h2>
          <p className="text-lg text-koala-gray max-w-3xl mx-auto">
            Reliable Lab Equipment, Made Simple.
          </p>
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="text-center group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-4 transform transition-transform group-hover:scale-110">
                {value.icon}
              </div>
              <h3 className="text-lg font-semibold text-koala-gray-dark mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-koala-gray">{value.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
      </div>
    </section>
  );
}
