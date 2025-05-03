import React, { useState, useRef, useEffect } from "react";
import {
  Sun,
  Plane,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Sunrise,
  Sunset,
  Search,
} from "lucide-react";

const SunFlight = () => {
  // Stany formularza
  const [departureAirport, setDepartureAirport] = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [sunPreference, setSunPreference] = useState("sunrise");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [departureSearchResults, setDepartureSearchResults] = useState([]);
  const [arrivalSearchResults, setArrivalSearchResults] = useState([]);
  const [showDepartureResults, setShowDepartureResults] = useState(false);
  const [showArrivalResults, setShowArrivalResults] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Refy dla przewijania
  const resultsSectionRef = useRef(null);
  const formSectionRef = useRef(null);

  // Funkcja symulująca wyszukiwanie lotnisk
  const searchAirports = (query, setResults) => {
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

    setResults(filtered);
  };

  // Obsługa wyszukiwania lotniska wylotu
  const handleDepartureSearch = (e) => {
    const query = e.target.value;
    setDepartureAirport(query);
    if (query.length >= 2) {
      searchAirports(query, setDepartureSearchResults);
      setShowDepartureResults(true);
    } else {
      setShowDepartureResults(false);
    }
  };

  // Obsługa wyszukiwania lotniska przylotu
  const handleArrivalSearch = (e) => {
    const query = e.target.value;
    setArrivalAirport(query);
    if (query.length >= 2) {
      searchAirports(query, setArrivalSearchResults);
      setShowArrivalResults(true);
    } else {
      setShowArrivalResults(false);
    }
  };

  // Wybór lotniska
  const selectAirport = (airport, type) => {
    if (type === "departure") {
      setDepartureAirport(airport.code);
      setShowDepartureResults(false);
    } else {
      setArrivalAirport(airport.code);
      setShowArrivalResults(false);
    }
  };

  // Przewijanie do sekcji z wynikami
  const scrollToResults = () => {
    resultsSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Walidacja formularza
  const validateForm = () => {
    const errors = {};

    if (!departureAirport) errors.departureAirport = "Wybierz lotnisko wylotu";
    if (!arrivalAirport) errors.arrivalAirport = "Wybierz lotnisko przylotu";
    if (!departureDate) errors.departureDate = "Wybierz datę wylotu";
    if (!departureTime) errors.departureTime = "Wybierz czas wylotu";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Symulacja wysłania formularza
  const handleSubmit = () => {
    if (!validateForm()) return;

    setSearching(true);

    // Symulacja odpowiedzi z API
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
          seat_side: "lewa strona samolotu",
          best_time: `${departureDate}T${
            parseInt(departureTime.split(":")[0]) + 1
          }:${departureTime.split(":")[1]}:00`,
          sun_event: sunPreference,
          quality_score: 87.5,
          flight_direction: "zachodni",
        },
      });

      setSearching(false);
      scrollToResults();
    }, 1500);
  };

  // Uzyskajmy dzisiejszą datę jako wartość domyślną
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDepartureDate(formattedDate);

    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    setDepartureTime(`${hours}:${minutes}`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 text-gray-800 font-sans">
      {/* Hero Section z grafiką */}
      <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-indigo-600 opacity-20"></div>
          {/* Stylizowane elementy graficzne */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-blue-400 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">
            SunFlight
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 text-gray-700">
            Znajdź najlepsze miejsce w samolocie do obserwacji wschodu lub
            zachodu słońca
          </p>

          <button
            onClick={() =>
              formSectionRef.current.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700 transition-colors group"
          >
            Rozpocznij
            <ArrowRight
              className="ml-2 group-hover:translate-x-1 transition-transform"
              size={20}
            />
          </button>
        </div>

        {/* Dekoracyjny samolot */}
        <div className="absolute bottom-20 right-10 md:right-20 opacity-10">
          <Plane size={120} className="transform -rotate-45" />
        </div>
      </section>

      {/* Sekcja formularza */}
      <section
        ref={formSectionRef}
        className="min-h-screen py-16 px-4 md:px-0 flex items-center justify-center"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl max-w-2xl w-full mx-auto p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-800">
            Zaplanuj swój widok
          </h2>

          <div className="space-y-6">
            {/* Lotniska */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1 text-indigo-600" />
                    Lotnisko wylotu
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={departureAirport}
                    onChange={handleDepartureSearch}
                    placeholder="Kod lub miasto"
                    className={`w-full p-3 border ${
                      formErrors.departureAirport
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    } rounded-lg focus:ring-2 transition-colors`}
                  />
                  <Search
                    size={18}
                    className="absolute right-3 top-3.5 text-gray-400"
                  />
                </div>
                {formErrors.departureAirport && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.departureAirport}
                  </p>
                )}

                {showDepartureResults && departureSearchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {departureSearchResults.map((airport) => (
                        <li
                          key={airport.code}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                          onClick={() => selectAirport(airport, "departure")}
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

              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1 text-indigo-600" />
                    Lotnisko przylotu
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={arrivalAirport}
                    onChange={handleArrivalSearch}
                    placeholder="Kod lub miasto"
                    className={`w-full p-3 border ${
                      formErrors.arrivalAirport
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    } rounded-lg focus:ring-2 transition-colors`}
                  />
                  <Search
                    size={18}
                    className="absolute right-3 top-3.5 text-gray-400"
                  />
                </div>
                {formErrors.arrivalAirport && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.arrivalAirport}
                  </p>
                )}

                {showArrivalResults && arrivalSearchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {arrivalSearchResults.map((airport) => (
                        <li
                          key={airport.code}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                          onClick={() => selectAirport(airport, "arrival")}
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
            </div>

            {/* Data i czas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1 text-indigo-600" />
                    Data wylotu
                  </div>
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className={`w-full p-3 border ${
                    formErrors.departureDate
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-lg focus:ring-2 transition-colors`}
                />
                {formErrors.departureDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.departureDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1 text-indigo-600" />
                    Czas wylotu
                  </div>
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className={`w-full p-3 border ${
                    formErrors.departureTime
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } rounded-lg focus:ring-2 transition-colors`}
                />
                {formErrors.departureTime && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.departureTime}
                  </p>
                )}
              </div>
            </div>

            {/* Preferencja słońca */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <div className="flex items-center">
                  <Sun size={16} className="mr-1 text-indigo-600" />
                  Preferencja
                </div>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    sunPreference === "sunrise"
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                  onClick={() => setSunPreference("sunrise")}
                >
                  <Sunrise size={20} className="mr-2" />
                  Wschód słońca
                </button>

                <button
                  type="button"
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    sunPreference === "sunset"
                      ? "bg-orange-50 border-orange-300 text-orange-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                  onClick={() => setSunPreference("sunset")}
                >
                  <Sunset size={20} className="mr-2" />
                  Zachód słońca
                </button>
              </div>
            </div>

            {/* Przycisk wyszukiwania */}
            <button
              onClick={handleSubmit}
              disabled={searching}
              className="w-full py-4 px-6 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {/* {searching ? (
                <div className="flex items-center justify-center">
                  <span className="animate-pulse">
                    Wyszukiwanie najlepszego miejsca...
                  </span>
                </div>
              ) : (
                "Wyszukaj"
              )}
              ; */}
            </button>
          </div>
        </div>
      </section>

      {/* Sekcja wyników */}
      <section
        ref={resultsSectionRef}
        className="min-h-screen py-16 px-4 md:px-0 flex items-center justify-center"
      >
        {results ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl max-w-3xl w-full mx-auto p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-indigo-800">
              Rekomendacja
            </h2>

            {/* Infografika lotu */}
            <div className="relative h-32 mb-8">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-300"></div>

              {/* Lotnisko wylotu */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-indigo-600 mb-2"></div>
                <div className="text-lg font-bold">
                  {results.departure_airport.code}
                </div>
                <div className="text-xs text-gray-500">
                  {results.departure_airport.city}
                </div>
              </div>

              {/* Lotnisko przylotu */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-indigo-600 mb-2"></div>
                <div className="text-lg font-bold">
                  {results.arrival_airport.code}
                </div>
                <div className="text-xs text-gray-500">
                  {results.arrival_airport.city}
                </div>
              </div>

              {/* Samolot */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white rounded-full p-3 shadow-md">
                  <Plane size={28} className="text-indigo-600" />
                </div>
              </div>

              {/* Wydarzenie słoneczne */}
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 flex flex-col items-center">
                <div className="bg-amber-100 rounded-full p-2 shadow-sm mb-1">
                  {results.recommendation.sun_event === "sunrise" ? (
                    <Sunrise size={20} className="text-amber-600" />
                  ) : (
                    <Sunset size={20} className="text-orange-600" />
                  )}
                </div>
                <div className="text-xs text-gray-600 text-center max-w-xs">
                  Najlepszy moment na obserwację{" "}
                  {results.recommendation.sun_event === "sunrise"
                    ? "wschodu"
                    : "zachodu"}{" "}
                  słońca
                </div>
              </div>
            </div>

            {/* Szczegóły rekomendacji */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-indigo-800">
                  Szczegóły lotu
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Wylot:</span>
                    <span className="font-medium">
                      {new Date(results.departure_time).toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Przylot:</span>
                    <span className="font-medium">
                      {new Date(results.arrival_time).toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Czas lotu:</span>
                    <span className="font-medium">
                      {results.flight_duration.toFixed(1)} godz.
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Kierunek lotu:</span>
                    <span className="font-medium">
                      {results.recommendation.flight_direction}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-amber-800">
                  Rekomendacja miejsca
                </h3>

                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-amber-600">
                    {results.recommendation.seat_code}
                  </span>
                </div>

                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Strona samolotu:</span>
                    <span className="font-medium">
                      {results.recommendation.seat_side}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Najlepszy czas:</span>
                    <span className="font-medium">
                      {new Date(
                        results.recommendation.best_time
                      ).toLocaleTimeString()}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Jakość widoku:</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${results.recommendation.quality_score}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-medium">
                        {results.recommendation.quality_score.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Podpowiedź */}
            <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm">
              <p>
                <strong>Wskazówka:</strong> Dla najlepszego widoku, zajmij
                miejsce {results.recommendation.seat_code} około 15 minut przed
                wskazanym czasem. Zabierz ze sobą aparat fotograficzny, aby
                uchwycić ten niezapomniany moment!
              </p>
            </div>

            {/* Przycisk powrotu do formularza */}
            <div className="mt-8 text-center">
              <button
                onClick={() =>
                  formSectionRef.current.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200 transition-colors"
              >
                Zmień parametry wyszukiwania
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Wypełnij formularz, aby zobaczyć rekomendację najlepszego miejsca
          </div>
        )}
      </section>

      {/* Stopka */}
      <footer className="bg-indigo-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">SunFlight</h2>
              <p className="text-indigo-200">
                Znajdź najlepsze miejsca do obserwacji wschodu i zachodu słońca
                podczas lotu
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-indigo-300 text-sm">
                © 2025 SunFlight. Wszelkie prawa zastrzeżone.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SunFlight;
