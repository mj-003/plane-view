// components/sections/ResultsSection.jsx
import React from "react";
import {
  Plane,
  Sun,
  ArrowRight,
  Sunrise,
  Sunset,
  Cloud,
  Eye,
  Droplets,
  Thermometer,
} from "lucide-react";

const ResultsSection = ({ flightData, onSearchAgain, isChangingStep }) => {
  if (!flightData) return null;

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Weather conditions
  const weatherData = flightData.recommendation.weather_data;

  // Get the most relevant sun event time
  const sunEventTimes = flightData.recommendation.sun_event_times || [];
  const relevantSunEvents = sunEventTimes.filter(
    (e) => e.event_type === flightData.recommendation.sun_event
  );
  const bestViewTime =
    relevantSunEvents.length > 0
      ? relevantSunEvents[0].event_time
      : flightData.recommendation.best_time;

  return (
    <section className="py-16 px-4 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-xl">
        <h1 className="text-xl font-light mb-8 text-center">
          Best View Recommendation
          <br />
          <span className="text-base text-gray-500">
            {flightData.departure_airport.code} →{" "}
            {flightData.arrival_airport.code}
          </span>
        </h1>

        <div className="rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 mb-6 transition-shadow hover:shadow-md">
          <div className="p-8">
            <div className="border-b border-gray-100 pb-5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">Flight</div>
                <div className="text-xs text-gray-500">
                  Duration: {flightData.flight_duration.toFixed(1)} hours
                </div>
              </div>
              <div className="text-lg font-light">
                {flightData.departure_airport.code}{" "}
                <ArrowRight className="inline w-3 h-3 mx-1" />{" "}
                {flightData.arrival_airport.code}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(flightData.departure_time)} ·{" "}
                {formatTime(flightData.departure_time)}
              </div>
            </div>

            <div className="space-y-5 mb-6">
              <div className="flex items-center transition-transform hover:translate-x-1 duration-300">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Plane className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Seat recommendation
                  </div>
                  <div className="text-l text-gray-800 font-normal">
                    <span className="font-semibold">
                      {flightData.recommendation.seat_code}
                    </span>{" "}
                    · {flightData.recommendation.seat_side}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Flight direction:{" "}
                    {flightData.recommendation.flight_direction}
                  </div>
                </div>
              </div>

              <div className="flex items-center transition-transform hover:translate-x-1 duration-300">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  {flightData.recommendation.sun_event === "sunrise" ? (
                    <Sunrise className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Sunset className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    During your flight
                  </div>
                  <div className="text-l text-gray-800 font-normal">
                    {flightData.recommendation.sun_event === "sunrise"
                      ? "Sunrise"
                      : "Sunset"}{" "}
                    at {formatTime(bestViewTime)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    View quality:{" "}
                    {flightData.recommendation.quality_score.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {weatherData && (
              <div className="border-t border-gray-100 pt-6 mb-6">
                <h3 className="text-sm text-gray-500 mb-4">
                  Weather conditions
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center transition-transform hover:scale-105 duration-300">
                    <div className="text-xs text-gray-500 mb-1">
                      Cloud Cover
                    </div>
                    <div className="font-normal text-lg text-gray-700">
                      {weatherData.clouds_percent}%
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-center transition-transform hover:scale-105 duration-300">
                    <div className="text-xs text-gray-500 mb-1">Visibility</div>
                    <div className="font-normal text-lg text-gray-700">
                      {weatherData.visibility_km} km
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-center transition-transform hover:scale-105 duration-300">
                    <div className="text-xs text-gray-500 mb-1">
                      Temperature
                    </div>
                    <div className="font-normal text-lg text-gray-700">
                      {weatherData.temperature_celsius}°C
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-400 mt-4">
                  {weatherData.viewing_conditions} viewing conditions expected
                </div>
              </div>
            )}

            {flightData.recommendation.recommendation_notes && (
              <div className="bg-amber-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-amber-800">
                  {flightData.recommendation.recommendation_notes}
                </p>
              </div>
            )}

            {!flightData.sun_events_visible && (
              <div className="bg-amber-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-amber-800">
                  Note:{" "}
                  {flightData.recommendation.sun_event === "sunrise"
                    ? "Sunrise"
                    : "Sunset"}{" "}
                  may not be fully visible during this flight. Consider
                  adjusting your departure time for a better experience.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={onSearchAgain}
            className="px-8 py-2.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-all duration-300 hover:scale-105 transform font-light"
          >
            New Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
