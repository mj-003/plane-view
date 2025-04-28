// components/sections/SearchFormSection.js
import React, { useRef } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";
import AirportSearch from "../ui/AirportSearch";
import SunPreferenceSelector from "../ui/SunPreferenceSelector";
import { useFlightForm } from "../../context/FlightFormContext";
import { useAirportSearch } from "../../hooks/useAirportSearch";

const SearchFormSection = ({ onResultsAvailable }) => {
  const {
    departureAirport,
    setDepartureAirport,
    arrivalAirport,
    setArrivalAirport,
    departureDate,
    setDepartureDate,
    departureTime,
    setDepartureTime,
    sunPreference,
    setSunPreference,
    searching,
    formErrors,
    handleSubmit,
    results,
  } = useFlightForm();

  const departureSearchHook = useAirportSearch();
  const arrivalSearchHook = useAirportSearch();

  // Efekt dla przewijania do wyników
  React.useEffect(() => {
    if (results && !searching && onResultsAvailable) {
      onResultsAvailable();
    }
  }, [results, searching, onResultsAvailable]);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl max-w-2xl w-full mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-indigo-800">
        Zaplanuj swój widok
      </h2>

      <div className="space-y-6">
        {/* Lotniska */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AirportSearch
            value={departureAirport}
            onChange={(value) => {
              setDepartureAirport(value);
              departureSearchHook.handleSearch(value);
            }}
            onSelect={(airport) => {
              setDepartureAirport(airport.code);
              departureSearchHook.hideResults();
            }}
            placeholder="Kod lub miasto"
            label="Lotnisko wylotu"
            icon={<MapPin size={16} className="mr-1 text-indigo-600" />}
            error={formErrors.departureAirport}
            searchResults={departureSearchHook.searchResults}
            showResults={departureSearchHook.showResults}
          />

          <AirportSearch
            value={arrivalAirport}
            onChange={(value) => {
              setArrivalAirport(value);
              arrivalSearchHook.handleSearch(value);
            }}
            onSelect={(airport) => {
              setArrivalAirport(airport.code);
              arrivalSearchHook.hideResults();
            }}
            placeholder="Kod lub miasto"
            label="Lotnisko przylotu"
            icon={<MapPin size={16} className="mr-1 text-indigo-600" />}
            error={formErrors.arrivalAirport}
            searchResults={arrivalSearchHook.searchResults}
            showResults={arrivalSearchHook.showResults}
          />
        </div>

        {/* Data i czas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1 text-indigo-600" />
                Data wylotu
              </div>
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className={`w-full p-3 border ${
                formErrors.departureDate
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              } rounded-lg focus:ring-2 transition-colors`}
            />
            {formErrors.departureDate && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.departureDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <div className="flex items-center">
                <Clock size={16} className="mr-1 text-indigo-600" />
                Czas wylotu
              </div>
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className={`w-full p-3 border ${
                formErrors.departureTime
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              } rounded-lg focus:ring-2 transition-colors`}
            />
            {formErrors.departureTime && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.departureTime}
              </p>
            )}
          </div>
        </div>

        {/* Preferencja słońca */}
        <SunPreferenceSelector
          value={sunPreference}
          onChange={setSunPreference}
        />

        {/* Przycisk wyszukiwania */}
        <button
          onClick={handleSubmit}
          disabled={searching}
          className="w-full py-4 px-6 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {searching ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Trwa wyszukiwanie...
            </>
          ) : (
            "Znajdź najlepsze miejsce"
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchFormSection;
