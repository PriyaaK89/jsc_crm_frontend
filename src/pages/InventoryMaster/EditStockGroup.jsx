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
  useToast
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EditStockGroup = () => {

  const { id } = useParams();   
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    add_quantity: "",
    gst_enabled: "",
    overdue_limit: 300,
  });

  // ✅ FETCH DATA (autofill)
  const fetchStockGroup = async () => {
    try {
      setFetchLoading(true);

      const res = await API.get(`${API_ENDPOINTS.Get_stock_group_by_id}/${id}`);

      if (res.status === 200) {
        const data = res?.data?.data;

        setFormData({
          name: data?.name || "",
          parent_id: data?.parent_id ?? "",
          add_quantity: String(data?.add_quantity ?? ""),
          gst_enabled: String(data?.gst_enabled ?? ""),
          overdue_limit: data?.overdue_limit || 300,
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
    if (id) fetchStockGroup();
  }, [id]);

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "parent_id" && value === "null" ? null : value,
    }));
  };

  // ✅ UPDATE API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        parent_id: formData.parent_id || null,
        overdue_limit: formData.overdue_limit || 300,
      };

      const res = await API.put(
        `${API_ENDPOINTS.update_stock_group}/${id}`,
        payload
      );

      if (res.status === 200) {
        toast({
          title: "Stock Group Updated Successfully",
          status: "success",
          duration: 3000,
        });

        navigate("/inventory/view-stock-group"); 
      }

    } catch (error) {
      toast({
        title: "Failed to update",
        status: "error",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" px={6} py={4}>

      {/* Top */}
      <HStack justifyContent="space-between" mb={6}>
        <Breadcrumb color="#8B8D97">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>
            <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/inventory/view-stock-group">
              Stock Group List
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage>
              Edit Stock Group
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* Form */}
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">

          <Text fontSize="lg" fontWeight="bold">
            Edit Stock Group
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Under</FormLabel>
              <Select
                name="parent_id"
                value={formData.parent_id ?? ""}
                onChange={handleChange}
              >
                <option value="">Primary</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Add Quantity</FormLabel>
              <Select
                name="add_quantity"
                value={formData.add_quantity}
                onChange={handleChange}
              >
                <option value="1">Yes</option>
                <option value="0">No</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>GST Enabled</FormLabel>
              <Select
                name="gst_enabled"
                value={formData.gst_enabled}
                onChange={handleChange}
              >
                <option value="1">Yes</option>
                <option value="0">No</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Override Limit</FormLabel>
              <Input
                type="number"
                name="overdue_limit"
                value={formData.overdue_limit}
                onChange={handleChange}
              />
            </FormControl>

          </SimpleGrid>

          <Box textAlign="right">
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={loading}
            >
              Update Stock Group
            </Button>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
};

export default EditStockGroup
