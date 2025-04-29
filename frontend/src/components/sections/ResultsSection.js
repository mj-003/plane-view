// components/sections/ResultsSection.js
import React from "react";
import { Plane, Sun, Sunrise, Sunset, ArrowLeft } from "lucide-react";

const ResultsSection = ({ flightData, onSearchAgain }) => {
  if (!flightData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-xl w-full mx-auto">
        <p className="text-gray-500">
          Wypełnij formularz, aby zobaczyć rekomendację miejsca
        </p>
      </div>
    );
  }

  // Formatowanie czasu
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 max-w-xl w-full mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-900">Rekomendacja</h2>
          <span className="text-sm text-gray-500">
            {flightData.departure_airport.code} →{" "}
            {flightData.arrival_airport.code}
          </span>
        </div>

        {/* Informacja o locie */}
        <div className="flex mb-8">
          <div className="w-10 h-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
            <Plane size={20} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Czas lotu</div>
            <div className="text-gray-900">
              {formatTime(flightData.departure_time)} -{" "}
              {formatTime(flightData.arrival_time)}
              <span className="text-sm text-gray-500 ml-2">
                ({flightData.flight_duration.toFixed(1)} godz.)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rekomendacja miejsca */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Najlepsze miejsce</h3>
          <div className="flex items-center">
            {flightData.recommendation.sun_event === "sunrise" ? (
              <Sunrise size={16} className="text-amber-500 mr-1" />
            ) : (
              <Sunset size={16} className="text-orange-500 mr-1" />
            )}
            <span className="text-sm text-gray-600">
              {flightData.recommendation.sun_event === "sunrise"
                ? "Wschód"
                : "Zachód"}{" "}
              {formatTime(flightData.recommendation.best_time)}
            </span>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="w-14 h-14 bg-indigo-500 text-white rounded-lg flex items-center justify-center mr-4">
            <span className="text-2xl font-bold">
              {flightData.recommendation.seat_code}
            </span>
          </div>
          <div>
            <div className="font-medium">
              {flightData.recommendation.seat_side}
            </div>
            <div className="text-sm text-gray-600">
              Kierunek lotu: {flightData.recommendation.flight_direction}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Jakość widoku</span>
            <span className="font-medium">
              {flightData.recommendation.quality_score.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${flightData.recommendation.quality_score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Wskazówka */}
      <div className="text-sm text-gray-600 mb-6">
        <p>
          Zajmij miejsce {flightData.recommendation.seat_code} około 15 minut
          przed wskazanym czasem, aby nie przegapić najlepszego widoku.
        </p>
      </div>

      {/* Przycisk powrotu */}
      <button
        onClick={onSearchAgain}
        className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        Zmień parametry wyszukiwania
      </button>
    </div>
  );
};

export default ResultsSection;
