import axios from "axios";
import API from "../services/api";
import { API_ENDPOINTS } from "../services/endpoints";


const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getCompanyHolidays = async (month, year) => {
  const res = await API.get(`${API_ENDPOINTS?.get_company_holidays}`, {
    params: { month, year },
    headers: authHeader(),
  });
  return res.data; // { month, year, total, holidays: [...] }
};

export const addCompanyHolidays = async (holidays) => {
  // holidays = [{ date: "2026-10-20", name: "Dussehra" }, ...]
  const res = await API.post(
    `${API_ENDPOINTS?.add_company_holidays}`,
    { holidays },
    { headers: authHeader() }
  );
  return res.data;
};

export const updateCompanyHoliday = async (id, date, name) => {
  const res = await API.put(
    `${API_ENDPOINTS?.update_company_holidays}`,
    { date, name },
    { headers: authHeader() }
  );
  return res.data;
};

export const deleteCompanyHoliday = async (id) => {
  const res = await API.delete(`${API_ENDPOINTS?.delete_company_hoildays}/${id}`, {
    headers: authHeader(),
  });
  return res.data;
};

export const getFestivalSuggestions = async (month, year) => {
  const res = await API.get(`${API_ENDPOINTS?.festival_suggestions}`, {
    params: { month, year },
    headers: authHeader(),
  });
  return res.data; // { month, year, festivals: [{date, name, type}] }
};

export const getYearlyHolidays = async (year) => {
  const res = await API.get(`${API_ENDPOINTS?.get_yearly_holidays}`, {
    params: { year },
    headers: authHeader(),
  });
  return res.data; // { year, total, holidays: [...] }
};