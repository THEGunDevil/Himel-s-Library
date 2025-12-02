"use client";

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
  if (!plans || !Array.isArray(plans) || plans.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No subscription plans available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => {
        // Handle empty or missing features
        const features = plan.features && typeof plan.features === "object" ? plan.features : {};
        const hasFeatures = Object.keys(features).length > 0;

        return (
          <Card
            key={plan.id}
            className="flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            <CardHeader>
              <CardTitle className="text-lg uppercase tracking-wider">
                {plan.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {plan.duration_days === 365 ? "Yearly Plan" : "Monthly Plan"}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <div className="flex items-baseline text-gray-900">
                <span className="text-4xl font-extrabold tracking-tight">
                  ${Math.round(plan.price)}
                </span>
                <span className="ml-1 text-xl font-medium text-muted-foreground">
                  /{plan.duration_days === 365 ? "yr" : "mo"}
                </span>
              </div>

              <CardDescription className="mt-4 text-base">
                {plan.description || "Unlock full access to our library."}
              </CardDescription>

              {hasFeatures ? (
                <ul className="mt-6 space-y-2">
                  {Object.entries(features).map(([key, value]) => {
                    const featureName = key
                      .replace(/_/g, " ")
                      .split(" ")
                      .map((w) => w[0].toUpperCase() + w.slice(1))
                      .join(" ");

                    let display = featureName;
                    if (typeof value !== "boolean") {
                      display += `: ${value}`;
                    }

                    const isEnabled =
                      typeof value === "boolean" ? value : true;
                    const iconClass = isEnabled
                      ? "text-green-500"
                      : "text-red-500";
                    const Icon = isEnabled ? Check : X;

                    return (
                      <li
                        key={key}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <Icon className={`h-4 w-4 ${iconClass} mr-2 flex-shrink-0`} />
                        <span>{display}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    ✓ Full library access included
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => onSelectPlan(plan.id)}
                className="w-full"
                disabled={loadingPlanID === plan.id}
              >
                {loadingPlanID === plan.id ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Processing...
                  </>
                ) : (
                  `Choose ${plan.name}`
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default SubscriptionPlans;