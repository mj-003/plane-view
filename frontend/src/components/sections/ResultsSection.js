// components/sections/ImprovedLayoutResultsView.jsx
import React from "react";
import {
  Plane,
  ArrowRight,
  Cloud,
  Eye,
  Thermometer,
  Sunrise,
  Sunset,
  ArrowLeft,
} from "lucide-react";

const ImprovedLayoutResultsView = ({ flightData, onSearchAgain }) => {
  if (!flightData) return null;

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get the most relevant sun event time
  const sunEventTimes = flightData.recommendation.sun_event_times || [];
  const relevantSunEvents = sunEventTimes.filter(
    (e) => e.event_type === flightData.recommendation.sun_event
  );
  const bestViewTime =
    relevantSunEvents.length > 0
      ? relevantSunEvents[0].event_time
      : flightData.recommendation.best_time;

  // Weather data
  const weatherData = flightData.recommendation.weather_data;

  return (
    <section className="flex flex-col min-h-screen">
      <div className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-xl font-medium mb-2 text-center flex justify-center items-center">
            {flightData.recommendation.sun_event === "sunrise" ? (
              <Sunrise className="text-amber-500 w-5 h-5 mr-2" />
            ) : (
              <Sunset className="text-amber-500 w-5 h-5 mr-2" />
            )}
            Best View Recommendation
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {flightData.departure_airport.code} →{" "}
            {flightData.arrival_airport.code} |{" "}
            {formatTime(flightData.departure_time)} flight
          </p>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-center items-center gap-10 mb-6">
              <div className="text-center">
                <div className="text-2xl font-medium">
                  {flightData.departure_airport.code}
                </div>
                <div className="text-sm text-gray-500">
                  {flightData.departure_airport.city}
                </div>
              </div>

              <ArrowRight size={24} className="text-gray-300" />

              <div className="text-center">
                <div className="text-2xl font-medium">
                  {flightData.arrival_airport.code}
                </div>
                <div className="text-sm text-gray-500">
                  {flightData.arrival_airport.city}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-6"></div>

            {/* Flight Direction */}
            <div className="flex items-center justify-center mb-4">
              <Plane size={16} className="text-amber-500 mr-1" />
              <span className="text-sm text-gray-500">
                {flightData.recommendation.flight_direction} flight
              </span>
            </div>

            {/* Seat Code - Centered large display */}
            <div className="text-center mb-2">
              <div className="text-6xl font-light text-gray-800">
                {flightData.recommendation.seat_code}
              </div>
            </div>

            {/* Seat Side */}
            <div className="text-center text-sm text-gray-500 mb-3">
              {flightData.recommendation.seat_side}
            </div>

            {/* Sun Event */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center px-3 py-1 bg-amber-50 rounded-full">
                <span className="text-xs text-amber-700">
                  {flightData.recommendation.sun_event === "sunrise"
                    ? "Sunrise"
                    : "Sunset"}{" "}
                  at {formatTime(bestViewTime)}
                </span>
              </div>
            </div>

            {/* Flight Information */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Flight time:</span>
                <span>
                  <span className="font-medium">
                    {formatTime(flightData.departure_time)}
                  </span>
                  <span className="mx-1 text-gray-300">—</span>
                  <span className="font-medium">
                    {formatTime(flightData.arrival_time)}
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">
                  {flightData.flight_duration.toFixed(1)} hours
                </span>
              </div>
            </div>

            {/* Quality Score */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>View quality</span>
                <span className="font-medium">
                  {Math.round(flightData.recommendation.quality_score)}%
                </span>
              </div>
              <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${Math.round(
                      flightData.recommendation.quality_score
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Weather Conditions - More compact */}
            {weatherData && (
              <div>
                <div className="text-xs text-gray-500 mb-2">
                  Weather Conditions
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex justify-center mb-1 text-amber-500">
                      <Cloud size={16} />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Clouds
                    </div>
                    <div className="text-center font-medium text-sm">
                      {weatherData.clouds_percent}%
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex justify-center mb-1 text-amber-500">
                      <Eye size={16} />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Visibility
                    </div>
                    <div className="text-center font-medium text-sm">
                      {weatherData.visibility_km} km
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex justify-center mb-1 text-amber-500">
                      <Thermometer size={16} />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Temperature
                    </div>
                    <div className="text-center font-medium text-sm">
                      {weatherData.temperature_celsius}°C
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 my-6"></div>

            {/* Flight Recommendation */}

            {/* Warning (if needed) */}
            {!flightData.sun_events_visible && (
              <div className="text-xs text-gray-700 mb-6 p-2 border-b border-amber-300">
                Note:{" "}
                {flightData.recommendation.sun_event === "sunrise"
                  ? "Sunrise"
                  : "Sunset"}{" "}
                may not be visible during your flight
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={onSearchAgain}
              className="w-full py-3 bg-amber-500 text-white rounded-full text-sm hover:bg-amber-600 transition-colors flex items-center justify-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>New Search</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImprovedLayoutResultsView;
