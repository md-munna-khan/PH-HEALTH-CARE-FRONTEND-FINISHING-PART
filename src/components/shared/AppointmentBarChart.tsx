"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartData {
  month: Date | string;
  count: number;
}

interface AppointmentBarChartProps {
  data: BarChartData[];
}

export function AppointmentBarChart({ data }: AppointmentBarChartProps) {
  const colors = useMemo(() => {
    // Get computed colors from CSS variables
    if (typeof window === "undefined") {
      return {
        primary: "#3b82f6",
        muted: "#9ca3af",
        border: "#e5e7eb",
        accent: "#f3f4f6",
      };
    }

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    return {
      primary: styles.getPropertyValue("--primary").trim(),
      muted: styles.getPropertyValue("--muted-foreground").trim(),
      border: styles.getPropertyValue("--border").trim(),
      accent: styles.getPropertyValue("--accent").trim(),
    };
  }, []);

  // Format data for recharts
  const formattedData = data.map((item) => ({
    month:
      typeof item.month === "string"
        ? format(new Date(item.month), "MMM yyyy")
        : format(item.month, "MMM yyyy"),
    appointments: Number(item.count),
  }));

  // Handle empty data
  if (formattedData.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Appointment Trends</CardTitle>
          <CardDescription>Monthly appointment statistics</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Appointment Trends</CardTitle>
        <CardDescription>Monthly appointment statistics</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={formattedData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.border}
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              stroke={colors.muted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={colors.muted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: colors.primary, opacity: 0.1 }}
              contentStyle={{
                backgroundColor: colors.accent,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{
                color: colors.muted,
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: "4px",
                color: colors.muted,
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <Bar
              dataKey="appointments"
              fill={colors.primary}
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
