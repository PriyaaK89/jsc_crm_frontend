import React, { useEffect, useState } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Button, FormControl, FormLabel, Heading,
  Input, Select, HStack, SimpleGrid, InputGroup,
  InputRightElement, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalCloseButton, useDisclosure,
  Table, Thead, Tbody, Tr, Th, Td, Img,
  Flex, Spinner, Text,
  TableContainer, Image,
  VStack
} from "@chakra-ui/react";
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

function EmployeeVisitReport() {

  // const { users } = useUsersapi();

  const [visits, setVisits] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  //   const [city, setCity] = useState([]);
  // const [cityLoading, setCityLoading] = useState(false);
  // const [cityFetched, setCityFetched] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [issOpen, setIssOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [filters, setFilters] = useState({
    user_id: "",
    district: "",
    from_date: "",
    to_date: "",
    visit_type:"",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_pages: 1,
  });

  //  Fetch API
  const fetchVisits = async (targetPage = pagination.page) => {
    setLoading(true);

    try {
      const res = await API.get(API_ENDPOINTS.get_emp_visit_report, {
        params: {
          search: debouncedSearch || null,
          from_date: filters.from_date || null,
          to_date: filters.to_date || null,
          page: targetPage,
          limit: pagination?.limit,
        },
      });

      //  Validate response
      if (res.status === 200 ) {
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];

// console.log("FULL RESPONSE:", res.data);  yha tak thik h 
        setVisits(data);
        // console.log("API Response Data:", data);

       setPagination((prev) => ({ 
  ...prev,
  page: res.data.page || targetPage,
   total_pages: res.data.totalPages || 1,
}));

      } else {
        console.warn("Unexpected API response:", res);
        setVisits([]);
      }

    } catch (error) {
      console.error("Fetch Visits Error:", error);

      //  Optional: show user-friendly error
      setVisits([]);

    } finally {
      setLoading(false);
    }
  };

  // On Load
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch, filters.from_date, filters.to_date]);


  useEffect(() => {
    fetchVisits(pagination.page);
  }, [pagination.page, debouncedSearch, filters.from_date, filters.to_date, filters.visit_type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // featch city 
  //  const Getcity = async () => {
  //   if (cityFetched) return; //  already fetched → skip API

  //   setCityLoading(true);
  //   try {
  //     const res = await API.get(API_ENDPOINTS.get_city);

  //     if (res.data.success) {
  //       setCity(res.data.districts || []);
  //       setCityFetched(true); // mark as fetched
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setCityLoading(false);
  //   }
  // };
  //  memoize the city 
  // const memoCity = React.useMemo(() => {
  //   return [...city].sort((a, b) =>
  //     a.district.localeCompare(b.district)
  //   );
  // }, [city]);


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
    "pincode": "160px",
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
      visit_type:"",
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

 const handlePageChange = (newPage) => {
  if (loading) return; // block if already loading

  if (newPage >= 1 && newPage <= pagination.total_pages) {
    setPagination(prev => ({ ...prev, page: newPage }));
  }
};

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
    >
      {/*  Header */}

      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">
            <GoHomeFill color="#5570F1" size={20} />
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>View Visit Report</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>


      <Heading size="md" mb={6}>
        View Visit Report
      </Heading>




      {/*  Filters */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>

        {/* <FormControl>
          <FormLabel>Select Employee</FormLabel>
          <Select
            placeholder=" Select Employee"
            value={filters.userId}
            onChange={(e) =>
              setFilters({ ...filters, userId: e.target.value })
            }
          >
            {users?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </Select>
        </FormControl> */}

        {/* <FormControl>
  <FormLabel>Select District</FormLabel>

  <Select
    placeholder=" Select District"
    value={filters.city}
    onFocus={Getcity} // 🔥 call only once
    onChange={(e) =>
      setFilters({ ...filters, city: e.target.value })
    }
  >
    {cityLoading ? (
      <option>Loading districts...</option>
    ) : (
      memoCity.map((item, index) => (
        <option key={index} value={item.district}>
          {item.district}
        </option>
      ))
    )}
  </Select>
</FormControl> */}

        <FormControl mt={5}>
          {/* <FormLabel>Search Employee / District / Mobile</FormLabel> */}

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

        <FormControl mt={{ base: "", md: 5 }}>

          <Button onClick={handleRefresh} leftIcon={<RepeatIcon />} >Reset</Button>
        </FormControl>

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
              <Table variant="striped" size="sm" minW={{ base: "2000px", md: "2900px" }} overflow="auto">

                <Thead>
                  <Tr>
                    {["Ser.No.",
                      "Employee",
                      "Visit type",
                      "Visit Purpose",
                      "comment",
                      "Reminder Date",
                      "Visit Date",
                      "Customer Name",
                      "Firm Name",
                      "Firm Address",
                      "Contact No.",
                      "Address",
                      "Area.",
                      "District",
                      "pincode.",
                      "Image",
                    ].map((h) => (
                      <Th key={h} fontSize='14px' fontWeight='500' color='#2C2D33' textTransform='capitalize'
                        width={tablehead[h] || "100px"} >

                        <Flex gap={2} pt={3} pb={3} spacing="300px">
                          <Text fontSize='14px' color='#2C2D33' fontWeight='400' textTransform='capitalize' fontFamily='InterRegular' overflow="hidden" >{h}</Text>

                          <Img src={sort_icon} />
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
                    visits.map((item, i) => (
                      <Tr key={item.id}>
                        <Td>{i + 1}</Td>
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
                              onClick={() => modelviewimg(item.image_url)}
                            >
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
     <HStack justify="end" mt={4}>
        <Button
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          isDisabled={pagination.page === 1 || loading}
        >
          Prev
        </Button>

        <Text fontWeight="bold">
        {pagination.page} / {pagination.total_pages}
        </Text>

      <Button
  size="sm"
  onClick={() => handlePageChange(pagination.page + 1)}
  isDisabled={
    pagination.page === pagination.total_pages || loading
  }
>
  Next
</Button>
      </HStack>

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
          <Flex
            justify="space-between"
            align="center"
            px={5}
            pb={4}
          >
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
          <Flex
            bg="blue.500"
            color="white"
            px={4}
            py={3}
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontWeight="bold">Image Preview</Text>

            <ModalCloseButton position="static" color="white" />
          </Flex>

          {/* Body */}
          <ModalBody p={4}>
            {selectedImage ? (
              <Img
                src={selectedImage}
                alt="Preview"
                w="100%"
                maxH="80vh"
                objectFit="contain"
                borderRadius="lg"
              />
            ) : (
              <Flex justify="center" align="center" h="200px">
                <Text color="gray.400">No Image Available</Text>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* main box  */}
    </Box>



  );
}

export default EmployeeVisitReport;