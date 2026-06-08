import { Flex, Box, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import MobileTopbar from "../MobileTopbar";
import NotificationBtn from "../../NotificationBtn/NotificationBtn";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import GenerateCreditNote from "../../../pages/TransactionMaster/CreditNote";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import GenerateDebitNote from "../../../pages/TransactionMaster/DebitNote";

const DebitNoteTxnMasterLayout = () => {

    const [purchaseLedgerList, setPurchaseLedgerList] = useState([]);
    const [stockItemList, setStockItemList] = useState([]);
    const [godownList, setGodownList] = useState([]);
    const [voucherNo, setVoucherNo] = useState("");
    const [voucherTypeId, setVoucherTypeId] = useState(null);
    const [ledgerList, setLedgerList] = useState([]);
    const toast = useToast()



    const loadDropdowns = async () => {
        try {
            const [stockData, godownData] = await Promise.all([
                fetchStockItemDropdown(),
                fetchGodownList(),
            ]);
            setStockItemList(stockData || []);
            setGodownList(godownData || []);

            // Customer ledger (Sundry Debtors)
            try {
                const r = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);
                setLedgerList(r?.data?.data || []);
            } catch (e) {
                console.error(e);
            }

            // Sales Return ledger (Sales Account group)

        } catch (err) {
            console.error("loadDropdowns error:", err);
        }
    };

    const loadVoucherNo = async () => {
        try {
            const res = await API.get(
                `${API_ENDPOINTS.GET_NEXTVOUCHER_NO}?voucher_type=DEBIT_NOTE`
            );
            setVoucherNo(res.data.voucher_no);
            setVoucherTypeId(res.data.voucher_type_id);
        } catch (err) {
            console.log(err);
            console.log(err.response);

            toast({
                title: "Error",
                description: err.response?.data?.message || err.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


    const fetchPurchaseLedger = async () => {
        try {
            const response = await API?.get(`${API_ENDPOINTS?.GET_PURCHASE_LEDGER_DROPDOWN}`);
            if (response?.status === 200) {
                setPurchaseLedgerList(response?.data?.data)
            }
        } catch (error) {
            console.log(error, "Error")
        }
    }
    useEffect(() => {
        loadDropdowns();
        loadVoucherNo();
    }, []);

    useEffect(() => {
        fetchPurchaseLedger();
    },[])

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
                                    Generate Debit Note
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </HStack>

                    <Text className="action_heading" mb={6} textAlign="center">
                        Generate Debit Note
                    </Text>
                    <GenerateDebitNote purchaseLedgerList={purchaseLedgerList} stockItemList={stockItemList} godownList={godownList} voucherNo={voucherNo} voucherTypeId={voucherTypeId} ledgerList={ledgerList} />

                </Box>
            </Box>
        </Box>
    )
}

export default DebitNoteTxnMasterLayout