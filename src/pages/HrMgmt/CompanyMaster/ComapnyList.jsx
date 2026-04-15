import React, { useEffect, useState } from "react";
import {
    Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Img,
  Input,
  InputGroup,InputLeftElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import sort_icon from "../../../assets/sort.svg";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import Pagination from "../../../Pagination/Pagination";
import { FiSearch } from "react-icons/fi";
import { ViewIcon,CloseIcon  } from "@chakra-ui/icons";

import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import DeleteCompanyModel from "./DeleteCompanyModel";

const ComapnyList = () => {
    const [comapnyies, setComapnies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
    const navigate = useNavigate();

  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();

 const {
  isOpen: isDeleteOpen,
  onOpen: onDeleteOpen,
  onClose: onDeleteClose,   
} = useDisclosure();

    const headers = [
        "S No",
        "Company Logo",
        "Company Name",
        "Email",
        "Phone",
        "State",
        "Address",
        "GSTIN",
        "Bank Name",
        "Account No",
        "Created At",
        "Actions",
    ];

    const widthMap = {
       "S No":"120px",
        "Company Logo":"120px",
        "Company Name":"120px",
        "Email":"120px",
        "Phone":"120px",
        "State":"120px",
        "GSTIN":"120px",
        "Bank Name":"120px",
        "Account No":"120px",
        "Created At":"120px",
        "Actions":'120px',
    };

    const fetchDistributors = async () => {
        try {
            setLoading(true);
            const response = await API.get(API_ENDPOINTS.Get_comapnies, {
                params: {
                    page,
                    limit,
                    search,
                },
            });

            if (response.status === 200) {
                setComapnies(response?.data?.data || []);
                setPage(response?.data?.pagination?.page || 1);
                setTotalItems(response?.data?.pagination?.total || 0);
                setSelectedId(response?.data?.data.id);
                // console.log("selecetes id",selectedId)
                setTotalPages(
                    Math.ceil(
                        response?.data?.pagination?.total /
                        response?.data?.pagination?.limit
                    ) || 1
                );
                setLimit(response?.data?.pagination?.limit || 10);
            }
        } catch (error) {
            console.error("Error fetching company:", error);
        } finally {
            setLoading(false);
        }
    };
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");
    };

    useEffect(() => {
        fetchDistributors();
    }, [page, limit, search]);


    // handle delete 
    const handleDelete = (id) => {
    setSelectedId(id);
    onDeleteOpen();
  };

    const getImageUrl = (url) => {
    const BASE_URL = "https://your-api-domain.com";

    if (!url) return "";
    if (url.startsWith("http")) return url;

    return `${BASE_URL}${url}`;
  };

   

    return (
        <>
        <DeleteCompanyModel
         isDeleteOpen={isDeleteOpen}
       onDeleteClose={onDeleteClose}
        selectedId={selectedId}
        fetchDistributors={fetchDistributors}
        
        />

            <Box
                bg="white"
                mt={{ base: 2, md: 5 }}
                px={{ base: 3, md: 6 }}
                py={{ base: 3, md: 4 }}
                borderRadius="lg"
                boxShadow="md"
            >
                {/* Breadcrumb */}
                <HStack justifyContent="space-between">
                    <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to="/dashboard">
                                <GoHomeFill color="#5570F1" />
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink fontSize="13px">Company List</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </HStack>

                <Flex justifyContent="space-between" mb={4} alignItems="center" gap={4}>
                    {/* TITLE */}
                    <Text color="#45464E" fontSize="15px" fontWeight="600">
                        Company List Management
                    </Text>

                    {/* LEFT SIDE (Country + State) */}

                    {/* State Dropdown */}

                    {/* SEARCH */}
                    <Box w="20%">
                        <InputGroup>
                            <InputLeftElement pointerEvents="none">
                                <FiSearch color="#8C8C91" />
                            </InputLeftElement>

                            <Input
                                pl="40px"
                                placeholder="Search by Company name/GSTIN NO"
                                border="1px solid #CFD3D4"
                                borderRadius="32px"
                                value={search || ""}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </Box>
                </Flex>

                {/* TABLE */}
                <Box
                    overflowX="auto"
                    whiteSpace="nowrap"
                    sx={{
                        "&::-webkit-scrollbar": { width: "8px", height: "8px" },
                        "&::-webkit-scrollbar-thumb": {
                            width: "8px",
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
                        minW="2000px"
                        className="productsTable"
                    >
                        {/* THEAD */}
                        <Thead bg="#F9FAFB">
                            <Tr>
                                {headers.map((header, index) => (
                                    <Th
                                        key={index}
                                        fontSize="14px"
                                        fontWeight="500"
                                        color="#2C2D33"
                                        textTransform="capitalize"
                                        width={widthMap[header]}
                                    >
                                        <Flex align="center" gap="7px">
                                            <Text fontSize="14px">{header}</Text>
                                            <Img src={sort_icon} alt="sort" />
                                        </Flex>
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>

                        {/* TBODY */}
                        <Tbody>
                            {loading ? (
                                <Tr>
                                    <Td colSpan={headers.length} textAlign="center">
                                        Loading...
                                    </Td>
                                </Tr>
                            ) : comapnyies.length === 0 ? (
                                <Tr>
                                    <Td colSpan={headers.length} textAlign="center">
                                        No Data Found
                                    </Td>
                                </Tr>
                            ) : (
                                comapnyies.map((item, index) => (
                                    <Tr key={item.id}>
                                        <Td>{(page - 1) * limit + index + 1}</Td>
                                        <Td width="140px" fontWeight="medium">
                          <Avatar
                            h="40px"
                            w="40px"
                            name={item?.name}
                            src={getImageUrl(item?.company_logo_url)}
                            cursor={item?.company_logo_url ? "pointer" : "default"}
                            onClick={() => {
                              if (item?.company_logo_url) {
                                setSelectedImage(getImageUrl(item.company_logo_url));
                                onImageOpen();
                              }
                            }}
                          />
                        </Td>
                                        <Td>{item?.company_name || "-"}</Td>
                                        <Td>{item?.email || "-"}</Td>
                                        <Td>{item?.phone || "-"}</Td>
                                        <Td>{item?.state || "-"}</Td>
                                        <Td>{item?.address || "-"}</Td>
                                        <Td>{item?.gstin || "-"}</Td>
                                        <Td>{item?.bank_name || "-"}</Td>
                                        <Td>{item?.account_no || "-"}</Td>
                                        <Td>{formatDate(item?.created_at)}</Td>

                                        {/* ACTIONS */}
                                        <Td>
                                            <Flex gap="8px">
                                                  <Tooltip label="View Company Details" hasArrow>
                                                 <IconButton
                                                    icon={<FaEye />}
                                                    size="md"
                                                    variant="ghost"
                                                    color="blue.600"
                                                    _hover={{ bg: "blue.50" }}
                                                    aria-label="view Company"        
                                                />
                                                </Tooltip>
                                                <Tooltip label="Edit comapny" hasArrow>
                                                <IconButton
                                                    icon={<FiEdit2 />}
                                                    size="sm"
                                                    variant="ghost"
                                                    color="blue.600"
                                                    _hover={{ bg: "blue.50" }}
                                                    aria-label="Edit"
                                                    onClick={() =>
                                                        navigate(`/company-master/comapny-list/edit/${item?.id}`)
                                                    }
                                                />
                                             </Tooltip>
                                         <Tooltip label="Delete Comapny" hasArrow>
                                                <IconButton
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    variant="ghost"
                                                    color="red.600"
                                                    _hover={{ bg: "red.50" }}
                                                    aria-label="Delete"
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
                <Pagination
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    totalItems={totalItems}
                    totalPages={totalPages}
                />
            </Box>


             <Modal isOpen={isImageOpen} onClose={onImageClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalBody p={0}>
            <Box
              position="relative"
              borderRadius="xl"
              overflow="hidden"
              maxH="80vh"
              maxW="500px"
              mx="auto"
            >
              <IconButton
                icon={<CloseIcon />}
                position="absolute"
                top="10px"
                right="10px"
                zIndex="2"
                size="sm"
                borderRadius="full"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: "blackAlpha.800" }}
                onClick={onImageClose}
                aria-label="Close"
              />

              <Image
                src={selectedImage}
                alt="Profile"
                w="100%"
                h="100%"
                maxH="80vh"
                objectFit="contain"
                borderRadius="xl"
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
        </>
    );
};




export default ComapnyList
