import React, { useEffect, useState } from "react";
import { Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, HStack, Input,
  InputGroup, InputLeftElement, Select, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, VStack, TableContainer, IconButton, useDisclosure, Center,} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import MobileTopbar from "../../components/layout/MobileTopbar";
import NotificationBtn from "../../components/NotificationBtn/NotificationBtn";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import EditEmpIndividualTargetModal from "../../components/models/EditEmpIndividualTarget";
import DeleteEmployeeTarget from "../../components/models/DeleteEmpIndividualTarget";

const ViewEmployeeTargets = () => {

  // ================= STATES =================
  const [empTarget, setEmpTarget] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const [selectedId, setSelectedId] = useState(null);



  // ================= EDIT MODAL =================
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();



  // ================= DELETE MODAL =================
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();




  // ================= GET TARGETS =================
  const getEmployeeTargets = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS.get_individual_targets}?page=${page}&limit=${limit}&search=${search}`
      );

      setEmpTarget(response?.data?.data || []);

      setTotalPages(response?.data?.totalPages || 1);

    } catch (error) {

      console.log(error, "Error");

    } finally {

      setLoading(false);
    }
  };



  // ================= USE EFFECT =================
  useEffect(() => {

    const delayDebounce = setTimeout(() => {
      getEmployeeTargets();
    }, 500);

    return () => clearTimeout(delayDebounce);

  }, [page, limit, search]);



  // ================= EDIT HANDLER =================
  const handleEdit = (id) => {

    setSelectedId(id);

    onEditModalOpen();
  };



  // ================= DELETE HANDLER =================
  const handleDelete = (id) => {

    setSelectedId(id);

    onDeleteModalOpen();
  };



  return (
    <>
      <Box bg="#F4F6F9" minH="100vh">

        <Box display={{ base: "none", md: "block" }}>
          <Sidebar />
        </Box>

        <Box display={{ base: "none", md: "block" }}>
          <Topbar />
        </Box>

        <Box display={{ base: "block", md: "none" }}>
          <MobileTopbar />
        </Box>

        <Box
          ml={{ base: 4, md: "295px" }}
          mr={{ base: 4, md: 5 }}
          pt="5rem"
          pb={6}
        >

          <NotificationBtn />

          <Box
            bg="white"
            mt={{ base: 2, md: 5 }}
            px={{ base: 3, md: 6 }}
            py={{ base: 3, md: 4 }}
            borderRadius="lg"
            boxShadow="md"
          >

            {/* ================= BREADCRUMB ================= */}

            <HStack justifyContent="space-between">

              <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">

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
                    View Target List
                  </BreadcrumbLink>

                </BreadcrumbItem>

              </Breadcrumb>

            </HStack>



            {/* ================= SEARCH ================= */}

            <HStack
              justifyContent="space-between"
              mb={4}
              alignItems="end"
              flexDirection={{ base: "column", md: "row" }}
            >

              <Text
                fontSize={{ base: "15px", md: "16px" }}
                fontWeight="600"
                color="gray.700"
              >
                Employee Target List
              </Text>

              <Flex
                gap={3}
                flexDirection={{ base: "column", md: "row" }}
                w={{ base: "100%", md: "auto" }}
              >

                <InputGroup maxW={{ base: "100%", md: "320px" }}>

                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>

                  <Input
                    placeholder="Search role, type, duration..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    bg="gray.50"
                    border="1px solid #E2E8F0"
                    _focus={{
                      borderColor: "#3182CE",
                      boxShadow: "0 0 0 1px #3182CE",
                    }}
                  />

                </InputGroup>

              </Flex>

            </HStack>



            {/* ================= TABLE ================= */}

            <TableContainer border="1px solid #E2E8F0" borderRadius="lg">

              <Table variant="simple" className="productsTable">

                <Thead bg="gray.50">

                  <Tr>
                    <Th>ID</Th>
                    <Th>Role</Th>
                    <Th>Target Type</Th>
                    <Th>Duration</Th>
                    <Th>Start Date</Th>
                    <Th>End Date</Th>
                    <Th isNumeric>Target</Th>
                    <Th isNumeric>Achieved</Th>
                    <Th isNumeric>Pending</Th>
                    <Th textAlign="center">Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>

                  {loading ? (
                    <Tr>
                      <Td colSpan={11} py={10}>
                        <Center>
                          <Spinner size="lg" color="blue.500" />
                        </Center>
                      </Td>
                    </Tr>

                  ) : empTarget?.length > 0 ? (
                    empTarget?.map((item) => (

                      <Tr key={item?.id}>
                        <Td fontWeight="600">
                          #{item?.id}
                        </Td>
                        <Td> {item?.role || "-"} </Td>
                        <Td> {item?.target_type || "-"} </Td>
                        <Td> {item?.duration_type || "-"} </Td>
                        <Td> {item?.start_date?.split("T")[0]} </Td>

                        <Td>
                          {item?.end_date?.split("T")[0]}
                        </Td>

                        <Td isNumeric fontWeight="600">
                          ₹ {item?.target_amount}
                        </Td>

                        <Td isNumeric color="green.500" fontWeight="600">
                          ₹ {item?.achieved_amount}
                        </Td>

                        <Td isNumeric color="orange.500" fontWeight="600">
                          ₹ {item?.pending_amount}
                        </Td>

                     
                        {/* ================= ACTION BUTTONS ================= */}

                        <Td>

                          <HStack justifyContent="center">

                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleEdit(item?.id)}
                            />

                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(item?.id)}
                            />

                          </HStack>

                        </Td>

                      </Tr>
                    ))

                  ) : (

                    <Tr>

                      <Td colSpan={11} py={10}>

                        <Center>
                          <Text color="gray.500">
                            No Targets Found
                          </Text>
                        </Center>

                      </Td>

                    </Tr>

                  )}

                </Tbody>

              </Table>

            </TableContainer>



            {/* ================= PAGINATION ================= */}

            <Flex
              justify="space-between"
              align="center"
              mt={6}
              flexWrap="wrap"
              gap={4}
            >

              <HStack>

                <Select
                  w={{ base: "100%", md: "120px" }}
                  bg="gray.50"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >

                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>

                </Select>

                <Text
                  fontSize="14px"
                  color="gray.600"
                  fontWeight="500"
                >
                  Showing Page {page} of {totalPages}
                </Text>

              </HStack>



              <HStack spacing={3}>

                <Button
                  size="sm"
                  bg="gray.100"
                  _hover={{ bg: "gray.200" }}
                  onClick={() => setPage(page - 1)}
                  isDisabled={page === 1 || loading}
                >
                  Previous
                </Button>

                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => setPage(page + 1)}
                  isDisabled={page === totalPages || loading}
                >
                  Next
                </Button>

              </HStack>

            </Flex>

          </Box>

        </Box>



        {/* ================= EDIT MODAL ================= */}

        <EditEmpIndividualTargetModal
          isEditModalOpen={isEditModalOpen}
          onEditModalClose={onEditModalClose}
          selectedId={selectedId}
          getEmployeeTargets={getEmployeeTargets}
        />



        {/* ================= DELETE MODAL ================= */}

        <DeleteEmployeeTarget
          isDeleteModalOpen={isDeleteModalOpen}
          onDeleteModalClose={onDeleteModalClose}
          selectedId={selectedId}
          getEmployeeTargets={getEmployeeTargets}
        />

      </Box>
    </>
  );
};

export default ViewEmployeeTargets;