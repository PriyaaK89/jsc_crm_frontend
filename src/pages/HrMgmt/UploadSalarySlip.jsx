import React, { useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Box, Button, Select, Text, SimpleGrid, VStack, useToast, FormControl, FormLabel, Input, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink,} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import useUsersapi from "../../Apis/GetUsersapi";

const UploadSalarySlip = () => {
  const toast = useToast();
  // --------------featch employee---
  const {users}=useUsersapi();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ employeeId: "", employeeName: "", month: "",});
  const [file, setFile] = useState(null);
  const labelStyles = { fontSize: "12px", color: "#686868", marginBottom: "3px", };

  // 🔹 Handle File
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 🔹 Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "employeeId") {
      const selectedEmployee = users.find(
        (emp) => String(emp.id) === String(value),
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

    // 🔹 Validation
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

    // 🔹 FormData
    const data = new FormData();
    data.append("emp_id", formData.employeeId);
    data.append("emp_name", formData.employeeName);
    data.append("month", formData.month);
    data.append("salary_slip", file);

    // 🔹 API Call
    const response = await API.post(
      API_ENDPOINTS.upload_salary_slip,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // 🔹 Success Toast
    if (response?.status === 201) {
      toast({
        title: "Salary slip uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // 🔹 Reset Form
      setFormData({
        employeeId: "",
        employeeName: "",
        month: "",
      });

      setFile(null);
    }

  } catch (error) {

    // 🔹 Duplicate Month Error
    if (error.response?.status === 409) {
      toast({
        title: "Salary slip already uploaded for this month",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    console.error(error);

  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <Box bg="white" borderRadius="lg" p={6}>
      <HStack justifyContent="space-between" flexWrap="wrap">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>


          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="13px">Upload Salary Slip</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Text fontSize="lg" fontWeight="bold" mb={6}>
        Upload Salary Slip
      </Text>

      <VStack spacing={6} align="stretch">
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={{ base: 4, md: 6 }}
        >
          {/* Employee */}
          <FormControl isRequired>
            <FormLabel {...labelStyles}>Employee Name</FormLabel>
            <Select
              placeholder="Select Employee"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
            >
              {users.map((emp) => (
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
            <Input type="file" accept=".pdf,.jpg,.png" onChange={handleFileChange} p={1}/>
          </FormControl>
        </SimpleGrid>

        <Button colorScheme="blue" alignSelf="center" isLoading={isSubmitting} onClick={handleSubmit}>
          Upload Salary Slip
        </Button>
      </VStack>
    </Box>
  );
};

export default UploadSalarySlip;
