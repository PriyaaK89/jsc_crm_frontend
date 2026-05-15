import React, { useEffect, useState } from "react";

import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Heading,
  HStack,
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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { GoHomeFill } from "react-icons/go";

import { Link, useNavigate } from "react-router-dom";

import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import API from "../../services/api";

import { API_ENDPOINTS } from "../../services/endpoints";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DeleteGodownModel from "../../components/models/DeleteGodownModel";

const GodownList = () => {

  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [godownList, setGodownList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const [selectedId, setSelectedId] = useState();
   const { isOpen: deleteModelIsOpen, onOpen: deleteModelOnOpen, onClose: deleteModelOnClose } = useDisclosure();
const navigate = useNavigate();



  const fetchGodownList = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `${API_ENDPOINTS?.godown_list}?page=${currentPage}&limit=${rowsPerPage}&search=${searchTerm}`
      );
      setGodownList(response?.data?.data || []);
      setPagination(
        response?.data?.pagination || {}
      );
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to fetch godown list",
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
      fetchGodownList();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, rowsPerPage, searchTerm]);


  const handlePageChange = (page) => {

    if (
      page >= 1 &&
      page <= pagination.totalPages
    ) {
      setCurrentPage(page);
    }
  };

    const handleDeleteModel = (id) => {
    setSelectedId(id)
    deleteModelOnOpen()
  }


  return (

    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
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
              View Godown
            </BreadcrumbLink>

          </BreadcrumbItem>

        </Breadcrumb>

      </HStack>


      <Flex
        justify="space-between"
        align="end"
        mb={5}
        flexWrap="wrap"
        gap={3}
      >

        <Box>

          <Heading
           size="md" color="gray.600" fontSize="18px" height="36px"
          >
            View Godown List
          </Heading>

          <Text
            fontSize="12px"
            color="gray.500"
          >
            Manage all warehouse and storage locations
          </Text>

        </Box>

         <Flex justify="space-between" align="center"  gap={3} >
        <InputGroup maxW="320px">

          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>

          <Input
            placeholder="Search godown..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

        </InputGroup>

        <Badge
         px={3}
         py={2} bg="#607f83" color="white"
         borderRadius="md" fontWeight='500'
         pt="10px" textTransform="capitalize"
         fontSize="13px"
         >
          Total : {pagination.totalRecords || 0}
        </Badge>
            </Flex>

      </Flex>


     



      <Box
        overflowX="auto"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="lg"
      >

        <Table variant="simple" className="productsTable">

          <Thead bg="gray.50" >

            <Tr>
              <Th>S No.</Th>
              <Th>Godown Name</Th>
              <Th>Under</Th>
              <Th>Storage Allowed</Th>
              <Th>Our Stock With Third Party</Th>
              <Th>Third Party Stock With Us</Th>
              <Th textAlign="center"> Action</Th>
            </Tr>

          </Thead>

          <Tbody>

            {loading ? (

              <Tr>

                <Td
                  colSpan={7}
                  textAlign="center"
                  py={10}
                >
                  <Spinner size="lg" />
                </Td>

              </Tr>

            ) : godownList.length > 0 ? (

              godownList.map((item, index) => (

                <Tr key={item.id}>

                  <Td>
                    {(
                      (currentPage - 1) *
                      rowsPerPage
                    ) + index + 1}
                  </Td>

                  <Td fontWeight="600">
                    {item.godown_name}
                  </Td>

                  <Td>
                    {item.parent_name || "-"}
                  </Td>

                  <Td>

                    <Badge px={2} py="2px" borderRadius="6px"
                      colorScheme={
                        item.allow_storage_material
                          ? "green"
                          : "red"
                      }
                    >
                      {item.allow_storage_material
                        ? "Yes"
                        : "No"}
                    </Badge>

                  </Td>

                  <Td>

                    <Badge px={2} py="2px" borderRadius="6px"
                      colorScheme={
                        item.our_stock_with_third_party
                          ? "green"
                          : "red"
                      }
                    >
                      {item.our_stock_with_third_party
                        ? "Yes"
                        : "No"}
                    </Badge>

                  </Td>

                  <Td>

                    <Badge px={2} py="2px" borderRadius="6px"
                      colorScheme={
                        item.third_party_stock_with_us
                          ? "green"
                          : "red"
                      }
                    >
                      {item.third_party_stock_with_us
                        ? "Yes"
                        : "No"}
                    </Badge>
                  </Td>

                  <Td textAlign="center">

  <HStack spacing={2} justify="flex-start">

    <IconButton
      icon={<FiEdit2 />}
      size="sm"
      colorScheme="blue"
      variant="outline"
      aria-label="Edit Godown"
     onClick={() => navigate( `/inventory/edit-godown/${item?.id}` ) }
    />

  {item?.godown_name !== "PRIMARY" && (
  <IconButton
    icon={<FiTrash2 />}
    size="sm"
    colorScheme="red"
    variant="outline"
    aria-label="Delete Godown"
    onClick={() => handleDeleteModel(item?.id)}
  />
)}

  </HStack>

</Td>


                </Tr>

              ))

            ) : (

              <Tr>

                <Td
                  colSpan={7}
                  textAlign="center"
                  py={10}
                >
                  <Text color="gray.500">
                    No Godown Found
                  </Text>
                </Td>

              </Tr>

            )}

          </Tbody>

        </Table>

      </Box>

      {/* ================================= */}
      {/* PAGINATION */}
      {/* ================================= */}

      {!loading && godownList.length > 0 && (

        <Flex
          justify="space-between"
          align="center"
          mt={5}
          flexWrap="wrap"
          gap={3}
        >

              <HStack>
          <Select
            w="100px"
            value={rowsPerPage}
            onChange={(e) => {

              setRowsPerPage(
                Number(e.target.value)
              );

              setCurrentPage(1);
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
          >

            Showing{" "}

            {(
              (currentPage - 1) *
              rowsPerPage
            ) + 1}

            {" "}to{" "}

            {Math.min(
              currentPage * rowsPerPage,
              pagination.totalRecords
            )}

            {" "}of{" "}

            {pagination.totalRecords}

            {" "}entries

          </Text>
          </HStack>

          <HStack>

            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() =>
                handlePageChange(
                  currentPage - 1
                )
              }
              isDisabled={currentPage === 1}
            />

            <Button
               bg="#237086"
                fontWeight="500" fontSize="14px"
                color="white"
                _hover={{
                  bg: "#1B5A6B"
                }}
                 px={1}
                borderRadius="12px" size='sm'
            >
              {currentPage}
            </Button>

            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() =>
                handlePageChange(
                  currentPage + 1
                )
              }
              isDisabled={
                currentPage ===
                pagination.totalPages
              }
            />

          </HStack>

        </Flex>

      )}
      <DeleteGodownModel deleteModelIsOpen={deleteModelIsOpen} deleteModelOnClose={deleteModelOnClose} selectedId={selectedId} fetchGodownList={fetchGodownList}/>
    </Box>
  );
};

export default GodownList;