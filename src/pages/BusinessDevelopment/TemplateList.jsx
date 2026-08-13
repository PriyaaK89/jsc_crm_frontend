import {
  Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, FormControl, HStack, Heading, IconButton, Input, Select, Spinner,
  Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr, useDisclosure, useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiXCircle, FiPlay, FiPause } from "react-icons/fi"; // add FiRefreshCw to existing import

import TemplateFormModal from "../../components/models/visit/CreateVisitTemplate";
import DeleteTemplateModal from "../../components/layout/BusinessDevelopment/DeleteTemplateModal";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import ReactivateTemplateModal from "../../components/models/visit/ReactivateTemplate";
import PermanentDeleteTemplateModal from "../../components/layout/BusinessDevelopment/PermanentDeleteTemplateModal";
import HoldUnholdTemplateModal from "../../components/layout/BusinessDevelopment/HoldUnholdTemplateModal ";


const TemplateList = () => {
  const toast = useToast();

  const [templateList, setTemplateList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [frequency, setFrequency] = useState("");
  const [holdAction, setHoldAction] = useState("hold"); // "hold" | "unhold"
  const { isOpen: isHoldOpen, onOpen: onHoldOpen, onClose: onHoldClose } = useDisclosure()

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isReactivateOpen, onOpen: onReactivateOpen, onClose: onReactivateClose } = useDisclosure();
  const { isOpen: isPermanentDeleteOpen, onOpen: onPermanentDeleteOpen, onClose: onPermanentDeleteClose } = useDisclosure();


  // ==============================
  // API CALLS
  const getTemplateList = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: perPage,
        search,
        status,
        frequency,
      });

      const response = await API.get(`${API_ENDPOINTS?.GET_TEMPLATES}?${queryParams.toString()}`);

      if (response?.status === 200) {
        setTemplateList(response?.data?.data || []);
        setTotalRecords(response?.data?.pagination?.total || 0);
        setTotalPages(
          Math.max(Math.ceil((response?.data?.pagination?.total || 0) / perPage), 1)
        );
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch templates",
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
      getTemplateList();
    }, 500);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, search, status, frequency]);

  const handleCreate = () => {
    setSelectedId(null);
    onFormOpen();
  };

  const handleEdit = (id) => {
    setSelectedId(id);
    onFormOpen();
  };

  const handleDelete = (id) => {
    setSelectedId(id);
    onDeleteOpen();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const handleReactivate = (id) => {
    setSelectedId(id);
    onReactivateOpen();
  };

  const handleHoldClick = (id) => {
    setSelectedId(id);
    setHoldAction("hold");
    onHoldOpen();
  };

  const handleUnholdClick = (id) => {
    setSelectedId(id);
    setHoldAction("unhold");
    onHoldOpen();
  };

  const handlePermanentDelete = (id) => {
    setSelectedId(id);
    onPermanentDeleteOpen(); // new useDisclosure, see below — needs its own confirm modal
  };

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 5 }}
      borderRadius="16px"
      boxShadow="sm"
    >
      <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4} mb={6}>
        <Box>
          <Breadcrumb color="#8B8D97" mb={1}>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px">
                Visit Target Templates
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Heading size="md" color="#1A202C"> Target Templates </Heading>
        </Box>

        <Button leftIcon={<FiPlus />} colorScheme="blue" fontSize="14px" fontWeight="500" onClick={handleCreate}> Create Target </Button>
      </Flex>

      <Flex gap={4} mb={6} flexWrap="wrap" alignItems="end" justifyContent="space-between">
        <Flex gap={1} flexWrap="wrap" width="70%">
          <FormControl maxW="260px">
            <Input
              placeholder="Search by template name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="white"
            />
          </FormControl>

          <FormControl maxW="150px">
            <Select
              placeholder="All status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="HOLD">On Hold</option>

            </Select>
          </FormControl>

          <FormControl maxW="160px">
            <Select
              placeholder="All frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="FORTNIGHT">Fortnightly</option>
              <option value="MONTHLY">Monthly</option>
            </Select>
          </FormControl>
        </Flex>

        <Text fontSize="14px" color="gray.500" fontWeight="600">
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
                  <Th>Template</Th>
                  <Th>Frequency</Th>
                  <Th>Recurring</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                  <Th>Employees</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>

              <Tbody>
                {templateList?.length > 0 ? (
                  templateList.map((item, index) => (
                    <Tr key={item?.id} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="600">{(currentPage - 1) * perPage + index + 1}</Td>

                      <Td minW="200px">
                        <Text fontWeight="700" color="#1A202C"> {item?.template_name || "-"} </Text>
                        <Text fontSize="12px" color="gray.500"> ID : {item?.id} </Text>
                      </Td>

                      <Td> <Badge colorScheme="purple" className="ledger_badge"> {item?.frequency || "-"} </Badge></Td>
                      <Td>{item?.is_recurring ? "Yes" : "No"}</Td>
                      <Td>{formatDate(item?.start_date)}</Td>
                      <Td>{formatDate(item?.end_date)}</Td>
                      <Td>{item?.employee_count ?? 0}</Td>

                      <Td>
                        <Badge colorScheme={item?.status === "ACTIVE" ? "green" : item?.status === "HOLD" ? "orange" : "gray"} className="ledger_badge" >
                          {item?.status || "-"}
                        </Badge>
                      </Td>

                      <Td>
                        <Flex gap="8px">
                          <Tooltip label="Edit Template" hasArrow>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="md"
                              variant="ghost"
                              color="blue.600"
                              _hover={{ bg: "blue.50" }}
                              aria-label="Edit Template"
                              onClick={() => handleEdit(item?.id)}
                            />
                          </Tooltip>

                          {item?.status === "ACTIVE" && (
                            <>
                              <Tooltip label="Hold Template" hasArrow>
                                <IconButton
                                  icon={<FiPause />}
                                  size="md"
                                  variant="ghost"
                                  color="orange.500"
                                  _hover={{ bg: "orange.50" }}
                                  aria-label="Hold Template"
                                  onClick={() => handleHoldClick(item?.id)}
                                />
                              </Tooltip>
                              <Tooltip label="Deactivate Template" hasArrow>
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="md"
                                  variant="ghost"
                                  color="red.600"
                                  _hover={{ bg: "red.50" }}
                                  aria-label="Deactivate Template"
                                  onClick={() => handleDelete(item?.id)}
                                />
                              </Tooltip>
                               <Tooltip label="Delete Permanently" hasArrow>
                                <IconButton
                                  icon={<FiXCircle />}
                                  size="md"
                                  variant="ghost"
                                  color="red.700"
                                  _hover={{ bg: "red.100" }}
                                  aria-label="Delete Permanently"
                                  onClick={() => handlePermanentDelete(item?.id)}
                                />
                              </Tooltip>
                            </>
                          )}

                          {item?.status === "HOLD" && (
                            <>
                              <Tooltip label="Resume Template" hasArrow>
                                <IconButton
                                  icon={<FiPlay />}
                                  size="md"
                                  variant="ghost"
                                  color="green.600"
                                  _hover={{ bg: "green.50" }}
                                  aria-label="Resume Template"
                                  onClick={() => handleUnholdClick(item?.id)}
                                />
                              </Tooltip>
                              <Tooltip label="Deactivate Template" hasArrow>
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="md"
                                  variant="ghost"
                                  color="red.600"
                                  _hover={{ bg: "red.50" }}
                                  aria-label="Deactivate Template"
                                  onClick={() => handleDelete(item?.id)}
                                />
                              </Tooltip>
                              <Tooltip label="Delete Permanently" hasArrow>
                                <IconButton
                                  icon={<FiXCircle />}
                                  size="md"
                                  variant="ghost"
                                  color="red.700"
                                  _hover={{ bg: "red.100" }}
                                  aria-label="Delete Permanently"
                                  onClick={() => handlePermanentDelete(item?.id)}
                                />
                              </Tooltip>
                            </>
                          )}

                          {item?.status === "INACTIVE" && (
                            <>
                              <Tooltip label="Reactivate Template" hasArrow>
                                <IconButton
                                  icon={<FiRefreshCw />}
                                  size="md"
                                  variant="ghost"
                                  color="green.600"
                                  _hover={{ bg: "green.50" }}
                                  aria-label="Reactivate Template"
                                  onClick={() => handleReactivate(item?.id)}
                                />
                              </Tooltip>
                              <Tooltip label="Delete Permanently" hasArrow>
                                <IconButton
                                  icon={<FiXCircle />}
                                  size="md"
                                  variant="ghost"
                                  color="red.700"
                                  _hover={{ bg: "red.100" }}
                                  aria-label="Delete Permanently"
                                  onClick={() => handlePermanentDelete(item?.id)}
                                />
                              </Tooltip>
                            </>
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py={10}> No Templates Found </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>

          <Flex justifyContent="space-between" alignItems="center" mt={6} flexWrap="wrap" gap={4}>
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

              <Text fontSize="14px" color="gray.600" fontWeight="500">
                Showing Page {currentPage} of {totalPages}
              </Text>
            </HStack>

            <HStack>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                isDisabled={currentPage === 1}>
                Previous
              </Button>

              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                isDisabled={currentPage === totalPages}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}

      <TemplateFormModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        templateId={selectedId}
        onSuccess={getTemplateList}
      />

      <DeleteTemplateModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        templateId={selectedId}
        onSuccess={getTemplateList}
      />
      <ReactivateTemplateModal
        isOpen={isReactivateOpen}
        onClose={onReactivateClose}
        templateId={selectedId}
        onSuccess={getTemplateList}
      />

      <PermanentDeleteTemplateModal
        isOpen={isPermanentDeleteOpen}
        onClose={onPermanentDeleteClose}
        templateId={selectedId}
        onSuccess={getTemplateList}
      />
      <HoldUnholdTemplateModal
        isOpen={isHoldOpen}
        onClose={onHoldClose}
        templateId={selectedId}
        action={holdAction}
        onSuccess={getTemplateList}
      />
    </Box>
  );
}

export default TemplateList;