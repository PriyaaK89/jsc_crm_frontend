import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  Spinner,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

import { Link } from "react-router-dom";

import { GoHomeFill } from "react-icons/go";
import VoucherActionModal from "../../components/models/VoucherActionModal";



const VoucherListByType = () => {
  const toast = useToast();

  const [voucherType, setVoucherType] = useState([]);

  const [selectedVoucherType, setSelectedVoucherType] = useState("");

  const [list, setList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // ================= GET DROPDOWN =================

  const getVoucherTypeDropdown = async () => {
    try {
      const response = await API.get(
        API_ENDPOINTS.GET_VOUCHER_TYPE_DROPDOWN
      );

      if (response?.status === 200) {
        setVoucherType(response?.data?.data || []);
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to load voucher dropdown",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ================= GET VOUCHER LIST =================

  const getVocherBySelectedType = async () => {
    try {
      if (!selectedVoucherType) {
        toast({
          title: "Warning",
          description: "Please select voucher type",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      setLoading(true);

      const response = await API.get(
        `${API_ENDPOINTS.GET_VOUCHER_LIST_BY_TYPE}?voucher_type=${selectedVoucherType}`
      );

      if (response?.status === 200) {
        setList(response?.data?.data || []);
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to load voucher list",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN MODAL =================

  const openActivateModal = (id) => {
    setSelectedVoucherId(id);
    setIsModalOpen(true);
  };

  // ================= CLOSE MODAL =================

  const closeActivateModal = () => {
    setSelectedVoucherId(null);
    setIsModalOpen(false);
  };

  // ================= ACTIVATE VOUCHER =================

  const activateVoucher = async () => {
    try {
      setActionLoading(true);

      const response = await API.put(
        `${API_ENDPOINTS.UPDATE_VOUCHER_STATUS}/${selectedVoucherId}`
      );

      if (response?.status === 200) {
        toast({
          title: "Success",
          description: response?.data?.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        closeActivateModal();

        // REFRESH TABLE
        getVocherBySelectedType();
      }
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to activate voucher",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    getVoucherTypeDropdown();
  }, []);

  return (
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 5 }}
      borderRadius="16px"
      boxShadow="sm"
    >
      {/* ================= BREADCRUMB ================= */}

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

      {/* ================= FILTER SECTION ================= */}

      <Box
        border="1px solid #E2E8F0"
        borderRadius="8px"
        p={5}
        bg="white"
        mb={6}
      >

        <Flex gap={5} alignItems="end">
          <FormControl>
            <FormLabel>Select Voucher</FormLabel>

            <Select
              placeholder="Select Voucher Type"
              value={selectedVoucherType}
              onChange={(e) =>
                setSelectedVoucherType(e.target.value)
              }
            >
              {voucherType?.map((item, index) => (
                <option
                  key={index}
                  value={item?.voucher_type}
                >
                  {item?.voucher_type}
                </option>
              ))}
            </Select>
          </FormControl>

          <Button
            bg="#237086"
            fontWeight="500" fontSize="14px"
            color="white"
            _hover={{
              bg: "#1B5A6B"
            }}
            px={8}
            borderRadius="12px"
            onClick={getVocherBySelectedType}
          >
            Load Voucher
          </Button>
        </Flex>
      </Box>

      {/* ================= TABLE SECTION ================= */}

      <Box py={5} bg="white">
        <Heading fontSize="17px" mb={3} ml={2.5} color='#4d4d4d'>
          Voucher List
        </Heading>

        {loading ? (
          <Flex justifyContent="center" py={10}>
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Box overflowX="auto" borderRadius="12px" shadow='sm' border='1px solid #d7d7d7'>
            <Table variant="simple" className="productsTable">
              <Thead bg="#e8ecef;" height='48px !important' borderBottom="1px solid #d7d7d7">
                <Tr>
                  <Th>Voucher Name</Th>
                  <Th>Voucher Type</Th>
                  <Th>Prefix</Th>
                  <Th>Suffix</Th>
                  <Th>Starting Number</Th>
                  <Th>Status</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                  <Th textAlign="center">Action</Th>
                </Tr>
              </Thead>

              <Tbody>
                {list?.length > 0 ? (
                  list?.map((item) => (
                    <Tr key={item?.id} fontSize="11px !important">
                      <Td >{item?.voucher_name}</Td>
                      <Td>{item?.voucher_type}</Td>
                      <Td>{item?.prefix || "-"}</Td>
                      <Td>{item?.suffix || "-"}</Td>
                      <Td>{item?.starting_number || "-"}</Td>

                      <Td>
                        <Text
                          color={
                            item?.status === "ACTIVE"
                              ? "green.500"
                              : "red.500"
                          }
                          fontWeight="bold"
                        >
                          {item?.status}
                        </Text>
                      </Td>

                      <Td> {item?.voucher_start_date ? new Date(item.voucher_start_date).toLocaleDateString("en-GB") : "-"} </Td>
                      <Td>{item?.voucher_end_date ? new Date(item.voucher_end_date).toLocaleDateString("en-GB") : "-"} </Td>

                      <Td textAlign="center">
                        {item?.status === "ACTIVE" ? (
                          <Button
                            fontSize="13px"
                            colorScheme="green" fontWeight="500"
                            isDisabled height="30px"
                          >
                            ACTIVE
                          </Button>
                        ) : (
                          <Button
                            fontSize="13px" height="30px"
                            colorScheme="blue" fontWeight="500"
                            onClick={() => openActivateModal(item?.id) } >
                            ACTIVATE
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={9} textAlign="center">
                      No Data Found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* ================= MODAL ================= */}

      <VoucherActionModal
        isOpen={isModalOpen}
        onClose={closeActivateModal}
        onConfirm={activateVoucher}
        loading={actionLoading}
      />
    </Box>
  );
};

export default VoucherListByType;