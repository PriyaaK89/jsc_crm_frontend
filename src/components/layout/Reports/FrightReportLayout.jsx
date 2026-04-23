import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import FrightReport from "../../../pages/Reports/FrightReport";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";

const FrightReportLayout = () => {
  return (
  <Box bg="#F3F3F3" minH="100vh" >
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
             <FrightReport/>
           </Box>
         </Box>
  );
};
export default FrightReportLayout
