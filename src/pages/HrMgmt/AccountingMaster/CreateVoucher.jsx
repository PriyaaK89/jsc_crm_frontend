import React, { useState } from "react";
import { Box, Text, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack, SimpleGrid, FormControl, FormLabel,Input, Select, Button, Flex, useToast, Switch, } from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";

import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

function CreateVoucher() {
  const toast = useToast();
  const navigate = useNavigate();

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

  // HANDLE INPUT CHANGE
const handleChange = (e) => {
  const { name, value } = e.target;

  const numberFields = [
    "use_advance_numbering",
    "use_effective_date",
    "allow_narration",
    "decimal_digit",
    "starting_number",
  ];

  setFormData((prev) => ({
    ...prev,
    [name]: numberFields.includes(name)
      ? Number(value)
      : value,
  }));
};

  // HANDLE SWITCH
  const handleSwitch = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0,
    }));
  };

  // CREATE VOUCHER
  const handleCreateVoucher = async () => {
    try {
      setLoading(true);

      // VALIDATION
      if (
        !formData.voucher_name ||
        !formData.voucher_type ||
        !formData.voucher_start_date ||
        !formData.voucher_end_date
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          status: "error",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      // ADVANCE NUMBER VALIDATION
      if (
        formData.numbering_method === "AUTOMATIC" &&
        Number(formData.use_advance_numbering) === 1
      ) {
        if (
          !formData.decimal_digit ||
          !formData.starting_number
        ) {
          toast({
            title: "Validation Error",
            description:
              "Decimal digit and starting number are required",
            status: "error",
            duration: 3000,
            isClosable: true,
          });

          return;
        }
      }

      // API PAYLOAD
      const payload = {
        voucher_name: formData.voucher_name,
        voucher_type: formData.voucher_type,

        numbering_method: formData.numbering_method,

        use_advance_numbering:
          formData.numbering_method === "AUTOMATIC"
            ? Number(formData.use_advance_numbering)
            : 0,

        decimal_digit:
          formData.numbering_method === "AUTOMATIC" &&
            Number(formData.use_advance_numbering) === 1
            ? Number(formData.decimal_digit)
            : null,

        starting_number:
          formData.numbering_method === "AUTOMATIC" &&
            Number(formData.use_advance_numbering) === 1
            ? Number(formData.starting_number)
            : null,

        prefix:
          formData.numbering_method === "AUTOMATIC" &&
            Number(formData.use_advance_numbering) === 1
            ? formData.prefix
            : null,

        suffix:
          formData.numbering_method === "AUTOMATIC" &&
            Number(formData.use_advance_numbering) === 1
            ? formData.suffix
            : null,

        use_effective_date: Number(
          formData.use_effective_date
        ),

        voucher_start_date: formData.voucher_start_date,
        voucher_end_date: formData.voucher_end_date,

        allow_narration: Number(formData.allow_narration),
      };

      const response = await API.post(
        API_ENDPOINTS.CREATE_VOUCHER,
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
      console.log("CREATE VOUCHER ERROR", error);

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
              Create Voucher
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Text className="action_heading"
        mb={6}
        textAlign="center"
      >
        Create Voucher
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
          <FormControl isRequired>
            <FormLabel>Voucher Name</FormLabel>

            <Input
              placeholder="Enter voucher name"
              name="voucher_name"
              value={formData.voucher_name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>
              Select Type of Voucher
            </FormLabel>

            <Select
              placeholder="Select Voucher Type"
              name="voucher_type"
              value={formData.voucher_type}
              onChange={handleChange}
            >
              <option value="ATTENDANCE">
                ATTENDANCE
              </option>

              <option value="CONTRA">
                CONTRA
              </option>

              <option value="CREDIT NOTE">
                CREDIT NOTE
              </option>

              <option value="DEBIT NOTE">
                DEBIT NOTE
              </option>

              <option value="DELIVERY NOTE">
                DELIVERY NOTE
              </option>

              <option value="JOB WORK IN ORDER">
                JOB WORK IN ORDER
              </option>

              <option value="JOB WORK OUT ORDER">
                JOB WORK OUT ORDER
              </option>

              <option value="JOURNAL">
                JOURNAL
              </option>

              <option value="MATERIAL IN">
                MATERIAL IN
              </option>

              <option value="MATERIAL OUT">
                MATERIAL OUT
              </option>

              <option value="MEMORANDUM">
                MEMORANDUM
              </option>

              <option value="PAYMENT">
                PAYMENT
              </option>

              <option value="PAYROLL">
                PAYROLL
              </option>

              <option value="PHYSICAL STOCK">
                PHYSICAL STOCK
              </option>

              <option value="PURCHASE">
                PURCHASE
              </option>

              <option value="PURCHASE ORDER">
                PURCHASE ORDER
              </option>

              <option value="RECEIPT">
                RECEIPT
              </option>

              <option value="RECEIPT NOTE">
                RECEIPT NOTE
              </option>

              <option value="REJECTIONS IN">
                REJECTIONS IN
              </option>

              <option value="REJECTIONS OUT">
                REJECTIONS OUT
              </option>

              <option value="REVERSING JOURNAL">
                REVERSING JOURNAL
              </option>

              <option value="SALES">
                SALES
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
              name="numbering_method"
              value={formData.numbering_method}
              onChange={handleChange}
            >
              <option value="AUTOMATIC">
                AUTOMATIC
              </option>

              <option value="MANUAL">
                MANUAL
              </option>
            </Select>
          </FormControl>

          {/* ADVANCE NUMBERING */}
          {formData.numbering_method ===
            "AUTOMATIC" && (
              <FormControl>
                <FormLabel>Use Advance Numbering</FormLabel>

                <Select
                  name="use_advance_numbering"
                  value={formData.use_advance_numbering}
                  onChange={handleChange}
                >
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </Select>
              </FormControl>
            )}
        </SimpleGrid>

        {/* ADVANCE NUMBERING FIELDS */}
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
                <FormControl isRequired>
                  <FormLabel>
                    Decimal Digit
                  </FormLabel>

                  <Input
                    type="number"
                    name="decimal_digit"
                    value={formData.decimal_digit}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>
                    Starting Number
                  </FormLabel>

                  <Input
                    type="number"
                    name="starting_number"
                    value={formData.starting_number}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Prefix</FormLabel>

                  <Input
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Suffix</FormLabel>

                  <Input
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleChange}
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
            <FormLabel>Use Effective Date</FormLabel>

            <Select
              name="use_effective_date"
              value={formData.use_effective_date}
              onChange={handleChange}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Allow Narration</FormLabel>

            <Select
              name="allow_narration"
              value={formData.allow_narration}
              onChange={handleChange}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>
              Voucher Start Date
            </FormLabel>

            <Input
              type="date"
              name="voucher_start_date"
              value={formData.voucher_start_date}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>
              Voucher End Date
            </FormLabel>

            <Input
              type="date"
              name="voucher_end_date"
              value={formData.voucher_end_date}
              onChange={handleChange}
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
           
                bg="#237086"
                fontWeight="500" fontSize="14px"
                color="white"
                _hover={{
                  bg: "#1B5A6B"
                }}
                 px={8}
                borderRadius="12px"
            onClick={handleCreateVoucher}
            isLoading={loading}
            loadingText="Saving"
          >
            Save Voucher
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

export default CreateVoucher;