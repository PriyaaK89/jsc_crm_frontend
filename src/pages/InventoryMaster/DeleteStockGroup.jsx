import {
  FormControl,
  Text,
  FormLabel,
  SimpleGrid,
  VStack,
  Box,
  Select,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack
} from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";

const DeleteStockGroup = () => {
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
            <BreadcrumbLink>
              Delete Stock Group
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* Content Section */}
      <Box >
        <VStack spacing={6} align="stretch">

          <Text fontSize="lg" fontWeight="bold" color="#4d4d4d">
            Delete Stock Group
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Select Stock Group</FormLabel>
              <Select name="stockGroup">
                <option value="group1">Stock Group 1</option>
                <option value="group2">Stock Group 2</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          {/* Button Right Align */}
          <Box mx="auto">
            <Button colorScheme="red" px={8}>
              Delete
            </Button>
          </Box>

        </VStack>
      </Box>

    </Box>
  );
};

export default DeleteStockGroup;