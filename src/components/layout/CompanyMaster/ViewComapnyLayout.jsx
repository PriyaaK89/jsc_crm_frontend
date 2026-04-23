import React from 'react'
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { Flex, Box } from '@chakra-ui/react';
import MobileTopbar from "../MobileTopbar";
import NotificationBtn from '../../NotificationBtn/NotificationBtn';
import ViewCompany from '../../../pages/HrMgmt/CompanyMaster/ViewCompany';

function ViewComapnyLayout() {
  return (
   <Box bg="#F4F4F4" h="100%" >
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
        <ViewCompany/>
        </Box>
      </Box>
  )
}


export default ViewComapnyLayout
