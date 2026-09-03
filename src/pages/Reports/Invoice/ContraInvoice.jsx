import React, { useEffect, useRef, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Box, Flex, Text, Table, Thead, Tbody, Tr, Td, Th, Button, Spinner,
  Divider, VStack, Img, HStack,
} from "@chakra-ui/react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import stamp_img from "../../../assets/images/stamp_jsc.png";
import jamidara_seeds_logo from "../../../assets/images/jsc_logo_.png";

const ContraInvoice = ({ isOpen, onClose, contraId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef();

  const fetchContraInvoice = async () => {
    if (!contraId) return;
    try {
      setLoading(true);
      const response = await API.get(
        `${API_ENDPOINTS.GET_CONTRA_INVOICE}/${contraId}`
      );
      if (response.status === 200) {
        setInvoice(response.data.data);
      }
    } catch (error) {
      console.log(error, "Error in fetching Contra Invoice!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contraId) {
      fetchContraInvoice();
    }
    if (!isOpen) {
      setInvoice(null);
    }
  }, [isOpen, contraId]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const html2pdf = (await import("html2pdf.js")).default;
      const element = printRef.current;
      const options = {
        margin: 5,
        filename: `Contra_Voucher_${invoice?.contra?.voucher_no || contraId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.log("PDF download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  const numberToWords = (num) => {
    const ones = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
      "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];
    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
      "Eighty", "Ninety",
    ];
    const convert = (n) => {
      if (n === 0) return "";
      if (n < 20) return ones[n] + " ";
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " ";
      if (n < 1000)
        return ones[Math.floor(n / 100)] + " Hundred " + convert(n % 100);
      if (n < 100000)
        return convert(Math.floor(n / 1000)) + "Thousand " + convert(n % 1000);
      if (n < 10000000)
        return convert(Math.floor(n / 100000)) + "Lakh " + convert(n % 100000);
      return convert(Math.floor(n / 10000000)) + "Crore " + convert(n % 10000000);
    };
    const intPart = Math.floor(num);
    const result = convert(intPart).trim();
    return result ? "Rupees " + result + " Only" : "Rupees Zero Only";
  };

  const renderInvoiceContent = () => {
    if (!invoice) return null;

    const contra = invoice.contra;
    const entries = invoice.entries || [];

    const totalAmount = parseFloat(contra.total_amount || 0);

    // From actual response:
    // entry_type "Dr"  → Debit  column  → label: "To [ledger_name] [bank_name]"
    // entry_type "Cr"  → Credit column  → label: "[ledger_name] Dr"

    return (
      <Box
        ref={printRef}
        bg="white"
        maxW="900px"
        mx="auto"
        fontFamily="serif"
        fontSize="13px"
        p={0}
      >
        {/* ===== COMPANY HEADER ===== */}
        <Box py={0}>
          <img src={jamidara_seeds_logo} alt="logo" style={{ width: "140px" }} />
        </Box>

        <Text
          textAlign="center"
          fontSize="16px"
          fontWeight="900"
          color="brown"
          textDecoration="underline"
          fontFamily="serif"
          mb={2}
        >
          Contra Voucher
        </Text>

        <Box mb={2}>
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

        <Divider borderColor="#4e4e4e" mb={2} />

        {/* ===== CONTRA META ===== */}
        <Box mb={3}>
          <Text fontFamily="serif" color="black" fontSize="11px" fontWeight="bold">
            Contra No: {contra.voucher_no || "-"}
          </Text>
          <Text fontFamily="serif" color="black" fontSize="11px" fontWeight="bold">
            Date:{" "}
            {contra.contra_date
              ? new Date(contra.contra_date).toLocaleDateString("en-GB")
              : "-"}
          </Text>
          <Text fontFamily="serif" color="black" fontSize="11px" fontWeight="bold">
            Under Emp: {contra.employee_under_name || "-"}
          </Text>
        </Box>

        {/* <Divider borderColor="#4e4e4e" mb={1} /> */}

        {/* ===== ENTRIES TABLE ===== */}
        <Box overflowX="auto">
          <Table
            size="sm"
            variant="unstyled"
            sx={{ borderCollapse: "collapse", width: "100%" }}
          >
            <Thead>
              <Tr borderTop="1px solid #4e4e4e" borderBottom="1px solid #4e4e4e">
                <Th fontSize="11px" width="60%" py={2}>
                  Particulars
                </Th>
                <Th fontSize="11px" width="20%" textAlign="center" py={2}>
                  Debit
                </Th>
                <Th fontSize="11px" width="20%" textAlign="center" py={2}>
                  Credit
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {entries.map((entry) => {
                const isDebit = entry.entry_type === "Dr";   // → Debit column
                const isCredit = entry.entry_type === "Cr";  // → Credit column

                // "To LEDGER_NAME BANK_NAME"  for Dr entries  (money going TO this account)
                // "LEDGER_NAME Dr"            for Cr entries  (source account shown as Dr)
                const label = isDebit
                  ? `To ${entry.ledger_name}${entry.bank_name ? " " + entry.bank_name : ""}`
                  : `${entry.ledger_name} Dr`;

                return (
                  <Tr key={entry.id} borderBottom="1px solid #eee">
                    <Td fontSize="11px" py={2}>
                      {label}
                    </Td>
                    <Td fontSize="11px" py={2} textAlign="center">
                      {isDebit
                        ? parseFloat(entry.amount || 0).toFixed(2)
                        : ""}
                    </Td>
                    <Td fontSize="11px" py={2} textAlign="center">
                      {isCredit
                        ? parseFloat(entry.amount || 0).toFixed(2)
                        : ""}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>

        <Divider borderColor="#4e4e4e" mt={1} />

        {/* ===== AMOUNT IN WORDS ===== */}
        <Flex gap={2} py={1} borderBottom="1px solid #4e4e4e" fontSize="11px">
          <Text
            fontFamily="serif"
            color="black"
            fontWeight="bold"
            minW="fit-content"
          >
            Amount In Words :
          </Text>
          <Text>{numberToWords(totalAmount)}</Text>
        </Flex>

        {/* ===== NARRATION ===== */}
        <Flex gap={2} py={1} borderBottom="1px solid #4e4e4e" fontSize="11px">
          <Text
            fontFamily="serif"
            color="black"
            fontWeight="bold"
            minW="fit-content"
          >
            Narration :
          </Text>
          <Text fontWeight="bold">{contra.narration || "-"}</Text>
        </Flex>

        {/* ===== SIGNATURES ===== */}
        <Flex
          justify="space-between"
          mt="10px"
          mb="8px"
          px={4}
          alignItems="end"
        >
          <Text
            fontFamily="serif"
            color="black"
            fontWeight="bold"
            fontSize="14px"
          >
            Receiver's Signature
          </Text>
          <VStack>
            <Img src={stamp_img} width="70px" />
            <Text
              fontFamily="serif"
              color="black"
              fontWeight="bold"
              fontSize="14px"
            >
              Authorizer Signature
            </Text>
          </VStack>
        </Flex>

        {/* ===== BANK DETAILS ===== */}
        <Box
          borderTop="1px solid #000"
          pt={3}
          pb={2}
          borderBottom="1px solid #4e4e4e"
          fontSize="10px"
        >
          <Text fontFamily="serif" color="black" fontWeight="bold" mb={1}>
            Bank Details :
          </Text>
          <HStack justifyContent="space-between" alignItems="baseline">
            <VStack alignItems="baseline" gap={0}>
              <Text>Company Name : JAMIDARA SEEDS CORPORATION</Text>
              <Text>Bank Name : STATE BANK OF INDIA</Text>
              <Text>Bank Name : ICICI BANK</Text>
            </VStack>
            <VStack alignItems="baseline" gap={0}>
              <Text>Account No. : 61180709821</Text>
              <Text>Account No. : JSCRAJP53</Text>
            </VStack>
            <VStack alignItems="baseline" gap={0}>
              <Text>IFSC Code : SBIN0031764</Text>
              <Text>IFSC Code : ICIC0000106</Text>
            </VStack>
          </HStack>
        </Box>

        {/* ===== RULES & REGULATIONS ===== */}
        <Box border="1px solid #000" mt={3} p={1} fontSize="8px">
          <Text
            fontFamily="serif"
            color="black"
            fontWeight="bold"
            textDecoration="underline"
            mb={1}
          >
            Rules & Regulations
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ All cash discount plans and other plans shall be valid as per the
            rules and conditions of the company.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ If any goods packet is received by the distributor, it will have
            to be reported to the company within three days of receipt of the
            goods, after which the complaint will not be valid.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ The freight fare for the goods will be paid by the company only
            for the price marked on the Bill-T.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Transport fare will be paid by the company to the distributor only
            after the borrowing time of the bill is paid within 45 days.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Company has full rights to do changes in the value of any product
            & schemes at any time.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Distributor has to send the notice to the company within 7 days if
            any complaint regarding the product or anything, otherwise it will be
            discarded.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Goods once sold will not be taken back.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Interest @24% P.A. will be charged on late payment after 45 Days.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Supercash bill payment is mandatory within 7 days from bill date!
            If bill is not paid within the time period, the bill automatically
            will be converted to regular price.
          </Text>
        </Box>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent maxW="960px">

        {/* MODAL HEADER */}
        <ModalHeader borderBottom="1px solid #e2e8f0" py={3}>
          <Flex justify="space-between" align="center" pr={8}>
            <Text fontSize="16px" fontWeight="600">
              Contra Voucher Invoice
            </Text>
            <Button
              colorScheme="green"
              size="sm"
              fontSize="12px"
              height="34px"
              fontWeight="500"
              isLoading={downloading}
              loadingText="Downloading..."
              isDisabled={!invoice || loading}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
          </Flex>
        </ModalHeader>

        <ModalCloseButton />

        {/* MODAL BODY */}
        <ModalBody p={4}>
          {loading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner size="xl" />
            </Flex>
          ) : !invoice ? (
            <Text fontFamily="serif" color="black" p={10}>
              Invoice not found
            </Text>
          ) : (
            renderInvoiceContent()
          )}
        </ModalBody>

      </ModalContent>
    </Modal>
  );
};

export default ContraInvoice;