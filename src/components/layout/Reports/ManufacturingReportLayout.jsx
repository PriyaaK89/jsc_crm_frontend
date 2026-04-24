import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import ManuFacturingReport from "../../../pages/Reports/ManuFacturingReport";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";

const ManufacturingReportLayout = () => {
  return (
   <Box bg="#F4F4F4" minH="100vh" >
            <Box display={{ base: "none", md: "block" }}>
              <Sidebar />
      
            </Box>
            <Box display={{ base: "none", md: "block" }}>
              <Topbar />
            </Box>
            <Box display={{ base: "block", md: "none" }}>
              <MobileTopbar />
            </Box>
            <Box
              ml={{ base: 5, md: "295px" }}
              mr={{base:5, md:5}}
              pt="5rem"
              pb={6}
            >
              <NotificationBtn/>
              <ManuFacturingReport />
            </Box>
          </Box>
  );
};

export default ManufacturingReportLayout
