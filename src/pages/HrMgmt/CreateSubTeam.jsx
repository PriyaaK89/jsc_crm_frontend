import { FormControl, FormLabel, Input, useToast, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, SimpleGrid, HStack, Heading, Button, Checkbox, CheckboxGroup, VStack, Wrap, WrapItem, Tag, TagLabel, TagCloseButton, Text, Select as ChakraSelect} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { useEffect, useState } from "react";
import ReactSelect from "react-select";

const CreateSubTeam = () => {
  const toast = useToast();

  const [team, setTeam] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    parent_team_id: "",
    category_ids: [],
    target_amount: "",
    pending_target_amount: "",
    sub_team_target_amount: "",
  });

  // ================= FETCH TEAM LIST =================
  const fetchTeamList = async () => {
    try {
      const response = await API.get(API_ENDPOINTS?.get_team_list);

      if (response?.status === 200) {
        setTeam(response?.data?.data);
        console.log(response?.data?.data, "team_list");
      }
    } catch (error) {
      console.log(error, "Error in fetching Data.");
    }
  };

  // ================= FETCH CATEGORY LIST =================
  const fetchStockCategories = async () => {
    try {
      const response = await API?.get(
        API_ENDPOINTS?.View_stock_category
      );

      if (response?.status === 200) {
        setCategories(response?.data?.data);
        console.log(response?.data?.data, "Categories List");
      }
    } catch (error) {
      console.log(error, "Something went wrong, Please Try Again");
    }
  };

  useEffect(() => {
    fetchTeamList();
    fetchStockCategories();
  }, []);

  // ================= GET TEAM BY ID =================
  const getTeamById = async (teamId) => {
    try {
      const response = await API.get(
        `${API_ENDPOINTS?.get_team_by_id}/${teamId}`
      );

      if (response?.status === 200) {
        const teamData = response?.data?.data;

        setSelectedTeam(teamData);

        // auto fill related fields
        setFormData((prev) => ({
          ...prev,
          target_amount: teamData?.target_amount || "",
          pending_target_amount:
            teamData?.pending_target_amount || "",
        }));
      }
    } catch (error) {
      console.log(error, "Something went wrong");
    }
  };

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // team selected
    if (name === "parent_team_id" && value) {
      getTeamById(value);
    }
  };

  // ================= HANDLE CATEGORY SELECT =================
  const handleCategoryChange = (values) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: values.map((id) => Number(id)),
    }));
  };

  // ================= REMOVE CATEGORY =================
  const removeCategory = (id) => {
    const updatedCategories = formData?.category_ids?.filter(
      (item) => item !== id
    );

    setFormData((prev) => ({
      ...prev,
      category_ids: updatedCategories,
    }));
  };

  // ================= CREATE SUB TEAM =================
  const handleCreateSubTeam = async () => {
    const payload = {
      name: formData?.name,
      parent_team_id: Number(formData?.parent_team_id),
      category_ids: formData?.category_ids,
      sub_team_target_amount: Number(
        formData?.sub_team_target_amount
      ),
    };

    console.log(payload, "PAYLOAD");

    try {
      const response = await API?.post(
        API_ENDPOINTS?.create_sub_team,
        payload
      );

      if (response?.status === 200 || response?.status === 201) {
        toast({
          title: "Sub Team Created Successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // reset form
        setFormData({
          name: "",
          parent_team_id: "",
          category_ids: [],
          target_amount: "",
          pending_target_amount: "",
          sub_team_target_amount: "",
        });

        setSelectedTeam({});
      }
    } catch (error) {
      console.log(error, "Something Went wrong Please Try Again");

      toast({
        title:
          error?.response?.data?.message ||
          "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const labelStyles = {
    fontSize: "12px",
    color: "#686868",
    marginBottom: "3px",
  };

  return (
    <Box
      bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md"
    >

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
              Create Sub Team
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

 <Heading
          size="md"
          color="gray.600" fontSize="18px" mb="1.25rem"
        >Create Sub-Team

        </Heading>

      <Box as="form">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} >
          {/* SUB TEAM NAME */}
          <FormControl isRequired>
            <FormLabel {...labelStyles}>
              Sub Team Name
            </FormLabel>

            <Input placeholder="Enter Sub Team Name" name="name" value={formData?.name} onChange={handleChange}/>
          </FormControl>

          {/* SELECT TEAM */}
          <FormControl isRequired>
            <FormLabel {...labelStyles}> Select Under Team </FormLabel>

            <ChakraSelect
              placeholder="Select Team"
              fontSize="14px"
              color="gray.600"
              name="parent_team_id"
              value={formData?.parent_team_id}
              onChange={handleChange}
            >
              {team?.map((item) => (
                <option key={item?.id} value={item?.id}>
                  {item?.name}
                </option>
              ))}
            </ChakraSelect>
          </FormControl>

          {/* PRODUCT CATEGORY MULTI SELECT */}
          <FormControl isRequired>
  <FormLabel {...labelStyles}>  Select Product Category </FormLabel>

  <ReactSelect
    isMulti
    name="category_ids"
    options={categories?.map((item) => ({
      value: item?.id,
      label: item?.name,
    }))}
    value={categories
      ?.filter((item) =>
        formData?.category_ids?.includes(item?.id)
      )
      ?.map((item) => ({
        value: item?.id,
        label: item?.name,
      }))}
    onChange={(selectedOptions) => {
      const ids = selectedOptions
        ? selectedOptions.map((item) => item.value)
        : [];

      setFormData((prev) => ({
        ...prev,
        category_ids: ids,
      }));
    }}
    placeholder="Select Product Categories"
    closeMenuOnSelect={false}
  />
</FormControl>

          {/* TOTAL TARGET AMOUNT */}
          <FormControl isRequired>
            <FormLabel {...labelStyles}>
              Total Target Amount
            </FormLabel>

            <Input
              placeholder="Total Target Amount"
              name="target_amount"
              value={formData?.target_amount}
              readOnly
              bg="gray.100"
            />
          </FormControl>

          {/* PENDING TARGET AMOUNT */}
          <FormControl isRequired>
            <FormLabel {...labelStyles}>
              Pending Target Amount
            </FormLabel>

            <Input
              placeholder="Pending Target Amount"
              name="pending_target_amount"
              value={formData?.pending_target_amount}
              readOnly
              bg="gray.100"
            />
          </FormControl>

          {/* SUB TEAM TARGET AMOUNT */}
          <FormControl isRequired>
            <FormLabel {...labelStyles}>
              Sub Team Target Amount
            </FormLabel>

            <Input
              type="number"
              placeholder="Enter Sub Team Target Amount"
              name="sub_team_target_amount"
              value={formData?.sub_team_target_amount}
              onChange={handleChange}
            />
          </FormControl>
        </SimpleGrid>

        {/* BUTTON */}
        <Box textAlign="center" mt={8}>
          <Button
            bg="#237086"
                fontWeight="500" fontSize="14px"
                color="white"
                _hover={{
                  bg: "#1B5A6B"
                }} borderRadius="12px" px={8}
            onClick={handleCreateSubTeam}
          >
            Create Subteam
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateSubTeam;