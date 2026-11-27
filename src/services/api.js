import axios from "axios";
import { showSessionExpiredToast } from "../utils/toast";
console.log("BASE URL:", import.meta.env.VITE_BASE_URL);
console.log("ENV CHECK:", import.meta.env);

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRedirecting = false;

// 403 from a permission check that names the missing permission (code PERMISSION_DENIED):
// the user's access probably changed, so PermissionContext reloads /permissions/me and the
// menus / buttons follow. At most once every 10 seconds.
export const PERMISSIONS_CHANGED_EVENT = "permissions:changed";
let lastPermissionSync = 0;

API.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    const token = auth?.token;

    if (token) { config.headers.Authorization = `Bearer ${token}`; }

    return config;
  },
  (error) => Promise.reject(error),
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !isRedirecting &&
      window.location.pathname !== "/login"
    ) {
      isRedirecting = true;

      showSessionExpiredToast();
      localStorage.removeItem("auth");

      setTimeout(() => {
        window.location.replace("/login");
      }, 2000);
    }

    if (error.response?.status === 403 && error.response?.data?.code === "PERMISSION_DENIED") {
      const now = Date.now();
      if (now - lastPermissionSync > 10000) {
        lastPermissionSync = now;
        window.dispatchEvent(new CustomEvent(PERMISSIONS_CHANGED_EVENT, { detail: error.response.data }));
      }
    }

    return Promise.reject(error);
  },
);

export default API;