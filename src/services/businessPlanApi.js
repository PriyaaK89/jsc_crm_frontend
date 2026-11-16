// src/services/businessPlanApi.js
// Business Plan API (backend: /business-plan/*). Uses the shared axios
// instance, so the JWT header and the 401 -> login redirect work as everywhere else.
import API from "./api";

const BASE = "/business-plan";

// drop empty / "All" filter values so the backend sees only real filters
const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "All"),
  );

const data = (res) => res?.data?.data;

// readable message from any axios error
export const apiError = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || err?.message || fallback;

// A record id must be a positive whole number. undefined / null / "undefined" / "" / 0
// are refused here, so no request like GET /business-plan/plans/undefined is ever sent.
export const toRecordId = (value) => {
  const s = String(value ?? "").trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

const requireId = (value, label = "plan") => {
  const id = toRecordId(value);
  if (!id) {
    const err = new Error(`Invalid ${label} id. Open the ${label} again from the list.`);
    err.code = "BP_INVALID_ID";
    throw err;
  }
  return id;
};

// guards an API function: (id, ...rest) -> rejected promise when the id is not valid
const withId = (label, fn) => (id, ...rest) => {
  try {
    return fn(requireId(id, label), ...rest);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const bpApi = {
  // masters / settings / territories
  masters: () => API.get(`${BASE}/masters`).then(data),
  settings: (includeInactive = false) =>
    API.get(`${BASE}/settings`, { params: includeInactive ? { include_inactive: 1 } : {} }).then(data),
  saveSettings: (body) => API.put(`${BASE}/settings`, body).then((r) => r.data),
  resetSettings: () => API.post(`${BASE}/settings/reset`).then((r) => r.data),
  addOption: (listKey, value) => API.post(`${BASE}/settings/options`, { list_key: listKey, value }).then((r) => r.data),
  updateOption: (id, body) => API.put(`${BASE}/settings/options/${id}`, body).then((r) => r.data),
  removeOption: (id) => API.delete(`${BASE}/settings/options/${id}`).then((r) => r.data),
  territories: (params) => API.get(`${BASE}/territories`, { params: clean(params) }).then(data),
  saveTerritory: (id, body) =>
    (id ? API.put(`${BASE}/territories/${id}`, body) : API.post(`${BASE}/territories`, body)).then((r) => r.data),
  deleteTerritory: (id) => API.delete(`${BASE}/territories/${id}`).then((r) => r.data),

  // lookups
  states: () => API.get(`${BASE}/lookups/states`).then(data),
  employees: (search) => API.get(`${BASE}/lookups/employees`, { params: clean({ search }) }).then(data),
  distributors: (search, all = false) =>
    API.get(`${BASE}/lookups/distributors`, { params: clean({ search, limit: 100, all: all ? 1 : undefined }) }).then(data),
  distributorProfile: (ledgerId, from, to) =>
    API.get(`${BASE}/lookups/distributors/${ledgerId}/profile`, { params: clean({ from, to }) }).then(data),
  retailers: (search, distributorLedgerId) =>
    API.get(`${BASE}/lookups/retailers`, {
      params: clean({ search, distributor_ledger_id: distributorLedgerId, limit: 100 }),
    }).then(data),
  retailerProfile: (id) => API.get(`${BASE}/lookups/retailers/${id}/profile`).then(data),
  products: (search) => API.get(`${BASE}/lookups/products`, { params: clean({ search, limit: 200 }) }).then(data),

  // analysis
  dashboard: (filters) => API.get(`${BASE}/dashboard`, { params: clean(filters) }).then(data),
  alerts: (filters) => API.get(`${BASE}/alerts`, { params: clean(filters) }).then(data),
  planVsActual: (filters) => API.get(`${BASE}/plan-vs-actual`, { params: clean(filters) }).then(data),
  matrix: (filters) => API.get(`${BASE}/matrix`, { params: clean(filters) }).then(data),
  forecast: (filters) => API.get(`${BASE}/forecast`, { params: clean(filters) }).then(data),
  reports: () => API.get(`${BASE}/reports`).then(data),
  report: (key, filters) => API.get(`${BASE}/reports/${key}`, { params: clean(filters) }).then(data),
  downloadReport: async (key, filters) => {
    const res = await API.get(`${BASE}/reports/${key}`, {
      params: clean({ ...filters, format: "csv" }),
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `business-plan-${key}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // plans
  plans: (params) => API.get(`${BASE}/plans`, { params: clean(params) }).then(data),
  createPlan: (body) => API.post(`${BASE}/plans`, body).then((r) => r.data),
  plan: withId("plan", (id) => API.get(`${BASE}/plans/${id}`).then(data)),
  updatePlan: withId("plan", (id, body) => API.put(`${BASE}/plans/${id}`, body).then((r) => r.data)),
  deletePlan: withId("plan", (id) => API.delete(`${BASE}/plans/${id}`).then((r) => r.data)),
  updateDevelopment: withId("plan", (id, body) => API.put(`${BASE}/plans/${id}/development`, body).then((r) => r.data)),
  // action: submit | approve | reject | return | reopen | close | revise (revise needs a comment)
  planAction: withId("plan", (id, action, comment) => API.post(`${BASE}/plans/${id}/${action}`, { comment }).then((r) => r.data)),
  // one approved revision with its frozen targets (snapshot)
  planRevision: withId("plan", (id, revisionNo) => API.get(`${BASE}/plans/${id}/revisions/${revisionNo}`).then(data)),
  // tab: distributors | retailers | products | monthly | collection | achievement | variance |
  //      corrective-actions | revisions | target-sheets | approval-history | approval-steps | audit-log
  planTab: withId("plan", (id, tab) => API.get(`${BASE}/plans/${id}/${tab}`).then(data)),
  // kind: distributors | retailers | products | corrective-actions
  saveLine: withId("plan", (planId, kind, lineId, body) =>
    (lineId
      ? API.put(`${BASE}/plans/${planId}/${kind}/${lineId}`, body)
      : API.post(`${BASE}/plans/${planId}/${kind}`, body)
    ).then((r) => r.data)),
  deleteLine: withId("plan", (planId, kind, lineId) => API.delete(`${BASE}/plans/${planId}/${kind}/${lineId}`).then((r) => r.data)),
  saveMonthly: withId("plan", (planId, rows) => API.put(`${BASE}/plans/${planId}/monthly`, { rows }).then((r) => r.data)),
  resetMonthly: withId("plan", (planId) => API.delete(`${BASE}/plans/${planId}/monthly`).then((r) => r.data)),

  // employee target sheets. scope: mine | team | pending (waiting for my approval) | all
  sheets: (params) => API.get(`${BASE}/target-sheets`, { params: clean(params) }).then(data),
  sheet: withId("target sheet", (id) => API.get(`${BASE}/target-sheets/${id}`).then(data)),
  sheetHistory: withId("target sheet", (id) => API.get(`${BASE}/target-sheets/${id}/approval-history`).then(data)),
  approveSheet: withId("target sheet", (id, comment) => API.post(`${BASE}/target-sheets/${id}/approve`, { comment }).then((r) => r.data)),
  returnSheet: withId("target sheet", (id, comment) => API.post(`${BASE}/target-sheets/${id}/return`, { comment }).then((r) => r.data)),
  // a signed (or archived legacy) version of a sheet
  sheetVersion: withId("target sheet", (id, versionNo) => API.get(`${BASE}/target-sheets/${id}/versions/${versionNo}`).then(data)),
  // monthly performance review: actuals from CRM transactions; reasons written by the employee
  sheetReview: withId("target sheet", (id) => API.get(`${BASE}/target-sheets/${id}/review`).then(data)),
  // legacy sheet (typed targets) -> Business Plan targets; the original is archived as a version
  rebaseSheet: withId("target sheet", (id) => API.post(`${BASE}/target-sheets/${id}/rebase`).then((r) => r.data)),
  // approved Business Plan targets of an employee's quarter
  quarterTargets: (params) => API.get(`${BASE}/target-sheets/quarter-targets`, { params: clean(params) }).then(data),

  // target revision requests. scope: mine | pending (I can decide) | all (my team)
  revisionRequests: (scope = "pending") => API.get(`${BASE}/target-revision-requests`, { params: { scope } }).then(data),
  // decision: ACCEPT | DECLINE (decline needs a comment)
  decideRevisionRequest: withId("revision request", (id, decision, comment) =>
    API.post(`${BASE}/target-revision-requests/${id}/decide`, { decision, comment }).then((r) => r.data)),
};
