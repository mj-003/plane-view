// components/ui/AirportSearch.js
import React from "react";
import { Search } from "lucide-react";

const AirportSearch = ({
  value,
  onChange,
  onSelect,
  placeholder,
  label,
  icon,
  error,
  searchResults,
  showResults,
}) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        <div className="flex items-center">
          {icon}
          {label}
        </div>
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-3 border ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          } rounded-lg focus:ring-2 transition-colors`}
        />
        <Search size={18} className="absolute right-3 top-3.5 text-gray-400" />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {searchResults.map((airport) => (
              <li
                key={airport.code}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                onClick={() => onSelect(airport)}
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
  );
};

export default AirportSearch;
