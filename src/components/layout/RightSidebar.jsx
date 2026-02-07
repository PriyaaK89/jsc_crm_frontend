// src/components/layout/RightSidebar.jsx
import { Box, Text } from "@chakra-ui/react";

const RightSidebar = () => {
  return (
    <Box
      w="250px"
      bg="gray.50"
      minH="100vh"
      p={5}
      display={{ base: "none", lg: "block" }}
    >
      <Text fontWeight="bold" mb={4}>Activity Feed</Text>
      <Text fontSize="sm" color="gray.600">Recent activities and updates here...</Text>
    </Box>
  );
};

export default RightSidebar;
