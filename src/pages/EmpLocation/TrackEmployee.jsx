import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Heading,
  Select,
  Input,
  Button,
  VStack,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  HStack,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import MapView from "./Map";

const MAX_SPEED_MPS = 45;
const MAX_POINTS_PER_REQUEST = 100;

const TrackEmployee = () => {
  const { users = [] } = useUsersapi();

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [path, setPath] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [totalDistanceKm, setTotalDistanceKm] = useState("0.00");
  const [totalTravelTime, setTotalTravelTime] = useState("0 min");
  const [loading, setLoading] = useState(false);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  const haversineMeters = (a, b) => {
    const R = 6371000;
    const toRad = (v) => (v * Math.PI) / 180;

    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) *
        Math.cos(toRad(b.lat)) *
        Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };

  const formatDuration = (ms) => {
    if (!ms || ms <= 0) return "0 min";

    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
    if (hours > 0) return `${hours} hr`;
    return `${minutes} min`;
  };

  const isValidPoint = (lastPoint, newPoint) => {
    if (!lastPoint) return true;

    const distance = haversineMeters(lastPoint, newPoint);

    if (!lastPoint.ts || !newPoint.ts) {
      return distance <= 1000;
    }

    const seconds = (newPoint.ts - lastPoint.ts) / 1000;
    if (seconds <= 0) return false;

    const speed = distance / seconds;
    return speed <= MAX_SPEED_MPS;
  };

 const chunkPoints = (arr, size = 100) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};


  const snapChunkToRoads = async (points) => {
  const cleanPoints = points
    .map((p) => ({
      lat: Number(p.lat),
      lng: Number(p.lng),
    }))
    .filter(
      (p) =>
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng) &&
        p.lat >= -90 &&
        p.lat <= 90 &&
        p.lng >= -180 &&
        p.lng <= 180
    );

  if (cleanPoints.length < 2) {
    return cleanPoints;
  }

  if (cleanPoints.length > 100) {
    throw new Error("Roads API allows at most 100 points per request");
  }

  const pathParam = cleanPoints
    .map((p) => `${p.lat.toFixed(7)},${p.lng.toFixed(7)}`)
    .join("|");

  const url =
    `https://roads.googleapis.com/v1/snapToRoads` +
    `?path=${encodeURIComponent(pathParam)}` +
    `&interpolate=true` +
    `&key=${encodeURIComponent(googleApiKey)}`;

  const response = await fetch(url);
  const data = await response.json();

  console.log("Snap URL:", url);
  console.log("Snap status:", response.status);
  console.log("Snap response:", data);
  console.log("points count:", cleanPoints.length);
console.log("first points:", cleanPoints.slice(0, 5));


  if (!response.ok) {
    throw new Error(data?.error?.message || "Snap to Roads failed");
  }

  return (data.snappedPoints || []).map((point) => ({
    lat: point.location.latitude,
    lng: point.location.longitude,
  }));
};

  const snapPointsToRoads = async (points) => {
    if (points.length <= MAX_POINTS_PER_REQUEST) {
      return snapChunkToRoads(points);
    }

    const chunks = chunkPoints(points, MAX_POINTS_PER_REQUEST);
    const finalPath = [];

    for (let i = 0; i < chunks.length; i += 1) {
      const snappedChunk = await snapChunkToRoads(chunks[i]);

      if (i > 0 && snappedChunk.length > 0) {
        snappedChunk.shift();
      }

      finalPath.push(...snappedChunk);
    }

    return finalPath;
  };

  const resetRouteState = () => {
    setPath([]);
    setStart(null);
    setEnd(null);
    setTotalDistanceKm("0.00");
    setTotalTravelTime("0 min");
  };

  const fetchRoute = async () => {
    if (!selectedUser || !selectedDate) return;

    try {
      setLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS.get_emp_route}?employeeId=${selectedUser}&date=${selectedDate}`
      );

      const locations = response?.data?.data || [];

      if (!locations.length) {
        resetRouteState();
        alert("No route data found");
        return;
      }

      const parsedPoints = locations
        .map((loc) => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);

          const rawTime =
            loc.timestamp ||
            loc.created_at ||
            loc.updated_at ||
            loc.logged_at ||
            loc.track_time ||
            null;

          const ts = rawTime ? new Date(rawTime).getTime() : null;

          if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return null;
          }

          return { lat, lng, ts };
        })
        .filter(Boolean)
        .sort((a, b) => (a.ts || 0) - (b.ts || 0));

      const validPoints = [];
      for (const point of parsedPoints) {
        const lastPoint = validPoints[validPoints.length - 1];
        if (isValidPoint(lastPoint, point)) {
          validPoints.push(point);
        }
      }

      if (validPoints.length < 2) {
        resetRouteState();
        alert("Not enough valid points found");
        return;
      }

      const rawPath = validPoints.map((point) => ({
        lat: point.lat,
        lng: point.lng,
      }));

      let snappedPath = [];
      try {
        snappedPath = await snapPointsToRoads(validPoints);
      } catch (snapError) {
        console.error("Snap to Roads failed:", snapError);
      }

      const finalPath = snappedPath.length > 1 ? snappedPath : rawPath;

      setPath(finalPath);
      setStart(rawPath[0]);
      setEnd(rawPath[rawPath.length - 1]);

      let totalMeters = 0;
      for (let i = 1; i < validPoints.length; i += 1) {
        totalMeters += haversineMeters(validPoints[i - 1], validPoints[i]);
      }
      setTotalDistanceKm((totalMeters / 1000).toFixed(2));

      const firstTs = validPoints[0]?.ts;
      const lastTs = validPoints[validPoints.length - 1]?.ts;
      setTotalTravelTime(
        firstTs && lastTs && lastTs > firstTs
          ? formatDuration(lastTs - firstTs)
          : "N/A"
      );
    } catch (error) {
      console.error("Route fetch failed:", error);
      resetRouteState();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
    >
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

        <Box
          display="flex"
          flexDir={{ base: "column", md: "row" }}
          gap={4}
          w="100%"
        >
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

          <Button
            colorScheme="blue"
            onClick={fetchRoute}
            px={10}
            isLoading={loading}
          >
            Show Route
          </Button>
        </Box>

        <HStack spacing={8} flexWrap="wrap">
          <Box>
            <Text fontSize="sm" color="gray.500">
              Total Distance
            </Text>
            <Text fontSize="lg" fontWeight="600">
              {totalDistanceKm} km
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.500">
              Total Travel Time
            </Text>
            <Text fontSize="lg" fontWeight="600">
              {totalTravelTime}
            </Text>
          </Box>
        </HStack>

        <MapView path={path} start={start} end={end} />
      </VStack>
    </Box>
  );
};

export default TrackEmployee;
