"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TrendingUp, Users, CreditCard, BookOpen } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  LabelList,
  Label,
} from "recharts";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-toastify";
import Loader from "./loader";
import axios from "axios";

const chartConfig = {
  books: { label: "Books", color: "#2563eb" },
  users: { label: "Users", color: "#16a34a" },
  borrowed: { label: "Borrowed", color: "#9333ea" },
  basic: { label: "Basic Plan", color: "#64748b" },
  standard: { label: "Standard Plan", color: "#0ea5e9" },
  premium: { label: "Premium Plan", color: "#f59e0b" },
  active: { label: "Active", color: "#10b981" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
};

export default function BookLibraryOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAdmin, accessToken } = useAuth();

  const fetchOverview = useCallback(async () => {
    if (!accessToken || !isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/overview`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOverview(res.data || {});
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load overview data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Safe defaults for all data
  const stats = overview?.stats || { totalBooks: 0, activeUsers: 0, totalSubscriptions: 0, revenueMonth: 0 };
  const booksPerMonth = Array.isArray(overview?.booksPerMonth) ? overview.booksPerMonth : [];
  const categoryData = Array.isArray(overview?.categoryData) ? overview.categoryData : [];
  const topBorrowedBooks = Array.isArray(overview?.topBorrowedBooks) ? overview.topBorrowedBooks : [];
  const subscriptionPlans = Array.isArray(overview?.subscriptionPlans) ? overview.subscriptionPlans : [];
  const subscriptionHistory = Array.isArray(overview?.subscriptionHistory) ? overview.subscriptionHistory : [];

  const totalSubs = useMemo(() => subscriptionPlans.reduce((acc, plan) => acc + (plan.count || 0), 0), [subscriptionPlans]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-600 text-lg font-semibold mb-2">{error}</p>;

  return (
    <div className="flex flex-col gap-6 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library Dashboard</h1>
          <p className="text-muted-foreground">Real-time inventory, user, and subscription insights.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-muted-foreground">Current Period</p>
          <p className="text-lg font-bold">June 2024</p>
        </div>
      </div>

      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBooks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue (Jun)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.revenueMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* INVENTORY & CATEGORIES */}
      <h2 className="text-xl font-semibold mt-4">Inventory Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Growth</CardTitle>
            <CardDescription>Books added to the library over the last months</CardDescription>
          </CardHeader>
          <CardContent>
            {booksPerMonth.length > 0 ? (
              <ChartContainer config={chartConfig || {}} className="min-h-[250px] w-full">
                <LineChart data={booksPerMonth} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} width={30} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line dataKey="books" type="monotone" stroke={chartConfig.books.color} strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground">No book data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
            <CardDescription>Current stock breakdown</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {categoryData.length > 0 ? (
              <ChartContainer config={chartConfig || {}} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill || "#8884d8"} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2" />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground">No category data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MEMBERSHIP & SUBSCRIPTIONS */}
      <h2 className="text-xl font-semibold mt-4">Membership Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Most popular membership tiers</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {subscriptionPlans.length > 0 ? (
              <ChartContainer config={chartConfig || {}} className="mx-auto aspect-square max-h-[250px]">
                <RadialBarChart data={subscriptionPlans} innerRadius={30} outerRadius={110}>
                  <RadialBar dataKey="count" background>
                    <LabelList position="insideStart" dataKey="plan" className="fill-white capitalize mix-blend-luminosity" fontSize={11} />
                  </RadialBar>
                  <Pie data={[{ name: "total", value: 1 }]} dataKey="value" outerRadius={0}>
                    <Label
                      content={({ viewBox }) =>
                        viewBox && "cx" in viewBox && "cy" in viewBox ? (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-4xl font-bold">{totalSubs.toLocaleString()}</tspan>
                            <tspan x={viewBox.cx} y={viewBox.cy + 24} className="fill-muted-foreground text-xs">Total Subs</tspan>
                          </text>
                        ) : null
                      }
                    />
                  </Pie>
                </RadialBarChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground">No subscription plan data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Retention</CardTitle>
            <CardDescription>Active vs Cancelled accounts per month</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionHistory.length > 0 ? (
              <ChartContainer config={chartConfig || {}} className="min-h-[250px] w-full">
                <BarChart data={subscriptionHistory}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="active" stackId="a" fill={chartConfig.active.color} radius={[0, 0, 4, 4]} />
                  <Bar dataKey="cancelled" stackId="a" fill={chartConfig.cancelled.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground">No subscription history available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BOOK PERFORMANCE */}
      <h2 className="text-xl font-semibold mt-4">Book Performance</h2>
      <Card>
        <CardHeader>
          <CardTitle>Top Borrowed Books</CardTitle>
          <CardDescription>Most popular titles this month</CardDescription>
        </CardHeader>
        <CardContent>
          {topBorrowedBooks.length > 0 ? (
            <ChartContainer config={chartConfig || {}} className="min-h-[200px] w-full">
              <BarChart data={topBorrowedBooks} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="count" layout="vertical" fill={chartConfig.borrowed.color} radius={5} barSize={30}>
                  <LabelList dataKey="count" position="right" className="fill-foreground" fontSize={12} />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground">No top borrowed books data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}






// "use client";

// import * as React from "react";
// import { TrendingUp, Users, CreditCard, BookOpen } from "lucide-react"; // Added icons for visual flair
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardDescription,
//   CardFooter,
// } from "@/components/ui/card";

// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   ChartLegend,
//   ChartLegendContent,
// } from "@/components/ui/chart";

// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   RadialBarChart,
//   RadialBar,
//   Label,
//   LabelList,
// } from "recharts";
// import { useAuth } from "@/contexts/authContext";
// import { toast } from "react-toastify";
// import Loader from "./loader";
// import axios from "axios";
// import { useState } from "react";
// import { useCallback } from "react";
// import { useEffect } from "react";

// // ------------------
// // DATA & CONFIG
// // ------------------

// const chartConfig = {
//   // Existing
//   books: { label: "Books", color: "#2563eb" },
//   users: { label: "Users", color: "#16a34a" },
//   borrowed: { label: "Borrowed", color: "#9333ea" },

//   // Subscription Tiers
//   basic: { label: "Basic Plan", color: "#64748b" }, // Slate
//   standard: { label: "Standard Plan", color: "#0ea5e9" }, // Sky Blue
//   premium: { label: "Premium Plan", color: "#f59e0b" }, // Amber

//   // Subscription Status
//   active: { label: "Active", color: "#10b981" }, // Emerald
//   cancelled: { label: "Cancelled", color: "#ef4444" }, // Red
// };

// // --- NEW DATA: Subscription Plans ---
// const subscriptionPlans = [
//   { plan: "basic", count: 450, fill: "var(--color-basic)" },
//   { plan: "standard", count: 820, fill: "var(--color-standard)" },
//   { plan: "premium", count: 310, fill: "var(--color-premium)" },
// ];

// // --- NEW DATA: Subscription Trends ---
// const subscriptionHistory = [
//   { month: "Jan", active: 1200, cancelled: 40 },
//   { month: "Feb", active: 1350, cancelled: 35 },
//   { month: "Mar", active: 1400, cancelled: 60 },
//   { month: "Apr", active: 1580, cancelled: 30 },
//   { month: "May", active: 1620, cancelled: 45 },
//   { month: "Jun", active: 1800, cancelled: 25 },
// ];

// // Existing Data...
// const booksPerMonth = [
//   { month: "Jan", books: 20 },
//   { month: "Feb", books: 32 },
//   { month: "Mar", books: 18 },
//   { month: "Apr", books: 40 },
//   { month: "May", books: 55 },
//   { month: "Jun", books: 48 },
// ];

// const categoryData = [
//   { name: "Fiction", value: 350, fill: "#e11d48" },
//   { name: "Mystery", value: 120, fill: "#ea580c" },
//   { name: "Fantasy", value: 210, fill: "#ca8a04" },
//   { name: "Science", value: 90, fill: "#0d9488" },
// ];

// const topBorrowedBooks = [
//   { name: "Harry Potter", count: 120 },
//   { name: "Sherlock", count: 98 },
//   { name: "The Hobbit", count: 85 },
//   { name: "Great Gatsby", count: 65 },
//   { name: "1984", count: 45 },
// ];

// export default function BookLibraryOverview() {
//   const [overview, setOverview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { isAdmin, accessToken } = useAuth();
//   const fetchOverview = useCallback(async () => {
//     if (!accessToken || !isAdmin) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/overview`,

//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       const data = res.data;
//       console.log(data);

//       setOverview(data.payments || []);
//     } catch (err) {
//       const message =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         "Failed to load payments";
//       setError(message);
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   }, [accessToken, isAdmin]);

//   useEffect(() => {
//     fetchOverview();
//   }, [fetchOverview]);
//   // Calculate total subscriptions for the Radial Chart Center Label
//   const totalSubs = React.useMemo(() => {
//     return subscriptionPlans.reduce((acc, curr) => acc + curr.count, 0);
//   }, []);
//   if (loading) return <Loader />;
//   if (error)
//     return <p className="text-red-600 text-lg font-semibold mb-2">{error}</p>;

//   return (
//     <div className="flex flex-col gap-6 bg-muted/10 min-h-screen">
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">
//             Library Dashboard
//           </h1>
//           <p className="text-muted-foreground">
//             Real-time inventory, user, and subscription insights.
//           </p>
//         </div>
//         <div className="text-right hidden sm:block">
//           <p className="text-sm font-medium text-muted-foreground">
//             Current Period
//           </p>
//           <p className="text-lg font-bold">June 2024</p>
//         </div>
//       </div>

//       {/* TOP STATS ROW */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Books</CardTitle>
//             <BookOpen className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">1,200</div>
//             <p className="text-xs text-muted-foreground">
//               +12% from last month
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Active Users</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">1,800</div>
//             <p className="text-xs text-muted-foreground">+85 since last hour</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Subscriptions
//             </CardTitle>
//             <CreditCard className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">1,580</div>
//             <p className="text-xs text-muted-foreground">+19% growth</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Revenue (Jun)</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">$12,450</div>
//             <p className="text-xs text-muted-foreground">+4% from last month</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* --- SECTION 1: INVENTORY & CATEGORIES --- */}
//       <h2 className="text-xl font-semibold mt-4">Inventory Analysis</h2>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* LINE CHART: Books Added (Spans 2 columns) */}
//         <Card className="md:col-span-2">
//           <CardHeader>
//             <CardTitle>Inventory Growth</CardTitle>
//             <CardDescription>
//               Books added to the library over the last 6 months
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer
//               config={chartConfig}
//               className="min-h-[250px] w-full"
//             >
//               <LineChart data={booksPerMonth} margin={{ left: 12, right: 12 }}>
//                 <CartesianGrid vertical={false} />
//                 <XAxis
//                   dataKey="month"
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={8}
//                 />
//                 <YAxis
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={8}
//                   width={30}
//                 />
//                 <ChartTooltip
//                   cursor={false}
//                   content={<ChartTooltipContent />}
//                 />
//                 <Line
//                   dataKey="books"
//                   type="monotone"
//                   stroke="var(--color-books)"
//                   strokeWidth={2}
//                   dot={false}
//                 />
//               </LineChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>

//         {/* PIE CHART: Categories (1 column) */}
//         <Card className="flex flex-col">
//           <CardHeader>
//             <CardTitle>Genre Distribution</CardTitle>
//             <CardDescription>Current stock breakdown</CardDescription>
//           </CardHeader>
//           <CardContent className="flex-1 pb-0">
//             <ChartContainer
//               config={chartConfig}
//               className="mx-auto aspect-square max-h-[250px]"
//             >
//               <PieChart>
//                 <ChartTooltip
//                   cursor={false}
//                   content={<ChartTooltipContent hideLabel />}
//                 />
//                 <Pie
//                   data={categoryData}
//                   dataKey="value"
//                   nameKey="name"
//                   innerRadius={60}
//                   strokeWidth={5}
//                 >
//                   {categoryData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.fill} />
//                   ))}
//                 </Pie>
//                 <ChartLegend
//                   content={<ChartLegendContent nameKey="name" />}
//                   className="-translate-y-2 flex-wrap gap-2"
//                 />
//               </PieChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* --- SECTION 2: MEMBERSHIP & SUBSCRIPTIONS --- */}
//       <h2 className="text-xl font-semibold mt-4">Membership Insights</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* RADIAL CHART: Subscription Plans */}
//         <Card className="flex flex-col">
//           <CardHeader className="items-center pb-0">
//             <CardTitle>Subscription Plans</CardTitle>
//             <CardDescription>Most popular membership tiers</CardDescription>
//           </CardHeader>
//           <CardContent className="flex-1 pb-0">
//             <ChartContainer
//               config={chartConfig}
//               className="mx-auto aspect-square max-h-[250px]"
//             >
//               <RadialBarChart
//                 data={subscriptionPlans}
//                 innerRadius={30}
//                 outerRadius={110}
//               >
//                 <ChartTooltip
//                   cursor={false}
//                   content={<ChartTooltipContent hideLabel nameKey="plan" />}
//                 />
//                 <RadialBar dataKey="count" background>
//                   <LabelList
//                     position="insideStart"
//                     dataKey="plan"
//                     className="fill-white capitalize mix-blend-luminosity"
//                     fontSize={11}
//                   />
//                 </RadialBar>
//                 <Pie
//                   data={[{ name: "total", value: 1 }]} // Dummy data for center text
//                   dataKey="value"
//                   outerRadius={0}
//                 >
//                   <Label
//                     content={({ viewBox }) => {
//                       if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                         return (
//                           <text
//                             x={viewBox.cx}
//                             y={viewBox.cy}
//                             textAnchor="middle"
//                             dominantBaseline="middle"
//                           >
//                             <tspan
//                               x={viewBox.cx}
//                               y={viewBox.cy}
//                               className="fill-foreground text-4xl font-bold"
//                             >
//                               {totalSubs.toLocaleString()}
//                             </tspan>
//                             <tspan
//                               x={viewBox.cx}
//                               y={(viewBox.cy || 0) + 24}
//                               className="fill-muted-foreground text-xs"
//                             >
//                               Total Subs
//                             </tspan>
//                           </text>
//                         );
//                       }
//                     }}
//                   />
//                 </Pie>
//               </RadialBarChart>
//             </ChartContainer>
//           </CardContent>
//           <CardFooter className="flex-col gap-2 text-sm">
//             <div className="flex items-center gap-2 font-medium leading-none">
//               Standard Plan is trending up by 5.2%{" "}
//               <TrendingUp className="h-4 w-4" />
//             </div>
//             <div className="leading-none text-muted-foreground">
//               Showing total active subscriptions per tier
//             </div>
//           </CardFooter>
//         </Card>

//         {/* STACKED BAR CHART: Active vs Cancelled */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Subscription Retention</CardTitle>
//             <CardDescription>
//               Active vs Cancelled accounts per month
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer
//               config={chartConfig}
//               className="min-h-[250px] w-full"
//             >
//               <BarChart data={subscriptionHistory}>
//                 <CartesianGrid vertical={false} />
//                 <XAxis
//                   dataKey="month"
//                   tickLine={false}
//                   tickMargin={10}
//                   axisLine={false}
//                 />
//                 <ChartTooltip
//                   content={<ChartTooltipContent indicator="dashed" />}
//                 />
//                 <ChartLegend content={<ChartLegendContent />} />
//                 <Bar
//                   dataKey="active"
//                   fill="var(--color-active)"
//                   radius={[0, 0, 4, 4]}
//                   stackId="a"
//                 />
//                 <Bar
//                   dataKey="cancelled"
//                   fill="var(--color-cancelled)"
//                   radius={[4, 4, 0, 0]}
//                   stackId="a"
//                 />
//               </BarChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* --- SECTION 3: BOOK PERFORMANCE --- */}
//       <h2 className="text-xl font-semibold mt-4">Book Performance</h2>
//       <Card>
//         <CardHeader>
//           <CardTitle>Top Borrowed Books</CardTitle>
//           <CardDescription>Most popular titles this month</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
//             <BarChart
//               data={topBorrowedBooks}
//               layout="vertical"
//               margin={{ left: 0, right: 20 }}
//             >
//               <CartesianGrid horizontal={false} />
//               <YAxis
//                 dataKey="name"
//                 type="category"
//                 tickLine={false}
//                 tickMargin={10}
//                 axisLine={false}
//                 width={120}
//               />
//               <XAxis dataKey="count" type="number" hide />
//               <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
//               <Bar
//                 dataKey="count"
//                 layout="vertical"
//                 fill="var(--color-borrowed)"
//                 radius={5}
//                 barSize={30}
//               >
//                 <LabelList
//                   dataKey="count"
//                   position="right"
//                   className="fill-foreground"
//                   fontSize={12}
//                 />
//               </Bar>
//             </BarChart>
//           </ChartContainer>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
