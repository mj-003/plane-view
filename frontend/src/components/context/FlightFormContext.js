// context/FlightFormContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

const FlightFormContext = createContext();

// Hook for easy context usage
export const useFlightForm = () => useContext(FlightFormContext);

// Context Provider
export const FlightFormProvider = ({ children }) => {
  // Form states
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [sunPreference, setSunPreference] = useState("sunrise");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Initialize date and time
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDepartureDate(formattedDate);

    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    setDepartureTime(`${hours}:${minutes}`);
  }, []);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!departureAirport) errors.departureAirport = "Choose departure airport";
    if (!arrivalAirport) errors.arrivalAirport = "Choose arrival airport";
    if (!departureDate) errors.departureDate = "Choose departure date";
    if (!departureTime) errors.departureTime = "Choose departure time";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission simulation
  const handleSubmit = () => {
    if (!validateForm()) return;

    setSearching(true);

    // API response simulation
    setTimeout(() => {
      setResults({
        departure_airport: {
          code: departureAirport,
          name: "Warsaw Chopin Airport",
          city: "Warsaw",
          country: "Poland",
          latitude: 52.1657,
          longitude: 20.9671,
          timezone: "Europe/Warsaw",
        },
        arrival_airport: {
          code: arrivalAirport,
          name: "Charles de Gaulle Airport",
          city: "Paris",
          country: "France",
          latitude: 49.0097,
          longitude: 2.5479,
          timezone: "Europe/Paris",
        },
        departure_time: `${departureDate}T${departureTime}:00`,
        arrival_time: `${departureDate}T${
          parseInt(departureTime.split(":")[0]) + 2
        }:${departureTime.split(":")[1]}:00`,
        flight_duration: 2.3,
        recommendation: {
          seat_code: "A15",
          seat_side: "left side of the aircraft",
          best_time: `${departureDate}T${
            parseInt(departureTime.split(":")[0]) + 1
          }:${departureTime.split(":")[1]}:00`,
          sun_event: sunPreference,
          quality_score: 87.5,
          flight_direction: "western",
        },
      });

      setSearching(false);
    }, 1500);
  };

  const resetForm = () => {
    setDepartureAirport("");
    setArrivalAirport("");
    const today = new Date();
    setDepartureDate(today.toISOString().split("T")[0]);
    setDepartureTime(
      `${String(today.getHours()).padStart(2, "0")}:${String(
        today.getMinutes()
      ).padStart(2, "0")}`
    );
    setSunPreference("sunrise");
    setFormErrors({});
  };

  // Context value
  const value = {
    departureAirport,
    setDepartureAirport,
    arrivalAirport,
    setArrivalAirport,
    departureDate,
    setDepartureDate,
    departureTime,
    setDepartureTime,
    sunPreference,
    setSunPreference,
    searching,
    setSearching,
    results,
    setResults,
    formErrors,
    setFormErrors,
    validateForm,
    handleSubmit,
    resetForm,
  };

  return (
    <FlightFormContext.Provider value={value}>
      {children}
    </FlightFormContext.Provider>
  );
};
