"use client";

import { useThrottledValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  id: string;
  label: string;
};

export type AsyncComboboxProps = {
  /** Selected ID/code, controlled by the parent */
  value?: string;
  onValueChange: (value: string | undefined) => void;

  /** Search endpoint */
  search: (query: string, signal: AbortSignal) => Promise<ComboboxOption[]>;

  /** Lookup endpoint for a selected ID/code */
  getById: (id: string, signal: AbortSignal) => Promise<ComboboxOption>;

  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  minChars?: number;
  throttleMs?: number;
  disabled?: boolean;
  queryKey?: string;
};

export function AutoCombobox({
  value,
  onValueChange,
  search,
  getById,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  minChars = 2,
  throttleMs = 300,
  disabled = false,
  queryKey = "async-combobox",
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Throttle the search term; keep the input itself responsive.
  const [throttledQuery] = useThrottledValue(query, {
    wait: throttleMs,
    leading: true,
    trailing: true,
  });

  const normalizedQuery = throttledQuery.trim();

  // Search endpoint.
  const searchQuery = useQuery({
    queryKey: [queryKey, "search", normalizedQuery],
    queryFn: ({ signal }) => search(normalizedQuery, signal),
    enabled: open && normalizedQuery.length >= minChars,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });

  // Selected ID/code lookup endpoint.
  const selectedQuery = useQuery({
    queryKey: [queryKey, "detail", value],
    queryFn: ({ signal }) => {
      if (!value) {
        throw new Error("A selected ID is required");
      }

      return getById(value, signal);
    },
    enabled: Boolean(value),
    staleTime: 5 * 60_000,
  });

  const selected = selectedQuery.data;

  const options = searchQuery.data ?? [];

  const isWaitingForThrottle = query.trim().length >= minChars && query.trim() !== normalizedQuery;

  const isSearching = open && normalizedQuery.length >= minChars && (searchQuery.isFetching || isWaitingForThrottle);

  const selectOption = (option: ComboboxOption) => {
    // Populate React Query's detail cache immediately.
    // This avoids an unnecessary lookup for this option.
    // The search query already contains the complete option.
    onValueChange(option.id);
    setQuery("");
    setOpen(false);
  };

  const clearSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onValueChange(undefined);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedQuery.isPending && value ? "Loading selection..." : (selected?.label ?? placeholder)}
          </span>

          <span className="ml-2 flex shrink-0 items-center gap-1">
            {value && (
              <span role="presentation" onPointerDown={(event) => event.stopPropagation()}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  aria-label="Clear selection"
                  onClick={clearSelection}
                  disabled={disabled}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </span>
            )}

            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />

          <CommandList>
            {query.trim().length < minChars && <CommandEmpty>Type at least {minChars} characters.</CommandEmpty>}

            {isSearching && (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!isSearching && searchQuery.isError && (
              <div className="text-destructive py-6 text-center text-sm">Search failed. Try again.</div>
            )}

            {!isSearching && !searchQuery.isError && normalizedQuery.length >= minChars && options.length === 0 && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}

            {!searchQuery.isError && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option.id} value={option.id} onSelect={() => selectOption(option)}>
                    <Check className={cn("mr-2 h-4 w-4", value === option.id ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
