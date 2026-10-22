import React, { useEffect, useRef, useState, useCallback } from "react";
import { Box, Flex, Text, Badge, Spinner, Center, Grid } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { loadGoogleMaps, GOOGLE_MAP_ID } from "../../utils/loadGoogleMaps";

const POLL_MS = 15000;

const fmtDist = (m) =>
  m === null || m === undefined || Number.isNaN(Number(m))
    ? "-"
    : Number(m) < 1000
    ? `${Math.round(Number(m))} m`
    : `${(Number(m) / 1000).toFixed(2)} km`;

const fmtDur = (sec) => {
  if (sec === null || sec === undefined) return "-";
  const s = Number(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
};

// epoch ms (device time) -> IST text; timezone-proof because it is an epoch
const fmtTime = (ms) =>
  ms
    ? new Date(ms).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

const Stat = ({ label, value }) => (
  <Box>
    <Text fontSize="10px" color="gray.500" textTransform="uppercase">{label}</Text>
    <Text fontSize="13px" fontWeight="600" color="gray.800">{value || "-"}</Text>
  </Box>
);

/**
 * props.track = a row from GET /:id/tracks (or null)
 */
const FieldRouteMap = ({ track }) => {
  const trackId = track?.id;
  const isActive = track?.status === "ACTIVE";

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const libsRef = useRef(null);
  const overlaysRef = useRef([]);
  const fittedRef = useRef(false);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(!!trackId);
  const [error, setError] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // ---------------- load track points (poll while ACTIVE) ----------------
  const fetchDetail = useCallback(
    async (silent) => {
      try {
        const res = await API.get(API_ENDPOINTS.demo_track_detail(trackId));
        if (res?.data?.success) {
          setDetail(res.data.data);
          setError("");
        }
      } catch (e) {
        if (!silent) setError(e?.response?.data?.message || "Failed to load route");
      } finally {
        setLoading(false);
      }
    },
    [trackId]
  );

  useEffect(() => {
    if (!trackId) return undefined;
    setLoading(true);
    setDetail(null);
    fittedRef.current = false;
    fetchDetail(false);
    if (!isActive) return undefined;
    const t = setInterval(() => fetchDetail(true), POLL_MS);
    return () => clearInterval(t);
  }, [trackId, isActive, fetchDetail]);

  // ---------------- create the map once ----------------
  useEffect(() => {
    if (!trackId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const g = await loadGoogleMaps();
        const [{ Map, Polyline }, { AdvancedMarkerElement, PinElement }, { LatLngBounds }] =
          await Promise.all([
            g.importLibrary("maps"),
            g.importLibrary("marker"),
            g.importLibrary("core"),
          ]);
        if (cancelled || !mapDivRef.current) return;
        libsRef.current = { Polyline, AdvancedMarkerElement, PinElement, LatLngBounds, g };
        mapRef.current = new Map(mapDivRef.current, {
          mapId: GOOGLE_MAP_ID,
          center: { lat: 26.9124, lng: 75.7873 },
          zoom: 12,
          mapTypeId: "hybrid", // satellite + labels: best for fields
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
        });
        setMapReady(true);
      } catch (e) {
        if (!cancelled) setError(e.message || "Map failed to load");
      }
    })();
    return () => {
      cancelled = true;
      overlaysRef.current.forEach((o) => (o.setMap ? o.setMap(null) : (o.map = null)));
      overlaysRef.current = [];
      mapRef.current = null;
      setMapReady(false);
    };
  }, [trackId]);

  // ---------------- draw route whenever data changes ----------------
  useEffect(() => {
    if (!mapReady || !detail || !mapRef.current || !libsRef.current) return;
    const { Polyline, AdvancedMarkerElement, PinElement, LatLngBounds, g } = libsRef.current;
    const map = mapRef.current;

    overlaysRef.current.forEach((o) => (o.setMap ? o.setMap(null) : (o.map = null)));
    overlaysRef.current = [];

    const pts = (detail.points || []).map((p) => ({ lat: p.lat, lng: p.lng }));
    if (!pts.length) return;

    const addPin = (position, glyph, bg, border, title) => {
      const pin = new PinElement({
        background: bg,
        borderColor: border,
        glyphColor: "#ffffff",
        glyph,
      });
      const m = new AdvancedMarkerElement({ map, position, content: pin.element, title });
      overlaysRef.current.push(m);
    };

    if (pts.length > 1) {
      // white casing under the coloured line for contrast on satellite view
      const casing = new Polyline({
        map, path: pts, strokeColor: "#ffffff", strokeOpacity: 0.9, strokeWeight: 8,
      });
      const line = new Polyline({
        map,
        path: pts,
        strokeColor: "#237086",
        strokeOpacity: 1,
        strokeWeight: 5,
        icons: [
          {
            icon: {
              path: g.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 2.5,
              strokeColor: "#ffffff",
              fillColor: "#237086",
              fillOpacity: 1,
            },
            offset: "50px",
            repeat: "90px",
          },
        ],
      });
      overlaysRef.current.push(casing, line);
    }

    const first = pts[0];
    const last = pts[pts.length - 1];
    addPin(first, "S", "#2f9e44", "#1b6b2f", "Start");
    if (detail.track?.status === "ACTIVE") {
      addPin(last, "●", "#1c7ed6", "#14558f", "Current position");
    } else if (pts.length > 1) {
      addPin(last, "E", "#e03131", "#a61e1e", "End");
    }

    // fit once; live refreshes don't move the admin's view
    if (!fittedRef.current) {
      if (pts.length === 1) {
        map.setCenter(first);
        map.setZoom(17);
      } else {
        const b = new LatLngBounds();
        pts.forEach((p) => b.extend(p));
        map.fitBounds(b, 48);
      }
      fittedRef.current = true;
    }
  }, [mapReady, detail]);

  // ---------------- render ----------------
  if (!track) {
    return (
      <Box border="1px dashed #cbd5d1" borderRadius="6px" p={4} bg="#fafcfb">
        <Text fontSize="12px" color="gray.500">
          No field tracking recorded for this stage.
        </Text>
      </Box>
    );
  }

  const t = detail?.track || track;
  const pts = detail?.points || [];
  const startedMs = pts.length ? pts[0].t : null;
  const lastMs = pts.length ? pts[pts.length - 1].t : null;

  return (
    <Box border="1px solid #d0d7de" borderRadius="6px" overflow="hidden">
      <Flex bg="#eef5f4" px={4} py={2} justify="space-between" align="center" wrap="wrap" gap={2}>
        <Text fontSize="13px" fontWeight="600" color="#1b5a6b">Field Route</Text>
        <Flex gap={2} align="center">
          {isActive && <Badge colorScheme="blue">● LIVE</Badge>}
          <Badge colorScheme={t.status === "ENDED" ? "green" : "blue"}>{t.status}</Badge>
          {!t.linked && t.status === "ENDED" && (
            <Badge colorScheme="orange" title="Result not submitted yet">Not linked</Badge>
          )}
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(6, 1fr)" }} gap={3} px={4} py={3} bg="#fafcfb">
        <Stat label="Distance" value={fmtDist(t.total_distance_m)} />
        <Stat label="Duration" value={fmtDur(t.duration_sec)} />
        <Stat label="GPS points" value={String(t.point_count ?? pts.length)} />
        <Stat label="Employee" value={t.employee_name} />
        <Stat label="Started" value={fmtTime(startedMs)} />
        <Stat label={isActive ? "Last seen" : "Ended"} value={fmtTime(lastMs)} />
      </Grid>

      <Box position="relative" h={{ base: "320px", md: "420px" }} bg="#e5e3df">
        <Box ref={mapDivRef} w="100%" h="100%" />
        {(loading || (!mapReady && !error)) && (
          <Center position="absolute" inset={0} bg="rgba(255,255,255,0.6)">
            <Spinner color="#4f9190" />
          </Center>
        )}
        {error && (
          <Center position="absolute" inset={0} bg="rgba(255,255,255,0.85)" p={4}>
            <Text fontSize="12px" color="red.500" textAlign="center">{error}</Text>
          </Center>
        )}
        {!loading && !error && detail && pts.length === 0 && (
          <Center position="absolute" inset={0} bg="rgba(255,255,255,0.85)">
            <Text fontSize="12px" color="gray.600">No GPS points were recorded.</Text>
          </Center>
        )}
      </Box>

      {detail && detail.total_points > detail.returned_points && (
        <Text fontSize="10.5px" color="gray.500" px={4} py={1}>
          Showing {detail.returned_points} of {detail.total_points} points (sampled for speed).
        </Text>
      )}
    </Box>
  );
};

export default FieldRouteMap;