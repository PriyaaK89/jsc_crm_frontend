import {
  Box,HStack,Breadcrumb,BreadcrumbItem,BreadcrumbLink,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import EmpJoiningLetterPreview from "./EmpJoiningLetterPreview";
import CustomDatePicker from "../../../components/common/CustomDatepicker";
import jsc_stamp from "../../../assets/images/stamp_jsc.png";

const EmpJoiningLetter = () => {

  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [employee, setEmployee] = useState(null);
  const [empList, setEmpList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    area: "",
    appoint_under: "",
    appoint_under_name: "",
    job_role_name: "",
    department_name: "",
    appointer_state: "",
    date_of_issue: "",
    basic: "",
    house_rent: "",
    medical: "",
    dearness_allowance: "",
    other_allowance: "",
    petrol_per_km: "",
    max_km: "",
    min_km: "",
    show_stamp: false
  });

  /* ================= FETCH EMPLOYEE LIST ================= */

  const fetchEmployeeList = async () => {
    try {
      const response = await API.get(API_ENDPOINTS.GET_USERS);

      if (response.status === 200) {
        setEmpList(response.data?.data || []);
      }
    } catch (error) {
      console.error("Employee list error:", error);
    }
  };

  /* ================= FETCH EMPLOYEE DETAILS ================= */

  const fetchEmployee = async () => {
    try {
      const res = await API.get(`${API_ENDPOINTS.get_emp_details}/${id}`);

      if (res.status === 200) {
        setEmployee(res.data?.data);
      }

    } catch (error) {
      console.error("Employee details error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH APPOINTER DETAILS ================= */

  const fetchEmployeeDetails = async (empId) => {
    try {

      const res = await API.get(`${API_ENDPOINTS.get_emp_details}/${empId}`);

      if (res.status === 200) {

        const data = res.data?.data;

        setFormData((prev) => ({
          ...prev,
          appoint_under: String(data?.id || ""),
          job_role_name: data?.job_role_name || "",
          department_name: data?.department_name || "",
          appointer_state: data?.state || ""
        }));
      }

    } catch (error) {
      console.error("Appointer fetch error:", error);
    }
  };

  /* ================= USE EFFECTS ================= */

  useEffect(() => {
    fetchEmployeeList();
    fetchEmployee();
  }, [id]);

  /* ================= SALARY AUTO CALCULATION ================= */

  useEffect(() => {

    if (employee?.salary) {

      const yearly = Number(employee.salary);
      const monthly = yearly / 12;

      setFormData((prev) => ({
        ...prev,
        basic: (monthly * 0.5).toFixed(0),
        house_rent: (monthly * 0.2).toFixed(0),
        medical: (monthly * 0.1).toFixed(0),
        dearness_allowance: (monthly * 0.1).toFixed(0),
        other_allowance: (monthly * 0.1).toFixed(0)
      }));

    }

  }, [employee]);

  /* ================= LOADING ================= */

  if (loading || !employee) {
    return (
      <Flex h="60vh" justify="center" align="center">
        <Spinner size="lg" />
      </Flex>
    );
  }

  /* ================= UI ================= */

  return (
    <Box bg="white" p={6} borderRadius="12px">
       <HStack justifyContent='space-between'>
                            <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                              <BreadcrumbItem>
                                <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                              </BreadcrumbItem>
                  
                              <BreadcrumbItem>
                                <BreadcrumbLink  color='#8B8D97' fontSize='13px'>Create Joining latter</BreadcrumbLink>
                              </BreadcrumbItem>
                  
                            </Breadcrumb>
                         
                  
                          </HStack>

      <Heading size="md" mb={4}>
        Generate Joining Letter 
      </Heading>

      {/* ================= EMPLOYEE INFO ================= */}

      <Box
        p={5}
        bg="gray.50"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
        mb={8}
      >

        <Heading size="sm" mb={4} color="gray.600">
          Employee Information
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>

  <Text fontSize={{base:"13px",md:"16px"}}><b>Name:</b> {employee?.name}</Text>
  <Text fontSize={{base:"13px",md:"16px"}}><b>Email:</b> {employee?.email}</Text>
  <Text fontSize={{base:"13px",md:"16px"}}><b>Contact:</b> {employee?.contact_no}</Text>

  <Text fontSize={{base:"13px",md:"16px"}}><b>Department:</b> {employee?.department_name}</Text>
  <Text fontSize={{base:"13px",md:"16px"}} ><b>Role:</b> {employee?.job_role_name}</Text>

  <Text fontSize={{base:"13px",md:"16px"}}>
    <b>DOJ:</b>{" "}
    {employee?.date_of_joining
      ? new Date(employee.date_of_joining).toLocaleDateString()
      : ""}
  </Text>

  <Text fontSize={{base:"13px",md:"16px"}} gridColumn={{ md: "span 2", lg: "span 3" }}>
    <b>Address:</b> {employee?.address_line1}
  </Text>

</SimpleGrid>  

      </Box>

      {/* ================= FORM ================= */}

      <VStack spacing={6} align="stretch">

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>

          <FormControl>
            <FormLabel>Area</FormLabel>
            <Input
              value={formData.area}
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
            />
          </FormControl>

          {/* ================= APPOINTER SELECT ================= */}

          <FormControl>
            <FormLabel>Select Appointer</FormLabel>

            <Select
              placeholder="Select Appointer"
              value={formData.appoint_under || ""}
              onChange={(e) => {

                const selectedId = e.target.value;

                const selectedEmp = empList.find(
                  (emp) => String(emp.id) === selectedId
                );

                setFormData((prev) => ({
                  ...prev,
                  appoint_under: selectedId,
                  appoint_under_name: selectedEmp?.name || ""
                }));

                fetchEmployeeDetails(selectedId);

              }}
            >

              {empList?.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.name}
                </option>
              ))}

            </Select>

          </FormControl>

          <FormControl>
            <FormLabel>Department</FormLabel>
            <Input value={formData.department_name} isReadOnly />
          </FormControl>

          <FormControl>
            <FormLabel>Job Role</FormLabel>
            <Input value={formData.job_role_name} isReadOnly />
          </FormControl>

          <FormControl>
            <FormLabel>State</FormLabel>
            <Input
              value={formData.appointer_state}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  appointer_state: e.target.value
                })
              }
            />
          </FormControl>

          <CustomDatePicker
            label="Date of Issue"
            value={formData.date_of_issue}
            onChange={(date) =>
              setFormData({ ...formData, date_of_issue: date })
            }
          />

          {/* ================= SALARY ================= */}

          <FormControl>
            <FormLabel>Monthly Gross Salary</FormLabel>
            <Input
              value={
                employee?.salary
                  ? (employee.salary / 12).toFixed(0)
                  : ""
              }
              isReadOnly
            />
          </FormControl>

          <FormControl>
            <FormLabel>Basic (50%)</FormLabel>
            <Input
              type="number"
              value={formData.basic}
              onChange={(e) =>
                setFormData({ ...formData, basic: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>House Rent (20%)</FormLabel>
            <Input
              type="number"
              value={formData.house_rent}
              onChange={(e) =>
                setFormData({ ...formData, house_rent: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Medical (10%)</FormLabel>
            <Input
              type="number"
              value={formData.medical}
              onChange={(e) =>
                setFormData({ ...formData, medical: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Dearness Allowance</FormLabel>
            <Input
              type="number"
              value={formData.dearness_allowance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dearness_allowance: e.target.value
                })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Other Allowance</FormLabel>
            <Input
              type="number"
              value={formData.other_allowance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  other_allowance: e.target.value
                })
              }
            />
          </FormControl>

          {/* ================= PETROL ================= */}

          <FormControl>
            <FormLabel>Petrol Per KM</FormLabel>
            <Input
              type="number"
              value={formData.petrol_per_km}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  petrol_per_km: e.target.value
                })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Max KM</FormLabel>
            <Input
              type="number"
              value={formData.max_km}
              onChange={(e) =>
                setFormData({ ...formData, max_km: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Min KM</FormLabel>
            <Input
              type="number"
              value={formData.min_km}
              onChange={(e) =>
                setFormData({ ...formData, min_km: e.target.value })
              }
            />
          </FormControl>

          {/* ================= STAMP ================= */}

          <FormControl>

            <Checkbox
              isChecked={formData.show_stamp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  show_stamp: e.target.checked
                })
              }
            >
              <Text fontSize="14px">Show Company Stamp</Text>
              <Image src={jsc_stamp} width="97px" />
            </Checkbox>

          </FormControl>

        </SimpleGrid>

      </VStack>

      <VStack mt={6}>
        <Button colorScheme="blue" onClick={onOpen}>
          Show Preview
        </Button>
      </VStack>

      <EmpJoiningLetterPreview
        isOpen={isOpen}
        onClose={onClose}
        employee={employee}
        formData={formData}
      />

    </Box>
  );
};

export default EmpJoiningLetter;