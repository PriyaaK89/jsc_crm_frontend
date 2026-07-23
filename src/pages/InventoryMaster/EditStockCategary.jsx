import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  VStack,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  useToast,
  Spinner
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EditStockCategory = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const [categories, setCategories] = useState([]); // dropdown list

  const [formData, setFormData] = useState({
    name: "",
    stock_group_id: "",
  });

  // FETCH CATEGORY LIST (dropdown)
  const fetchCategories = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.stock_group_list);

      if (res.status === 200) {
        setCategories(res?.data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // FETCH SINGLE DATA (autofill)
  const fetchStockCategoryById = async () => {
    try {
      setFetchLoading(true);

      const res = await API.get(
        `${API_ENDPOINTS.View_stock_category_by_id}/${id}`
      );

      if (res.status === 200) {
        const data = res?.data?.data;

        setFormData({
          name: data?.name || "",
          stock_group_id: data?.stock_group_id || "",
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to fetch data",
        status: "error",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategories();
      fetchStockCategoryById();
    }
  }, [id]);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  SUBMIT UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      return toast({
        title: "Name is required",
        status: "warning",
      });
    }

    if (!formData.stock_group_id) {
      return toast({
        title: "Please select stock group",
        status: "warning",
      });
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        stock_group_id: formData.stock_group_id,
      };

      const res = await API.put(
        `${API_ENDPOINTS.Update_stock_category_by_id}/${id}`,
        payload
      );

      if (res.status === 200) {
        toast({
          title: "Stock Category Updated Successfully",
          status: "success",
          duration: 3000,
        });

        navigate("/inventory/view-stock-category");
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ⏳ loading state
  if (fetchLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box bg="white" px={6} py={4}>

      {/* Breadcrumb */}
      <HStack justifyContent="space-between" mb={6}>
        <Breadcrumb color="#8B8D97">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/inventory/view-stock-category" fontSize="13px">
              Stock Category List
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="13px">Edit Stock Category</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* FORM */}
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">

          <Text fontSize="lg" fontWeight="bold">
            Edit Stock Category
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

            {/* NAME */}
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>

            {/* DROPDOWN */}
            <FormControl isRequired>
              <FormLabel>Select Stock Group</FormLabel>
              <Select
                name="stock_group_id"
                value={formData.stock_group_id}
                onChange={handleChange}
                placeholder="Select Stock Group"
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>

          </SimpleGrid>

          {/* BUTTON */}
          <Box textAlign="right">
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={loading}
            >
              Update Stock Category
            </Button>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
};

export default EditStockCategory;