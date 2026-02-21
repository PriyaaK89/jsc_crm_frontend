import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import OfferLetterPreviewModal from "./OfferLetterPreviewModal";
import CustomDatePicker from "../../../components/common/CustomDatepicker";
import jsc_stamp from "../../../assets/images/stamp_jsc.png"

const OfferLetterPage = () => {
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);


  const [formData, setFormData] = useState({
    area: "",
    headquarter: "",
    salary_norms: "",
    salary_norms1: "",
    terms_conditions: "",
    sales_target: "",
    date_of_issue: "",
    emp_state: "",
    yearly_collection: "",
    monthly_collection: "",
    first_new_channel_partner: "",
    second_new_channel_partner: "",
    third_new_channel_partner: "",
    show_stamp: false,
  });

  /* ===== Fetch Employee ===== */
  useEffect(() => {
    const fetchEmployee = async () => {
      const res = await API.get(
        `${API_ENDPOINTS.get_emp_details}/${id}`
      );

      const emp = res.data.data;

      setEmployee(emp);

      // Prefill formData
      setFormData((prev) => ({
        ...prev,
        area: emp.area || "",
        headquarter: emp.headquarter || "",
        emp_state: emp.state || "",
      }));

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
          <Text><b>Name:</b> {employee.name}</Text>
          <Text><b>Email:</b> {employee.email}</Text>
          <Text><b>Contact:</b> {employee.contact_no}</Text>

          <Text><b>Department:</b> {employee.department_name}</Text>
          <Text><b>Role:</b> {employee.job_role_name}</Text>
          <Text>
            <b>DOJ:</b>{" "}
            {new Date(employee.date_of_joining).toLocaleDateString()}
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


      {/* ===== Input Fields ===== */}
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <CustomDatePicker
            label="Date of Issue"
            value={formData.date_of_issue}
            onChange={(e) => setFormData({ ...formData, date_of_issue: e.target.value })}
            placeholder="Select date of issue"
          />
          <FormControl>
            <FormLabel>Headquarter</FormLabel>
            <Input
              placeholder="Enter Headquarter"
              value={formData.headquarter}
              onChange={(e) =>
                setFormData({ ...formData, headquarter: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Area</FormLabel>
            <Input placeholder="Enter Area" value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
          </FormControl>

          <FormControl>
            <FormLabel>State</FormLabel>
            <Input placeholder="Enter State" value={formData.emp_state}
              onChange={(e) => setFormData({ ...formData, emp_state: e.target.value })} />
          </FormControl>

          <FormControl>
            <FormLabel>Yearly Collection Target</FormLabel>
            <Input placeholder="Enter Yearly Collection Target" value={formData?.yearly_collection} onChange={(e) => setFormData({ ...formData, yearly_collection: e.target.value })} />
          </FormControl>

          <FormControl>
            <FormLabel>Monthly Collection Target</FormLabel>
            <Input placeholder="Enter Monthly Collection Target" value={formData?.monthly_collection} onChange={(e) => setFormData({ ...formData, monthly_collection: e.target.value })} />
          </FormControl>

          <FormControl>
            <FormLabel>1st Month New Channel Partner</FormLabel>
            <Input placeholder="Enter Number" value={formData?.first_new_channel_partner} onChange={(e) => setFormData({ ...formData, first_new_channel_partner: e.target.value })} />
          </FormControl>

          <FormControl>
            <FormLabel>2nd Month New Channel Partner</FormLabel>
            <Input placeholder="Enter Number" value={formData?.second_new_channel_partner} onChange={(e) => setFormData({ ...formData, second_new_channel_partner: e.target.value })} />
          </FormControl>

          <FormControl>
            <FormLabel>3rd Month New Channel Partner</FormLabel>
            <Input placeholder="Enter Number" value={formData?.third_new_channel_partner} onChange={(e) => setFormData({ ...formData, third_new_channel_partner: e.target.value })} />
          </FormControl>
        </SimpleGrid>
        <FormControl>
          <FormLabel>Salary Norms</FormLabel>
          <Textarea
            placeholder="Enter Salary Norms"
            value={formData.salary_norms}
            onChange={(e) =>
              setFormData({ ...formData, salary_norms: e.target.value })
            }
            rows={4}
            resize="vertical"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Sales Target</FormLabel>
          <Textarea
            placeholder="Enter Sales Target"
            value={formData.sales_target}
            onChange={(e) =>
              setFormData({ ...formData, sales_target: e.target.value })
            }
            rows={4}
            resize="vertical"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Additional Norms</FormLabel>
          <Textarea
            placeholder="Enter Additional Norms"
            value={formData.salary_norms1}
            onChange={(e) =>
              setFormData({ ...formData, salary_norms1: e.target.value })
            }
            rows={4}
            resize="vertical"
          />
        </FormControl>
        <FormControl>
          <Checkbox isChecked={formData.show_stamp} onChange={(e) =>setFormData({ ...formData, show_stamp: e.target.checked }) } >
           <Text fontSize="14px"> Show Company Stamp </Text> <Image src={jsc_stamp} width="97px"/>
          </Checkbox>
        </FormControl>

      </VStack>

      <Flex justify="center" mt={6}>
        <Button colorScheme="blue" onClick={onOpen}> Show Preview </Button>
      </Flex>

      {/* ===== Preview Modal ===== */}
      <OfferLetterPreviewModal isOpen={isOpen} onClose={onClose} employee={employee} formData={formData} />
    </Box>
  );
};

export default OfferLetterPage;
