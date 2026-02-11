import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Spinner,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import OfferLetterPreviewModal from "./OfferLetterPreviewModal";
import CustomDatePicker from "../../../components/common/CustomDatepicker";

const OfferLetterPage = () => {
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    salary_norms: "",
    salary_norms1: "",
    terms_conditions: "",
    sales_target: "",
    date_of_issue: "",
    emp_state: "",


  });

  /* ===== Fetch Employee ===== */
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
    <Box bg="white" p={6} borderRadius="12px">
      <Heading size="md" mb={4}>
        Generate Offer Letter
      </Heading>

      {/* ===== Prefilled Employee Info ===== */}
      <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={6}>
        <Text><b>Name:</b> {employee.name}</Text>
        <Text><b>Address:</b> {employee?.address_line1} {employee?.address_line2} <br /> {employee?.area} {employee?.city} {employee?.state}{(employee?.pincode)}</Text>
        <Text><b>Email:</b> {employee.email}</Text>
        <Text><b>Contact:</b> {employee.contact_no}</Text>


        <Text><b>Department:</b> {employee.department_name}</Text>
        <Text><b>Role:</b> {employee.job_role_name}</Text>

        <Text>
          <b>DOJ:</b>{" "}
          {new Date(employee.date_of_joining).toLocaleDateString()}
        </Text>
      </Grid>

      {/* ===== Input Fields ===== */}
      <Grid gap={4}>

        <CustomDatePicker
          label="Date of Issue"
          value={formData.date_of_issue}
          onChange={(e) => setFormData({ ...formData, date_of_issue: e.target.value })}
          placeholder="Select date of issue"
        />

        <Input placeholder="Enter State" value={formData?.emp_state} onChange={(e)=>setFormData({...formData, emp_state: e.target.value})}/>

        <Input
          placeholder="Salary Norms"
          value={formData.salary_norms}
          onChange={(e) =>
            setFormData({ ...formData, salary_norms: e.target.value })
          }
        />
        <Input
          placeholder="Salary Norms"
          value={formData.salary_norms1}
          onChange={(e) =>
            setFormData({ ...formData, salary_norms1: e.target.value })
          }
        />

        <Input
          placeholder="Sales Target"
          value={formData.sales_target}
          onChange={(e) =>
            setFormData({ ...formData, sales_target: e.target.value })
          }
        />
        

      </Grid>

      <Flex justify="flex-end" mt={6}>
        <Button colorScheme="blue" onClick={onOpen}>
          Generate Offer Letter
        </Button>
      </Flex>

      {/* ===== Preview Modal ===== */}
      <OfferLetterPreviewModal
        isOpen={isOpen}
        onClose={onClose}
        employee={employee}
        formData={formData}
      />
    </Box>
  );
};

export default OfferLetterPage;
