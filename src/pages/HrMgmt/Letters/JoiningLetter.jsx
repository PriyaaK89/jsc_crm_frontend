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
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import EmpJoiningLetterPreview from "./EmpJoiningLetterPreview";
import CustomDatePicker from "../../../components/common/CustomDatepicker";
import jsc_stamp from "../../../assets/images/stamp_jsc.png";
import {Link} from "react-router-dom";

const EmpJoiningLetter = () => {

  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      employee_id: prev.employee_id || employee.employee_code || "",
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
                                <BreadcrumbLink as={Link} to='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                              </BreadcrumbItem>
                               <BreadcrumbItem>
                                <BreadcrumbLink as={Link} to="/hr-mgmt/view-employee-list"   fontSize='13px'>Employee List</BreadcrumbLink>
                              </BreadcrumbItem>
                  
                              <BreadcrumbItem>
                                <BreadcrumbLink isCurrentPage fontSize='13px'>Create Joining letter</BreadcrumbLink>
                              </BreadcrumbItem>
                  
                            </Breadcrumb>
                         
                  
                          </HStack>

      <Heading size="md" mb={4}>
        Generate Joining Letter &amp; Employment Agreement
      </Heading>

      {/* ================= EMPLOYEE INFO ================= */}

      <Box
        p={5}
        bg="gray.50"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.300"
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

      {/* ================= JOINING LETTER FORM ================= */}

      <VStack spacing={6} align="stretch">

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>

          <FormControl>
            <FormLabel>Working Area</FormLabel>
            <Input
              value={formData.working_area}
              onChange={(e) =>
                setFormData({ ...formData, working_area: e.target.value })
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
            <Input value={formData.department_name}  onChange={(e) =>
                setFormData({ ...formData, department_name: e.target.value })
              } />
          </FormControl>

          <FormControl>
            <FormLabel>Job Role</FormLabel>
            <Input value={formData.job_role_name}  onChange={(e) =>
                setFormData({ ...formData, job_role_name: e.target.value })
              } />
          </FormControl>

          <FormControl>
            <FormLabel>State of Posting</FormLabel>
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

          {/* ================= PETROL (also used as Bike Reimbursement in TA/DA) ================= */}

          <FormControl>
            <FormLabel>Petrol / Bike Reimbursement Per KM</FormLabel>
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

      {/* ================= EMPLOYMENT AGREEMENT & ANNEXURES ================= */}

      <Heading size="md" mt={10} mb={4}>
        Employment Agreement &amp; Annexure Details
      </Heading>

      <Accordion allowMultiple defaultIndex={[0]}>

        {/* ---- Appointment particulars ---- */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="600">Appointment Particulars</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl><FormLabel>Ref. No.</FormLabel><Input {...bind("ref_no")} /></FormControl>
              <FormControl><FormLabel>Employee ID</FormLabel><Input {...bind("employee_id")} /></FormControl>
              <FormControl><FormLabel>Father / Mother / Spouse Name</FormLabel><Input {...bind("father_spouse_name")} /></FormControl>
              <FormControl><FormLabel>Aadhaar (last 4 digits) / ID Reference</FormLabel><Input {...bind("aadhaar_last4")} /></FormControl>
              <FormControl><FormLabel>Employment Start Time</FormLabel><Input placeholder="e.g. 9:30 AM" {...bind("employment_start_time")} /></FormControl>
              <FormControl><FormLabel>Reporting Manager Name</FormLabel><Input {...bind("reporting_manager_name")} /></FormControl>
              <FormControl><FormLabel>Reporting Manager Designation</FormLabel><Input {...bind("reporting_manager_designation")} /></FormControl>
              <FormControl><FormLabel>Territory / Area</FormLabel><Input {...bind("territory_area")} /></FormControl>
              <FormControl><FormLabel>Place of Posting</FormLabel><Input {...bind("place_of_posting")} /></FormControl>
              <FormControl>
                <FormLabel>Applicable Confirmed Notice Period (days)</FormLabel>
                <Select {...bind("notice_period_confirmed_days")}>
                  <option value="">Select</option>
                  <option value="30">30 (FA / SO / TSM & equivalent)</option>
                  <option value="60">60 (ASM / RSM / ZSM & equivalent)</option>
                  <option value="90">90 (Critical / key role)</option>
                </Select>
              </FormControl>
              <FormControl><FormLabel>HR / Employer Official Email</FormLabel><Input type="email" {...bind("hr_email")} /></FormControl>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

        {/* ---- Salary / notice pay / revision ---- */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="600">Salary, Notice Pay &amp; Revision (Annexure A)</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Performance-Linked Variable Pay - Up To (₹ / month)</FormLabel>
                <Input type="number" {...bind("variable_pay_upto")} />
              </FormControl>
              <FormControl>
                <FormLabel>Total Monthly Earning Opportunity (₹)</FormLabel>
                <Input type="number" {...bind("total_monthly_earning")} />
              </FormControl>
              <FormControl>
                <FormLabel>Total Annual Earning Opportunity (₹)</FormLabel>
                <Input type="number" {...bind("total_annual_earning")} />
              </FormControl>
              <FormControl>
                <FormLabel>Notice Pay Base (₹ / month)</FormLabel>
                <Input type="number" placeholder="Defaults to Basic Pay" {...bind("notice_pay_base_amount")} />
              </FormControl>
              <FormControl>
                <FormLabel>Salary Revision Eligible After (months)</FormLabel>
                <Input type="number" {...bind("salary_revision_after_months")} />
              </FormControl>
              <FormControl>
                <FormLabel>Salary Revision Up To (%)</FormLabel>
                <Input type="number" {...bind("salary_revision_percent")} />
              </FormControl>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

        {/* ---- TA/DA & expenses ---- */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="600">TA / DA &amp; Expense Policy (Annexure A + Schedule C-5)</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Approved Mode of Travel</FormLabel>
                <Select {...bind("approved_mode_of_travel")}>
                  <option value="">Select</option>
                  <option value="BIKE">Bike</option>
                  <option value="CAR">Car</option>
                  <option value="PUBLIC TRANSPORT">Public Transport</option>
                  <option value="OTHER">Other</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Car Reimbursement (₹ / KM)</FormLabel>
                <Input type="number" {...bind("car_rate_per_km")} />
              </FormControl>
              <FormControl>
                <FormLabel>Hotel / Lodging Limit (₹ / night)</FormLabel>
                <Input type="number" {...bind("hotel_limit_per_night")} />
              </FormControl>
              <FormControl>
                <FormLabel>Daily Allowance (₹ / eligible day)</FormLabel>
                <Input type="number" {...bind("ta_daily_allowance")} />
              </FormControl>
              <FormControl>
                <FormLabel>Expense Submission Deadline (days)</FormLabel>
                <Input type="number" {...bind("expense_submission_days")} />
              </FormControl>
              <FormControl>
                <FormLabel>Expense Approval Authority</FormLabel>
                <Input {...bind("expense_approval_authority")} />
              </FormControl>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

        {/* ---- Performance incentive matrix ---- */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="600">Performance-Linked Incentive Matrix (Annexure A)</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <FormControl><FormLabel>Level 1 (80–89.99%) %</FormLabel><Input type="number" {...bind("incentive_level1_percent")} /></FormControl>
              <FormControl><FormLabel>Level 1 Amount (₹)</FormLabel><Input type="number" {...bind("incentive_level1_amount")} /></FormControl>
              <FormControl><FormLabel>Level 2 (90–99.99%) %</FormLabel><Input type="number" {...bind("incentive_level2_percent")} /></FormControl>
              <FormControl><FormLabel>Level 2 Amount (₹)</FormLabel><Input type="number" {...bind("incentive_level2_amount")} /></FormControl>
              <FormControl><FormLabel>Level 3 (100–109.99%) %</FormLabel><Input type="number" {...bind("incentive_level3_percent")} /></FormControl>
              <FormControl><FormLabel>Level 3 Amount (₹)</FormLabel><Input type="number" {...bind("incentive_level3_amount")} /></FormControl>
              <FormControl><FormLabel>Accelerator (110–119.99%) %</FormLabel><Input type="number" {...bind("incentive_accelerator_percent")} /></FormControl>
              <FormControl><FormLabel>Accelerator Amount (₹)</FormLabel><Input type="number" {...bind("incentive_accelerator_amount")} /></FormControl>
              <FormControl><FormLabel>Super Accelerator (120%+) %</FormLabel><Input type="number" {...bind("incentive_super_accelerator_percent")} /></FormControl>
              <FormControl><FormLabel>Super Accelerator Amount (₹)</FormLabel><Input type="number" {...bind("incentive_super_accelerator_amount")} /></FormControl>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

        {/* ---- KPI / Target (Annexure B) ---- */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="600">KPI / Target Commitment (Annexure B)</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl><FormLabel>Review Month / Season</FormLabel><Input {...bind("review_month_season")} /></FormControl>
              <FormControl><FormLabel>Annual / Seasonal Sales Commitment</FormLabel><Input {...bind("annual_sales_commitment")} /></FormControl>
              <FormControl><FormLabel>Monthly Sales Target</FormLabel><Input {...bind("monthly_sales_target")} /></FormControl>
              <FormControl><FormLabel>Collection / Realisation Target</FormLabel><Input {...bind("collection_target")} /></FormControl>
              <FormControl><FormLabel>New Active Dealer / Distributor Target</FormLabel><Input {...bind("new_dealer_target")} /></FormControl>
              <FormControl><FormLabel>Product / ABS Booking Target</FormLabel><Input {...bind("product_booking_target")} /></FormControl>
              <FormControl><FormLabel>Market / Field Visit Standard</FormLabel><Input {...bind("field_visit_standard")} /></FormControl>
              <FormControl><FormLabel>Team Target (managerial roles)</FormLabel><Input {...bind("team_target")} /></FormControl>
              <FormControl><FormLabel>Other Role KPI</FormLabel><Input {...bind("other_kpi_name")} /></FormControl>
              <FormControl><FormLabel>Other KPI Measurement Source</FormLabel><Input {...bind("other_kpi_measurement")} /></FormControl>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

        {/* ---- Policy contacts ---- */}
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left" fontWeight="600">Policy Contacts (Schedule C-3)</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl><FormLabel>Internal Committee Chairperson</FormLabel><Input {...bind("ic_chairperson_name")} /></FormControl>
              <FormControl><FormLabel>IC Contact Email</FormLabel><Input type="email" {...bind("ic_contact_email")} /></FormControl>
              <FormControl><FormLabel>HR / Alternate Complaint Contact</FormLabel><Input {...bind("hr_alternate_contact")} /></FormControl>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

      </Accordion>

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