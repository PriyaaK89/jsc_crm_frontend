// EmpAttendanceLayout.js
import React from "react";
import { Flex, Box } from "@chakra-ui/react";

import Sidebar from "./Sidebar";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import EmpAttendance from "../../pages/Employee/EmpAttendance";

const EmpAttendanceLayout = () => {
  return (
    <Flex minH="100vh" bg="#f4f4f4">

      {/* Fixed Sidebar */}
      <Box
        position="fixed"
        top="0"
        left="0"
        w="268px"
        h="100vh"
        display={{ base: "none", md: "block" }}
      >
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Flex
        direction="column"
        flex="1"
        ml={{ base: 0, md: "268px" }}
        h="100vh" // full height of viewport
      >

        {/* Desktop Topbar */}
        <Box
          display={{ base: "none", md: "block" }}
          px={{ base: 4, md: 6 }}
          pt={4}
          mx={3}
          flexShrink={0}
        >
          <DesktopTopbar />
        </Box>

        {/* Mobile Topbar */}
        <Box
          display={{ base: "block", md: "none" }}
          px={4}
          py={4}
          flexShrink={0}
        >
          <MobileTopbar />
        </Box>

        {/* Page Content */}
        <Box
          flex="1"
          px={{ base: 0, md: 6 }}
          py={6}
          mx={3}
          overflow="visible"  // remove scroll
        >
          <Box
            bg="white"
            p={6}
            borderRadius="21px"
            boxShadow="sm"
          >
            <EmpAttendance />
          </Box>
        </Box>

      </Flex>
    </Flex>
  );
};

export default EmpAttendanceLayout;