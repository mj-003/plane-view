// SunFlight.jsx - Main component
import React, { useState, useEffect, useRef } from "react";
import { Sun, Plane, ArrowRight, ChevronRight } from "lucide-react";
import { fetchSeatRecommendation } from "./components/services/api";
import HeroSection from "./components/sections/HeroSection";
import SearchFormSection from "./components/sections/SearchFormSection";
import ResultsSection from "./components/sections/ResultsSection";
import Footer from "./components/layout/Footer";

const SunFlight = () => {
  // State management
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [isChangingStep, setIsChangingStep] = useState(false);
  const [error, setError] = useState(null);
  const [animation, setAnimation] = useState(false);

  // Refs for scrolling
  const formSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);

  // Initialize animation on first load
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setAnimation(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Animation between steps
  const changeStep = (newStep) => {
    setIsChangingStep(true);
    setTimeout(() => {
      setStep(newStep);
      setIsChangingStep(false);
    }, 400);
  };

  // Scroll functions
  const scrollToForm = () => {
    changeStep(1);
    setTimeout(() => {
      if (formSectionRef.current) {
        formSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const scrollToResults = () => {
    if (resultsSectionRef.current) {
      resultsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    if (!formData.departureAirport || !formData.arrivalAirport) return;

    changeStep(2); // Show loading screen
    setSearching(true);
    setError(null);

    try {
      const response = await fetchSeatRecommendation(formData);
      setResults(response);
      changeStep(3); // Show results
      scrollToResults();
    } catch (err) {
      console.error("Error fetching recommendation:", err);
      setError(err.message || "An error occurred. Please try again.");
      changeStep(1); // Back to form
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* NAVBAR */}
      <nav className="py-4 px-6 bg-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <Sun className="text-amber-500 w-6 h-6" />
          <span className="ml-2 text-xl font-light tracking-tight">
            Sun<span className="font-semibold">Flight</span>
          </span>
        </div>
        <div className="text-xs text-gray-400">v1.0</div>
      </nav>

      <div className="flex-grow">
        {/* STEP 0: WELCOME SCREEN */}
        {step === 0 && (
          <div
            className={`transition-all duration-500 ease-in-out ${
              isChangingStep ? "opacity-0" : "opacity-100"
            }`}
          >
            <HeroSection
              animation={animation}
              onGetStarted={scrollToForm}
              isChangingStep={isChangingStep}
            />
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 1 && (
          <div
            ref={formSectionRef}
            className={`transition-all duration-500 ease-in-out ${
              isChangingStep
                ? "opacity-0 translate-y-8"
                : "opacity-100 translate-y-0"
            }`}
          >
            <SearchFormSection
              onSubmit={handleSubmit}
              searching={searching}
              isChangingStep={isChangingStep}
            />
          </div>
        )}

        {/* STEP 2: LOADING */}
        {step === 2 && (
          <div
            className={`flex items-center justify-center min-h-screen transition-all duration-500 ease-in-out ${
              isChangingStep ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="w-full max-w-xl px-4">
              <div className="rounded-xl overflow-hidden shadow bg-white border border-gray-50 py-20 px-8">
                <div className="text-center">
                  <div className="relative mx-auto w-20 h-20 mb-10">
                    <div className="absolute w-full h-full rounded-full border-4 border-gray-100"></div>
                    <div className="absolute w-full h-full rounded-full border-t-4 border-amber-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Plane className="w-10 h-10 text-gray-300 rotate-45 animate-pulse" />
                    </div>
                    <div className="absolute -right-3 -top-3 w-8 h-8">
                      <div className="absolute w-8 h-8 rounded-full bg-amber-50 animate-ping opacity-75"></div>
                      <Sun className="absolute inset-0 w-8 h-8 text-amber-500 z-10" />
                    </div>
                  </div>

                  <h3 className="text-lg font-light mb-3">
                    Analyzing flight path
                  </h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    Calculating sun position along the route and finding the
                    best seat for your view
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: RESULTS */}
        {step === 3 && results && (
          <div
            ref={resultsSectionRef}
            className={`transition-all duration-500 ease-in-out ${
              isChangingStep ? "opacity-0" : "opacity-100"
            }`}
          >
            <ResultsSection
              flightData={results}
              onSearchAgain={() => changeStep(1)}
              isChangingStep={isChangingStep}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SunFlight;
