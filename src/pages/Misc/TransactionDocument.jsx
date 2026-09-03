import React, { useState, useCallback } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, FormControl,
  FormLabel, Input, Select, SimpleGrid, Text, Table, Thead, Tbody, Tr, Th,
  Td, TableContainer, IconButton, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, Image, HStack, Flex, Spinner,
  Alert, AlertIcon, useDisclosure, useToast,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { FiFileText } from "react-icons/fi";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import Pagination from "../../Pagination/Pagination";

const TRANSACTION_TYPES = [
  "Sales", "Purchase", "Credit Note", "Debit Note", "Journal", "Receipt", "Payment",
];

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

const EXPORT_PAGE_SIZE = 500;

function TransactionDocReport() {
  const toast = useToast();

  // filter box state
  const [transactionType, setTransactionType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(toInputDate(new Date()));

  // last-searched filters actually sent to the API
  const [appliedFilters, setAppliedFilters] = useState(null);

  // results state (current page only)
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // table-level controls
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // export state
  const [exportingType, setExportingType] = useState(null);

  // doc preview modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);

  const fetchDocuments = useCallback(
    async (filters, pageToLoad, limitToLoad, searchTerm) => {
      if (!filters) return;

      setLoading(true);
      setError("");

      try {
        const response = await API.get(API_ENDPOINTS.GET_TRANSACTION_REPORT_IMAGES,
          {
            params: {
              transaction_type: filters.transactionType,
              from_date: filters.fromDate,
              to_date: filters.toDate,
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
            page: pageToLoad, limit: limitToLoad, total: 0, total_pages: 0,
          },
        );
      } catch (err) {
        console.log(err, "Error in fetching API response.");
        setEntries([]);
        setPagination({ page: 1, limit: limitToLoad, total: 0, total_pages: 0 });
        setError(
          err?.response?.data?.message ||
          "Could not load transaction documents. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Pulls every matching row for export, looping pages
  const fetchAllDocumentsForExport = useCallback(async (filters, searchTerm) => {
    if (!filters) return [];

    let allEntries = [];
    let currentPage = 1;
    let totalPages = 1;
    const MAX_PAGES = 1000;

    do {
      const response = await API.get(
        API_ENDPOINTS.GET_TRANSACTION_REPORT_IMAGES,
        {
          params: {
            transaction_type: filters.transactionType,
            from_date: filters.fromDate,
            to_date: filters.toDate,
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

      if (pageEntries.length === 0) break;
      currentPage += 1;
    } while (currentPage <= totalPages && currentPage <= MAX_PAGES);

    return allEntries;
  }, []);

  const handleSearch = () => {
    if (!transactionType) {
      toast({ title: "Please select a transaction type", status: "warning", duration: 2500 });
      return;
    }
    if (!fromDate || !toDate) {
      toast({ title: "Please select both From and To dates", status: "warning", duration: 2500 });
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast({ title: "From Date cannot be after To Date", status: "warning", duration: 2500 });
      return;
    }

    const filters = { transactionType, fromDate, toDate };
    setAppliedFilters(filters);
    setTableSearch("");
    fetchDocuments(filters, 1, pageSize, "");
  };

  // debounced table search
  React.useEffect(() => {
    if (!appliedFilters) return;
    const timer = setTimeout(() => {
      fetchDocuments(appliedFilters, 1, pageSize, tableSearch);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSearch]);

  // page size change
  React.useEffect(() => {
    if (!appliedFilters) return;
    fetchDocuments(appliedFilters, 1, pageSize, tableSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > (pagination.total_pages || 1)) return;
    fetchDocuments(appliedFilters, newPage, pageSize, tableSearch);
  };

  const openDocPreview = (url) => {
    if (!url) return;
    setSelectedDocUrl(url);
    onOpen();
  };

  /* ---------------- Export helpers ---------------- */

const buildRows = (sourceEntries) =>
  sourceEntries.map((e, idx) => ({
    sno: idx + 1,
    transactionNo: e.transaction_no,
    date: formatDisplayDate(e.transaction_date),
    billTUrl: e.bill_t_doc || null,
    dispatchUrl: e.dispatch_doc || null,
    othersUrl: e.others || null,
  }));

// Plain label used everywhere except Excel hyperlinks
const docLabel = (url) => (url ? "View" : "-");

  const withFullExportData = async (type, exportFn) => {
    if (!appliedFilters) return;

    setExportingType(type);
    try {
      const allEntries = await fetchAllDocumentsForExport(appliedFilters, tableSearch);
      if (!allEntries.length) {
        toast({ title: "No data to export", status: "info", duration: 2000 });
        return;
      }
      await exportFn(buildRows(allEntries));
    } catch (err) {
      console.log(err, "Error fetching full data for export.");
      toast({ title: "Could not load full data for export", status: "error", duration: 2500 });
    } finally {
      setExportingType(null);
    }
  };

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

const handleCopy = () =>
  withFullExportData("copy", async (rows) => {
    const title = "CRM-Report";
    const header = ["Transaction No", "Transaction Date", "Bill-T Doc", "Dispatch Doc", "Others"].join("\t");
    const body = rows
      .map((r) =>
        [r.transactionNo, r.date, docLabel(r.billTUrl), docLabel(r.dispatchUrl), docLabel(r.othersUrl)].join("\t"),
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(`${title}\n\n${header}\n${body}`);
      toast({ title: "Copied to clipboard", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Copy failed", status: "error", duration: 2000 });
    }
  });

const handleCsv = () =>
  withFullExportData("csv", (rows) => {
    const header = ["S.No", "Transaction No", "Date", "Bill-T Doc", "Dispatch Doc", "Others"].join(",");
    const body = rows
      .map((r) =>
        [
          r.sno,
          r.transactionNo,
          r.date,
          docLabel(r.billTUrl),
          docLabel(r.dispatchUrl),
          docLabel(r.othersUrl),
        ].join(","),
      )
      .join("\n");

    downloadBlob(`${header}\n${body}`, "transaction-documents.csv", "text/csv");
  });

// Excel is the one format that CAN show a real clickable link, using the
// =HYPERLINK() formula. Excel evaluates leading "=" in a cell even when the
// file is really tab-delimited text saved with an .xls extension.
const handleExcel = () =>
  withFullExportData("excel", (rows) => {
    const header = ["S.No", "Transaction No", "Date", "Bill-T Doc", "Dispatch Doc", "Others"].join("\t");
    const body = rows
      .map((r) =>
        [
          r.sno,
          r.transactionNo,
          r.date,
          docLabel(r.billTUrl),
          docLabel(r.dispatchUrl),
          docLabel(r.othersUrl),
        ].join("\t"),
      )
      .join("\n");

    downloadBlob(`${header}\n${body}`, "transaction-documents.xls", "application/vnd.ms-excel");
  });

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
              <th style="border:1px solid #ccc;padding:6px;">Transaction No</th>
              <th style="border:1px solid #ccc;padding:6px;">Date</th>
              <th style="border:1px solid #ccc;padding:6px;">Bill-T Doc</th>
              <th style="border:1px solid #ccc;padding:6px;">Dispatch Doc</th>
              <th style="border:1px solid #ccc;padding:6px;">Others</th>
            </tr>
          </thead>
        `;

        const tbodyRows = rows
          .map(
            (r) => `
              <tr>
                <td style="border:1px solid #ccc;padding:6px;">${r.sno}</td>
                <td style="border:1px solid #ccc;padding:6px;">${r.transactionNo}</td>
                <td style="border:1px solid #ccc;padding:6px;">${r.date}</td>
                <td style="border:1px solid #ccc;padding:6px;">${docLabel(r.billTUrl) === "View" ? "Available" : "-"}</td>
                <td style="border:1px solid #ccc;padding:6px;">${docLabel(r.dispatchUrl) === "View" ? "Available" : "-"}</td>
                <td style="border:1px solid #ccc;padding:6px;">${docLabel(r.othersUrl) === "View" ? "Available" : "-"}</td>
              </tr>
            `,
          )
          .join("");

        table.innerHTML = `${theadHtml}<tbody>${tbodyRows}</tbody>`;
        container.appendChild(table);

        await html2pdf().set({ filename: "transaction-documents.pdf", margin: 10 }).from(container).save();
      } catch (err) {
        console.log(err, "PDF export failed.");
        toast({ title: "PDF export failed", status: "error", duration: 2000 });
      }
    });

  /* -------------------------------------------------- */

  const renderDocCell = (url) => {
    if (!url) return <Text fontSize="sm" color="gray.400">—</Text>;
    return (
      <IconButton
        aria-label="View document"
        icon={<FiFileText />}
        size="sm"
        onClick={() => openDocPreview(url)}
      />
    );
  };

  return (
    <Box>
   

      {/* Filter Card */}
      <Box bg="white" mb={8} border="1px" borderColor="gray.300" p={4} borderRadius="8px">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <FormControl isRequired>
            <FormLabel>Select Transaction Type</FormLabel>
            <Select
              placeholder="--Please Select--"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>From Date</FormLabel>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>To Date</FormLabel>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </FormControl>
        </SimpleGrid>

        <Box textAlign="right" mt={6}>
          <Button colorScheme="blue" fontSize="12px" fontWeight="500" height="36px" boxShadow="md" onClick={handleSearch} isLoading={loading}>
            SHOW
          </Button>
        </Box>
      </Box>

      {/* Results */}
      {appliedFilters && (
        <Box>
          <Text fontWeight="semibold" mb={3}>
            Report — {appliedFilters.transactionType}
          </Text>

          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={3} mb={3}>
            <HStack spacing={2}>
              <Select size="sm" w="auto" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>Show {n} rows</option>
                ))}
              </Select>

              <Button size="sm" onClick={handleCopy}
                isDisabled={pagination.total === 0 || (exportingType !== null && exportingType !== "copy")}
                isLoading={exportingType === "copy"}>
                COPY
              </Button>
              <Button size="sm" onClick={handlePdf}
                isDisabled={pagination.total === 0 || (exportingType !== null && exportingType !== "pdf")}
                isLoading={exportingType === "pdf"}>
                PDF
              </Button>
              <Button size="sm" onClick={handleCsv}
                isDisabled={pagination.total === 0 || (exportingType !== null && exportingType !== "csv")}
                isLoading={exportingType === "csv"}>
                CSV
              </Button>
              <Button size="sm" onClick={handleExcel}
                isDisabled={pagination.total === 0 || (exportingType !== null && exportingType !== "excel")}
                isLoading={exportingType === "excel"}>
                EXCEL
              </Button>
            </HStack>

            <Input
              size="sm"
              w={{ base: "full", md: "250px" }}
              placeholder="Search transaction no..."
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

          <TableContainer border="1px solid" borderColor="gray.100" borderRadius="md">
            <Table size="sm" className="productsTable">
              <Thead bg="gray.50">
                <Tr>
                  <Th>S.No</Th>
                  <Th>Transaction No</Th>
                  <Th>Transaction Date</Th>
                  <Th>Bill-T Doc</Th>
                  <Th>Dispatch Doc</Th>
                  <Th>Others</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8}>
                      <Spinner size="sm" mr={2} /> Loading...
                    </Td>
                  </Tr>
                ) : entries.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8} color="gray.500">
                      No transaction documents found for the selected filters.
                    </Td>
                  </Tr>
                ) : (
                  entries.map((entry, idx) => (
                    <Tr key={`${entry.transaction_no}-${idx}`}>
                      <Td>{(pagination.page - 1) * pagination.limit + idx + 1}</Td>
                      <Td>{entry.transaction_no}</Td>
                      <Td>{formatDisplayDate(entry.transaction_date)}</Td>
                      <Td>{renderDocCell(entry.bill_t_doc)}</Td>
                      <Td>{renderDocCell(entry.dispatch_doc)}</Td>
                      <Td>{renderDocCell(entry.others)}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>

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

      {/* Document preview modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader padding="1rem 1rem" bg="#d7e5e8" fontSize="14px" fontWeight="600" color="#4d4d4d" borderRadius="6px 6px 0px 0px">Document Preview</ModalHeader>
          <ModalCloseButton colorScheme="red" top={0} right={0} fontSize="10px" />
          <ModalBody pb={6}>
            {selectedDocUrl ? (
              <Image src={selectedDocUrl}
                alt="Transaction document"
                w="100%"
                objectFit="contain"
                fallback={<Text color="gray.500">Could not load document</Text>} />
            ) : (
              <Text color="gray.500">No document available</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default TransactionDocReport;