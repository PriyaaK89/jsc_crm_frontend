import {
  Box,
  Text,
  Divider,
  Avatar, Flex,useToast
} from "@chakra-ui/react";
import { EditIcon } from '@chakra-ui/icons'
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API  from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";


const ContactInfoCard = () => {
  const [empcontactDetails, setEmpcontactDetails] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const { empId } = useParams();
    const toast = useToast();
  
    // Fetch
   const fetchEmpContactDetails = async () => {
    try {
      setLoading(true);
  
      const res = await API.get(
        `${API_ENDPOINTS.get_emp_details}/${empId}`
      );
  
      console.log("API Response:", res);
  
      if (res?.data.success) {
        setEmpcontactDetails(res.data.data);
      }
  
    } catch (err) {
      console.error("Error:", err.response || err.message);
      toast({
        title: "Failed to load employee data",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
    useEffect(() => {
      if (empId) fetchEmpContactDetails();
      
    }, [empId]);
  
    // Loading state
    if (loading) return <Text>Loading...</Text>;
  
    // Safety check
    if (!empcontactDetails) return <Text>No Data Found</Text>;
    console.log(empcontactDetails)
    //  date formate 
    
  return (
//     <Box
//       bg="white"
//       p={6}
//       rounded="2xl"
//       shadow="md"
//       border="1px solid #eee"
//     >

//         <Flex alignitem="center" gap={4} mb={4} justifyContent="space-between">
//                 <Text fontSize="lg" fontWeight="bold" mb={2}>
//         Contact Information
//       </Text>
//                     <EditIcon boxSize={5} color="#5570F1" cursor="pointer"  _hover={{ color: '#3E60AA' }} onClick={() => alert('Edit functionality coming soon!')} />
                
//                 </Flex>
                
      

//       <Divider mb={4} />

//      <Box
//   display="grid"
//   gridTemplateColumns="150px 1fr"
//   gap={2}
//   lineHeight="2.2"
// >

//   <Text fontWeight="bold">NAME :</Text>
//   <Text color="gray.500">{empcontactDetails?.name}</Text>
//   <Text fontWeight="bold">Email :</Text>
//   <Text color="gray.500">{empcontactDetails?.email}</Text>

//   <Text fontWeight="bold">Phone :</Text>
//   <Text color="gray.500">{empcontactDetails?.contact_no}</Text>


//   <Text fontWeight="bold">City :</Text>
//   <Text color="gray.500">{empcontactDetails?.city}</Text>
//   <Text fontWeight="bold">Country :</Text>
//   <Text color="gray.500">{empcontactDetails?.country}</Text>
  
//   <Text fontWeight="bold">Address 1 :</Text>
//   <Text color="gray.500">{empcontactDetails?.address_line1}</Text>
  
//   <Text fontWeight="bold">Address 2 :</Text>
//   <Text color="gray.500">{empcontactDetails?.address_line2}</Text>


//   <Text fontWeight="bold">Zip Code :</Text>
//   <Text color="gray.500">{empcontactDetails?.pincode}</Text>

// </Box>

//     </Box>
<Box
      bg="white"
      p={6}
      rounded="2xl"
      shadow="md"
      border="1px solid #eee"
      maxW="100%"      // Ensures it doesn't exceed parent width
      w="full"         // Fills available space up to maxW
      overflow="hidden" // Prevents internal grid from pushing width out
    >
      <Flex alignItems="center" gap={4} mb={4} justifyContent="space-between">
        <Text fontSize="lg" fontWeight="bold">
          Contact Information
        </Text>
        <EditIcon 
          boxSize={5} 
          color="#5570F1" 
          cursor="pointer" 
          _hover={{ color: '#3E60AA' }} 
          onClick={() => alert('Edit functionality coming soon!')} 
        />
      </Flex>

      <Divider mb={4} />

      <Box
        display="grid"
        // Use minmax(0, 1fr) to prevent the column from expanding past the container
        gridTemplateColumns={{ base: "120px 1fr", md: "150px 1fr" }}
        gap={2}
        lineHeight="2.2"
      >
        <Text fontWeight="bold">NAME :</Text>
        <Text color="gray.500" isTruncated>{empcontactDetails?.name}</Text>

        <Text fontWeight="bold">Email :</Text>
        <Text color="gray.500" wordBreak="break-word">{empcontactDetails?.email}</Text>

        <Text fontWeight="bold">Phone :</Text>
        <Text color="gray.500">{empcontactDetails?.contact_no}</Text>

        <Text fontWeight="bold">City :</Text>
        <Text color="gray.500">{empcontactDetails?.city}</Text>

        <Text fontWeight="bold">Country :</Text>
        <Text color="gray.500">{empcontactDetails?.country}</Text>

        <Text fontWeight="bold">Address 1 :</Text>
        <Text color="gray.500">{empcontactDetails?.address_line1}</Text>

        <Text fontWeight="bold">Address 2 :</Text>
        <Text color="gray.500">{empcontactDetails?.address_line2 || "N/A"}</Text>

        <Text fontWeight="bold">Zip Code :</Text>
        <Text color="gray.500">{empcontactDetails?.pincode}</Text>
      </Box>
    </Box>
  );
};

export default ContactInfoCard;
