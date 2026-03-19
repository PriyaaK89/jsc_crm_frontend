import React from 'react'
import{ Flex, Box } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileTopbar from "./MobileTopbar";
import Purchase from "../../pages/Order Vochar/Purchase";

const PurchaseLayout = () => {
  return (
        <Box bg="#F3F3F3" h="100%" >
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
               <Purchase />
             </Box>
           </Box>   
          
  )
}

export default PurchaseLayout;