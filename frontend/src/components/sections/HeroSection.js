// components/sections/HeroSection.jsx
import React from "react";
import { Plane, Sun, ChevronRight } from "lucide-react";

const HeroSection = ({ animation, onGetStarted, isChangingStep }) => {
  return (
    <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div
        className={`w-full max-w-xl text-center transition-all duration-1000 ${
          animation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex justify-center mb-10">
          <div className="relative">
            <Plane className="text-black opacity-15 w-20 h-20 rotate-45 stroke-1" />
            <div className="absolute -right-2 -top-2">
              <Sun className="text-amber-500 w-10 h-10 animate-pulse" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-light mb-6">
          The best view{" "}
          <span className="text-amber-500 font-normal">from above</span>
        </h1>

        <p className="text-gray-500 max-w-md mx-auto mb-14">
          Choose the perfect seat on your flight to enjoy spectacular views of
          sunrise or sunset
        </p>

        <button
          onClick={onGetStarted}
          className="px-10 py-3.5 bg-amber-500 text-white rounded-full font-light inline-flex items-center transition-all hover:bg-amber-600 hover:scale-105 transform duration-300"
        >
          <span>Get Started</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
