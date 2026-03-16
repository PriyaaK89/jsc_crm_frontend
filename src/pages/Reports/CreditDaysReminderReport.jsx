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
import { useState,useEffect} from 'react';
import axios from "axios";
import useUsersapi from '../../Apis/GetUsersapi';


function CreditDaysReminderReport() {

  const {users}=useUsersapi();


   const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedState, setSelectedState] = useState("");
  
    // Load states
    useEffect(() => {
      axios.post("https://countriesnow.space/api/v0.1/countries/states", {
        country: "India"
      })
      .then(res => setStates(res.data.data.states));
    }, []);
  
    // When state selected
   const handleStateChange = async (state) => {
  
    setSelectedState(state);
    setDistricts([]); // reset districts
  
    try {
      const res = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          country: "India",
          state: state,
        }
      );
  
      setDistricts(res.data.data);
  
    } catch (error) {
      console.error("Error fetching districts", error);
    }
  };

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
            <Select placeholder="Please Select" >
              {users?.map((emp)=>(
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Select State</FormLabel>
            <Select
               placeholder="Select State"
               value={selectedState}
               onChange={(e) => handleStateChange(e.target.value)}
             >
               {states.map((s) => (
                 <option key={s.name} value={s.name}>
                   {s.name}
                 </option>
               ))}
             </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Select District</FormLabel>
            <Select placeholder="Select District">
               {districts.map((d, i) => (
                 <option key={i} value={d}>
                   {d}
                 </option>
               ))}
             </Select>
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
