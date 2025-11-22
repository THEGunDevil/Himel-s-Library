import { Check, Loader, X } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SubscriptionPlans = ({ plans, onSelectPlan, loadingPlanID }) => {
  if (!plans || !Array.isArray(plans)) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className="flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <CardHeader>
            <CardTitle className="text-lg uppercase tracking-wider">
              {plan.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex items-baseline text-gray-900">
              <span className="text-4xl font-extrabold tracking-tight">
                ${plan.price}
              </span>
              <span className="ml-1 text-xl font-medium text-muted-foreground">
                /{plan.duration_days === 365 ? "yr" : "mo"}
              </span>
            </div>
            <CardDescription className="mt-4">
              {plan.description || "Unlock full access to our library."}
            </CardDescription>
            <ul className="mt-6 space-y-2">
              {Object.entries(plan.features).map(([key, value]) => {
                const featureName = key
                  .replace(/_/g, " ")
                  .split(" ")
                  .map((w) => w[0].toUpperCase() + w.slice(1))
                  .join(" ");
                let display = featureName;
                if (typeof value !== "boolean") display += `: ${value}`;
                const iconClass =
                  typeof value === "boolean"
                    ? value
                      ? "text-green-500"
                      : "text-red-500"
                    : "text-green-500";
                const Icon =
                  typeof value === "boolean" ? (value ? Check : X) : Check;
                return (
                  <li key={key} className="flex items-center text-sm text-muted-foreground">
                    <Icon className={`h-4 w-4 ${iconClass} mr-2`} />
                    {display}
                  </li>
                );
              })}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => onSelectPlan(plan.id)}
              className="w-full"
              disabled={loadingPlanID === plan.id}
            >
              {loadingPlanID === plan.id ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                `Choose ${plan.name}`
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionPlans;