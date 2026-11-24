// src/services/cropCatalogApi.js
// Crop catalog (backend: /crop-catalog/*): the season list (Kharif / Rabi / Zaid …), crops of a
// season, and products (stock items) of a crop in a season. Reads: any user. Season list
// changes: Admin / Super Admin / crop_manage. A crop and its seasons are saved with the
// existing crop API (create-crops / update-crops with `seasons`).
import API from "./api";

const BASE = "/crop-catalog";
const data = (r) => r.data?.data;
const body = (r) => r.data;

export const cropCatalogApi = {
  seasons: (includeInactive = false) => API.get(`${BASE}/seasons`, { params: includeInactive ? { include_inactive: 1 } : {} }).then(data),
  addSeason: (name) => API.post(`${BASE}/seasons`, { name }).then(body),
  setSeasonStatus: (id, isActive) => API.post(`${BASE}/seasons/${id}/status`, { is_active: !!isActive }).then(body),

  // active crops linked to a season: [{ id, crop_name, seasons, product_count }]
  crops: (params = {}) => API.get(`${BASE}/crops`, { params }).then(data),
  // stock items of a crop, only when the crop is in that season
  products: (cropId, season, search) => API.get(`${BASE}/products`, { params: { crop_id: cropId, ...(season ? { season } : {}), ...(search ? { search } : {}) } }).then(data),
};

export const catalogError = (err, fallback = "Something went wrong") => err?.response?.data?.message || err?.message || fallback;
