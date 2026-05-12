import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Heading, HStack, IconButton, Input, InputGroup, InputLeftElement, Table, Thead, Tbody, Tr, Th, Td, Text, Badge, Spinner,
  useToast, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Avatar, Menu, MenuButton, MenuList, MenuItem, Tag, Wrap, WrapItem, Select, VStack, useDisclosure} from "@chakra-ui/react";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, EditIcon, DeleteIcon} from "@chakra-ui/icons";
import { FiMoreVertical, FiUsers} from "react-icons/fi";
import { GoHomeFill} from "react-icons/go";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import DeleteSubteamModel from "../../components/models/DeleteSubteamModel";
import EditSubteamModel from "../../components/models/EditSubteamModel";

const ViewSubTeam = () => {

  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  // ================= STATES =================

  const [loading, setLoading] = useState(false);
  const [subTeamList, setSubTeamList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState();
const {isOpen : deleteModelIsOpen , onOpen: deleteModelOnOpen, onClose: deleteModelOnClose} = useDisclosure();
const {isOpen: isEditModelOpen, onOpen: onUpdateModelOpen, onClose: onEditModelClose} = useDisclosure();
const [selectedSubteam, setSelectedSubteam] =
  useState(null);

const onEditModelOpen = (item) => {

  setSelectedSubteam(item);

  onUpdateModelOpen();
};

const handleCloseEditModal = () => {

  setSelectedSubteam(null);

  onEditModelClose();
};
  

  const limit = 10;

  // ================= FETCH SUB TEAMS =================

  const getSubteamsList = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `${API_ENDPOINTS.get_subTeam_by_team}/${id}?page=${currentPage}&limit=${limit}&search=${search}`);

      if (response?.status === 200) {
        setSubTeamList( response?.data?.data || [] );
        setTotal( response?.data?.total || 0 );
        setTotalPages( response?.data?.totalPages || 1 );
      }

    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to fetch sub teams",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubteam = (id)=>{
    setSelectedId(id);
    deleteModelOnOpen();
  }

  const handleUpdateSubteam = (id)=>{
    setSelectedId(id);
    onUpdateModelOpen();
  }


  useEffect(() => {
    const delayDebounce =
      setTimeout(() => {
        getSubteamsList();
      }, 500);

    return () =>
      clearTimeout(delayDebounce);
  }, [search, currentPage]);

  return (

    <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md">

      {/* ================= BREADCRUMB ================= */}

      <Breadcrumb mb={5} fontSize="14px" color="gray.500">

        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/dashboard" >
            <GoHomeFill />
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/team-list" > Teams </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink> Sub Teams </BreadcrumbLink>
        </BreadcrumbItem>

      </Breadcrumb>

      {/* ================= HEADER ================= */}

      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>

        <Box>
          <Heading           size="md"
          color="gray.600" fontSize="18px" height="36px"  > Sub Teams </Heading>

          <Text  color="gray.500" fontSize="14px" >
            Manage all sub teams and targets
          </Text>

        </Box>

        <Button
          bg="#237086"
          color="white"
          _hover={{
            bg: "#1B5A6B"
          }}
          borderRadius="12px"
          onClick={() =>
            navigate(
              `/business-development/create-sub-team`
            )
          }
        >
          Create Sub Team
        </Button>

      </Flex>

      {/* ================= FILTER SECTION ================= */}

    
        <Flex justify="space-between" align="center" wrap="wrap" gap={4} marginBottom="16px">

          <InputGroup maxW="350px" >
            <InputLeftElement pointerEvents="none" >
              <SearchIcon color="gray.400" />
            </InputLeftElement>

            <Input
              placeholder="Search sub team..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              borderRadius="12px"
              borderColor="gray.300"
              _focus={{
                borderColor:
                  "#237086",
                boxShadow:
                  "0 0 0 1px #237086"
              }}
            />

          </InputGroup>

          <Badge bg="blue.50" color="blue.600" px={4} py={2} borderRadius="10px" fontSize="13px" >
            Total :
            {" "}
            {total}
          </Badge>
        </Flex>

      {/* ================= TABLE ================= */}

      <Box
        bg="white"
        borderRadius="18px"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
        overflowX="auto"
      >

        <Table variant="simple">

          <Thead bg="gray.50">

            <Tr>

              <Th>Sub Team</Th>

              <Th> Target Amount </Th>

              <Th>
                Pending Amount
              </Th>

              <Th>
                Categories
              </Th>

              <Th textAlign="center">
                Actions
              </Th>

            </Tr>

          </Thead>

          <Tbody>

            {loading ? (

              <Tr>

                <Td
                  colSpan={5}
                  textAlign="center"
                  py={10}
                >
                  <Spinner
                    color="blue.500"
                  />
                </Td>

              </Tr>

            ) : subTeamList.length > 0 ? (

              subTeamList.map(
                (item) => (

                  <Tr key={item.id}>

                    {/* NAME */}

                    <Td>

                      <HStack
                        spacing={3}
                      >

                        <Avatar
                          size="sm"
                          bg="#237086"
                          name={item.name}
                        />

                        <Box>

                          <Text
                            fontWeight="600"
                            color="gray.700"
                          >
                            {item.name}
                          </Text>

                          <Text
                            fontSize="12px"
                            color="gray.500"
                          >
                            ID :
                            {" "}
                            {item.id}
                          </Text>

                        </Box>

                      </HStack>

                    </Td>

                    {/* TARGET */}

                    <Td>

                      <Badge
                        colorScheme="blue"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        ₹{" "}
                        {
                          item.sub_team_target_amount
                        }
                      </Badge>

                    </Td>

                    {/* PENDING */}

                    <Td>

                      <Badge
                        colorScheme="green"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        ₹{" "}
                        {
                          item.pending_target_amount
                        }
                      </Badge>

                    </Td>

                    {/* CATEGORIES */}

                    <Td>

                      <Wrap>

                        {item.categories?.map(
                          (
                            cat,
                            index
                          ) => (

                            <WrapItem
                              key={index}
                            >

                              <Tag
                                size="sm"
                                borderRadius="full"
                                colorScheme="purple"
                              >
                                {cat}
                              </Tag>

                            </WrapItem>
                          )
                        )}

                      </Wrap>

                    </Td>

                    {/* ACTIONS */}

                    <Td
                      textAlign="center"
                    >

                      <Menu>

                        <MenuButton
                          as={
                            IconButton
                          }
                          icon={
                            <FiMoreVertical />
                          }
                          variant="ghost"
                        />

                        <MenuList>

                          <MenuItem icon={ <EditIcon /> }
                              onClick={() => onEditModelOpen(item)} >
                            Edit
                          </MenuItem>

                          <MenuItem
                            icon={
                              <DeleteIcon />
                            }
                            color="red.500"
                            onClick={() =>
                              handleDeleteSubteam(
                                item.id
                              )
                            }
                          >
                            Delete
                          </MenuItem>

                        </MenuList>

                      </Menu>

                    </Td>

                  </Tr>
                )
              )

            ) : (

              <Tr>

                <Td
                  colSpan={5}
                  textAlign="center"
                  py={10}
                >

                  <VStack>

                    <FiUsers
                      size={35}
                      color="#CBD5E0"
                    />

                    <Text
                      color="gray.500"
                    >
                      No sub teams found
                    </Text>

                  </VStack>

                </Td>

              </Tr>
            )}

          </Tbody>

        </Table>

      </Box>

      {/* ================= PAGINATION ================= */}

      <Flex
        justify="space-between"
        align="center"
        mt={5}
        wrap="wrap"
        gap={4}
      >

        <Text
          fontSize="14px"
          color="gray.500"
        >
          Showing Page
          {" "}
          {currentPage}
          {" "}
          of
          {" "}
          {totalPages}
        </Text>

        <HStack>

          <Button
            leftIcon={
              <ChevronLeftIcon />
            }
            size="sm"
            variant="outline"
            isDisabled={
              currentPage === 1
            }
            onClick={() =>
              setCurrentPage(
                (prev) =>
                  prev - 1
              )
            }
          >
            Previous
          </Button>

          <Button
            rightIcon={
              <ChevronRightIcon />
            }
            size="sm"
            variant="outline"
            isDisabled={
              currentPage ===
              totalPages
            }
            onClick={() =>
              setCurrentPage(
                (prev) =>
                  prev + 1
              )
            }
          >
            Next
          </Button>

        </HStack>

      </Flex>
        <DeleteSubteamModel deleteModelIsOpen={deleteModelIsOpen} deleteModelOnClose={deleteModelOnClose} getSubteamsList={getSubteamsList} selectedId={selectedId}/>
       <EditSubteamModel
  isEditModelOpen={isEditModelOpen}
  onEditModelClose={handleCloseEditModal}
  getSubteamsList={getSubteamsList}
  selectedSubteam={selectedSubteam}
/>
    </Box>
  );
};

export default ViewSubTeam;