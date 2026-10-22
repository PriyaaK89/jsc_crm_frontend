import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import {
  getCompanyHolidays,
  addCompanyHolidays,
  updateCompanyHoliday,
  deleteCompanyHoliday,
  getFestivalSuggestions,
} from "../Apis/holidayApi";

const pad = (n) => String(n).padStart(2, "0");

export const useHolidayCalendar = () => {
  const toast = useToast();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [existingHolidays, setExistingHolidays] = useState([]);
  const [festivalSuggestions, setFestivalSuggestions] = useState({}); // { "2026-10-20": "Dussehra" }
  const [pendingSelection, setPendingSelection] = useState([]); // [{date, name}]
  const [loading, setLoading] = useState(false);

  const loadMonth = useCallback(async (m, y) => {
    setLoading(true);
    setPendingSelection([]);
    try {
      const [holidayRes, festivalRes] = await Promise.all([
        getCompanyHolidays(m, y),
        getFestivalSuggestions(m, y).catch(() => ({ festivals: [] })), // fail-open
      ]);

      setExistingHolidays(holidayRes.holidays || []);

      const hintMap = {};
      (festivalRes.festivals || []).forEach((f) => {
        hintMap[f.date] = f.name;
      });
      setFestivalSuggestions(hintMap);
    } catch (err) {
      toast({ title: "Failed to load holidays", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMonth(month, year);
  }, [month, year, loadMonth]);

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setMonth(m);
    setYear(y);
  };

    const goToMonthYear = (newMonth, newYear) => {
  setMonth(newMonth);
  setYear(newYear);
};

// Expose a sensible year range for the dropdown:
// 1 year back (correcting old records) to 2 years ahead (HR planning early)
const availableYears = (() => {
  const current = now.getFullYear();
  return [current - 1, current, current + 1, current + 2, current + 3, current + 4, current + 5];
})();

  const dateStrFor = (day) => `${year}-${pad(month)}-${pad(day)}`;

  const togglePendingDate = (dateStr, name) => {
  setPendingSelection((prev) => {
    const idx = prev.findIndex((p) => p.date === dateStr);
    if (idx > -1) return prev.filter((p) => p.date !== dateStr);
    return [...prev, { date: dateStr, name }];
  });
};

  const removePendingDate = (dateStr) => {
    setPendingSelection((prev) => prev.filter((p) => p.date !== dateStr));
  };

  const savePendingHolidays = async () => {
    if (pendingSelection.length === 0) return;
    try {
      const res = await addCompanyHolidays(pendingSelection);
      toast({ title: res.message || "Holidays saved", status: "success" });
      await loadMonth(month, year);
    } catch (err) {
      toast({ title: "Failed to save holidays", status: "error" });
    }
  };

  const editHoliday = async (id, date, name) => {
    try {
      await updateCompanyHoliday(id, date, name);
      toast({ title: "Holiday updated", status: "success" });
      await loadMonth(month, year);
    } catch (err) {
      toast({ title: "Failed to update holiday", status: "error" });
    }
  };

  const removeHoliday = async (id) => {
    try {
      await deleteCompanyHoliday(id);
      toast({ title: "Holiday removed", status: "success" });
      await loadMonth(month, year);
    } catch (err) {
      toast({ title: "Failed to delete holiday", status: "error" });
    }
  };



  return {
    month, year, loading,
    existingHolidays, festivalSuggestions, pendingSelection,
    changeMonth, goToMonthYear, availableYears, dateStrFor,
    togglePendingDate, removePendingDate, savePendingHolidays,
    editHoliday, removeHoliday,
  };
};