import { FormControl,FormLabel,Input } from "@chakra-ui/react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, SimpleGrid,HStack,Heading,Button,Select} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";




const CreateSubTeam = () => {
   const labelStyles = {
        fontSize: "12px",
        color: "#686868",
        marginBottom: "3px",
    };

    return (
    <Box w="100%" bg="white" p={6} borderRadius="lg"  >
                <HStack justifyContent='space-between'>
                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                        <BreadcrumbItem>
                          <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>
            
                        <BreadcrumbItem>
                          <BreadcrumbLink href='#' color='#8B8D97' fontSize='13px'>Create Business Development Sub Team</BreadcrumbLink>
                        </BreadcrumbItem>
            
                      </Breadcrumb>
                   
            
                    </HStack>
                
       
                <Heading size="md" textAlign="center" mb={6}>
                  Create Business Development Sub Team
                </Heading>
          
                <Box as="form" >
                                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  
                    <FormControl isRequired>
                      <FormLabel {...labelStyles}>
                       Sub Team Name
                      </FormLabel>
                      <Input placeholder="Enter department name" />
                    </FormControl>

                    {/* slect  */}
                    <FormControl isRequired>
              <FormLabel {...labelStyles}>Sleact Under Team</FormLabel>

                  <Select placeholder="Select team type" fontSize="14px" color='gray.600'>
                  <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                       <option value="development">Development</option>
                         </Select>
                     </FormControl>

                 <FormControl isRequired>
              <FormLabel {...labelStyles}>Select Product Category</FormLabel>

                  <Select placeholder="Select team type" fontSize="14px" color='gray.600'>
                  <option value="Primary">Primary</option>
                      <option value="ssg">S.S.G</option>
                       <option value="bajari-multicut">BAJARI MULTICUT</option>
                       <option value="veritable-seeds">Veritable Seeds</option>

                       <option value="onion-seeds">ONION SEEDS</option>

                       <option value="musterd-seeds">MUSTERD SEEDS</option>
                       <option value="bio-fertilizer">BIO FERTILIZER</option>
                       <option value="bio-fertilizer">ROW MATERIAL BIO FERTILIZER</option>
                       <option value="row-material-of-seeds">ROW MATERIAL OF SEEDS </option>
                       <option value="bajra-seeds">BAJRA SEEDS</option>
                       <option value="wheat">WHEAT</option>
                       <option value="moong-seeds">MOONG SEEDS</option>
                       <option value="maze-seeds">MAZE SEEDS</option>

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
                        Sub Team Target Amount
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
export default CreateSubTeam;