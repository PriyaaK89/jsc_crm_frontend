import React, { useEffect, useState } from "react";

import {
  Box,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Flex,
  useToast,
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";

import { Link, useNavigate, useParams } from "react-router-dom";

import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

function EditVoucher() {

  const toast = useToast();

  const navigate = useNavigate();

  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    voucher_name: "",
    voucher_type: "",

    numbering_method: "AUTOMATIC",

    use_advance_numbering: 0,
    decimal_digit: "",
    starting_number: "",
    prefix: "",
    suffix: "",

    use_effective_date: 0,
    voucher_start_date: "",
    voucher_end_date: "",

    allow_narration: 1,
  });

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toISOString().split("T")[0];
  };

  // GET VOUCHER DETAILS
  const getVoucherDetailsById = async () => {

    try {

      const response = await API.get(
        `${API_ENDPOINTS.GET_VOUCHER_DETAILS_BY_ID}/${id}`
      );

      if (response?.data?.success) {

        const data = response?.data?.data;

        setFormData({
          voucher_name: data?.voucher_name || "",
          voucher_type: data?.voucher_type || "",

          numbering_method:
            data?.numbering_method || "AUTOMATIC",

          use_advance_numbering:
            Number(data?.use_advance_numbering) || 0,

          decimal_digit:
            data?.decimal_digit || "",

          starting_number:
            data?.starting_number || "",

          prefix: data?.prefix || "",

          suffix: data?.suffix || "",

          use_effective_date:
            Number(data?.use_effective_date) || 0,

          voucher_start_date: formatDate(
            data?.voucher_start_date
          ),

          voucher_end_date: formatDate(
            data?.voucher_end_date
          ),

          allow_narration:
            Number(data?.allow_narration) || 0,
        });
      }

    } catch (error) {

      console.log("GET VOUCHER ERROR", error);

      toast({
        title: "Error",
        description: "Failed to fetch voucher details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    getVoucherDetailsById();
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // UPDATE VOUCHER
  const handleEditVoucher = async () => {

    try {

      setLoading(true);

      if (!formData.voucher_name) {

        toast({
          title: "Validation Error",
          description: "Voucher name is required",
          status: "error",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      // API PAYLOAD
      const payload = {
        voucher_name: formData.voucher_name,

        voucher_type: formData.voucher_type,

        numbering_method: formData.numbering_method,

        use_advance_numbering:
          Number(formData.use_advance_numbering),

        decimal_digit:
          formData.decimal_digit
            ? Number(formData.decimal_digit)
            : null,

        starting_number:
          formData.starting_number
            ? Number(formData.starting_number)
            : null,

        prefix: formData.prefix || null,

        suffix: formData.suffix || null,

        use_effective_date:
          Number(formData.use_effective_date),

        voucher_start_date:
          formData.voucher_start_date,

        voucher_end_date:
          formData.voucher_end_date,

        allow_narration:
          Number(formData.allow_narration),
      };

      const response = await API.put(
        `${API_ENDPOINTS.UPDATE_VOUCHER}/${id}`,
        payload
      );

      if (response?.data?.success) {

        toast({
          title: "Success",
          description: response?.data?.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        navigate("/accounting-master/view-voucher");
      }

    } catch (error) {

      console.log("UPDATE VOUCHER ERROR", error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);
    }
  };

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
    >

      {/* BREADCRUMB */}
      <HStack justifyContent="space-between">

        <Breadcrumb
          color="#8B8D97"
          padding="10px 0px 1rem 0px"
        >

          <BreadcrumbItem>
            <BreadcrumbLink
              as={Link}
              to="/dashboard"
            >
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
              color="#8B8D97"
              fontSize="13px"
            >
              Edit Voucher
            </BreadcrumbLink>
          </BreadcrumbItem>

        </Breadcrumb>

      </HStack>

      <Text className="action_heading" mb={6} textAlign="center" >
        Edit Voucher
      </Text>

      <Box
        p={6}
        borderRadius="xl"
        boxShadow="sm"
      >

        {/* BASIC INFO */}
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={5}
          mb={6}
        >

          {/* ONLY THIS FIELD EDITABLE */}
          <FormControl isRequired>

            <FormLabel>
              Voucher Name
            </FormLabel>

            <Input
              placeholder="Enter voucher name"
              name="voucher_name"
              value={formData.voucher_name}
              onChange={handleChange}
            />

          </FormControl>

          {/* DISABLED */}
          <FormControl>

            <FormLabel>
              Select Type of Voucher
            </FormLabel>

            <Select
              value={formData.voucher_type}
              isDisabled
            >
              <option value={formData.voucher_type}>
                {formData.voucher_type}
              </option>
            </Select>

          </FormControl>

        </SimpleGrid>

        {/* NUMBERING */}
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={5}
          mb={6}
        >

          <FormControl>

            <FormLabel>
              Method Of Numbering
            </FormLabel>

            <Select
              value={formData.numbering_method}
              isDisabled
            >
              <option value={formData.numbering_method}>
                {formData.numbering_method}
              </option>
            </Select>

          </FormControl>

          {formData.numbering_method ===
            "AUTOMATIC" && (

              <FormControl>

                <FormLabel>
                  Use Advance Numbering
                </FormLabel>

                <Select
                  value={
                    formData.use_advance_numbering
                  }
                  isDisabled
                >
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </Select>

              </FormControl>
            )}

        </SimpleGrid>

        {/* CONDITIONAL FIELDS */}
        {formData.numbering_method ===
          "AUTOMATIC" &&
          Number(
            formData.use_advance_numbering
          ) === 1 && (

            <Box
              bg="gray.50"
              p={4}
              borderRadius="xl"
              border="1px solid #E2E8F0"
              mb={6}
            >

              <SimpleGrid
                columns={{ base: 1, md: 4 }}
                spacing={5}
              >

                <FormControl>

                  <FormLabel>
                    Decimal Digit
                  </FormLabel>

                  <Input
                    value={formData.decimal_digit}
                    isDisabled
                  />

                </FormControl>

                <FormControl>

                  <FormLabel>
                    Starting Number
                  </FormLabel>

                  <Input
                    value={formData.starting_number}
                    isDisabled
                  />

                </FormControl>

                <FormControl>

                  <FormLabel>
                    Prefix
                  </FormLabel>

                  <Input
                    value={formData.prefix}
                    isDisabled
                  />

                </FormControl>

                <FormControl>

                  <FormLabel>
                    Suffix
                  </FormLabel>

                  <Input
                    value={formData.suffix}
                    isDisabled
                  />

                </FormControl>

              </SimpleGrid>

            </Box>
          )}

        {/* OTHER SETTINGS */}
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={5}
          mb={6}
        >

          <FormControl>

            <FormLabel>
              Use Effective Date
            </FormLabel>

            <Select
              value={formData.use_effective_date}
              isDisabled
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </Select>

          </FormControl>

          <FormControl>

            <FormLabel>
              Allow Narration
            </FormLabel>

            <Select
              value={formData.allow_narration}
              isDisabled
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </Select>

          </FormControl>

          <FormControl>

            <FormLabel>
              Voucher Start Date
            </FormLabel>

            <Input
              type="date"
              value={formData.voucher_start_date}
              isDisabled
            />

          </FormControl>

          <FormControl>

            <FormLabel>
              Voucher End Date
            </FormLabel>

            <Input
              type="date"
              value={formData.voucher_end_date}
              isDisabled
            />

          </FormControl>

        </SimpleGrid>

        {/* BUTTONS */}
        <Flex
          justify="flex-end"
          gap={4}
        >

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button
             type="submit"
                bg="#237086"
                fontWeight="500" fontSize="14px"
                color="white"
                _hover={{
                  bg: "#1B5A6B"
                }}
                 px={8}
                borderRadius="12px"
            onClick={handleEditVoucher}
            isLoading={loading}
            loadingText="Updating"
          >
            Update Voucher
          </Button>

        </Flex>

      </Box>

    </Box>
  );
}

export default EditVoucher;