import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack, Heading, Input, Button,
  Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Spinner, useToast, Tooltip, IconButton, useDisclosure, } from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DeleteGroupModal from "../../../components/models/DeleteAccountGroupModal";

const ViewGroup = () => {

  const toast = useToast();
  const navigate = useNavigate();
  const [accountsList, setAccountsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedId, setSelectedId]= useState();
  const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()

  const getAccountList = async (
    currentPage = page,
    currentSearch = search
  ) => {

    try {
      setLoading(true);
      const response = await API.get(
        `${API_ENDPOINTS?.get_account_group_list}?page=${currentPage}&limit=${limit}&search=${currentSearch}`
      );
      if (response?.status === 200) {
        setAccountsList(response?.data?.data || []);
        setTotalPages(
          response?.data?.pagination?.totalPages || 1
        );
        setTotalRecords(
          response?.data?.pagination?.total || 0
        );
      }

    } catch (error) {

      console.log(error);

      toast({
        title: "Error",
        description: "Failed to fetch groups",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {

      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    getAccountList(1, value);
  };


  const handlePrevious = () => {

    if (page > 1) {

      const prevPage = page - 1;

      setPage(prevPage);

      getAccountList(prevPage, search);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      getAccountList(nextPage, search);
    }
  };

  useEffect(() => {
    getAccountList();
  }, []);

  const handleDelete = (id)=>{
   setSelectedId(id) ;
   onDeleteModalOpen();
  }

  return (
    <Box
     bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md"
    >

      {/* BREADCRUMB */}

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
              View Group
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

      </HStack>

      {/* HEADING */}

      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={6}
      >

        <Heading
          size="md"
          textAlign="left"
        >
          View Group
        </Heading>

        <Button
          className="submit_btn"
          onClick={() =>
            navigate("/accounting-master/create-group")
          }
        >
          Create Group
        </Button>

      </Flex>

      {/* SEARCH */}

      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={5}
      >

        <Input
          placeholder="Search group..."
          width="300px"
          value={search}
          onChange={handleSearch}
        />

        <Text
          fontSize="14px"
          fontWeight="500"
        >
          Total Records : {totalRecords}
        </Text>

      </Flex>

      {/* TABLE */}

      <Box
        overflowX="auto"
        border="1px solid #E2E8F0"
        borderRadius="md"
      >

        <Table variant="simple" className="productsTable">

          <Thead bg="#F9FAFB">

            <Tr>
              <Th>S.No</Th>
              <Th>Group Name</Th>
              <Th>Parent Group</Th>
              <Th>Sub Ledger</Th>
              <Th>Nett Debit/Credit</Th>
              <Th>Calculation</Th>
              <Th>Method Allocate</Th>
              <Th>Status</Th>
              <Th textAlign="center"> Actions</Th>
            </Tr>

          </Thead>
          <Tbody>

            {loading ? (

              <Tr>

                <Td colSpan={9} textAlign="center">
                  <Spinner />
                </Td>

              </Tr>

            ) : accountsList?.length > 0 ? (

              accountsList?.map((group, index) => (

                <Tr key={group?.id}>
                  <Td> {(page - 1) * limit + index + 1} </Td>
                  <Td>{group?.group_name}</Td> 
                  <Td>{group?.parent_group_name || "-"} </Td>
                  <Td>  {group?.behaves_like_subledger === 1 ? "Yes" : "No"} </Td>
                  <Td> {group?.nett_debit_credit === 1 ? "Yes" : "No"} </Td>
                  <Td> {group?.used_for_calculation === 1 ? "Yes" : "No"} </Td>
                  <Td> {group?.method_to_allocate === 1 ? "Applicable" : "Not Applicable"} </Td>

                  <Td>
                    {group?.status === 1 ? "Active" : "Inactive"}
                  </Td>

                  <Td>
                    <Flex gap="8px">
                      <Tooltip label="Edit Group" hasArrow>
                        <IconButton
                          icon={<FiEdit2 />}
                          size="md"
                          variant="ghost"
                          color="blue.600"
                          _hover={{ bg: "blue.50" }}
                          aria-label="Edit Group"
                          onClick={() =>
                            navigate(`/accounting-master/edit-group/${group.id}`)
                          }/>
                      </Tooltip>

                      <Tooltip label="Delete Group" hasArrow>
                        <IconButton
                          icon={<FiTrash2 />}
                          size="md"
                          variant="ghost"
                          color="red.600"
                          _hover={{ bg: "red.50" }}
                          aria-label="Delete Group"
                          onClick={() => handleDelete(group?.id)}
                        />
                      </Tooltip>
                    </Flex>

                  </Td>

                </Tr>
              ))

            ) : (

              <Tr>
                <Td colSpan={9} textAlign="center" > No Data Found </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* PAGINATION */}

      <Flex justifyContent="space-between" alignItems="center" mt={5}>
        <Text fontSize="14px"> Page {page} of {totalPages} </Text>

        <Flex gap={3}>
          <Button onClick={handlePrevious} isDisabled={page === 1}>  Previous </Button>
          <Button onClick={handleNext} isDisabled={page === totalPages}> Next </Button>
        </Flex>
      </Flex>
      <DeleteGroupModal isDeleteModalOpen={isDeleteModalOpen} onDeleteModalClose={onDeleteModalClose} selectedId={selectedId} getAccountList={getAccountList}/>
    </Box>
  );
};

export default ViewGroup;