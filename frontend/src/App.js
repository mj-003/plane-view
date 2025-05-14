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

  // Handle form submission with loading animation
  const handleSubmit = async (formData) => {
    if (!formData.departureAirport || !formData.arrivalAirport) return;

    changeStep(2); // Show loading screen
    setSearching(true);
    setError(null);

    try {
      // Artificial delay to show the loading animation for longer (min 2 seconds)
      const startTime = Date.now();
      const response = await fetchSeatRecommendation(formData);

      // Ensure loading is shown for at least 2 seconds
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 2000) {
        await new Promise((resolve) => setTimeout(resolve, 2000 - elapsedTime));
      }

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
              <div className="text-center py-16">
                <div className="sun-loader">
                  <div className="sun-glow"></div>
                  <Sun className="sun-icon" size={48} />
                </div>

                <h3 className="text-lg font-light mb-3">
                  Analyzing flight path
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Calculating sun position along the route
                </p>
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
