"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Settings } from "lucide-react";

export interface SearchFilters {
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  categories: string[];
  searchScope: "all" | "recent" | "category";
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        startDate: e.target.value || null,
      },
    }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        endDate: e.target.value || null,
      },
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
  };

  const handleScopeChange = (scope: "all" | "recent" | "category") => {
    setLocalFilters((prev) => ({
      ...prev,
      searchScope: scope,
    }));
  };

  const handleApply = () => {
    onChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      dateRange: { startDate: null, endDate: null },
      categories: [],
      searchScope: "all",
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  // Sample categories - in production these would come from the backend
  const availableCategories = [
    "notes",
    "recipes",
    "projects",
    "journal",
    "documentation",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full p-0"
          title="Search Filters"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search Filters</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Date Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="start-date" className="text-xs">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  className="border-input w-full rounded-md border px-3 py-1 text-sm"
                  value={localFilters.dateRange.startDate ?? ""}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="end-date" className="text-xs">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  className="border-input w-full rounded-md border px-3 py-1 text-sm"
                  value={localFilters.dateRange.endDate ?? ""}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.categories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Search Scope</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="search-scope"
                  checked={localFilters.searchScope === "all"}
                  onChange={() => handleScopeChange("all")}
                  className="h-4 w-4 rounded-full border-gray-300"
                />
                All Documents
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="search-scope"
                  checked={localFilters.searchScope === "recent"}
                  onChange={() => handleScopeChange("recent")}
                  className="h-4 w-4 rounded-full border-gray-300"
                />
                Recent Documents (last 30 days)
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="search-scope"
                  checked={localFilters.searchScope === "category"}
                  onChange={() => handleScopeChange("category")}
                  className="h-4 w-4 rounded-full border-gray-300"
                />
                Selected Categories Only
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
