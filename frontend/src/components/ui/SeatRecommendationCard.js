// // components/ui/SeatRecommendationCard.js
// import React from "react";

// const SeatRecommendationCard = ({ recommendation }) => {
//   return (
//     <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
//       <h3 className="text-lg font-semibold mb-4 text-amber-800">
//         Rekomendacja miejsca
//       </h3>

//       <div className="text-center mb-4">
//         <span className="text-4xl font-bold text-amber-600">
//           {recommendation.seat_code}
//         </span>
//       </div>

//       <ul className="space-y-3">
//         <li className="flex justify-between">
//           <span className="text-gray-600">Strona samolotu:</span>
//           <span className="font-medium">{recommendation.seat_side}</span>
//         </li>
//         <li className="flex justify-between">
//           <span className="text-gray-600">Najlepszy czas:</span>
//           <span className="font-medium">
//             {new Date(recommendation.best_time).toLocaleTimeString()}
//           </span>
//         </li>
//         <li className="flex justify-between">
//           <span className="text-gray-600">Jakość widoku:</span>
//           <div className="flex items-center">
//             <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
//               <div
//                 className="h-full bg-amber-500 rounded-full"
//                 style={{
//                   width: `${recommendation.quality_score}%`,
//                 }}
//               ></div>
//             </div>
//             <span className="font-medium">
//               {recommendation.quality_score.toFixed(1)}%
//             </span>
//           </div>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default SeatRecommendationCard;
