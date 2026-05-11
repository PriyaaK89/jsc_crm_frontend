import React from 'react'
import { Flex,Box } from '@chakra-ui/react';   
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import MobileTopbar from '../MobileTopbar';
import ViewSubTeam from '../../../pages/BusinessDevelopment/ViewSubteam';
import NotificationBtn from '../../NotificationBtn/NotificationBtn';

function ViewSubTeamLayout() {
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
           <ViewSubTeam/>
         </Box>
       </Box>
  )
}

export default ViewSubTeamLayout
