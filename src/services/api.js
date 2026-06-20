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

API.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    const token = auth?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
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

    return Promise.reject(error);
  }
);

export default API;
