import React, { useEffect, useState } from "react";
import {
  Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, HStack, Heading, IconButton, Input, InputGroup,
  InputLeftElement, Spinner, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr, useToast, VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ViewIcon, SearchIcon } from "@chakra-ui/icons";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import DeleteTeamModel from "../../components/models/DeleteTeamModel";

const ViewTeams = () => {

  const toast = useToast();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const { isOpen: deleteModelIsOpen, onOpen: deleteModelOnOpen, onClose: deleteModelOnClose } = useDisclosure();
  const [selectedId, setSelectedId] = useState();

  const getTeams = async () => {

    try {
      setLoading(true);
      const response = await API.get(
        `${API_ENDPOINTS.get_team_list}?page=${page}&limit=${limit}&search=${search}`
      );

      if (response?.status === 200) {
        setTeams(response?.data?.data || []);
        setTotalPages(
          response?.data?.totalPages || 1
        );
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong",
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
      getTeams();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  const handleDeleteModel = (id) => {
    setSelectedId(id)
    deleteModelOnOpen()
  }


  return (
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
             View Team List
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* SEARCH */}
      <HStack justifyContent="space-between" mb={4}>
      <Text
       fontSize="14px" fontWeight="600" color='#494949'
        mt={2}
      >
        Business Development Teams
      </Text>
      <InputGroup
        maxW="350px"
      >

        <InputLeftElement>
          <SearchIcon color="gray.400" />
        </InputLeftElement>

        <Input
          placeholder="Search team name..."
          value={search}
          onChange={(e) => {

            setPage(1);

            setSearch(e.target.value);
          }}
          bg="gray.50"
        />

      </InputGroup>
</HStack>



      {/* TABLE */}

      <Box
        bg="white"
        mt={5}
        borderRadius="16px"
        overflowX="auto"
        boxShadow="sm"
      >

        {
          loading ? (

            <Flex
              justifyContent="center"
              alignItems="center"
              py={20}
            >
              <Spinner
                size="lg"
                color="blue.500"
              />
            </Flex>

          ) : (

            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>S.No</Th>
                  <Th>Team Name</Th>
                  <Th>Total Target</Th>
                  <Th>Pending Target</Th>
                  <Th>Status</Th>
                  <Th textAlign="center"> Actions </Th>
                </Tr>
              </Thead>

              <Tbody>

                {
                  teams?.length > 0 ? (
                    teams?.map((item, index) => (
                      <Tr key={item?.id}>

                        <Td> {(page - 1) * limit + index + 1} </Td>
                        <Td fontWeight="500" fontSize="14px" color="494949"> {item?.name} </Td>
                        <Td fontSize="14px"> ₹ {Number(item?.target_amount).toLocaleString()} </Td>

                        <Td fontSize="14px">
                          ₹
                          {Number(
                            item?.pending_target_amount
                          ).toLocaleString()}
                        </Td>

                        <Td>

                          {
                            Number(
                              item?.pending_target_amount
                            ) > 0 ? (

                              <Badge colorScheme="green" borderRadius="full" px={3} py={1} >
                                Active
                              </Badge>

                            ) : (

                              <Badge colorScheme="red" borderRadius="full" px={3} py={1} >
                                Completed
                              </Badge>
                            )
                          }

                        </Td>

                        <Td>

                          <HStack justifyContent="center" >
                            <Tooltip label="View SubTeams" >
                              <IconButton
                                icon={<ViewIcon />}
                                colorScheme="blue"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/business-development/view-subteams/${item?.id}`
                                  )
                                }
                              />

                            </Tooltip>

                            {/* EDIT */}

                            <Tooltip
                              label="Edit Team"
                            >

                              <IconButton
                                icon={<EditIcon />}
                                colorScheme="orange"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/business-development/edit-team/${item?.id}`
                                  )
                                }
                              />

                            </Tooltip>

                            {/* DELETE */}

                            <Tooltip label="Delete Team">
                              <IconButton
                                icon={<DeleteIcon />} colorScheme="red" size="sm"
                                onClick={() => handleDeleteModel(item?.id)} />
                            </Tooltip>
                          </HStack>

                        </Td>

                      </Tr>
                    ))

                  ) : (

                    <Tr>

                      <Td colSpan={6} textAlign="center" py={10} >
                        <Text color="gray.500"> No Teams Found </Text>
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

      <Flex justifyContent="space-between" alignItems="center" mt={5} flexWrap="wrap" gap={3} >

        <Text fontSize="sm" color="gray.600" >
          Page {page} of {totalPages}
        </Text>

        <HStack>

          <Button
            size="sm"
            onClick={() =>
              setPage((prev) => prev - 1)
            }
            isDisabled={page === 1}
          >
            Previous
          </Button>

          <Button
            size="sm"
            onClick={() =>
              setPage((prev) => prev + 1)
            }
            isDisabled={page === totalPages}
          >
            Next
          </Button>

        </HStack>
      </Flex>

      <DeleteTeamModel deleteModelIsOpen={deleteModelIsOpen} deleteModelOnClose={deleteModelOnClose} getTeams={getTeams} selectedId={selectedId} />

    </Box>
  );
};

export default ViewTeams;