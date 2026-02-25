import { FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,SimpleGrid,Heading,Button,Select} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";




const AssignTargetTSM = () => {

   const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };

    return (
    <Box w="100%" bg="white" p={6} borderRadius="lg" >
                <HStack justifyContent='space-between'>
                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                        <BreadcrumbItem>
                          <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>
            
                        <BreadcrumbItem>
                          <BreadcrumbLink href='#' color='#8B8D97' fontSize='13px'>Assign TSM Sub Team</BreadcrumbLink>
                        </BreadcrumbItem>
            
                      </Breadcrumb>
                   
            
                    </HStack>
                
       
                <Heading size="md" textAlign="center" mb={6}>
                  Assign TSM sub Team
                </Heading>
          
                <Box as="form" >
                   <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    

                    {/* slect  */}
  <FormControl isRequired>
              <FormLabel {...labelStyles}>Select SUB Team</FormLabel>

                  <Select placeholder="Select" fontSize="12px" color='gray.600'>
                  <option value="sales">--please Select-- </option>
                      <option value="ssgsiker2021">S.S.G siker 2021  </option>
                     
                      
                         </Select>
                     </FormControl>



                    <FormControl isRequired>
              <FormLabel {...labelStyles}>Select Under RSM</FormLabel>

                  <Select placeholder="Select" fontSize="12px" color='gray.600'>
                  <option value="sales">--please Select-- </option>
                      <option value="ramlal">RAMLAL  </option>
                      <option value="ramlal">RAMLAL  </option>
                      <option value="ramlal">RAMLAL  </option>
                      <option value="ramlal">RAMLAL  </option>
                      
                         </Select>
                     </FormControl>

                 <FormControl isRequired>
              <FormLabel {...labelStyles}>Select TSM </FormLabel>

                  <Select placeholder="Select" fontSize="12px" color='gray.600'>
                  <option value="Primary">--please Select--</option>
                      <option value="monu">MONU GUPTA</option>
                       <option value="devendra">DEVENDRA </option>
                       <option value="devendra">DEVENDRA </option>
                        <option value="devendra">DEVENDRA </option>
                         <option value="devendra">DEVENDRA </option>

                         </Select>
                     </FormControl>



                     <FormControl isRequired>
                      <FormLabel {...labelStyles}>
                        Total Target Amount
                      </FormLabel>
                      <Input placeholder="Enter department name" />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyles}>
                        Pending Target Amount
                      </FormLabel>
                      <Input placeholder="Enter department name" />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel {...labelStyles}>
                        TSM Target Amount
                      </FormLabel>
                      <Input placeholder="Enter department name" />
                    </FormControl>
          
                    
                  </SimpleGrid>
                      {/* Button */}
                            <Box textAlign="center" mt={8}>
                              <Button
                                w={{ base: "100%", md: "200px" }}
                                colorScheme="blue"
                              >
                                Create
                              </Button>
                            </Box>
                </Box>
              </Box>










    );
}   


export default AssignTargetTSM
