import React from "react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex, HStack } from "@chakra-ui/react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import PartyLedgerReport from "../../../pages/Reports/PartyLedgerReport";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";

const PartyLedgerReportLayout = () => {
  return (
    <Box bg="#f2f1f1" minH="100vh" >
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
        <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md" >

          <HStack justifyContent="space-between">
            <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px" >
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/dashboard" >
                  <GoHomeFill color="#5570F1" />
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem>
                <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px" >
                  Party Ledger Report
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </HStack>
          <PartyLedgerReport />
        </Box>
      </Box>
    </Box>
  );
};
export default PartyLedgerReportLayout
