// services/api.js
/**
 * Serwis obsługujący komunikację z API
 */
const API_BASE_URL = "https://api.sunflight.example";

export const fetchSeatRecommendation = async (flightData) => {
  try {
    // W rzeczywistej aplikacji wykonywalibyśmy tutaj faktyczne zapytanie API
    // return await fetch(`${API_BASE_URL}/calculate-seat`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(flightData)
    // }).then(res => res.json());

    // Symulacja odpowiedzi API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          departure_airport: {
            code: flightData.departure_airport,
            name: "Warsaw Chopin Airport",
            city: "Warsaw",
            country: "Poland",
            latitude: 52.1657,
            longitude: 20.9671,
            timezone: "Europe/Warsaw",
          },
          arrival_airport: {
            code: flightData.arrival_airport,
            name: "Charles de Gaulle Airport",
            city: "Paris",
            country: "France",
            latitude: 49.0097,
            longitude: 2.5479,
            timezone: "Europe/Paris",
          },
          departure_time: `${flightData.departure_date}T${flightData.departure_time}:00`,
          arrival_time: `${flightData.departure_date}T${
            parseInt(flightData.departure_time.split(":")[0]) + 2
          }:${flightData.departure_time.split(":")[1]}:00`,
          flight_duration: 2.3,
          recommendation: {
            seat_code: "A15",
            seat_side: "lewa strona samolotu",
            best_time: `${flightData.departure_date}T${
              parseInt(flightData.departure_time.split(":")[0]) + 1
            }:${flightData.departure_time.split(":")[1]}:00`,
            sun_event: flightData.sun_preference,
            quality_score: 87.5,
            flight_direction: "zachodni",
          },
        });
      }, 1500);
    });
  } catch (error) {
    console.error("Błąd podczas pobierania rekomendacji:", error);
    throw error;
  }
};

export const searchAirports = async (query) => {
  try {
    // W rzeczywistej aplikacji wykonywalibyśmy tutaj faktyczne zapytanie API
    // return await fetch(`${API_BASE_URL}/airports/search?query=${encodeURIComponent(query)}`).then(res => res.json());

    // Symulacja odpowiedzi API
    return new Promise((resolve) => {
      setTimeout(() => {
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

        resolve(filtered);
      }, 300);
    });
  } catch (error) {
    console.error("Błąd podczas wyszukiwania lotnisk:", error);
    throw error;
  }
};
