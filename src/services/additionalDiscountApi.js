// src/services/additionalDiscountApi.js
// Additional Discount API (backend: /additional-discount/*, Phase 3). Uses the shared axios
// instance, so the JWT header and the 401 -> login redirect work as everywhere else.
// Every function returns the "data" of { success, message, data } (lists: { rows, pagination }).
import API from "./api";
import { apiError, toRecordId } from "./businessPlanApi";

const BASE = "/additional-discount";

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "All"));

const data = (res) => res?.data?.data;
const list = (res) => ({ rows: res?.data?.data || [], pagination: res?.data?.pagination || { page: 1, limit: 20, total: 0, total_pages: 1 } });

const id = (value, label = "request") => {
  const n = toRecordId(value);
  if (!n) throw new Error(`Invalid ${label} id. Open it again from the list.`);
  return n;
};

// multipart for documents: { message?, version? } + files[]
const form = (fields = {}, files = []) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  files.forEach((f) => fd.append("files", f, f.name));
  return fd;
};
const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } };

export const adrApi = {
  // access summary + menu badge counts
  me: async () => data(await API.get(`${BASE}/me`)),
  formData: async () => data(await API.get(`${BASE}/form-data`)),
  parties: async (search = "") => data(await API.get(`${BASE}/parties`, { params: clean({ search }) })),
  products: async (search = "") => data(await API.get(`${BASE}/products`, { params: clean({ search }) })),
  calculate: async (body) => data(await API.post(`${BASE}/calculate`, body)),

  // requests
  list: async (params) => list(await API.get(`${BASE}/requests`, { params: clean(params) })),
  detail: async (rid) => data(await API.get(`${BASE}/requests/${id(rid)}`)),
  create: async (body) => data(await API.post(`${BASE}/requests`, body)),
  update: async (rid, body) => data(await API.put(`${BASE}/requests/${id(rid)}`, body)),
  submit: async (rid, version) => data(await API.post(`${BASE}/requests/${id(rid)}/submit`, clean({ version }))),
  cancel: async (rid, reason, version) => data(await API.post(`${BASE}/requests/${id(rid)}/cancel`, clean({ reason, version }))),
  reply: async (rid, message, files = [], version) =>
    data(await API.post(`${BASE}/requests/${id(rid)}/reply`, form({ message, version }, files), MULTIPART)),
  history: async (rid) => data(await API.get(`${BASE}/requests/${id(rid)}/history`)),
  requestUtilization: async (rid) => data(await API.get(`${BASE}/requests/${id(rid)}/utilization`)),
  addAttachments: async (rid, files) => data(await API.post(`${BASE}/requests/${id(rid)}/attachments`, form({}, files), MULTIPART)),
  removeAttachment: async (rid, attachmentId) => data(await API.delete(`${BASE}/requests/${id(rid)}/attachments/${id(attachmentId, "document")}`)),

  // decisions
  rsmDecision: async (rid, body) => data(await API.post(`${BASE}/requests/${id(rid)}/rsm-decision`, body)),
  finalDecision: async (rid, body) => data(await API.post(`${BASE}/requests/${id(rid)}/final-decision`, body)),
  creditReview: async (rid, note) => data(await API.post(`${BASE}/requests/${id(rid)}/credit-review`, { note })),

  // dashboard, reports, utilization, history
  dashboard: async (params) => data(await API.get(`${BASE}/dashboard`, { params: clean(params) })),
  reportList: async () => data(await API.get(`${BASE}/reports`)),
  report: async (key, params) => data(await API.get(`${BASE}/reports/${encodeURIComponent(key)}`, { params: clean(params) })),
  utilization: async (params) => list(await API.get(`${BASE}/utilization`, { params: clean(params) })),
  partyHistory: async (ledgerId) => data(await API.get(`${BASE}/parties/${id(ledgerId, "party")}/history`)),
  approvalMatrix: async () => data(await API.get(`${BASE}/approval-matrix`)),
  routingPreview: async (userId) => data(await API.get(`${BASE}/routing-preview`, { params: clean({ user_id: userId }) })),

  // sales screens
  eligible: async (partyLedgerId, stockItemId) =>
    data(await API.get(`${BASE}/eligible`, { params: clean({ party_ledger_id: partyLedgerId, stock_item_id: stockItemId }) })),
  saleLines: async (saleId) => data(await API.get(`${BASE}/sales/${id(saleId, "sale")}`)),

  // settings
  settings: async () => data(await API.get(`${BASE}/settings`)),
  saveSettings: async (body) => data(await API.put(`${BASE}/settings`, body)),
  addReason: async (reason) => data(await API.post(`${BASE}/settings/reasons`, { reason })),
  updateReason: async (reasonId, body) => data(await API.put(`${BASE}/settings/reasons/${id(reasonId, "reason")}`, body)),
  runJob: async () => data(await API.post(`${BASE}/jobs/run`)),
};

export { apiError, toRecordId };
