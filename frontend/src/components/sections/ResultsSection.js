import React from "react";
import {
  Plane,
  Sun,
  Sunrise,
  Sunset,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const ResultsSection = ({ flightData, onSearchAgain }) => {
  if (!flightData) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <Sun className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500">
              Complete the search form to find your ideal seat
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Quality indicator class based on score
  const getQualityClass = (score) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-orange-500";
  };

  // Quality label based on score
  const getQualityLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    return "Moderate";
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-16">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header section */}
        <div className="bg-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Flight Details</h2>
            <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-white text-sm">
                {flightData.departure_airport.code}
              </span>
              <Plane
                size={12}
                className="mx-2 text-white transform rotate-90"
              />
              <span className="text-white text-sm">
                {flightData.arrival_airport.code}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Flight info */}
          <div className="mb-6 flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="text-gray-700">
                <span className="font-medium">
                  {formatTime(flightData.departure_time)}
                </span>
                <span className="mx-2 text-gray-400">—</span>
                <span className="font-medium">
                  {formatTime(flightData.arrival_time)}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {flightData.flight_duration.toFixed(1)} hours
            </div>
          </div>

          {/* Recommendation section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-medium text-gray-800">Best Seat</h3>
              <div className="flex items-center text-sm">
                {flightData.recommendation.sun_event === "sunrise" ? (
                  <Sunrise size={16} className="text-amber-500 mr-1.5" />
                ) : (
                  <Sunset size={16} className="text-orange-500 mr-1.5" />
                )}
                <span className="text-gray-600">
                  {flightData.recommendation.sun_event === "sunrise"
                    ? "Sunrise"
                    : "Sunset"}{" "}
                  {formatTime(flightData.recommendation.best_time)}
                </span>
              </div>
            </div>

            <div className="flex items-center p-5 bg-gray-50 rounded-lg mb-6">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-5">
                <span className="text-xl font-bold">
                  {flightData.recommendation.seat_code}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-1">
                  {flightData.recommendation.seat_side ===
                  "lewa strona samolotu"
                    ? "Left side of aircraft"
                    : "Right side of aircraft"}
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Plane size={14} className="mr-1.5" />
                  Flight direction:{" "}
                  {flightData.recommendation.flight_direction
                    .replace("północny", "north")
                    .replace("południowy", "south")
                    .replace("wschodni", "east")
                    .replace("zachodni", "west")}
                </div>
              </div>
            </div>

            {/* Quality score */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">View quality</span>
                <div className="flex items-center">
                  <span className="font-medium text-gray-800 mr-2">
                    {flightData.recommendation.quality_score.toFixed(0)}%
                  </span>
                  {flightData.recommendation.quality_score >= 70 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        flightData.recommendation.quality_score >= 85
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {getQualityLabel(flightData.recommendation.quality_score)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getQualityClass(
                    flightData.recommendation.quality_score
                  )} rounded-full`}
                  style={{
                    width: `${flightData.recommendation.quality_score}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start border border-blue-100">
              <AlertCircle
                size={16}
                className="text-blue-500 mr-3 mt-0.5 flex-shrink-0"
              />
              <div className="text-sm text-gray-700">
                <p>
                  Take seat {flightData.recommendation.seat_code} approximately
                  15 minutes before the indicated time for the best viewing
                  experience.
                </p>
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={onSearchAgain}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Modify search parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
