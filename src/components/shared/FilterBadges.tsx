"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface FilterBadge {
  paramName: string;
  value: string;
  label: string;
}

interface FilterBadgesProps {
  /**
   * Array of filter configurations to display as badges
   *
   * @example
   * [
   *   { paramName: 'specialties', value: 'cardiology', label: 'Cardiology' },
   *   { paramName: 'gender', value: 'MALE', label: 'Male' }
   * ]
   */
  badges: FilterBadge[];

  /**
   * Callback when a badge is removed
   */
  onRemove?: (paramName: string, value: string) => void;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Minimum height to prevent layout shift
   */
  minHeight?: string;
}

/**
 * Reusable Filter Badges Component
 *
 * Displays active filters as removable badges.
 * Automatically removes the filter from URL when badge is clicked.
 *
 * @example
 * const activeBadges = [
 *   { paramName: 'specialties', value: 'cardiology', label: 'Cardiology' },
 *   { paramName: 'gender', value: 'MALE', label: 'Male' }
 * ];
 *
 * <FilterBadges badges={activeBadges} />
 */
const FilterBadges = ({
  badges,
  onRemove,
  className = "",
  minHeight = "2rem",
}: FilterBadgesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const removeFilter = (paramName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Get all values for this param
    const allValues = params.getAll(paramName);

    // Remove the specific value
    params.delete(paramName);
    allValues
      .filter((v) => v !== value)
      .forEach((v) => params.append(paramName, v));

    // Reset to page 1
    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });

    // Callback
    onRemove?.(paramName, value);
  };

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`} style={{ minHeight }}>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <Badge
            key={`${badge.paramName}-${badge.value}-${index}`}
            variant="outline"
            className="px-2.5 py-1 h-7"
          >
            {badge.label}
            <Button
              variant="ghost"
              onClick={() => removeFilter(badge.paramName, badge.value)}
              className="ml-1.5 p-0 h-auto hover:bg-transparent hover:text-destructive transition-colors cursor-pointer"
              aria-label={`Remove ${badge.label}`}
              disabled={isPending}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default FilterBadges;
