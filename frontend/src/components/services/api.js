// services/api.js
/**
 * Service handling API communication
 */
const API_BASE_URL = "http://localhost:8000/api/v1";

export const fetchSeatRecommendation = async (flightData) => {
  try {
    console.log("Sending data to API:", flightData);
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
      console.error("API Error:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(
          errorData.detail || "An error occurred while fetching recommendation"
        );
      } catch (e) {
        throw new Error(
          `API Error (${response.status}): ${errorText || "Unknown error"}`
        );
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    throw error;
  }
};

export const searchAirports = async (query) => {
  try {
    if (!query || query.length < 2) return [];

    console.log(`Searching airports for query: "${query}"`);

    // Add timestamp to URL to avoid caching issues
    const timestamp = new Date().getTime();
    const url = `${API_BASE_URL}/airports/search?query=${encodeURIComponent(
      query
    )}&_=${timestamp}`;

    console.log("Query URL:", url);

    const response = await fetch(url);

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(
          errorData.detail || "An error occurred while searching airports"
        );
      } catch (e) {
        throw new Error(
          `API Error (${response.status}): ${errorText || "Unknown error"}`
        );
      }
    }

    const data = await response.json();
    console.log("Received data:", data);
    return data;
  } catch (error) {
    console.error("Error searching airports:", error);
    throw error;
  }
};

// Function to test API connection
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
    console.error("Error testing API connection:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
