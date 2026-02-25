import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import {
  Box,
  Button,
  Select,
  Text,
  SimpleGrid,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Center,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

const UploadSalarySlip = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);


  const labelStyles = {
    fontSize: "12px",
    color: "#686868",
    marginBottom: "3px"
  };

  // 🔹 Fetch Employee List
  const fetchEmployeeList = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.GET_USERS);

      if (response?.status === 200) {
        setEmployeeList(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to load employees",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeList();
  }, []);

  // handlechange
  const handleChange = () => {
  }


  // 🔹 Handle File Change
  const handleFileChange = () => {

  };

  // 🔹 Handle Submit
  const handleSubmit = async () => {

  }

  return (
    <>
      <Box bg="white" borderRadius="10px" p={6}>

        {/* 🔹 Breadcrumb */}
        <HStack justifyContent="space-between">
          <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink
                href="/hr-mgmt/view-employee-list"
                fontSize="13px"
              >
                Employee List
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontSize="13px">
                Upload Salary Slip
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </HStack>

        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          Upload Salary Slip
        </Text>

        <VStack spacing={6} align="stretch">

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>

            {/* Employee */}
            <FormControl isRequired>
              <FormLabel {...labelStyles}>Employee Name</FormLabel>
              <Select
                placeholder="Select Employee"
                name="employeeId"
                // value={formData.employeeId}
                onChange={handleChange}
              >
                {employeeList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Month */}
            <FormControl isRequired>
              <FormLabel {...labelStyles}>Select Month</FormLabel>
              <Input
                type="month"
                name="month"
                // value={formData.month}
                onChange={handleChange}
              />
            </FormControl>

            {/* File Upload */}
            <FormControl isRequired>
              <FormLabel {...labelStyles}>
                Upload Salary Slip (PDF/Image)
              </FormLabel>
              <Input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
              />
            </FormControl>
          </SimpleGrid>

          <Button
            colorScheme="blue"
            alignSelf="center"
            // isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Upload Salary Slip
          </Button>

        </VStack>
      </Box>
    </>
  );
};

export default UploadSalarySlip;