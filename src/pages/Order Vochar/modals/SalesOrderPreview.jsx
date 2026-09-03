// components/SalesOrderPreviewModal.jsx
import React, { useRef, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, Box, Flex, Text, Table, Thead, Tbody, Tr, Td, Th,
  Button, Divider, VStack, HStack, Img,
} from "@chakra-ui/react";
import stamp_img from "../../../assets/images/stamp_jsc.png";
import jamidara_seeds_logo from "../../../assets/images/jsc_logo_.png";

const safeParseJSON = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

const cleanQuoted = (val) => {
  if (val === undefined || val === null) return "";
  let str = String(val);
  if (str.length >= 2 && str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
  return str;
};

const numberToWords = (num) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " ";
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred " + convert(n % 100);
    if (n < 100000) return convert(Math.floor(n / 1000)) + "Thousand " + convert(n % 1000);
    if (n < 10000000) return convert(Math.floor(n / 100000)) + "Lakh " + convert(n % 100000);
    return convert(Math.floor(n / 10000000)) + "Crore " + convert(n % 10000000);
  };
  const intPart = Math.floor(num);
  const result = convert(intPart).trim();
  return result ? "Rupees " + result + " Only" : "Rupees Zero Only";
};

const SalesOrderPreviewModal = ({
  isOpen,
  onClose,
  approval,
  formData,       // ← live form state from Sales.jsx
  items,          // ← live items array from Sales.jsx
  dispatchData,   // ← live dispatch fields from Sales.jsx
  extraLedgers,   // ← live extra ledgers from Sales.jsx
}) => {
  const printRef = useRef();
  const [downloading, setDownloading] = useState(false);

  if (!approval) return null;

  const payload = approval.payload_json || {};

  // ── Use live formData if passed, else fall back to payload_json ──
  // This means whatever the approver has typed is shown in preview
  const transportName    = formData?.transportName    || cleanQuoted(payload.transport_name);
  const ewayNumber       = formData?.ewayNumber       || cleanQuoted(payload.eway_number);
  const transporterGst   = formData?.transporterGst   || cleanQuoted(payload.transporter_gst);
  const deliveryPlace    = formData?.deliveryPlace    || cleanQuoted(payload.delivery_place);
  const narration        = formData?.narration        || cleanQuoted(payload.narration);
  const salesLedgerId    = formData?.salesLedgerId    || payload.sales_ledger_id || "";
  const voucherNo        = formData?.salesNo          || cleanQuoted(payload.voucher_no);
  const orderDate        = formData?.date             || (approval.created_at
    ? new Date(approval.created_at).toLocaleDateString("en-GB") : "-");

  // Consignee
  const isConsignee      = (formData?.isConsignee === "Yes") || payload.is_consignee === "1";
  const dealerName       = formData?.dealerName       || cleanQuoted(payload.dealer_name);
  const proprietorName   = formData?.proprietorName   || cleanQuoted(payload.proprietor_name);
  const consigneeContact = formData?.consigneeContactNo || cleanQuoted(payload.consignee_contact_no);
  const consigneeAddress = formData?.consigneeAddress || cleanQuoted(payload.consignee_address);
  const consigneeGstn    = formData?.consigneeGstnNo  || cleanQuoted(payload.consignee_gstn_no);

  // Dispatch fields (filled by DISPATCHER / SENIOR)
  const vehicleNo   = dispatchData?.vehicleNo   || cleanQuoted(payload.vehicle_no);
  const destination = dispatchData?.destination || cleanQuoted(payload.destination);
  const dispatchDocNo = dispatchData?.dispatchDocNo || cleanQuoted(payload.dispatch_doc_no);
  const billTNo     = dispatchData?.billTNo     || cleanQuoted(payload.bill_t_no);
  const transportFreight = dispatchData?.transportFreight ?? payload.transport_freight ?? "0";
  const localFreight     = dispatchData?.localFreight     ?? payload.local_freight     ?? "0";
  const loadFreight      = dispatchData?.loadFreight      ?? payload.load_freight      ?? "0";
  const unloadFreight    = dispatchData?.unloadFreight    ?? payload.unload_freight    ?? "0";

  // ── Items: use live items array if passed, else parse from payload ──
  const liveItems = (items && items.length > 0)
    ? items
    : safeParseJSON(payload.items, []);

  // ── Extra ledgers: use live state if passed ──
  const liveExtraLedgers = (extraLedgers && extraLedgers.length > 0)
    ? extraLedgers.filter(el => el.ledger_id && el.amount !== "" && Number(el.amount) !== 0)
    : safeParseJSON(payload.extra_ledgers, []);

  // ── hasIGST must be declared before any totals ──
  const hasIGST = liveItems.some(i => parseFloat(i.igst_percent || 0) > 0);

  // ── Totals — always calculated from percent × amount ──
  const totalQty    = liveItems.reduce((s, i) => s + parseFloat(i.billed_qty || 0), 0);
  const totalAmount = liveItems.reduce((s, i) => s + parseFloat(i.amount || 0), 0);

  const totalIgst = hasIGST
    ? liveItems.reduce((s, i) =>
        s + (parseFloat(i.amount || 0) * parseFloat(i.igst_percent || 0)) / 100, 0)
    : 0;

  const totalCgst = !hasIGST
    ? liveItems.reduce((s, i) =>
        s + (parseFloat(i.amount || 0) * parseFloat(i.cgst_percent || 0)) / 100, 0)
    : 0;

  const totalSgst = !hasIGST
    ? liveItems.reduce((s, i) =>
        s + (parseFloat(i.amount || 0) * parseFloat(i.sgst_percent || 0)) / 100, 0)
    : 0;

  const totalTax = hasIGST ? totalIgst : (totalCgst + totalSgst);

  // Extra ledger total — respect PLUS/MINUS operation if stored
  const extraLedgersTotal = liveExtraLedgers.reduce((s, el) => {
    const amt = parseFloat(el.amount || 0);
    // If from live state, amount may be negative directly
    // If from payload, operation field tells us direction
    if (el.operation === "MINUS") return s - Math.abs(amt);
    return s + Math.abs(amt);
  }, 0);

  const grossTotal = totalAmount + totalTax + extraLedgersTotal;
  const finalTotal = Math.round(grossTotal);

  // ── PDF download ────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set({
        margin: 5,
        filename: `Sales_Order_Preview_${approval.id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(printRef.current).save();
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent maxW="960px">

        {/* ── Header ── */}
        <ModalHeader borderBottom="1px solid #e2e8f0" py={3}>
          <Flex justify="space-between" align="center" pr={8}>
            <Text fontSize="16px" fontWeight="600">Bill of Supply — Preview</Text>
            <Button
              colorScheme="green" size="sm" fontSize="12px"
              height="34px" fontWeight="500"
              isLoading={downloading} loadingText="Downloading..."
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
          </Flex>
        </ModalHeader>

        <ModalCloseButton />

        {/* ── Body ── */}
        <ModalBody p={4} overflowY="auto">
          <Box ref={printRef} bg="white" maxW="900px" mx="auto"
            fontFamily="serif" fontSize="13px" p={2}>

            {/* Logo */}
            <Box pb={1}>
              <img src={jamidara_seeds_logo} alt="logo" style={{ width: "140px" }} />
            </Box>

            {/* Title */}
            <Text textAlign="center" fontSize="16px" fontWeight="900"
              color="brown" textDecoration="underline" fontFamily="serif" mb={2}>
              BILL OF SUPPLY
            </Text>

            {/* Company info */}
            <Box mb={2}>
              <Text fontFamily="serif" color="black" fontSize="10px" fontWeight="900">
                JAMIDARA SEEDS CORPORATION
              </Text>
              {[
                "P.B. Road Rane Bannure Distric-HAVERI,KARNATAKA",
                "REG.ADD. 73,GANESH NAGAR-MURLIPURA JAIPUR",
                "Phone no: +919414429966",
                "Email: jamidaraseedscorporation@gmail.com",
                "GSTIN: 08AANFJ6936B1Z7",
                "State: Rajasthan",
              ].map(line => (
                <Text key={line} fontFamily="serif" color="black" fontSize="10px">{line}</Text>
              ))}
            </Box>

            {/* Bill To + Consignee + Transport + Meta */}
            <Table size="sm" variant="unstyled" mb={1}>
              <Thead>
                <Tr>
                  <Th fontSize="10px">Bill To:</Th>
                  {isConsignee && <Th fontSize="10px">Consignee Details</Th>}
                  <Th fontSize="10px">Transportation Details</Th>
                  <Th fontSize="10px" />
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  {/* Bill To */}
                  <Td verticalAlign="top" fontSize="10px">
                    <Text fontWeight="900">Order No.: {approval.id}</Text>
                    <Text>Order Date: {orderDate}</Text>
                    <Text>Created By: {approval.created_by_name || "-"}</Text>
                  </Td>

                  {/* Consignee */}
                  {isConsignee && (
                    <Td verticalAlign="top" fontSize="10px">
                      <Text>Dealer: {dealerName || "-"}</Text>
                      <Text>Proprietor: {proprietorName || "-"}</Text>
                      <Text>Contact: {consigneeContact || "-"}</Text>
                      <Text>Address: {consigneeAddress || "-"}</Text>
                      <Text>GSTN: {consigneeGstn || "-"}</Text>
                    </Td>
                  )}

                  {/* Transport — uses live dispatchData for vehicle/destination */}
                  <Td verticalAlign="top" fontSize="10px">
                    <Text>Transport Name: By {transportName || "-"}</Text>
                    <Text>E-Way No.: {ewayNumber || "-"}</Text>
                    <Text>Transport GST.: {transporterGst || "-"}</Text>
                    <Text>Delivery Place.: {deliveryPlace || "-"}</Text>
                    <Text>Vehicle No.: {vehicleNo || "-"}</Text>
                    <Text>Delivery Dt.: {orderDate}</Text>
                    <Text>Delivery Loc.: {destination || "-"}</Text>
                  </Td>

                  {/* Right meta */}
                  <Td verticalAlign="top" fontSize="10px">
                    <Text fontWeight="900">Under Emp.: {approval.created_by_name || "-"}</Text>
                    <Text fontWeight="900">Order No.: {approval.id}</Text>
                    <Text fontWeight="900">Order Date: {orderDate}</Text>
                    <Text fontWeight="900">Bill No.: {voucherNo || "-"}</Text>
                  </Td>
                </Tr>
              </Tbody>
            </Table>

            {/* Dispatch info row — only shown when dispatcher/senior fields are filled */}
            {(dispatchDocNo || billTNo || Number(transportFreight) > 0) && (
              <Box border="1px solid #e0e0e0" borderRadius="4px" p={2} mb={2} fontSize="10px">
                <Text fontWeight="700" mb={1} fontSize="10px">Dispatch Details:</Text>
                <HStack gap={6} flexWrap="wrap">
                  {dispatchDocNo && <Text>Dispatch Doc No.: {dispatchDocNo}</Text>}
                  {billTNo       && <Text>Bill-T No.: {billTNo}</Text>}
                  {Number(transportFreight) > 0 && <Text>Transport Freight: ₹{transportFreight}</Text>}
                  {Number(localFreight) > 0     && <Text>Local Freight: ₹{localFreight}</Text>}
                  {Number(loadFreight) > 0      && <Text>Load Freight: ₹{loadFreight}</Text>}
                  {Number(unloadFreight) > 0    && <Text>Unload Freight: ₹{unloadFreight}</Text>}
                </HStack>
              </Box>
            )}

            <Divider borderColor="#4e4e4e" />

            {/* Items table */}
            <Box overflowX="auto">
              <Table size="sm" variant="unstyled"
                sx={{ borderCollapse: "collapse" }}
                className="purchase_invoice_table">
                <Thead>
                  <Tr borderTop="1px solid #4e4e4e" borderBottom="1px solid #4e4e4e">
                    {["S.N.", "Item Name", "HSN Code", "Quantity", "Price",
                      "Unit", "Case/Bag", "Amount", "GST %", "Tax Amount"].map(h => (
                      <Th key={h} fontSize="10px"
                        borderRight="1px solid #ddd" borderLeft="1px solid #ddd">{h}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {liveItems.map((item, index) => {
                    const igstPct = parseFloat(item.igst_percent || 0);
                    const cgstPct = parseFloat(item.cgst_percent || 0);
                    const sgstPct = parseFloat(item.sgst_percent || 0);
                    const amt     = parseFloat(item.amount || 0);
                    const taxPct  = hasIGST ? igstPct : (cgstPct + sgstPct);
                    const taxAmt  = hasIGST
                      ? (amt * igstPct) / 100
                      : (amt * (cgstPct + sgstPct)) / 100;

                    return (
                      <Tr key={index} borderBottom="1px solid #ccc">
                        <Td fontSize="10px" borderRight="1px solid #ddd" borderLeft="1px solid #ddd">
                          {index + 1}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" fontWeight="semibold">
                          {item.item_name}
                          {/* Show batch if present */}
                          {item.batch_no && item.batch_no !== "Not Applicable" && (
                            <Text fontSize="9px" color="gray.500">
                              Batch: {item.batch_no}
                            </Text>
                          )}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" textAlign="center">
                          {item.hsn_code || "-"}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" textAlign="center">
                          {parseFloat(item.billed_qty || 0).toFixed(0)}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" textAlign="center">
                          {parseFloat(item.rate || 0).toFixed(2)}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" textAlign="center">
                          {item.unit_name || "-"}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" textAlign="center">
                          {item.case_bag || "-"}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" textAlign="right">
                          {amt.toFixed(2)}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" textAlign="center">
                          {taxPct > 0 ? `${taxPct.toFixed(1)}%` : "0.0%"}
                        </Td>
                        <Td fontSize="10px" borderRight="1px solid #ddd" textAlign="right">
                          {taxAmt.toFixed(2)}
                        </Td>
                      </Tr>
                    );
                  })}

                  {/* Totals row */}
                  <Tr borderTop="1px solid #4e4e4e" bg="gray.50">
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" />
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" fontWeight="bold">TOTAL</Td>
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" />
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" textAlign="center">
                      {totalQty.toFixed(0)}
                    </Td>
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" />
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" />
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" />
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" textAlign="right">
                      {totalAmount.toFixed(2)}
                    </Td>
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" />
                    <Td fontSize="10px" border="1px solid #ddd" p="4px" textAlign="right">
                      {totalTax.toFixed(2)}
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>

            {/* Extra ledgers — from SENIOR level */}
            {liveExtraLedgers.length > 0 && (
              <Box mt={2}>
                <Table size="sm" variant="unstyled" sx={{ borderCollapse: "collapse" }}>
                  <Thead>
                    <Tr borderTop="1px solid #4e4e4e" borderBottom="1px solid #4e4e4e">
                      <Th fontSize="10px">S.N.</Th>
                      <Th fontSize="10px">Particulars</Th>
                      <Th fontSize="10px" textAlign="right">Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {liveExtraLedgers.map((el, index) => {
                      const amt = parseFloat(el.amount || 0);
                      const isNeg = el.operation === "MINUS" || amt < 0;
                      return (
                        <Tr key={index} borderBottom="1px solid #ccc">
                          <Td fontSize="10px">{index + 1}</Td>
                          <Td fontSize="10px">{el.ledger_name || el.comments || "-"}</Td>
                          <Td fontSize="10px" textAlign="right"
                            color={isNeg ? "red.600" : "inherit"}>
                            {isNeg ? "-" : ""}₹{Math.abs(amt).toFixed(2)}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            )}

            {/* GST Summary */}
            <Flex justify="flex-end" mt={2} pb={1}>
              <Box minW="260px">
                {hasIGST ? (
                  <Flex justify="space-between">
                    <Text fontSize="12px" fontWeight="600">IGST :</Text>
                    <Text fontSize="12px" fontWeight="600">{totalIgst.toFixed(2)}</Text>
                  </Flex>
                ) : (
                  <>
                    <Flex justify="space-between">
                      <Text fontSize="12px" fontWeight="600">CGST :</Text>
                      <Text fontSize="12px" fontWeight="600">{totalCgst.toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="12px" fontWeight="600">SGST :</Text>
                      <Text fontSize="12px" fontWeight="600">{totalSgst.toFixed(2)}</Text>
                    </Flex>
                  </>
                )}
              </Box>
            </Flex>

            <Divider borderColor="#4e4e4e" mt={1} />
            <Flex justify="space-between" px={2} py={1} fontWeight="bold" fontSize="12px">
              <Text>TOTAL :</Text>
              <Text>{finalTotal.toFixed(2)}</Text>
            </Flex>
            <Divider borderColor="#4e4e4e" mt={1} />

            {/* Amount in words */}
            <Flex gap={2} py={1} borderBottom="1px solid #4e4e4e" fontSize="12px">
              <Text fontWeight="bold" minW="fit-content">Amount In Words :</Text>
              <Text>{numberToWords(finalTotal)}</Text>
            </Flex>

            {/* Narration */}
            <Flex gap={2} py={1} borderBottom="1px solid #4e4e4e" fontSize="12px">
              <Text fontWeight="bold" minW="fit-content">Narration :</Text>
              <Text>{narration || "-"}</Text>
            </Flex>

            {/* Signatures */}
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

            {/* Bank Details */}
            <Box borderTop="1px solid #000" pt={3} pb={2}
              borderBottom="1px solid #4e4e4e" fontSize="10px">
              <Text fontWeight="bold" mb={1}>Bank Details :</Text>
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

            {/* Rules & Regulations */}
            <Box border="1px solid #000" mt={3} p={1} fontSize="8px">
              <Text fontWeight="bold" textDecoration="underline" mb={1}>
                Rules & Regulations
              </Text>
              {[
                "All cash discount plans and other plans shall be valid as per the rules and conditions of the company.",
                "If any goods packet is received by the distributor, it will have to be reported to the company within three days of receipt of the goods, after which the complaint will not be valid.",
                "The freight fare for the goods will be paid by the company only for the price marked on the Bill-T.",
                "Transport fare will be paid by the company to the distributor only after the borrowing time of the bill is paid within 45 days.",
                "Company has full rights to do changes in the value of any product & schemes at any time.",
                "Distributor has to send the notice to the company within 7 days if any complaint regarding the product or anything, otherwise it will be discarded.",
                "Goods once sold will not be taken back.",
                "Interest @24% P.A. will be charged on late payment after 45 Days.",
                "Supercash bill payment is mandatory within 7 days from bill date! If bill is not paid within the time period, the bill automatically will be converted to regular price.",
              ].map((rule, i) => (
                <Text key={i} mt="1px">❖ {rule}</Text>
              ))}
            </Box>

          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SalesOrderPreviewModal;