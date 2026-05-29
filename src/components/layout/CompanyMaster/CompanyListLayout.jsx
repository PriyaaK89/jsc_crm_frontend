import React from 'react'
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { Flex, Box, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';

import MobileTopbar from "../MobileTopbar";
import NotificationBtn from '../../NotificationBtn/NotificationBtn';
import ComapnyList from '../../../pages/HrMgmt/CompanyMaster/ComapnyList';
import { Link } from 'react-router-dom';
import { GoHomeFill } from 'react-icons/go';

function CompanyListLayout() {
  return (
    <Box bg="#f2f1f1" h="100%" >
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
        mr={{ base: 5, md: 5 }}
        pt="5rem"
        pb={6}
      >
        <NotificationBtn />
        <Box>
          <HStack justifyContent="space-between">
            <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/dashboard">
                  <GoHomeFill color="#5570F1" />
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink fontSize="13px">Company List</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </HStack>
          <ComapnyList />
        </Box>
      </Box>
    </Box>
  )
}






export default CompanyListLayout
