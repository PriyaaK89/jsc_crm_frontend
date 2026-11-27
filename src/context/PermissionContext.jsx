import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API, { PERMISSIONS_CHANGED_EVENT } from "../services/api";
import { API_ENDPOINTS } from "../services/endpoints";
import { AuthContext } from "./AuthContext";
import { ADR_RSM, SUPER_ADMIN_ONLY, TASK_ASSIGNER } from "../routes/routePermission";


const PermissionContext = createContext({
  loading: true,
  isAdmin: false,
  can: () => false,
  refreshPermissions: async () => {},
  adr: null,
  refreshAdr: async () => {},
});

const EMPTY = {
  isAdmin: false,
  isSuperAdmin: false,
  auditMode: false,
  codes: new Set(),
  isMarketing: false,
  departmentId: null,
  autoCodes: new Set(),
};

// Additional Discount access + menu badge counts (null when the module is not available)
const loadAdr = async () => {
  try {
    const res = await API.get("/additional-discount/me");
    return res?.data?.data || null;
  } catch (_) {
    return null;
  }
};

// The server decides what a user may do. This only keeps the screens in step.
export const PermissionProvider = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const [access, setAccess] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [adr, setAdr] = useState(null);

  const token = auth?.token || JSON.parse(localStorage.getItem("auth") || "null")?.token;

  const refreshPermissions = useCallback(async () => {
    if (!token) {
      setAccess(EMPTY);
      setAdr(null);
      setLoading(false);
      return;
    }
    try {
      const res = await API.get(API_ENDPOINTS.permissions_me);
      const data = res?.data?.data;
      const adrMe = await loadAdr();
      setAdr(adrMe);
      setAccess({
        isAdmin: !!data?.is_admin,
        isSuperAdmin: data?.role === "SUPER_ADMIN",
        auditMode: !!data?.audit_mode,
        // Marketing department (id 2): the server already includes the automatic permissions
        // in `permissions`; these fields only say where they come from
        isMarketing: !!data?.is_marketing,
        departmentId: data?.department_id ?? null,
        autoCodes: new Set(data?.auto_permissions || []),
        codes: new Set([
          ...(data?.permissions || []),
          ...(data?.can_assign_tasks ? [TASK_ASSIGNER] : []),
          ...(adrMe?.can_rsm_approve ? [ADR_RSM] : []),
        ]),
      });
    } catch (err) {
      console.log(err, "Could not load permissions");
      setAccess(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    refreshPermissions();
  }, [refreshPermissions]);

  // Additional Discount only (after an approval action, and every 2 minutes for the menu badges)
  const refreshAdr = useCallback(async () => {
    if (!token) return;
    const adrMe = await loadAdr();
    setAdr(adrMe);
    setAccess((prev) => {
      const codes = new Set(prev.codes);
      if (adrMe?.can_rsm_approve) codes.add(ADR_RSM);
      else codes.delete(ADR_RSM);
      return { ...prev, codes };
    });
  }, [token]);

  useEffect(() => {
    const timer = setInterval(refreshAdr, 120000);
    return () => clearInterval(timer);
  }, [refreshAdr]);

  // pick up changes made by an administrator (also right after the server refused something
  // because a permission is missing: services/api.js fires PERMISSIONS_CHANGED_EVENT)
  useEffect(() => {
    window.addEventListener("focus", refreshPermissions);
    window.addEventListener(PERMISSIONS_CHANGED_EVENT, refreshPermissions);
    const timer = setInterval(refreshPermissions, 400000);
    return () => {
      window.removeEventListener("focus", refreshPermissions);
      window.removeEventListener(PERMISSIONS_CHANGED_EVENT, refreshPermissions);
      clearInterval(timer);
    };
  }, [refreshPermissions]);

  const can = useCallback(
    (required) => {
      const list = Array.isArray(required) ? required : [required];
      if (list.includes(SUPER_ADMIN_ONLY)) return access.isSuperAdmin;
      if (access.isAdmin) return true;
      if (!list.length) return true;
      if (access.auditMode) return true;
      return list.some((code) => access.codes.has(code));
    },
    [access],
  );

  // true when the permission comes from the Marketing department, not from an assignment
  const isAuto = useCallback((code) => access.autoCodes.has(code), [access]);

  const value = useMemo(
    () => ({
      loading,
      isAdmin: access.isAdmin,
      isMarketing: access.isMarketing,
      departmentId: access.departmentId,
      can,
      isAuto,
      refreshPermissions,
      adr,
      refreshAdr,
    }),
    [loading, access.isAdmin, access.isMarketing, access.departmentId, can, isAuto, refreshPermissions, adr, refreshAdr],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermissions = () => useContext(PermissionContext);
