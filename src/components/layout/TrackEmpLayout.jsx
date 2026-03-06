import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import Sidebar from "./Sidebar";
import MobileTopbar from "./MobileTopbar";
import Topbar from "./Topbar";
import MapView from "../../pages/EmpLocation/Map";
import TrackEmployee from "../../pages/EmpLocation/TrackEmployee";

const TrackEmpLayout = () => {
    return (
        <>
             <Flex bg="#f4f4f4" minH="100vh"> 
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
                     px={4}
                     py={4}
                     mx={3}
                   >
                     <MobileTopbar />
                   </Box>
           
                   {/* Content Section */}
                   <Flex
                     flex="1"
                     px={{ base: 0, md: 6 }}
                     py={4}
                     overflow="auto"
                   >
                     <Box
                       flex="1"
                       bg="white"
                       borderRadius="21px"
                       boxShadow="sm"
                       px={4}
                       py={2}
                       mx={3}
                     >
                      <TrackEmployee/>
                      {/* <MapView/> */}
                     </Box>
                   </Flex>
           
                 </Flex>
               </Flex>
        </>
    )
}

export default TrackEmpLayout