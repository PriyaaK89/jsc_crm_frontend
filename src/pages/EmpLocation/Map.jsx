import { useEffect } from "react";

const MapView = () => {

  useEffect(() => {
    const wait = setInterval(() => {
      if (window.mappls && document.getElementById("map")) {
        clearInterval(wait);

        new window.mappls.Map("map", {
          center: { lat: 28.612964, lng: 77.229463 },
          zoom: 12,
        });
      }
    }, 100);

    return () => clearInterval(wait);
  }, []);

  return (
    <div
      id="map"
      style={{ width: "100%", height: "500px" }}
    ></div>
  );
};

export default MapView;