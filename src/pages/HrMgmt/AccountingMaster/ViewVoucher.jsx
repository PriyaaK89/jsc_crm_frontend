import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Text,
  Select,
  Badge,
  Spinner,
  InputGroup,
  InputLeftElement,
  Tooltip,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { SearchIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DeleteVoucherModal from "../../../components/models/DeleteVoucherModal";

const ViewLedger = () => {
  const [voucherList, setVoucherList] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState();

  const {isOpen: deleteModelIsOpen, onOpen: deleteModelOnOpen, onClose: deleteModalOnClose} = useDisclosure();

  const navigate = useNavigate();

  const getVoucherList = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS.GET_VOUCHER_LIST}?page=${currentPage}&per_page=${perPage}&search=${search}`
      );

      if (response?.status === 200) {
        setVoucherList(response?.data?.data || []);
        setCurrentPage(response?.data?.current_page || 1);
        setPerPage(response?.data?.per_page || 10);
        setTotalPages(response?.data?.total_pages || 1);
        setTotalRecords(response?.data?.total_records || 0);
      }
    } catch (error) {
      console.log(error, "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getVoucherList();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, perPage, search]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB");
  };

  const handleDelete = (id)=>{
    setSelectedId(id);
    deleteModelOnOpen();
  }

  return (
    <Box   bg="white"
        mt={{ base: 2, md: 5 }}
        px={{ base: 3, md: 6 }}
        py={{ base: 3, md: 5 }}
        borderRadius="16px"
        boxShadow="sm">
      {/* Breadcrumb */}
      <HStack justifyContent="space-between" mb={4}>
        <Breadcrumb color="#8B8D97">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
              isCurrentPage
              color="#8B8D97"
              fontSize="13px"
            >
              View Voucher
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* Heading */}
      <Heading size="md" mb={6}>
        View Voucher
      </Heading>

      {/* Search + Per Page */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={5}
        gap={4}
        flexWrap="wrap"
      >
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>

          <Input
            placeholder="Search voucher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </InputGroup>

        <HStack>
          <Text fontSize="14px">Show</Text>

          <Select
            w="90px"
            value={perPage}
            onChange={(e) => {
              setPerPage(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>

          <Text fontSize="14px">Entries</Text>
        </HStack>
      </Flex>

      {/* Table */}
      <Box
        border="1px solid #E2E8F0"
        borderRadius="lg"
        overflowX="auto"
      >
        <Table variant="simple" className="productsTable">
          <Thead bg="#F9FAFB">
            <Tr>
              <Th>S.NO</Th>
              <Th>Voucher Name</Th>
              <Th>Voucher Type</Th>
              <Th>Numbering Method</Th>
              {/* <Th>Prefix</Th> */}
              {/* <Th>Suffix</Th> */}
              {/* <Th>Starting No.</Th> */}
              {/* <Th>Decimal Digit</Th> */}
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>

          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={11} textAlign="center" py={10}>
                  <Spinner size="lg" />
                </Td>
              </Tr>
            ) : voucherList?.length > 0 ? (
              voucherList?.map((item, index) => (
                <Tr key={item?.id}>
                  <Td>
                    {(currentPage - 1) * perPage + index + 1}
                  </Td>

                  <Td fontWeight="500">
                    {item?.voucher_name || "-"}
                  </Td>

                  <Td>{item?.voucher_type || "-"}</Td>

                  <Td>{item?.numbering_method || "-"}</Td>

                  {/* <Td>{item?.prefix || "-"}</Td> */}

                  {/* <Td>{item?.suffix || "-"}</Td> */}

                  {/* <Td>{item?.starting_number || "-"}</Td> */}

                  {/* <Td>{item?.decimal_digit || "-"}</Td> */}

                  <Td>{formatDate(item?.voucher_start_date)}</Td>

                  <Td>{formatDate(item?.voucher_end_date)}</Td>

                  <Td>
                    <Badge
                      colorScheme={
                        item?.status === "ACTIVE"
                          ? "green"
                          : "red"
                      }
                      borderRadius="md"
                      px={2}
                      py={1}
                    >
                      {item?.status}
                    </Badge>
                  </Td>

                  <Td>
                    <Flex gap="8px">
                      <Tooltip label="Edit Group" hasArrow>
                        <IconButton
                          icon={<FiEdit2 />}
                          size="md"
                          variant="ghost"
                          color="blue.600"
                          _hover={{ bg: "blue.50" }}
                          aria-label="Edit Group"
                          onClick={() =>
                            navigate(`/accounting-master/edit-voucher/${item.id}`)
                          } />
                      </Tooltip>

                      <Tooltip label="Delete Group" hasArrow>
                        <IconButton
                          icon={<FiTrash2 />}
                          size="md"
                          variant="ghost"
                          color="red.600"
                          _hover={{ bg: "red.50" }}
                          aria-label="Delete Group"
                          onClick={() => handleDelete(item?.id)}
                        />
                      </Tooltip>
                    </Flex>

                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={11} textAlign="center" py={10}>
                  No Data Found
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mt={5}
        flexWrap="wrap"
        gap={4}
      >
        <Text fontSize="14px" color="gray.600">
          Showing{" "}
          <strong>
            {voucherList?.length > 0
              ? (currentPage - 1) * perPage + 1
              : 0}
          </strong>{" "}
          to{" "}
          <strong>
            {(currentPage - 1) * perPage + voucherList?.length}
          </strong>{" "}
          of <strong>{totalRecords}</strong> entries
        </Text>

        <HStack>
          <Button
            size="sm"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>

          <Text fontSize="14px">
            Page {currentPage} of {totalPages}
          </Text>

          <Button
            size="sm"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </HStack>
      </Flex>

      <DeleteVoucherModal deleteModelIsOpen={deleteModelIsOpen} deleteModelOnClose={deleteModalOnClose} selectedId={selectedId} getVoucherList={getVoucherList}/>
    </Box>
  );
};

export default ViewLedger;