// components/sections/HeroSection.js
import React from "react";
import { ArrowRight, Plane } from "lucide-react";

const HeroSection = ({ onGetStarted }) => {
  return (
    <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-indigo-600 opacity-20"></div>
        {/* Stylizowane elementy graficzne */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-blue-400 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="z-10 text-center px-4 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">
          SunFlight
        </h1>
        <p className="text-xl md:text-2xl font-light mb-8 text-gray-700">
          Znajdź najlepsze miejsce w samolocie do obserwacji wschodu lub zachodu
          słońca
        </p>

        <button
          onClick={onGetStarted}
          className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700 transition-colors group"
        >
          Rozpocznij
          <ArrowRight
            className="ml-2 group-hover:translate-x-1 transition-transform"
            size={20}
          />
        </button>
      </div>

      {/* Dekoracyjny samolot */}
      <div className="absolute bottom-20 right-10 md:right-20 opacity-10">
        <Plane size={120} className="transform -rotate-45" />
      </div>
    </section>
  );
};

export default HeroSection;
