import React from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  Select,
  Button,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Heading
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import useUsersapi from '../../../Apis/GetUsersapi';

function RetailerAssignment() {
  const {users}=useUsersapi();
  
  return (
    <Box>

      <HStack justifyContent='space-between'>
        <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px'>
          <BreadcrumbItem>
            <BreadcrumbLink href='/dashboard'>
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
             
              color='#8B8D97'
              fontSize='13px'
            >
              Assign Retailer
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Heading size="lg" textAlign="center" mb={6}>
        Assign Retailer
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <FormControl mt={5}>
          <FormLabel>Retailer Name</FormLabel>
          <Select fontSize="13px" placeholder='Select Retailer name'>
          </Select>
        </FormControl>

        <FormControl mt={5}>
          <FormLabel>Employee Under</FormLabel>
          <Select fontSize="13px" placeholder='Select employee'>
            {users?.map((emp)=>(
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </Select>
        </FormControl>
      </SimpleGrid>

      <Box textAlign="center" mt={10}>
        <Button
          w={{ base: "100%", md: "200px" }}
          colorScheme="blue"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "md",
          }}
          transition="all 0.2s ease"
          borderRadius="xl"
        >
          Assign Ledger
        </Button>
      </Box>

    </Box>
  )
}

export default RetailerAssignment;