import { Flex, FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";





const CreateLedgerSundrydr_cr = () => {
   const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };


    return (
    
     <Box as="form" mt={5}>
                 
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    
                   

                      <FormControl isRequired>
                                  <FormLabel {...labelStyles}>Maintain balances bill-by-bill</FormLabel>
                                  <Select placeholder='Select Any One ' fontSize="14px" >
                               <option value='yes'>Yes</option>
                               <option value='no'> NO</option>
                                 </Select>
                                </FormControl>

                                 <FormControl isRequired>
                      <FormLabel {...labelStyles}>
                         Default credit period(in days)
                      </FormLabel>
                      <Input placeholder="Default credit period(in days)" fontSize="12px" />
                    </FormControl>
</SimpleGrid>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>      
                          <FormControl isRequired >
                                
                                  <FormLabel {...labelStyles}>Check for credit day during voucher entry</FormLabel>
                                  <Select placeholder='Select Any One' fontSize="14px">
                               <option value='yes'>Yes </option>
                               <option value='no'>No</option>
                                 </Select>
                             
                                </FormControl>
                                  <FormControl isRequired >
                                
                                  <FormLabel {...labelStyles}>Nett Debit/Credit balance for report </FormLabel>
                                 <Input placeholder="Specify credit limit"/>
                             
                                </FormControl>
                                </SimpleGrid> 
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>   
               
                                  <FormControl isRequired >
                                
                                  <FormLabel {...labelStyles}>Inventory values are affected</FormLabel>
                                  <Select placeholder='Select Any One' fontSize="14px">
                               <option value='yes'>Yes </option>
                               <option value='no'>No </option>
                                 </Select>
                             
                                </FormControl>
                                  <FormControl isRequired >
                                
                                  <FormLabel {...labelStyles} >Activate interest calculation</FormLabel>
                                  <Select placeholder='Select Any One' fontSize="14px">
                               <option value='applicable'>Applicable</option>
                               <option value='notapplicable'>NotApplicable </option>
                                 </Select>
                             
                                </FormControl>
                                </SimpleGrid>
                             
                  
                </Box>
                
            

    );
}   


export default CreateLedgerSundrydr_cr
