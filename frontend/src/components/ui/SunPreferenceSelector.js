// components/ui/SunPreferenceSelector.js
import React from "react";
import { Sunrise, Sunset } from "lucide-react";

const SunPreferenceSelector = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700">
        <div className="flex items-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="mr-1 text-indigo-600"
          >
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              d="M12,2 L12,4 M12,20 L12,22 M2,12 L4,12 M20,12 L22,12 M4.93,4.93 L6.34,6.34 M17.66,17.66 L19.07,19.07 M4.93,19.07 L6.34,17.66 M17.66,6.34 L19.07,4.93"
            />
          </svg>
          Preferencja
        </div>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className={`flex items-center justify-center p-4 rounded-lg border ${
            value === "sunrise"
              ? "bg-amber-50 border-amber-300 text-amber-800"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          } transition-colors`}
          onClick={() => onChange("sunrise")}
        >
          <Sunrise size={20} className="mr-2" />
          Wschód słońca
        </button>

        <button
          type="button"
          className={`flex items-center justify-center p-4 rounded-lg border ${
            value === "sunset"
              ? "bg-orange-50 border-orange-300 text-orange-800"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          } transition-colors`}
          onClick={() => onChange("sunset")}
        >
          <Sunset size={20} className="mr-2" />
          Zachód słońca
        </button>
      </div>
    </div>
  );
};

export default SunPreferenceSelector;
