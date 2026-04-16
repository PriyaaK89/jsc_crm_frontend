import { useEffect, useState } from "react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack, SimpleGrid } from "@chakra-ui/react";
import PersonalInfoCard from "./PersonalInfoCard";
import ContactInfoCard from "./ContactInfoCard";
import { GoHomeFill } from "react-icons/go";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useParams,Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";


const Profile = () => {
    const {empId} = useParams();
    console.log("Employee ID from URL:", empId);
    const {auth} = useContext(AuthContext);
  console.log("Auth Context in Topbar:", auth);
  const userID = auth?.user?.id || "Unknown User";
  console.log("User ID:", userID);
     const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

   const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get (
        `${API_ENDPOINTS.get_emp_details}/${empId}`
      );
      if (res?.data.success) {
        return setEmployeeData(res.data.data);
      } 
    } catch (err) {
      setToast({
        title: "Failed to load employee data",
        status: "error",
        duration: 3000,
      });

      console.error("Error:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
    if (empId) fetchEmployeeDetails();
  }, [empId]);


  return (
          <Box backgroundColor='white' mt='1rem' padding='12px 20px' borderRadius='15px 15px 0px 0px'>
                <HStack justifyContent='space-between'>
                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                        <BreadcrumbItem>
                          <BreadcrumbLink as={Link} to='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>
            
                        <BreadcrumbItem>
                          <BreadcrumbLink isCurrentPage  color='#8B8D97' fontSize='13px'>Profile Information</BreadcrumbLink>
                        </BreadcrumbItem>
            
                      </Breadcrumb>
                      {/* <Button backgroundColor='#3E60AA' color='white' fontWeight='400' height='36px' fontSize='14px' borderRadius='12px' _hover={{ backgroundColor: '#5570F1' }}><span style={{ fontSize: '18px', paddingRight: '10px' }}><FaPlus /></span> Create a New Product</Button> */}
            
                    </HStack>
                          
                <SimpleGrid
  columns={{ base: 1, md: 2 }}
  spacing={{ base: 4, md: 6 }}
  mt={4}
  alignItems="stretch">
                    <PersonalInfoCard data={employeeData} fetchEmployeeDetails={fetchEmployeeDetails} />
                    <ContactInfoCard data={employeeData} />
                    </SimpleGrid>
                    </Box>
        

  );
};

export default Profile;



