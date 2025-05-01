// components/layout/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="py-4 px-6 border-t border-gray-100 text-xs text-gray-400 text-center">
      SunFlight © {new Date().getFullYear()} | Recommendations are approximate
      and depend on current conditions
    </footer>
  );
};

export default Footer;
