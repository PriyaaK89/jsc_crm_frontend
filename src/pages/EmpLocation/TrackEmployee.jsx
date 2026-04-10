import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Link } from "react-router-dom";
import API from "../../services/api";
import {
  Box, Heading, Select, Input, Button, VStack,
  SimpleGrid, Breadcrumb, BreadcrumbItem, BreadcrumbLink
} from "@chakra-ui/react";
import useUsersapi from "../../Apis/GetUsersapi";
import { GoHomeFill } from "react-icons/go";

const TrackEmployee = () => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const mapIdKey =  import.meta.env.VITE_GOOGLE_MAP_ID;
  const googleAPIKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
  console.log(mapIdKey, '1234567')

  const { users } = useUsersapi();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Initialize Map
useEffect(() => {
  const wait = setInterval(() => {
    if (window.google && window.google.maps && document.getElementById("map") && !mapRef.current) {
      clearInterval(wait);

      mapRef.current = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 28.612964, lng: 77.229463 },
        zoom: 10,
        mapId: mapIdKey, // Required for AdvancedMarkerElement
      });

      // Store polyline ref instead of DirectionsRenderer
      polylineRef.current = null;
    }
  }, 100);

  return () => clearInterval(wait);
}, []);

const fetchRoute = async () => {
  if (!selectedUser || !selectedDate || !mapRef.current) return;

  try {
    const res = await API.get(
      `${API_ENDPOINTS?.get_emp_route}?employeeId=${selectedUser}&date=${selectedDate}`
    );

    const locations = res.data.data;
    if (!locations.length) { alert("No data found"); return; }

    const coordinates = locations.map((loc) => ({
      lat: parseFloat(loc.latitude),
      lng: parseFloat(loc.longitude),
    }));

    // Clear old markers
    markersRef.current.forEach((marker) => marker.map = null);
    markersRef.current = [];

    // Clear old polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Build waypoints (Routes API supports up to 25 intermediates)
    const intermediates = coordinates.slice(1, -1).slice(0, 25).map((coord) => ({
      location: { latLng: { latitude: coord.lat, longitude: coord.lng } },
    }));

    // Call Routes API via fetch
    const routeRes = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googleAPIKey,
        "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
      },
      body: JSON.stringify({
        origin: {
          location: { latLng: { latitude: coordinates[0].lat, longitude: coordinates[0].lng } },
        },
        destination: {
          location: {
            latLng: {
              latitude: coordinates[coordinates.length - 1].lat,
              longitude: coordinates[coordinates.length - 1].lng,
            },
          },
        },
        intermediates,
        travelMode: "DRIVE",
      }),
    });

    const routeData = await routeRes.json();
    const encoded = routeData?.routes?.[0]?.polyline?.encodedPolyline;

    if (encoded) {
      // Decode and draw polyline
      const path = window.google.maps.geometry.encoding.decodePath(encoded);
      polylineRef.current = new window.google.maps.Polyline({
        path,
        map: mapRef.current,
        strokeColor: "#4285F4",
        strokeWeight: 5,
      });
    }

    // AdvancedMarkerElement for Start
    const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

    const startPin = document.createElement("div");
    startPin.innerHTML = `<div style="background:green;color:white;padding:4px 8px;border-radius:4px;font-size:12px;">Start</div>`;

    const startMarker = new AdvancedMarkerElement({
      map: mapRef.current,
      position: coordinates[0],
      content: startPin,
    });

    const endPin = document.createElement("div");
    endPin.innerHTML = `<div style="background:red;color:white;padding:4px 8px;border-radius:4px;font-size:12px;">End</div>`;

    const endMarker = new AdvancedMarkerElement({
      map: mapRef.current,
      position: coordinates[coordinates.length - 1],
      content: endPin,
    });

    markersRef.current.push(startMarker, endMarker);

    // Fit bounds
    const bounds = new window.google.maps.LatLngBounds();
    coordinates.forEach((coord) => bounds.extend(coord));
    mapRef.current.fitBounds(bounds);

  } catch (err) {
    console.error(err);
  }
};

  return (
    <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md">
      
      <Breadcrumb mb={4}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dashboard">
            <GoHomeFill color="blue" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink fontSize="13px" isCurrentPage>
            Employee Route Tracking
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <VStack align="start" spacing={6}>
        <Heading size="md">Employee Route Tracking</Heading>

        <Box display="flex" flexDir={{ base: "column", md: "row" }} gap={4} w="100%">
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
            <Select
              placeholder="Select Employee"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>

            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </SimpleGrid>

          <Button colorScheme="blue" onClick={fetchRoute} px={10}>
            Show Route
          </Button>

        </Box>

        <Box
          id="map"
          w="100%"
          h="500px"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
        />
      </VStack>
    </Box>
  );
};

export default TrackEmployee;