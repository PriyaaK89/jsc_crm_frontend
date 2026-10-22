import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import { getYearlyHolidays, deleteCompanyHoliday } from "../Apis/holidayApi";

export const useYearlyHolidays = () => {
  const toast = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadYear = useCallback(async (y) => {
    setLoading(true);
    try {
      const res = await getYearlyHolidays(y);
      setHolidays(res.holidays || []);
    } catch (err) {
      toast({ title: "Failed to load holidays", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadYear(year);
  }, [year, loadYear]);

  const removeHoliday = async (id) => {
    try {
      await deleteCompanyHoliday(id);
      toast({ title: "Holiday removed", status: "success" });
      await loadYear(year); // refresh from server, don't just splice local state
    } catch (err) {
      toast({ title: "Failed to delete holiday", status: "error" });
    }
  };

  const availableYears = (() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1, current + 2];
  })();

  return { year, setYear, holidays, loading, removeHoliday, availableYears };
};