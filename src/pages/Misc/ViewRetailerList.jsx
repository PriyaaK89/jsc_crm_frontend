import React, { useEffect, useState } from "react";

import {
    Box,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
    HStack,
    Select,
    Badge,
    Tooltip,
    IconButton,
    useDisclosure,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import Pagination from "../../Pagination/Pagination";
import { FiEdit2 } from "react-icons/fi";
import EditRetailerModal from "./EditRetailerModal";

const ViewRetailerList = () => {

    const toast = useToast();

    const [retailer, setRetailer] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedId, setSelectedId] = useState();

    const {isOpen, onOpen, onClose} = useDisclosure();

    const getRetailerList = async () => {

        try {
            setLoading(true);
            const response = await API.get( `${API_ENDPOINTS.GET_RETAILER_LIST}?page=${page}&limit=${limit}&search=${search}` );

            if (response?.status === 200) {
                setRetailer(response?.data?.data || []);
                setTotal(response?.data?.total || 0);
                setTotalPages(response?.data?.totalPages || 1);
            }

        } catch (error) {

            console.log(error);

            toast({
                title: "Error",
                description: "Failed to fetch retailer list",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRetailerList();
    }, [page, limit, search]);


    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleRetailerModalOpen = (id)=>{
        onOpen();
        setSelectedId(id);
    }


    return (
        <Box>
            <EditRetailerModal isOpen={isOpen} onClose={onClose} selectedId={selectedId} getRetailerList={getRetailerList}/>
            <Flex mb={5} justify="end" align="center" flexWrap="wrap" gap={3}>
                <HStack spacing={3} >
                    <InputGroup maxW="350px">
                        <InputLeftElement> <SearchIcon color="gray.400" /> </InputLeftElement>
                        <Input
                            placeholder="Search retailer..."
                            value={search}
                            onChange={handleSearch}
                            bg="white" />
                    </InputGroup>
                </HStack>
            </Flex>

            {/* TABLE */}

            <Box bg="white" borderRadius="12px" overflowX="auto" boxShadow="sm" border="1px solid #E2E8F0" >
                {
                    loading ? (
                        <Flex justify="center" align="center" p={10}>
                            <Spinner size="lg" />
                        </Flex>
                    ) : (
                        <Table variant="simple" className="productsTable">
                            <Thead bg="gray.100">
                                <Tr>
                                    <Th>S No.</Th>
                                    <Th>Name</Th>
                                    <Th>Firm Name</Th>
                                    <Th>Contact Number</Th>
                                    <Th>District</Th>
                                    <Th>Area</Th>
                                    <Th>Action</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {
                                    retailer?.length > 0 ? (
                                        retailer?.map((item, index) => (
                                            <Tr key={item?.id} _hover={{ bg: "gray.50" }}>
                                                <Td> {(page - 1) * limit + index + 1} </Td>
                                                <Td fontWeight="600"> {item?.name || "-"} </Td>
                                                <Td> {item?.firm_name || "-"} </Td>
                                                <Td> {item?.contact_number || "-"} </Td>
                                                <Td> {item?.district || "-"} </Td>
                                                <Td> {item?.area || "-"} </Td>
                                                <Td>
                                                    <Tooltip label="Edit comapny" hasArrow>
                                                        <IconButton
                                                            icon={<FiEdit2 />}
                                                            size="sm"
                                                            variant="ghost"
                                                            color="blue.600"
                                                            _hover={{ bg: "blue.50" }}
                                                            aria-label="Edit"
                                                            onClick={() =>
                                                                handleRetailerModalOpen(item?.id)
                                                            } />
                                                    </Tooltip></Td>
                                            </Tr>
                                        ))

                                    ) : (
                                        <Tr>
                                            <Td colSpan={7} textAlign="center" py={10}>
                                                <Text color="gray.500">  No Retailer Found </Text>
                                            </Td>
                                        </Tr>
                                    )
                                }

                            </Tbody>

                        </Table>

                    )
                }

            </Box>

            {/* PAGINATION */}

            <Pagination
                page={page}
                limit={limit}
                totalItems={total}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
            />

        </Box>
    );
};

export default ViewRetailerList;