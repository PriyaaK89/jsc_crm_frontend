import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack, SimpleGrid } from "@chakra-ui/react";
import PersonalInfoCard from "./PersonalInfoCard";
import ContactInfoCard from "./ContactInfoCard";
import { GoHomeFill } from "react-icons/go";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useParams } from "react-router-dom";



const Profile = () => {
    const {empId} = useParams();
    console.log("Employee ID from URL:", empId);
    const {auth} = useContext(AuthContext);
  console.log("Auth Context in Topbar:", auth);
  const userID = auth?.user?.id || "Unknown User";
  console.log("User ID:", userID);
  return (
          <Box backgroundColor='white' mt='1rem' padding='12px 20px' borderRadius='15px 15px 0px 0px'>
                <HStack justifyContent='space-between'>
                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                        <BreadcrumbItem>
                          <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>
            
                        <BreadcrumbItem>
                          <BreadcrumbLink href='/products' color='#8B8D97' fontSize='13px'>Employee</BreadcrumbLink>
                        </BreadcrumbItem>
            
                      </Breadcrumb>
                      {/* <Button backgroundColor='#3E60AA' color='white' fontWeight='400' height='36px' fontSize='14px' borderRadius='12px' _hover={{ backgroundColor: '#5570F1' }}><span style={{ fontSize: '18px', paddingRight: '10px' }}><FaPlus /></span> Create a New Product</Button> */}
            
                    </HStack>
                <SimpleGrid
  columns={{ base: 1, md: 2 }}
  spacing={{ base: 4, md: 6 }}
  mt={4}
  alignItems="stretch"
  
>
                    <PersonalInfoCard />
                    <ContactInfoCard />
                    </SimpleGrid>
                    </Box>
        

  );
};

export default Profile;



