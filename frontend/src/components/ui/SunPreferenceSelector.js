// components/ui/SunPreferenceSelector.jsx
import React from "react";
import { Sunrise, Sunset } from "lucide-react";

const SunPreferenceSelector = ({ value, onChange }) => {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Preference</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={`flex items-center justify-center py-2 px-3 rounded-lg border text-sm ${
            value === "sunrise"
              ? "bg-amber-500 text-white"
              : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
          } transition-colors`}
          onClick={() => onChange("sunrise")}
        >
          <Sunrise size={16} className="mr-1.5" />
          Sunrise
        </button>

        <button
          type="button"
          className={`flex items-center justify-center py-2 px-3 rounded-lg border text-sm ${
            value === "sunset"
              ? "bg-orange-500 text-white"
              : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
          } transition-colors`}
          onClick={() => onChange("sunset")}
        >
          <Sunset size={16} className="mr-1.5" />
          Sunset
        </button>
      </div>
    </div>
  );
};

export default SunPreferenceSelector;
