import React from "react";
import {
  Plane,
  Sun,
  Sunrise,
  Sunset,
  ArrowLeft,
  AlertCircle,
  Clock,
  Cloud,
  Droplets,
  Eye,
  Thermometer,
} from "lucide-react";

const ResultsSection = ({ flightData, onSearchAgain }) => {
  if (!flightData) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <Sun className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500">
              Wypełnij formularz wyszukiwania, aby znaleźć idealne miejsce
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Quality indicator class based on score
  const getQualityClass = (score) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-orange-500";
  };

  // Quality label based on score
  const getQualityLabel = (score) => {
    if (score >= 85) return "Doskonała";
    if (score >= 70) return "Dobra";
    return "Umiarkowana";
  };

  // Tłumaczenie kierunku lotu
  const translateDirection = (direction) => {
    const translations = {
      północny: "północny",
      "północno-wschodni": "północno-wschodni",
      wschodni: "wschodni",
      "południowo-wschodni": "południowo-wschodni",
      południowy: "południowy",
      "południowo-zachodni": "południowo-zachodni",
      zachodni: "zachodni",
      "północno-zachodni": "północno-zachodni",
    };

    return translations[direction] || direction;
  };

  // Tłumaczenie strony samolotu
  const translateSeatSide = (side) => {
    if (side === "lewa strona samolotu") return "Lewa strona samolotu";
    if (side === "prawa strona samolotu") return "Prawa strona samolotu";
    return side;
  };

  // Znajdujemy wschody i zachody słońca widoczne podczas lotu
  const visibleSunrises =
    flightData.recommendation?.sun_event_times?.filter(
      (event) =>
        event.event_type === "sunrise" && event.is_visible_during_flight
    ) || [];

  const visibleSunsets =
    flightData.recommendation?.sun_event_times?.filter(
      (event) => event.event_type === "sunset" && event.is_visible_during_flight
    ) || [];

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-16">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header section */}
        <div className="bg-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Szczegóły Lotu</h2>
            <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-white text-sm">
                {flightData.departure_airport.code}
              </span>
              <Plane
                size={12}
                className="mx-2 text-white transform rotate-90"
              />
              <span className="text-white text-sm">
                {flightData.arrival_airport.code}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Flight info */}
          <div className="mb-6 flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
              <div className="text-gray-700">
                <span className="font-medium">
                  {formatTime(flightData.departure_time)}
                </span>
                <span className="mx-2 text-gray-400">—</span>
                <span className="font-medium">
                  {formatTime(flightData.arrival_time)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(flightData.departure_time)}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {flightData.flight_duration.toFixed(1)} godzin
            </div>
          </div>

          {/* Sun events section */}
          {(visibleSunrises.length > 0 || visibleSunsets.length > 0) && (
            <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
              <h3 className="text-lg font-medium text-amber-800 mb-3">
                Wydarzenia słoneczne podczas lotu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleSunrises.length > 0 && (
                  <div className="flex items-center">
                    <div className="p-3 bg-amber-100 rounded-lg mr-3">
                      <Sunrise className="text-amber-600" size={24} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        Wschód słońca
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {formatTime(visibleSunrises[0].event_time)}
                      </div>
                    </div>
                  </div>
                )}

                {visibleSunsets.length > 0 && (
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg mr-3">
                      <Sunset className="text-orange-600" size={24} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        Zachód słońca
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {formatTime(visibleSunsets[0].event_time)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Route visualization */}
          <div className="relative h-32 mb-8">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-300"></div>

            {/* Departure airport */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-indigo-600 mb-2"></div>
              <div className="text-lg font-bold">
                {flightData.departure_airport.code}
              </div>
              <div className="text-xs text-gray-500">
                {flightData.departure_airport.city}
              </div>
            </div>

            {/* Arrival airport */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-indigo-600 mb-2"></div>
              <div className="text-lg font-bold">
                {flightData.arrival_airport.code}
              </div>
              <div className="text-xs text-gray-500">
                {flightData.arrival_airport.city}
              </div>
            </div>

            {/* Plane */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-full p-3 shadow-md">
                <Plane size={28} className="text-indigo-600" />
              </div>
            </div>

            {/* Sun event */}
            {flightData.sun_events_visible && (
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 flex flex-col items-center">
                <div className="bg-amber-100 rounded-full p-2 shadow-sm mb-1">
                  {flightData.recommendation.sun_event === "sunrise" ? (
                    <Sunrise size={20} className="text-amber-600" />
                  ) : (
                    <Sunset size={20} className="text-orange-600" />
                  )}
                </div>
                <div className="text-xs text-gray-600 text-center max-w-xs">
                  {flightData.recommendation.sun_event === "sunrise"
                    ? `Wschód słońca o ${formatTime(
                        visibleSunrises[0]?.event_time ||
                          flightData.recommendation.best_time
                      )}`
                    : `Zachód słońca o ${formatTime(
                        visibleSunsets[0]?.event_time ||
                          flightData.recommendation.best_time
                      )}`}
                </div>
              </div>
            )}
          </div>

          {/* Recommendation section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-medium text-gray-800">
                Najlepsze miejsce
              </h3>
              <div className="flex items-center text-sm">
                {flightData.recommendation.sun_event === "sunrise" ? (
                  <Sunrise size={16} className="text-amber-500 mr-1.5" />
                ) : (
                  <Sunset size={16} className="text-orange-500 mr-1.5" />
                )}
                <span className="text-gray-600">
                  {flightData.recommendation.sun_event === "sunrise"
                    ? "Wschód słońca"
                    : "Zachód słońca"}{" "}
                  {formatTime(flightData.recommendation.best_time)}
                </span>
              </div>
            </div>

            <div className="flex items-center p-5 bg-gray-50 rounded-lg mb-6">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-5">
                <span className="text-xl font-bold">
                  {flightData.recommendation.seat_code}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-1">
                  {translateSeatSide(flightData.recommendation.seat_side)}
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Plane size={14} className="mr-1.5" />
                  Kierunek lotu:{" "}
                  {translateDirection(
                    flightData.recommendation.flight_direction
                  )}
                </div>
              </div>
            </div>

            {/* Weather data */}
            {flightData.recommendation.weather_data && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Cloud size={16} className="mr-2 text-blue-500" />
                  Warunki pogodowe
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="flex flex-col items-center p-2 bg-white rounded">
                    <Cloud size={16} className="text-blue-500 mb-1" />
                    <span className="text-xs text-gray-500">Zachmurzenie</span>
                    <span className="text-sm font-medium">
                      {flightData.recommendation.weather_data.clouds_percent}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white rounded">
                    <Droplets size={16} className="text-blue-500 mb-1" />
                    <span className="text-xs text-gray-500">Opady</span>
                    <span className="text-sm font-medium">
                      {
                        flightData.recommendation.weather_data
                          .precipitation_percent
                      }
                      %
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white rounded">
                    <Eye size={16} className="text-blue-500 mb-1" />
                    <span className="text-xs text-gray-500">Widoczność</span>
                    <span className="text-sm font-medium">
                      {flightData.recommendation.weather_data.visibility_km} km
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white rounded">
                    <Thermometer size={16} className="text-blue-500 mb-1" />
                    <span className="text-xs text-gray-500">Temperatura</span>
                    <span className="text-sm font-medium">
                      {
                        flightData.recommendation.weather_data
                          .temperature_celsius
                      }
                      °C
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Opis:</strong>{" "}
                  {flightData.recommendation.weather_data.description}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <strong>Warunki do obserwacji:</strong>{" "}
                  {flightData.recommendation.weather_data.viewing_conditions}
                </div>
              </div>
            )}

            {/* Quality score */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Jakość widoku</span>
                <div className="flex items-center">
                  <span className="font-medium text-gray-800 mr-2">
                    {flightData.recommendation.quality_score.toFixed(0)}%
                  </span>
                  {flightData.recommendation.quality_score >= 70 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        flightData.recommendation.quality_score >= 85
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {getQualityLabel(flightData.recommendation.quality_score)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getQualityClass(
                    flightData.recommendation.quality_score
                  )} rounded-full`}
                  style={{
                    width: `${flightData.recommendation.quality_score}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Additional notes */}
            {flightData.recommendation.recommendation_notes && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start border border-blue-100">
                <AlertCircle
                  size={16}
                  className="text-blue-500 mr-3 mt-0.5 flex-shrink-0"
                />
                <div className="text-sm text-gray-700">
                  <p>{flightData.recommendation.recommendation_notes}</p>
                </div>
              </div>
            )}

            {/* No sun events visible warning */}
            {!flightData.sun_events_visible && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 flex items-start border border-yellow-200">
                <AlertCircle
                  size={16}
                  className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                />
                <div className="text-sm text-gray-700">
                  <p>
                    {flightData.recommendation.sun_event === "sunrise"
                      ? "Wschód słońca nie będzie widoczny podczas tego lotu."
                      : "Zachód słońca nie będzie widoczny podczas tego lotu."}
                    Rozważ wybór innej godziny lotu dla lepszych widoków.
                  </p>
                </div>
              </div>
            )}

            {/* Tip */}
            <div className="bg-indigo-50 rounded-lg p-4 mb-6 flex items-start border border-indigo-100">
              <AlertCircle
                size={16}
                className="text-indigo-500 mr-3 mt-0.5 flex-shrink-0"
              />
              <div className="text-sm text-gray-700">
                <p>
                  Zajmij miejsce {flightData.recommendation.seat_code} około 15
                  minut przed wskazanym czasem, aby cieszyć się najlepszym
                  widokiem. Nie zapomnij zabrać aparatu lub telefonu, aby
                  uchwycić ten moment!
                </p>
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={onSearchAgain}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Zmień parametry wyszukiwania
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
