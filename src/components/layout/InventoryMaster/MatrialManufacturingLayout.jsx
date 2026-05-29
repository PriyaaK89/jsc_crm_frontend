import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";
import { API_ENDPOINTS } from "../../../services/endpoints";
import MaterialManufacturing from "../../../pages/InventoryMaster/MaterialManufacturing";
import API from "../../../services/api";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";

const MaterialManufacturingLayout = () => {

    const [stockItem, setStockItem] = useState([]);
    const [godown, setGodown] = useState([]);
    const [ledger, setLedger] = useState([]);

    const fetchStockItemDropdown = async () => {
        try {
            const response = await API?.get(`${API_ENDPOINTS?.GET_STOCK_ITEM_DROPDOWN}`);
            if (response?.status === 200) {
                setStockItem(response?.data?.data);
            }
        } catch (error) {
            console.log(error, "Error fetching stock items");
        }
    };

    const fetchGodownList = async () => {
        try {
            const response = await API?.get(`${API_ENDPOINTS?.godown_list}`);
            if (response?.status === 200) {
                setGodown(response?.data?.data);
            }
        } catch (error) {
            console.log(error, "Error fetching godowns");
        }
    };

    const fetchLedgerDropdown = async () => {
        try {
            const response = await API?.get(`${API_ENDPOINTS?.GET_LEDGER_DROPDOWN}`);
            if (response?.status === 200) {
                setLedger(response?.data?.data);
            }
        } catch (error) {
            console.log(error, "Error fetching ledger");
        }
    };

    useEffect(() => {
        fetchStockItemDropdown();
        fetchGodownList();
        fetchLedgerDropdown();
    }, []);

    return (
        <>
            <Box bg="#f2f1f1" minH="100vh">
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

                    <Box
                        bg="white"
                        mt={{ base: 2, md: 5 }}
                        px={{ base: 3, md: 6 }}
                        py={{ base: 3, md: 4 }}
                        borderRadius="lg"
                        boxShadow="md"
                    >
                        <HStack justifyContent="space-between">
                            <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                                <BreadcrumbItem>
                                    <BreadcrumbLink as={Link} to="/dashboard">
                                        <GoHomeFill color="#5570F1" />
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px">
                                        Material Manufacturing
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </HStack>

                        <MaterialManufacturing
                            stockItem={stockItem}
                            godown={godown}
                            ledger={ledger}
                        />
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default MaterialManufacturingLayout;