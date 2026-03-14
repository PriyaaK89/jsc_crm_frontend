import React from 'react'
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  HStack,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { useState,useEffect} from 'react';
import axios from "axios";


function ItemPLReport() {

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

  const [SelectGroup, setSelectGroup] = useState("");
      const setledger=["ledger-wise"].includes(SelectGroup);
      const employeewise=["employee-wise"].includes(SelectGroup);
      const statewise =["state-wise"].includes(SelectGroup);
      const districwise=["distric-wise"].includes(SelectGroup);
    return (
     <Box
           
             p={6}
           >
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
                               <BreadcrumbLink>  Item  Profit Loss Report</BreadcrumbLink>
                             </BreadcrumbItem>
                           </Breadcrumb>
                     
             <Heading size="md" mb={6}>
             View Profit Loss Report
             </Heading>
       
       
             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
<FormControl>
                 <FormLabel>Select Item</FormLabel>
                 <Select placeholder="--Please Select--" >
                  <option value="">makka </option>
                   <option value="">bajara</option>
                    <option value="">mustard</option>
                     <option value="">wheat</option>
                 </Select>
               </FormControl>



               <FormControl>
                 <FormLabel>Select Filter Type</FormLabel>
                 <Select placeholder="--Please Select--"  onChange={(e) => setSelectGroup(e.target.value)} >
                  <option value="ledger-wise">Ledger wise</option>
                   <option value="employee-wise">Employee Wise</option>
                    <option value="state-wise">State Wise</option>
                     <option value="distric-wise">Distric wise</option>
                 </Select>
               </FormControl>
     
       {setledger &&(
  <FormControl>
                 <FormLabel>Select Ledger</FormLabel>
                 <Select placeholder="--Please Select--" />
               </FormControl>
       )}
        {employeewise &&(
  <FormControl>
                 <FormLabel>Select Employee</FormLabel>
                 <Select placeholder="--Please Select--" />
               </FormControl>
       )}
  
   {statewise &&(
  <FormControl>
                 <FormLabel>Select state</FormLabel>
                 <Select placeholder="--Please Select--" />
               </FormControl>
       )}
  
   {districwise &&(
   
      
  <FormControl mb={4}>
  <FormLabel>State</FormLabel>

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

    
              
              
       )}
  
        {districwise &&(
          <FormControl>
  <FormLabel>District</FormLabel>

  <Select placeholder="Select District">
    {districts.map((d, i) => (
      <option key={i} value={d}>
        {d}
      </option>
    ))}
  </Select>
</FormControl>
  )}
               
       
               
        <HStack>
               <FormControl>
                 <FormLabel>Start Date</FormLabel>
                   <Input type="date" />
               </FormControl>
               <FormControl>
                 <FormLabel> To  Date</FormLabel>
                   <Input type="date" />
               </FormControl>
               </HStack>
       
             </SimpleGrid>
       
             <Box textAlign="right" mt={6}>
               <Button colorScheme="blue">
               Show
               </Button>
             </Box>
           </Box>
    )
  }

export default ItemPLReport
