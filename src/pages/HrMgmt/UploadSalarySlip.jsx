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
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

const UploadSalarySlip = () => {
  const toast = useToast();

  const [employeeList, setEmployeeList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    month: "",
  });

  const [file, setFile] = useState(null);

  const labelStyles = {
    fontSize: "12px",
    color: "#686868",
    marginBottom: "3px"
  };

  // 🔹 Fetch Employees
  const fetchEmployeeList = async () => {
    try {
      const response = await API.get(API_ENDPOINTS.GET_USERS);
      if (response?.status === 200) {
        setEmployeeList(response.data.data || []);
      }
    } catch (error) {
      toast({
        title: "Failed to load employees",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchEmployeeList();
  }, []);

  
  // 🔹 Handle File
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

 // 🔹 Handle Change
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "employeeId") {
    const selectedEmployee = employeeList.find(
      (emp) => String(emp.id) === String(value)
    );

    setFormData((prev) => ({
      ...prev,
      employeeId: value,
      employeeName: selectedEmployee?.name || "",
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};
const handleSubmit = async () => {
  try {
    if (!formData.employeeId || !formData.month || !file) {
      toast({
        title: "All fields are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append("emp_id", formData.employeeId);
    data.append("emp_name", formData.employeeName);
    data.append("month", formData.month);
    data.append("salary_slip", file);

    const response = await API.post(
      API_ENDPOINTS.upload_salary_slip,
      data,{
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }
    );

    if (response?.status === 200) {
      toast({
        title: "Salary slip uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setFormData({
        employeeId: "",
        employeeName: "",
        month: "",
      });
      setFile(null);
    }
  } catch (error) {
    console.error(error);
    toast({
      title: "Upload failed",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <Box bg="white" borderRadius="10px" p={6}>
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
              value={formData.employeeId}
              onChange={handleChange}
            >
              {employeeList.map((emp) => (
                <option key={emp.id} value={emp.id}>
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
              value={formData.month}
              onChange={handleChange}
            />
          </FormControl>

          {/* File */}
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
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          Upload Salary Slip
        </Button>
      </VStack>
    </Box>
  );
};

export default UploadSalarySlip;