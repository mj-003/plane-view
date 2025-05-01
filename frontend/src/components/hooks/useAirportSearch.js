// hooks/useAirportSearch.js
import { useState, useEffect, useRef } from "react";
import { searchAirports } from "../services/api";

export const useAirportSearch = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref for debounce timer
  const timerRef = useRef(null);

  // Search airports function
  const searchAirportsDirectly = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API, fallback to mock data if needed
      try {
        const results = await searchAirports(searchQuery);

        if (Array.isArray(results)) {
          setSearchResults(results);
          setShowResults(results.length > 0);
        } else {
          throw new Error("Invalid data format from API");
        }
      } catch (apiError) {
        console.error("API error, using fallback data:", apiError);

        // Fallback to local airport database
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
            code: "GDN",
            name: "Lech Walesa Airport",
            city: "Gdansk",
            country: "Poland",
          },
          {
            code: "WRO",
            name: "Copernicus Airport",
            city: "Wroclaw",
            country: "Poland",
          },
          {
            code: "POZ",
            name: "Lawica Airport",
            city: "Poznan",
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
          {
            code: "FCO",
            name: "Leonardo da Vinci International Airport",
            city: "Rome",
            country: "Italy",
          },
          {
            code: "BCN",
            name: "Barcelona El Prat Airport",
            city: "Barcelona",
            country: "Spain",
          },
        ];

        // Filter local results
        const filtered = airports.filter(
          (airport) =>
            airport.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            airport.city.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(filtered);
        setShowResults(filtered.length > 0);
        setError("Using offline airport database");
      }
    } catch (err) {
      console.error("Error searching airports:", err);
      setError("Failed to search airports. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const handleSearch = (newQuery) => {
    setQuery(newQuery);

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (newQuery.length < 2) {
      setShowResults(false);
      return;
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      searchAirportsDirectly(newQuery);
    }, 300);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Hide search results
  const hideResults = () => {
    setShowResults(false);
  };

  return {
    query,
    searchResults,
    showResults,
    loading,
    error,
    handleSearch,
    hideResults,
  };
};

export default useAirportSearch;
