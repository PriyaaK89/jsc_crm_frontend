import React from "react";
import  { useState } from "react";
import {
  Box,
  Heading,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Flex,
  Divider
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

function CreateVoucher() {
 const [selectedOption, setSelectedOption] = useState("");
  return (
    <Box p={6}  minH="100vh">

      {/* 🔹 Breadcrumb */}
      <HStack justify="space-between" mb={4}>
        <Breadcrumb fontSize="sm">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <GoHomeFill />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>Create Voucher</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* 🔹 Page Title */}
      <Heading size="lg" textAlign="center" mb={6} >
        Create Voucher
      </Heading>

    
      <Box  p={6} borderRadius="xl" boxShadow="sm">

        {/* Voucher Basic Info */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={6}>
  
           <FormControl>
            <FormLabel>Voucher Name </FormLabel>
            <Input placeholder="enter voucher name" />
          </FormControl>

          <FormControl>
            <FormLabel>Select Type of Voucher</FormLabel>
            <Select placeholder="Select Voucher Type" >
            <option>Attendance </option>
            <option>Contra</option>
            <option>credit Note</option>
            <option>Debit Note</option>
            <option>Delivary Note</option>
            <option>Job Work in Order</option>
            <option>Job Work out Order</option>
            <option>Journal</option>
            <option>Material In</option>
            <option>Material Out</option>
            <option>MemoRandum</option>
            <option>Payment</option>
            <option>Payroll</option>
            <option>Physical Stock</option>
            <option>Purchase</option>
            <option>Purchase Order</option>
            <option>Receipt</option>
            <option>Receipt Note</option>
            <option>Rejection Out</option>
            <option>Reversing Journal</option>
            <option>Sales</option>

            </Select>
          </FormControl>


        </SimpleGrid>


        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={6}>

          <FormControl>
            <FormLabel>Method Of Numbering</FormLabel>
            <Select placeholder="Select any one" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)} >
              <option value="automatic">AutoMatic</option>
                <option value="manual">Manual</option>
              </Select>
          </FormControl>
         {/* use advance numbering */}

           <FormControl>
            <FormLabel> Use Advance Numbering </FormLabel>
            <Select placeholder="Select any one" value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}>
              <option value="useadvancenumberingyes">yes</option>
              <option vlaue="no">no</option>
              </Select>
          </FormControl>

          {selectedOption==="automatic" && (
            <FormControl>
            <FormLabel> Use Advance Numbering *</FormLabel>
            <Select placeholder="Select any one" >
              <option vlaue="useadvancenumberingyes">yes</option>
              <option>no</option>
              </Select>
          </FormControl>
          )}
          {selectedOption==="useadvancenumberingyes" &&(
            <Box bg="gray.50" p={3} borderRadius="xl" border="2px solid gary.100">
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={6} >
            
            <FormControl >
            <FormLabel> Decimal Digit</FormLabel>
            <Input />
          </FormControl>
          <FormControl>
            <FormLabel>Starting Number </FormLabel>
            <Input/>
          </FormControl>
          <FormControl>
            <FormLabel> Prefix</FormLabel>
            <Input/>
          </FormControl>
          <FormControl>
            <FormLabel> Suffix</FormLabel>
            <Input/>
          </FormControl>
          </SimpleGrid>
          </Box>
          )}

          <FormControl>
            <FormLabel>Use Effective Date of Voucher</FormLabel>
            <Select placeholder="Select any one" >
              <option>yes</option>
              <option>no</option>
              </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Voucher Start Date</FormLabel>
            <Input type="date" placeholder="start date " />
          </FormControl>
          

          <FormControl>
            <FormLabel>Voucher End Date</FormLabel>
            <Input type="date" placeholder="end date " />
           
          </FormControl>
           <FormControl mb={5}>
          <FormLabel> Allow Narration in voucher</FormLabel>
         <Select placeholder="select any one ">
          <option>yes</option>
            <option>no</option>
         </Select>
        </FormControl>

        </SimpleGrid>

        
       

       
        <Flex justify="flex-end" gap={4}>
          <Button variant="outline">Cancel</Button>
          <Button colorScheme="blue">Save Voucher</Button>
        </Flex>

      </Box>
    </Box>
  );
}

export default CreateVoucher;