import React, { useState } from "react";

import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Text,
  Flex
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";
import { FiUsers, FiUser } from "react-icons/fi";

import { Link } from "react-router-dom";

import AssignTargetRSM from "../HrMgmt/AssignTargetRSM";
import AssignTargetIndividual from "./AssignTargetIndividual";

const AssignTarget = () => {

  const [tabIndex, setTabIndex] = useState(0);

  const headings = [
    {
      title: "Team-wise Target Assignment",
      subtitle:
        "Assign and manage sales targets for teams"
    },
    {
      title: "Individual Target Assignment",
      subtitle:
        "Assign targets directly to employees"
    }
  ];

  return (
    <Box
      w="100%"
      minH="100vh"
      bg="#ffffff"
      p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md"
    >

      {/* ================= BREADCRUMB ================= */}

      <HStack
        justifyContent="space-between"
        mb={4}
      >
        <Breadcrumb
          fontSize="14px"
          color="gray.500"
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              as={Link}
              to="/dashboard"
            >
              <GoHomeFill color="#4A5568" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              Assign Target
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* ================= HEADER ================= */}

      <Box mb={5}>
        <Heading
          size="lg"
          color="gray.700"
          fontWeight="700"
        >
          {headings[tabIndex].title}
        </Heading>

        <Text
          mt={1}
          color="gray.500"
          fontSize="14px"
        >
          {headings[tabIndex].subtitle}
        </Text>
      </Box>

      {/* ================= TABS ================= */}

      <Tabs
        index={tabIndex}
        onChange={(index) => setTabIndex(index)}
        variant="unstyled"
      >

        {/* TAB LIST */}

        <TabList
          mb={6}
          gap={3}
          borderBottom="1px solid"
          borderColor="gray.200"
          pb={3} justifyContent="center"
        >

          {/* TEAM TAB */}

          <Tab
            bg="white"
            border="1px solid"
            borderColor="gray.200"
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
            <HStack spacing={2} justifyContent="center">
              <FiUsers size={16} />

              <Text fontSize="14px">
                Team-wise Target
              </Text>
            </HStack>
          </Tab>

          {/* INDIVIDUAL TAB */}

          <Tab
            bg="white"
            border="1px solid"
            borderColor="gray.200"
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
            <HStack spacing={2}>
              <FiUser size={16} />

              <Text fontSize="14px">
                Individual Target
              </Text>
            </HStack>
          </Tab>

        </TabList>

        {/* ================= PANELS ================= */}

        <TabPanels>

          {/* TEAM FORM BOX */}

          <TabPanel p={0}>
            <Box
              bg="#f5f5f5"
              borderRadius="14px"
              border="1px solid"
              borderColor="gray.200"
              p={{ base: 4, md: 6 }}
              boxShadow="sm"
            >
              <AssignTargetRSM />
            </Box>
          </TabPanel>

          {/* INDIVIDUAL FORM BOX */}

          <TabPanel p={0}>
            <Box
              bg="white"
              borderRadius="14px"
              border="1px solid"
              borderColor="gray.200"
              p={{ base: 4, md: 6 }}
              boxShadow="sm"
            >
              <AssignTargetIndividual />
            </Box>
          </TabPanel>

        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AssignTarget;