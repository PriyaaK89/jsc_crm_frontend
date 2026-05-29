
  import React from 'react'
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import { Flex,Box } from '@chakra-ui/react';
import CreateLedger from '../../../pages/HrMgmt/AccountingMaster/CreateLedger';
import NotificationBtn from '../../NotificationBtn/NotificationBtn';
import LedgerCreation from '../../../pages/HrMgmt/AccountingMaster/LedgerCreation';

function CreateLedgerLayout() {

  return(
    <Box bg="#f2f1f1" minH="100%" >
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
        {/* <CreateLedger /> */}
        <LedgerCreation/>
      
      </Box>
    </Box>
  )
  
}

export default CreateLedgerLayout


