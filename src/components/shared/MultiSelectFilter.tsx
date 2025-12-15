"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  paramName: string;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  triggerClassName?: string;
  showBadges?: boolean;
  badgesOnly?: boolean;
  onSelectionChange?: (selected: string[]) => void;
}

/**
 * Reusable Multi-Select Filter Component
 *
 * @example
 * <MultiSelectFilter
 *   paramName="specialties"
 *   options={specialties.map(s => ({ value: s.id, label: s.title }))}
 *   placeholder="Select specialties"
 *   showBadges={true}
 * />
 */
const MultiSelectFilter = ({
  paramName,
  options,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  triggerClassName = "w-60",
  showBadges = false,
  badgesOnly = false,
  onSelectionChange,
}: MultiSelectFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Derive local selection from URL params
  const urlValues = searchParams.getAll(paramName);

  // Track draft state separately from URL values
  const [draftSelection, setDraftSelection] = useState<string[] | null>(null);

  // Use draft if in edit mode, otherwise use URL values
  const localSelection = draftSelection ?? urlValues;

  const toggleOption = (value: string) => {
    const currentSelection = draftSelection ?? urlValues;
    const newSelection = currentSelection.includes(value)
      ? currentSelection.filter((v) => v !== value)
      : [...currentSelection, value];

    setDraftSelection(newSelection);
  };

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove existing param values
    params.delete(paramName);

    // Add new values
    if (localSelection.length > 0) {
      localSelection.forEach((val) => params.append(paramName, val));
    }

    // Reset to page 1
    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
      // Clear draft after navigation
      setDraftSelection(null);
    });

    // Callback for parent component
    onSelectionChange?.(localSelection);

    setOpen(false);
  };

  const removeOption = (value: string) => {
    const newSelection = localSelection.filter((v) => v !== value);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);

    if (newSelection.length > 0) {
      newSelection.forEach((val) => params.append(paramName, val));
    }

    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });

    onSelectionChange?.(newSelection);
  };

  const getSelectedLabels = () => {
    return localSelection
      .map((value) => options.find((opt) => opt.value === value)?.label)
      .filter(Boolean);
  };

  // If badgesOnly mode, just render badges
  if (badgesOnly) {
    return (
      <div className="flex flex-wrap gap-2">
        {localSelection.length > 0 &&
          getSelectedLabels().map((label) => {
            const value = options.find((opt) => opt.label === label)?.value;
            return (
              <Badge
                key={value}
                variant="secondary"
                className="px-3 py-1.5 h-8 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {label}
                <Button
                  variant="link"
                  onClick={() => value && removeOption(value)}
                  className="ml-2 hover:text-destructive transition-colors cursor-pointer"
                  aria-label={`Remove ${label}`}
                  disabled={isPending}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </Badge>
            );
          })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`justify-between h-10 ${triggerClassName}`}
            disabled={isPending}
          >
            <Filter className="mr-2 h-4 w-4" />
            {localSelection.length > 0
              ? `${localSelection.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`p-0 ${triggerClassName}`} align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = localSelection.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggleOption(option.value)}
                      className={isSelected ? "bg-accent" : ""}
                    >
                      <Checkbox checked={isSelected} className="mr-2" />
                      <span className={isSelected ? "font-medium" : ""}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            <div className="p-2 border-t">
              <Button
                onClick={applyFilter}
                className="w-full"
                size="sm"
                disabled={isPending}
              >
                Apply Filter
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Optional: Display selected badges */}
      {showBadges && localSelection.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getSelectedLabels().map((label) => {
            const value = options.find((opt) => opt.label === label)?.value;
            return (
              <Badge key={value} variant="outline" className="px-2.5 py-1 h-7">
                {label}
                <button
                  onClick={() => value && removeOption(value)}
                  className="ml-1.5 hover:text-destructive transition-colors"
                  aria-label={`Remove ${label}`}
                  disabled={isPending}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilter;
