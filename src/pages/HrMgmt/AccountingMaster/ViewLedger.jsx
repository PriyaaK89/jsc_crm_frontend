import {
  Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, FormControl, FormLabel, Heading, HStack, IconButton, Input, Select, Spinner, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr, useDisclosure, useToast,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";

import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DeleteLedgerModal from "../../../components/models/DeleteLedgerModal";

function ViewLedger() {

  const toast = useToast();
  const navigate = useNavigate()

  // ==============================
  // STATES
  // ==============================
  const [ledgerList, setLedgerList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState();
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure();

  // Search
  const [search, setSearch] = useState("");

  const getLedgerList = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: perPage,
        search: search,
      });

      const response = await API.get(
        `${API_ENDPOINTS?.get_ledger}?${queryParams.toString()}`
      );
      if (response?.status === 200) {
        const responseData = response?.data;
        setLedgerList(responseData?.data || []);
        setCurrentPage(responseData?.pagination?.current_page || 1);
        setPerPage(responseData?.pagination?.per_page || 10);
        setTotalPages(responseData?.pagination?.total_pages || 1);
        setTotalRecords(responseData?.pagination?.total_records || 0);
      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch ledger list",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getLedgerList();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, perPage, search]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const formatNumber = (number) => {
    if (number === null || number === undefined) return "0";
    return Number(number).toLocaleString("en-IN");
  };

  const handleDelete = (id)=>{
    setSelectedId(id);
    onDeleteModalOpen();
  }

  return (
    <>

      <Box
        bg="white"
        mt={{ base: 2, md: 5 }}
        px={{ base: 3, md: 6 }}
        py={{ base: 3, md: 5 }}
        borderRadius="16px"
        boxShadow="sm"
      >

        <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4} mb={6} >
          <Box>
            <Breadcrumb color="#8B8D97" mb={1}>

              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/dashboard">
                  <GoHomeFill color="#5570F1" />
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem>
                <BreadcrumbLink
                  isCurrentPage
                  color="#8B8D97"
                  fontSize="13px" >
                  View Ledger
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading size="md" color="#1A202C" > Ledger List </Heading>

          </Box>
        </Flex>


        <Flex gap={4} mb={6} flexWrap="wrap" alignItems="end" justifyContent="space-between" >
          <FormControl maxW="300px">
            {/* <FormLabel fontSize="13px"> Search Ledger </FormLabel> */}
            <Input placeholder="Search by ledger name" value={search} onChange={(e) => setSearch(e.target.value)} bg="white" />
          </FormControl>

          <Text
            fontSize="14px"
            color="gray.500"
            fontWeight="600"
          >
            Total Records : {totalRecords}
          </Text>
        </Flex>

        {loading ? (

          <Flex justifyContent="center" alignItems="center" minH="350px">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <>
            <TableContainer border="1px solid #E2E8F0" borderRadius="14px" overflowX="auto">
              <Table variant="simple" size="sm" className="productsTable">
                <Thead bg="#F8FAFC">
                  <Tr>
                    <Th>S.No</Th>
                    <Th>Ledger</Th>
                    <Th>Group</Th>
                    <Th>Balance</Th>
                    <Th>Opening Balance</Th>
                    <Th>Credit Limit</Th>
                    <Th>Customer</Th>
                    <Th>Firm</Th>
                    <Th>Phone</Th>
                    <Th>Location</Th>
                    {/* <Th>Landmark</Th> */}
                    <Th>Bank</Th>
                    <Th>GST No</Th>
                    <Th>Interest Rate</Th>
                    <Th>Created Date</Th>
                    <Th>Actions</Th>

                  </Tr>

                </Thead>

                <Tbody>
                  {ledgerList?.length > 0 ? ( ledgerList?.map((item, index) => (

                      <Tr key={item?.id} _hover={{ bg: "gray.50", }} >
                      <Td fontWeight="600"> {(currentPage - 1) * perPage + index + 1} </Td>

                        {/* Ledger */}
                        <Td minW="220px">

                          <Box>
                            <Text fontWeight="700" color="#1A202C" > {item?.ledger_name || "-"} </Text>
                            <Text fontSize="11px" color="gray.500" > ID : {item?.id} </Text>
                          </Box>

                        </Td>

                        {/* Group */}
                        <Td>
                          <Badge colorScheme="blue" className="ledger_badge"> {item?.group?.name || "-"} </Badge>
                        </Td>

                        {/* Balance Type */}
                        <Td>

                          <Badge className="ledger_badge"
                            colorScheme={ item?.basic_details?.balance_type === "Dr" ? "green" : "red" } >
                            {item?.basic_details?.balance_type || "-"}
                          </Badge>

                        </Td>

                        {/* Opening Balance */}
                        <Td>₹{" "} {formatNumber( item?.basic_details?.opening_balance)}</Td>

                        {/* Credit Limit */}
                        <Td>  ₹{" "}  {formatNumber( item?.credit_details?.credit_limit )}</Td>

                        {/* Customer */}
                        <Td minW="180px">
                          <Box>
                            <Text fontWeight="600"> {item?.crm_details?.customer_name || "-"} </Text>
                            <Text fontSize="11px" color="gray.500"> DOB :{" "} {formatDate(item?.crm_details?.customer_dob )} </Text>
                          </Box>
                        </Td>

                        {/* Firm */}
                        <Td minW="220px">
                          <Box>
                            <Text fontWeight="600"> {item?.crm_details?.firm_details ?.firm_name || "-"} </Text>
                            <Text fontSize="11px" color="gray.500" > {item?.crm_details?.firm_details ?.firm_email || "-"} </Text>
                          </Box>
                        </Td>


                        <Td> {item?.crm_details?.contact || "-"} </Td>

                        {/* Location */}
                        <Td minW="220px">
                          <Box>
                            <Text> {item?.crm_details?.address_details?.address || "-"} </Text>
                            <Text fontSize="11px" color="gray.500" >
                              {item?.crm_details?.address_details?.state || "-"},{" "}
                              {item?.crm_details?.address_details?.district || "-"},{" "}
                              {item?.crm_details?.address_details?.tehsil || "-"},{" "}
                              {item?.crm_details?.address_details?.pincode || "-"}
                            </Text>
                          </Box>
                        </Td>
                        {/* <Td><Text textTransform="capitalize">{item?.crm_details?.address_details?.landmark}</Text></Td> */}

                        {/* Bank */}
                        <Td minW="220px">
                          <Box>
                            <Text fontWeight="600"> {item?.crm_details?.bank_details?.bank_name || "-"} </Text>
                            <Text fontSize="11px" color="gray.500" > A/C :{" "}{item?.crm_details?.bank_details?.bank_acc_number || "-"} </Text>
                            <Text fontSize="11px" color="gray.500" > IFSC :{" "} {item?.crm_details?.bank_details?.bank_ifsc || "-"} </Text>
                          </Box>
                        </Td>

                        <Td> {item?.tax_details?.gst_no || "-"} </Td>
                        <Td> {item?.interest_configs?.[0]?.rate ?? 0}%</Td> 

                        {/* Created Date */}
                        <Td>
                          {formatDate(item?.created_at)}
                        </Td>
                        <Td> <Flex gap="8px">
                          <Tooltip label="Edit Ledger" hasArrow>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="md"
                              variant="ghost"
                              color="blue.600"
                              _hover={{ bg: "blue.50" }}
                              aria-label="Edit Ledger"
                              onClick={() =>
                                navigate(`/accounting-master/edit-ledger/${item?.id}`)
                              } />
                          </Tooltip>

                          <Tooltip label="Delete Ledger" hasArrow>
                            <IconButton
                              icon={<FiTrash2 />}
                              size="md"
                              variant="ghost"
                              color="red.600"
                              _hover={{ bg: "red.50" }}
                              aria-label="Delete Ledger"
                              onClick={() => handleDelete(item?.id)}
                            />
                          </Tooltip>
                        </Flex></Td>

                      </Tr>

                    ))

                  ) : (

                    <Tr>

                      <Td
                        colSpan={14}
                        textAlign="center"
                        py={10}
                      >
                        No Ledger Found
                      </Td>

                    </Tr>

                  )}

                </Tbody>

              </Table>

            </TableContainer>

            <Flex
              justifyContent="space-between"
              alignItems="center"
              mt={6}
              flexWrap="wrap"
              gap={4}
            >
              <HStack w="80%">
                <FormControl maxW="120px">

                  <Select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </Select>

                </FormControl>

                <Text
                  fontSize="14px"
                  color="gray.600"
                  fontWeight="500" >
                  Showing Page {currentPage} of {totalPages}
                </Text>
              </HStack>
              <HStack>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => prev - 1)
                  }
                  isDisabled={currentPage === 1}
                >
                  Previous
                </Button>

                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() =>
                    setCurrentPage((prev) => prev + 1)
                  }
                  isDisabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          </>
        )}
        <DeleteLedgerModal isDeleteModalOpen={isDeleteModalOpen} onDeleteModalClose={onDeleteModalClose} selectedId={selectedId} getLedgerList={getLedgerList}/>
      </Box>
    </>
  );
}

export default ViewLedger;