import React, { useState } from "react";

import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading, HStack, Tabs, TabList, TabPanels, TabPanel, Tab, Text, Flex} from "@chakra-ui/react";
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
      bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md"
    >

      <HStack justifyContent="space-between">
        <Breadcrumb
          color="#8B8D97"
          padding="10px 0px 1rem 0px"
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              as={Link}
              to="/dashboard"
            >
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
              isCurrentPage
              color="#8B8D97"
              fontSize="13px"
            >
              Assign Target
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* ================= HEADER ================= */}

      <Box mb={5}>
        <Heading
         size="md"
          color="gray.600" fontSize="18px" height="36px"
        >
          {headings[tabIndex].title}
        </Heading>

        <Text
         
          color="gray.500"
          fontSize="12px"
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
          borderColor="gray.300"
          pb={3} justifyContent="center"
        >

          {/* TEAM TAB */}

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
              bg="#f2f1f1"
              borderRadius="14px"
              border="1px solid"
              borderColor="gray.300"
              p={{ base: 4, md: 6 }}
              boxShadow="sm"
            >
              <AssignTargetRSM />
            </Box>
          </TabPanel>

          {/* INDIVIDUAL FORM BOX */}

          <TabPanel p={0}>
            <Box
              bg="#f2f1f1"
              borderRadius="14px"
              border="1px solid"
              borderColor="gray.300"
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