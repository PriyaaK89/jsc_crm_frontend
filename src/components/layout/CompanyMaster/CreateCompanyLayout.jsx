import React from 'react'
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { Flex, Box } from '@chakra-ui/react';
import MobileTopbar from "../MobileTopbar";
import CreateCompany from '../../../pages/HrMgmt/CompanyMaster/CreateCompany';
import NotificationBtn from '../../NotificationBtn/NotificationBtn';

function CreateCompanyLayout() {
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
          <NotificationBtn/>
          <CreateCompany/>
        </Box>
      </Box>
  )
}



export default CreateCompanyLayout
