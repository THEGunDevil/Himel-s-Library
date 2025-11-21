import { Loader } from "lucide-react";
import React from "react";

const SubscriptionPlans = ({ plans, onSelectPlan, loadingPlanID }) => {
  if (!plans || !Array.isArray(plans)) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="flex flex-col justify-between border border-gray-100 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 relative overflow-hidden"
        >
          <div>
            <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
              {plan.name}
            </h4>
            <div className="mt-4 flex items-baseline text-gray-900">
              <span className="text-4xl font-extrabold tracking-tight">
                ${plan.price}
              </span>
              <span className="ml-1 text-xl font-medium text-gray-500">
                /{plan.duration_unit || "mo"}
              </span>
            </div>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed">
              {plan.description || "Unlock full access to our library."}
            </p>
          </div>

          <button
            onClick={() => onSelectPlan(plan.id)}
            className="mt-8 w-full block text-center bg-blue-600 border border-transparent rounded-lg py-3 px-4 font-semibold text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
          >
            {loadingPlanID === plan.id  ? (
                <Loader className="animate-spin mx-auto" />
            ) : (
              `Choose ${plan.name}`
            )}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionPlans;

// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// export default function SubscriptionPlans({ plans }) {
//   if (!Array.isArray(plans)) plans = []; // <-- ensure it's always an array

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
//       {plans.map((plan) => {
//         const features =
//           typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features;

//         return (
//           <Card key={plan.id} className="rounded-2xl shadow p-4">
//             <CardContent className="space-y-4">
//               <h2 className="text-xl font-bold">{plan.name}</h2>
//               <p className="text-lg font-semibold">৳{plan.price}</p>
//               <p className="text-sm opacity-80">Duration: {plan.duration_days} days</p>
//               <p className="text-sm opacity-90">{plan.description}</p>

//               <div className="mt-2">
//                 <h3 className="font-semibold mb-1">Features:</h3>
//                 <ul className="list-disc list-inside text-sm space-y-1">
//                   {Object.entries(features).map(([key, value]) => (
//                     <li key={key}>
//                       <span className="font-medium">{key.replace(/_/g, " ")}: </span>
//                       {String(value)}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <Button className="w-full mt-4 rounded-xl py-2 text-base">Choose Plan</Button>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }
