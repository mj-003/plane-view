import React, { useState, useEffect } from "react";
import {
  Sunrise,
  Sunset,
  Plane,
  Search,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { useAirportSearch } from "../hooks/useAirportSearch";
import { testApiConnection } from "../services/api";

const SearchFormSection = ({ onSubmit, searching }) => {
  // Stany formularza
  const [departureAirport, setDepartureAirport] = useState("");
  const [departureAirportCode, setDepartureAirportCode] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [arrivalAirportCode, setArrivalAirportCode] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [sunPreference, setSunPreference] = useState("sunset");
  const [formErrors, setFormErrors] = useState({});
  const [apiStatus, setApiStatus] = useState({ checked: false, online: false });

  // Hooki wyszukiwania lotnisk dla wylotu
  const departureHook = useAirportSearch();

  // Hooki wyszukiwania lotnisk dla przylotu
  const arrivalHook = useAirportSearch();

  // Initialize date and time
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const formattedDate = tomorrow.toISOString().split("T")[0];
    setDepartureDate(formattedDate);

    const hours = String(10).padStart(2, "0");
    const minutes = String(0).padStart(2, "0");
    setDepartureTime(`${hours}:${minutes}`);

    // Sprawdź status API
    checkApiConnection();
  }, []);

  // Sprawdź połączenie z API
  const checkApiConnection = async () => {
    try {
      const result = await testApiConnection();
      console.log("Test połączenia API:", result);
      setApiStatus({ checked: true, online: result.success });
    } catch (error) {
      console.error("Błąd testowania API:", error);
      setApiStatus({ checked: true, online: false });
    }
  };

  // Wybór lotniska wylotu
  const selectDepartureAirport = (airport) => {
    setDepartureAirport(`${airport.code} - ${airport.name}`);
    setDepartureAirportCode(airport.code);
    departureHook.hideResults();
    setFormErrors({ ...formErrors, departureAirport: "" });
  };

  // Wybór lotniska przylotu
  const selectArrivalAirport = (airport) => {
    setArrivalAirport(`${airport.code} - ${airport.name}`);
    setArrivalAirportCode(airport.code);
    arrivalHook.hideResults();
    setFormErrors({ ...formErrors, arrivalAirport: "" });
  };

  // Walidacja formularza
  const validateForm = () => {
    const errors = {};

    if (!departureAirportCode)
      errors.departureAirport = "Wybierz lotnisko wylotu";
    if (!arrivalAirportCode)
      errors.arrivalAirport = "Wybierz lotnisko przylotu";
    if (!departureDate) errors.departureDate = "Wybierz datę wylotu";
    if (!departureTime) errors.departureTime = "Wybierz czas wylotu";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (onSubmit) {
      onSubmit({
        departureAirport: departureAirportCode,
        arrivalAirport: arrivalAirportCode,
        departureDate,
        departureTime,
        sunPreference,
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-16">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-medium text-gray-800 mb-10 text-center">
            Wyszukaj lot
          </h2>

          {apiStatus.checked && !apiStatus.online && (
            <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
              <p className="flex items-center">
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
                Pracujemy w trybie offline. Używamy lokalnej bazy danych
                lotnisk.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Lotniska */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-normal text-gray-600 mb-1.5">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1 text-indigo-600" />
                    Lotnisko wylotu
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={departureAirport}
                    onChange={(e) => {
                      setDepartureAirport(e.target.value);
                      departureHook.handleSearch(e.target.value);
                      setDepartureAirportCode(""); // reset code when typing
                    }}
                    placeholder="Kod lub miasto, np. WAW, Warszawa"
                    className={`w-full p-2.5 bg-gray-50 border ${
                      formErrors.departureAirport
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                    } rounded-lg focus:outline-none focus:ring-1 transition-all text-gray-700 placeholder-gray-400`}
                  />
                  {departureHook.loading ? (
                    <div className="absolute right-3 top-3.5">
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                    </div>
                  ) : (
                    <Search
                      size={18}
                      className="absolute right-3 top-3.5 text-gray-400"
                    />
                  )}
                </div>
                {formErrors.departureAirport && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.departureAirport}
                  </p>
                )}
                {departureHook.error &&
                  !departureHook.error.includes("tryb offline") && (
                    <p className="mt-1 text-sm text-red-600">
                      {departureHook.error}
                    </p>
                  )}

                {departureHook.showResults &&
                  departureHook.searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      <ul className="py-1">
                        {departureHook.searchResults.map((airport) => (
                          <li
                            key={airport.code}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
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

              <div className="relative">
                <label className="block text-sm font-normal text-gray-600 mb-1.5">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1 text-indigo-600" />
                    Lotnisko przylotu
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={arrivalAirport}
                    onChange={(e) => {
                      setArrivalAirport(e.target.value);
                      arrivalHook.handleSearch(e.target.value);
                      setArrivalAirportCode(""); // reset code when typing
                    }}
                    placeholder="Kod lub miasto, np. CDG, Paryż"
                    className={`w-full p-2.5 bg-gray-50 border ${
                      formErrors.arrivalAirport
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                    } rounded-lg focus:outline-none focus:ring-1 transition-all text-gray-700 placeholder-gray-400`}
                  />
                  {arrivalHook.loading ? (
                    <div className="absolute right-3 top-3.5">
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                    </div>
                  ) : (
                    <Search
                      size={18}
                      className="absolute right-3 top-3.5 text-gray-400"
                    />
                  )}
                </div>
                {formErrors.arrivalAirport && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.arrivalAirport}
                  </p>
                )}
                {arrivalHook.error &&
                  !arrivalHook.error.includes("tryb offline") && (
                    <p className="mt-1 text-sm text-red-600">
                      {arrivalHook.error}
                    </p>
                  )}

                {arrivalHook.showResults &&
                  arrivalHook.searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                      <ul className="py-1">
                        {arrivalHook.searchResults.map((airport) => (
                          <li
                            key={airport.code}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
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
            </div>

            {/* Data i czas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-normal text-gray-600 mb-1.5">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1 text-indigo-600" />
                    Data wylotu
                  </div>
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => {
                    setDepartureDate(e.target.value);
                    setFormErrors({ ...formErrors, departureDate: "" });
                  }}
                  className={`w-full p-2.5 bg-gray-50 border ${
                    formErrors.departureDate
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-1 transition-all text-gray-700`}
                />
                {formErrors.departureDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.departureDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-600 mb-1.5">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1 text-indigo-600" />
                    Czas wylotu
                  </div>
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => {
                    setDepartureTime(e.target.value);
                    setFormErrors({ ...formErrors, departureTime: "" });
                  }}
                  className={`w-full p-2.5 bg-gray-50 border ${
                    formErrors.departureTime
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-lg focus:outline-none focus:ring-1 transition-all text-gray-700`}
                />
                {formErrors.departureTime && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.departureTime}
                  </p>
                )}
              </div>
            </div>

            {/* Preferencja słońca */}
            <div>
              <label className="block text-sm font-normal text-gray-600 mb-3">
                Preferencja
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center py-2.5 px-4 rounded-lg transition-all ${
                    sunPreference === "sunrise"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setSunPreference("sunrise")}
                >
                  <Sunrise size={18} className="mr-2" />
                  <span>Wschód słońca</span>
                </button>

                <button
                  type="button"
                  className={`flex items-center justify-center py-2.5 px-4 rounded-lg transition-all ${
                    sunPreference === "sunset"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setSunPreference("sunset")}
                >
                  <Sunset size={18} className="mr-2" />
                  <span>Zachód słońca</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                searching || !departureAirportCode || !arrivalAirportCode
              }
              className="w-full py-3 mt-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              {searching ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Wyszukiwanie...
                </div>
              ) : (
                "Wyszukaj"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFormSection;
