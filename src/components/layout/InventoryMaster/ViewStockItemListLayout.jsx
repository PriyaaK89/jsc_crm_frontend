import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading, HStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { API_ENDPOINTS } from "../../../services/endpoints";
import StockItemList from "../../../pages/InventoryMaster/StockItemList";
import API from "../../../services/api";

const ViewStockItemListLayout = () => {

    return (
        <>
            <Box bg="#f2f1f1" minH="100vh" >
                <Box display={{ base: "none", md: "block" }}> <Sidebar /> </Box>
                <Box display={{ base: "none", md: "block" }}> <Topbar /> </Box>
                <Box display={{ base: "block", md: "none" }}> <MobileTopbar /> </Box>
                <Box ml={{ base: 5, md: "295px" }} mr={{ base: 5, md: 5 }} pt="5rem" pb={6}>
                    <NotificationBtn />
                    <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md">

                        <HStack justifyContent="space-between">
                            <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px" >
                                <BreadcrumbItem>
                                    <BreadcrumbLink as={Link} to="/dashboard" >
                                        <GoHomeFill color="#5570F1" />
                                    </BreadcrumbLink>
                                </BreadcrumbItem>

                                <BreadcrumbItem>
                                    <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px"> View Stock Items </BreadcrumbLink>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </HStack>
                        <Heading size="md" color="gray.600" fontSize="18px" mb={6}>  Stock Items List </Heading>
                        <Box>
                            <StockItemList />
                        </Box>

                    </Box>

                </Box>
            </Box>
        </>
    )
}

export default ViewStockItemListLayout