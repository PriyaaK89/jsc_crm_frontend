// src/services/absApi.js
// Advance Booking System API (backend: /abs/*). Shared axios instance → JWT + 401 handling as elsewhere.
import API from "./api";
import { toRecordId } from "./businessPlanApi";

const BASE = "/abs";
const data = (r) => r.data?.data;
const body = (r) => r.data;
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));

// never call /abs/bookings/undefined
const withId = (label, fn) => (id, ...rest) => {
  const n = toRecordId(id);
  if (!n) return Promise.reject(new Error(`Invalid ${label} id. Open it again from the list.`));
  return fn(n, ...rest);
};

export const absApi = {
  masters: () => API.get(`${BASE}/masters`).then(data),
  parties: (search) => API.get(`${BASE}/parties`, { params: clean({ search }) }).then(data),
  party: withId("party", (id) => API.get(`${BASE}/parties/${id}`).then(data)),

  settings: () => API.get(`${BASE}/settings`).then(data),
  saveSettings: (b) => API.put(`${BASE}/settings`, b).then(body),
  seasons: () => API.get(`${BASE}/seasons`).then(data),
  season: withId("season", (id) => API.get(`${BASE}/seasons/${id}`).then(data)),
  saveSeason: (id, b) => (id ? API.put(`${BASE}/seasons/${id}`, b) : API.post(`${BASE}/seasons`, b)).then(body),
  seasonStatus: withId("season", (id, status) => API.post(`${BASE}/seasons/${id}/status`, { status }).then(body)),
  saveSeasonProducts: withId("season", (id, products) => API.put(`${BASE}/seasons/${id}/products`, { products }).then(body)),
  deleteSeasonProduct: withId("season", (id, stockItemId) => API.delete(`${BASE}/seasons/${id}/products/${stockItemId}`).then(body)),
  // price list: crops of the season's crop season → stock items of the chosen crop
  seasonCrops: withId("season", (id) => API.get(`${BASE}/seasons/${id}/crops`).then(data)),
  seasonCropProducts: withId("season", (id, cropId, search) => API.get(`${BASE}/seasons/${id}/crop-products`, { params: clean({ crop_id: cropId, search }) }).then(data)),
  seasonChecklist: withId("season", (id) => API.get(`${BASE}/seasons/${id}/checklist`).then(data)),
  seasonAvailability: withId("season", (id) => API.get(`${BASE}/seasons/${id}/availability`).then(data)),
  saveScheme: withId("season", (seasonId, schemeId, b) => (schemeId ? API.put(`${BASE}/seasons/${seasonId}/schemes/${schemeId}`, b) : API.post(`${BASE}/seasons/${seasonId}/schemes`, b)).then(body)),
  deleteScheme: withId("season", (seasonId, schemeId) => API.delete(`${BASE}/seasons/${seasonId}/schemes/${schemeId}`).then(body)),

  dashboard: (season_id) => API.get(`${BASE}/dashboard`, { params: clean({ season_id }) }).then(data),
  report: (kind, season_id) => API.get(`${BASE}/reports/${kind}`, { params: clean({ season_id }) }).then(data),

  // scope: mine | team | pending | all; flag: overdue | allocation | dispatch
  bookings: (params) => API.get(`${BASE}/bookings`, { params: clean(params) }).then(data),
  booking: withId("booking", (id) => API.get(`${BASE}/bookings/${id}`).then(data)),
  // action: submit | approve | return | reject | confirm | cancel | close
  action: withId("booking", (id, action, b = {}) => API.post(`${BASE}/bookings/${id}/${action}`, b).then(body)),
  shortClose: withId("booking", (id, itemId, b) => API.post(`${BASE}/bookings/${id}/items/${itemId}/short-close`, b).then(body)),

  recordPayment: withId("booking", (id, b) => API.post(`${BASE}/bookings/${id}/payments`, b).then(body)),
  payments: (params) => API.get(`${BASE}/payments`, { params: clean(params) }).then(data),
  verifyPayment: withId("payment", (id, b) => API.post(`${BASE}/payments/${id}/verify`, b).then(body)),
  refusePayment: withId("payment", (id, kind, reason) => API.post(`${BASE}/payments/${id}/${kind}`, { reason }).then(body)),
  refunds: (status) => API.get(`${BASE}/refunds`, { params: clean({ status }) }).then(data),
  settleRefund: withId("refund", (id, b) => API.post(`${BASE}/refunds/${id}/settle`, b).then(body)),

  availability: (stock_item_id, godown_id) => API.get(`${BASE}/allocation/availability`, { params: clean({ stock_item_id, godown_id }) }).then(data),
  queue: (season_id, stock_item_id) => API.get(`${BASE}/allocation/queue`, { params: clean({ season_id, stock_item_id }) }).then(data),
  autoAllocate: (b) => API.post(`${BASE}/allocation/auto`, b).then(body),
  allocate: withId("booking", (id, lines) => API.post(`${BASE}/bookings/${id}/allocations`, { lines }).then(body)),
  releaseAllocation: withId("allocation", (id, reason) => API.post(`${BASE}/allocations/${id}/release`, { reason }).then(body)),

  dispatchPreview: withId("booking", (id) => API.get(`${BASE}/bookings/${id}/dispatch-preview`).then(data)),
  dispatch: withId("booking", (id, b) => API.post(`${BASE}/bookings/${id}/dispatches`, b).then(body)),
  dispatches: (params) => API.get(`${BASE}/dispatches`, { params: clean(params) }).then(data),
  dispatchDetail: withId("dispatch", (id) => API.get(`${BASE}/dispatches/${id}`).then(data)),
  deliver: withId("dispatch", (id, b) => API.post(`${BASE}/dispatches/${id}/deliver`, b).then(body)),
};

export { apiError } from "./businessPlanApi";
