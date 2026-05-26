import React, { useState } from "react";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  Heading,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Select,
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";

import { Link } from "react-router-dom";

import API from "../../services/api";

import { API_ENDPOINTS } from "../../services/endpoints";

const CreateRetailer = () => {

  const toast = useToast();

  /* =====================================================
      STATES
  ===================================================== */

  const [loading, setLoading] = useState(false);

  const [areas, setAreas] = useState([]);

  const [formData, setFormData] = useState({

    name: "",

    firm_name: "",

    contact_number: "",

    address: "",

    firm_address: "",

    area: "",

    district: "",

    state: "",

    city: "",

    pincode: "",

  });

  /* =====================================================
      HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  /* =====================================================
      HANDLE PINCODE CHANGE
  ===================================================== */

  const handlePincodeChange = async (value) => {

    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    if (value.length === 6) {

      try {

        // ==============================
        // GET STATE / CITY / DISTRICT
        // ==============================

        const res = await API.get(
          `/getstatecity/${value}`
        );

        const {
          state,
          district,
          city
        } = res.data.data;

        setFormData((prev) => ({
          ...prev,
          state,
          district,
          city,
        }));

        // ==============================
        // GET AREAS
        // ==============================

        const areaRes = await API.get(
          `/areas?pincode=${value}`
        );

        setAreas(areaRes?.data?.data || []);

      } catch (err) {

        console.error(
          "Pincode lookup failed",
          err
        );

      }

    }

  };

  /* =====================================================
      CREATE RETAILER
  ===================================================== */

  const handleCreateRetailer = async () => {

    try {

      // ==============================
      // VALIDATIONS
      // ==============================

      if (!formData?.name) {

        toast({
          title: "Validation Error",
          description: "Retailer name is required",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      if (!formData?.contact_number) {

        toast({
          title: "Validation Error",
          description: "Contact number is required",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      setLoading(true);

      // ==============================
      // API CALL
      // ==============================

      const payload = {

        name: formData?.name,

        firm_name: formData?.firm_name,

        contact_number: formData?.contact_number,

        address: formData?.address,

        firm_address: formData?.firm_address,

        area: formData?.area,

        district: formData?.district,

        pincode: formData?.pincode,

      };

      const response = await API.post(
        API_ENDPOINTS.CREATE_RETAILER,
        payload
      );

      // ==============================
      // SUCCESS
      // ==============================

      if (response?.data?.success) {

        toast({
          title: "Success",
          description:
            response?.data?.message ||
            "Retailer created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // RESET FORM

        setFormData({

          name: "",

          firm_name: "",

          contact_number: "",

          address: "",

          firm_address: "",

          area: "",

          district: "",

          state: "",

          city: "",

          pincode: "",

        });

        setAreas([]);

      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to create retailer",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);

    }

  };

  return (

    <Box>


      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} >

        {/* Retailer Name */}

        <FormControl>

          <FormLabel>
            Retailer Name
          </FormLabel>

          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter retailer name"
          />

        </FormControl>

        {/* Firm Name */}

        <FormControl>

          <FormLabel>
            Firm Name
          </FormLabel>

          <Input
            name="firm_name"
            value={formData.firm_name}
            onChange={handleChange}
            placeholder="Enter firm name"
          />

        </FormControl>

        {/* Contact Number */}

        <FormControl>

          <FormLabel>
            Contact Number
          </FormLabel>

          <Input
            name="contact_number"
            type="number"
            value={formData.contact_number}
            onChange={handleChange}
            placeholder="Enter contact number"
          />

        </FormControl>

        {/* Pincode */}

        <FormControl>

          <FormLabel>
            Pincode
          </FormLabel>

          <Input
            maxLength={6}
            value={formData.pincode}
            onChange={(e) =>
              handlePincodeChange(e.target.value)
            }
            placeholder="Enter pincode"
          />

        </FormControl>

        {/* State */}

        <FormControl>

          <FormLabel>
            State
          </FormLabel>

          <Input
            value={formData.state}
            isReadOnly
          />

        </FormControl>

        {/* District */}

        <FormControl>

          <FormLabel>
            District
          </FormLabel>

          <Input
            value={formData.district}
            isReadOnly
          />

        </FormControl>

        {/* City */}

        <FormControl>

          <FormLabel>
            City
          </FormLabel>

          <Input
            value={formData.city}
            isReadOnly
          />

        </FormControl>

        {/* Area */}

        <FormControl>

          <FormLabel>
            Area
          </FormLabel>

          <Select
            placeholder="Select area"
            name="area"
            value={formData.area}
            onChange={handleChange}
          >

            {areas?.map((item, index) => (

              <option
                key={index}
                value={item.officename}
              >
                {item.officename}
              </option>

            ))}

          </Select>

        </FormControl>

      </SimpleGrid>

      {/* =====================================================
            ADDRESS
      ===================================================== */}

      <FormControl mt={5}>

        <FormLabel>
          Address
        </FormLabel>

        <Textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter address"
        />

      </FormControl>

      {/* =====================================================
            FIRM ADDRESS
      ===================================================== */}

      <FormControl mt={5}>

        <FormLabel>
          Firm Address
        </FormLabel>

        <Textarea
          name="firm_address"
          value={formData.firm_address}
          onChange={handleChange}
          placeholder="Enter firm address"
        />

      </FormControl>

      {/* =====================================================
            BUTTON
      ===================================================== */}

      <Box textAlign="center" mt={10}>

        <Button
           bg="#237086" fontWeight="500"
              fontSize="14px" color="white"
              px={8} borderRadius="12px"
          onClick={handleCreateRetailer}
          isLoading={loading}
          loadingText="Creating"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "md", bg: "#1B5A6B"
          }}
          transition="all 0.2s ease"
          borderRadius="xl"
        >
          Create Retailer
        </Button>

      </Box>

    </Box>

  );

};

export default CreateRetailer;