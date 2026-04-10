import { useState } from "react";
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
  BreadcrumbLink
} from "@chakra-ui/react";

import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

import MapView from "./Map"; // 👈 path check kar lena

const TrackEmployee = () => {

  const { users } = useUsersapi();

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [path, setPath] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const fetchRoute = async () => {
    if (!selectedUser || !selectedDate) return;

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

      setPath(coordinates);
      setStart(coordinates[0]);
      setEnd(coordinates[coordinates.length - 1]);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box bg="white" p={4} borderRadius="lg" boxShadow="md">

      <Breadcrumb mb={4}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dashboard">
            <GoHomeFill color="blue" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink isCurrentPage>
            Employee Route Tracking
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <VStack align="start" spacing={6}>

        <Heading size="md">Employee Route Tracking</Heading>

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

        <Button colorScheme="blue" onClick={fetchRoute}>
          Show Route
        </Button>

        {/* ✅ MAP */}
        <MapView path={path} start={start} end={end} />

      </VStack>
    </Box>
  );
};

export default TrackEmployee;