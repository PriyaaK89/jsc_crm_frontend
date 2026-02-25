import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  VStack,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
} from "@chakra-ui/react";
import React from "react";
import { GoHomeFill } from "react-icons/go";
import { Form } from "react-router-dom";
import { Link } from "react-router-dom";


const CreateStockGroup = () => {
  return (
    <Box bg="white" px={6} py={4}>
     {/* Top Section */}
     <HStack justifyContent="space-between" mb={6}>

           <Breadcrumb color="#8B8D97">
           <BreadcrumbItem>
           <BreadcrumbLink as={Link} href="/dashboard"><GoHomeFill color="#5570F1"/></BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage>Create Stock Group</BreadcrumbLink>
           </BreadcrumbItem>
           </Breadcrumb>
                </HStack>
   {/* Form Section */}
   <Box maxW="90%" mx="auto">

      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" color="#4d4d4d" fontWeight="bold">
          Create Stock Group
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input placeholder="Enter stock group name" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Under</FormLabel>
            <Select placeholder="Select Stock Group">
              <option>Stock Group 1</option>
              <option>Stock Group 2</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Should quantities of items be added</FormLabel>
            <Select>
              <option>Yes</option>
              <option>No</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Override Limit</FormLabel>
            <Input type="number" />
          </FormControl>
        </SimpleGrid>
        {/* Button Right Align */}
        <Box textAlign="right">
            <Button colorScheme="blue" px={8}>

          Create Stock Group
        </Button>
        </Box>
            
      </VStack>
      </Box>
          </Box>

  );
};

export default CreateStockGroup;