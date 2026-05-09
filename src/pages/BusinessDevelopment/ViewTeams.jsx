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
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";

import {
  EditIcon,
  DeleteIcon,
  ViewIcon,
  SearchIcon,
} from "@chakra-ui/icons";

import { GoHomeFill } from "react-icons/go";

import { Link, useNavigate } from "react-router-dom";

import API from "../../services/api";

import { API_ENDPOINTS } from "../../services/endpoints";

const ViewTeams = () => {

  const toast = useToast();

  const navigate = useNavigate();

  // ===============================
  // STATES
  // ===============================

  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);

  const [limit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  // ===============================
  // GET TEAMS
  // ===============================

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

  // ===============================
  // DELETE TEAM
  // ===============================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this team?"
      );

    if (!confirmDelete) return;

    try {

      const response = await API.delete(
        `${API_ENDPOINTS.delete_team}/${id}`
      );

      if (response?.status === 200) {

        toast({
          title: "Success",
          description: "Team deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        getTeams();
      }

    } catch (error) {

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Delete failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ===============================
  // USE EFFECT
  // ===============================

  useEffect(() => {

    const delayDebounce = setTimeout(() => {
      getTeams();
    }, 500);

    return () => clearTimeout(delayDebounce);

  }, [page, search]);

  // ===============================
  // UI
  // ===============================

  return (
   <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md" >

      {/* HEADER */}

      <Box
        bg="white"
        borderRadius="16px"
        p={5}
        boxShadow="sm"
      >

        <Flex
          justifyContent="space-between"
          alignItems={{
            base: "start",
            md: "center"
          }}
          flexDirection={{
            base: "column",
            md: "row"
          }}
          gap={4}
        >

          <Box>

            <Breadcrumb
              fontSize="sm"
              color="gray.500"
            >

              <BreadcrumbItem>

                <BreadcrumbLink
                  as={Link}
                  to="/dashboard"
                >
                  <GoHomeFill color="#5570F1" />
                </BreadcrumbLink>

              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage>

                <BreadcrumbLink>
                  View Teams
                </BreadcrumbLink>

              </BreadcrumbItem>

            </Breadcrumb>

            <Heading
              size="md"
              mt={2}
            >
              Business Development Teams
            </Heading>

          </Box>

          {/* SEARCH */}

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

        </Flex>
      </Box>

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

                  <Th textAlign="center">
                    Actions
                  </Th>

                </Tr>

              </Thead>

              <Tbody>

                {
                  teams?.length > 0 ? (

                    teams?.map((item, index) => (

                      <Tr key={item?.id}>

                        <Td>
                          {(page - 1) * limit + index + 1}
                        </Td>

                        <Td fontWeight="600">
                          {item?.name}
                        </Td>

                        <Td>
                          ₹
                          {Number(
                            item?.target_amount
                          ).toLocaleString()}
                        </Td>

                        <Td>
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

                              <Badge
                                colorScheme="green"
                                borderRadius="full"
                                px={3}
                                py={1}
                              >
                                Active
                              </Badge>

                            ) : (

                              <Badge
                                colorScheme="red"
                                borderRadius="full"
                                px={3}
                                py={1}
                              >
                                Completed
                              </Badge>
                            )
                          }

                        </Td>

                        <Td>

                          <HStack
                            justifyContent="center"
                          >

                            {/* VIEW SUBTEAMS */}

                            <Tooltip
                              label="View SubTeams"
                            >

                              <IconButton
                                icon={<ViewIcon />}
                                colorScheme="blue"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/view-subteams/${item?.id}`
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
                                    `/edit-team/${item?.id}`
                                  )
                                }
                              />

                            </Tooltip>

                            {/* DELETE */}

                            <Tooltip
                              label="Delete Team"
                            >

                              <IconButton
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                size="sm"
                                onClick={() =>
                                  handleDelete(
                                    item?.id
                                  )
                                }
                              />

                            </Tooltip>

                          </HStack>

                        </Td>

                      </Tr>
                    ))

                  ) : (

                    <Tr>

                      <Td
                        colSpan={6}
                        textAlign="center"
                        py={10}
                      >

                        <Text
                          color="gray.500"
                        >
                          No Teams Found
                        </Text>

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

      <Flex
        justifyContent="space-between"
        alignItems="center"
        mt={5}
        flexWrap="wrap"
        gap={3}
      >

        <Text
          fontSize="sm"
          color="gray.600"
        >
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

    </Box>
  );
};

export default ViewTeams;