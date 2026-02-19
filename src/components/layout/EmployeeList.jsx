import React from "react";
import { Flex, Box, useDisclosure } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import EmployeeList from "../../pages/HrMgmt/EmployeeList";

const EmployeeListLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // for mobile drawer

  return (
    <Flex bgColor="#f4f4f4" minH="100vh">
      {/* Sidebar for Desktop */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Flex direction="column" flex="1" p={6} mt={4}>
        {/* Desktop Topbar */}
        <Box display={{ base: "none", md: "block" }}>
          <DesktopTopbar />
        </Box>

        {/* Mobile Topbar */}
        <Box display={{ base: "block", md: "none" }}>
          <MobileTopbar />
        </Box>

        {/* Page Content */}
        <Box flex="1"p={6}   >
          <EmployeeList />
        </Box>
      </Flex>
    </Flex>
  );
};

export default EmployeeListLayout;
