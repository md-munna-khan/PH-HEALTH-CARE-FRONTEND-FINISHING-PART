"use client";

import ClearFiltersButton from "@/components/shared/ClearFiltersButton";
import RefreshButton from "@/components/shared/RefreshButton";
import SelectFilter from "@/components/shared/SelectFilter";

const MySchedulesFilters = () => {
  return (
    <div className="space-y-3">
      {/* Row 1: Refresh Button */}
      <div className="flex items-center gap-3">
        <RefreshButton />
      </div>

      {/* Row 2: Filter Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Booking Status Filter */}
        <SelectFilter
          paramName="isBooked"
          placeholder="Booking Status"
          defaultValue="All Schedules"
          options={[
            { label: "Available", value: "false" },
            { label: "Booked", value: "true" },
          ]}
        />

        {/* Clear All Filters */}
        <ClearFiltersButton />
      </div>
    </div>
  );
};

export default MySchedulesFilters;
