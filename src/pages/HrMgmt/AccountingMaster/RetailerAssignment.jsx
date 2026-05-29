import React, { useEffect, useState } from 'react';

import {
  Box,
  FormControl,
  FormLabel,
  Select,
  Button,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Heading,
  useToast,
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";

import { Link } from "react-router-dom";

import useUsersapi from '../../../Apis/GetUsersapi';

import API from '../../../services/api';

import { API_ENDPOINTS } from '../../../services/endpoints';

function RetailerAssignment() {

  const toast = useToast();
  const { users } = useUsersapi();

  const [retailers, setRetailers] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignedEmployeeName, setAssignedEmployeeName] = useState("");


  const getRetailerList = async () => {

    try {

      const response = await API.get(
        API_ENDPOINTS.GET_ASSIGNED_RETAILER_LIST
      );

      if (response?.data?.success) {

        setRetailers(response?.data?.data || []);

      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch retailers",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    getRetailerList();
  }, []);

  const handleRetailerChange = (e) => {
    const retailerId = e.target.value;
    setSelectedRetailer(retailerId);
    // reset employee dropdown
    setSelectedEmployee("");
    const retailerData = retailers.find(
      (item) => item.retailer_id == retailerId
    );
    if (retailerData?.employee_name) {
      setAssignedEmployeeName(
        retailerData.employee_name
      );
    } else {
      setAssignedEmployeeName("");
    }
  };


  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };


  const handleAssignRetailertoEmployee = async () => {
    try {
      if (!selectedRetailer) {
        toast({
          title: "Validation Error",
          description: "Please select retailer",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      if (!selectedEmployee) {

        toast({
          title: "Validation Error",
          description: "Please select employee",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      setLoading(true);

      const payload = {

        retailer_id: selectedRetailer,

        employee_id: selectedEmployee,

      };

      const response = await API.post(
        API_ENDPOINTS.ASSIGN_RETAILER_TO_EMPLOYEE,
        payload
      );

      if (response?.data?.success) {

        toast({
          title: "Success",
          description: response?.data?.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // refresh retailer list
        getRetailerList();

      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);

    }

  };

  return (

    <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md" >

      <HStack justifyContent='space-between'>
        <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px'>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to='/dashboard'>
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>

            <BreadcrumbLink color='#8B8D97' fontSize='13px'>
              Assign Retailer
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Heading size="md" textAlign="left" mb={6} color="#3d3d3d">
        Assign Retailer
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <FormControl mt={5}>
          <FormLabel> Retailer Name </FormLabel>

          <Select fontSize="13px" placeholder='Select Retailer' value={selectedRetailer} onChange={handleRetailerChange}>

            {retailers?.map((item) => (
              <option key={item.retailer_id} value={item.retailer_id}>
                {item.retailer_name}
                {item?.firm_name ? ` (${item.firm_name})` : ""}
              </option>
            ))}

          </Select>
        </FormControl>

        <FormControl mt={5}>
          <FormLabel> Employee Under </FormLabel>

          <Select
            fontSize="13px"
            placeholder='Select Employee'
            value={selectedEmployee}
            onChange={handleEmployeeChange}
          >

            {users?.map((emp) => (

              <option
                key={emp.id}
                value={emp.id}
              >
                {emp.name}
              </option>

            ))}

          </Select>

        </FormControl>

      </SimpleGrid>

      {assignedEmployeeName && (

        <Box
          mt={6}
          p={4}
          border="1px solid #E2E8F0"
          borderRadius="lg"
          bg="blue.50">

          <Heading
            size="sm"
            color="blue.700"
            mb={2}>
            Currently Assigned Employee
          </Heading>

          <Box
            fontSize="14px"
            fontWeight="600"
            color="gray.700"
          >
            {assignedEmployeeName}
          </Box>

        </Box>

      )}
      <Box textAlign="end" mt={10}>

        <Button
          bg="#237086" fontWeight="500"
          fontSize="14px" color="white"
          px={8} borderRadius="12px"
          onClick={handleAssignRetailertoEmployee}
          isLoading={loading}
          loadingText="Assigning"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "md", bg: "#1B5A6B"
          }}
          transition="all 0.2s ease"
          borderRadius="xl"
        >
          Assign Retailer
        </Button>

      </Box>

    </Box>

  );

}

export default RetailerAssignment;