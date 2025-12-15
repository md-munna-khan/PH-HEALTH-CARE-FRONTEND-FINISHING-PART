"use client";

import ClearFiltersButton from "@/components/shared/ClearFiltersButton";
import RefreshButton from "@/components/shared/RefreshButton";
import SearchFilter from "@/components/shared/SearchFilter";

const PatientsFilter = () => {
  return (
    <div className="space-y-3">
      {/* Row 1: Search and Refresh */}
      <div className="flex items-center gap-3">
        <SearchFilter paramName="searchTerm" placeholder="Search patients..." />
        <RefreshButton />
      </div>

      {/* Row 2: Filter Controls */}
      <div className="flex items-center gap-3">
        {/* Email Filter */}

        <SearchFilter paramName="email" placeholder="Email" />

        {/* Contact Number Filter */}

        <SearchFilter paramName="contactNumber" placeholder="Contact" />

        {/* Clear All Filters */}
        <ClearFiltersButton />
      </div>
    </div>
  );
};

export default PatientsFilter;
