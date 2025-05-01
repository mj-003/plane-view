// hooks/useAirportSearch.js
import { useState, useEffect, useCallback, useRef } from "react";
import { searchAirports } from "../services/api";

export const useAirportSearch = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Użyjmy ref dla debounce timera, aby uniknąć problemów z useCallback
  const timerRef = useRef(null);

  // Funkcja do bezpośredniego wyszukiwania (bez debounce)
  const searchAirportsDirectly = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Użyjmy hard-coded danych jako fallback, jeśli API nie działa
      try {
        const results = await searchAirports(searchQuery);
        console.log("Wyniki z API:", results);

        // Sprawdźmy, czy wyniki są tablicą
        if (Array.isArray(results)) {
          setSearchResults(results);
          setShowResults(results.length > 0);
        } else {
          throw new Error("Nieprawidłowy format danych z API");
        }
      } catch (apiError) {
        console.error("Błąd API, używam danych lokalnych:", apiError);

        // Fallback do lokalnej bazy lotnisk
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

        // Filtrowanie lokalnych wyników
        const filtered = airports.filter(
          (airport) =>
            airport.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            airport.city.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(filtered);
        setShowResults(filtered.length > 0);

        // Ustawiamy łagodniejszy komunikat błędu
        setError("Używamy lokalnej bazy danych lotnisk (tryb offline)");
      }
    } catch (err) {
      console.error("Błąd wyszukiwania lotnisk:", err);
      setError("Nie udało się wyszukać lotnisk. Spróbuj ponownie.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debouncowane wyszukiwanie
  const handleSearch = (newQuery) => {
    setQuery(newQuery);

    // Wyczyść poprzedni timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (newQuery.length < 2) {
      setShowResults(false);
      return;
    }

    // Ustaw nowy timer
    timerRef.current = setTimeout(() => {
      searchAirportsDirectly(newQuery);
    }, 300);
  };

  // Czyszczenie timera przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

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
