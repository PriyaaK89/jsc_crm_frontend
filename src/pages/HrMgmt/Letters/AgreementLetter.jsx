import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { useParams } from "react-router-dom";
import { Box, Button, Checkbox, Flex, FormControl, FormLabel, Heading, Image, Select, SimpleGrid, Spinner, Text, useDisclosure, VStack } from "@chakra-ui/react";
import EmpAgreementLetterPreview from "./EmpAgreementLetterPreview";
import CustomDatePicker from "../../../components/common/CustomDatepicker";
import jsc_stamp from "../../../assets/images/stamp_jsc.png"

const AgreementLetter = () => {

  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date_of_issue: "",
    probitionary_period: "",
    show_stamp: false,
  });

  const calculateAge = (dob, referenceDate) => {
    if (!dob || !referenceDate) return "";

    const birthDate = new Date(dob);
    const issueDate = new Date(referenceDate);

    let age = issueDate.getFullYear() - birthDate.getFullYear();

    const monthDiff = issueDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && issueDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };
  const age = calculateAge(employee?.date_of_birth, formData?.date_of_issue);

  const calculateProbationDays = (issueDate, months) => {
    if (!issueDate || !months) return 0;

    const startDate = new Date(issueDate);
    const endDate = new Date(issueDate);

    // Add selected months
    endDate.setMonth(endDate.getMonth() + Number(months));

    // Difference in milliseconds
    const diffTime = endDate - startDate;

    // Convert to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };
  const probationDays = calculateProbationDays(
    formData?.date_of_issue,
    formData?.probitionary_period
  );



  useEffect(() => {
    const fetchEmployee = async () => {
      const res = await API.get(
        `${API_ENDPOINTS.get_emp_details}/${id}`
      );
      setEmployee(res.data.data);
      console.log(res?.data?.data, "empDetails")
      setLoading(false);
    };

    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <Flex h="60vh" justify="center" align="center">
        <Spinner size="lg" />
      </Flex>
    );
  }
  return (
    <>
      <Box bg="white" p={6} borderRadius="12px">
        <Heading size="md" mb={4}>
          Generate Agreement Letter
        </Heading>


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

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Text><b>Name:</b> {employee?.name}</Text>
            <Text><b>Email:</b> {employee?.email}</Text>
            <Text><b>Contact:</b> {employee?.contact_no}</Text>
            <Text><b>Father's Name:</b>{employee?.father_name}</Text>

            <Text><b>Department:</b> {employee?.department_name}</Text>
            <Text><b>Role:</b> {employee?.job_role_name}</Text>
            <Text>
              <b>DOJ:</b>{" "}
              {new Date(employee?.date_of_joining).toLocaleDateString()}
            </Text>

            <Text gridColumn="span 3">
              <b>Address:</b> {employee?.address_line1} {employee?.address_line2}{employee?.address_line2 ? "," : " "}
              {employee?.area}, {employee?.city}, {employee?.state} -{" "}
              {employee?.pincode}
            </Text>
            <Text><b>Salary:</b>{" "}
              ₹{Number(employee?.salary).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </Text>
          </SimpleGrid>
        </Box>

        <VStack spacing={6} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <CustomDatePicker label="Date of Issue" value={formData.date_of_issue}
              onChange={(e) => setFormData({ ...formData, date_of_issue: e.target.value })}
              placeholder="Select date of issue" />

            <FormControl >
              <FormLabel>Probationary Period (In Months)</FormLabel>
              <Select
                placeholder="Select months"
                value={formData.probitionary_period}
                onChange={(e) =>
                  setFormData({ ...formData, probitionary_period: Number(e.target.value),})
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                  <option key={month} value={month}> {month} Month{month > 1 && "s"}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <Checkbox isChecked={formData.show_stamp} onChange={(e) => setFormData({ ...formData, show_stamp: e.target.checked })} >
                <Text fontSize="14px"> Show Company Stamp </Text> <Image src={jsc_stamp} width="97px" />
              </Checkbox>
            </FormControl>
          </SimpleGrid>
        </VStack>
         <VStack>
            <Button onClick={onOpen} colorScheme="blue" mt="1rem">Show Preview</Button>
        </VStack>
      </Box>

      <EmpAgreementLetterPreview isOpen={isOpen} onClose={onClose} employee={employee} formData={formData} age={age} probationDays={probationDays} />
    </>
  )
}

export default AgreementLetter