import {
  FormControl,
  SimpleGrid,
  VStack,
  Box,
  Text,
  FormLabel,
  Button,
  HStack,
  Select,
  Input,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from "@chakra-ui/react";
import React from "react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";

const CreateStockCategory = () => {
  return (
    <Box bg="white" px={6} py={4}> 
      
      {/* Top Section */}
      <HStack justifyContent="space-between" mb={6}>
        <Breadcrumb color="#8B8D97">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="#8B8D97" fontSize="13px">
              Create Stock Category
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* Form Section */}
      <Box maxW="90%" mx="auto">
        <VStack spacing={6} align="stretch">
          <Text fontSize="lg" color="#4d4d4d" fontWeight="bold">
            Create Stock Category
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input type="text" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Select Stock Group</FormLabel>
              <Select placeholder="Select Stock Name">
                <option value="group1">Stock Group 1</option>
                <option value="group2">Stock Group 2</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          {/* Button Right Align */}
          <Box textAlign="right">
            <Button colorScheme="blue" px={8}>
              Create
            </Button>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
};

export default CreateStockCategory;