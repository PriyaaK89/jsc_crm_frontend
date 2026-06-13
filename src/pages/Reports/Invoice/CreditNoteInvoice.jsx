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

const CreditNoteInvoice = ({ isOpen, onClose, creditNoteId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef();

  const fetchInvoice = async () => {
    if (!creditNoteId) return;
    try {
      setLoading(true);
      const response = await API.get(
        `${API_ENDPOINTS.GET_CREDIT_NOTE_INVOICE}/${creditNoteId}`
      );
      if (response.status === 200) {
        setInvoice(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && creditNoteId) {
      fetchInvoice();
    }
    if (!isOpen) {
      setInvoice(null);
    }
  }, [isOpen, creditNoteId]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const html2pdf = (await import("html2pdf.js")).default;
      const element = printRef.current;
      const options = {
        margin: 5,
        filename: `Credit_Note_${invoice?.creditNote?.voucher_no || creditNoteId}.pdf`,
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

    const cn = invoice.creditNote;
    const items = invoice.items;
    const billReferences = invoice.billReferences || [];

    // ── Totals ──────────────────────────────────────────────────
    const totalQty = items.reduce(
      (sum, item) => sum + parseFloat(item.return_qty || 0), 0
    );
    const totalAmount = items.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0), 0
    );
    const totalTaxAmount = items.reduce(
      (sum, item) =>
        sum +
        parseFloat(item.igst_amount || 0) +
        parseFloat(item.cgst_amount || 0) +
        parseFloat(item.sgst_amount || 0),
      0
    );
    const taxTotal = totalTaxAmount;
    const grossTotal = totalAmount + taxTotal;
    const finalTotal = Math.round(grossTotal);
    const roundOff = finalTotal - grossTotal;

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
          textAlign="center" fontSize="16px" fontWeight="900"
          color="brown" textDecoration="underline"
          fontFamily="serif" mb={2}
        >
          Credit Note
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

        {/* ===== BILL TO + TRANSPORT + META ===== */}
        {/* Matching screenshot: 3 columns — Bill To | Transportation Details | Right meta */}
        <Table size="sm" variant="unstyled" mb={1}>
          <Thead>
            <Tr>
              <Th fontSize="10px">Bill To:</Th>
              <Th fontSize="10px">Transportation Details</Th>
              <Th fontSize="10px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              {/* Bill To */}
              <Td verticalAlign="top" width="35%">
                <Text fontFamily="serif" color="black" fontSize="10px" fontWeight="900">
                  {cn.customer_name}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px">
                  Contact No.: {cn.customer_mobile || "-"}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px">
                  GSTN No.: {cn.customer_gst || "-"}
                </Text>
              </Td>

              {/* Transportation Details */}
              <Td verticalAlign="top" width="35%">
                <Text fontFamily="serif" color="black" fontSize="10px">
                  Transport Name: By {cn.transport_name || "-"}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px">
                  Vehicle No.: {cn.vehicle_no || "-"}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px">
                  Delivery Dt.:{" "}
                  {cn.credit_note_date
                    ? new Date(cn.credit_note_date).toLocaleDateString("en-GB")
                    : "-"}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px">
                  Delivery Loc.: {cn.delivery_place || "-"}
                </Text>
              </Td>

              {/* Right Meta Column — matches screenshot right side */}
              <Td verticalAlign="top" width="30%">
                <Text fontFamily="serif" color="black" fontSize="10px" fontWeight="900">
                  Under Emp.: {cn.employee_under_name || "-"}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px" fontWeight="900">
                  Order No.: {cn.order_no || "-"}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px" fontWeight="900">
                  Order Date:{" "}
                  {cn.credit_note_date ? new Date(cn.credit_note_date).toLocaleDateString("en-GB") : "-"}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px" fontWeight="900">
                  Bill No.: {cn.voucher_no || "-"}
                </Text>
                <Text fontFamily="serif" color="black" fontSize="10px" fontWeight="900">
                  Bill Date:{" "}
                  {cn.credit_note_date ? new Date(cn.credit_note_date).toLocaleDateString("en-GB") : "-"}
                </Text>
              </Td>
            </Tr>
          </Tbody>
        </Table>

        <Divider borderColor="#4e4e4e" />

        {/* ===== ITEMS TABLE ===== */}
        {/* Columns match screenshot: S.N. | Item name | HSN Code | Quantity | Price | Unit | Case/Bag | Amount | GST | Tax Amount */}
        <Box overflowX="auto">
          <Table
            size="sm"
            variant="unstyled"
            sx={{ borderCollapse: "collapse" }}
            className="purchase_invoice_table"
          >
            <Thead>
              <Tr borderTop="1px solid #4e4e4e" borderBottom="1px solid #4e4e4e">
                <Th>S.N.</Th>
                <Th>Item name</Th>
                <Th>HSN Code</Th>
                <Th>Quantity</Th>
                <Th>Price</Th>
                <Th>Unit</Th>
                <Th>Case/Bag</Th>
                <Th>Amount</Th>
                <Th>GST</Th>
                <Th>Tax Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item, index) => {
                const igstPct = parseFloat(item.igst_percent || 0);
                const cgstPct = parseFloat(item.cgst_percent || 0);
                const sgstPct = parseFloat(item.sgst_percent || 0);
                const taxPct = igstPct || cgstPct + sgstPct;
                const taxAmount =
                  parseFloat(item.igst_amount || 0) +
                  parseFloat(item.cgst_amount || 0) +
                  parseFloat(item.sgst_amount || 0);

                // Batch info line under item name — matches screenshot "(JS/HY.BAJRA/2022/02) (MFG-,EXP-)"
                const batchInfo = [
                  item.batch_no ? `${item.batch_no}` : null,
                  item.mfg_date ? `MFG: ${new Date(item.mfg_date).toLocaleDateString("en-GB")}` : null,
                  item.expiry_date ? `EXP: ${new Date(item.expiry_date).toLocaleDateString("en-GB")}` : null,
                ]
                  .filter(Boolean)
                  .join(",");

                return (
                  <Tr key={item.id} borderBottom="1px solid #ccc">
                    <Td>{index + 1}</Td>
                    <Td>
                      <Text fontFamily="serif" color="black" fontWeight="semibold"> {item.item_name} </Text>
                      {batchInfo && ( <Text fontFamily="serif" color="black" fontSize="11px"> ({batchInfo}) </Text> )}
                    </Td>
                    <Td textAlign="center">{item.hsn_code || "-"}</Td>
                    <Td textAlign="center"> {parseFloat(item.return_qty || 0).toFixed(0)} </Td>
                    <Td textAlign="center"> {parseFloat(item.rate || 0).toFixed(2)} </Td>
                    <Td textAlign="center">{item.unit_name || "-"}</Td>
                    <Td textAlign="center">{item.case_bag || "-"}</Td>
                    <Td textAlign="right"> {parseFloat(item.amount || 0).toFixed(2)} </Td>
                    <Td textAlign="center"> {taxPct > 0 ? `${taxPct.toFixed(1)} %` : "0.0 %"} </Td>
                    <Td textAlign="right">{taxAmount.toFixed(1)}</Td>
                  </Tr>
                );
              })}

              {/* Totals Row */}
              <Tr borderTop="1px solid #4e4e4e" fontWeight="bold" bg="gray.50">
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" />
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" fontWeight="bold"> TOTAL </Td>
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" />
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" textAlign="center"> {totalQty.toFixed(0)} </Td>
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" />
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" />
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" />
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" textAlign="right">
                  {totalAmount.toFixed(2)}
                </Td>
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" />
                <Td fontSize="10px" border="1px solid #ddd" padding="4px" textAlign="right">
                  {totalTaxAmount.toFixed(2)}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* ===== GST SUMMARY — right aligned, matches screenshot ===== */}
        <Flex justify="flex-end" mt={2} pb={1}>
  <Box minW="260px">
    {Number(cn?.cgst_total) > 0 && Number(cn?.sgst_total) > 0 && (
      <>
        <Flex justify="space-between">
          <Text fontSize="12px" fontWeight="600">CGST :</Text>
          <Text fontSize="12px" fontWeight="600">
            {Number(cn?.cgst_total).toFixed(2)}
          </Text>
        </Flex>

        <Flex justify="space-between">
          <Text fontSize="12px" fontWeight="600">SGST :</Text>
          <Text fontSize="12px" fontWeight="600">
            {Number(cn?.sgst_total).toFixed(2)}
          </Text>
        </Flex>
      </>
    )}

    {Number(cn?.igst_total) > 0 && (
      <Flex justify="space-between">
        <Text fontSize="12px" fontWeight="600">IGST :</Text>
        <Text fontSize="12px" fontWeight="600">
          {Number(cn?.igst_total).toFixed(2)}
        </Text>
      </Flex>
    )}
  </Box>
</Flex>

        <Divider borderColor="#4e4e4e" mt={1} />

        <Flex justify="space-between" px={2} py={1} fontWeight="bold" fontSize="12px">
          <Text>TOTAL :</Text>
          <Text>{finalTotal.toFixed(2)}</Text>
        </Flex>

        <Divider borderColor="#4e4e4e" mt={1} />

        {/* ===== AMOUNT IN WORDS ===== */}
        <Flex gap={2} py={1} borderBottom="1px solid #4e4e4e" fontSize="11px">
          <Text fontFamily="serif" color="black" fontWeight="bold" minW="fit-content">
            Amount In Words :
          </Text>
          <Text>{numberToWords(finalTotal)}</Text>
        </Flex>

        {/* ===== NARRATION ===== */}
        <Flex gap={2} py={1} borderBottom="1px solid #4e4e4e" fontSize="11px">
          <Text fontFamily="serif" color="black" fontWeight="bold" minW="fit-content">
            Narration :
          </Text>
          <Text>{cn.narration || "-"}</Text>
        </Flex>

        {/* ===== SIGNATURES ===== */}
        <Flex justify="space-between" mt="10px" mb="8px" px={4} alignItems="end">
          <Text fontFamily="serif" color="black" fontWeight="bold" fontSize="14px">
            Receiver's Signature
          </Text>
          <VStack>
            <Img src={stamp_img} width="70px" />
            <Text fontFamily="serif" color="black" fontWeight="bold" fontSize="14px">
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
          <Text fontFamily="serif" color="black" fontWeight="bold" textDecoration="underline" mb={1}>
            Rules & Regulations
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ All cash discount plans and other plans shall be valid as per the rules and conditions of the company.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ If any goods packet is received by the distributor, it will have to be reported to the company within three days of receipt of the goods, after which the complaint will not be valid.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ The freight fare for the goods will be paid by the company only for the price marked on the Bill-T.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Transport fare will be paid by the company to the distributor only after the borrowing time of the bill is paid within 45 days.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Company has full rights to do changes in the value of any product & schemes at any time.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Distributor has to send the notice to the company within 7 days if any complaint regarding the product or anything, otherwise it will be discarded.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Goods once sold will not be taken back.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Interest @24% P.A. will be charged on late payment after 45 Days.
          </Text>
          <Text fontFamily="serif" color="black" mt="1px">
            ❖ Supercash bill payment is mandatory within 7 days from bill date! If bill is not paid within the time period, the bill automatically will be converted to regular price.
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
            <Text fontSize="16px" fontWeight="600">Credit Note Invoice</Text>
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
            <Text fontFamily="serif" color="black" p={10}>Invoice not found</Text>
          ) : (
            renderInvoiceContent()
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreditNoteInvoice;