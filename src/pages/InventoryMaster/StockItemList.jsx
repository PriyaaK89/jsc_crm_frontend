import React, { useEffect, useState } from "react";
import {
    Badge, Box, Flex, HStack, IconButton, Input, InputGroup, InputLeftElement, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr,
    VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast,
} from "@chakra-ui/react";
import { FiEdit2, FiSearch, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import DeleteStockItemModal from "../../components/models/DeleteStockItemModal";
import Pagination from "../../Pagination/Pagination"; // adjust the path to wherever you place Pagination.jsx

const StockItemList = () => {

    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [stockItems, setStockItems] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const [selectedId, setSelectedId] = useState();

    const handleDeleteModalOpen = (id) => {
        setSelectedId(id);
        onDeleteModalOpen();
    }

    const getStockItemList = async () => {
        try {
            setLoading(true);
            const response = await API.get(
                `${API_ENDPOINTS.getStockItemsList}?search=${search}&page=${page}&limit=${limit}`
            );
            if (response?.status === 200) {
                setStockItems(response?.data?.data || []);
                setTotalPages(response?.data?.totalPages || 1);
                setTotalRecords(response?.data?.totalRecords || 0);
            }
        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: "Failed to fetch stock items",
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
            setPage(1);
            getStockItemList();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    useEffect(() => {
        getStockItemList();
    }, [page, limit]);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setPage(newPage);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

    const formatNumber = (value) => {

        if (value === null || value === undefined || value === "") {
            return "";
        }

        const number = Number(value);

        return Number.isInteger(number)
            ? number.toString()
            : number.toFixed(2).replace(/\.?0+$/, "");
    };

    return (
        <>

            <VStack spacing={5} align="stretch">
                <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4} >

                    <InputGroup maxW="350px">
                        <InputLeftElement> <FiSearch color="gray" /> </InputLeftElement>

                        <Input
                            placeholder="Search stock item..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            bg="white" />
                    </InputGroup>

                    <Text fontSize="sm" color="gray.600" fontWeight="600">
                        Total Records : {totalRecords}
                    </Text>
                </Flex>


                <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="lg" >
                    <Table variant="simple" className="productsTable" size="sm" >
                        <Thead bg="gray.100">
                            <Tr>
                                <Th>S.No</Th>
                                <Th minW="180px"> Item Details </Th>
                                <Th minW="180px"> Group / Category  </Th>
                                <Th minW="180px">  Units Information </Th>
                                <Th minW="180px"> Quantity </Th>
                                <Th minW="180px"> SuperCash Price </Th>
                                <Th minW="160px"> Batch Details  </Th>
                                <Th minW="150px"> GST Details </Th>
                                <Th minW="160px"> Features </Th>
                                <Th minW="130px"> Created Date </Th>
                                <Th textAlign="center"> Actions </Th>
                            </Tr>
                        </Thead>

                        <Tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan={10} textAlign="center" py={10}>
                                        <Spinner size="lg" />
                                    </Td>
                                </Tr>

                            ) : stockItems?.length > 0 ? (
                                stockItems?.map((item, index) => (
                                    <Tr key={item?.id} _hover={{ bg: "gray.50" }}>
                                        <Td fontWeight="600"> {(page - 1) * limit + index + 1} </Td>
                                        <Td>
                                            <VStack align="start" spacing={1} >
                                                <Text fontWeight="700" color="gray.700" > {item?.item_name || "-"} </Text>
                                                <Badge className="badge" colorScheme={item?.type_of_supply === "Goods" ? "blue" : "purple"} > {item?.type_of_supply} </Badge>
                                                <Text fontSize="12px" color="gray.500"> Duty : {" "} {formatNumber(item?.rate_of_duty) || 0}  </Text>
                                            </VStack>

                                        </Td>

                                        <Td>
                                            <VStack align="start" spacing={1} >

                                                <Text fontWeight="600" color="gray.700" >
                                                    {item?.stock_group_name || "-"}
                                                </Text>

                                                <Text fontSize="12px" color="gray.500" >
                                                    {item?.stock_category_name || "-"}
                                                </Text>
                                            </VStack>
                                        </Td>

                                        <Td>
                                            <VStack align="start" spacing={2} >
                                                <HStack>
                                                    <Text fontSize="12px" color="gray.500" > Base Unit =</Text>
                                                    <Text fontWeight="600"> {item?.base_unit_name || "-"} </Text>
                                                </HStack>

                                                {item?.alternative_unit_name && (

                                                    <Box>
                                                        <Text fontSize="12px" color="gray.500" > Alternative Unit </Text>

                                                        <Text fontWeight="600" >
                                                            {formatNumber(item?.alternative_unit_value)}
                                                            {" "}
                                                            {item?.alternative_unit_name}
                                                            {" = "}
                                                            {formatNumber(item?.base_unit_value)}
                                                            {" "}
                                                            {item?.base_unit_name}
                                                        </Text>

                                                    </Box>
                                                )}



                                                {item?.bulk_unit_name && (

                                                    <Box>

                                                        <Text fontSize="12px" color="gray.500" >
                                                            Bulk Unit
                                                        </Text>

                                                        <Text fontWeight="600" >
                                                            {formatNumber(item?.bulk_unit_value)}
                                                            {" "}
                                                            {item?.bulk_unit_name}
                                                            {" = "}
                                                            {formatNumber(item?.bulk_base_value)}
                                                            {" "}
                                                            {item?.base_unit_name}
                                                        </Text>

                                                    </Box>
                                                )}
                                            </VStack>
                                        </Td>


                                        <Td>
                                            <VStack align="start" spacing={1} >
                                                <Text fontWeight="700" color="green.600" >
                                                    Qty : {" "} {formatNumber(item?.quantity) || 0} {" "} {item?.opening_stock_unit || ""}
                                                </Text>

                                                <Text fontSize="13px"> Rate : {" "} ₹ {formatNumber(item?.rate) || 0} </Text>

                                                <Text fontWeight="700" color="blue.600" > Amount : {" "} ₹ {formatNumber(item?.amount) || 0} </Text>

                                                <Text fontSize="12px" color="gray.500" >
                                                    Godown : {" "} {item?.godown_name || "-"}
                                                </Text>
                                            </VStack>

                                        </Td>
                                        <Td>₹ {formatNumber(item?.supercash_price)} </Td>

                                        <Td>
                                            <VStack align="start" spacing={2} >
                                                <Badge className="badge" colorScheme={ item?.maintain_in_batches == 1 ? "green" : "red" } >
                                                    {item?.maintain_in_batches == 1 ? "Batch Enabled" : "No Batch"}
                                                </Badge>

                                                {item?.track_mfg_date == 1 && (
                                                    <Badge className="badge" colorScheme="blue" > MFG Tracking </Badge>
                                                )}

                                                {item?.use_expiry_dates == 1 && (
                                                    <Badge className="badge" colorScheme="orange" > Expiry Tracking </Badge>
                                                )}
                                            </VStack>
                                        </Td>


                                        <Td>
                                            <VStack align="start" spacing={2} >
                                                <Badge className="badge" colorScheme={ item?.gst_applicable == 1 ? "green" : "red" } >
                                                    {item?.gst_applicable == 1 ? "GST" : "NON GST"}
                                                </Badge>

                                                {item?.set_gst_details == 1 && (
                                                    <Badge className="badge" colorScheme="purple" >
                                                        GST Details Added
                                                    </Badge>
                                                )}
                                            </VStack>
                                        </Td>


                                        <Td>
                                            <VStack align="start" spacing={2} >
                                                {item?.set_standard_rates == 1 && (
                                                    <Badge className="badge" colorScheme="cyan" > Standard Rates </Badge>
                                                )}

                                                {item?.enable_cost_tracking == 1 && (
                                                    <Badge className="badge" colorScheme="pink"> Cost Tracking </Badge>
                                                )}
                                            </VStack>
                                        </Td>

                                        <Td>
                                            <Text fontSize="13px" color="gray.600" >
                                                {new Date( item?.created_at).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </Text>

                                        </Td>


                                        <Td>

                                            <HStack justify="center" spacing={2} >

                                                <Link to={`/inventory/edit-stock-item/${item?.id}`} >
                                                    <IconButton icon={<FiEdit2 />} size="sm" colorScheme="blue" />
                                                </Link>

                                                <IconButton icon={<FiTrash2 />} size="sm" colorScheme="red" onClick={() => handleDeleteModalOpen(item?.id)} />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (

                                <Tr>
                                    <Td colSpan={10} textAlign="center" py={10} >
                                        <Text color="gray.500"> No Stock Items Found </Text>
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                </Box>

                <Pagination
                    page={page}
                    limit={limit}
                    totalItems={totalRecords}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                />
            </VStack>
            <DeleteStockItemModal isDeleteModalOpen={isDeleteModalOpen} onClose={onDeleteModalClose} selectedId={selectedId} getStockItemList={getStockItemList} />

        </>
    );
};

export default StockItemList;