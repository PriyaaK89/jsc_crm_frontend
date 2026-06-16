import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Box,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Td,
    Th,
    Divider,
    Flex,
    VStack,
    Img,
    Button,
    Spinner,
} from "@chakra-ui/react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { toWords } from "number-to-words";
import stamp_img from "../../../assets/images/stamp_jsc.png";
import jamidara_seeds_logo from "../../../assets/images/jsc_logo_.png";

const JournalInvoice = ({ isOpen, onClose, journalId }) => {
    const [journalDetails, setJournalDetails] = useState(null);
    const [loading, setLoading]               = useState(false);
    const [downloading, setDownloading]       = useState(false);
    const invoiceRef = useRef(null);

    /* ── fetch ─────────────────────────────────────────────────────── */
    const fetchJournalInvoice = async () => {
        if (!journalId) return;
        try {
            setLoading(true);
            const response = await API.get(
                `${API_ENDPOINTS.GET_JOURNAL_INVOICE}/${journalId}`
            );
            if (response.status === 200) {
                setJournalDetails(response.data.data);
            }
        } catch (error) {
            console.log(error, "Error in fetching Journal Invoice Details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && journalId) {
            fetchJournalInvoice();
        }
        if (!isOpen) {
            setJournalDetails(null);
        }
    }, [isOpen, journalId]);

    /* ── pdf download ───────────────────────────────────────────────── */
    const handleDownloadPdf = async () => {
        if (!invoiceRef.current || !journalDetails) return;
        try {
            setDownloading(true);
            const html2pdf = (await import("html2pdf.js")).default;
            const options = {
                margin: 5,
                filename: `Journal_Voucher_${
                    journalDetails.journal.voucher_no || journalId
                }.pdf`,
                image:     { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF:     { unit: "mm", format: "a4", orientation: "portrait" },
            };
            await html2pdf().set(options).from(invoiceRef.current).save();
        } catch (error) {
            console.log("PDF download error:", error);
        } finally {
            setDownloading(false);
        }
    };

    /* ── render ─────────────────────────────────────────────────────── */
    const renderInvoiceContent = () => {
        if (!journalDetails) return null;

        const { journal, entries, billReferences } = journalDetails;

        // entry_type comes as "Dr" / "Cr" from the API
        const isDr = (e) => e.entry_type?.toLowerCase() === "dr";
        const isCr = (e) => e.entry_type?.toLowerCase() === "cr";

        const totalDebit  = parseFloat(journal.total_debit  || 0);
        const totalCredit = parseFloat(journal.total_credit || 0);

        const amountInWords = totalDebit
            ? `Rupees ${toWords(Math.round(totalDebit))} Only`
            : "-";

        const formattedDate = journal.journal_date
            ? new Date(journal.journal_date).toLocaleDateString("en-GB")
            : "-";

        return (
            <Box
                ref={invoiceRef}
                bg="white"
                maxW="900px"
                mx="auto"
                fontFamily="serif"
                fontSize="13px"
                p={4}
            >
                {/* ── LOGO ─────────────────────────────────────────── */}
                <Box py={2}>
                    <img
                        src={jamidara_seeds_logo}
                        alt="logo"
                        style={{ width: "140px" }}
                    />
                </Box>

                {/* ── TITLE ────────────────────────────────────────── */}
                <Text
                    textAlign="center"
                    fontSize="15px"
                    fontWeight="900"
                    color="brown"
                    textDecoration="underline"
                    fontFamily="serif"
                    mb={2}
                >
                    JOURNAL VOUCHER
                </Text>

                {/* ── COMPANY DETAILS ──────────────────────────────── */}
                <Box mb={4}>
                    <Text fontFamily="serif" color="black" fontSize="10px" fontWeight="900">
                        JAMIDARA SEEDS CORPORATION
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        P.B. Road Rane Bannure Distric-HAVERI,KARNATAKA
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        REG.ADD. 73,GANESH NAGAR-MURLIPURA JAIPUR
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        Phone no: +919414429966
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        Email: jamidaraseedscorporation@gmail.com
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        GSTIN: 08AANFJ6936B1Z7
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        State: Rajasthan
                    </Text>
                </Box>

                {/* ── VOUCHER META ─────────────────────────────────── */}
                <VStack gap={0.5} alignItems="baseline" mb={2}>
                    <Text fontFamily="serif" fontSize="11px" fontWeight="900">
                        Journal No. : {journal.voucher_no || "-"}
                    </Text>
                    <Text fontFamily="serif" fontSize="11px" fontWeight="900">
                        Date : {formattedDate}
                    </Text>
                    <Text fontFamily="serif" fontSize="11px" fontWeight="900">
                        Under Emp. : {journal.employee_under_name || "-"}
                    </Text>
                </VStack>

                <Divider borderColor="#4e4e4e" />

                {/* ── ENTRIES TABLE ────────────────────────────────── */}
                <Box overflowX="auto">
                    <Table
                        size="sm"
                        variant="unstyled"
                        sx={{ borderCollapse: "collapse" }}
                    >
                        <Thead>
                            <Tr
                                borderTop="1px solid #4e4e4e"
                                borderBottom="1px solid #4e4e4e"
                            >
                                <Th fontFamily="serif" fontSize="11px" py={1} fontWeight="700">
                                    Particulars
                                </Th>
                                <Th
                                    fontFamily="serif"
                                    fontSize="11px"
                                    py={1}
                                    textAlign="right"
                                    fontWeight="700"
                                    isNumeric
                                >
                                    Debit
                                </Th>
                                <Th
                                    fontFamily="serif"
                                    fontSize="11px"
                                    py={1}
                                    textAlign="right"
                                    fontWeight="700"
                                    isNumeric
                                >
                                    Credit
                                </Th>
                            </Tr>
                        </Thead>

                        <Tbody>
                            {entries.map((entry) => {
                                const amount = parseFloat(entry.amount || 0).toFixed(2);
                                const drEntry = isDr(entry);
                                const crEntry = isCr(entry);

                                return (
                                    <Tr key={entry.id} borderBottom="1px solid #ccc">
                                        {/* Tally-style label: DR → "Name Dr",  CR → "To Name" */}
                                        <Td fontFamily="serif" fontSize="11px" py={1}>
                                            {crEntry
                                                ? `To ${entry.ledger_name}`
                                                : `${entry.ledger_name} Dr`}
                                        </Td>
                                        <Td
                                            fontFamily="serif"
                                            fontSize="11px"
                                            py={1}
                                            textAlign="right"
                                            isNumeric
                                        >
                                            {drEntry ? amount : ""}
                                        </Td>
                                        <Td
                                            fontFamily="serif"
                                            fontSize="11px"
                                            py={1}
                                            textAlign="right"
                                            isNumeric
                                        >
                                            {crEntry ? amount : ""}
                                        </Td>
                                    </Tr>
                                );
                            })}

                            {/* Totals row */}
                            <Tr borderTop="2px solid #4e4e4e" fontWeight="bold">
                                <Td fontFamily="serif" fontSize="11px" py={1}>
                                    TOTAL
                                </Td>
                                <Td
                                    fontFamily="serif"
                                    fontSize="11px"
                                    py={1}
                                    textAlign="right"
                                    isNumeric
                                >
                                    {totalDebit.toFixed(2)}
                                </Td>
                                <Td
                                    fontFamily="serif"
                                    fontSize="11px"
                                    py={1}
                                    textAlign="right"
                                    isNumeric
                                >
                                    {totalCredit.toFixed(2)}
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </Box>

                <Divider borderColor="#4e4e4e" mt={2} />

                {/* ── BILL REFERENCES ──────────────────────────────── */}
                {/* {billReferences && billReferences.length > 0 && (
                    <Box mt={2} mb={2}>
                        <Text
                            fontFamily="serif"
                            fontSize="11px"
                            fontWeight="700"
                            mb={1}
                        >
                            Bill-Wise Details :
                        </Text>
                        <Table
                            size="sm"
                            variant="unstyled"
                            sx={{ borderCollapse: "collapse" }}
                        >
                            <Thead>
                                <Tr borderBottom="1px solid #4e4e4e">
                                    <Th fontFamily="serif" fontSize="10px" py={0.5} fontWeight="700">
                                        Ledger
                                    </Th>
                                    <Th fontFamily="serif" fontSize="10px" py={0.5} fontWeight="700">
                                        Ref. Type
                                    </Th>
                                    <Th fontFamily="serif" fontSize="10px" py={0.5} fontWeight="700">
                                        Ref. No
                                    </Th>
                                    <Th
                                        fontFamily="serif"
                                        fontSize="10px"
                                        py={0.5}
                                        fontWeight="700"
                                        isNumeric
                                        textAlign="right"
                                    >
                                        Amount
                                    </Th>
                                    <Th fontFamily="serif" fontSize="10px" py={0.5} fontWeight="700">
                                        Due Date
                                    </Th>
                                    <Th fontFamily="serif" fontSize="10px" py={0.5} fontWeight="700">
                                        Type
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {billReferences.map((ref) => (
                                    <Tr key={ref.id} borderBottom="1px solid #eee">
                                        <Td fontFamily="serif" fontSize="10px" py={0.5}>
                                            {ref.ledger_name || "-"}
                                        </Td>
                                        <Td fontFamily="serif" fontSize="10px" py={0.5}>
                                            {ref.reference_type || "-"}
                                        </Td>
                                        <Td fontFamily="serif" fontSize="10px" py={0.5}>
                                            {ref.reference_no || "-"}
                                        </Td>
                                        <Td
                                            fontFamily="serif"
                                            fontSize="10px"
                                            py={0.5}
                                            textAlign="right"
                                            isNumeric
                                        >
                                            {parseFloat(ref.amount || 0).toFixed(2)}
                                        </Td>
                                        <Td fontFamily="serif" fontSize="10px" py={0.5}>
                                            {ref.due_date
                                                ? new Date(ref.due_date).toLocaleDateString("en-GB")
                                                : "-"}
                                        </Td>
                                        <Td fontFamily="serif" fontSize="10px" py={0.5}>
                                            {ref.entry_type || "-"}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        <Divider borderColor="#4e4e4e" mt={2} />
                    </Box>
                )} */}

                {/* ── AMOUNT IN WORDS ──────────────────────────────── */}
                <Flex
                    gap={2}
                    py={1}
                    borderBottom="1px solid #4e4e4e"
                    fontSize="12px"
                >
                    <Text fontFamily="serif" fontWeight="bold" minW="fit-content">
                        Amount In Words :
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="12px">
                        {amountInWords}
                    </Text>
                </Flex>

                {/* ── NARRATION ────────────────────────────────────── */}
                <Flex
                    gap={2}
                    py={1}
                    borderBottom="1px solid #4e4e4e"
                    fontSize="11px"
                >
                    <Text fontWeight="bold" minW="fit-content" fontFamily="serif">
                        Narration :
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="11px">
                        {journal.narration || "-"}
                    </Text>
                </Flex>

                {/* ── SIGNATURES ───────────────────────────────────── */}
                <Flex
                    justify="space-between"
                    mt="10px"
                    mb="8px"
                    px={4}
                    alignItems="end"
                >
                    <Text fontWeight="bold" fontSize="14px" fontFamily="serif">
                        Receiver's Signature
                    </Text>
                    <VStack>
                        <Img src={stamp_img} width="80px" />
                        <Text fontWeight="bold" fontSize="14px" fontFamily="serif">
                            Authorizer Signature
                        </Text>
                    </VStack>
                </Flex>

                {/* ── BANK DETAILS ─────────────────────────────────── */}
                <Box
                    borderTop="1px solid #000"
                    pt={3}
                    pb={2}
                    borderBottom="1px solid #4e4e4e"
                    fontSize="10px"
                >
                    <Text fontWeight="bold" mb={1} fontFamily="serif">
                        Bank Details :
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        Company Name : JAMIDARA SEEDS CORPORATION
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        Bank Name : STATE BANK OF INDIA
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        Account No. : 61180709821
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        IFSC Code : SBIN0031764
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        Bank Name : ICICI BANK
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        Account No. : JSCRAJP600
                    </Text>
                    <Text fontFamily="serif" color="black" fontSize="10px">
                        IFSC Code : ICIC0000106
                    </Text>
                </Box>

                {/* ── RULES & REGULATIONS ──────────────────────────── */}
                <Box border="1px solid #000" mt={3} p={3} fontSize="8px">
                    <Text fontWeight="bold" textDecoration="underline" mb={2} fontFamily="serif">
                        Rules & Regulations
                    </Text>
                    <Text fontFamily="serif" color="black">
                        ❖ All cash discount plans and other plans shall be valid as per the
                        rules and conditions of the company.
                    </Text>
                    <Text mt="2px" fontFamily="serif" color="black">
                        ❖ If any goods packet is received by the distributor, it will have
                        to be reported to the company within three days of receipt of the
                        goods, after which the complaint will not be valid.
                    </Text>
                    <Text mt="2px" fontFamily="serif" color="black">
                        ❖ The freight fare for the goods will be paid by the company only
                        for the price marked on the Bill-T.
                    </Text>
                    <Text mt="2px" fontFamily="serif" color="black">
                        ❖ Transport fare will be paid by the company to the distributor only
                        after the borrowing time of the bill is paid within 45 days.
                    </Text>
                    <Text mt="2px" fontFamily="serif" color="black">
                        ❖ Company has full rights to do changes in the value of any product
                        & schemes at any time.
                    </Text>
                    <Text mt="2px" fontFamily="serif" color="black">
                        ❖ Distributor has to send notice to company within 7 days if any
                        complaint regarding the product or anything, otherwise it will be
                        discarded.
                    </Text>
                    <Text mt="2px" fontFamily="serif" color="black">
                        ❖ Goods once sold will not be taken back.
                    </Text>
                    <Text mt="2px" fontFamily="serif" color="black">
                        ❖ Interest @24% P.A. will be charged on late payment after 45 Days.
                    </Text>
                    <Text mt="2px" fontFamily="serif" color="black">
                        ❖ Supercash bill payment is mandatory within 7 days from bill date!
                        If bill is not paid within the time period, the bill automatically
                        will be converted to regular price.
                    </Text>
                </Box>
            </Box>
        );
    };

    /* ── modal shell ────────────────────────────────────────────────── */
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="5xl">
            <ModalOverlay />
            <ModalContent maxW="960px">

                <ModalHeader borderBottom="1px solid #e2e8f0" py={3}>
                    <Flex justify="space-between" align="center" pr={8}>
                        <Text fontSize="16px" fontWeight="600">
                            Journal Voucher
                        </Text>
                        <Button
                            colorScheme="green"
                            size="sm"
                            fontSize="12px"
                            height="34px"
                            fontWeight="500"
                            isLoading={downloading}
                            loadingText="Downloading..."
                            isDisabled={!journalDetails || loading}
                            onClick={handleDownloadPdf}
                        >
                            Download PDF
                        </Button>
                    </Flex>
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody p={4}>
                    {loading ? (
                        <Flex justify="center" align="center" py={16}>
                            <Spinner size="xl" />
                        </Flex>
                    ) : !journalDetails ? (
                        <Text fontFamily="serif" color="black" p={10}>
                            Journal voucher not found
                        </Text>
                    ) : (
                        renderInvoiceContent()
                    )}
                </ModalBody>

            </ModalContent>
        </Modal>
    );
};

export default JournalInvoice;