import React, { useContext, useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  VStack,
  Text,
  useToast,
  Card,
  CardBody,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Badge,
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../../services/api";

import { API_ENDPOINTS } from "../../services/endpoints";

import { AuthContext } from "../../context/AuthContext";

const CreateGodown = () => {

  const toast = useToast();

  const navigate = useNavigate();

  const { auth } = useContext(AuthContext);

  const user_id = auth?.user?.id;

  const { id } = useParams();

  // =========================================
  // IS EDIT MODE
  // =========================================

  const isEditMode = Boolean(id);

  // =========================================
  // STATES
  // =========================================

  const [loading, setLoading] = useState(false);

  const [pageLoading, setPageLoading] =
    useState(false);

  const [godownList, setGodownList] = useState([]);

  const [formData, setFormData] = useState({
    godown_name: "",
    parent_id: "",
    allow_storage_material: "",
    our_stock_with_third_party: "",
    third_party_stock_with_us: "",
    created_by: user_id,
    updated_by: user_id,
  });

  // =========================================
  // HANDLE CHANGE
  // =========================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // FETCH GODOWN DROPDOWN
  // =========================================

  const fetchGodownList = async () => {

    try {

      const response = await API.get(
        `${API_ENDPOINTS?.godown_list}?page=1&limit=1000`
      );

      setGodownList(
        response?.data?.data || []
      );

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          "Failed to fetch godown list",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =========================================
  // GET GODOWN BY ID
  // =========================================

  const resetForm = () => {

  setFormData({
    godown_name: "",
    parent_id: "",
    allow_storage_material: "",
    our_stock_with_third_party: "",
    third_party_stock_with_us: "",
    created_by: user_id,
    updated_by: user_id,
  });
};

  const getGodownById = async () => {

    try {

      setPageLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS?.view_godown_by_id}/${id}`
      );

      const data = response?.data?.data;

      setFormData({
        godown_name:
          data?.godown_name || "",

        parent_id:
          data?.parent_id || "",

        allow_storage_material:
          String(
            data?.allow_storage_material
          ),

        our_stock_with_third_party:
          String(
            data?.our_stock_with_third_party
          ),

        third_party_stock_with_us:
          String(
            data?.third_party_stock_with_us
          ),

        created_by: user_id,

        updated_by: user_id,
      });

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          "Failed to fetch godown details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setPageLoading(false);
    }
  };

  // =========================================
  // CREATE GODOWN
  // =========================================

  const handleCreateGodown = async () => {

    if (!formData.godown_name.trim()) {

      toast({
        title: "Validation Error",
        description:
          "Godown name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    if (
      formData.allow_storage_material === ""
    ) {

      toast({
        title: "Validation Error",
        description:
          "Please select Allow Storage Material",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    try {

      setLoading(true);

      const payload = {
        godown_name:
          formData.godown_name,

        parent_id:
          formData.parent_id || null,

        allow_storage_material:
          Number(
            formData.allow_storage_material
          ),

        our_stock_with_third_party:
          Number(
            formData.our_stock_with_third_party || 0
          ),

        third_party_stock_with_us:
          Number(
            formData.third_party_stock_with_us || 0
          ),

        created_by: user_id,
      };

      const response = await API.post(
        `${API_ENDPOINTS?.create_godown}`,
        payload
      );

      toast({
        title: "Success",
        description:
          response?.data?.message ||
          "Godown created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm()
    //   navigate("/inventory/view-godown-list");

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to create godown",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);
    }
  };

  // =========================================
  // UPDATE GODOWN
  // =========================================

  const handleEditGodown = async () => {

    if (!formData.godown_name.trim()) {

      toast({
        title: "Validation Error",
        description:
          "Godown name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    try {

      setLoading(true);

      const payload = {
        godown_name:
          formData.godown_name,

        parent_id:
          formData.parent_id || null,

        allow_storage_material:
          Number(
            formData.allow_storage_material
          ),

        our_stock_with_third_party:
          Number(
            formData.our_stock_with_third_party || 0
          ),

        third_party_stock_with_us:
          Number(
            formData.third_party_stock_with_us || 0
          ),

        updated_by: user_id,
      };

      const response = await API.put(
        `${API_ENDPOINTS?.update_godown}/${id}`,
        payload
      );

      toast({
        title: "Success",
        description:
          response?.data?.message ||
          "Godown updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm()
      setTimeout(()=>{
          navigate("/inventory/view-godown-list");
      },1000)

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to update godown",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    fetchGodownList();

    if (id) {
      getGodownById();
    }

  }, [id]);

  return (

    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
    >

      {/* ================================= */}
      {/* BREADCRUMB */}
      {/* ================================= */}

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
              isCurrentPage
              color="#8B8D97"
              fontSize="13px"
            >
              {isEditMode
                ? "Edit Godown"
                : "Create Godown"}
            </BreadcrumbLink>

          </BreadcrumbItem>

        </Breadcrumb>

      </HStack>

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <Flex
        justify="space-between"
        align="center"
        mb={5}
        flexWrap="wrap"
        gap={3}
      >

        <Box>

          <Heading
            size="md"
            color="gray.600"
            fontSize="18px"
          >

            {isEditMode
              ? "Edit Godown"
              : "Create Godown"}

          </Heading>

          <Text
            color="gray.500"
            fontSize="12px"
          >
            Manage warehouse and storage
            locations
          </Text>

        </Box>

        <Badge
          px={3}
          py={2}
          bg="#607f83"
          color="white"
          borderRadius="md"
          fontWeight="500"
          pt="10px"
          textTransform="capitalize"
          fontSize="13px"
        >
          Total Godowns :
          {" "}
          {godownList.length}
        </Badge>

      </Flex>

      {/* ================================= */}
      {/* FORM */}
      {/* ================================= */}

      <Card
        bg="#f8f9f9"
        borderRadius="18px"
        border="1px solid"
        borderColor="gray.300"
        boxShadow="sm"
        p={{
          base: 3,
          md: 3,
        }}
      >

        <CardBody>

          {pageLoading ? (

            <Flex
              justify="center"
              align="center"
              h="300px"
            >
              Loading...
            </Flex>

          ) : (

            <VStack
              spacing={5}
              align="stretch"
            >

              {/* GODOWN NAME */}

              <FormControl isRequired>

                <FormLabel>
                  Godown Name
                </FormLabel>

                <Input
                  placeholder="Enter godown name"
                  name="godown_name"
                  value={
                    formData.godown_name
                  }
                  onChange={handleChange}
                  h="40px"
                  bg="white"
                  borderRadius="12px"
                  color="gray.700"
                  fontSize="15px"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "#237086",
                    boxShadow:
                      "0 0 0 1px #237086",
                  }}
                />

              </FormControl>

              {/* UNDER */}

              <FormControl>

                <FormLabel>
                  Under
                </FormLabel>

                <Select
                  placeholder="Select Parent Godown"
                  name="parent_id"
                  value={
                    formData.parent_id
                  }
                  onChange={handleChange}
                  h="40px"
                  bg="white"
                  borderRadius="12px"
                  color="gray.700"
                  fontSize="15px"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "#237086",
                    boxShadow:
                      "0 0 0 1px #237086",
                  }}
                >

                  {godownList
                    ?.filter(
                      (item) =>
                        item.id !==
                        Number(id)
                    )
                    ?.map((item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.godown_name}
                      </option>

                    ))}

                </Select>

              </FormControl>

              {/* ALLOW STORAGE */}

              <FormControl isRequired>

                <FormLabel>
                  Allow Storage Of Material
                </FormLabel>

                <Select
                  placeholder="Select Option"
                  name="allow_storage_material"
                  value={
                    formData.allow_storage_material
                  }
                  onChange={handleChange}
                  h="40px"
                  bg="white"
                  borderRadius="12px"
                  color="gray.700"
                  fontSize="15px"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "#237086",
                    boxShadow:
                      "0 0 0 1px #237086",
                  }}
                >

                  <option value={1}>
                    Yes
                  </option>

                  <option value={0}>
                    No
                  </option>

                </Select>

              </FormControl>

              {/* OUR STOCK */}

              <FormControl>

                <FormLabel>
                  Our Stock With Third Party
                </FormLabel>

                <Select
                  placeholder="Select Option"
                  name="our_stock_with_third_party"
                  value={
                    formData.our_stock_with_third_party
                  }
                  onChange={handleChange}
                  h="40px"
                  bg="white"
                  borderRadius="12px"
                  color="gray.700"
                  fontSize="15px"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "#237086",
                    boxShadow:
                      "0 0 0 1px #237086",
                  }}
                >

                  <option value={1}>
                    Yes
                  </option>

                  <option value={0}>
                    No
                  </option>

                </Select>

              </FormControl>

              {/* THIRD PARTY */}

              <FormControl>

                <FormLabel>
                  Third Party Stock With Us
                </FormLabel>

                <Select
                  placeholder="Select Option"
                  name="third_party_stock_with_us"
                  value={
                    formData.third_party_stock_with_us
                  }
                  onChange={handleChange}
                  h="40px"
                  bg="white"
                  borderRadius="12px"
                  color="gray.700"
                  fontSize="15px"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: "#237086",
                    boxShadow:
                      "0 0 0 1px #237086",
                  }}
                >

                  <option value={1}>
                    Yes
                  </option>

                  <option value={0}>
                    No
                  </option>

                </Select>

              </FormControl>

              <Divider />

              {/* BUTTON */}

              <Flex justify="flex-end">

                <Button
                  bg="#237086"
                  fontWeight="500"
                  fontSize="14px"
                  color="white"
                  _hover={{
                    bg: "#1B5A6B",
                  }}
                  px={8}
                  borderRadius="12px"
                  onClick={
                    isEditMode
                      ? handleEditGodown
                      : handleCreateGodown
                  }
                  isLoading={loading}
                  loadingText={
                    isEditMode
                      ? "Updating..."
                      : "Creating..."
                  }
                >

                  {isEditMode
                    ? "Update Godown"
                    : "Create Godown"}

                </Button>

              </Flex>

            </VStack>

          )}

        </CardBody>

      </Card>

    </Box>
  );
};

export default CreateGodown;