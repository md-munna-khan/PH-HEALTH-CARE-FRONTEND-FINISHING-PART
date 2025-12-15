/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  iconName,
  description,
  trend,
  className,
  iconClassName,
}: StatsCardProps) {
  // Dynamically get the icon component
  const Icon = (Icons as any)[iconName] || Icons.HelpCircle;

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-300 hover:scale-105",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center transition-colors",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
