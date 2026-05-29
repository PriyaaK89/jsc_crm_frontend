import React, { useEffect, useState } from "react";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Text, Spinner, HStack, } from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

function ManuFacturingReport() {

  const [filterType, setFilterType] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedGodown, setSelectedGodown] = useState("");

  const [godown, setGodown] = useState([]);
  const [stockItem, setStockItem] = useState([]);

  const [mfgMaterial, setMfgMaterial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchStockItemDropdown = async () => {
    try {
      const response = await API.get(
        API_ENDPOINTS.GET_STOCK_ITEM_DROPDOWN
      );
      if (response?.status === 200) {
        setStockItem(response?.data?.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGodownList = async () => {
    try {
      const response = await API.get(API_ENDPOINTS.godown_list);
      if (response?.status === 200) {
        setGodown(response?.data?.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMfgMaterialReport = async (currentPage = 1, searchText = search) => {
    try {
      setLoading(true);

      let params = {
        filter_type:
          filterType === "item-wise"
            ? "ITEM_WISE"
            : "GODOWN_WISE",

        page: currentPage,
        limit,
        search: searchText,
      };

      if (filterType === "item-wise") {
        params.item_id = selectedItem;
      }

      if (filterType === "godown-wise") {
        params.godown_id = selectedGodown;
      }

      const response = await API.get(
        API_ENDPOINTS.GET_MATERIAL_MFG_REPORT,
        {
          params,
        }
      );

      if (response?.status === 200) {
        setMfgMaterial(response?.data?.data || []);
        setTotalPages(response?.data?.total_pages || 1);
        setTotalRecords(
          response?.data?.total_records || 0
        );
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    fetchGodownList();
    fetchStockItemDropdown();
  }, []);

  // =========================================
  // HANDLE SEARCH
  // =========================================

  useEffect(() => {
    if (filterType) {
      const delayDebounce = setTimeout(() => {
        getMfgMaterialReport(1, search);
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [search]);

  return (
    <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md" >

      <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px" >
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard" >
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px" >
              Manufacturing Report
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* ===================================== */}
      {/* HEADING */}
      {/* ===================================== */}

      <Heading size="md" mb={6}>
        View Item Manufacturing Report
      </Heading>

      {/* ===================================== */}
      {/* FILTER SECTION */}
      {/* ===================================== */}

      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={5}
      >

        {/* FILTER TYPE */}

        <FormControl>

          <FormLabel>
            Select Filter Type
          </FormLabel>

          <Select
            placeholder="--Please Select--"
            value={filterType}
            onChange={(e) => {

              setFilterType(e.target.value);

              setSelectedItem("");

              setSelectedGodown("");

              setMfgMaterial([]);
            }}
          >
            <option value="item-wise">
              Item Wise
            </option>

            <option value="godown-wise">
              Godown Wise
            </option>

          </Select>

        </FormControl>

        {/* ITEM WISE */}

        {
          filterType === "item-wise" && (

            <FormControl>

              <FormLabel>
                Select Item
              </FormLabel>

              <Select
                placeholder="--Please Select--"
                value={selectedItem}
                onChange={(e) =>
                  setSelectedItem(e.target.value)
                }
              >

                {
                  stockItem?.map((item) => (

                    <option
                      key={item?.id}
                      value={item?.id}
                    >
                      {item?.item_name}
                    </option>

                  ))
                }

              </Select>

            </FormControl>
          )
        }

        {/* GODOWN WISE */}

        {
          filterType === "godown-wise" && (

            <FormControl>

              <FormLabel>
                Select Godown
              </FormLabel>

              <Select
                placeholder="--Please Select--"
                value={selectedGodown}
                onChange={(e) =>
                  setSelectedGodown(e.target.value)
                }
              >

                {
                  godown?.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item?.godown_name}
                    </option>
                  ))
                }

              </Select>

            </FormControl>
          )
        }

      </SimpleGrid>

      <Box textAlign="right" mt={6}>
        <Button
          bg="#237086" fontWeight="500" 
                fontSize="14px" color="white"
                _hover={{ bg: "#1B5A6B" }}
                 px={8} height="32px" borderRadius="12px"
          onClick={() => {
            setPage(1);
            getMfgMaterialReport(1);
          }}
          isDisabled={
            (filterType === "item-wise" && !selectedItem)
            ||
            (filterType === "godown-wise" && !selectedGodown)
          }
        >
          Show
        </Button>
      </Box>

      {
        mfgMaterial?.length > 0 && (

          <Flex
            mt={8}
            justify="space-between"
            align="end"
            flexWrap="wrap"
            gap={3}
          >

            <Text fontWeight="500" fontSize="12px" >
              Total Records : {totalRecords}
            </Text>

            <HStack spacing={3} w={{ base: "100%", md: "auto" }}>

              {/* LIMIT DROPDOWN */}

              <Select
                w="120px"
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setLimit(newLimit);
                  setPage(1);
                  getMfgMaterialReport(1, search);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>

              {/* SEARCH */}

              <Input
                placeholder="Search..."
                w={{ base: "100%", md: "300px" }}
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </HStack>

          </Flex>
        )
      }

      {/* ===================================== */}
      {/* TABLE */}
      {/* ===================================== */}

      <Box
        mt={5}
        overflowX="auto"
        border="1px solid #E2E8F0"
        borderRadius="md"
      >

        {
          loading ? (

            <Flex
              justify="center"
              align="center"
              py={10}
            >
              <Spinner size="lg" />
            </Flex>

          ) : (

            <Table variant="simple" size="sm" className="productsTable" minW="1800px">
              <Thead bg="gray.100">
                <Tr>
                  <Th>Item Name</Th>
                  <Th>Godown</Th>
                  <Th>Qty</Th>
                  <Th>Batch</Th>
                  <Th>Mfg Date</Th>
                  <Th>Expiry Date</Th>
                  <Th>Additional Cost</Th>
                  <Th>Effective Cost</Th>
                  <Th>Allocation Primary Item</Th>
                  <Th>Effective Rate</Th>
                  <Th>Created At</Th>
                </Tr>
              </Thead>

              <Tbody>

                {
                  mfgMaterial?.length > 0 ? (

                    mfgMaterial?.map((item) => (

                      <Tr key={item?.id}>

                        <Td>{item?.item_name} </Td>
                        <Td> {item?.item_godown} </Td>
                        <Td>{item?.item_qty} </Td>
                        <Td>{item?.item_batch || "-"} </Td>
                        <Td> {item?.mfg_date ? new Date(item?.mfg_date).toLocaleDateString() : "-"} </Td>
                        <Td> {item?.exp_date ? new Date(item?.exp_date).toLocaleDateString() : "-"} </Td>
                        <Td> ₹ {item?.additional_cost} </Td>
                        <Td> ₹ {item?.effective_cost} </Td>
                        <Td> ₹ {item?.allocation_primary_item} </Td>
                        <Td> ₹ {item?.effective_rate} </Td>
                        <Td> {item?.created_at ? new Date(item?.created_at).toLocaleString() : "-"} </Td>
                      </Tr>
                    ))

                  ) : (
                    <Tr>
                      <Td colSpan={11} textAlign="center"> No Data Found </Td>
                    </Tr>
                  )
                }
              </Tbody>
            </Table>
          )
        }

      </Box>

      {/* PAGINATION */}

      <HStack justify="end" mt={6} spacing={3}>
        <Button
          size="sm"
          isDisabled={page === 1}
          onClick={() => {
            const prev = page - 1;
            setPage(prev);
            getMfgMaterialReport(prev);
          }}>
          Previous
        </Button>

        <Text> Page {page} of {totalPages} </Text>

        <Button
          size="sm"
          isDisabled={page === totalPages}
          onClick={() => {
            const next = page + 1;
            setPage(next);
            getMfgMaterialReport(next);
          }}>
          Next
        </Button>

      </HStack>


    </Box>
  );
}

export default ManuFacturingReport;