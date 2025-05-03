// // components/ui/FlightRouteVisualizer.jsx
// import React from "react";
// import { Plane, Sunrise, Sunset } from "lucide-react";

// const FlightRouteVisualizer = ({
//   departure,
//   arrival,
//   recommendation,
//   sunEvents,
// }) => {
//   // Format time
//   const formatTime = (dateString) => {
//     if (!dateString) return "";

//     const date = new Date(dateString);
//     return date.toLocaleTimeString(undefined, {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Find the relevant sun event time
//   const relevantEvents =
//     sunEvents?.filter((e) => e.event_type === recommendation.sun_event) || [];
//   const eventTime =
//     relevantEvents.length > 0
//       ? relevantEvents[0].event_time
//       : recommendation.best_time;

//   return (
//     <div className="relative h-32 mb-8">
//       {/* Flight path line */}
//       <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200"></div>

//       {/* Departure airport */}
//       <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
//         <div className="w-4 h-4 rounded-full bg-amber-500 mb-2"></div>
//         <div className="text-lg font-bold">{departure.code}</div>
//         <div className="text-xs text-gray-500">{departure.city}</div>
//       </div>

//       {/* Arrival airport */}
//       <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
//         <div className="w-4 h-4 rounded-full bg-amber-500 mb-2"></div>
//         <div className="text-lg font-bold">{arrival.code}</div>
//         <div className="text-xs text-gray-500">{arrival.city}</div>
//       </div>

//       {/* Plane icon */}
//       <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
//         <div className="bg-white rounded-full p-3 shadow-md">
//           <Plane size={24} className="text-amber-500" />
//         </div>
//       </div>

//       {/* Sun event indicator */}
//       <div className="absolute left-1/2 top-0 transform -translate-x-1/2 flex flex-col items-center">
//         <div className="bg-amber-50 rounded-full p-2.5 shadow-sm mb-1">
//           {recommendation.sun_event === "sunrise" ? (
//             <Sunrise size={20} className="text-amber-500" />
//           ) : (
//             <Sunset size={20} className="text-orange-500" />
//           )}
//         </div>
//         <div className="text-xs text-gray-600 text-center max-w-xs">
//           {recommendation.sun_event === "sunrise"
//             ? `Sunrise at ${formatTime(eventTime)}`
//             : `Sunset at ${formatTime(eventTime)}`}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FlightRouteVisualizer;
