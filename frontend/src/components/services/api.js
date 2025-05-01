// services/api.js
/**
 * Serwis obsługujący komunikację z API
 */
const API_BASE_URL = "http://localhost:8000/api/v1";

export const fetchSeatRecommendation = async (flightData) => {
  try {
    console.log("Wysyłanie danych do API:", flightData);
    const response = await fetch(`${API_BASE_URL}/calculate-seat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departure_airport: flightData.departureAirport,
        arrival_airport: flightData.arrivalAirport,
        departure_date: flightData.departureDate,
        departure_time: flightData.departureTime,
        sun_preference: flightData.sunPreference,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Błąd API:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(
          errorData.detail || "Wystąpił błąd podczas pobierania rekomendacji"
        );
      } catch (e) {
        throw new Error(
          `Błąd API (${response.status}): ${errorText || "Nieznany błąd"}`
        );
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Błąd podczas pobierania rekomendacji:", error);
    throw error;
  }
};

export const searchAirports = async (query) => {
  try {
    if (!query || query.length < 2) return [];

    console.log(`Wyszukiwanie lotnisk dla zapytania: "${query}"`);

    // Dodajemy timestamp do URL, aby uniknąć problemów z cache
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URL}/airports/search?query=${encodeURIComponent(
      query
    )}&_=${timestamp}`;

    console.log("URL zapytania:", url);

    const response = await fetch(url);

    // Logujemy status odpowiedzi
    console.log("Status odpowiedzi:", response.status);

    // Jeśli odpowiedź nie jest ok, logujemy szczegóły i rzucamy wyjątek
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Błąd API:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(
          errorData.detail || "Wystąpił błąd podczas wyszukiwania lotnisk"
        );
      } catch (e) {
        throw new Error(
          `Błąd API (${response.status}): ${errorText || "Nieznany błąd"}`
        );
      }
    }

    // Logujemy pozytywną odpowiedź
    const data = await response.json();
    console.log("Otrzymane dane:", data);
    return data;
  } catch (error) {
    console.error("Błąd podczas wyszukiwania lotnisk:", error);
    throw error;
  }
};

// Dodajmy dodatkową funkcję do testowania połączenia z API
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("Błąd testowania połączenia z API:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
