import { Box, Flex } from "@chakra-ui/react";
import Topbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar"
import NotificationBtn from "../NotificationBtn/NotificationBtn";


const DashboardLayout = ({ children }) => {

  return (
    <Box bg="#F3F3F3" h="100vh" >
      
      <Box
        display={{ base: "none", md: "block" }}
      >
        <Sidebar />
      </Box>
       <Box
        display={{ base: "none", md: "block" }}
      >
        <Topbar />
      </Box>

      {/* Mobile Topbar */}
      <Box
        display={{ base: "block", md: "none" }}
      >
        <MobileTopbar />
      </Box>

      {/* Content */}


      <Box
        ml={{ base: 5, md: "295px" }}
        mr={{ base: 5, md: 5 }}
        pt="5rem"
        pb={6}
       >
                  <NotificationBtn/>
    </Box>
 <Box

        ml={{ base: 5, md: "295px" }}
        mr={{ base: 5, md: 5 }}
        pb={6}
        display={{ base: "column", lg: "flex" }}
        gap={{ base: 0, lg: 6 }}
      >

        {/* Main Content */}


        {children}
      <Box display={{ base: "none", lg: "block" }}>
        <RightSidebar />
      </Box>
      </Box >


      {/* Right Sidebar */}


    </Box>    
  );
};
export default DashboardLayout;