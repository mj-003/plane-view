// hooks/useAirportSearch.js
import { useState } from "react";

export const useAirportSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Funkcja symulująca wyszukiwanie lotnisk
  const searchAirports = (query) => {
    // Symulacja danych z API
    const airports = [
      {
        code: "WAW",
        name: "Warsaw Chopin Airport",
        city: "Warsaw",
        country: "Poland",
      },
      {
        code: "KRK",
        name: "John Paul II International Airport",
        city: "Krakow",
        country: "Poland",
      },
      {
        code: "CDG",
        name: "Charles de Gaulle Airport",
        city: "Paris",
        country: "France",
      },
      {
        code: "LHR",
        name: "Heathrow Airport",
        city: "London",
        country: "United Kingdom",
      },
      {
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "United States",
      },
    ];

    // Filtrowanie wyników
    const filtered = airports.filter(
      (airport) =>
        airport.code.toLowerCase().includes(query.toLowerCase()) ||
        airport.name.toLowerCase().includes(query.toLowerCase()) ||
        airport.city.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
    setShowResults(filtered.length > 0);
  };

  const handleSearch = (query) => {
    if (query.length >= 2) {
      searchAirports(query);
    } else {
      setShowResults(false);
    }
  };

  const hideResults = () => {
    setShowResults(false);
  };

  return {
    searchResults,
    showResults,
    handleSearch,
    hideResults,
  };
};
