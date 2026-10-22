import React, { useEffect, useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Grid, Input, Select,
  useToast, VStack, HStack
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import ReactSelect from "react-select";
import CollectionAreaSelector from "./CollectionAreasInfo";


const SELECT_ALL_OPTION = { value: "ALL", label: "Select All Categories" };

const initialFormData = {
  role: "",
  user_id: "",
  target_type: "",
  duration_type: "",
  start_date: "",
  target_amount: ""
};

const roleLevelMap = {
  ZSM: 1,
  RSM: 2,
  ASM: 3,
  TSM: 4,
  SM: 5,
  FA: 6
};

const AssignTargetIndividual = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(false);       // employees loading
  const [submitting, setSubmitting] = useState(false); // submit button
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

    const [collectionAreaIds, setCollectionAreaIds] = useState([]);
  const [collectionAreaCount, setCollectionAreaCount] = useState(0); // areas this employee has

  const isSale = formData.target_type === "SALE";
  const isDistributor = formData.target_type === "NEW_DISTRIBUTOR";
      const isCollection = formData.target_type === "COLLECTION";
  

  // ================= FETCH STOCK CATEGORIES =================

  const getStockCategories = async () => {
    try {
      const response = await API.get(API_ENDPOINTS.View_stock_category);
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
      const res = await API.get(`${API_ENDPOINTS.get_users_by_role}/${level}`);

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

    if (name === "role" || name === "user_id" || name === "target_type") {
      setCollectionAreaIds([]);
      setCollectionAreaCount(0);
    }

    // role change -> reset employee and reload employee list
    if (name === "role") {
      setFormData((prev) => ({ ...prev, role: value, user_id: "" }));
      if (value) {
        getEmployeesByRole(value);
      } else {
        setEmployees([]);
      }
      return;
    }

    // target type change -> amount means different things, so reset it
    if (name === "target_type") {
      setFormData((prev) => ({ ...prev, target_type: value, target_amount: "" }));
      setSelectedCategories([]);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= CATEGORY SELECT (with Select All) =================

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name
  }));

  const allSelected =
    categoryOptions.length > 0 &&
    selectedCategories.length === categoryOptions.length;

  // hide the "Select All" option once everything is selected
  const selectOptions = allSelected
    ? categoryOptions
    : [SELECT_ALL_OPTION, ...categoryOptions];

  const handleCategoryChange = (selected) => {
    const picked = selected || [];

    if (picked.some((opt) => opt.value === SELECT_ALL_OPTION.value)) {
      setSelectedCategories(categoryOptions);
      return;
    }

    setSelectedCategories(picked);
  };

  // ================= VALIDATION =================

  const validate = () => {
    const { role, user_id, target_type, duration_type, start_date, target_amount } = formData;

    if (!role || !user_id || !target_type || !duration_type || !start_date || !target_amount) {
      return "Please fill all required fields";
    }

    const amount = Number(target_amount);

    if (!(amount > 0)) {
      return isDistributor
        ? "Number of distributors must be greater than 0"
        : "Target amount must be greater than 0";
    }

    if (isDistributor && !Number.isInteger(amount)) {
      return "Number of distributors must be a whole number";
    }

    if (isSale && selectedCategories.length === 0) {
      return "Please select at least one category";
    }

      if (isCollection && collectionAreaCount > 0 && collectionAreaIds.length === 0) {
      return "Please select at least one collection area";
    }

    return null;
  };

  // ================= SUBMIT =================

  const handleAssignTargetToEmployee = async () => {
    const errorMessage = validate();

    if (errorMessage) {
      toast({
        title: "Validation Error",
        description: errorMessage,
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        // categories only apply to SALE targets
        categories: isSale ? selectedCategories.map((cat) => cat.value) : [],
        collection_area_ids: isCollection ? collectionAreaIds : []
      };

      const response = await API.post(API_ENDPOINTS.assign_individual_targets, payload);

      toast({
        title: "Success",
        description: response?.data?.message || "Target assigned successfully",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      // reset form
      setCollectionAreaIds([]);
      setCollectionAreaCount(0);
      setFormData(initialFormData);
      setSelectedCategories([]);
      setEmployees([]);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    getStockCategories();
  }, []);

  return (
    <Box p={0}>
      <VStack spacing={6} align="stretch">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={5}>

          {/* ROLE */}
          <FormControl isRequired>
            <FormLabel>Select Role</FormLabel>
            <Select
              placeholder="Select Role"
              name="role" bg="white" color="gray.700"
              fontSize="15px"
              value={formData.role} onChange={handleChange}
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
              placeholder={loading ? "Loading employees..." : "Select Employee"}
              bg="white"
              name="user_id" color="gray.700"
              fontSize="15px"
              value={formData.user_id}
              onChange={handleChange}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
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
              <option value="COLLECTION">COLLECTION</option>
              <option value="NEW_DISTRIBUTOR">NEW DISTRIBUTOR</option>
            </Select>
          </FormControl>

          {/* DURATION */}
          <FormControl isRequired>
            <FormLabel>Duration Type</FormLabel>
            <Select
              placeholder="Select Duration"
              name="duration_type" bg="white" value={formData.duration_type}
              onChange={handleChange} color="gray.700" fontSize="15px"
            >
              <option value="MONTHLY">MONTHLY</option>
              <option value="QUARTERLY">QUARTERLY</option>
              <option value="HALF_YEARLY">HALF YEARLY</option>
              <option value="YEARLY">YEARLY</option>
            </Select>
          </FormControl>

          {/* START DATE */}
          <FormControl isRequired>
            <FormLabel>Start Date</FormLabel>
            <Input
              type="date"
              name="start_date" bg="white"
              value={formData.start_date}
              onChange={handleChange} color="gray.700"
              fontSize="15px"
            />
          </FormControl>

          {/* TARGET AMOUNT / NUMBER OF DISTRIBUTORS */}
          <FormControl isRequired>
            <FormLabel>
              {isDistributor ? "Number of Distributors" : "Target Amount"}
            </FormLabel>
            <Input
              type="number"
              min={1}
              step={isDistributor ? 1 : "any"}
              placeholder={
                isDistributor ? "Enter number of distributors" : "Enter target amount"
              }
              name="target_amount"
              value={formData.target_amount} bg="white"
              onChange={handleChange}
            />
          </FormControl>
        </Grid>

                {/* ASSIGNED AREAS (COLLECTION only) */}
      {isCollection && formData.user_id && (
          <CollectionAreaSelector
            employeeId={formData.user_id}
            value={collectionAreaIds}
            onChange={setCollectionAreaIds}
            onLoaded={(list) => setCollectionAreaCount(list.length)}
          />
        )}

        {/* PRODUCT CATEGORIES (SALE only) */}
        {isSale && (
          <FormControl isRequired>
            <FormLabel>Select Product Categories</FormLabel>
            <ReactSelect
              isMulti
              options={selectOptions}
              value={selectedCategories}
              onChange={handleCategoryChange}
              placeholder="Select Categories"
              closeMenuOnSelect={false}
            />
          </FormControl>
        )}

        {/* BUTTON */}
        <HStack justify="flex-end">
          <Button
            onClick={handleAssignTargetToEmployee}
            isLoading={submitting}
            bg="#237086"
            color="white" fontWeight="500"
            _hover={{ bg: "#1B5A6B" }}
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