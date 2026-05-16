import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Heading,
  Button,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Select,
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useEffect, useState } from "react";

import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

const CreateGroup = () => {

  const { id } = useParams();

  const isEditMode = Boolean(id);

  const toast = useToast();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);

  const [pageLoading, setPageLoading] =
    useState(false);

  const [accountList, setAccountList] =
    useState([]);

  const [formData, setFormData] = useState({
    group_name: "",
    parent_group_id: "",
    group_type: "",
    behaves_like_subledger: 0,
    nett_debit_credit: 0,
    used_for_calculation: 0,
    method_to_allocate: 0,
  });

  const labelStyles = {
    fontSize: "12px",
    color: "#494949",
    marginBottom: "3px",
  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        value === "1"
          ? 1
          : value === "0"
          ? 0
          : value,
    }));
  };

  // =========================
  // GET ACCOUNT GROUP LIST
  // =========================

  const getAccountGroupList = async () => {

    try {

      const response = await API.get(
        `${API_ENDPOINTS?.get_account_group_list}?page=${page}&limit=${limit}`
      );

      if (response?.status === 200) {

        setAccountList(
          response?.data?.data || []
        );
      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description:
          "Failed to fetch account groups",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =========================
  // GET SINGLE GROUP
  // =========================

  const getSingleGroup = async () => {
    try {
      setPageLoading(true);
      const response = await API.get(  `${API_ENDPOINTS?.get_account_by_id}/${id}` );
      if (response?.status === 200) {
        const data = response?.data?.data;
        setFormData({
          group_name: data?.group_name || "",
          parent_group_id: data?.parent_group_id || "",
          group_type: data?.group_type || "",
          behaves_like_subledger: data?.behaves_like_subledger || 0,
          nett_debit_credit: data?.nett_debit_credit || 0,
          used_for_calculation: data?.used_for_calculation || 0,
          method_to_allocate: data?.method_to_allocate || 0,
        });
      }

    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          "Failed to fetch group details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // VALIDATION
      if (!formData.group_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Group name is required",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setLoading(true);
      const payload = {
        group_name: formData.group_name,
        parent_group_id: formData.parent_group_id || null,
        group_type: formData.group_type,
        behaves_like_subledger: Number( formData.behaves_like_subledger),
        nett_debit_credit: Number( formData.nett_debit_credit ),
        used_for_calculation: Number( formData.used_for_calculation),
        method_to_allocate: Number( formData.method_to_allocate ),
      };

      let response;

      if (isEditMode) {

        response = await API.put(
          `${API_ENDPOINTS?.edit_account_group}/${id}`,
          payload
        );

      } else {

        // =========================
        // CREATE API
        // =========================

        response = await API.post(
          `${API_ENDPOINTS?.create_account_group}`,
          payload
        );
      }

      if (
        response?.status === 200 ||
        response?.status === 201
      ) {

        toast({
          title: "Success",
          description:
            response?.data?.message ||
            (isEditMode
              ? "Group updated successfully"
              : "Group created successfully"),
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        navigate(
          "/accounting-master/view-group"
        );
      }

    } catch (error) {

      console.log(error);

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

  useEffect(() => {
    getAccountGroupList();
    if (isEditMode) {
      getSingleGroup();
    }
  }, [id]);

  return (
    <Box w="100%" bg="white" p={6} borderRadius="lg" >


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

              {isEditMode
                ? "Edit Group"
                : "Create Group"}

            </BreadcrumbLink>

          </BreadcrumbItem>

        </Breadcrumb>

      </HStack>

      {/* HEADING */}

      <Heading
        fontSize="lg"
        fontWeight="bold"
        mb={6}
        textAlign="left"
      >

        {isEditMode
          ? "Edit Group"
          : "Create Group"}

      </Heading>

      {/* FORM */}

      <Box as="form">

        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={5}
        >

          {/* GROUP NAME */}

          <FormControl isRequired>

            <FormLabel {...labelStyles}>
              Name
            </FormLabel>

            <Input
              placeholder="Enter group name"
              fontSize="12px"
              name="group_name"
              value={formData.group_name}
              onChange={handleChange}
            />

          </FormControl>

          {/* PARENT GROUP */}

          <FormControl>

            <FormLabel {...labelStyles}>
              Under
            </FormLabel>

            <Select
              placeholder="Select Parent Group"
              fontSize="14px"
              name="parent_group_id"
              value={
                formData.parent_group_id
              }
              onChange={handleChange}
            >

              {accountList?.map((group) => (

                <option
                  key={group?.id}
                  value={group?.id}
                >
                  {group?.group_name}
                </option>

              ))}

            </Select>

          </FormControl>

        </SimpleGrid>

        {/* SECOND ROW */}

        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={5}
          mt={5}
        >

          <FormControl>

            <FormLabel {...labelStyles}>
              Group behaves like a
              sub-ledger
            </FormLabel>

            <Select
              name="behaves_like_subledger"
              value={
                formData.behaves_like_subledger
              }
              onChange={handleChange}
            >
              <option value={1}>
                Yes
              </option>

              <option value={0}>
                No
              </option>
            </Select>

          </FormControl>

          <FormControl>

            <FormLabel {...labelStyles}>
              Nett Debit/Credit balance
              for report
            </FormLabel>

            <Select
              name="nett_debit_credit"
              value={
                formData.nett_debit_credit
              }
              onChange={handleChange}
            >
              <option value={1}>
                Yes
              </option>

              <option value={0}>
                No
              </option>
            </Select>

          </FormControl>

        </SimpleGrid>

        {/* THIRD ROW */}

        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={5}
          mt={5}
        >

          <FormControl>

            <FormLabel {...labelStyles}>
              Used for calculation
            </FormLabel>

            <Select
              name="used_for_calculation"
              value={
                formData.used_for_calculation
              }
              onChange={handleChange}
            >
              <option value={1}>
                Yes
              </option>

              <option value={0}>
                No
              </option>
            </Select>

          </FormControl>

          <FormControl>

            <FormLabel {...labelStyles}>
              Method to allocate when
              used in purchase invoice
            </FormLabel>

            <Select
              name="method_to_allocate"
              value={
                formData.method_to_allocate
              }
              onChange={handleChange}
            >
              <option value={1}>
                Applicable
              </option>

              <option value={0}>
                Not Applicable
              </option>
            </Select>

          </FormControl>

        </SimpleGrid>

        {/* BUTTON */}

        <Box
          textAlign="right"
          mt={8}
        >

          <Button
            className="submit_btn"
            onClick={handleSubmit}
            isLoading={
              loading || pageLoading
            }
            loadingText={
              isEditMode
                ? "Updating"
                : "Creating"
            }
          >

            {isEditMode
              ? "Update"
              : "Create"}

          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateGroup;