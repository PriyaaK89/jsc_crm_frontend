import { Box, Button, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Text, Spinner, Center, } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import useUsersapi from "../../Apis/GetUsersapi";
import { fetchLedgerDropdown } from "../../Apis/commanApi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import Pagination from "../../Pagination/Pagination";
import CustomDatePicker from "../../components/common/CustomDatepicker";
import { useDisclosure } from "@chakra-ui/react";
import CanclePartyTransactionModal from "../../components/models/CancelPartyTransactionModal";

const TRANSACTION_TYPES = [
  "PURCHASE",
  "SALES",
  "CREDIT_NOTE",
  "DEBIT_NOTE",
  "RECEIPT",
  "PAYMENT",
  "JOURNAL",
  "CONTRA",
];

function PartyTransactionReport() {
  const { users } = useUsersapi();

  const [ledgers, setLedgers] = useState([]);
  const [bills, setBills] = useState([]);

  const [formData, setFormData] = useState({
    transaction_type: "",
    employee_id: "",
    ledger_id: "",
    voucher_no: "",
    bill_id: "",
    startDate: null,
    endDate: null,
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [reportData, setReportData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load party (ledger) dropdown once on mount
  useEffect(() => {
    const loadLedgers = async () => {
      const data = await fetchLedgerDropdown();
      setLedgers(data);
    };
    loadLedgers();
  }, []);

  // Load "Choose Bill" dropdown whenever transaction_type or ledger_id changes
  useEffect(() => {
    const loadBills = async () => {
      if (!formData.transaction_type || !formData.ledger_id) {
        setBills([]);
        return;
      }
      try {
        const response = await API.get(API_ENDPOINTS.GET_PARTYTRANSACTION_BILLS, {
          params: {
            transaction_type: formData.transaction_type,
            ledger_id: formData.ledger_id,
          },
        });
        setBills(response?.data?.data || []);
      } catch (err) {
        console.log(err, "Error in fetching bill dropdown!");
        setBills([]);
      }
    };
    loadBills();
  }, [formData.transaction_type, formData.ledger_id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset dependent "Choose Bill" selection when transaction/party changes
      ...(field === "transaction_type" || field === "ledger_id"
        ? { bill_id: "" }
        : {}),
    }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchPartyTransactionReport = async (pageToFetch = 1, limitToUse = limit) => {
    if (!formData.ledger_id) {
      setError("Please select a party.");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError("Please select both From Date and To Date.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await API.get(API_ENDPOINTS.GET_PARTY_TRANSACTION_REPORT, {
        params: {
          transaction_type: formData.transaction_type || undefined,
          employee_id: formData.employee_id || undefined,
          ledger_id: formData.ledger_id,
          voucher_no: formData.voucher_no || undefined,
          bill_id: formData.bill_id || undefined,
          from_date: formatDate(formData.startDate),
          to_date: formatDate(formData.endDate),
          page: pageToFetch,
          limit: limitToUse,
        },
      });

      const result = response?.data?.data;

      setReportData(result?.rows || []);
      setTotalItems(result?.totalRecords || 0);
      setTotalPages(result?.totalPages || 0);
      setPage(result?.currentPage || pageToFetch);
      setGrandTotal(Number(result?.grandTotal || 0));
    } catch (err) {
      console.log(err, "Error in fetching API response!");
      setError("Failed to fetch transaction report.");
      setReportData([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPartyTransactionReport(1, limit);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPartyTransactionReport(newPage, limit);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    fetchPartyTransactionReport(1, newLimit);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
const [selectedRow, setSelectedRow] = useState(null);

const handleDeleteClick = (row) => {
  setSelectedRow(row);
  onOpen();
};

const handleDeleteSuccess = () => {
  fetchPartyTransactionReport(page, limit); // refresh current page
};

  return (
    <Box>
      {/* Form Card */}
      <Box bg="white" p={6} borderRadius="md" border="1px solid" borderColor="gray.300">

        <CanclePartyTransactionModal
  isOpen={isOpen}
  onClose={onClose}
  transactionType={selectedRow?.transaction_type}
  referenceId={selectedRow?.reference_id}
  onSuccess={handleDeleteSuccess}
/>


        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl isRequired>
            <FormLabel>Select Transaction</FormLabel>
            <Select
              placeholder="--Please Select--"
              value={formData.transaction_type}
              onChange={(e) => handleChange("transaction_type", e.target.value)}
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Select Bills Under Employee</FormLabel>
            <Select
              placeholder="--Please Select--"
              value={formData.employee_id}
              onChange={(e) => handleChange("employee_id", e.target.value)}
            >
              {users?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Select Party</FormLabel>
            <Select
              placeholder="--Please Select--"
              value={formData.ledger_id}
              onChange={(e) => handleChange("ledger_id", e.target.value)}
            >
              {ledgers?.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.ledger_name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Enter Voucher No</FormLabel>
            <Input
              placeholder="Voucher Number"
              value={formData.voucher_no}
              onChange={(e) => handleChange("voucher_no", e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Choose Bill</FormLabel>
            <Select
              placeholder="No Bills"
              value={formData.bill_id}
              onChange={(e) => handleChange("bill_id", e.target.value)}
              isDisabled={!bills.length}
            >
              {bills.map((bill) => (
                <option key={bill.id} value={bill.id}>
                  {bill.reference_no || bill.linked_bill_id}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <SimpleGrid columns={2} spacing={4}>
              <CustomDatePicker
                label="From Date"
                name="startDate"
                value={formData.startDate}
                onChange={(date) => handleChange("startDate", date)}
              />
              <CustomDatePicker
                label="To Date"
                name="endDate"
                value={formData.endDate}
                onChange={(date) => handleChange("endDate", date)}
              />
            </SimpleGrid>
          </FormControl>
        </SimpleGrid>

        {error && (
          <Text color="red.500" mt={3} fontSize="sm">
            {error}
          </Text>
        )}

        {/* Search Button */}
        <Box textAlign="right" mt={6}>
          <Button colorScheme="blue" onClick={handleSearch} isLoading={loading} fontWeight="500" fontSize="14px">
            Search
          </Button>
        </Box>
      </Box>

      {/* Results Table */}
      <Box bg="white" mt={10}>
        <Heading fontSize="18px" mb={4}>
          Transaction Report
        </Heading>

        {loading ? (
          <Center py={10}>
            <Spinner size="lg" color="blue.500" />
          </Center>
        ) : (
          <>
            <TableContainer borderRadius="8px">
              <Table size="sm" variant="simple" className="productsTable" borderRadius="8px">
                <Thead bg="#ecf1f1">
                  <Tr>
                    <Th>Bill Date</Th>
                    <Th>Ledger Name</Th>
                    <Th>Under Emp</Th>
                    <Th>Txn Type</Th>
                    <Th>Sub Ledger</Th>
                    <Th>Voucher No</Th>
                    <Th>Type of Ref</Th>
                    <Th>Bill Used</Th>
                    <Th isNumeric>Bill Amount</Th>
                    <Th isNumeric>Bill Due Amount</Th>
                    <Th>Entry Type</Th>
                    <Th>Action</Th>
                    {/* <Th>Sales Bill</Th> */}
                  </Tr>
                </Thead>
                <Tbody fontSize="10px">
                  {reportData.length === 0 ? (
                    <Tr>
                      <Td colSpan={11}>
                        <Center py={6}>
                          <Text color="gray.500">No records found</Text>
                        </Center>
                      </Td>
                    </Tr>
                  ) : (
                    <>
                      <Tr bg="gray.50" fontWeight="bold">
                        <Td></Td>
                        <Td></Td>
                        <Td></Td>
                        <Td></Td>
                        <Td></Td>
                        <Td></Td>
                        <Td></Td>
                        <Td color="red.500" textAlign="right"> Tota Amount </Td>
                        <Td isNumeric> {grandTotal.toFixed(2)} </Td>
                        <Td></Td>
                        <Td></Td>
                      </Tr>

                      {reportData.map((row) => (
                        <Tr key={row.id}>
                          <Td> {row.bill_date ? formatDate(row.bill_date) : ""} </Td>
                          <Td>{row.ledger_name}</Td>
                          <Td> {row.employee_name || "-"} </Td>
                          <Td>{row.transaction_type}</Td>
                          <Td>{row.sub_ledger}</Td>
                          <Td>{row.voucher_no}</Td>
                          <Td>{row.reference_type}</Td>
                          <Td>{row.bill_used}</Td>
                          <Td isNumeric> {Number(row.bill_amount).toFixed(2)} </Td>
                          <Td isNumeric> {Number(row.bill_due_amount).toFixed(2)} </Td>
                          <Td>{row.entry_type}</Td>
                          <Td>
  <Button size="xs" colorScheme="red" onClick={() => handleDeleteClick(row)}>
    Delete
  </Button>
</Td>
                        </Tr>
                      ))}
                    </>
                  )}
                </Tbody>
              </Table>
            </TableContainer>

            {reportData.length > 0 && (
              <Pagination
                page={page}
                limit={limit}
                totalItems={totalItems}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default PartyTransactionReport;