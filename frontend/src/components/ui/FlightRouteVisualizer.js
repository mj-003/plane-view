// components/ui/FlightRouteVisualizer.js
import React from "react";
import { Plane, Sunrise, Sunset } from "lucide-react";

const FlightRouteVisualizer = ({ departure, arrival, recommendation }) => {
  return (
    <div className="relative h-32 mb-8">
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-300"></div>

      {/* Lotnisko wylotu */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-indigo-600 mb-2"></div>
        <div className="text-lg font-bold">{departure.code}</div>
        <div className="text-xs text-gray-500">{departure.city}</div>
      </div>

      {/* Lotnisko przylotu */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-indigo-600 mb-2"></div>
        <div className="text-lg font-bold">{arrival.code}</div>
        <div className="text-xs text-gray-500">{arrival.city}</div>
      </div>

      {/* Samolot */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-full p-3 shadow-md">
          <Plane size={28} className="text-indigo-600" />
        </div>
      </div>

      {/* Wydarzenie słoneczne */}
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 flex flex-col items-center">
        <div className="bg-amber-100 rounded-full p-2 shadow-sm mb-1">
          {recommendation.sun_event === "sunrise" ? (
            <Sunrise size={20} className="text-amber-600" />
          ) : (
            <Sunset size={20} className="text-orange-600" />
          )}
        </div>
        <div className="text-xs text-gray-600 text-center max-w-xs">
          Najlepszy moment na obserwację{" "}
          {recommendation.sun_event === "sunrise" ? "wschodu" : "zachodu"}{" "}
          słońca
        </div>
      </div>
    </div>
  );
};

export default FlightRouteVisualizer;
