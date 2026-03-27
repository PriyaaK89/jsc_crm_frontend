import {
  Box,
  Text,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Heading,
  Divider,
  Badge,
  Spinner,
  Flex,
  Avatar,
  VStack
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { useParams } from "react-router-dom";
import {Link} from "react-router-dom";

const InfoCard = ({ label, value }) => (
  <Box
    p={4}
    bg="white"
    borderRadius="10px"
    border="1px solid #EDF2F7"
    _hover={{ boxShadow: "md" }}
  >
    <Text fontSize="12px" color="gray.500">
      {label}
    </Text>

    <Text fontWeight="600" fontSize="14px">
      {value || "N/A"}
    </Text>
  </Box>
);

const ViewEmployeeDetails = () => {

  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const getEmployeeDetails = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS.get_emp_details}/${id}`
      );

      setEmployee(response?.data?.data);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployeeDetails();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" mt="120px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!employee) return null;

  return (
    <Box  minH="100vh" >

      {/* Breadcrumb */}
      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dashboard">
            <GoHomeFill color="#5570F1" />
          </BreadcrumbLink>
        </BreadcrumbItem>
         <BreadcrumbItem>
          <BreadcrumbLink as={Link} fontSize="13px" to="/hr-mgmt/view-employee-list">
            Employee List
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>   
          <BreadcrumbLink fontSize="13px">
            Employee Details
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Profile Header */}
      <Box
        bg="white"
        p={4}
        borderRadius="12px"
        boxShadow="sm"
        mb={6}
      >
        <Flex justify="space-between" align="center">

          <HStack spacing={4}>
            <Avatar
              name={employee.name}
              size="lg"
              bg="blue.500"
              color="white"
            />

            <VStack align="start" spacing={0}>
              <Heading size="md">{employee.name}</Heading>

              <Text fontSize="sm" color="gray.500">
                {employee.job_role_name}
              </Text>

              <Text fontSize="sm" color="gray.500">
                {employee.department_name}
              </Text>
            </VStack>
          </HStack>

          <Badge colorScheme="green" fontSize="13px" px={3} py={1}>
            {employee.role}
          </Badge>

        </Flex>
      </Box>

      {/* PERSONAL INFORMATION */}
      <Box bg="white" p={4} borderRadius="12px" boxShadow="sm" mb={6}>
        <Heading size="sm" mb={4}>Personal Information</Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <InfoCard label="Name" value={employee.name} />
          <InfoCard label="Email" value={employee.email} />
          <InfoCard label="Contact" value={employee.contact_no} />
          <InfoCard label="Gender" value={employee.gender} />
          <InfoCard
            label="Date of Birth"
            value={new Date(employee.date_of_birth).toLocaleDateString()}
          />
          <InfoCard label="Father Name" value={employee.father_name} />
          <InfoCard label="PAN Number" value={employee.pan_number} />
          <InfoCard label="Aadhar Number" value={employee.aadhar_no} />
          <InfoCard label="Blood Group" value={employee.blood_group} />
        </SimpleGrid>
      </Box>

      {/* ADDRESS */}
      <Box bg="white" p={6} borderRadius="12px" boxShadow="sm" mb={6}>
        <Heading size="sm" mb={4}>Address Details</Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <InfoCard label="Address Line 1" value={employee.address_line1} />
          <InfoCard label="Address Line 2" value={employee.address_line2} />
          <InfoCard label="Country" value={employee.country} />
          <InfoCard label="State" value={employee.state} />
          <InfoCard label="City" value={employee.city} />
          <InfoCard label="District" value={employee.district} />
          <InfoCard label="Area" value={employee.area} />
          <InfoCard label="Pincode" value={employee.pincode} />
        </SimpleGrid>
      </Box>

      {/* JOB INFORMATION */}
      <Box bg="white" p={6} borderRadius="12px" boxShadow="sm" mb={6}>
        <Heading size="sm" mb={4}>Job Information</Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <InfoCard label="Department" value={employee.department_name} />
          <InfoCard label="Job Role" value={employee.job_role_name} />
          <InfoCard
            label="Date of Joining"
            value={new Date(employee.date_of_joining).toLocaleDateString()}
          />
          <InfoCard label="Salary" value={`₹ ${employee.salary}`} />
          <InfoCard label="Headquarter" value={employee.headquarter} />
          <InfoCard label="Approver" value={employee.approver_name} />
        </SimpleGrid>

        
      </Box>

      {/* ALLOWANCES */}
      <Box bg="white" p={6} borderRadius="12px" boxShadow="sm">
        <Heading size="sm" mb={4}>Allowances</Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <InfoCard label="Travel Allowance / KM" value={employee.travelling_allowance_per_km} />
          <InfoCard label="Avg Travel KM / Day" value={employee.avg_travel_km_per_day} />
          <InfoCard label="City Allowance / KM" value={employee.city_allowance_per_km} />
          <InfoCard label="Daily Allowance With Doc" value={employee.daily_allowance_with_doc} />
          <InfoCard label="Daily Allowance Without Doc" value={employee.daily_allowance_without_doc} />
          <InfoCard label="Hotel Allowance" value={employee.hotel_allowance} />
        </SimpleGrid>
      </Box>

    </Box>
  );
};

export default ViewEmployeeDetails;