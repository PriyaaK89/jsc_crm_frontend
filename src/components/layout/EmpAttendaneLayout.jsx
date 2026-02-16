import React from 'react'
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import EmpAttendance from '../../pages/Employee/EmpAttendance';
import { Flex } from '@chakra-ui/react';


const EmpAttendaneLayout = () => {
  return (
    <Flex bg="#f4f4f4">
        <Sidebar/>
        <Flex direction="column" minH="100vh" width="78%" m="1rem auto" gap="1rem">
       <EmpAttendance/>
        </Flex>

    </Flex>
  )
}

export default EmpAttendaneLayout;