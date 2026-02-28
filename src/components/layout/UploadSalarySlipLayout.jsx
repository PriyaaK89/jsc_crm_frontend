import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import UploadSalarySlip from "../../pages/HrMgmt/UploadSalarySlip";

const UploadSalarySlipLayout = () => {
  return (
 <Flex h="100vh" bg="#f4f4f4" overflow="hidden">      
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
          p={{ base: 3, md: 6 }}
          pt={{ base: "70px", md: 4 }}
          overflowY="auto"
        >
          <Box
            bg="white"
            borderRadius="20px"
            boxShadow="sm"
            p={{ base: 3, md: 6 }}
          >
            <UploadSalarySlip />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};
export default UploadSalarySlipLayout;