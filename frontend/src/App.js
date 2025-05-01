// App.js
import React, { useState, useRef } from "react";
import HeroSection from "./components/sections/HeroSection";
import SearchFormSection from "./components/sections/SearchFormSection";
import ResultsSection from "./components/sections/ResultsSection";
import Footer from "./components/layout/Footer";
import { fetchSeatRecommendation } from "./components/services/api";

const App = () => {
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

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

  // Funkcja generująca demonstracyjną odpowiedź w trybie offline
  const generateOfflineResponse = (formData) => {
    // Dane lotnisk dla trybu offline
    const airports = {
      WAW: {
        code: "WAW",
        name: "Warsaw Chopin Airport",
        city: "Warsaw",
        country: "Poland",
        latitude: 52.1657,
        longitude: 20.9671,
        timezone: "Europe/Warsaw",
      },
      KRK: {
        code: "KRK",
        name: "John Paul II International Airport",
        city: "Krakow",
        country: "Poland",
        latitude: 50.0777,
        longitude: 19.7848,
        timezone: "Europe/Warsaw",
      },
      CDG: {
        code: "CDG",
        name: "Charles de Gaulle Airport",
        city: "Paris",
        country: "France",
        latitude: 49.0097,
        longitude: 2.5479,
        timezone: "Europe/Paris",
      },
      LHR: {
        code: "LHR",
        name: "Heathrow Airport",
        city: "London",
        country: "United Kingdom",
        latitude: 51.47,
        longitude: -0.4543,
        timezone: "Europe/London",
      },
      JFK: {
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "United States",
        latitude: 40.6413,
        longitude: -73.7781,
        timezone: "America/New_York",
      },
    };

    // Pobierz lotniska
    const departureAirport = airports[formData.departureAirport] || {
      code: formData.departureAirport,
      name: `${formData.departureAirport} Airport`,
      city: formData.departureAirport,
      country: "Unknown",
      latitude: 50,
      longitude: 20,
      timezone: "Europe/Warsaw",
    };

    const arrivalAirport = airports[formData.arrivalAirport] || {
      code: formData.arrivalAirport,
      name: `${formData.arrivalAirport} Airport`,
      city: formData.arrivalAirport,
      country: "Unknown",
      latitude: 51,
      longitude: 21,
      timezone: "Europe/Warsaw",
    };

    // Oblicz czas lotu (symulacja)
    const flightDuration = 2.5;

    // Utwórz daty
    const departureDateTime = new Date(
      `${formData.departureDate}T${formData.departureTime}:00`
    );
    const arrivalDateTime = new Date(
      departureDateTime.getTime() + flightDuration * 60 * 60 * 1000
    );

    // Oblicz czas dla optymalnej obserwacji (około połowy lotu)
    const bestTime = new Date(
      departureDateTime.getTime() + flightDuration * 0.6 * 60 * 60 * 1000
    );

    // Wygeneruj odpowiedź
    return {
      departure_airport: departureAirport,
      arrival_airport: arrivalAirport,
      departure_time: departureDateTime.toISOString(),
      arrival_time: arrivalDateTime.toISOString(),
      flight_duration: flightDuration,
      recommendation: {
        seat_code: formData.sunPreference === "sunrise" ? "A15" : "F15",
        seat_side:
          formData.sunPreference === "sunrise"
            ? "lewa strona samolotu"
            : "prawa strona samolotu",
        best_time: bestTime.toISOString(),
        sun_event: formData.sunPreference,
        quality_score: 87.5,
        flight_direction: "zachodni",
      },
      route_preview: [
        // Przykładowe punkty trasy
        {
          latitude: departureAirport.latitude,
          longitude: departureAirport.longitude,
          altitude: 0,
          time_from_departure: 0,
        },
        {
          latitude: (departureAirport.latitude + arrivalAirport.latitude) / 2,
          longitude:
            (departureAirport.longitude + arrivalAirport.longitude) / 2,
          altitude: 10000,
          time_from_departure: flightDuration / 2,
        },
        {
          latitude: arrivalAirport.latitude,
          longitude: arrivalAirport.longitude,
          altitude: 0,
          time_from_departure: flightDuration,
        },
      ],
    };
  };

  // Obsługa wysłania formularza z falllbackiem offline
  const handleSubmit = async (formData) => {
    if (!formData.departureAirport || !formData.arrivalAirport) return;

    setSearching(true);
    setError(null);

    try {
      let responseData;

      try {
        // Próba pobrania danych z API
        responseData = await fetchSeatRecommendation(formData);
      } catch (apiError) {
        console.error("Błąd API, używam danych lokalnych:", apiError);
        setOfflineMode(true);

        // Symulacja odpowiedzi w trybie offline
        responseData = generateOfflineResponse(formData);
      }

      setResults(responseData);
      scrollToResults();
    } catch (err) {
      console.error("Błąd podczas pobierania rekomendacji:", err);
      setError(
        err.message ||
          "Wystąpił błąd podczas pobierania rekomendacji. Spróbuj ponownie."
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection onGetStarted={scrollToForm} />

      {/* Sekcja formularza */}
      <section ref={formSectionRef} className="py-16 px-4">
        <SearchFormSection onSubmit={handleSubmit} searching={searching} />
      </section>

      {/* Sekcja wyników */}
      <section ref={resultsSectionRef} className="py-16 px-4">
        {error && (
          <div className="w-full max-w-3xl mx-auto px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
              {error}
            </div>
          </div>
        )}

        {offlineMode && results && (
          <div className="w-full max-w-3xl mx-auto px-6 mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center text-yellow-800">
              <p className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Wyniki zostały wygenerowane w trybie offline (demonstracyjne
                dane)
              </p>
            </div>
          </div>
        )}

        <ResultsSection flightData={results} onSearchAgain={scrollToForm} />
      </section>

      {/* Stopka */}
      <Footer />
    </div>
  );
};

export default App;
