import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardBody, Flex, FormControl, FormLabel, Grid, Heading,
  HStack, Input, Select, Stack, Text, useToast, Badge, Divider, IconButton, Spinner,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, VStack, SimpleGrid, InputGroup, InputLeftElement,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon,} from "@chakra-ui/icons";
import { GoHomeFill} from "react-icons/go";
import { FiUsers, FiTarget, FiLayers,} from "react-icons/fi";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const AssignTargetRSM = () => {

  const toast = useToast();

  const allowedRolesMap = {

    SUBTEAM: [ "ZSM", "RSM", "ASM", "TSM", "SM", "FA" ],
    ZSM: [ "RSM", "ASM", "TSM", "SM", "FA" ],
    RSM: [ "ASM", "TSM", "SM", "FA"],
    ASM: [ "TSM", "SM", "FA" ],
    TSM: [ "SM", "FA"],
    SM: [ "FA" ]
  };

  const roleLevelMap = { ZSM: 1, RSM: 2, ASM: 3, TSM: 4, SM: 5, FA: 6 };

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [subTeams, setSubTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedSubTeam, setSelectedSubTeam] = useState("");

  const [parentType, setParentType] = useState("SUBTEAM");
  const [assignRole, setAssignRole] = useState("");
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingTarget, setPendingTarget] = useState(0);

  const [assignments, setAssignments] =
    useState([
      {
        user_id: "",
        target: ""
      }
    ]);

  const allowedRoles = allowedRolesMap[parentType] || [];

  const totalAssigned = useMemo(() => {

    return assignments.reduce(
      (sum, item) =>
        sum + Number(item.target || 0),
      0
    );

  }, [assignments]);

  const remainingTarget =  pendingTarget - totalAssigned;


  const fetchTeams = async () => {
    try {
      const res = await API.get(
        API_ENDPOINTS.get_team_list
      );

      setTeams(res.data.data || []);

    } catch (error) {

      console.log(error);
    }
  };

  // =========================================
  // FETCH SUB TEAMS
  // =========================================

  const fetchSubTeams = async (teamId) => {

    try {

      const res = await API.get(
        `${API_ENDPOINTS.get_subTeam_by_team}/${teamId}`
      );

      setSubTeams(res.data.data || []);

    } catch (error) {

      console.log(error);
    }
  };

  // =========================================
  // FETCH USERS
  // =========================================

  const fetchUsersByRole = async (role) => {

    try {

      const level = roleLevelMap[role];

      const res = await API.get(
        `${API_ENDPOINTS.get_users_by_role}/${level}`
      );

      setUsers(res.data.data || res.data || []);

    } catch (error) {

      console.log(error);
    }
  };

  // =========================================
  // FETCH ASSIGNMENTS
  // =========================================

  const fetchAssignments = async () => {

    try {

      if (
        !selectedSubTeam ||
        parentType === "SUBTEAM"
      ) {
        return;
      }

      const res = await API.get(
        `${API_ENDPOINTS.get_assigned_targets}?role=${parentType}&sub_team_id=${selectedSubTeam}`
      );

      setAssignmentsList(
        res.data.data || []
      );

    } catch (error) {

      console.log(error);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    fetchTeams();

  }, []);

  // =========================================
  // FETCH USERS ON ROLE CHANGE
  // =========================================

  useEffect(() => {

    if (assignRole) {

      fetchUsersByRole(assignRole);
    }

  }, [assignRole]);

  // =========================================
  // FETCH ASSIGNMENTS
  // =========================================

  useEffect(() => {

    fetchAssignments();

  }, [
    parentType,
    selectedSubTeam
  ]);


  const handleTeamChange = async (e) => {
    const value = e.target.value;
    setSelectedTeam(value);
    setSelectedSubTeam("");
    setPendingTarget(0);
    setAssignmentsList([]);
    setSelectedAssignment("");
    await fetchSubTeams(value);
  };

  // =========================================
  // SUB TEAM CHANGE
  // =========================================

  const handleSubTeamChange = (e) => {

    const value = e.target.value;

    setSelectedSubTeam(value);

    const selected = subTeams.find(
      item => item.id == value
    );

    if (selected) {

      setPendingTarget(
        Number(
          selected.pending_target_amount
        )
      );
    }
  };

  // =========================================
  // PARENT ASSIGNMENT SELECT
  // =========================================

  const handleAssignmentSelect = (e) => {

    const value = e.target.value;

    setSelectedAssignment(value);

    const selected =
      assignmentsList.find(
        item => item.id == value
      );

    if (selected) {

      setPendingTarget(
        Number(selected.pending_target)
      );
    }
  };

  const handleRowChange = (
    index,
    field,
    value
  ) => {

    const updated = [...assignments];

    updated[index][field] = value;

    setAssignments(updated);
  };

  const addRow = () => {

    setAssignments([
      ...assignments,
      {
        user_id: "",
        target: ""
      }
    ]);
  };

  const removeRow = (index) => {

    const updated =
      assignments.filter(
        (_, i) => i !== index
      );

    setAssignments(updated);
  };

  const resetForm = () => {

  setSelectedTeam("");
  setSelectedSubTeam("");

  setParentType("SUBTEAM");

  setAssignRole("");

  setAssignmentsList([]);

  setSelectedAssignment("");

  setUsers([]);

  setPendingTarget(0);

  setAssignments([
    {
      user_id: "",
      target: ""
    }
  ]);

  setSubTeams([]);
};

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!selectedTeam) {
        toast({
          title: "Select team",
          status: "warning",
          position: "top-right"
        });

        return;
      }

      if (!selectedSubTeam) {

        toast({
          title: "Select subteam",
          status: "warning",
          position: "bottom"
        });

        return;
      }

      if (!assignRole) {

        toast({
          title: "Select role",
          status: "warning",
          position: "bottom"
        });

        return;
      }

      if (
        totalAssigned > pendingTarget
      ) {

        toast({
          title:
            "Assigned target exceeds pending target",
          status: "error",
          position: "bottom"
        });

        return;
      }

      const ids = assignments.map(
        item => item.user_id
      );

      const duplicate =
        new Set(ids).size !== ids.length;

      if (duplicate) {

        toast({
          title:
            "Duplicate users not allowed",
          status: "error",
          position: "bottom"
        });

        return;
      }

      let payload = {

        team_id: selectedTeam,

        sub_team_id: selectedSubTeam,

        parent_type: parentType,

        assignments: assignments.map(
          item => ({
            user_id: item.user_id,
            role: assignRole,
            target: item.target
          })
        )
      };

      if (parentType === "SUBTEAM") {

        payload.parent_id =
          selectedSubTeam;
      }

      else {

        const selectedParent =
          assignmentsList.find(
            item =>
              item.id ==
              selectedAssignment
          );

        payload.parent_assignment_id =
          selectedAssignment;

        payload.parent_id =
          selectedParent.user_id;
      }

      const res = await API.post(
        API_ENDPOINTS.assign_target,
        payload
      );

      toast({
        title: res.data.message,
        status: "success",
        position: "bottom"
      });

      resetForm();

    } catch (error) {
      console.log(error);
      toast({
        title:
          error.response?.data?.message ||
          "Something went wrong",
        status: "error",
        position: "bottom"
      });

    } finally {

      setLoading(false);
    }
  };

return (
  <Box w="100%" bg="#f5f5f5">

    {/* ================= TOP STATS ================= */}

    <SimpleGrid
      columns={{
        base: 1,
        md: 2
      }}
      spacing={5}
      mb={6}
    >

      {/* PENDING */}

      <Box
        bg="white"
        borderRadius="16px"
        p={5}
        border="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
      >
        <HStack
          justify="space-between"
          align="center"
        >

          <Box>

            <Text
              fontSize="13px"
              color="gray.500"
              mb={1}
            >
              Pending Target
            </Text>

            <Heading
              size="md"
              color="gray.700" lineHeight={1}
            >
              ₹ {pendingTarget}
            </Heading>

          </Box>

          <Flex
            align="center"
            justify="center"
            w="45px"
            h="45px"
            borderRadius="12px"
            bg="#EDF2F7"
          >
            <FiTarget
              size={22}
              color="#4A5568"
            />
          </Flex>

        </HStack>
      </Box>

      {/* REMAINING */}

      <Box
        bg="white"
        borderRadius="16px"
        p={5}
        border="1px solid"
        borderColor="gray.100"
        boxShadow="sm"
      >
        <HStack
          justify="space-between"
          align="center"
        >

          <Box>

            <Text
              fontSize="13px"
              color="gray.500"
              mb={1}
            >
              Remaining Target
            </Text>

            <Heading
              size="md" lineHeight={1}
              color={
                remainingTarget < 0
                  ? "red.500"
                  : "green.500"
              }
            >
              ₹ {remainingTarget}
            </Heading>

          </Box>

          <Flex
            align="center"
            justify="center"
            w="45px"
            h="45px"
            borderRadius="12px"
            bg={
              remainingTarget < 0
                ? "red.50"
                : "green.50"
            }
          >
            <FiLayers
              size={22}
              color={
                remainingTarget < 0
                  ? "#E53E3E"
                  : "#38A169"
              }
            />
          </Flex>

        </HStack>
      </Box>

    </SimpleGrid>

    {/* ================= FILTER SECTION ================= */}

    <Box
      bg="white"
      borderRadius="18px"
      border="1px solid"
      borderColor="gray.100"
      p={{
        base: 4,
        md: 6
      }}
      boxShadow="sm"
      mb={6}
    >

      <SimpleGrid
        columns={{
          base: 1,
          md: 2,
          lg: 4
        }}
        spacing={5}
      >

        {/* TEAM */}

        <FormControl>

          <FormLabel
            fontSize="14px"
            fontWeight="500"
            color="gray.600"
          >
            Team
          </FormLabel>

          <Select
            placeholder="Select Team"
            value={selectedTeam}
            onChange={handleTeamChange}
            h="40px"
            borderRadius="12px"
            borderColor="gray.200"
            color="gray.700"
            fontSize="15px"
            _focus={{
              borderColor: "#237086",
              boxShadow:
                "0 0 0 1px #237086"
            }}
          >
            {teams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </Select>

        </FormControl>

        {/* SUB TEAM */}

        <FormControl>

          <FormLabel
            fontSize="14px"
            fontWeight="500"
            color="gray.600"
          >
            Sub Team
          </FormLabel>

          <Select
            placeholder="Select Sub Team"
            value={selectedSubTeam}
            onChange={handleSubTeamChange}
            h="40px"
            borderRadius="12px"
            borderColor="gray.200"
             color="gray.700"
            fontSize="15px"
            _focus={{
              borderColor: "#237086",
              boxShadow:
                "0 0 0 1px #237086"
            }}
          >
            {subTeams.map((sub) => (
              <option
                key={sub.id}
                value={sub.id}
              >
                {sub.name}
              </option>
            ))}
          </Select>

        </FormControl>

        {/* ASSIGN FROM */}

        <FormControl>

          <FormLabel
            fontSize="14px"
            fontWeight="500"
            color="gray.600"
          >
            Assign From
          </FormLabel>

          <Select
            value={parentType}
            onChange={(e) =>
              setParentType(
                e.target.value
              )
            }
            h="40px"
            borderRadius="12px"
            borderColor="gray.200"
             color="gray.700"
            fontSize="14px"
            _focus={{
              borderColor: "#237086",
              boxShadow:
                "0 0 0 1px #237086"
            }}
          >
            <option value="SUBTEAM">
              SUBTEAM
            </option>

            <option value="ZSM">
              ZSM
            </option>

            <option value="RSM">
              RSM
            </option>

            <option value="ASM">
              ASM
            </option>

            <option value="TSM">
              TSM
            </option>

            <option value="SM">
              SM
            </option>

          </Select>

        </FormControl>

        {/* ASSIGN TO ROLE */}

        <FormControl>

          <FormLabel
            fontSize="14px"
            fontWeight="500"
            color="gray.600"
          >
            Assign To Role
          </FormLabel>

          <Select
            placeholder="Select Role"
            value={assignRole}
            onChange={(e) =>
              setAssignRole(
                e.target.value
              )
            }
            h="40px"
            borderRadius="12px"
            borderColor="gray.200"
             color="gray.700"
            fontSize="15px"
            _focus={{
              borderColor: "#237086",
              boxShadow:
                "0 0 0 1px #237086"
            }}
          >
            {allowedRoles.map(
              (role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              )
            )}
          </Select>

        </FormControl>

      </SimpleGrid>

      {/* PARENT ASSIGNMENT */}

      {parentType !==
        "SUBTEAM" && (
        <Box mt={5}>

          <FormControl>

            <FormLabel
              fontSize="14px"
              fontWeight="500"
              color="gray.600"
            >
              Parent Assignment
            </FormLabel>

            <Select
              placeholder="Select Parent Assignment"
              value={
                selectedAssignment
              }
              onChange={
                handleAssignmentSelect
              }
              h="40px"
              borderRadius="12px"
              borderColor="gray.200"
              _focus={{
                borderColor:
                  "#237086",
                boxShadow:
                  "0 0 0 1px #237086"
              }}
            >
              {assignmentsList.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                    {" | "}
                    ₹{" "}
                    {
                      item.pending_target
                    }
                  </option>
                )
              )}
            </Select>

          </FormControl>

        </Box>
      )}

    </Box>

    {/* ================= ASSIGNMENTS SECTION ================= */}

    <Box
      bg="white"
      borderRadius="18px"
      border="1px solid"
      borderColor="gray.100"
      p={{
        base: 4,
        md: 6
      }}
      boxShadow="sm"
    >

      <Flex
        justify="space-between"
        align="center"
        mb={6}
        wrap="wrap"
        gap={4}
      >

        <Box>

          <Heading
            size="md"
            color="gray.700"
          >
            User Assignments
          </Heading>

          <Text
            fontSize="13px"
            color="gray.500"
          >
            Assign targets to users
          </Text>

        </Box>

        <Button
          leftIcon={<AddIcon fontSize="14px"/>}
          onClick={addRow}
          bg="#237086"
          color="white" fontWeight='500'
          _hover={{
            bg: "#1B5A6B"
          }}
          fontSize="14px" 
          borderRadius="6px"
          px={5}
        >
          Add More
        </Button>

      </Flex>

      <VStack
        spacing={5}
        align="stretch"
      >

        {assignments.map(
          (item, index) => (

            <Box
              key={index}
              border="1px solid"
              borderColor="gray.100"
              borderRadius="16px"
              p={5}
              bg="gray.50"
            >

              <Flex
                justify="space-between"
                align="center"
                mb={5}
              >

                <HStack>

                  <Flex
                    align="center"
                    justify="center"
                    w="42px"
                    h="42px"
                    borderRadius="10px"
                    bg="white"
                  >
                    <FiUsers
                      size={18}
                      color="#237086"
                    />
                  </Flex>

                  <Box>

                    <Text
                      fontWeight="500"
                      color="gray.700"
                    >
                      Assignment #
                      {index + 1}
                    </Text>

                    <Text
                      fontSize="12px"
                      color="gray.500"
                    >
                      Configure user target
                    </Text>

                  </Box>

                </HStack>

                {assignments.length >
                  1 && (
                  <IconButton
                    icon={
                      <DeleteIcon />
                    }
                    colorScheme="red"
                    variant="ghost"
                    borderRadius="10px"
                    onClick={() =>
                      removeRow(
                        index
                      )
                    }
                  />
                )}

              </Flex>

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "2fr 1fr"
                }}
                gap={5}
              >

                {/* USER */}

                <FormControl>

                  <FormLabel
                    fontSize="14px"
                    fontWeight="500"
                    color="gray.600"
                  >
                    Select User
                  </FormLabel>

                  <Select
                    placeholder="Choose User"
                    value={
                      item.user_id
                    }
                    onChange={(
                      e
                    ) =>
                      handleRowChange(
                        index,
                        "user_id",
                        e.target.value
                      )
                    }
                    h="40px"
                    bg="white"
                    borderRadius="12px"  color="gray.700"
            fontSize="15px"
                    borderColor="gray.200"
                    _focus={{
                      borderColor:
                        "#237086",
                      boxShadow:
                        "0 0 0 1px #237086"
                    }}
                  >
                    {users.map(
                      (user) => (
                        <option
                          key={
                            user.id
                          }
                          value={
                            user.id
                          }
                        >
                          {
                            user.name
                          }
                        </option>
                      )
                    )}
                  </Select>

                </FormControl>

                {/* TARGET */}

                <FormControl>

                  <FormLabel
                    fontSize="14px"
                    fontWeight="500"
                    color="gray.600"
                  >
                    Target Amount
                  </FormLabel>

                  <InputGroup>

                    <InputLeftElement
                      pointerEvents="none"
                      h="40px"
                    >
                      ₹
                    </InputLeftElement>

                    <Input
                      type="number"
                      placeholder="Enter target"
                      value={
                        item.target
                      }
                      onChange={(
                        e
                      ) =>
                        handleRowChange(
                          index,
                          "target",
                          e.target.value
                        )
                      }
                      h="40px"
                      bg="white"
                      borderRadius="12px"
                      borderColor="gray.200"
                      _focus={{
                        borderColor:
                          "#237086",
                        boxShadow:
                          "0 0 0 1px #237086"
                      }}
                    />

                  </InputGroup>

                </FormControl>

              </Grid>

            </Box>
          )
        )}

      </VStack>

      {/* ================= FOOTER ================= */}

      <Flex
        mt={8}
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={4}
      >

        <Badge
          bg={
            remainingTarget < 0
              ? "red.50"
              : "green.50"
          }
          color={
            remainingTarget < 0
              ? "red.600"
              : "green.600"
          }
          px={5}
          py={3}
          borderRadius="12px"
          fontSize="14px"
          fontWeight="500"
        >
          Total Assigned :
          {" "}
          ₹ {totalAssigned}
        </Badge>

        <Button
          bg="#237086"
          color="white"
          _hover={{
            bg: "#1B5A6B"
          }}
          px={10}
          h="40px" fontWeight='500'
          borderRadius="6px"
          onClick={handleSubmit}
          isDisabled={loading}
        >
          {loading ? (
            <Spinner
              size="sm"
            />
          ) : (
            "Assign Target"
          )}
        </Button>

      </Flex>

    </Box>

  </Box>
);
};

export default AssignTargetRSM;