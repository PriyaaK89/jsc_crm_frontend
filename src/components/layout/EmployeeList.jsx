import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import EmployeeList from "../../pages/HrMgmt/EmployeeList";
import NotificationBtn from "../NotificationBtn/NotificationBtn";

const EmployeeListLayout = () => {
  return (
    <Flex bg="#f4f4f4" minH="100vh" overflowX="hidden">
           
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
             ml={{ base: 0, md: "268px" }} width="100%"
           >
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
     
            
              <Box
        // ml={{ base: 5, md: "295px" }}
                ml={{ base: 5, md: "230px" }}

        mr={{ base: 5, md: 5 }}

        pt="5rem"
        // pb={6}
       >
                  <NotificationBtn/>
    </Box>
     {/* Content */}
             <Box
               flex="1"
               px={{ base: 3, md: 6 }}
               pt={{ base: "20px", md: 0 }}
             >

               <Box
                 bg="white"
                 borderRadius="20px"
                 boxShadow="sm"
                 p={{ base: 3, md: 6 }} 
                  width={{base: "100%",sm: "100%",md:"83%", lg: "83%"}}
                 mb={5}
               >
                 <EmployeeList />
               </Box>
             </Box>
           </Flex>
         </Flex>
  );
};

export default EmployeeListLayout;