import { Flex, Box, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import Sales from "../../../pages/TransactionMaster/Sales";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

const SalesTxnMasterLayout = () => {

    const [salesLedger, setSalesLedger] = useState([]);
    
    const getSalesLedgerDropdown = async()=>{
         try{
                const response = await API?.get(`${API_ENDPOINTS?.GET_SALES_LEDGER_DROPDOWN}`)

                if(response?.status === 200){
                    setSalesLedger(response?.data?.data);
                    console.log("salesLedger", response?.data?.data)
                }
         }catch(error){
            console.log(error, "Error")
         }
    }

    useEffect(()=>{
        getSalesLedgerDropdown();
    },[])

    return (
        <Box bg="#f2f1f1" minH="100vh" >
            <Box display={{ base: "none", md: "block" }}> <Sidebar /> </Box>
            <Box display={{ base: "none", md: "block" }}> <Topbar /> </Box>
            <Box display={{ base: "block", md: "none" }}> <MobileTopbar /> </Box>
            <Box ml={{ base: 5, md: "295px" }} mr={{ base: 5, md: 5 }} pt="5rem" pb={6} >
                <NotificationBtn />
                <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md">
                    <HStack justifyContent="space-between">
                        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                            <BreadcrumbItem>
                                <BreadcrumbLink as={Link} to="/dashboard">
                                    <GoHomeFill color="#5570F1" />
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbItem>
                                <BreadcrumbLink color="#8B8D97" fontSize="13px">
                                    Create Sale
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </HStack>

                    <Text className="action_heading" mb={6} textAlign="center">
                        Create Sale transaction
                    </Text>

                    <Sales salesLedger={salesLedger}/>
                </Box>
            </Box>
        </Box>
    )
}

export default SalesTxnMasterLayout