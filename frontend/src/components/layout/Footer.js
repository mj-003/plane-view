// components/layout/Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer className="py-8 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="font-medium text-lg text-gray-900 mb-1">
              SunFlight
            </div>
            <p className="text-sm text-gray-600">
              Znajdź najlepsze miejsca do obserwacji wschodu i zachodu słońca
              podczas lotu
            </p>
          </div>

          <div className="flex space-x-8">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              O projekcie
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Jak to działa
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Kontakt
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <div className="text-xs text-gray-500 mb-4 md:mb-0">
            © 2025 SunFlight. Wszelkie prawa zastrzeżone.
          </div>

          <div className="flex space-x-4">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Polityka prywatności
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Warunki korzystania
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
