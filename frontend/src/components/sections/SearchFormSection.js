// components/sections/SearchFormSection.jsx
import React, { useState, useEffect } from "react";
import {
  Plane,
  Calendar,
  Clock,
  ArrowRight,
  Sunrise,
  Sunset,
  Search,
} from "lucide-react";
import { useAirportSearch } from "../hooks/useAirportSearch";

const SearchFormSection = ({ onSubmit, searching, isChangingStep }) => {
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFlightDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle airport search text changes
  const handleDepartureSearch = (text) => {
    setDepartureAirportText(text);
    departureHook.handleSearch(text);
  };

  const handleArrivalSearch = (text) => {
    setArrivalAirportText(text);
    arrivalHook.handleSearch(text);
  };

  // Handle airport selection
  const selectDepartureAirport = (airport) => {
    setDepartureAirportText(`${airport.code} - ${airport.name}`);
    setFlightDetails((prev) => ({
      ...prev,
      departureAirport: airport.code,
    }));
    departureHook.hideResults();

    if (formErrors.departureAirport) {
      setFormErrors((prev) => ({
        ...prev,
        departureAirport: "",
      }));
    }
  };

  const selectArrivalAirport = (airport) => {
    setArrivalAirportText(`${airport.code} - ${airport.name}`);
    setFlightDetails((prev) => ({
      ...prev,
      arrivalAirport: airport.code,
    }));
    arrivalHook.hideResults();

    if (formErrors.arrivalAirport) {
      setFormErrors((prev) => ({
        ...prev,
        arrivalAirport: "",
      }));
    }
  };

  // Handle sun preference change
  const handleSunPreferenceChange = (preference) => {
    setFlightDetails((prev) => ({
      ...prev,
      sunPreference: preference,
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!flightDetails.departureAirport) {
      errors.departureAirport = "Please select departure airport";
    }
    if (!flightDetails.arrivalAirport) {
      errors.arrivalAirport = "Please select arrival airport";
    }
    if (!flightDetails.departureDate) {
      errors.departureDate = "Please select departure date";
    }
    if (!flightDetails.departureTime) {
      errors.departureTime = "Please select departure time";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit(flightDetails);
  };

  return (
    <section className="py-16 px-4 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-xl">
        <h1 className="text-xl font-light mb-8 text-center">
          Find your perfect seat
          <br />
          <span className="text-base text-gray-500">
            Search for your flight
          </span>
        </h1>

        <div className="rounded-xl overflow-hidden shadow bg-white border border-gray-50 transition-shadow hover:shadow-md">
          <div className="py-8 px-8 space-y-7">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-3 transform transition-transform hover:scale-105 duration-300">
                <Plane className="text-amber-500 w-5 h-5" />
              </div>
              <h2 className="text-lg font-light">Flight Details</h2>
            </div>

            {/* Departure Airport */}
            <div className="transition-all duration-300 hover:translate-x-1">
              <label className="text-xs text-gray-500 mb-2 block">
                Departure
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={departureAirportText}
                  onChange={(e) => handleDepartureSearch(e.target.value)}
                  placeholder="e.g. London (LHR)"
                  className={`w-full px-4 py-3 border ${
                    formErrors.departureAirport
                      ? "border-red-300"
                      : "border-gray-100"
                  } rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-lg`}
                />
                <Search
                  size={18}
                  className="absolute right-3 top-3.5 text-gray-400"
                />
                {formErrors.departureAirport && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.departureAirport}
                  </p>
                )}
              </div>

              {/* Search Results for Departure */}
              {departureHook.showResults &&
                departureHook.searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {departureHook.searchResults.map((airport) => (
                        <li
                          key={airport.code}
                          className="px-4 py-2 hover:bg-amber-50 cursor-pointer"
                          onClick={() => selectDepartureAirport(airport)}
                        >
                          <div className="font-medium">
                            {airport.code} - {airport.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {airport.city}, {airport.country}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Arrival Airport */}
            <div className="transition-all duration-300 hover:translate-x-1">
              <label className="text-xs text-gray-500 mb-2 block">
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={arrivalAirportText}
                  onChange={(e) => handleArrivalSearch(e.target.value)}
                  placeholder="e.g. Tokyo (HND)"
                  className={`w-full px-4 py-3 border ${
                    formErrors.arrivalAirport
                      ? "border-red-300"
                      : "border-gray-100"
                  } rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-lg`}
                />
                <Search
                  size={18}
                  className="absolute right-3 top-3.5 text-gray-400"
                />
                {formErrors.arrivalAirport && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.arrivalAirport}
                  </p>
                )}
              </div>

              {/* Search Results for Arrival */}
              {arrivalHook.showResults &&
                arrivalHook.searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {arrivalHook.searchResults.map((airport) => (
                        <li
                          key={airport.code}
                          className="px-4 py-2 hover:bg-amber-50 cursor-pointer"
                          onClick={() => selectArrivalAirport(airport)}
                        >
                          <div className="font-medium">
                            {airport.code} - {airport.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {airport.city}, {airport.country}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-6">
              <div className="transition-all duration-300 hover:translate-x-1">
                <label className="text-xs text-gray-500 mb-2 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={flightDetails.departureDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    formErrors.departureDate
                      ? "border-red-300"
                      : "border-gray-100"
                  } rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                />
                {formErrors.departureDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.departureDate}
                  </p>
                )}
              </div>

              <div className="transition-all duration-300 hover:translate-x-1">
                <label className="text-xs text-gray-500 mb-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={flightDetails.departureTime}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    formErrors.departureTime
                      ? "border-red-300"
                      : "border-gray-100"
                  } rounded-lg focus:border-amber-500 focus:outline-none transition-colors`}
                />
                {formErrors.departureTime && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.departureTime}
                  </p>
                )}
              </div>
            </div>

            {/* Sun Preference */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">
                Preference
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    flightDetails.sunPreference === "sunrise"
                      ? "bg-amber-500 text-white"
                      : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                  onClick={() => handleSunPreferenceChange("sunrise")}
                >
                  <Sunrise size={18} className="mr-2" />
                  Sunrise
                </button>

                <button
                  type="button"
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    flightDetails.sunPreference === "sunset"
                      ? "bg-orange-500 text-white"
                      : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                  onClick={() => handleSunPreferenceChange("sunset")}
                >
                  <Sunset size={18} className="mr-2" />
                  Sunset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6">
            <p className="text-center text-sm text-gray-500 mb-5">
              We'll automatically find the best seats for your flight
            </p>
            <button
              onClick={handleSubmit}
              disabled={searching}
              className="w-full py-3.5 bg-amber-500 text-white rounded-full font-light flex items-center justify-center disabled:bg-gray-300 transition-all duration-300 hover:bg-amber-600 hover:shadow-md"
            >
              {searching ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Searching...
                </div>
              ) : (
                <>
                  <span>Find Perfect Seat</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFormSection;
