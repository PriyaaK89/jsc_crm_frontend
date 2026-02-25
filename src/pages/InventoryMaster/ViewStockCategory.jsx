import { FormControl, SimpleGrid, HStack,VStack, Box, Text, FormLabel, Button,
  Breadcrumb,BreadcrumbItem,BreadcrumbLink, Select,Input } from '@chakra-ui/react'
import React from 'react';
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";


const ViewStockCategory = () => {
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
                      <Box maxW="90%" mx="auto">

      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" color="#4d4d4d" fontWeight="bold">
          Create Stock Category
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input type="text"  />
          </FormControl>
          <FormControl>
            <FormLabel isRequired>Select Stock Group</FormLabel>
            <Select placeholder="Select Stock Name">
              <option value="group1">Stock Group 1</option>
              <option value="group2">Stock Group 2</option>
            </Select>

          </FormControl>
        </SimpleGrid>
        <Box textAlign="right">

        <Button  colorScheme="blue" px={8}>Create</Button>
              </Box>

      </VStack>
                            </Box>

    </Box>
  )
}

export default ViewStockCategory