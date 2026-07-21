import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  HStack,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { FiFileText } from "react-icons/fi";
import { Link } from "react-router-dom";
import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import Pagination from "../../Pagination/Pagination";

// Backend enum values -> display labels (and back)
const EXPENSE_TYPE_OPTIONS = [
  { value: "HOTEL", label: "Hotel Expense" },
  { value: "BUS_TRAIN_TOLL", label: "Bus/Train/Toll Expense" },
  { value: "PETROL_DIESEL", label: "Petrol/Diesel Expense" },
  { value: "OTHER", label: "Other Expense" },
];

const typeLabel = (value) =>
  EXPENSE_TYPE_OPTIONS.find((t) => t.value === value)?.label || value || "-";

const formatDisplayDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const toInputDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// How many rows to ask for per request when pulling the FULL result set
// for exports. Kept separate from the on-screen page size.
const EXPORT_PAGE_SIZE = 500;

function GetEmpExpenseReport() {
  const { users } = useUsersapi();
  const toast = useToast();
  const tableRef = useRef(null);

  // filter box state
  const [employeeId, setEmployeeId] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(toInputDate(new Date()));

  // last-searched filters actually sent to the API — kept separate from
  // the live form fields so typing in the filter box doesn't refetch
  // until Search is clicked
  const [appliedFilters, setAppliedFilters] = useState(null);

  // results state (this is ONLY ever the current page — never used for exports)
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // table-level controls
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // export state — tracks WHICH export is currently running ("copy" |
  // "pdf" | "csv" | "excel" | null) so only the clicked button shows a
  // spinner instead of all four lighting up together
  const [exportingType, setExportingType] = useState(null);

  // bill preview modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBillUrl, setSelectedBillUrl] = useState(null);

  const fetchExpenses = useCallback(
    async (filters, pageToLoad, limitToLoad, searchTerm) => {
      if (!filters) return;

      setLoading(true);
      setError("");

      try {
        const response = await API.get(
          API_ENDPOINTS.get_employee_expense_by_date,
          {
            params: {
              employee_id: filters.employeeId,
              expense_type: filters.expenseType || undefined,
              start_date: filters.startDate,
              end_date: filters.endDate,
              search: searchTerm || undefined,
              page: pageToLoad,
              limit: limitToLoad,
            },
          },
        );

        const data = response?.data?.data;
        setEntries(data?.entries || []);
        setPagination(
          data?.pagination || {
            page: pageToLoad,
            limit: limitToLoad,
            total: 0,
            total_pages: 0,
          },
        );
      } catch (err) {
        console.log(err, "Error in fetching API response.");
        setEntries([]);
        setPagination({
          page: 1,
          limit: limitToLoad,
          total: 0,
          total_pages: 0,
        });
        setError(
          err?.response?.data?.message ||
            "Could not load expense entries. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Pulls EVERY row that matches the current filters + table search,
  // ignoring on-screen pagination entirely. Loops pages using whatever
  // page size the backend actually honours, so it works even if the
  // server caps `limit` below EXPORT_PAGE_SIZE.
  const fetchAllExpensesForExport = useCallback(async (filters, searchTerm) => {
    if (!filters) return [];

    let allEntries = [];
    let currentPage = 1;
    let totalPages = 1;

    // Safety cap so a backend bug (e.g. total_pages never decreasing)
    // can't spin this into an infinite loop.
    const MAX_PAGES = 1000;

    do {
      const response = await API.get(
        API_ENDPOINTS.get_employee_expense_by_date,
        {
          params: {
            employee_id: filters.employeeId,
            expense_type: filters.expenseType || undefined,
            start_date: filters.startDate,
            end_date: filters.endDate,
            search: searchTerm || undefined,
            page: currentPage,
            limit: EXPORT_PAGE_SIZE,
          },
        },
      );

      const data = response?.data?.data;
      const pageEntries = data?.entries || [];
      allEntries = allEntries.concat(pageEntries);

      totalPages = data?.pagination?.total_pages || 1;

      // If the server ignored our limit and just returned everything on
      // page 1 (total_pages === 1), or returned nothing, stop here.
      if (pageEntries.length === 0) break;

      currentPage += 1;
    } while (currentPage <= totalPages && currentPage <= MAX_PAGES);

    return allEntries;
  }, []);

  // "Search" button — validates the filter box and kicks off page 1
  const handleSearch = () => {
    if (!employeeId) {
      toast({
        title: "Please select an employee",
        status: "warning",
        duration: 2500,
      });
      return;
    }
    if (!startDate || !endDate) {
      toast({
        title: "Please select both From and To dates",
        status: "warning",
        duration: 2500,
      });
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "From Date cannot be after To Date",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const filters = { employeeId, expenseType, startDate, endDate };
    setAppliedFilters(filters);
    setPage(1);
    setTableSearch("");
    fetchExpenses(filters, 1, pageSize, "");
  };

  // table search box — debounced, re-queries the server with the same filters
  useEffect(() => {
    if (!appliedFilters) return;

    const timer = setTimeout(() => {
      setPage(1);
      fetchExpenses(appliedFilters, 1, pageSize, tableSearch);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSearch]);

  // page size change
  useEffect(() => {
    if (!appliedFilters) return;
    setPage(1);
    fetchExpenses(appliedFilters, 1, pageSize, tableSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > (pagination.total_pages || 1)) return;
    setPage(newPage);
    fetchExpenses(appliedFilters, newPage, pageSize, tableSearch);
  };

  const openBillPreview = (billUrl) => {
    setSelectedBillUrl(billUrl);
    onOpen();
  };

  const selectedEmployeeName =
    users?.find((u) => String(u.id) === String(employeeId))?.name || "";

  /* ---------------- Export helpers ---------------- */

  // Now takes the row set explicitly instead of always reading the
  // paginated `entries` state, so the same builder works for both the
  // on-screen table logic (if ever needed) and full-data exports.
  const buildRows = (sourceEntries) =>
    sourceEntries.map((e, idx) => ({
      sno: idx + 1,
      empId: `EMP-${appliedFilters?.employeeId}`,
      date: formatDisplayDate(e.expense_date),
      type: typeLabel(e.expense_type),
      amount: Number(e.amount).toFixed(2),
    }));

  // Shared wrapper: fetches the full dataset once, shows a loading state
  // on the export buttons, handles empty/error cases, then hands the
  // rows off to whichever export function called it.
  const withFullExportData = async (type, exportFn) => {
    if (!appliedFilters) return;

    setExportingType(type);
    try {
      const allEntries = await fetchAllExpensesForExport(
        appliedFilters,
        tableSearch,
      );
      if (!allEntries.length) {
        toast({ title: "No data to export", status: "info", duration: 2000 });
        return;
      }
      await exportFn(buildRows(allEntries));
    } catch (err) {
      console.log(err, "Error fetching full data for export.");
      toast({
        title: "Could not load full data for export",
        status: "error",
        duration: 2500,
      });
    } finally {
      setExportingType(null);
    }
  };

  const handleCopy = () =>
    withFullExportData("copy", async (rows) => {
      const header = ["S.No", "EmpId", "Date", "Expense Type", "Amount"].join(
        "\t",
      );
      const body = rows
        .map((r) => [r.sno, r.empId, r.date, r.type, r.amount].join("\t"))
        .join("\n");

      try {
        await navigator.clipboard.writeText(`${header}\n${body}`);
        toast({
          title: "Copied to clipboard",
          status: "success",
          duration: 2000,
        });
      } catch {
        toast({ title: "Copy failed", status: "error", duration: 2000 });
      }
    });

  const downloadBlob = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCsv = () =>
    withFullExportData("csv", (rows) => {
      const header = ["S.No", "EmpId", "Date", "Expense Type", "Amount"].join(
        ",",
      );
      const body = rows
        .map((r) => [r.sno, r.empId, r.date, `"${r.type}"`, r.amount].join(","))
        .join("\n");

      downloadBlob(`${header}\n${body}`, "expense-report.csv", "text/csv");
    });

  const handleExcel = () =>
    withFullExportData("excel", (rows) => {
      // Simple, dependency-free Excel export: Excel opens CSV content fine
      // when given an .xls extension. For a true .xlsx with styling, swap
      // this for the `xlsx` (SheetJS) package already listed as available.
      const header = ["S.No", "EmpId", "Date", "Expense Type", "Amount"].join(
        "\t",
      );
      const body = rows
        .map((r) => [r.sno, r.empId, r.date, r.type, r.amount].join("\t"))
        .join("\n");

      downloadBlob(
        `${header}\n${body}`,
        "expense-report.xls",
        "application/vnd.ms-excel",
      );
    });

  // PDF export builds its own off-screen table from the full row set
  // instead of snapshotting the on-screen (paginated) tableRef, since the
  // visible table only ever has the current page's rows in the DOM.
  const handlePdf = () =>
    withFullExportData("pdf", async (rows) => {
      try {
        const html2pdf = (await import("html2pdf.js")).default;

        const container = document.createElement("div");
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";

        const theadHtml = `
          <thead>
            <tr>
              <th style="border:1px solid #ccc;padding:6px;">S.No</th>
              <th style="border:1px solid #ccc;padding:6px;">EmpId</th>
              <th style="border:1px solid #ccc;padding:6px;">Date</th>
              <th style="border:1px solid #ccc;padding:6px;">Expense Type</th>
              <th style="border:1px solid #ccc;padding:6px;">Amount</th>
            </tr>
          </thead>
        `;

        const tbodyRows = rows
          .map(
            (r) => `
              <tr>
                <td style="border:1px solid #ccc;padding:6px;">${r.sno}</td>
                <td style="border:1px solid #ccc;padding:6px;">${r.empId}</td>
                <td style="border:1px solid #ccc;padding:6px;">${r.date}</td>
                <td style="border:1px solid #ccc;padding:6px;">${r.type}</td>
                <td style="border:1px solid #ccc;padding:6px;text-align:right;">${r.amount}</td>
              </tr>
            `,
          )
          .join("");

        table.innerHTML = `${theadHtml}<tbody>${tbodyRows}</tbody>`;
        container.appendChild(table);

        await html2pdf()
          .set({ filename: "expense-report.pdf", margin: 10 })
          .from(container)
          .save();
      } catch (err) {
        console.log(err, "PDF export failed.");
        toast({ title: "PDF export failed", status: "error", duration: 2000 });
      }
    });

  /* -------------------------------------------------- */

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md">
      {/* Breadcrumb */}
      <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              {" "}
              <GoHomeFill color="#5570F1" />{" "}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink color="#8B8D97" fontSize="13px">
              {" "}
              Employee Expense Report{" "}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Text className="action_heading" mb={6} textAlign="center">
        Employee Expenses Report
      </Text>

      {/* Filter Card */}
      <Box bg="white" mb={8} border="1px" borderColor="gray.300" p={4} borderRadius="8px">
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <FormControl isRequired>
            <FormLabel>Employee Name</FormLabel>
            <Select
              placeholder="Please Select"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Expense Type</FormLabel>
            <Select
              placeholder="All types"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}>
              {EXPENSE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>From Date</FormLabel>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>To Date</FormLabel>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormControl>
        </SimpleGrid>

        <Box textAlign="right" mt={6}>
          <Button
            colorScheme="blue"
            fontSize="12px"
            fontWeight="500"
            height="36px"
            boxShadow="md"
            onClick={handleSearch}
            isLoading={loading}>
            SEARCH
          </Button>
        </Box>
      </Box>

      {/* Results */}
      {appliedFilters && (
        <Box>
          <Text fontWeight="semibold" mb={3}>
            Expense Report
            {selectedEmployeeName ? ` — ${selectedEmployeeName}` : ""}
          </Text>

          {/* Table toolbar */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={3}
            mb={3}>
            <HStack spacing={2}>
              <Select
                size="sm"
                w="auto"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}>
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    Show {n} rows
                  </option>
                ))}
              </Select>

              <Button
                size="sm"
                onClick={handleCopy}
                isDisabled={
                  pagination.total === 0 ||
                  (exportingType !== null && exportingType !== "copy")
                }
                isLoading={exportingType === "copy"}>
                COPY
              </Button>
              <Button
                size="sm"
                onClick={handlePdf}
                isDisabled={
                  pagination.total === 0 ||
                  (exportingType !== null && exportingType !== "pdf")
                }
                isLoading={exportingType === "pdf"}>
                PDF
              </Button>
              <Button
                size="sm"
                onClick={handleCsv}
                isDisabled={
                  pagination.total === 0 ||
                  (exportingType !== null && exportingType !== "csv")
                }
                isLoading={exportingType === "csv"}>
                CSV
              </Button>
              <Button
                size="sm"
                onClick={handleExcel}
                isDisabled={
                  pagination.total === 0 ||
                  (exportingType !== null && exportingType !== "excel")
                }
                isLoading={exportingType === "excel"}>
                EXCEL
              </Button>
            </HStack>

            <Input
              size="sm"
              w={{ base: "full", md: "250px" }}
              placeholder="Search remarks or type..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </Flex>

          {error && (
            <Alert status="error" mb={3} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <TableContainer
            border="1px solid"
            borderColor="gray.100"
            borderRadius="md">
            <Table size="sm" ref={tableRef} className="productsTable">
              <Thead bg="gray.50">
                <Tr>
                  <Th>S.No</Th>
                  <Th>EmpId</Th>
                  <Th>Date</Th>
                  <Th>Expense Type</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Status</Th>
                  <Th>Document</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={8}>
                      <Spinner size="sm" mr={2} /> Loading...
                    </Td>
                  </Tr>
                ) : entries.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                      No expense entries found for the selected filters.
                    </Td>
                  </Tr>
                ) : (
                  entries.map((entry, idx) => (
                    <Tr key={entry.id}>
                      <Td>
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </Td>
                      <Td color="blue.500">{`EMP-${appliedFilters.employeeId}`}</Td>
                      <Td>{formatDisplayDate(entry.expense_date)}</Td>
                      <Td>{typeLabel(entry.expense_type)}</Td>
                      <Td isNumeric>{Number(entry.amount).toFixed(2)}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            entry.hold_status === "HOLD" ? "red" : "green"
                          }
                          mr={1}>
                          {entry.hold_status === "HOLD" ? "HOLD" : "UNHOLD"}
                        </Badge>
                        {/* <Badge colorScheme={ entry.status === "APPROVED" ? "green" : entry.status === "REJECTED" ? "red" : "yellow"}> {entry.status}</Badge> */}
                      </Td>
                      <Td>
                        {entry.bill_url ? (
                          <IconButton
                            aria-label="View document"
                            icon={<FiFileText />}
                            size="sm"
                            onClick={() => openBillPreview(entry.bill_url)}
                          />
                        ) : (
                          <Text fontSize="sm" color="gray.400">
                            —
                          </Text>
                        )}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination.total > 0 && (
            <Pagination
              page={pagination.page}
              limit={pagination.limit}
              totalItems={pagination.total}
              totalPages={pagination.total_pages}
              onPageChange={goToPage}
              onLimitChange={setPageSize}
            />
          )}
        </Box>
      )}

      {/* Bill preview modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bill Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedBillUrl ? (
              <Image
                src={selectedBillUrl}
                alt="Expense bill"
                w="100%"
                objectFit="contain"
                fallback={<Text color="gray.500">Could not load document</Text>}
              />
            ) : (
              <Text color="gray.500">No document available</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default GetEmpExpenseReport;
