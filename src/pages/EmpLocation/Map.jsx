

// import { useEffect, useRef } from "react";
// import { GoogleMap, Polyline, Marker, useJsApiLoader } from "@react-google-maps/api";

// const libraries = ["geometry"];

// const containerStyle = {
//   width: "100%",
//   height: "500px",
// };

// const defaultCenter = { lat: 28.612964, lng: 77.229463 };

// const MapView = ({ path = [], start = null, end = null }) => {
//   const mapRef = useRef(null);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: "AIzaSyCr2zdpvio0ICkW40j7GH5N5iqvX-JOEJ4",
//     libraries,
//   });

//   useEffect(() => {
//     if (!mapRef.current) return;
//     if (!window.google) return;
//     if (!path.length) return;

//     const bounds = new window.google.maps.LatLngBounds();
//     path.forEach((point) => bounds.extend(point));
//     mapRef.current.fitBounds(bounds);
//   }, [path]);

//   if (!isLoaded) return <div>Loading map...</div>;

//   return (
//     <GoogleMap
//       mapContainerStyle={containerStyle}
//       center={start || defaultCenter}
//       zoom={12}
//       onLoad={(map) => {
//         mapRef.current = map;
//       }}
//     >
//       {path.length > 1 && (
//         <Polyline
//           path={path}
//           options={{
//             strokeColor: "#FF0000",
//             strokeOpacity: 1,
//             strokeWeight: 4,
//           }}
//         />
//       )}

//       {start && <Marker position={start} label="S" />}
//       {end && <Marker position={end} label="E" />}
//     </GoogleMap>
//   );
// };

// export default MapView;


import { useCallback, useRef } from "react";
import {
  GoogleMap,
  Polyline,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

const libraries = [];

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 28.612964, lng: 77.229463 };

const MapView = ({ path = [], start = null, end = null }) => {
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries,
  });

  const handleLoad = useCallback(
    (map) => {
      mapRef.current = map;

      const bounds = new window.google.maps.LatLngBounds();

      if (path.length > 1) {
        path.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds);
        return;
      }

      if (start) {
        bounds.extend(start);
      }

      if (end) {
        bounds.extend(end);
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      } else {
        map.setCenter(defaultCenter);
        map.setZoom(12);
      }
    },
    [path, start, end]
  );

  const handleUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  if (loadError) {
    return <div>Map loading failed.</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={start || defaultCenter}
      zoom={12}
      onLoad={handleLoad}
      onUnmount={handleUnmount}
    >
      {path.length > 1 && (
        <Polyline
          path={path}
          options={{
            strokeColor: "#E53E3E",
            strokeOpacity: 1,
            strokeWeight: 4,
          }}
        />
      )}

      {start && <Marker position={start} label="S" />}
      {end && <Marker position={end} label="E" />}
    </GoogleMap>
  );
};

export default MapView;

