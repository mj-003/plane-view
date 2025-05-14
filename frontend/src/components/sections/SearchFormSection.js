// components/sections/FinalSearchForm.jsx
import React, { useState, useEffect } from "react";
import { Sunrise, Sunset, Plane, Calendar, Clock } from "lucide-react";
import { useAirportSearch } from "../hooks/useAirportSearch";

const FinalSearchForm = ({ onSubmit, searching }) => {
  // State management
  const [flightDetails, setFlightDetails] = useState({
    departureAirport: "",
    arrivalAirport: "",
    departureDate: "",
    departureTime: "",
    sunPreference: "sunset",
  });
  const [departureAirportText, setDepartureAirportText] = useState("");
  const [arrivalAirportText, setArrivalAirportText] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Hooks for airport search
  const departureHook = useAirportSearch();
  const arrivalHook = useAirportSearch();

  // Initialize date and time
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formattedDate = tomorrow.toISOString().split("T")[0];
    setFlightDetails((prev) => ({
      ...prev,
      departureDate: formattedDate,
      departureTime: "10:00",
    }));
  }, []);

  // Handle airport selection
  const selectDepartureAirport = (airport) => {
    setDepartureAirportText(`${airport.code} - ${airport.city}`);
    setFlightDetails((prev) => ({ ...prev, departureAirport: airport.code }));
    departureHook.hideResults();
    setFormErrors((prev) => ({ ...prev, departureAirport: false }));
  };

  const selectArrivalAirport = (airport) => {
    setArrivalAirportText(`${airport.code} - ${airport.city}`);
    setFlightDetails((prev) => ({ ...prev, arrivalAirport: airport.code }));
    arrivalHook.hideResults();
    setFormErrors((prev) => ({ ...prev, arrivalAirport: false }));
  };

  // Form validation and submission
  const handleSubmit = () => {
    const errors = {};
    if (!flightDetails.departureAirport) errors.departureAirport = true;
    if (!flightDetails.arrivalAirport) errors.arrivalAirport = true;
    if (!flightDetails.departureDate) errors.departureDate = true;
    if (!flightDetails.departureTime) errors.departureTime = true;

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      onSubmit(flightDetails);
    }
  };

  return (
    <section className="flex flex-col min-h-screen">
      <div className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-xl font-medium mb-2 text-center flex justify-center items-center">
            <Plane className="text-amber-500 w-5 h-5 mr-2" />
            Find your perfect seat
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Search for your flight to see the best seat for sun viewing
          </p>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            {/* Airports */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-light text-gray-500 mb-1">
                  Departure
                </label>
                <input
                  type="text"
                  value={departureAirportText}
                  onChange={(e) => {
                    setDepartureAirportText(e.target.value);
                    departureHook.handleSearch(e.target.value);
                    setFormErrors((prev) => ({
                      ...prev,
                      departureAirport: false,
                    }));
                  }}
                  placeholder="e.g. WAW, Warsaw"
                  className={`w-full p-2 border-b ${
                    formErrors.departureAirport
                      ? "border-amber-300"
                      : "border-gray-100"
                  } focus:border-amber-500 focus:outline-none text-sm placeholder-gray-400`}
                />
                {departureHook.showResults &&
                  departureHook.searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 bg-white shadow-md rounded-md overflow-hidden max-h-40 w-64">
                      {departureHook.searchResults.map((airport) => (
                        <div
                          key={airport.code}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          onClick={() => selectDepartureAirport(airport)}
                        >
                          <span className="font-medium">{airport.code}</span> -{" "}
                          {airport.city}
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-light text-gray-500 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={arrivalAirportText}
                  onChange={(e) => {
                    setArrivalAirportText(e.target.value);
                    arrivalHook.handleSearch(e.target.value);
                    setFormErrors((prev) => ({
                      ...prev,
                      arrivalAirport: false,
                    }));
                  }}
                  placeholder="e.g. CDG, Paris"
                  className={`w-full p-2 border-b ${
                    formErrors.arrivalAirport
                      ? "border-amber-300"
                      : "border-gray-100"
                  } focus:border-amber-500 focus:outline-none text-sm placeholder-gray-400`}
                />
                {arrivalHook.showResults &&
                  arrivalHook.searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 bg-white shadow-md rounded-md overflow-hidden max-h-40 w-64">
                      {arrivalHook.searchResults.map((airport) => (
                        <div
                          key={airport.code}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          onClick={() => selectArrivalAirport(airport)}
                        >
                          <span className="font-medium">{airport.code}</span> -{" "}
                          {airport.city}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="flex items-center text-sm font-light text-gray-500 mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={flightDetails.departureDate}
                  onChange={(e) => {
                    setFlightDetails((prev) => ({
                      ...prev,
                      departureDate: e.target.value,
                    }));
                    setFormErrors((prev) => ({
                      ...prev,
                      departureDate: false,
                    }));
                  }}
                  className={`w-full p-2 border-b ${
                    formErrors.departureDate
                      ? "border-amber-300"
                      : "border-gray-100"
                  } focus:border-amber-500 focus:outline-none text-sm`}
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-light text-gray-500 mb-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={flightDetails.departureTime}
                  onChange={(e) => {
                    setFlightDetails((prev) => ({
                      ...prev,
                      departureTime: e.target.value,
                    }));
                    setFormErrors((prev) => ({
                      ...prev,
                      departureTime: false,
                    }));
                  }}
                  className={`w-full p-2 border-b ${
                    formErrors.departureTime
                      ? "border-amber-300"
                      : "border-gray-100"
                  } focus:border-amber-500 focus:outline-none text-sm`}
                />
              </div>
            </div>

            {/* Sun Preference - Minimal Design */}
            <div className="mb-6">
              <label className="block text-sm font-light text-gray-500 mb-2">
                Preference
              </label>
              <div className="flex gap-0">
                <button
                  type="button"
                  onClick={() =>
                    setFlightDetails((prev) => ({
                      ...prev,
                      sunPreference: "sunrise",
                    }))
                  }
                  className={`flex-1 py-2.5 px-3 rounded-l-full rounded-r-none transition-colors ${
                    flightDetails.sunPreference === "sunrise"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-white border border-gray-200 text-gray-500"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Sunrise
                      size={16}
                      className={`mr-1.5 ${
                        flightDetails.sunPreference === "sunrise"
                          ? "text-amber-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">Sunrise</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFlightDetails((prev) => ({
                      ...prev,
                      sunPreference: "sunset",
                    }))
                  }
                  className={`flex-1 py-2.5 px-3 rounded-r-full rounded-l-none transition-colors ${
                    flightDetails.sunPreference === "sunset"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-white border border-gray-200 text-gray-500"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Sunset
                      size={16}
                      className={`mr-1.5 ${
                        flightDetails.sunPreference === "sunset"
                          ? "text-orange-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm">Sunset</span>
                  </div>
                </button>
              </div>
            </div>
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={searching}
              className="w-full py-3 bg-amber-500 text-white rounded-full text-sm hover:bg-amber-600 transition-colors disabled:bg-gray-200 overflow-hidden relative"
            >
              {searching ? (
                <div className="flex items-center justify-center">
                  {/* Animacja 2: Przemieszczające się słońce i samolot */}
                  <div className="relative w-16 h-5 mr-2">
                    <div className="absolute left-0 top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 animate-ping opacity-75"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -rotate-45">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-pulse"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                  </div>
                  <span>Finding perfect seat...</span>
                </div>
              ) : (
                "Find Perfect Seat"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalSearchForm;
