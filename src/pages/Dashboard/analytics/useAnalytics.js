import { useCallback, useEffect, useRef, useState } from "react";
import API from "../../../services/api";

// Loads one dashboard section. A slower older response never replaces a newer one.
// Pass { enabled: false } to hold the request back (used for tabs not opened yet).
const useAnalytics = (endpoint, params, { enabled = true } = {}) => {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const latest = useRef(0);
  const paramKey = JSON.stringify(params || {});

  const load = useCallback(async () => {
    latest.current += 1;
    const request = latest.current;
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const res = await API.get(endpoint, { params: JSON.parse(paramKey) });
      if (request === latest.current) {
        setState({ data: res.data.data, loading: false, error: "" });
      }
    } catch (error) {
      if (request === latest.current) {
        setState({
          data: null,
          loading: false,
          error: error.response?.data?.message || "Unable to load this section. Please try again.",
        });
      }
    }
  }, [endpoint, paramKey]);

  useEffect(() => {
    if (enabled) load();
    return () => {
      latest.current += 1;
    };
  }, [load, enabled]);

  return { ...state, reload: load };
};

export default useAnalytics;