import { Flex, FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Select } from '@chakra-ui/react'
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack,Heading,Button,SimpleGrid} from "@chakra-ui/react";


function CreateLedgerbankconfi() {
     const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };
  return (
    <>
      <Box w="100%"    mt={5} border="1px" borderRadius="lg">
            <HStack justifyContent='space-between' bg="#e9f2ff" borderBottom="1px solid #d9e5f8" p={1} pl={6}>
                             <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                               
                   
                               <BreadcrumbItem>
                                 <BreadcrumbLink  color='#000000' size="lg" >Bank Configuration :</BreadcrumbLink>
                               </BreadcrumbItem>
                             </Breadcrumb>
                           </HStack>
                          
           
                    <FormControl isRequired  p={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                         <FormControl isRequired mt={2}>
       
                                         <FormLabel {...labelStyles} >Set cheque books</FormLabel>
                              <Select name="Set_cheque_books" fontSize="14px">
                               <option value="-1"> Plese Select</option>
                                <option value="yes">Yes</option>
                               <option value="no">No</option>
                                   </Select>
                              </FormControl>  
                             
                             <FormControl isRequired mt={5}>
                                         <FormLabel {...labelStyles} >Cheque printing</FormLabel>
                              <Select name="Cheque_printing" fontSize="14px">
                               <option value="-1"> Plese Select</option>
                                <option value="yes">Yes</option>
                               <option value="no">No</option>
                                   </Select>
                              </FormControl>  
                          </SimpleGrid>
        </FormControl>
          </Box>
    </>
  )
}

export default CreateLedgerbankconfi
