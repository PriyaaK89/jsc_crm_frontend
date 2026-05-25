import React, { useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";

import EmployeeVisitReport from "../../../pages/Reports/EmployeeVisitReport";
import SpecificEmployeeVisitReport from "../../../pages/Reports/SpecificEmployeeVisitReport";

import NotificationBtn from "../../NotificationBtn/NotificationBtn";

import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";

const EmployeeVisitReportLayout = () => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Box bg="#f2f1f1" minH="100vh">

      {/* Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>

      {/* Topbar */}
      <Box display={{ base: "none", md: "block" }}>
        <Topbar />
      </Box>

      {/* Mobile Topbar */}
      <Box display={{ base: "block", md: "none" }}>
        <MobileTopbar />
      </Box>

      {/* Main Content */}
      <Box
        ml={{ base: 5, md: "295px" }}
        mr={{ base: 5, md: 5 }}
        pt="5rem"
        pb={6}
      >
        <NotificationBtn />

        <Box
          bg="white"
          mt={{ base: 2, md: 5 }}
          px={{ base: 3, md: 6 }}
          py={{ base: 3, md: 4 }}
          borderRadius="lg"
          boxShadow="md"
        >
          {/* Breadcrumb */}
          <HStack justifyContent="space-between">
            <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/dashboard">
                  <GoHomeFill color="#5570F1" />
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem>
                <BreadcrumbLink
                  isCurrentPage
                  color="#8B8D97"
                  fontSize="13px"
                >
                  View Visit Report
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </HStack>

          {/* Heading */}
          <Heading size="md" mb={6} mt={3} color="#4d4d4d">
            View Visit Report
          </Heading>

          {/* Tabs */}
          <Tabs index={tabIndex}
            onChange={(index) => setTabIndex(index)}
            variant="unstyled">

            <TabList mb={6}
              gap={3}
              borderBottom="1px solid"
              borderColor="gray.300"
              pb={3} justifyContent="center">
              <Tab
                bg="white"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="10px"
                px={5}
                py={3}
                fontWeight="500"
                color="gray.600"
                transition="0.2s"
                _selected={{ bg: "#EDF2F7", color: "#1A202C", borderColor: "#CBD5E0" }}
                _hover={{ bg: "#F7FAFC" }}
              >
                All Visits
              </Tab>

              <Tab
                bg="white"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="10px"
                px={5}
                py={3}
                fontWeight="500"
                color="gray.600"
                transition="0.2s"

                _selected={{
                  bg: "#EDF2F7",
                  color: "#1A202C",
                  borderColor: "#CBD5E0"
                }}

                _hover={{
                  bg: "#F7FAFC"
                }}
              >
                Visits by Employee
              </Tab>
            </TabList>

            <TabPanels>

              {/* All Visits */}
              <TabPanel p={0}>
                <EmployeeVisitReport />
              </TabPanel>

              {/* Specific Employee */}
              <TabPanel p={0}>
                <SpecificEmployeeVisitReport />
              </TabPanel>

            </TabPanels>

          </Tabs>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeVisitReportLayout;