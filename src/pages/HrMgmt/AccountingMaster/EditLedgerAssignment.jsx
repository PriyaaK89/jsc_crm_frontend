import React, { useEffect, useState } from 'react';
import { Box, FormControl, FormLabel, Select, Button, Flex, HStack, Breadcrumb, BreadcrumbItem, Heading, BreadcrumbLink, SimpleGrid, Text, useToast, } from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import useUsersapi from '../../../Apis/GetUsersapi';
import API from '../../../services/api';
import { API_ENDPOINTS } from '../../../services/endpoints';

function EditLedgerAssignment() {

  const toast = useToast();
  const { users } = useUsersapi();
  const [ledger, setLedger] = useState([]);
  const [selectedLedgerId, setSelectedLedgerId] = useState("");
  const [currentEmployee, setCurrentEmployee] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);

  const getLedgerDropdown = async () => {
    try {
      const response = await API.get(API_ENDPOINTS.GET_LEDGER_DROPDOWN);
      if (response?.status === 200) {
        setLedger(response?.data?.data);
        console.log(response?.data?.data, "LedgerDropdown");
      }
    } catch (error) {
      console.log(error, "Error");
    }
  };

  useEffect(() => {
    getLedgerDropdown();
  }, []);

  // =========================
  // HANDLE LEDGER CHANGE
  // =========================
  const handleLedgerChange = (e) => {

    const ledgerId = Number(e.target.value);

    setSelectedLedgerId(ledgerId);

    if (!ledgerId) {
      setCurrentEmployee("");
      setSelectedEmployee("");
      return;
    }

    const selectedLedger = ledger.find(
      (item) => item.id === ledgerId
    );

    if (selectedLedger) {

      setCurrentEmployee(
        selectedLedger.emp_name || "Not Assigned"
      );

      setSelectedEmployee(
        selectedLedger.employee_under
          ? Number(selectedLedger.employee_under)
          : ""
      );
    }
  };


  const handleAssignLedger = async () => {
    try {
      if (!selectedLedgerId) {
        toast({
          title: "Please select ledger",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!selectedEmployee) {
        toast({
          title: "Please select employee",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setLoading(true);

      const payload = {
        ledger_id: Number(selectedLedgerId),
        employee_under: Number(selectedEmployee),
      };

      const response = await API.put(API_ENDPOINTS.REASSIGN_LEDGER, payload);
      if (response?.status === 200) {
        toast({
          title: "Ledger assigned successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // refresh dropdown data
        getLedgerDropdown();

        // update current employee name
        const selectedEmp = users.find(
          (emp) => emp.id == selectedEmployee
        );

        setCurrentEmployee(
          selectedEmp?.name || ""
        );
      }

    } catch (error) {
      console.log(error);
      toast({
        title: error?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md" >

        <HStack justifyContent='space-between'>
          <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px'>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to='/dashboard'>
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink color='#8B8D97' fontSize='13px' >
                Assign Ledger
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </HStack>

        <Heading size="md" textAlign="left" mb={6} color="#3d3d3d" >
          Assign Ledger
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} >
          <FormControl mt={5}>

            <FormLabel> Ledger Name </FormLabel>

            <Select
              fontSize="13px"
              placeholder='Select Ledger name'
              value={selectedLedgerId}
              onChange={handleLedgerChange}>

              {ledger?.map((p) => (

                <option
                  key={p?.id}
                  value={p?.id}
                >
                  {p?.ledger_name}
                </option>

              ))}

            </Select>

          </FormControl>

          {/* Employee Dropdown */}

          <FormControl mt={5}>

            <FormLabel>
              Employee under
            </FormLabel>

            <Select
              fontSize="13px"
              placeholder='Select employee under'
              value={selectedEmployee}
              onChange={(e) =>
                setSelectedEmployee(e.target.value)
              }
            >

              {users?.map((emp) => (

                <option
                  key={emp.id}
                  value={emp.id}
                >
                  {emp.name}
                </option>

              ))}

            </Select>

          </FormControl>

        </SimpleGrid>

        {/* Current Employee */}

        {/* Current Employee */}

        {selectedLedgerId && (
          <Box
            mt={6}
            p={4}
            borderRadius="14px"
            bg="linear-gradient(135deg, #F5F9FF 0%, #EEF4FF 100%)"
            border="1px solid #D6E4FF"
            boxShadow="sm"
          >
            <Flex
              align="center"
              justify="space-between"
              flexWrap="wrap"
              gap={3}
            >
              <Box>
                <Text
                  fontSize="12px"
                  color="gray.500"
                  fontWeight="500"
                  mb={1}
                >
                  CURRENTLY ASSIGNED EMPLOYEE
                </Text>

                <Text
                  fontSize="16px"
                  fontWeight="700"
                  color="#237086"
                  fontFamily="Poppins"
                >
                  {currentEmployee || "Not Assigned"}
                </Text>
              </Box>

              <Box
                px={4}
                py={2}
                borderRadius="full"
                bg={
                  currentEmployee && currentEmployee !== "Not Assigned"
                    ? "green.100"
                    : "orange.100"
                }
                color={
                  currentEmployee && currentEmployee !== "Not Assigned"
                    ? "green.700"
                    : "orange.700"
                }
                fontSize="12px"
                fontWeight="600"
              >
                {currentEmployee && currentEmployee !== "Not Assigned"
                  ? "Assigned"
                  : "Pending"}
              </Box>
            </Flex>
          </Box>
        )}

        {/* Buttons */}

        <Box textAlign="center" mt={10}>

          <Flex
            justify="end"
            gap={6}
            flexDirection={{ base: "column", md: "row" }}
          >

            <Button
              bg="#237086" fontWeight="500"
              fontSize="14px" color="white"
              px={8} borderRadius="12px"
              isLoading={loading}
              loadingText="Assigning"
              onClick={handleAssignLedger}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md", bg: "#1B5A6B"
              }}
              transition="all 0.2s ease"

            >
              Assign Ledger
            </Button>

          </Flex>

        </Box>

      </Box>
    </>
  );
}

export default EditLedgerAssignment;