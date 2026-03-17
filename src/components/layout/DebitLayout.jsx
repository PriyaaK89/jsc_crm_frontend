import React from 'react'
import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import Debit from "../../pages/Order Vochar/Debit";

const DebitLayout = () => {
  return (
    <Box bg="#f4f4f4">

      {/* Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>

      {/* Desktop Topbar */}
      <Box display={{ base: "none", md: "block" }}>
        <DesktopTopbar />
      </Box>

      {/* Mobile Topbar */}
      <Box display={{ base: "flex", md: "none" }}>
        <MobileTopbar />
      </Box>

      {/* Page Content */}
      <Box
        ml={{ base: 3, md: "268px" }}
        mr={{ base: 3, md: 6 }}
        mt={{ base: "90px", md: "90px" }}
        mb={{ base: 6, md: 8 }}
      >
        <Debit />
      </Box>

    </Box>
  )
}
export default DebitLayout ;