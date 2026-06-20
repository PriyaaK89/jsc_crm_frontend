// src/utils/toast.js

import { toast } from "react-toastify";

export const showSessionExpiredToast = () => {
  toast.error("Your session has expired. Please login again.", {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};