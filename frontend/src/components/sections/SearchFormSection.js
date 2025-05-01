import React, { useState, useEffect } from "react";
import { Sunrise, Sunset, Plane } from "lucide-react";

const SearchFormSection = ({ onSubmit, searching }) => {
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [sunPreference, setSunPreference] = useState("sunset");

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
    <div className="w-full max-w-3xl mx-auto px-6 py-16">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-medium text-gray-800 mb-10 text-center">
            Search Flight
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-normal text-gray-600 mb-1.5">
                  Departure Airport
                </label>
                <input
                  type="text"
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value)}
                  placeholder="IATA Code, e.g. LHR"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-600 mb-1.5">
                  Arrival Airport
                </label>
                <input
                  type="text"
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value)}
                  placeholder="IATA Code, e.g. JFK"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-normal text-gray-600 mb-1.5">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-600 mb-1.5">
                  Departure Time
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-600 mb-3">
                Preference
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
                  <span>Sunrise</span>
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
                  <span>Sunset</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={searching || !departureAirport || !arrivalAirport}
              className="w-full py-3 mt-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFormSection;
