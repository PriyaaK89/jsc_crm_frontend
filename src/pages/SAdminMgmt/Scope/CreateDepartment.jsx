import axios from "axios";
import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  useToast,
  VStack,
} from "@chakra-ui/react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";


const CreateDepartment = () => {
  const [deptName, setDeptName] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const addDepartment = async (e) => {
    e.preventDefault();

    if (!deptName.trim()) {
      toast({
        description: "Department name is required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        API_ENDPOINTS?.create_department, { name: deptName },);

      if (response?.status === 201) {
        toast({
          description: "Department Created Successfully!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setDeptName("");
      }
    } catch (error) {
      toast({
        description:
          error.response?.data?.message ||
          "Something went wrong, Please try again!",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box w="100%" bg="white" p={6} borderRadius="md" boxShadow="md" >
      <Heading size="md" textAlign="center" mb={6} fontWeight="600">
        Create Department
      </Heading>

      <Box as="form" onSubmit={addDepartment}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="400">
              Department Name
            </FormLabel>
            <Input placeholder="Enter department name" value={deptName} onChange={(e) => setDeptName(e.target.value)}/>
          </FormControl>

          <Button type="submit" colorScheme="blue" isLoading={loading} loadingText="Creating..." w="200px" >
            Create Department
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default CreateDepartment;
