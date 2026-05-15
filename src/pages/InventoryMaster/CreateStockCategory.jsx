import {
  FormControl,
  SimpleGrid,
  VStack,
  Box,
  Text,
  FormLabel,
  Button,
  HStack,
  Select,
  Input,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const CreateStockCategory = () => {

  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [stockGroups, setStockGroups] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    stock_group_id: "",
  });

  // FETCH STOCK GROUP LIST
  const fetchStockGroups = async () => {
    try {
      setLoading(true);

      const res = await API.get(API_ENDPOINTS.stock_group_list);

      if (res.status === 200) {
        setStockGroups(res?.data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching stock groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockGroups();
  }, []);

  //  HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async () => {


    if (!formData.name) {
      return toast({
        title: "Name is required",
        status: "warning",
        duration: 2000,
      });
    }



    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        stock_group_id: formData.stock_group_id || null,
      };

      const res = await API.post(
        API_ENDPOINTS.Create_stock_category,
        payload
      );

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "Stock Category Created Successfully",
          status: "success",
          duration: 3000,
        });

        // reset form
        setFormData({
          name: "",
          stock_group_id: "",
        });
      }

    } catch (err) {
      console.error(err);

      toast({
        title: "Failed to create stock category",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" px={6} py={4} borderRadius="lg">

      {/* Breadcrumb */}
      <HStack justifyContent="space-between" mb={6}>
        <Breadcrumb color="#8B8D97">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="13px">
              Create Stock Category
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* FORM */}
      <Box>
        <VStack spacing={6} align="stretch">

          <Text fontSize="16px" fontWeight="500" color="#45464E">
            Create Stock Category
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>

            <FormControl isRequired>
              <FormLabel>Select Stock Group</FormLabel>
              <Select
                name="stock_group_id"
                value={formData.stock_group_id}
                onChange={handleChange}
              >
                <option value="">Primary</option>

                {stockGroups
                  .filter((item) => item.id !== null)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </Select>
            </FormControl>

            {/* NAME */}
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
              />
            </FormControl>
          
          </SimpleGrid>

          {/* BUTTON */}
          <Box textAlign="right">
            <Button 
              onClick={handleSubmit}
              isLoading={loading} className="submit_btn"
            >
              Create
            </Button>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
};

export default CreateStockCategory;