"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PieChartData {
  status: string;
  count: number;
}

interface AppointmentPieChartProps {
  data: PieChartData[];
  title?: string;
  description?: string;
}

export function AppointmentPieChart({
  data,
  title = "Appointment Status",
  description = "Distribution of appointment statuses",
}: AppointmentPieChartProps) {
  const chartColors = useMemo(() => {
    // Get computed colors from CSS variables and use primary/destructive for better theme alignment
    if (typeof window === "undefined") {
      return {
        scheduled: "#f97316", // Orange - pending
        inprogress: "#14b8a6", // Teal - active
        completed: "#0ea5e9", // Sky blue - success
        canceled: "#eab308", // Yellow - warning
        primary: "#3b82f6", // Blue - default
      };
    }

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    return {
      scheduled:
        styles.getPropertyValue("--chart-5").trim() || "oklch(0.77 0.19 70)", // Orange variant
      inprogress:
        styles.getPropertyValue("--chart-2").trim() || "oklch(0.6 0.12 185)", // Teal
      completed:
        styles.getPropertyValue("--primary").trim() || "oklch(0.55 0.2 250)", // Primary blue
      canceled:
        styles.getPropertyValue("--chart-4").trim() || "oklch(0.83 0.19 84)", // Lime/yellow
      primary:
        styles.getPropertyValue("--chart-1").trim() || "oklch(0.65 0.22 40)", // Orange
    };
  }, []);

  const background = useMemo(() => {
    if (typeof window === "undefined") return "#ffffff";
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return styles.getPropertyValue("--background").trim();
  }, []);

  const cardBg = useMemo(() => {
    if (typeof window === "undefined") return "#ffffff";
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return styles.getPropertyValue("--card").trim();
  }, []);

  const borderColor = useMemo(() => {
    if (typeof window === "undefined") return "#e5e7eb";
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return styles.getPropertyValue("--border").trim();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    SCHEDULED: "scheduled", // Orange variant - pending appointments
    INPROGRESS: "inprogress", // Teal - active/ongoing
    COMPLETED: "completed", // Primary blue - successfully completed
    CANCELED: "canceled", // Yellow/lime - canceled/warning
    PAID: "completed", // Primary blue - paid (success state)
    UNPAID: "primary", // Orange - unpaid (needs attention)
  };

  // Format data for recharts
  const formattedData = data.map((item) => ({
    name: item.status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: Number(item.count),
    originalStatus: item.status,
  }));

  const getColor = (index: number, status?: string) => {
    if (status && STATUS_COLORS[status]) {
      return chartColors[STATUS_COLORS[status] as keyof typeof chartColors];
    }
    // Fallback to cycling through colors
    const colorKeys = Object.keys(chartColors);
    return chartColors[
      colorKeys[index % colorKeys.length] as keyof typeof chartColors
    ];
  };

  // Handle empty data
  if (formattedData.length === 0 || formattedData.every((d) => d.value === 0)) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent! * 100).toFixed(0)}%`
              }
              outerRadius={80}
              dataKey="value"
              strokeWidth={2}
              stroke={background}
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(index, entry.originalStatus)}
                  style={{
                    filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
