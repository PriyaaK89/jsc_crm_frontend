import React from 'react'
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

function CreditDaysReminderReport() {
  return (
     <Box p={6}>

      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm">
        <BreadcrumbItem>
                                 <BreadcrumbLink href="/dashboard">
                                   <GoHomeFill color="#5570F1"  size={20}/>
                                 </BreadcrumbLink>
                               </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink href="#">Reports</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Credit Days Reminder Report</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Page Title */}
      <Heading size="md" mb={6}>
        Credit Days Reminder Report
      </Heading>

      {/* Form Card */}
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
      >

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>

          <FormControl>
            <FormLabel>Select Party</FormLabel>
            <Select placeholder="Please Select" />
          </FormControl>

          <FormControl>
            <FormLabel>Select Employee</FormLabel>
            <Select placeholder="Please Select" />
          </FormControl>

          <FormControl>
            <FormLabel>Select State</FormLabel>
            <Select placeholder="Please Select" />
          </FormControl>

          <FormControl>
            <FormLabel>Select District</FormLabel>
            <Select placeholder="Please Select" />
          </FormControl>

          <FormControl >
        
              <FormLabel>Start Date</FormLabel>
              <Input type="date" placeholder="From Date" />
              </FormControl>
              <FormControl >
              <FormLabel>To Date</FormLabel>
              <Input type="date" placeholder="To Date" />
            

          </FormControl>

        </SimpleGrid>

        {/* Search Button */}
        <Box textAlign="right" mt={6}>
          <Button colorScheme="blue">
            SEARCH
          </Button>
        </Box>

      </Box>
    </Box>
  )
}

export default CreditDaysReminderReport
