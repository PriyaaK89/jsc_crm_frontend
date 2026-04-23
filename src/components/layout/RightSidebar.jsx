// src/components/layout/RightSidebar.jsx
import { Box, Text } from "@chakra-ui/react";

const RightSidebar = () => {
  return (
    <Box
    w="100%"
    h="140px"
       bg="white"
     mt={{base:2, md:0}}
     px={{base:3, md:6}}
     py={{base:3, md:4}}
    borderRadius="lg"
    boxShadow="md"
    >
      <Text fontWeight="bold" mb={4}>Activity Feed</Text>
      <Text fontSize="sm" color="gray.600">Recent activities and updates here...</Text>
    </Box>
  );
};

export default RightSidebar;
