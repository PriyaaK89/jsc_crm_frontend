import React, { useEffect, useState } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, FormControl, FormLabel, Heading,
  Input, Select, HStack, SimpleGrid, InputGroup, InputRightElement, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, useDisclosure,
  Table, Thead, Tbody, Tr, Th, Td, Img, Flex, Spinner, Text, TableContainer, Image, VStack } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { ViewIcon } from "@chakra-ui/icons";
import { RepeatIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/react";
import sort_icon from "../../assets/sort.svg";
import { GoHomeFill } from "react-icons/go";
// import useUsersapi from "../../Apis/GetUsersapi";
import CustomDatePicker from "../../components/common/CustomDatepicker";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import Pagination from "../../Pagination/Pagination";
import useUsersapi from "../../Apis/GetUsersapi";
import { Link } from "react-router-dom";

function EmployeeVisitReport() {

  const { users } = useUsersapi();
  const [visits, setVisits] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [issOpen, setIssOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sortConfig, setSortConfig] = useState({
  key: "",
  direction: "asc",
});

  const [filters, setFilters] = useState({
    user_id: "",
    district: "",
    from_date: "",
    to_date: "",
    visit_type: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total_pages: 1,
    total: 0,
  });


  const handleSort = (key) => {
  let direction = "asc";

  if (
    sortConfig.key === key &&
    sortConfig.direction === "asc"
  ) {
    direction = "desc";
  }

  setSortConfig({
    key,
    direction,
  });
};

const sortedVisits = React.useMemo(() => {
  if (!sortConfig.key) return visits;

  return [...visits].sort((a, b) => {
    let first = a[sortConfig.key];
    let second = b[sortConfig.key];

    if (first === null || first === undefined) first = "";
    if (second === null || second === undefined) second = "";

    if (typeof first === "string") first = first.toLowerCase();
    if (typeof second === "string") second = second.toLowerCase();

    if (first < second) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }

    if (first > second) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }

    return 0;
  });
}, [visits, sortConfig]);

const columns = [
  { label: "Ser.No.", key: null },
  { label: "Employee", key: "emp_name" },
  { label: "Visit type", key: "visit_type" },
  { label: "Visit Purpose", key: "visit_purpose" },
  { label: "comment", key: "comment" },
  { label: "Reminder Date", key: "reminder_date" },
  { label: "Visit Date", key: "created_at" },
  { label: "Customer Name", key: "customer_name" },
  { label: "Firm Name", key: "firm_name" },
  { label: "Firm Address", key: "firm_address" },
  { label: "Contact No.", key: "contact_number" },
  { label: "Address", key: "address" },
  { label: "Area.", key: "area" },
  { label: "District", key: "district" },
  { label: "pincode.", key: "pincode" },
  { label: "Image", key: null },
];
  //  Fetch API
  // const fetchVisits = async (targetPage = pagination.page) => {
  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await API.get(API_ENDPOINTS.get_emp_visit_report, {
        params: {
          page: pagination.page,
          search: debouncedSearch || null,
          from_date: filters.from_date || null,
          to_date: filters.to_date || null,
          limit: pagination?.limit,
          user_id: filters.user_id || null,
        },
      });
      if (res.status === 200) {
        setVisits(res.data.data);
        setPagination({
          page: res.data.page,
          limit: res.data.limit,
          total_pages: res.data.totalPages,
          total: res.data.total
        })
      }
      else {
        console.warn("Unexpected API response:", res);
        setVisits([]);
      }
    } catch (error) {
      console.error("Fetch Visits Error:", error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  // On Load
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch, filters.from_date, filters.to_date,]);


  useEffect(() => {
    fetchVisits();
  }, [pagination.page, pagination.limit, debouncedSearch, filters.user_id, filters.from_date, filters.to_date, filters.visit_type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  //  Format Date
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };
  // table head width 
  const tablehead = {
    "Employee": "180px",
    "Visit type": "130px",
    "Visit Purpose": "160px",
    "Reminder Date": "160px",
    "Visit Date": "150px",
    "Customer Name": "190px",
    "Firm Name": "200px",
    "Firm Address": "350px",
    "Address": "280px",
    "Contact No.": "135px",
    "District": "150px",
    "pincode": "200px",
  };

  // refresh function 
  const handleRefresh = () => {
    setSearch("");
    setDebouncedSearch("");

    setFilters({
      user_id: "",
      district: "",
      from_date: "",
      to_date: "",
      visit_type: "",
    });

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));

    // fetchVisits(1); // if fatchuservisit karneg to pagination bhi page reload karega and ye bhi to load aayga to ak hi 
  };
  //  visit purpose response fix
  const visitPurposeMap = {
    sales_return: "Sales Return",
    new_dist_planning: "New Distributor Planning",
    collection: "Collection",
    follow_up: "Follow Up",
    meeting: "Meeting",
  };

  const formatVisitPurpose = (value) => {
    if (!value) return "-";

    return visitPurposeMap[value] ||
      value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };


  const modelviewimg = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  return (
    <Box >

      {/*  Filters */}
      <SimpleGrid columns={{ base: 1, md: 5 }} spacing={5} alignItems="end">
        <FormControl>
          <FormLabel>Select Employee</FormLabel>
          <Select
            placeholder=" Select Employee"
            value={filters.user_id}
            onChange={(e) =>
              setFilters({ ...filters, user_id: e.target.value })
            }
          >
            {users?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </Select>
        </FormControl>


        <FormControl >
          <FormLabel>Search By Name, Phone No</FormLabel>

          <InputGroup>
            <Input
              placeholder="Search by name, district, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              pr="40px"
            />

            <InputRightElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        {/* CustomDatePicker for from date */}
        <FormControl>
          <CustomDatePicker
            label="From Date"
            value={filters.from_date}
            onChange={(d) =>
              setFilters((p) => ({ ...p, from_date: d }))
            }

            placeholder="Select From Date"
          />
        </FormControl>


        <FormControl>
          <CustomDatePicker
            label="To Date"
            value={filters.to_date}
            onChange={(d) =>
              setFilters((p) => ({ ...p, to_date: d }))
            }

            placeholder="Select To Date"
          />
        </FormControl>
        <HStack mt={2} justifyContent="end"> <Button onClick={handleRefresh} leftIcon={<RepeatIcon />} fontSize="14px">Reset</Button> </HStack>

      </SimpleGrid>

      {/*  Table */}
      <Box mt={8} border="1px solid #e5e5e5" borderRadius="md" w="100%">

        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner />
          </Flex>
        ) : (
          <Box overflowX="auto">
            <TableContainer overflowX="auto" whiteSpace="nowrap" sx={{
              "&::-webkit-scrollbar": { width: "8px", height: '8px' },
              "&::-webkit-scrollbar-thumb": {
                width: "8px", backgroundColor: "#7A7A7A", borderRadius: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#E8E8E8", borderRadius: "4px",
              },
            }}>
              <Table variant="striped" size="sm" minW={{ base: "2000px", md: "2900px" }} overflow="auto" className="productsTable">

                <Thead>
                  <Tr>
                    {/* {["Ser.No.", "Employee", "Visit type", "Visit Purpose", "comment", "Reminder Date", "Visit Date", "Customer Name", "Firm Name", "Firm Address", "Contact No.", "Address", "Area.", "District", "pincode.", "Image",].map((h) => ( */}
                    {columns.map((col) => (
                     <Th
  key={col.label}
  width={tablehead[col.label] || "100px"}
>
  <Flex align="center" gap={2}>
    <Text>{col.label}</Text>

    {col.key && (
      <Img
        src={sort_icon}
        cursor="pointer"
        w="14px"
        onClick={() => handleSort(col.key)}
      />
    )}
  </Flex>
</Th>
                    ))}
                  </Tr>
                </Thead>

                <Tbody>
                  {visits.length === 0 ? (
                    <Tr>
                      <Td colSpan={9} textAlign="center" py={6}>
                        <Text color="gray.500">No Visit Data Found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    sortedVisits.map((item, index) => (
                      <Tr key={item.id}>
                        <Td>{(pagination.page - 1) * pagination.limit + index + 1}</Td>
                        <Td>{item.emp_name}</Td>
                        <Td>{item.visit_type}</Td>
                        {/* <Td>{item.visit_purpose}</Td> */}
                        <Td>
                          <Badge
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="13px"
                            fontWeight="400"
                            textTransform="capitalize"
                            colorScheme={
                              item.visit_purpose === "sales_return"
                                ? "red"
                                : item.visit_purpose === "collection"
                                  ? "green"
                                  : item.visit_purpose === "new_dist_planning"
                                    ? "purple"
                                    : item.visit_purpose === "sales_order"
                                      ? "blue"
                                      : "orange"
                            }
                          >
                            {formatVisitPurpose(item.visit_purpose)}
                          </Badge>
                        </Td>
                        <Td maxW="120px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" >
                          <Flex align="center" gap={2}>
                            <Text maxW="90px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap"
                            >
                              {item.comment || "-"}
                            </Text>

                            {item.comment && item.comment.length > 4 && (
                              <Button
                                size="xs"
                                onClick={() => {
                                  setSelectedComment(item.comment);
                                  setIssOpen(true);
                                }}
                              >
                                <ViewIcon />
                              </Button>
                            )}
                          </Flex>
                        </Td>
                        <Td>{formatDate(item.reminder_date)}</Td>
                        <Td> {formatDate(item.created_at)}</Td>
                        <Td>{item.customer_name}</Td>
                        <Td>{item.firm_name}</Td>
                        <Td>{item.firm_address}</Td>
                        <Td>{item.contact_number || "-"}</Td>
                        <Td>{item.address}</Td>
                        <Td>{item.area}</Td>
                        <Td>{item.district}</Td>
                        <Td>{item.pincode}</Td>
                        <Td>
                          {item.image_url ? (
                            <Button
                              colorScheme="blue"
                              size="sm"
                              onClick={() => modelviewimg(item.image_url)}>
                              View
                            </Button>
                          ) : (
                            "-"
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
      <Pagination
        page={pagination.page}
        limit={pagination.limit}
        totalItems={pagination.total}
        totalPages={pagination.total_pages}
        onPageChange={(newPage) => {
          setPagination((prev) => ({
            ...prev,
            page: newPage,
          }));
        }}
        onLimitChange={(newLimit) => {
          setPagination((prev) => ({
            ...prev,
            limit: newLimit,
            page: 1,
          }));
        }}
      />

      {/* model for comment  */}
      <Modal isOpen={issOpen} onClose={() => setIssOpen(false)} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(6px)" />

        <ModalContent borderRadius="2xl" p={2}>

          {/* Header */}
          <ModalHeader
            fontSize="18px"
            fontWeight="600"
            borderBottom="1px solid #eee"
            pb={3}
          >
            Comment Details
          </ModalHeader>

          <ModalCloseButton />

          {/* Body */}
          <ModalBody py={4}>
            <Box
              maxH="300px"
              overflowY="auto"
              p={4}
              borderRadius="lg"
              bg="#f9fafb"
              border="1px solid #e5e7eb"
              sx={{
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1c1c1",
                  borderRadius: "4px",
                },
              }}
            >
              <Text
                fontSize="14px"
                lineHeight="1.6"
                color="#2d3748"
                whiteSpace="pre-wrap"
              >
                {selectedComment}
              </Text>
            </Box>
          </ModalBody>

          {/* Footer */}
          <Flex justify="space-between" align="center" px={5} pb={4} >
            <Text fontSize="12px" color="gray.500">
              {selectedComment?.length || 0} characters
            </Text>

            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => {
                navigator.clipboard.writeText(selectedComment);
              }}
            >
              Copy
            </Button>
          </Flex>

        </ModalContent>
      </Modal>

      {/* second model for image show  */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />

        <ModalContent borderRadius="12px" mx="12px" overflow="hidden">
          {/* Header */}
          <Flex bg="blue.500" color="white" px={4} py={3} justifyContent="space-between" alignItems="center" >
            <Text fontWeight="bold">Image Preview</Text>
            <ModalCloseButton position="static" color="white" />
          </Flex>

          {/* Body */}
          <ModalBody p={4}>
            {selectedImage ? (
              <Img src={selectedImage} alt="Preview" w="100%" maxH="80vh" objectFit="contain" borderRadius="lg" />
            ) : (
              <Flex justify="center" align="center" h="200px">
                <Text color="gray.400">No Image Available</Text>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

    </Box>
  );
}

export default EmployeeVisitReport;