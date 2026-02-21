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
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from "@chakra-ui/react";

import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { GoHomeFill } from "react-icons/go";


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
      <HStack justifyContent='space-between'>
                <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                  <BreadcrumbItem>
                    <BreadcrumbLink href='/dashboard'> <GoHomeFill color="#5570F1"/> </BreadcrumbLink>
                  </BreadcrumbItem>
      
                  <BreadcrumbItem>
                    <BreadcrumbLink href='hr-mgmt/view-employee-list' color='#8B8D97' fontSize='13px'>Employee List</BreadcrumbLink>
                  </BreadcrumbItem>
      
                </Breadcrumb>
                {/* <Button backgroundColor='#3E60AA' color='white' fontWeight='400' height='36px' fontSize='14px' borderRadius='12px' _hover={{ backgroundColor: '#5570F1' }}><span style={{ fontSize: '18px', paddingRight: '10px' }}><FaPlus /></span> Create a New Product</Button> */}
      
              </HStack> 
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
