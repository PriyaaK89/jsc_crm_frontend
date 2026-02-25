import React from 'react'
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Flex } from '@chakra-ui/react';
// import ViewCompany from '../../pages/HrMgmt/CompanyMaster/ViewCompany';




function ViewCompanyLayout() {
  return (
      <>
        <Flex bgColor="#f4f4f4">
                <Sidebar />
                <Flex direction="column" minH="100vh" width="78%" margin="1rem auto" gap="1rem">
                    <Topbar />
               {/* <ViewCompany/> */}
               <h1>hello view comapny </h1>
                </Flex>
        </Flex>
        </>
  )
}


export default ViewCompanyLayout
