import {
  FormControl,
  SimpleGrid,
  VStack,
  Box,
  Text,
  FormLabel,
  Button,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Select
} from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";

const ViewStockGroup = () => {
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
              View Stock Group
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* Content Section */}
      <Box maxW="90%" mx="auto">
        <VStack spacing={6} align="stretch">

          <Text fontSize="lg" fontWeight="bold" color="#4d4d4d">
            View Stock Groups
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Select Stock Group</FormLabel>
              <Select placeholder="Select Stock Group">
                <option value="group1">Stock Group 1</option>
                <option value="group2">Stock Group 2</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          {/* Perfect Right Alignment */}
          <Box display="flex" justifyContent="flex-end">
            <Button px={8} colorScheme="blue">
              View
            </Button>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
};

export default ViewStockGroup;