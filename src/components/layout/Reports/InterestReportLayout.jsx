import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../Sidebar";
import DesktopTopbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import InterestReport from "../../../pages/Reports/InterestReport";

const InterestReportLayout = () => {
  return (
  <Flex bg="#f4f4f4" minH="100vh">
      
      {/* Desktop Sidebar */}
      <Box
       position = "fixed"
       top="0"
       left="0"
        w="268px"
        display={{ base: "none", md: "block" }}
      >
        <Sidebar />
      </Box>

      {/* Main Area */}
      <Flex
        direction="column"
        flex="1"
        ml={{ base: 0, md: "268px" }}
      >
        {/* Desktop Topbar */}
        <Box
          display={{ base: "none", md: "block" }}
            px={{ base: 4, md: 6 }}
          pt={4}
          mx={3}
        >
          <DesktopTopbar />
        </Box>

        {/* Mobile Topbar */}
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          top="0"
          w="100%"
          zIndex="10"
        >
          <MobileTopbar />
        </Box>

        {/* Content */}
        <Box
          flex="1"
          px={{ base: 3, md: 6 }}
          pt={{ base: "20px", md: 4 }}
          
        >
          <Box
            bg="white"
            borderRadius="20px"
            boxShadow="sm"
            p={{ base: 3, md: 6 }} 
            mt="75px"
            mb={5}
          >
            <InterestReport />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default InterestReportLayout
