// components/sections/HeroSection.js
import React from "react";
import { ArrowRight } from "lucide-react";

const HeroSection = ({ onGetStarted }) => {
  return (
    <section className="h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">SunFlight</h1>

        <p className="text-xl text-gray-600 mb-10">
          Znajdź najlepsze miejsce w samolocie do obserwacji wschodu lub zachodu
          słońca
        </p>

        <button
          onClick={onGetStarted}
          className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Rozpocznij
          <ArrowRight className="ml-2" size={18} />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
