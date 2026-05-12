import React, { useEffect, useState } from "react";

import {
    Badge,
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Flex,
    HStack,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
    useToast
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const UnitOfMeasureList = () => {

    const toast = useToast();

    const [unitList, setUnitList] = useState([]);

    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);

    const [limit, setLimit] = useState(10);

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        currentPage: 1
    });

    // ================= GET UNIT LIST =================

    const getUnitList = async () => {

        try {

            setLoading(true);

            const response = await API.get(
                `${API_ENDPOINTS.getUnitList}?page=${page}&limit=${limit}&search=${search}`
            );

            if (response?.data?.success) {

                setUnitList(response?.data?.data || []);

                setPagination(response?.data?.pagination || {});
            }

        } catch (error) {

            console.log(error);

            toast({
                title: "Error",
                description: error?.response?.data?.message || "Something went wrong",
                status: "error",
                duration: 3000,
                isClosable: true
            });

        } finally {

            setLoading(false);
        }
    };

    // ================= USE EFFECT =================

    useEffect(() => {

        const delayDebounce = setTimeout(() => {

            getUnitList();

        }, 500);

        return () => clearTimeout(delayDebounce);

    }, [page, limit, search]);

    // ================= PAGINATION =================

    const handlePrevious = () => {

        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    const handleNext = () => {

        if (page < pagination?.totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    return (
        <>

            <Box
                bg="white"
                mt={{ base: 2, md: 5 }}
                px={{ base: 3, md: 6 }}
                py={{ base: 3, md: 4 }}
                borderRadius="lg"
                boxShadow="sm"
            >

                {/* ================= BREADCRUMB ================= */}

                <HStack
                    justifyContent="space-between"
                    mb={4}
                    flexWrap="wrap"
                    gap={3}
                >

                    <Breadcrumb color="gray.500">

                        <BreadcrumbItem>

                            <BreadcrumbLink
                                as={Link}
                                to="/dashboard"
                            >
                                <GoHomeFill color="#5570F1" />
                            </BreadcrumbLink>

                        </BreadcrumbItem>

                        <BreadcrumbItem>

                            <BreadcrumbLink
                                isCurrentPage
                                fontSize="14px"
                            >
                                Unit of Measure List
                            </BreadcrumbLink>

                        </BreadcrumbItem>

                    </Breadcrumb>

                </HStack>

                {/* ================= HEADING ================= */}

                <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={3}
                    mb={5}
                >

                    <Heading
                        size="md"
                        color="gray.700"
                        fontSize="22px"
                    >
                        Unit of Measure List
                    </Heading>

                    {/* ================= SEARCH ================= */}

                    <InputGroup maxW="300px">

                        <InputLeftElement>
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>

                        <Input
                            placeholder="Search unit..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            focusBorderColor="#5570F1"
                        />

                    </InputGroup>

                </Flex>

                {/* ================= TABLE ================= */}

                <Box
                    overflowX="auto"
                    border="1px solid"
                    borderColor="gray.100"
                    borderRadius="lg"
                >

                    <Table variant="simple">

                        <Thead bg="gray.50">

                            <Tr>

                                <Th>S No.</Th>

                                <Th>Type</Th>

                                <Th>Symbol</Th>

                                <Th>Formal Name</Th>

                                <Th>UQC</Th>

                                <Th>Decimal</Th>

                                <Th>Compound Unit</Th>
                                <Th>Action</Th>


                            </Tr>

                        </Thead>

                        <Tbody>

                            {
                                loading ? (

                                    <Tr>

                                        <Td colSpan={8}>

                                            <Flex
                                                justifyContent="center"
                                                alignItems="center"
                                                py={10}
                                            >

                                                <Spinner
                                                    size="lg"
                                                    color="#5570F1"
                                                />

                                            </Flex>

                                        </Td>

                                    </Tr>

                                ) : unitList?.length > 0 ? (

                                    unitList?.map((item, index) => (

                                        <Tr key={item?.id}>

                                            <Td>
                                                {
                                                    (page - 1) * limit + index + 1
                                                }
                                            </Td>

                                            <Td>

                                                <Badge
                                                    colorScheme={
                                                        item?.type === "SIMPLE"
                                                            ? "green"
                                                            : "purple"
                                                    }
                                                    px={2}
                                                    py={1}
                                                    borderRadius="md"
                                                >
                                                    {item?.type}
                                                </Badge>

                                            </Td>

                                            <Td fontWeight="600" fontSize="14px">
                                                {item?.symbol || "-"}
                                            </Td>

                                            <Td>
                                                {item?.formal_name || "-"}
                                            </Td>

                                            <Td>
                                                {item?.uqc || "-"}
                                            </Td>

                                            <Td>
                                                {item?.decimal_places}
                                            </Td>

                                            <Td>

                                                {
                                                    item?.type === "COMPOUND" ? (
                                                        <Text fontSize="14px">

                                                            1 {item?.first_unit}

                                                            {" = "}

                                                            {item?.conversion_value}

                                                            {" "}

                                                            {item?.second_unit}

                                                        </Text>
                                                    ) : (
                                                        "-"
                                                    )
                                                }

                                            </Td>
                  <Td textAlign="center">

  <HStack spacing={2} justify="flex-start">

    <IconButton
      icon={<FiEdit2 />}
      size="sm"
      colorScheme="blue"
      variant="outline"
      aria-label="Edit Godown"
    //  onClick={() => navigate( `/inventory/edit-godown/${item?.id}` ) }
    />


  <IconButton
    icon={<FiTrash2 />}
    size="sm"
    colorScheme="red"
    variant="outline"
    aria-label="Delete Godown"
    // onClick={() => handleDeleteModel(item?.id)}
  />


  </HStack>

</Td>


                                        </Tr>

                                    ))

                                ) : (

                                    <Tr>

                                        <Td colSpan={8}>

                                            <VStack py={10}>

                                                <Text
                                                    color="gray.500"
                                                    fontSize="15px"
                                                >
                                                    No Units Found
                                                </Text>

                                            </VStack>

                                        </Td>

                                    </Tr>

                                )
                            }

                        </Tbody>

                    </Table>

                </Box>

                {/* ================= FOOTER ================= */}

                <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mt={5}
                    flexWrap="wrap"
                    gap={3}
                >

                    {/* ================= SHOWING TEXT ================= */}

                    <Text fontSize="14px" color="gray.600">

                        Showing

                        {" "}

                        <Text as="span" fontWeight="600">
                            {unitList?.length}
                        </Text>

                        {" "}of{" "}

                        <Text as="span" fontWeight="600">
                            {pagination?.total || 0}
                        </Text>

                        {" "}results

                    </Text>

                    {/* ================= PAGINATION ================= */}

                    <HStack spacing={3}>

                        {/* LIMIT */}

                        <Select
                            w="90px"
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                        >

                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>

                        </Select>

                        {/* PREVIOUS */}

                        <IconButton
                            icon={<ChevronLeftIcon />}
                            onClick={handlePrevious}
                            isDisabled={page === 1}
                            aria-label="Previous"
                        />

                        {/* PAGE */}

                        <Text
                            fontSize="14px"
                            fontWeight="600"
                            minW="80px"
                            textAlign="center"
                        >

                            {page} / {pagination?.totalPages || 1}

                        </Text>

                        {/* NEXT */}

                        <IconButton
                            icon={<ChevronRightIcon />}
                            onClick={handleNext}
                            isDisabled={
                                page === pagination?.totalPages
                            }
                            aria-label="Next"
                        />

                    </HStack>

                </Flex>

            </Box>

        </>
    );
};

export default UnitOfMeasureList;