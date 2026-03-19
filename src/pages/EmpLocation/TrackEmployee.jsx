import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../../services/endpoints";
import API from "../../services/api";
import {
  Box,
  Heading,
  Select,
  Input,
  Button,
  HStack,
  VStack
} from "@chakra-ui/react";
import useUsersapi from "../../Apis/GetUsersapi";

const TrackEmployee = () => {

  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);

  const {users}=useUsersapi();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(40);

  //  Initialize Map ONLY ONCE
  useEffect(() => {
    const wait = setInterval(() => {
      if (window.mappls && document.getElementById("map") && !mapRef.current) {
        clearInterval(wait);

        mapRef.current = new window.mappls.Map("map", {
          center: { lat: 28.612964, lng: 77.229463 },
          zoom: 10,
        });
      }
    }, 100);

    return () => clearInterval(wait);
  }, []);

  //  Fetch Employees
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const res = await API.get(API_ENDPOINTS?.GET_USERS);
  //       setUsers(res.data.data);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  //  Fetch Route
  const fetchRoute = async () => {
    if (!selectedUser || !selectedDate || !mapRef.current) return;

    try {
      const res = await API.get(
        `${API_ENDPOINTS?.get_emp_route}?employeeId=${selectedUser}&date=${selectedDate}`
      );

      const locations = res.data.data;

      if (!locations.length) {
        alert("No data found");
        return;
      }

      const coordinates = locations.map((loc) => ({
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude),
      }));

      //  Remove old polyline
      if (polylineRef.current) {
        polylineRef.current.remove();
      }

      //  Remove old markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      //  Draw new polyline
      polylineRef.current = new window.mappls.Polyline({
        map: mapRef.current,
        path: coordinates,
        strokeColor: "#FF0000",
        strokeOpacity: 1,
        strokeWeight: 4,
      });

      //  Start Marker
      const startMarker = new window.mappls.Marker({
        map: mapRef.current,
        position: coordinates[0],
      });

      //  End Marker
      const endMarker = new window.mappls.Marker({
        map: mapRef.current,
        position: coordinates[coordinates.length - 1],
      });

      markersRef.current.push(startMarker, endMarker);

      // 🔹 Center map
      mapRef.current.setCenter(coordinates[0]);
      mapRef.current.setZoom(14);

    } catch (err) {
      console.log(err);
    }
  };

  return (
   <Box >
      <VStack align="start" spacing={6}>

        <Heading size="md">Employee Route Tracking</Heading>

        <HStack spacing={4}>

          <Select
            placeholder="Select Employee"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            width="250px"
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
            width="200px"
          />

          <Button
            colorScheme="blue"
            onClick={fetchRoute}
          >
            Show Route
          </Button>

        </HStack>

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