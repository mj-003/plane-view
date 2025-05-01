// components/ui/AirportSearch.jsx
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
    <div className="relative transition-all duration-300 hover:translate-x-1">
      <label className="text-xs text-gray-500 mb-2 block flex items-center">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-100 focus:border-amber-500 focus:outline-none"
          } rounded-lg transition-colors text-lg`}
        />
        <Search size={18} className="absolute right-3 top-3.5 text-gray-400" />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {searchResults.map((airport) => (
              <li
                key={airport.code}
                className="px-4 py-2 hover:bg-amber-50 cursor-pointer"
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
