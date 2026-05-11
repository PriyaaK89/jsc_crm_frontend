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
    Avatar,
    TableContainer,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import MobileTopbar from "../../components/layout/MobileTopbar";
import NotificationBtn from "../../components/NotificationBtn/NotificationBtn";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const ViewAssignedTargets = () => {

    const [targetList, setTargetList] = useState([]);

    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);

    const [limit, setLimit] = useState(10);

    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");

    // GET TARGET LIST

    const getTargetList = async () => {

        try {

            setLoading(true);

            const response = await API.get(
                API_ENDPOINTS.get_assigned_targets,
                {
                    params: {
                        page,
                        limit,
                        search,
                    },
                }
            );

            if (response?.status === 200) {

                setTargetList(response?.data?.data || []);

                setTotalPages(response?.data?.totalPages || 1);

            }

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }
    };

    // SEARCH + PAGINATION + LIMIT

    useEffect(() => {

        const delayDebounce = setTimeout(() => {

            getTargetList();

        }, 500);

        return () => clearTimeout(delayDebounce);

    }, [page, search, limit]);

    // ROLE BADGE COLOR

    const getRoleColor = (role) => {

        switch (role) {

            case "ZSM":
                return "purple";

            case "RSM":
                return "blue";

            case "ASM":
                return "green";

            case "TSM":
                return "orange";

            case "SM":
                return "pink";

            default:
                return "gray";
        }
    };

    return (
        <>
            <Box bg="#F4F6F9" minH="100vh">

                {/* SIDEBAR */}

                <Box display={{ base: "none", md: "block" }}>
                    <Sidebar />
                </Box>

                {/* TOPBAR */}

                <Box display={{ base: "none", md: "block" }}>
                    <Topbar />
                </Box>

                <Box display={{ base: "block", md: "none" }}>
                    <MobileTopbar />
                </Box>

                {/* MAIN CONTENT */}

                <Box
                    ml={{ base: 4, md: "295px" }}
                    mr={{ base: 4, md: 5 }}
                    pt="5rem"
                    pb={6}
                >

                    <NotificationBtn />

                        <Box
      bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md"
    >

      <HStack justifyContent="space-between">
        <Breadcrumb
          color="#8B8D97"
          padding="10px 0px 1rem 0px"
        >
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
              color="#8B8D97"
              fontSize="13px"
            >
              View Assigned Target List
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

                        {/* SEARCH + LIMIT */}
                        <HStack justifyContent="space-between" mb={4} alignItems="end">
                        <Text
                            fontSize={{ base: "15px", md: "16px" }}
                            fontWeight="600"
                            color="gray.700"
                        >
                            Assigned Targets List
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
                                    placeholder="Search user, email, role..."
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

                        {/* TABLE */}

                        <TableContainer
                            border="1px solid #EDF2F7"
                            borderRadius="16px"
                            overflowX="auto"
                        >

                            <Table variant="simple">

                                <Thead bg="#F8FAFC">

                                    <Tr>

                                        <Th py={4}>S. No.</Th>
                                        <Th py={4}>User</Th>
                                        <Th py={4}>Role</Th>
                                        <Th py={4}>Team</Th>
                                        <Th py={4}>Sub Team</Th>
                                        <Th py={4}>Total Target</Th>
                                        <Th py={4}>Pending Target</Th>
                                        <Th py={4}>Assigned By</Th>

                                    </Tr>

                                </Thead>

                                <Tbody>

                                    {loading ? (

                                        <Tr>
                                            <Td colSpan={8}>
                                                <Flex justify="center" py={10}>
                                                    <Spinner size="lg" thickness="3px" color="blue.500" />
                                                </Flex>

                                            </Td>
                                        </Tr>

                                    ) : targetList?.length > 0 ? (
                                        targetList?.map((item, index) => (
                                            <Tr
                                                key={item?.id}
                                                _hover={{ bg: "gray.50", transition: "0.2s", }} >
                                                <Td fontWeight="500" fontSize="14px"> {(page - 1) * limit + index + 1} </Td>

                                                {/* USER */}

                                                <Td>
                                                    <HStack spacing={3}>
                                                        <Box>

                                                            <Text
                                                                fontWeight="500"
                                                                color="gray.700"
                                                            >
                                                                {item?.name || "-"}
                                                            </Text>

                                                            <Text
                                                                fontSize="12px"
                                                                color="gray.500"
                                                            >
                                                                {item?.email || "-"}
                                                            </Text>

                                                        </Box>

                                                    </HStack>

                                                </Td>

                                                {/* ROLE */}

                                                <Td>

                                                    <Badge
                                                        colorScheme={getRoleColor(item?.role)}
                                                        px={3}
                                                        py={1}
                                                        borderRadius="full"
                                                        fontSize="11px"
                                                        textTransform="capitalize"
                                                    >
                                                        {item?.role}
                                                    </Badge>

                                                </Td>

                                                {/* TEAM */}

                                                <Td>
                                                    <Text fontWeight="500" fontSize="15px">
                                                        {item?.team_name || "-"}
                                                    </Text>
                                                </Td>

                                                {/* SUB TEAM */}

                                                <Td>
                                                    <Text color="gray.600">
                                                        {item?.sub_team_name || "-"}
                                                    </Text>
                                                </Td>

                                                {/* TOTAL TARGET */}

                                                <Td>

                                                    <Text
                                                        fontWeight="600"
                                                        color="blue.600" fontSize="15px"
                                                    >
                                                        ₹ {item?.total_target || 0}
                                                    </Text>

                                                </Td>

                                                {/* PENDING TARGET */}

                                                <Td>

                                                    <Badge
                                                        colorScheme={
                                                            Number(item?.pending_target) < 0
                                                                ? "red"
                                                                : "green"
                                                        }
                                                        px={3}
                                                        py={1}
                                                        borderRadius="full"
                                                        fontSize="12px"
                                                    >
                                                        ₹ {item?.pending_target || 0}
                                                    </Badge>

                                                </Td>

                                                {/* PARENT TYPE */}

                                                <Td>

                                                    <Badge
                                                        bg="gray.100"
                                                        color="gray.700"
                                                        px={3}
                                                        py={1}
                                                        borderRadius="full"
                                                    >
                                                        {item?.parent_type || "-"}
                                                    </Badge>

                                                </Td>

                                            </Tr>

                                        ))

                                    ) : (

                                        <Tr>

                                            <Td colSpan={8}>

                                                <VStack py={14} spacing={3}>

                                                    <Text
                                                        fontSize="18px"
                                                        fontWeight="600"
                                                        color="gray.500"
                                                    >
                                                        No Assigned Targets Found
                                                    </Text>

                                                    <Text
                                                        fontSize="14px"
                                                        color="gray.400"
                                                    >
                                                        Try searching with another keyword
                                                    </Text>

                                                </VStack>

                                            </Td>

                                        </Tr>

                                    )}

                                </Tbody>

                            </Table>

                        </TableContainer>

                        {/* PAGINATION */}

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

            </Box>
        </>
    );
};

export default ViewAssignedTargets;