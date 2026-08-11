import React, { useEffect, useState } from "react";
import {
  Box, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Button, Checkbox, Flex, FormControl, FormLabel, Heading, Icon, Image, Input, SimpleGrid, Spinner,
  Tag, Text, Textarea, useDisclosure, VStack, Table, Thead, Tbody, Tr, Th, Td, Divider
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import OfferLetterPreviewModal from "./OfferLetterPreviewModal";
import CustomDatePicker from "../../../components/common/CustomDatepicker";
import jsc_stamp from "../../../assets/images/stamp_jsc.png"
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiBriefcase,
  FiDollarSign,
  FiTarget,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

// Rows for the "First Three-Month Performance Commitment" table
const TARGET_ROWS = [
  { key: "sales_target", label: "Sales Target (₹)" },
  { key: "collection_target", label: "Collection / Realisation Target (₹)" },
  { key: "new_distributor", label: "New Distributor Open / Activated (Nos.)" },
  { key: "distributor_visits", label: "Distributor Visits (Nos.)" },
  { key: "dealer_visits", label: "Dealer Visits (Nos.)" },
  { key: "farmer_visits", label: "Farmer Visits / Meetings (Nos.)" },
];

const emptyMonthTargets = () =>
  TARGET_ROWS.reduce((acc, row) => {
    acc[row.key] = ["", "", ""];
    return acc;
  }, {});

// Small reusable section header used throughout the form
const SectionHeading = ({ icon, title, subtitle }) => (
  <HStack spacing={3} mb={4} align="center">
    <Flex
      align="center"
      justify="center"
      w="36px"
      h="36px"
      borderRadius="10px"
      bg="blue.50"
      color="#5570F1"
      flexShrink={0} >
      <Icon as={icon} boxSize={4} />
    </Flex>
    <Box>
      <Heading size="sm" color="gray.700">{title}</Heading>
      {subtitle && (
        <Text fontSize="12px" color="gray.500" mt="0px">{subtitle}</Text>
      )}
    </Box>
  </HStack>
);

const InfoRow = ({ icon, label, value }) => (
  <HStack align="flex-start" spacing={3}>
    <Flex
      align="center"
      justify="center"
      w="28px"
      h="28px"
      borderRadius="8px"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      color="#5570F1"
      flexShrink={0}
    >
      <Icon as={icon} boxSize={3.5} />
    </Flex>
    <Box>
      <Text fontSize="10px" color="gray.500" fontWeight="600" letterSpacing="0.03em" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize={{ base: "12px", md: "13px" }} color="gray.800" fontWeight="500">
        {value || "—"}
      </Text>
    </Box>
  </HStack>
);

const OfferLetterPage = () => {
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    // Header / reference
    offer_ref_no: "",
    date_of_issue: "",

    // Role & posting
    designation: "",
    department: "",
    reporting_officer_name: "",
    headquarter: "",
    working_area: "",
    place_of_posting: "",
    emp_state: "",
    proposed_joining_date: "",

    // Compensation
    monthly_earning: "",
    annual_earning: "",

    // Performance & target commitment (overall)
    annual_sales_commitment: "",
    collection_commitment: "",
    new_dealer_commitment: "",
    other_kpi_commitment: "",

    // Month 1-3 performance commitment table
    month_targets: emptyMonthTargets(),

    // Offer acceptance
    acceptance_deadline: "",
    salary_norms1: "",

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
        working_area: emp.working_area || "",
        headquarter: emp.headquarter || "",
        emp_state: emp.state || "",
        designation: emp.job_role_name || "",
        department: emp.department_name || "",
        place_of_posting: emp.city || "",
        annual_earning: emp.salary || "",
        reporting_officer_name: emp.reporting_officer_name || "",
      }));

      setLoading(false);
    };

    fetchEmployee();
  }, [id]);

  // Generic top-level field updater
  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Updates one month's value (0, 1, 2) for a given target row key
  const setMonthTarget = (rowKey, monthIndex, value) => {
    setFormData((prev) => {
      const updated = [...prev.month_targets[rowKey]];
      updated[monthIndex] = value;
      return {
        ...prev,
        month_targets: { ...prev.month_targets, [rowKey]: updated },
      };
    });
  };

  if (loading) {
    return (
      <Flex h="60vh" justify="center" align="center" direction="column" gap={3}>
        <Spinner size="lg" color="#5570F1" thickness="3px" />
        <Text fontSize="13px" color="gray.500">Loading employee details…</Text>
      </Flex>
    );
  }

  return (
    <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="16px">
      <HStack justifyContent='space-between' gap={0}>
        <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/hr-mgmt/view-employee-list" fontSize='13px'>Employee List</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage fontSize='13px'>Generate Offer Letter</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>


      </HStack>

      <Box mb={6} ml={2}>
        <Heading size="md" color="gray.800"> Generate Offer Letter </Heading>
        <Text fontSize="13px" color="gray.500" mt={0}>
          Fill in the details below to prepare and preview this employee's offer letter.
        </Text>
      </Box>

      {/* ===== Prefilled Employee Info ===== */}
      <Box
        p={{ base: 4, md: 6 }}
        bg="linear-gradient(135deg, #F6F8FF 0%, #FAFBFF 100%)"
        borderRadius="14px"
        border="1px solid"
        borderColor="#E4E9FC"
        mb={8}
      >
        <HStack justify="space-between" mb={5} flexWrap="wrap" rowGap={2}>
          <HStack spacing={2}>
            <Icon as={FiUser} color="#5570F1" boxSize={4} />
            <Heading size="sm" color="gray.700">Employee Information</Heading>
          </HStack>
          <Tag size="sm" borderRadius="full" bg="#506ae9" color="white" px={3} py={1} fontWeight="500">
            {employee.job_role_name || "Employee"}
          </Tag>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
          <InfoRow icon={FiUser} label="Name" value={employee.name} />
          <InfoRow icon={FiMail} label="Email" value={employee.email} />
          <InfoRow icon={FiPhone} label="Contact" value={employee.contact_no} />
          <InfoRow icon={FiBriefcase} label="Department" value={employee.department_name} />
          <InfoRow icon={FiBriefcase} label="Role" value={employee.job_role_name} />
          <InfoRow
            icon={FiCalendar}
            label="Date of Joining"
            value={employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : "—"}
          />
          <Box gridColumn={{ base: "span 1", md: "span 2", lg: "span 3" }}>
            <InfoRow
              icon={FiMapPin}
              label="Address"
              value={`${employee?.address_line1 || ""} ${employee?.address_line2 || ""}${employee?.address_line2 ? "," : ""} ${employee?.area || ""}, ${employee?.city || ""}, ${employee?.state || ""} - ${employee?.pincode || ""}`}
            />
          </Box>
          <InfoRow
            icon={FiDollarSign}
            label="Salary"
            value={`₹${Number(employee?.salary || 0).toLocaleString("en-IN")}`}
          />
        </SimpleGrid>
      </Box>


      {/* ===== Input Fields ===== */}
      <VStack spacing={6} align="stretch">

        {/* ---- Header / Reference ---- */}
        <Box p={{ base: 4, md: 5 }} border="1px solid" borderColor="gray.200" borderRadius="14px">
          <SectionHeading icon={FiFileText} title="Offer Reference" subtitle="Document identifiers and key dates" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Offer Ref. No.</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Offer Ref. No." value={formData.offer_ref_no}
                onChange={(e) => setField("offer_ref_no", e.target.value)} />
            </FormControl>

            <CustomDatePicker
              label="Date of Issue"
              value={formData.date_of_issue}
              onChange={(date) => setField("date_of_issue", date)}
              placeholder="Select date of issue" />

            <CustomDatePicker
              label="Proposed Joining Date"
              value={formData.proposed_joining_date}
              onChange={(date) => setField("proposed_joining_date", date)}
              placeholder="Select proposed joining date" />
          </SimpleGrid>
        </Box>

        {/* ---- Role & Posting ---- */}
        <Box p={{ base: 4, md: 5 }} border="1px solid" borderColor="gray.200" borderRadius="14px">
          <SectionHeading icon={FiBriefcase} title="Role & Posting" subtitle="Position, reporting line, and location" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Designation</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Designation" value={formData.designation}
                onChange={(e) => setField("designation", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Department</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Department" value={formData.department}
                onChange={(e) => setField("department", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Reporting Manager</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Reporting Manager" value={formData.reporting_officer_name}
                onChange={(e) => setField("reporting_officer_name", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Headquarter</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Headquarter" value={formData.headquarter}
                onChange={(e) => setField("headquarter", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Territory / Area</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Territory / Area" value={formData.working_area}
                onChange={(e) => setField("working_area", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Place of Posting</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Place of Posting" value={formData.place_of_posting}
                onChange={(e) => setField("place_of_posting", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">State</FormLabel>
              <Input borderRadius="8px" placeholder="Enter State" value={formData.emp_state}
                onChange={(e) => setField("emp_state", e.target.value)} />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* ---- Compensation ---- */}
        <Box p={{ base: 4, md: 5 }} border="1px solid" borderColor="gray.200" borderRadius="14px">
          <SectionHeading icon={FiDollarSign} title="Compensation" subtitle="Earning opportunity offered to the employee" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Monthly Earning Opportunity (₹)</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Monthly Earning Opportunity" value={formData.monthly_earning}
                onChange={(e) => setField("monthly_earning", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Annual Earning Opportunity (₹)</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Annual Earning Opportunity" value={formData.annual_earning}
                onChange={(e) => setField("annual_earning", e.target.value)} />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* ---- Performance & Target Commitment (overall) ---- */}
        <Box p={{ base: 4, md: 5 }} border="1px solid" borderColor="gray.200" borderRadius="14px">
          <SectionHeading icon={FiTarget} title="Performance & Target Commitment" subtitle="Overall commitments for the role" />
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Annual / Seasonal Sales Commitment (₹)</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Annual / Seasonal Sales Commitment" value={formData.annual_sales_commitment}
                onChange={(e) => setField("annual_sales_commitment", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Collection Commitment (₹)</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Collection Commitment" value={formData.collection_commitment}
                onChange={(e) => setField("collection_commitment", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">New Dealer / Distributor Commitment</FormLabel>
              <Input borderRadius="8px" placeholder="Enter New Dealer / Distributor Commitment" value={formData.new_dealer_commitment}
                onChange={(e) => setField("new_dealer_commitment", e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" fontWeight="600" color="gray.600">Other Key Performance Commitment</FormLabel>
              <Input borderRadius="8px" placeholder="Enter Other Key Performance Commitment" value={formData.other_kpi_commitment}
                onChange={(e) => setField("other_kpi_commitment", e.target.value)} />
            </FormControl>
          </SimpleGrid>

          <Divider my={5} />

          {/* ---- First Three-Month Performance Commitment Table ---- */}
          <Box>
            <Text fontSize="13px" fontWeight="600" color="gray.600" mb={3}>
              First Three-Month Performance Commitment (Month 1 to Month 3)
            </Text>
            <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="10px">
              <Table size="sm" variant="simple">
                <Thead bg="#F6F8FF">
                  <Tr>
                    <Th color="gray.600" fontSize="11px">Performance Commitment</Th>
                    <Th color="gray.600" fontSize="11px" textAlign="center">Month 1</Th>
                    <Th color="gray.600" fontSize="11px" textAlign="center">Month 2</Th>
                    <Th color="gray.600" fontSize="11px" textAlign="center">Month 3</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {TARGET_ROWS.map((row, idx) => (
                    <Tr key={row.key} bg={idx % 2 === 0 ? "white" : "gray.50"}>
                      <Td whiteSpace="nowrap" fontSize="13px" fontWeight="500" color="gray.700">{row.label}</Td>
                      {[0, 1, 2].map((monthIndex) => (
                        <Td key={monthIndex} minW="120px">
                          <Input
                            size="sm"
                            borderRadius="6px"
                            bg="white"
                            placeholder="Enter value"
                            value={formData.month_targets[row.key][monthIndex]}
                            onChange={(e) => setMonthTarget(row.key, monthIndex, e.target.value)}
                          />
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Box>

        {/* ---- Offer Acceptance ---- */}
        <Box p={{ base: 4, md: 5 }} border="1px solid" borderColor="gray.200" borderRadius="14px">
          <SectionHeading icon={FiCalendar} title="Offer Acceptance" subtitle="Deadline for the employee to respond" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <CustomDatePicker label="Acceptance Deadline"
              value={formData.acceptance_deadline}
              onChange={(date) => setField("acceptance_deadline", date)}
              placeholder="Return accepted copy on or before" />
          </SimpleGrid>
        </Box>
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

        <Box
          p={4}
          border="1px dashed"
          borderColor={formData.show_stamp ? "#5570F1" : "gray.200"}
          bg={formData.show_stamp ? "#F6F8FF" : "white"}
          borderRadius="12px"
          transition="all 0.15s ease"
        >
          <FormControl>
            <Checkbox
              isChecked={formData.show_stamp}
              onChange={(e) => setField("show_stamp", e.target.checked)}
              colorScheme="blue"
            >
              <HStack spacing={3} align="center">
                <Text fontSize="14px" fontWeight="500" color="gray.700"> Show Company Stamp </Text>
                <Image src={jsc_stamp} width="97px" />
              </HStack>
            </Checkbox>
          </FormControl>
        </Box>

      </VStack>

      <Flex justify="center" mt={8}>
        <Button
          colorScheme="blue"
          bg="#5570F1" fontSize="14px"
          _hover={{ bg: "#4560E0" }}
          size="lg" height="38px"
          px={10}
          borderRadius="10px"
          onClick={onOpen}
        >
          Show Preview
        </Button>
      </Flex>

      {/* ===== Preview Modal ===== */}
      <OfferLetterPreviewModal isOpen={isOpen} onClose={onClose} employee={employee} formData={formData} />
    </Box>
  );
};

export default OfferLetterPage;