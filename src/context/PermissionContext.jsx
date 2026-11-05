import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { API_ENDPOINTS } from "../services/endpoints";
import { AuthContext } from "./AuthContext";
import { SUPER_ADMIN_ONLY, TASK_ASSIGNER } from "../routes/routePermission";


const PermissionContext = createContext({
  loading: true,
  isAdmin: false,
  can: () => false,
  refreshPermissions: async () => {},
});

const EMPTY = { isAdmin: false, isSuperAdmin: false, auditMode: false, codes: new Set() };

// The server decides what a user may do. This only keeps the screens in step.
export const PermissionProvider = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const [access, setAccess] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const token = auth?.token || JSON.parse(localStorage.getItem("auth") || "null")?.token;

  const refreshPermissions = useCallback(async () => {
    if (!token) {
      setAccess(EMPTY);
      setLoading(false);
      return;
    }
    try {
      const res = await API.get(API_ENDPOINTS.permissions_me);
      const data = res?.data?.data;
      setAccess({
        isAdmin: !!data?.is_admin,
        isSuperAdmin: data?.role === "SUPER_ADMIN",
        auditMode: !!data?.audit_mode,
        codes: new Set([
          ...(data?.permissions || []),
          ...(data?.can_assign_tasks ? [TASK_ASSIGNER] : []),
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

  // pick up changes made by an administrator
  useEffect(() => {
    window.addEventListener("focus", refreshPermissions);
    const timer = setInterval(refreshPermissions, 60000);
    return () => {
      window.removeEventListener("focus", refreshPermissions);
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

  const value = useMemo(
    () => ({ loading, isAdmin: access.isAdmin, can, refreshPermissions }),
    [loading, access.isAdmin, can, refreshPermissions],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermissions = () => useContext(PermissionContext);
