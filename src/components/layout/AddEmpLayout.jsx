import React from "react";
import AddEmployee from "../../pages/HrMgmt/AddEmployee";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";

const AddEmpLayout = () => {
  return (
    <Flex bgColor="#f4f4f4" minH="100vh">
      <Box display={{ base: "none", sm: "none", md: "block" }}>
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Flex direction="column" flex="1" >
        <Box display={{ base: "none", md: "block"}}>
          <DesktopTopbar />
        </Box>
        <Box display={{ base: "block", md: "none" }}>
          <MobileTopbar />
        </Box>
        <Box flex="1" p={6}>
          <AddEmployee />
        </Box>
      </Flex>
    </Flex>
  );
};

export default AddEmpLayout;
