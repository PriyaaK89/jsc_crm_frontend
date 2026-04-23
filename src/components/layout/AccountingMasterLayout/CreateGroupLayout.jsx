import React from 'react'
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import { Flex,Box,Text } from '@chakra-ui/react';
import CreateGroup from '../../../pages/HrMgmt/AccountingMaster/CreateGroup';
import NotificationBtn from '../../NotificationBtn/NotificationBtn';


function CreateGroupLayout() {
  return (
    <Box bg="#F4F4F4" minH="100%" >
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
            <CreateGroup />
          </Box>
        </Box>
  )
}

export default CreateGroupLayout
