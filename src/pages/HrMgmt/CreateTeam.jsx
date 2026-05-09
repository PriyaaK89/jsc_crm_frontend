import { FormControl, FormLabel, Input, useToast, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack, VStack, Heading, Button,} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const CreateTeam = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
  });

  const labelStyles = {
    fontSize: "12px",
    color: "#686868",
    marginBottom: "3px",
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "target_amount" ? Number(value) : value,
    }));
  };

  // Create Team API
  const handleCreateTeam = async (e) => {
    e.preventDefault();

    // Validation
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
      const response = await API.post( API_ENDPOINTS?.create_team, formData);

      console.log(response.data);

      // Success Toast
      toast({
        title: "Success",
        description:
          response?.data?.message ||
          "Team created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      // Clear form
      setFormData({
        name: "",
        target_amount: "",
      });

    } catch (error) {
      console.log(error);

      // Error Toast
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md" >
      <HStack justifyContent="space-between">
        <Breadcrumb
          color="#8B8D97"
          padding="10px 0px 1rem 0px"
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard" >
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px" >
              Create Business Development Team
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Box>
        <Heading size="md" textAlign="center" mb={6} >
          Create Business Development Team
        </Heading>
      </Box>

      <Box as="form" onSubmit={handleCreateTeam}>
        <VStack spacing={5}>

          {/* Team Name */}
          <FormControl isRequired>
            <FormLabel {...labelStyles}>
              Team Name
            </FormLabel>

            <Input placeholder="Enter team name" name="name" value={formData.name} onChange={handleChange} />
          </FormControl>

          {/* Target Amount */}
          <FormControl isRequired>
            <FormLabel {...labelStyles}>
              Team Target Amount
            </FormLabel>

            <Input
              type="number"
              placeholder="Enter target amount"
              name="target_amount"
              value={formData.target_amount}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            margin="auto"
            isLoading={loading}
            loadingText="Creating..."
            w="200px"
          >
            Create Team
          </Button>

        </VStack>
      </Box>
    </Box>
  );
};

export default CreateTeam;