import React, { useEffect, useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Grid, Heading, Input, Select, Text, useToast, VStack, Wrap, WrapItem, Tag, TagLabel, TagCloseButton, Spinner, Card, CardBody, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import ReactSelect from "react-select";

const AssignTargetIndividual = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const [formData, setFormData] = useState({
    role: "",
    user_id: "",
    target_type: "",
    duration_type: "",
    start_date: "",
    target_amount: ""
  });

    const roleLevelMap = {
    ZSM: 1,
    RSM: 2,
    ASM: 3,
    TSM: 4,
    SM: 5,
    FA: 6
  };

  // ================= FETCH STOCK CATEGORIES =================

  const getStockCategories = async () => {
    try {
      const response = await API.get(
        API_ENDPOINTS.View_stock_category
      );

      setCategories(response?.data?.data || []);
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch categories",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  // ================= FETCH EMPLOYEES BY ROLE =================

  const getEmployeesByRole = async (role) => {
    try {
      setLoading(true);

       const level = roleLevelMap[role];
     
           const res = await API.get(
             `${API_ENDPOINTS.get_users_by_role}/${level}`
           );

      setEmployees(res.data.data || res.data || []);
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch employees",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // fetch employees after role select
    if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value,
        user_id: ""
      }));

      getEmployeesByRole(value);
    }
  };

  // ================= SUBMIT =================

  const handleAssignTargetToEmployee = async () => {
    try {
      if (selectedCategories.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please select at least one category",
          status: "warning",
          duration: 3000,
          isClosable: true
        });

        return;
      }

      const payload = {
        ...formData,
        categories: selectedCategories.map((cat) => cat.value)
      };

      const response = await API.post(
        API_ENDPOINTS.assign_individual_targets,
        payload
      );

      toast({
        title: "Success",
        description:
          response?.data?.message ||
          "Target assigned successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      // reset form

      setFormData({
        role: "",
        user_id: "",
        target_type: "",
        duration_type: "",
        start_date: "",
        target_amount: ""
      });

      setSelectedCategories([]);
      setEmployees([]);

    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    getStockCategories();
  }, []);

  const categoryOptions = categories.map((cat) => ({
  value: cat.id,
  label: cat.name
}));

  return (
    <Box p={0} >
          <VStack spacing={6} align="stretch">
            <Grid
              templateColumns={{
                base: "1fr",
                md: "1fr 1fr"
              }}
              gap={5}
            >

              {/* ROLE */}

              <FormControl isRequired>
                <FormLabel>Select Role</FormLabel>

                <Select
                  placeholder="Select Role"
                  name="role" bg="white" color="gray.700"
            fontSize="15px"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="ZSM">ZSM</option>
                  <option value="RSM">RSM</option>
                  <option value="ASM">ASM</option>
                  <option value="TSM">TSM</option>
                  <option value="SM">SM</option>
                  <option value="FA">FA</option>
                </Select>
              </FormControl>

              {/* EMPLOYEE */}

              <FormControl isRequired>
                <FormLabel>Select Employee</FormLabel>

                <Select
                  placeholder={
                    loading
                      ? "Loading employees..."
                      : "Select Employee"
                  } bg="white"
                  name="user_id" color="gray.700"
            fontSize="15px"
                  value={formData.user_id}
                  onChange={handleChange}
                >
                  {employees.map((emp) => (
                    <option
                      key={emp.id}
                      value={emp.id}
                    >
                      {emp.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* TARGET TYPE */}

              <FormControl isRequired>
                <FormLabel>Target Type</FormLabel>

                <Select
                  placeholder="Select Target Type"
                  name="target_type" bg="white"
                  value={formData.target_type}
                  onChange={handleChange} color="gray.700"
            fontSize="15px"
                >
                  <option value="SALE">SALE</option>
                  <option value="COLLECTION">
                    COLLECTION
                  </option>
                </Select>
              </FormControl>

              {/* DURATION */}

              <FormControl isRequired>
                <FormLabel>Duration Type</FormLabel>

                <Select
                  placeholder="Select Duration"
                  name="duration_type" bg="white"
                  value={formData.duration_type}
                  onChange={handleChange} color="gray.700"
            fontSize="15px"
                >
                  <option value="MONTHLY">
                    MONTHLY
                  </option>

                  <option value="QUARTERLY">
                    QUARTERLY
                  </option>

                  <option value="HALF_YEARLY">
                    HALF YEARLY
                  </option>

                  <option value="YEARLY">
                    YEARLY
                  </option>
                </Select>
              </FormControl>

              {/* START DATE */}

              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>

                <Input
                  type="date"
                  name="start_date" bg="white" placeholder="Enter Start Date"
                  value={formData.start_date}
                  onChange={handleChange} color="gray.700"
            fontSize="15px"
                />
              </FormControl>

              {/* TARGET AMOUNT */}

              <FormControl isRequired>
                <FormLabel>Target Amount</FormLabel>

                <Input
                  type="number"
                  placeholder="Enter target amount"
                  name="target_amount"
                  value={formData.target_amount} bg="white"
                  onChange={handleChange}
                />
              </FormControl>

            </Grid>

            <FormControl isRequired>
  <FormLabel>Select Product Categories</FormLabel>

  <ReactSelect
    isMulti
    options={categoryOptions}
    value={selectedCategories}
    onChange={(selected) =>
      setSelectedCategories(selected || [])
    }
    placeholder="Select Categories" bg="white" 
  />
</FormControl>


            {/* BUTTON */}

            <HStack justify="flex-end">

              <Button
                onClick={handleAssignTargetToEmployee}
                isLoading={loading}
                   bg="#237086"
          color="white" fontWeight='500'
          _hover={{
            bg: "#1B5A6B"
          }}
          borderRadius="6px"
          px={5}
              >
                Assign Target
              </Button>

            </HStack>

          </VStack>

 
    </Box>
  );
};

export default AssignTargetIndividual;