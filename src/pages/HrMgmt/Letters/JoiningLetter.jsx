import {
  Box, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
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
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import {
  FiUser,
  FiFileText,
  FiDollarSign,
  FiTruck,
  FiAward,
  FiTarget,
  FiShield,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import EmpJoiningLetterPreview from "./EmpJoiningLetterPreview";
import CustomDatePicker from "../../../components/common/CustomDatepicker";
import jsc_stamp from "../../../assets/images/stamp_jsc.png";
import { Link } from "react-router-dom";
import useUsersapi from "../../../Apis/GetUsersapi";

const EmpJoiningLetter = () => {

  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { users } = useUsersapi();

  const [employee, setEmployee] = useState(null);
  const [empList, setEmpList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    // ---- existing joining-letter fields ----
    working_area: "",
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
    show_stamp: false,

    // ---- Employee / appointment particulars (Joining Letter + Agreement) ----
    ref_no: "",
    employee_id: "",
    father_spouse_name: "",
    aadhaar_last4: "",
    employment_start_time: "",
    reporting_manager_name: "",
    reporting_manager_id: "",
    reporting_manager_designation: "",
    territory_area: "",
    place_of_posting: "",
    notice_period_confirmed_days: "",
    hr_email: "",
    total_monthly_earning: "",
    total_annual_earning: "",

    // ---- Salary / notice pay (Annexure A) ----
    variable_pay_upto: "",
    notice_pay_base_amount: "",
    salary_revision_after_months: "",
    salary_revision_percent: "",

    // ---- TA / DA & expenses (Annexure A + Schedule C-5) ----
    approved_mode_of_travel: "",
    car_rate_per_km: "",
    hotel_limit_per_night: "",
    ta_daily_allowance: "",
    expense_submission_days: "",
    expense_approval_authority: "",

    // ---- Performance incentive matrix (Annexure A) ----
    incentive_level1_percent: "",
    incentive_level1_amount: "",
    incentive_level2_percent: "",
    incentive_level2_amount: "",
    incentive_level3_percent: "",
    incentive_level3_amount: "",
    incentive_accelerator_percent: "",
    incentive_accelerator_amount: "",
    incentive_super_accelerator_percent: "",
    incentive_super_accelerator_amount: "",

    // ---- KPI / Target (Annexure B) ----
    review_month_season: "",
    annual_sales_commitment: "",
    monthly_sales_target: "",
    collection_target: "",
    new_dealer_target: "",
    product_booking_target: "",
    field_visit_standard: "",
    team_target: "",
    other_kpi_name: "",
    other_kpi_measurement: "",

    // ---- Policy contacts (Schedule C-3) ----
    ic_chairperson_name: "",
    ic_contact_email: "",
    hr_alternate_contact: "",
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

  const fetchReference = async () => {
    try {
      const res = await API.get(
        API_ENDPOINTS.get_next_offer_reference,
        {
          params: {
            employee_id: employee.id,
            document_type: "joining_letter",
          },
        }
      );

      setFormData((prev) => ({
        ...prev,
        ref_no: res.data.referenceNo,
      }));
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (employee?.id) {
      fetchReference();
    }
  }, [employee]);

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
          appointer_state: data?.state || "",
          working_area: data?.working_area || "",
          
        }));
      }

    } catch (error) {
      console.error("Appointer fetch error:", error);
    }
  };
const fetchReportingManagerDesignation = async (managerId) => {
  try {
    const res = await API.get(`${API_ENDPOINTS.get_emp_details}/${managerId}`);
    if (res.status === 200) {
      setFormData((prev) => ({
        ...prev,
        reporting_manager_designation: res.data?.data?.job_role_name || "",
      }));
    }
  } catch (err) {
    console.error("Reporting manager details error:", err);
  }
};
  useEffect(() => {
    if (employee?.salary) {
      const monthly = (employee.salary / 12).toFixed(0);

      setFormData((prev) => ({
        ...prev,
        salary: monthly
      }));
    }
  }, [employee]);

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

  useEffect(() => {
    if (employee) {
      setFormData((prev) => ({
        ...prev,
        working_area: employee.working_area || "",
        department_name: employee.department_name || "",
        job_role_name: employee.job_role_name || "",
        // employee_id: prev.employee_id || employee.employee_code || "",
        employee_id: employee?.id ? `JSC-${employee.id}` : prev.employee_id,
        reporting_manager_name: prev.reporting_manager_name || employee.reporting_manager_name || "",
      }));
    }
  }, [employee]);

  /* ================= NOTICE PAY BASE DEFAULT = BASIC ================= */

  useEffect(() => {
    if (formData.basic && !formData.notice_pay_base_amount) {
      setFormData((prev) => ({ ...prev, notice_pay_base_amount: prev.basic }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.basic]);

  /* ================= TOTAL EARNING AUTO-FILL ================= */

  useEffect(() => {
    const basic = Number(formData.basic) || 0;
    const houseRent = Number(formData.house_rent) || 0;
    const medical = Number(formData.medical) || 0;
    const dearness = Number(formData.dearness_allowance) || 0;
    const other = Number(formData.other_allowance) || 0;
    const variableUpto = Number(formData.variable_pay_upto) || 0;

    const guaranteedMonthly = basic + houseRent + medical + dearness + other;
    const totalMonthly = guaranteedMonthly + variableUpto;

    setFormData((prev) => ({
      ...prev,
      total_monthly_earning: totalMonthly ? String(totalMonthly) : prev.total_monthly_earning,
      total_annual_earning: totalMonthly ? String(totalMonthly * 12) : prev.total_annual_earning,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.basic, formData.house_rent, formData.medical, formData.dearness_allowance, formData.other_allowance, formData.variable_pay_upto]);

  /* ================= HELPER: bind simple text/number inputs ================= */

  const bind = (field) => ({
    value: formData[field],
    onChange: (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value })),
  });

  /* ================= SHARED UI TOKENS ================= */

  const inputFocus = {
    borderColor: "gray.300",
    _hover: { borderColor: "blue.300" },
    _focus: { borderColor: "blue.500", boxShadow: "0 0 0 1px #3182CE" },
    bg: "white",
  };

  const sectionHeader = (icon, label, colorScheme = "blue") => (
    <HStack flex="1" spacing={3}>
      <Flex
        align="center"
        justify="center"
        w="32px"
        h="32px"
        borderRadius="8px"
        bg={`${colorScheme}.50`}
        color={`${colorScheme}.500`}
      >
        <Icon as={icon} boxSize="16px" />
      </Flex>
      <Text fontWeight="600" fontSize={{ base: "13px", md: "15px" }} color="gray.700">
        {label}
      </Text>
    </HStack>
  );

  /* ================= LOADING ================= */

  if (loading || !employee) {
    return (
      <Flex h="60vh" justify="center" align="center" direction="column" gap={3}>
        <Spinner size="lg" thickness="3px" color="blue.500" />
        <Text color="gray.500" fontSize="14px">Loading employee details…</Text>
      </Flex>
    );
  }

  /* ================= UI ================= */

  return (
    <Box >

      <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="14px" boxShadow="sm" border="1px solid" borderColor="gray.100">

        <HStack justifyContent='space-between'>
          <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/hr-mgmt/view-employee-list" fontSize='13px'>Employee List</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink isCurrentPage fontSize='13px'>Create Joining letter</BreadcrumbLink>
            </BreadcrumbItem>

          </Breadcrumb>

        </HStack>

        <Box mb={6}>
          <Heading size="md" color="gray.800">
            Generate Joining Letter &amp; Employment Agreement
          </Heading>
          <Text fontSize="13px" color="gray.500" mt={1}>
            Fill in the appointment, salary and policy details to generate the letter.
          </Text>
        </Box>

        {/* ================= EMPLOYEE INFO ================= */}

        <Box
          p={5}
          bgGradient="linear(to-r, blue.50, white)"
          borderRadius="12px"
          border="1px solid"
          borderColor="blue.100"
          mb={8}
        >

          <HStack mb={4} spacing={2}>
            <Icon as={FiUser} color="blue.500" boxSize="18px" />
            <Heading size="sm" color="gray.700">
              Employee Information
            </Heading>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacingX={6} spacingY={3}>

            <HStack fontSize={{ base: "13px", md: "15px" }} color="gray.700" spacing={2}>
              <Icon as={FiUser} color="gray.400" boxSize="14px" />
              <Text><b>Name:</b> {employee?.name}</Text>
            </HStack>

            <HStack fontSize={{ base: "13px", md: "15px" }} color="gray.700" spacing={2}>
              <Icon as={FiMail} color="gray.400" boxSize="14px" />
              <Text><b>Email:</b> {employee?.email}</Text>
            </HStack>

            <HStack fontSize={{ base: "13px", md: "15px" }} color="gray.700" spacing={2}>
              <Icon as={FiPhone} color="gray.400" boxSize="14px" />
              <Text><b>Contact:</b> {employee?.contact_no}</Text>
            </HStack>

            <HStack fontSize={{ base: "13px", md: "15px" }} color="gray.700" spacing={2}>
              <Icon as={FiFileText} color="gray.400" boxSize="14px" />
              <Text><b>Department:</b> {employee?.department_name}</Text>
            </HStack>

            <HStack fontSize={{ base: "13px", md: "15px" }} color="gray.700" spacing={2}>
              <Icon as={FiAward} color="gray.400" boxSize="14px" />
              <Text><b>Role:</b> {employee?.job_role_name}</Text>
            </HStack>

            <HStack fontSize={{ base: "13px", md: "15px" }} color="gray.700" spacing={2}>
              <Icon as={FiCalendar} color="gray.400" boxSize="14px" />
              <Text>
                <b>DOJ:</b>{" "}
                {employee?.date_of_joining
                  ? new Date(employee.date_of_joining).toLocaleDateString()
                  : ""}
              </Text>
            </HStack>

            <HStack fontSize={{ base: "13px", md: "15px" }} color="gray.700" spacing={2} gridColumn={{ md: "span 2", lg: "span 3" }}>
              <Icon as={FiMapPin} color="gray.400" boxSize="14px" />
              <Text><b>Address:</b> {employee?.address_line1}</Text>
            </HStack>

          </SimpleGrid>

        </Box>

        {/* ================= JOINING LETTER FORM ================= */}

        <Box mb={2}>
          {sectionHeader(FiFileText, "Joining Letter Details", "blue")}
        </Box>
        <Divider mb={5} />

        <VStack spacing={6} align="stretch">

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Working Area</FormLabel>
              <Input
                {...inputFocus}
                value={formData.working_area}
                onChange={(e) =>
                  setFormData({ ...formData, working_area: e.target.value })
                }
              />
            </FormControl>

            {/* ================= APPOINTER SELECT ================= */}

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Select Appointer</FormLabel>

              <Select
                {...inputFocus}
                placeholder="Select Appointer"
                value={formData.appoint_under || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedEmp = users.find((user) => String(user.id) === selectedId);

                  setFormData((prev) => ({
                    ...prev,
                    appoint_under: selectedId,
                    appoint_under_name: selectedEmp?.name || "",
                  }));
                }}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>

            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Department</FormLabel>
              <Input {...inputFocus} value={formData.department_name} onChange={(e) =>
                setFormData({ ...formData, department_name: e.target.value })
              } />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Job Role</FormLabel>
              <Input {...inputFocus} value={formData.job_role_name} onChange={(e) =>
                setFormData({ ...formData, job_role_name: e.target.value })
              } />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">State of Posting</FormLabel>
              <Input
                {...inputFocus}
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
              <FormLabel fontSize="13px" color="gray.600">Monthly Gross Salary</FormLabel>
              <Input
                {...inputFocus}
                value={formData.salary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary: e.target.value
                  })
                }
              />

            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Basic (50%)</FormLabel>
              <Input
                {...inputFocus}
                type="number"
                value={formData.basic}
                onChange={(e) =>
                  setFormData({ ...formData, basic: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">House Rent (20%)</FormLabel>
              <Input
                {...inputFocus}
                type="number"
                value={formData.house_rent}
                onChange={(e) =>
                  setFormData({ ...formData, house_rent: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Medical (10%)</FormLabel>
              <Input
                {...inputFocus}
                type="number"
                value={formData.medical}
                onChange={(e) =>
                  setFormData({ ...formData, medical: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Dearness Allowance</FormLabel>
              <Input
                {...inputFocus}
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
              <FormLabel fontSize="13px" color="gray.600">Other Allowance</FormLabel>
              <Input
                {...inputFocus}
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

            {/* ================= PETROL (also used as Bike Reimbursement in TA/DA) ================= */}

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Petrol / Bike Reimbursement Per KM</FormLabel>
              <Input
                {...inputFocus}
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
              <FormLabel fontSize="13px" color="gray.600">Max KM</FormLabel>
              <Input
                {...inputFocus}
                type="number"
                value={formData.max_km}
                onChange={(e) =>
                  setFormData({ ...formData, max_km: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="13px" color="gray.600">Min KM</FormLabel>
              <Input
                {...inputFocus}
                type="number"
                value={formData.min_km}
                onChange={(e) => setFormData({ ...formData, min_km: e.target.value })}
              />
            </FormControl>

            {/* ================= STAMP ================= */}

            <FormControl>
              <Box
                border="1px dashed"
                borderColor={formData.show_stamp ? "blue.300" : "gray.300"}
                bg={formData.show_stamp ? "blue.50" : "gray.50"}
                borderRadius="10px"
                p={3}
                transition="all 0.15s ease"
              >
                <Checkbox
                  isChecked={formData.show_stamp}
                  colorScheme="blue"
                  onChange={(e) => setFormData({ ...formData, show_stamp: e.target.checked })} >
                  <Text fontSize="14px" fontWeight="500">Show Company Stamp</Text>
                </Checkbox>
                <Image src={jsc_stamp} width="97px" mt={2} opacity={formData.show_stamp ? 1 : 0.4} transition="opacity 0.15s ease" />
              </Box>

            </FormControl>

          </SimpleGrid>

        </VStack>

        {/* ================= EMPLOYMENT AGREEMENT & ANNEXURES ================= */}

        <Box mt={10} mb={2}>
          <HStack spacing={3} mb={1}>
            <Heading size="md" color="gray.800">
              Employment Agreement &amp; Annexure Details
            </Heading>
            <Badge colorScheme="blue" borderRadius="full" px={2} fontSize="10px">6 sections</Badge>
          </HStack>
          <Text fontSize="13px" color="gray.500">
            Expand each section below to fill in agreement and annexure specific details.
          </Text>
        </Box>

        <Accordion allowMultiple defaultIndex={[0]} mt={4}>

          {/* ---- Appointment particulars ---- */}
          <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="10px" mb={3} overflow="hidden">
            <AccordionButton _hover={{ bg: "gray.50" }} py={4} px={4}>
              {sectionHeader(FiFileText, "Appointment Particulars", "blue")}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel bg="gray.50" pt={5} pb={6} px={5}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Ref. No.</FormLabel><Input {...inputFocus} {...bind("ref_no")} /></FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Employee ID</FormLabel>
                  <Input {...inputFocus} isReadOnly {...bind("employee_id")} />
                </FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Father / Mother / Spouse Name</FormLabel><Input {...inputFocus} {...bind("father_spouse_name")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Aadhaar (last 4 digits) / ID Reference</FormLabel><Input {...inputFocus} {...bind("aadhaar_last4")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Employment Start Time</FormLabel><Input {...inputFocus} placeholder="Select Date" type="date" {...bind("employment_start_time")} /></FormControl>
               <FormControl>
  <FormLabel fontSize="13px" color="gray.600">Reporting Manager Name</FormLabel>
  <Select
    {...inputFocus}
    placeholder="Select Reporting Manager"
    value={formData.reporting_manager_id || ""}
    onChange={async (e) => {
      const selectedId = e.target.value;
      const selectedUser = users.find((user) => String(user.id) === selectedId);

      // Fill name immediately, clear old designation while we fetch
      setFormData((prev) => ({
        ...prev,
        reporting_manager_id: selectedId,
        reporting_manager_name: selectedUser?.name || "",
        reporting_manager_designation: "",
      }));

      if (!selectedId) return;

      try {
        const res = await API.get(`${API_ENDPOINTS.get_emp_details}/${selectedId}`);
        if (res.status === 200) {
          setFormData((prev) => ({
            ...prev,
            reporting_manager_designation: res.data?.data?.job_role_name || "",
          }));
        }
      } catch (err) {
        console.error("Reporting manager details error:", err);
      }
    }}
  >
    {users.map((user) => (
      <option key={user.id} value={user.id}>
        {user.name}
      </option>
    ))}
  </Select>
</FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Reporting Manager Designation</FormLabel><Input {...inputFocus} {...bind("reporting_manager_designation")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Territory / Area</FormLabel><Input {...inputFocus} {...bind("territory_area")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Place of Posting</FormLabel><Input {...inputFocus} {...bind("place_of_posting")} /></FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Applicable Confirmed Notice Period (days)</FormLabel>
                  <Select {...inputFocus} {...bind("notice_period_confirmed_days")}>
                    <option value="">Select</option>
                    <option value="30">30 (FA / SO / TSM & equivalent)</option>
                    <option value="60">60 (ASM / RSM / ZSM & equivalent)</option>
                    <option value="90">90 (Critical / key role)</option>
                  </Select>
                </FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">HR / Employer Official Email</FormLabel><Input {...inputFocus} type="email" {...bind("hr_email")} /></FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* ---- Salary / notice pay / revision ---- */}
          <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="10px" mb={3} overflow="hidden">
            <AccordionButton _hover={{ bg: "gray.50" }} py={4} px={4}>
              {sectionHeader(FiDollarSign, "Salary, Notice Pay & Revision (Annexure A)", "green")}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel bg="gray.50" pt={5} pb={6} px={5}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Performance-Linked Variable Pay - Up To (₹ / month)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("variable_pay_upto")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Total Monthly Earning Opportunity (₹)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("total_monthly_earning")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Total Annual Earning Opportunity (₹)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("total_annual_earning")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Notice Pay Base (₹ / month)</FormLabel>
                  <Input {...inputFocus} type="number" placeholder="Defaults to Basic Pay" {...bind("notice_pay_base_amount")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Salary Revision Eligible After (months)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("salary_revision_after_months")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Salary Revision Up To (%)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("salary_revision_percent")} />
                </FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* ---- TA/DA & expenses ---- */}
          <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="10px" mb={3} overflow="hidden">
            <AccordionButton _hover={{ bg: "gray.50" }} py={4} px={4}>
              {sectionHeader(FiTruck, "TA / DA & Expense Policy (Annexure A + Schedule C-5)", "orange")}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel bg="gray.50" pt={5} pb={6} px={5}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Approved Mode of Travel</FormLabel>
                  <Select {...inputFocus} {...bind("approved_mode_of_travel")}>
                    <option value="">Select</option>
                    <option value="BIKE">Bike</option>
                    <option value="CAR">Car</option>
                    <option value="PUBLIC TRANSPORT">Public Transport</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Car Reimbursement (₹ / KM)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("car_rate_per_km")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Hotel / Lodging Limit (₹ / night)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("hotel_limit_per_night")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Daily Allowance (₹ / eligible day)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("ta_daily_allowance")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Expense Submission Deadline (days)</FormLabel>
                  <Input {...inputFocus} type="number" {...bind("expense_submission_days")} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="gray.600">Expense Approval Authority</FormLabel>
                  <Input {...inputFocus} {...bind("expense_approval_authority")} />
                </FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* ---- Performance incentive matrix ---- */}
          <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="10px" mb={3} overflow="hidden">
            <AccordionButton _hover={{ bg: "gray.50" }} py={4} px={4}>
              {sectionHeader(FiAward, "Performance-Linked Incentive Matrix (Annexure A)", "purple")}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel bg="gray.50" pt={5} pb={6} px={5}>
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Level 1 (80–89.99%) %</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_level1_percent")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Level 1 Amount (₹)</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_level1_amount")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Level 2 (90–99.99%) %</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_level2_percent")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Level 2 Amount (₹)</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_level2_amount")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Level 3 (100–109.99%) %</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_level3_percent")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Level 3 Amount (₹)</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_level3_amount")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Accelerator (110–119.99%) %</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_accelerator_percent")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Accelerator Amount (₹)</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_accelerator_amount")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Super Accelerator (120%+) %</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_super_accelerator_percent")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Super Accelerator Amount (₹)</FormLabel><Input {...inputFocus} type="number" {...bind("incentive_super_accelerator_amount")} /></FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* ---- KPI / Target (Annexure B) ---- */}
          <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="10px" mb={3} overflow="hidden">
            <AccordionButton _hover={{ bg: "gray.50" }} py={4} px={4}>
              {sectionHeader(FiTarget, "KPI / Target Commitment (Annexure B)", "teal")}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel bg="gray.50" pt={5} pb={6} px={5}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Review Month / Season</FormLabel><Input {...inputFocus} {...bind("review_month_season")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Annual / Seasonal Sales Commitment</FormLabel><Input {...inputFocus} {...bind("annual_sales_commitment")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Monthly Sales Target</FormLabel><Input {...inputFocus} {...bind("monthly_sales_target")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Collection / Realisation Target</FormLabel><Input {...inputFocus} {...bind("collection_target")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">New Active Dealer / Distributor Target</FormLabel><Input {...inputFocus} {...bind("new_dealer_target")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Product / ABS Booking Target</FormLabel><Input {...inputFocus} {...bind("product_booking_target")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Market / Field Visit Standard</FormLabel><Input {...inputFocus} {...bind("field_visit_standard")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Team Target (managerial roles)</FormLabel><Input {...inputFocus} {...bind("team_target")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Other Role KPI</FormLabel><Input {...inputFocus} {...bind("other_kpi_name")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Other KPI Measurement Source</FormLabel><Input {...inputFocus} {...bind("other_kpi_measurement")} /></FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

          {/* ---- Policy contacts ---- */}
          <AccordionItem border="1px solid" borderColor="gray.200" borderRadius="10px" mb={3} overflow="hidden">
            <AccordionButton _hover={{ bg: "gray.50" }} py={4} px={4}>
              {sectionHeader(FiShield, "Policy Contacts (Schedule C-3)", "red")}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel bg="gray.50" pt={5} pb={6} px={5}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl><FormLabel fontSize="13px" color="gray.600">Internal Committee Chairperson</FormLabel><Input {...inputFocus} {...bind("ic_chairperson_name")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">IC Contact Email</FormLabel><Input {...inputFocus} type="email" {...bind("ic_contact_email")} /></FormControl>
                <FormControl><FormLabel fontSize="13px" color="gray.600">HR / Alternate Complaint Contact</FormLabel><Input {...inputFocus} {...bind("hr_alternate_contact")} /></FormControl>
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>

        </Accordion>
        <HStack justifyContent="center">
          <Button colorScheme="blue"
            bg="#5570F1" fontSize="14px"
            _hover={{ bg: "#4560E0" }}
            size="lg" height="38px"
            px={10}
            borderRadius="10px" onClick={onOpen}
            leftIcon={<FiFileText />} >
            Show Preview
          </Button>
        </HStack>
      </Box>

      {/* ================= STICKY ACTION BAR ================= */}
      <EmpJoiningLetterPreview isOpen={isOpen} onClose={onClose} employee={employee} formData={formData} />

    </Box>
  );
};

export default EmpJoiningLetter;