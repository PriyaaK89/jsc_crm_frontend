//  EmpAttendanceLayout.js
import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import EmpAttendance from "../../../pages/Employee/EmpAttendance";

const EmpAttendanceLayout = () => {
  return (
    <Flex bg="#f4f4f4" minH="100vh">
          
          {/* Desktop Sidebar */}
          <Box
          //  position = "fixed"
          //  top="0"
          //  left="0"
            w="268px"
            display={{ base: "none", md: "block" }}
          >
            <Sidebar />
          </Box>
    
          {/* Main Area */}
          <Flex
            direction="column"
            flex="1"
          width="83.5%">
            {/* Desktop Topbar */}
            <Box
              display={{ base: "none", md: "block" }}
                px={{ base: 4, md: 6 }}
              pt={4}
              mx={3}
            >
              <Topbar />
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
              pt={{ base: "20px", md: 4 }} width="100%"
            >
              <Box
                bg="white"
                borderRadius="20px"
                boxShadow="sm"
                p={{ base: 3, md: 6 }} 
                mt="75px" width="100%"
                mb={5}
              >
                <EmpAttendance />
              </Box>
            </Box>
          </Flex>
        </Flex>
  );
};

export default EmpAttendanceLayout;
