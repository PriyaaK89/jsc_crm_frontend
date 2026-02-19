import React from "react";
import {
  Flex,
  Box,
  useDisclosure,
} from "@chakra-ui/react";

import Sidebar from "./Sidebar";
import DesktopTopbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import EmpAttendance from "../../pages/Employee/EmpAttendance";

const EmpAttendaneLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh" bg="#f4f4f4">
      
       {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
       </Box>

      

       {/* Main Section */}
       <Flex direction="column" flex="1">

         {/* Desktop Topbar */}
         <Box display={{ base: "none", md: "block" }}>
       <DesktopTopbar />
         </Box>

        {/* Mobile Topbar */}
         <Box display={{ base: "block", md: "none" }}>
           <MobileTopbar />
         </Box>

        {/* Page Content */}
        <Box flex="1" px={6} >
           <EmpAttendance />
        </Box>

      </Flex>
     </Flex>
   );
}

 export default EmpAttendaneLayout;

