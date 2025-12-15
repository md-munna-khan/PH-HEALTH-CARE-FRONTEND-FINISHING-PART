"use client";
import ClearFiltersButton from "@/components/shared/ClearFiltersButton";
import MultiSelectFilter from "@/components/shared/MultiSelectFilter";
import RefreshButton from "@/components/shared/RefreshButton";
import SearchFilter from "@/components/shared/SearchFilter";
import SelectFilter from "@/components/shared/SelectFilter";
import { ISpecialty } from "@/types/specialities.interface";

interface DoctorsFilterProps {
  specialties: ISpecialty[];
}

const DoctorFilters = ({ specialties }: DoctorsFilterProps) => {
  return (
    <div className="space-y-3">
      {/* Row 1: Search and Refresh */}
      <div className="flex items-center gap-3">
        <SearchFilter paramName="searchTerm" placeholder="Search doctors..." />
        <RefreshButton />
      </div>

      {/* Row 2: Filter Controls - All on same line */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Specialties Multi-Select */}
        <MultiSelectFilter
          paramName="specialties"
          options={specialties.map((specialty) => ({
            value: specialty.title,
            label: specialty.title,
          }))}
          placeholder="Select specialties"
          searchPlaceholder="Search specialties..."
          emptyMessage="No specialty found."
          showBadges={false}
        />

        {/* Gender Filter */}
        <SelectFilter
          paramName="gender"
          placeholder="Gender"
          defaultValue="All Genders"
          options={[
            { label: "Male", value: "MALE" },
            { label: "Female", value: "FEMALE" },
          ]}
        />

        {/* Email Filter */}
        <SearchFilter paramName="email" placeholder="Email" />

        {/* Contact Number Filter */}
        <SearchFilter paramName="contactNumber" placeholder="Contact" />

        {/* Clear All Filters */}
        <ClearFiltersButton />
      </div>

      {/* Row 3: Active Filter Badges - Fixed height to prevent shift */}
      <MultiSelectFilter
        paramName="specialties"
        options={specialties.map((specialty) => ({
          value: specialty.title,
          label: specialty.title,
        }))}
        placeholder=""
        badgesOnly={true}
      />
    </div>
  );
};

export default DoctorFilters;
