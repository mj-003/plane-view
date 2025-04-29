// App.js
import React, { useState, useRef } from "react";
import HeroSection from "./components/sections/HeroSection";
import SearchFormSection from "./components/sections/SearchFormSection";
import ResultsSection from "./components/sections/ResultsSection";
import Footer from "./components/layout/Footer";

const App = () => {
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Refy do sekcji dla płynnego przewijania
  const formSectionRef = useRef(null);
  const resultsSectionRef = useRef(null);

  // Funkcje przewijania
  const scrollToForm = () => {
    formSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToResults = () => {
    resultsSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Symulacja wysłania formularza
  const handleSubmit = (formData) => {
    if (!formData.departureAirport || !formData.arrivalAirport) return;

    setSearching(true);

    // Symulacja odpowiedzi z API
    setTimeout(() => {
      setResults({
        departure_airport: {
          code: formData.departureAirport,
          name: "Warsaw Chopin Airport",
          city: "Warsaw",
          country: "Poland",
          latitude: 52.1657,
          longitude: 20.9671,
          timezone: "Europe/Warsaw",
        },
        arrival_airport: {
          code: formData.arrivalAirport,
          name: "London Heathrow",
          city: "London",
          country: "United Kingdom",
          latitude: 51.47,
          longitude: -0.4543,
          timezone: "Europe/London",
        },
        departure_time: `${formData.departureDate}T${formData.departureTime}:00Z`,
        arrival_time: `${formData.departureDate}T${
          parseInt(formData.departureTime.split(":")[0]) + 2
        }:${formData.departureTime.split(":")[1]}:00Z`,
        flight_duration: 2.33,
        recommendation: {
          seat_code: "F15",
          seat_side: "prawa strona samolotu",
          best_time: `${formData.departureDate}T${
            parseInt(formData.departureTime.split(":")[0]) + 1
          }:45:00Z`,
          sun_event: formData.sunPreference,
          quality_score: 98.12,
          flight_direction: "zachodni",
        },
      });

      setSearching(false);
      scrollToResults();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <HeroSection onGetStarted={scrollToForm} />

      {/* Sekcja formularza */}
      <section ref={formSectionRef} className="py-16 px-4">
        <SearchFormSection onSubmit={handleSubmit} searching={searching} />
      </section>

      {/* Sekcja wyników */}
      <section ref={resultsSectionRef} className="py-16 px-4">
        <ResultsSection flightData={results} onSearchAgain={scrollToForm} />
      </section>

      {/* Stopka */}
      <Footer />
    </div>
  );
};

export default App;
