// Vite:
const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const GOOGLE_MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || "DEMO_MAP_ID";
// CRA: replace the two lines above with
// const KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
// export const GOOGLE_MAP_ID = process.env.REACT_APP_GOOGLE_MAP_ID || "DEMO_MAP_ID";

let loaderPromise = null;

export function loadGoogleMaps() {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (!KEY) {
      loaderPromise = null;
      return reject(new Error("Google Maps API key is missing in .env"));
    }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}&v=weekly&loading=async`;
    s.async = true;
    s.onload = () => {
      if (window.google?.maps?.importLibrary) resolve(window.google.maps);
      else {
        loaderPromise = null;
        reject(new Error("Google Maps failed to initialise"));
      }
    };
    s.onerror = () => {
      loaderPromise = null;
      reject(new Error("Could not load Google Maps script"));
    };
    document.head.appendChild(s);
  });
  return loaderPromise;
}