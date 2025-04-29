// components/sections/SearchFormSection.js
import React, { useState, useEffect } from "react";
import { Sunrise, Sunset } from "lucide-react";

const SearchFormSection = ({ onSubmit, searching }) => {
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [sunPreference, setSunPreference] = useState("sunset");

  // Inicjalizacja daty i czasu
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const formattedDate = tomorrow.toISOString().split("T")[0];
    setDepartureDate(formattedDate);

    const hours = String(10).padStart(2, "0");
    const minutes = String(0).padStart(2, "0");
    setDepartureTime(`${hours}:${minutes}`);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!departureAirport || !arrivalAirport) return;

    if (onSubmit) {
      onSubmit({
        departureAirport,
        arrivalAirport,
        departureDate,
        departureTime,
        sunPreference,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 max-w-xl w-full mx-auto">
      <h2 className="text-xl font-medium text-gray-900 mb-6">Wyszukaj lot</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lotnisko wylotu
            </label>
            <input
              type="text"
              value={departureAirport}
              onChange={(e) => setDepartureAirport(e.target.value)}
              placeholder="Kod IATA, np. WAW"
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lotnisko przylotu
            </label>
            <input
              type="text"
              value={arrivalAirport}
              onChange={(e) => setArrivalAirport(e.target.value)}
              placeholder="Kod IATA, np. LHR"
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data wylotu
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Czas wylotu
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferencja
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`flex items-center justify-center py-2 px-4 border rounded ${
                sunPreference === "sunrise"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
              onClick={() => setSunPreference("sunrise")}
            >
              <Sunrise size={18} className="mr-2" />
              Wschód słońca
            </button>

            <button
              type="button"
              className={`flex items-center justify-center py-2 px-4 border rounded ${
                sunPreference === "sunset"
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
              onClick={() => setSunPreference("sunset")}
            >
              <Sunset size={18} className="mr-2" />
              Zachód słońca
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={searching || !departureAirport || !arrivalAirport}
          className="w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searching ? "Wyszukiwanie..." : "Wyszukaj"}
        </button>
      </form>
    </div>
  );
};

export default SearchFormSection;
