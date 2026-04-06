import { GoogleMap, Polyline, Marker, useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places"];

const containerStyle = {
  width: "100%",
  height: "500px",
};

const MapView = ({ path, start, end }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCr2zdpvio0ICkW40j7GH5N5iqvX-JOEJ4",
    libraries,
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={start || { lat: 28.612964, lng: 77.229463 }}
      zoom={12}
    >
      {path.length > 0 && (
        <Polyline path={path} options={{ strokeColor: "#FF0000" }} />
      )}

      {start && <Marker position={start} />}
      {end && <Marker position={end} />}
    </GoogleMap>
  );
};

export default MapView;