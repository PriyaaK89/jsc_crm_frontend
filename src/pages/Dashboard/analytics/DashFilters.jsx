import { useEffect, useMemo, useState } from "react";
import { Button, Flex, FormControl, FormLabel, Input, Select } from "@chakra-ui/react";

const pad = (value) => String(value).padStart(2, "0");
const toDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const monthEnd = (year, month) => toDate(new Date(year, month + 1, 0));
const FIRST_YEAR = 2020;
const FILTER_DELAY_MS = 300;

export const getPresetRange = (preset, now = new Date()) => {
    
  const today = toDate(now);
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "last7": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { from: toDate(start), to: today };
    }
    case "lastMonth":
      return { from: toDate(new Date(year, month - 1, 1)), to: monthEnd(year, month - 1) };
    case "financialYear": {
      const startYear = month >= 3 ? year : year - 1;
      return { from: `${startYear}-04-01`, to: today };
    }
    default:
      return { from: toDate(new Date(year, month, 1)), to: today };
  }
};

const resolveRange = (filters) => {
  const today = toDate(new Date());
  // A running month or year stops at today, so future periods are not drawn as zero.
  const untilToday = (date) => (date > today ? today : date);

  if (filters.preset === "custom") return { from: filters.from, to: filters.to };
  if (filters.preset === "month") {
    const [year, month] = filters.month.split("-").map(Number);
    return { from: `${filters.month}-01`, to: untilToday(monthEnd(year, month - 1)) };
  }
  if (filters.preset === "year") {
    return { from: `${filters.year}-01-01`, to: untilToday(`${filters.year}-12-31`) };
  }
  return getPresetRange(filters.preset);
};

// Quick filter changes send one set of requests, not one per change.
const useSettled = (value) => {
  const [settled, setSettled] = useState(value);
  const key = JSON.stringify(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(JSON.parse(key)), FILTER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [key]);

  return settled;
};

const initialFilters = () => {
  const range = getPresetRange("thisMonth");
  return {
    preset: "thisMonth",
    month: range.from.slice(0, 7),
    year: new Date().getFullYear(),
    from: range.from,
    to: range.to,
    employeeId: "",
  };
};

// Owns all filter state. `range` is for display, `params` is for the API calls.
export const useDashboardFilters = () => {
  const [filters, setFilters] = useState(initialFilters);
  const range = useMemo(() => resolveRange(filters), [filters]);
  const params = useSettled({ ...range, ...(filters.employeeId ? { employee_id: filters.employeeId } : {}) });
  return { filters, setFilters, range, params };
};

const Field = ({ label, children, width = { base: "100%", sm: "150px" } }) => (
  <FormControl w={width}>
    <FormLabel fontSize="11px" fontWeight="600" textTransform="uppercase" letterSpacing="0.04em" color="gray.500" mb={1}>
      {label}
    </FormLabel>
    {children}
  </FormControl>
);

const controlProps = { size: "sm", bg: "white", borderRadius: "8px" };

export default function DashboardFilters({ filters, setFilters, range, employees = [] }) {
  const set = (changes) => setFilters((prev) => ({ ...prev, ...changes }));
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= FIRST_YEAR; year -= 1) years.push(year);

  return (
    <Flex
      gap={3}
      wrap="wrap"
      align="flex-end"
      bg="white"
      p={3}
      borderRadius="12px"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="0 1px 3px rgba(0,0,0,0.06)"
    >
      <Field label="Period" width={{ base: "100%", sm: "170px" }}>
        <Select {...controlProps} value={filters.preset} onChange={(e) => set({ preset: e.target.value })}>
          <option value="today">Today</option>
          <option value="last7">Last 7 days</option>
          <option value="thisMonth">This month</option>
          <option value="lastMonth">Last month</option>
          <option value="financialYear">This financial year</option>
          <option value="month">Select month</option>
          <option value="year">Select year</option>
          <option value="custom">Custom dates</option>
        </Select>
      </Field>

      {filters.preset === "month" && (
        <Field label="Month">
          <Input {...controlProps} type="month" max={toDate(new Date()).slice(0, 7)} value={filters.month} onChange={(e) => e.target.value && set({ month: e.target.value })} />
        </Field>
      )}

      {filters.preset === "year" && (
        <Field label="Year" width={{ base: "100%", sm: "110px" }}>
          <Select {...controlProps} value={filters.year} onChange={(e) => set({ year: Number(e.target.value) })}>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="From" width={{ base: "47%", sm: "150px" }}>
        <Input {...controlProps} type="date" max={range.to} value={range.from} onChange={(e) => e.target.value && set({ preset: "custom", from: e.target.value, to: range.to })} />
      </Field>
      <Field label="To" width={{ base: "47%", sm: "150px" }}>
        <Input {...controlProps} type="date" min={range.from} value={range.to} onChange={(e) => e.target.value && set({ preset: "custom", from: range.from, to: e.target.value })} />
      </Field>

      {employees.length > 1 && (
        <Field label="Employee" width={{ base: "100%", sm: "210px" }}>
          <Select {...controlProps} value={filters.employeeId} onChange={(e) => set({ employeeId: e.target.value })}>
            <option value="">All employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </Select>
        </Field>
      )}

      <Button size="sm" variant="ghost" colorScheme="blue" ml="auto" onClick={() => setFilters(initialFilters())}>
        Reset
      </Button>
    </Flex>
  );
}