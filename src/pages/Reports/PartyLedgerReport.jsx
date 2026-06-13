import React, { useEffect, useState } from "react";
import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, VStack, } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Link } from "react-router-dom";
import PurchaseInvoice from "./Invoice/PurchaseInvoice";
import PaymentInvoice from "./Invoice/PaymentInvoice";
import SalesInvoice from "./Invoice/SalesInvoice";
import CreditNoteInvoice from "./Invoice/CreditNoteInvoice";
import ReceiptInvoice from "./Invoice/ReceiptInvoice";

function PartyLedgerReport() {
  const [ledgerList, setLedgerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState({});
  const [pagination, setPagination] = useState({});
  const [openingBalance, setOpeningBalance] = useState({
    amount: 0,
    type: "Dr",
  });
  const [filters, setFilters] = useState({
    ledger_id: "",
    from_date: "",
    to_date: "",
    search: "",
    page: 1,
    limit: 20,
  });

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedSalesId, setSelectedSalesId] = useState(null);
  const [selectedCreditNoteId, setSelectedCreditNoteId] = useState(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const { isOpen: isPurchaseModalOpen, onOpen: onPurchaseModalOpen, onClose: onPurchaseModalClose } = useDisclosure();
  const { isOpen: isPaymentModalOpen, onOpen: onPaymentModalOpen, onClose: onPaymentModalClose } = useDisclosure();
  const { isOpen: isSalesModalOpen, onOpen: onSalesModalOpen, onClose: onSalesModalClose } = useDisclosure();
  const { isOpen: isCreditNoteModalOpen, onOpen: onCreditNoteModalOpen, onClose: onCreditNoteModalClose } = useDisclosure();
  const { isOpen: isReceiptModalOpen, onOpen: onReceiptModalOpen, onClose: onReceiptModalClose } = useDisclosure();

  const fetchLedgerDropdown = async () => {
    try {
      const response = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);
      if (response.status === 200) {
        setLedgerList(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPartyLedgerReport = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.GET_PARTY_LEDGER_REPORT, {
        params: filters,
      });
      if (response.status === 200) {
        setReportData(response.data.data);
        setTotals(response.data.totals);
        setPagination(response.data.pagination);
        setOpeningBalance(
          response.data.opening_balance || {
            amount: 0,
            type: "Dr",
          },
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  useEffect(() => {
    fetchLedgerDropdown();
  }, []);

  useEffect(() => {
    if (filters.ledger_id && filters.from_date && filters.to_date) {
      fetchPartyLedgerReport();
    }
  }, [filters.page]);

  const openVoucher = (transactionType, referenceId) => {
    if (transactionType === "PURCHASE") {
      setSelectedInvoiceId(referenceId);
      onPurchaseModalOpen();
    }
    //  else if (transactionType === "PAYMENT") {
    //   window.open(`${window.location.origin}/print/payment/${referenceId}`, "_blank");
    // }
    else if (transactionType === "PAYMENT") {
      setSelectedPaymentId(referenceId);
      onPaymentModalOpen();
    }
    else if (transactionType === "SALES") {
      setSelectedSalesId(referenceId);
      onSalesModalOpen();
    }
    else if (transactionType === "CREDIT_NOTE") {
      setSelectedCreditNoteId(referenceId);
      onCreditNoteModalOpen();
    }
    else if (transactionType === "RECEIPT") {
      setSelectedReceiptId(referenceId);
      onReceiptModalOpen();
    }
  };
  return (
    <Box>

      <PurchaseInvoice isOpen={isPurchaseModalOpen} onClose={onPurchaseModalClose} invoiceId={selectedInvoiceId} />
      <PaymentInvoice isOpen={isPaymentModalOpen} onClose={onPaymentModalClose} paymentId={selectedPaymentId} />
      <SalesInvoice isOpen={isSalesModalOpen} onClose={onSalesModalClose} invoiceId={selectedSalesId} />
      <CreditNoteInvoice isOpen={isCreditNoteModalOpen} onClose={onCreditNoteModalClose} creditNoteId={selectedCreditNoteId} />
      <ReceiptInvoice isOpen={isReceiptModalOpen} onClose={onReceiptModalClose} receiptId={selectedReceiptId} />

      <Heading size="md" mb={5} color="#4d4d4d">
        Party Ledger Report{" "}
      </Heading>

      <Box bg="white" p={5} borderRadius="md" boxShadow="sm" border="1px solid #dbdbdb">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <FormControl>
            <FormLabel>Select Party</FormLabel>
            <Select
              placeholder="Select Party"
              name="ledger_id" height="40px" fontSize="14px"
              value={filters.ledger_id}
              onChange={handleChange}>
              {ledgerList.map((item) => (
                <option key={item.id} value={item.id}> {item.ledger_name} </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>From Date</FormLabel>
            <Input type="date" name="from_date" value={filters.from_date} onChange={handleChange} height="40px"/>
          </FormControl>

          <FormControl>
            <FormLabel>To Date</FormLabel>
            <Input type="date" name="to_date" value={filters.to_date} height="40px" onChange={handleChange}/>
          </FormControl>

        </SimpleGrid>

        {/* BUTTONS */}
        <Flex justify="flex-end" mt={5} gap={3}>
          <Button
            colorScheme="blue"
            fontSize="12px" height="34px"
            fontWeight="500"
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                page: 1,
              }));

              fetchPartyLedgerReport();
            }}>
            SEARCH
          </Button>
        </Flex>
      </Box>

      <Box mt={6} bg="white" borderRadius="md" p={5} boxShadow="sm" overflowX="auto">
        {loading ? (
          <Flex justify="center" py={10}> <Spinner size="xl" /> </Flex>) : (
          <>
            <VStack alignItems="end">
              <VStack width='40%' alignItems="start" gap={0} mb={3}>
                <Input
                  placeholder="Search Voucher..."
                  name="search"
                  value={filters.search}
                  onChange={handleChange} height="40px"
                />
              </VStack>
            </VStack>
            <Table variant="simple" size="sm">
              <Thead bg="gray.100" height="40px">
                <Tr>
                  <Th>Date</Th>
                  <Th>Particulars</Th>
                  <Th>Transaction Type</Th>
                  <Th>Voucher No</Th>
                  <Th isNumeric>Debit</Th>
                  <Th isNumeric>Credit</Th>
                  <Th isNumeric>Balance</Th>
                </Tr>
              </Thead>

              <Tbody>
                <Tr bg="gray.50">
                  <Td fontWeight="bold"> {filters.from_date ? new Date(filters.from_date).toLocaleDateString("en-GB") : "-"} </Td>
                  <Td fontWeight="bold" color="blue.600"> {" "} Opening Balance{" "} </Td>
                  <Td>-</Td>
                  <Td>-</Td>
                  <Td isNumeric>{openingBalance?.type === "Dr" ? Number(openingBalance?.amount || 0).toFixed(2) : "-"} </Td>
                  <Td isNumeric> {openingBalance?.type === "Cr" ? Number(openingBalance?.amount || 0).toFixed(2) : "-"} </Td>
                  <Td isNumeric>
                    <Text color={openingBalance?.type === "Cr" ? "red.500" : "green.500"} fontWeight="bold">
                      {Number(openingBalance?.amount || 0).toFixed(2)}{" "}
                      {openingBalance?.type}
                    </Text>
                  </Td>
                </Tr>

                {reportData.length > 0 ? (
                  reportData.map((item) => (
                    <Tr key={item.id}>
                      {/* DATE */}

                      <Td>
                        {item.transaction_date
                          ? new Date(item.transaction_date).toLocaleDateString(
                            "en-GB",
                          )
                          : "-"}
                      </Td>
                      <Td>{item.purchase_ledger_name || "-"}</Td>
                      <Td>{item.transaction_type || "-"}</Td>
                      <Td color="blue.500">
                        <Link
                          color="blue.500"
                          onClick={() => openVoucher(item.transaction_type, item.reference_id,)}>
                          {item.voucher_no}
                        </Link>
                      </Td>
                      <Td isNumeric>
                        {Number(item.debit) > 0 ? Number(item.debit).toFixed(2) : "-"}
                      </Td>

                      {/* CREDIT */}

                      <Td isNumeric>
                        {Number(item.credit) > 0 ? Number(item.credit).toFixed(2) : "-"}
                      </Td>

                      <Td isNumeric>
                        <Text
                          color={item.balance_type === "Cr" ? "red.500" : "green.500"}
                          fontWeight="bold">
                          {Number(item.balance || 0).toFixed(2)}{" "}
                          {item.balance_type}
                        </Text>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={7} textAlign="center"> No Data Found </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            <Box mt={6}>
              <VStack align="flex-end" spacing={2}>
                <Flex gap={8}>
                  <Text fontWeight="bold"> Total Debit: </Text>
                  <Text> {Number(totals.total_debit || 0).toFixed(2)}</Text>
                </Flex>

                <Flex gap={8}>
                  <Text fontWeight="bold"> Total Credit:</Text>
                  <Text>{Number(totals.total_credit || 0).toFixed(2)}</Text>
                </Flex>

                <Flex gap={8}>
                  <Text fontWeight="bold"> Closing Balance:</Text>
                  <Text
                    color={totals.closing_type === "Cr" ? "red.500" : "green.500"}
                    fontWeight="bold">
                    {Number(totals.closing_balance || 0).toFixed(2)}{" "}
                    {totals.closing_type}
                  </Text>
                </Flex>
              </VStack>
            </Box>

            <Flex justify="space-between" align="center" mt={6}>
              <Text> Page {pagination.current_page || 1} of{" "} {pagination.total_pages || 1} </Text>

              <Flex gap={2}>
                <Button
                  size="sm"
                  isDisabled={filters.page <= 1}
                  onClick={() => handlePageChange(filters.page - 1)}>
                  Previous
                </Button>

                <Button
                  size="sm"
                  isDisabled={filters.page >= pagination.total_pages}
                  onClick={() => handlePageChange(filters.page + 1)}>
                  Next
                </Button>
              </Flex>
            </Flex>
          </>
        )}
      </Box>
    </Box>
  );
}

export default PartyLedgerReport;
