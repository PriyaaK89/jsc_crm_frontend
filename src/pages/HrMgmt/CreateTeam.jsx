import {
  FormControl,
  FormLabel,
  Input,
  useToast,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  VStack,
  Heading,
  Button,
  Spinner,
  Text,
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const CreateTeam = () => {
  const toast = useToast();

  const navigate = useNavigate();

  const { id } = useParams();

  // ================= EDIT MODE =================

  const isEditMode = Boolean(id);

  // ================= STATES =================

  const [loading, setLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
  });

  // ================= LABEL STYLE =================

  const labelStyles = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: "6px",
  };

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: name === "target_amount" ? Number(value) : value,
    }));
  };

  // ================= GET SINGLE TEAM =================

  const getSingleTeam = async () => {
    try {
      setPageLoading(true);

      const response = await API.get(`${API_ENDPOINTS.get_team_by_id}/${id}`);

      const data = response?.data?.data;

      setFormData({
        name: data?.name || "",

        target_amount: data?.target_amount || "",
      });
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",

        description: error?.response?.data?.message || "Failed to fetch team",

        status: "error",

        duration: 3000,

        isClosable: true,

        position: "top",
      });
    } finally {
      setPageLoading(false);
    }
  };

  // ================= CREATE / UPDATE =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ================= VALIDATION =================

    if (!formData.name || !formData.target_amount) {
      toast({
        title: "Validation Error",

        description: "Please fill all required fields",

        status: "warning",

        duration: 3000,

        isClosable: true,

        position: "top",
      });

      return;
    }

    try {
      setLoading(true);

      let response;

      // ================= EDIT TEAM =================

      if (isEditMode) {
        response = await API.put(
          `${API_ENDPOINTS?.edit_team}/${id}`,

          formData,
        );
      }

      // ================= CREATE TEAM =================
      else {
        response = await API.post(
          API_ENDPOINTS?.create_team,

          formData,
        );
      }

      toast({
        title: "Success",

        description:
          response?.data?.message ||
          `Team ${isEditMode ? "updated" : "created"} successfully`,

        status: "success",

        duration: 3000,

        isClosable: true,

        position: "top",
      });

      // ================= RESET =================

      if (!isEditMode) {
        setFormData({
          name: "",
          target_amount: "",
        });
      }

      // ================= REDIRECT =================

      navigate("/business-development/view-teams");
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",

        description: error?.response?.data?.message || "Something went wrong",

        status: "error",

        duration: 3000,

        isClosable: true,

        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    if (isEditMode) {
      getSingleTeam();
    }
  }, [id]);

  // ================= PAGE LOADER =================

  if (pageLoading) {
    return (
      <Box h="60vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  // ================= UI =================

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md">
      <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px">
              {isEditMode ? "Edit Team" : "Create Team"}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Box mb={6}>
        <Heading size="md" color="gray.600" fontSize="18px" height="36px">
          {isEditMode
            ? "Edit Business Development Team"
            : "Create Business Development Team"}
        </Heading>

        <Text color="gray.500" fontSize="12px">
          {isEditMode
            ? "Update team details and target amount"
            : "Create a new team and assign target"}
        </Text>
      </Box>

      {/* ================= FORM CARD ================= */}

      <Box
        bg="#f2f1f1"
        borderRadius="18px"
        border="1px solid"
        borderColor="gray.300"
        boxShadow="sm"
        p={{
          base: 5,
          md: 8,
        }}>
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            {/* TEAM NAME */}

            <FormControl isRequired>
              <FormLabel {...labelStyles}>Team Name</FormLabel>

              <Input
                placeholder="Enter team name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                h="40px"
                bg="white"
                borderRadius="12px"
                borderColor="gray.300"
                _focus={{
                  borderColor: "#237086",
                  boxShadow: "0 0 0 1px #237086",
                }}
              />
            </FormControl>

            {/* TARGET AMOUNT */}

            <FormControl isRequired>
              <FormLabel {...labelStyles}>Team Target Amount</FormLabel>

              <Input
                type="number"
                placeholder="Enter target amount"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                h="40px"
                bg="white"
                borderRadius="12px"
                borderColor="gray.300"
                _focus={{
                  borderColor: "#237086",
                  boxShadow: "0 0 0 1px #237086",
                }}
              />
            </FormControl>

            {/* BUTTONS */}

            <HStack pt={2} justify="flex-end">
              <Button
                variant="outline"
                border="1px solid #b7b7b7"
                fontSize="14px"
                fontWeight="500"
                onClick={() => navigate(-1)}
                borderRadius="12px">
                Cancel
              </Button>

              <Button
                type="submit"
                bg="#237086"
                fontWeight="500"
                fontSize="14px"
                color="white"
                _hover={{ bg: "#1B5A6B" }}
                px={8}
                borderRadius="12px"
                isLoading={loading}
                loadingText={isEditMode ? "Updating..." : "Creating..."}>
                {isEditMode ? "Update Team" : "Create Team"}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateTeam;
