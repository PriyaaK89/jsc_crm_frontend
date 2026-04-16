import React, { useEffect, useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr, Img,
  IconButton,
  Tooltip, useDisclosure
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import sort_icon from "../../assets/sort.svg";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
// import { FaEye } from "react-icons/fa";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import Pagination from "../../Pagination/Pagination";
import DeleteStockGroupModel from "./DeleteStockGroupModel";

const ViewStockGroup = () => {
  const [stockGroups, setStockGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [selectedId, setSelectedId] = useState('');

  // const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(10);
  // const [totalItems, setTotalItems] = useState(0);
  // const [totalPages, setTotalPages] = useState(1);

  // const [search, setSearch] = useState("");

  const navigate = useNavigate();


  const headers = [
    "S No",
    "Name",
    "Parent",
    "Add Quantity",
    "GST Enabled",
    "Overdue Limit",
    "Actions",
  ];

  //  featch stock group
  const fetchStockGroups = async () => {
    try {
      setLoading(true);

      const res = await API.get(API_ENDPOINTS.stock_group_list, {
        // params: { page, limit, search },
      });

      if (res.status === 200) {
        const data = res?.data?.data || [];

        setStockGroups(data);
        // setSelectedId(data?.id);
        // setTotalItems(res?.data?.pagination?.total || 0);
        // setTotalPages(
        //   Math.ceil(
        //     (res?.data?.pagination?.total || 0) /
        //       (res?.data?.pagination?.limit || 10)
        //   )
        // );
      }
    } catch (err) {
      console.error("Error fetching stock groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockGroups();
  }, []);


  // hnadle model open 
  const handleDelete = (id) => {
    setSelectedId(id);
    console.log(id)
    onDeleteOpen();
  };


  return (

    <Box bg="white" px={6} py={4} borderRadius="lg" boxShadow="md">
      <DeleteStockGroupModel
        isDeleteOpen={isDeleteOpen}
        onDeleteClose={onDeleteClose}
        selectedId={selectedId}   // ✅ correct
        fetchStockGroups={fetchStockGroups}

      />

      {/* Breadcrumb */}
      <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Stock Group List</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* Top Section */}
      <Flex justifyContent="space-between" mt={4} mb={4}>
        <Text fontSize="16px" fontWeight="600">
          Stock Group Management
        </Text>

        {/* Search */}


      </Flex>

      {/* TABLE */}
      <Box
        overflowX="auto"
        whiteSpace="nowrap"
        sx={{
          "&::-webkit-scrollbar": { width: "8px", height: "8px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#7A7A7A",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#E8E8E8",
            borderRadius: "4px",
          },
        }}
      >
        <Table
          variant="striped"
          colorScheme="gray"
          size="sm"
          minW="1200px"
          borderRadius="md"
        >
          <Thead bg="#F9FAFB">
            <Tr>
              {headers.map((head, i) => (
                <Th
                  key={i}
                  fontSize="15px"
                  fontWeight="600"
                  color="#2C2D33"
                  textTransform="capitalize" height="50px"
                >
                  <Flex align="center" gap="7px">
                    <Text fontSize="14px"> {head}</Text>
                    <Img src={sort_icon} alt="sort" />
                  </Flex>

                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={headers.length} textAlign="center">
                  Loading...
                </Td>
              </Tr>
            ) : stockGroups.length === 0 ? (
              <Tr>
                <Td colSpan={headers.length} textAlign="center">
                  No Data Found
                </Td>
              </Tr>
            ) : (
              stockGroups.map((item, index) => (
                <Tr key={item.id}>
                  <Td>{index + 1}</Td>

                  <Td>{item?.name || "-"}</Td>

                  <Td>{item?.parent_id ?? "Primary"}</Td>

                  <Td>{item?.add_quantity == 1 ? "Yes" : "No"}</Td>

                  <Td>{item?.gst_enabled == 1 ? "Yes" : "No"}</Td>

                  <Td>{item?.overdue_limit}</Td>

                  <Td>
                    <Flex gap="8px">
                      {/* <Tooltip label="view Stock" hasArrow>
                        <IconButton
                          icon={<FaEye />}
                          size="md"
                          variant="ghost"
                          color="blue.600"
                          _hover={{ bg: "blue.50" }}
                          aria-label="view Stock"
                          onClick={() =>
                            navigate(`/stock-group/view/${item.id}`)
                          }
                        />
                      </Tooltip> */}

                      <Tooltip label="Edit Stock Group" hasArrow>
                        <IconButton
                          icon={<FiEdit2 />}
                          size="md"
                          variant="ghost"
                          color="blue.600"
                          _hover={{ bg: "blue.50" }}
                          aria-label="Edit Stock Group"
                          onClick={() =>
                            navigate(`/inventory/view-stock-group/edit/${item.id}`)
                          }
                        />
                      </Tooltip>

                      <Tooltip label="Delete Stock Group" hasArrow>
                        <IconButton
                          icon={<FiTrash2 />}
                          size="md"
                          variant="ghost"
                          color="red.600"
                          _hover={{ bg: "red.50" }}
                          aria-label="Delete Stock Group"
                          onClick={() => handleDelete(item?.id)}
                        />
                      </Tooltip>
                    </Flex>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      {/* <Pagination
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        totalItems={totalItems}
        totalPages={totalPages}
      /> */}
    </Box>
  );
};



export default ViewStockGroup;