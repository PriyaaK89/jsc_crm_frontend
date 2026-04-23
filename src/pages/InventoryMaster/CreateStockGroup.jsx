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
import React, { useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const CreateStockGroup = () => {

  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    add_quantity: "",
    gst_enabled: "",
    overdue_limit: 300,
  });

  // handle change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "parent_id" && value === "null" ? null : value,
    }));
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        overdue_limit: formData.overdue_limit || 300,
      };

      const response = await API.post(
        API_ENDPOINTS.create_stock_group, 
        payload
      );

      if (response.status === 201) {
        toast({
          title: "Stock Group Created Successfully",
          status: "success",
          duration: 3000,
        });

        // optional: reset form
        setFormData({
          name: "",
          parent_id: "",
          add_quantity: "",
          gst_enabled: "",
          overdue_limit: 300,
        });
      }

    } catch (error) {
      toast({
        title: "Failed to create Stock Group",
        status: "error",
        duration: 3000,
      });

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" px={6} py={4}>
      
      {/* Top */}
        <HStack justifyContent="space-between">
                <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                  <BreadcrumbItem>
                    <BreadcrumbLink as={Link} to="/dashboard">
                      <GoHomeFill color="#5570F1" />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <BreadcrumbLink as={Link} color="#8B8D97" fontSize="13px" isCurrentPage>
                       Create Stock Group
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </Breadcrumb>
              </HStack>

      {/* Form */}
      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          
          <Text fontSize="16px" fontWeight="500" color="#45464E">
            Create Stock Group
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter stock group name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Under</FormLabel>
              <Select
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                placeholder="Select Stock Group"
              >
                <option value="null">Primary</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Add Quantity</FormLabel>
              <Select
                name="add_quantity"
                value={formData.add_quantity}
                onChange={handleChange}
                placeholder="Select"
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
                placeholder="Select"
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
              px={8}
              type="submit"
              isLoading={loading}
            >
              Create Stock Group
            </Button>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
};

export default CreateStockGroup;