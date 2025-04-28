// components/ui/FlightDetailsCard.js
import React from "react";

const FlightDetailsCard = ({ flightData }) => {
  return (
    <div className="bg-indigo-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-indigo-800">
        Szczegóły lotu
      </h3>
      <ul className="space-y-3">
        <li className="flex justify-between">
          <span className="text-gray-600">Wylot:</span>
          <span className="font-medium">
            {new Date(flightData.departure_time).toLocaleString()}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-600">Przylot:</span>
          <span className="font-medium">
            {new Date(flightData.arrival_time).toLocaleString()}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-600">Czas lotu:</span>
          <span className="font-medium">
            {flightData.flight_duration.toFixed(1)} godz.
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-600">Kierunek lotu:</span>
          <span className="font-medium">
            {flightData.recommendation.flight_direction}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default FlightDetailsCard;
