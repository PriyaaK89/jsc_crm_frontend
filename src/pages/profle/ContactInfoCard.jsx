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


const ContactInfoCard = ({ data }) => {
    
    
  return (
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
        <Text color="gray.500" isTruncated>{data?.name}</Text>

        <Text fontWeight="bold">Email :</Text>
        <Text color="gray.500" wordBreak="break-word">{data?.email}</Text>

        <Text fontWeight="bold">Phone :</Text>
        <Text color="gray.500">{data?.contact_no}</Text>

        <Text fontWeight="bold">City :</Text>
        <Text color="gray.500">{data?.city}</Text>

        <Text fontWeight="bold">Country :</Text>
        <Text color="gray.500">{data?.country}</Text>

        <Text fontWeight="bold">Address 1 :</Text>
        <Text color="gray.500">{data?.address_line1}</Text>

        <Text fontWeight="bold">Address 2 :</Text>
        <Text color="gray.500">{data?.address_line2 || "N/A"}</Text>

        <Text fontWeight="bold">Zip Code :</Text>
        <Text color="gray.500">{data?.pincode}</Text>
      </Box>
    </Box>
  );
};

export default ContactInfoCard;
