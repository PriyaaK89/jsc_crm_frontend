import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardBody, Divider, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Input, Select, VStack, Switch, useToast, Breadcrumb, HStack, BreadcrumbItem, BreadcrumbLink, } from "@chakra-ui/react";
import { GROUP_CONFIG } from "../AccountingMaster/LedgerGroupConfig";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";


const toBool = (value) => (value === "Yes" ? 1 : 0);

const defaultInterestConfig = {
  for_amount_added: "",      // "Yes"|"No"  → sent as amount_added: 0|1
  for_amount_deduct: "",     // "Yes"|"No"  → sent as amount_deducted: 0|1
  rate: "",
  rate_per: "",              // "Calendar Month" | "Calendar Year"
  rate_on: "",               // "Credit Balances Only" | "Debit Balances Only"
  applicability: "Always",   // "Always" | "Past Due Date"
  by_days: "",               // → sent as applicability_days
  grace_period: "",
  calculate_from: "Date of Applicability",
  security: "No",            // "Yes"|"No"  → sent as security_enabled: 0|1
  security_amount: "",
};


const initialFormData = {
  // Basic
  ledger_name: "",
  group_id: "",        // integer id – set by handleGroupChange
  group_under: "",     // display name – used for GROUP_CONFIG lookup only

  employee_under: "",

  // Opening balance
  opening_date: "",
  opening_balance: "",
  balance_type: "Dr",  // "Cr"|"Dr"  (renamed from cr_dr to match backend)

  // Bill-by-bill
  maintain_bill_by_bill: "",   // Yes/No → 0/1
  default_credit_period: "",
  check_credit_days: "",       // Yes/No → 0/1  (was credit_day_during_voucher)
  credit_limit: "",            // (was specify_credit_limit)

  // Inventory
  inventory_values_affected: "",  // Yes/No → 0/1  (was inventory_values_are_affected)

  // Payroll
  use_for_payroll: "",            // Yes/No → 0/1

  // Interest top-level
  activate_interest_calculation: "",  // Yes/No → 0/1

  // Interest parameters (shared for all slabs)
  txn_by_txn_interest: "Yes",         // Yes/No → 0/1
  interest_based_on: "",

  // OD limit
  od_limit: "",

  // Tax  (gst_no is top-level in backend, NOT inside bank object)
  pan_no: "",   // (was pan_it_number)
  gst_no: "",   // (was ledgerBankAccount.gst_number – wrong location)

  // Mailing
  mailing_name: "",
  location: "",
  country: "",
  state: "",
  pincode: "",

  // Bank account → sent as bank_details object to backend
  bank_details: {
    account_holder_name: "",   // (was acc_holder_name)
    account_number: "",        // (was acc_number)
    ifsc_code: "",             // (was ifsc)
    bank_name: "",
    branch_name: "",           // (was branch)
    cheque_book_enabled: "",   // Yes/No → 0/1  (was cheque_book)
    cheque_printing_enabled: "", // Yes/No → 0/1  (was cheque_printing)
  },


interest_configs: [
  {
    ...defaultInterestConfig,
    slab_no: 1,
  },
  {
    ...defaultInterestConfig,
    slab_no: 2,
  },
  {
    ...defaultInterestConfig,
    slab_no: 3,
  },
],

  crm_details: {
    customer_name: "",
    customer_dob: "",
    firm_name: "",
    firm_type: "",
    firm_email: "",
    firm_since: "",
    firm_pan: "",
    firm_aadhar: "",
    firm_gstn_type: "",
    firm_annual_turnover: "",
    expected_sale_per_year: "",
    other_company_detail: "",

    address: "",
    state: "",
    district: "",
    tehsil: "",
    pincode: "",
    landmark: "",

    branch: "",
    contact: "",

    responsible_person_name: "",
    responsible_person_address: "",
    responsible_person_contact: "",

    seed_licence_no: "",
    fert_licence_no: "",
    pest_licence_no: "",

    transport_name: "",

    bank_name: "",
    bank_acc_number: "",
    bank_ifsc: "",
    bank_branch: "",

    security_cheque_no1: "",
    security_cheque_no2: "",
  },

};

const CreateLedger = () => {
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [locationNames, setLocationNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);
  const [mailingAreas, setMailingAreas] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchEmployees();
    fetchLocations();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await API.get(`${API_ENDPOINTS?.get_account_group_list}?page=${page}&limit=${limit}`);
      setGroups(res.data.data || []);
    } catch (err) {
      console.error("fetchGroups:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.GET_USERS);
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("fetchEmployees:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.get_location_list);
      setLocationNames(res.data.data || []);
    } catch (err) {
      console.error("fetchLocations:", err);
    }
  };


  const handleMailingPincodeChange = async (e) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, pincode: value }));

    if (value.length === 6) {
      try {
        // Auto-fill state & country
        const res = await API.get(`/getstatecity/${value}`);
        const { state } = res.data.data;
        setFormData((prev) => ({
          ...prev,
          state: state || prev.state,
          country: "India",
          location: "",   // reset location when pincode changes
        }));

        // Fetch areas for location dropdown
        const areaRes = await API.get(`/areas?pincode=${value}`);
        const areas = areaRes.data.data || [];
        setMailingAreas(areas);

      } catch (err) {
        console.error("Mailing pincode lookup failed", err);
        setMailingAreas([]);
      }
    } else {
      // Clear areas if pincode is incomplete
      setMailingAreas([]);
    }
  };

  const currentConfig = useMemo(
    () => GROUP_CONFIG[formData.group_under] || {},
    [formData.group_under]
  );


  // Generic flat-field handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Group dropdown – stores BOTH the integer id (for API) and display name (for GROUP_CONFIG)
  const handleGroupChange = (e) => {
    const selectedName = e.target.value;
    const selectedGroup = groups.find((g) => g.group_name === selectedName);
    setFormData((prev) => ({
      ...prev,
      group_under: selectedName,
      group_id: selectedGroup ? selectedGroup.id : "",
    }));
  };

  // Bank details nested object handler
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bank_details: { ...prev.bank_details, [name]: value },
    }));
  };

  // Interest slab handler
  const handleInterestConfigChange = (index, field, value) => {
    const updated = [...formData.interest_configs];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, interest_configs: updated }));
  };

  // Payroll switch
  const handlePayrollSwitch = (e) => {
    setFormData((prev) => ({
      ...prev,
      use_for_payroll: e.target.checked ? "Yes" : "No",
    }));
  };

  const handleCrmChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      crm_details: {
        ...prev.crm_details,
        [name]: value,
      },
    }));
  };


  // -------------------------------------------------------------------------
  // Build API payload
  // Maps every frontend field to the exact backend field name and type.
  // -------------------------------------------------------------------------
  const buildPayload = () => {
    const f = formData;
    const crm = f.crm_details;
    const hasBankSection =
      currentConfig.showBankDetails || currentConfig.showBankConfig;

    // Only the first slab is sent (backend stores 1 interest_config per ledger)


    return {
      // Basic
      ledger_name: f.ledger_name.trim(),
      group_id: Number(f.group_id),
      employee_under: f.employee_under || null,

      // Opening balance
      opening_balance: f.opening_balance ? Number(f.opening_balance) : 0,
      balance_type: f.balance_type || "Dr",
      opening_date: f.opening_date || null,

      // Mailing
      mailing_name: f.mailing_name || null,
      location: f.location || null,
      country: f.country || null,
      state: f.state || null,
      pincode: f.pincode || null,

      // Tax
      pan_no: currentConfig.showPan ? (f.pan_no || null) : null,
      gst_no: currentConfig.showTax ? (f.gst_no || null) : null,

      // Bill-by-bill (only when section visible, else send neutral defaults)
      maintain_bill_by_bill: currentConfig.showBillByBill
        ? toBool(f.maintain_bill_by_bill) : 0,
      default_credit_period: currentConfig.showBillByBill
        ? Number(f.default_credit_period) || 0 : 0,
      check_credit_days: currentConfig.showBillByBill
        ? toBool(f.check_credit_days) : 0,
      credit_limit: currentConfig.showBillByBill
        ? Number(f.credit_limit) || 0 : 0,

      // Features
      inventory_values_affected: currentConfig.showInventory
        ? toBool(f.inventory_values_affected) : 0,
      use_for_payroll: currentConfig.showPayroll
        ? toBool(f.use_for_payroll) : 0,

      // Interest
      activate_interest_calculation: currentConfig.showInterest
        ? toBool(f.activate_interest_calculation) : 0,

      // OD limit
      od_limit: currentConfig.showOdLimit
        ? Number(f.od_limit) || 0 : 0,

      // Bank details object (undefined = not sent, backend skips insert)
      bank_details: hasBankSection
        ? {
          account_holder_name: f.bank_details.account_holder_name || null,
          account_number: f.bank_details.account_number || null,
          ifsc_code: f.bank_details.ifsc_code || null,
          bank_name: f.bank_details.bank_name || null,
          branch_name: f.bank_details.branch_name || null,
          cheque_book_enabled: currentConfig.showBankConfig
            ? toBool(f.bank_details.cheque_book_enabled) : 0,
          cheque_printing_enabled: currentConfig.showBankConfig
            ? toBool(f.bank_details.cheque_printing_enabled) : 0,
        }
        : undefined,

      // Interest config object (only sent when activated)
      interest_configs:
  currentConfig.showInterest &&
  f.activate_interest_calculation === "Yes"
    ? f.interest_configs
        .filter((cfg) => {
          // only save slabs that contain some data
          return (
            cfg.rate ||
            cfg.for_amount_added ||
            cfg.for_amount_deduct ||
            cfg.rate_per ||
            cfg.rate_on ||
            cfg.grace_period ||
            cfg.security_amount
          );
        })
        .map((cfg, index) => ({
  slab_no: index + 1,
          calculate_transaction_by_transaction:
            toBool(f.txn_by_txn_interest),

          interest_based_on:
            f.interest_based_on || null,

          amount_added:
            toBool(cfg.for_amount_added),

          amount_deducted:
            toBool(cfg.for_amount_deduct),

          rate:
            Number(cfg.rate) || 0,

          rate_per:
            cfg.rate_per || null,

          rate_on:
            cfg.rate_on || null,

          applicability:
            cfg.applicability || null,

          applicability_days:
            Number(cfg.by_days) || 0,

          grace_period:
            Number(cfg.grace_period) || 0,

          security_enabled:
            toBool(cfg.security),

          security_amount:
            Number(cfg.security_amount) || 0,
        }))
    : [],

      crm_details: {
        customer_name: crm.customer_name || null,
        customer_dob: crm.customer_dob || null,

        firm_name: crm.firm_name || null,
        firm_type: crm.firm_type || null,
        firm_email: crm.firm_email || null,
        firm_since: crm.firm_since || null,
        firm_pan: crm.firm_pan || null,
        firm_aadhar: crm.firm_aadhar || null,
        firm_gstn_type: crm.firm_gstn_type || null,

        firm_annual_turnover: crm.firm_annual_turnover
          ? Number(crm.firm_annual_turnover)
          : null,

        expected_sale_per_year: crm.expected_sale_per_year
          ? Number(crm.expected_sale_per_year)
          : null,

        other_company_detail: crm.other_company_detail || null,

        address: crm.address || null,
        state: crm.state || null,
        district: crm.district || null,
        tehsil: crm.tehsil || null,
        pincode: crm.pincode || null,
        landmark: crm.landmark || null,

        branch: crm.branch || null,
        contact: crm.contact || null,

        responsible_person_name:
          crm.responsible_person_name || null,

        responsible_person_address:
          crm.responsible_person_address || null,

        responsible_person_contact:
          crm.responsible_person_contact || null,

        seed_licence_no: crm.seed_licence_no || null,
        fert_licence_no: crm.fert_licence_no || null,
        pest_licence_no: crm.pest_licence_no || null,

        transport_name: crm.transport_name || null,

        bank_name: crm.bank_name || null,
        bank_acc_number: crm.bank_acc_number || null,
        bank_ifsc: crm.bank_ifsc || null,
        bank_branch: crm.bank_branch || null,

        security_cheque_no1:
          crm.security_cheque_no1 || null,

        security_cheque_no2:
          crm.security_cheque_no2 || null,
      },
    };


  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!formData.ledger_name.trim()) {
      toast({
        title: "Ledger name is required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!formData.group_id) {
      toast({
        title: "Please select a group",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const payload = buildPayload();
      await API.post(API_ENDPOINTS.create_ledger, payload);

      toast({
        title: "Ledger created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form to initial state after successful submission
      setFormData(initialFormData);

    } catch (error) {
      console.error("Create ledger error:", error);
      toast({
        title: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };


  const yesNoOptions = (
    <>
      <option value="">Please select</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </>
  );


  return (
    <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} borderRadius="lg" boxShadow="md">
<HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px" >
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard" >
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px" >
              Create Ledger
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>
      <Heading size="md" mb={6}>
        Create Ledger
      </Heading>

      <VStack spacing={6} align="stretch">
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>

          <GridItem>
            <FormControl isRequired>
              <FormLabel>Ledger Name</FormLabel>
              <Input
                maxLength={100}
                name="ledger_name"
                value={formData.ledger_name}
                onChange={handleChange}
                placeholder="Enter ledger name"
              />
            </FormControl>
          </GridItem>

          {/* Group Under – stores id for API + name for GROUP_CONFIG */}
          <GridItem>
            <FormControl isRequired>
              <FormLabel>Under (Group)</FormLabel>
              <Select
                name="group_under"
                value={formData.group_under}
                onChange={handleGroupChange}
                placeholder="Select Group Name"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.group_name}>
                    {group.group_name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Employee Under</FormLabel>
              <Select
                name="employee_under"
                value={formData.employee_under}
                onChange={handleChange}
                placeholder="Select Employee Name"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>

        </Grid>


        {currentConfig.showBillByBill && (
          <Box className="ledger_box">
            <Heading size="sm" className="ledger_heading">Bill-by-Bill Settings</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} p={6}>

              <FormControl>
                <FormLabel>Maintain balances bill-by-bill</FormLabel>
                <Select
                  name="maintain_bill_by_bill"
                  value={formData.maintain_bill_by_bill}
                  onChange={handleChange}
                >
                  {yesNoOptions}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Default credit period (in days)</FormLabel>
                <Input
                  type="number"
                  name="default_credit_period"
                  value={formData.default_credit_period}
                  onChange={handleChange}
                />
              </FormControl>

              {/* check_credit_days (was credit_day_during_voucher) */}
              <FormControl>
                <FormLabel>Check for credit days during voucher entry</FormLabel>
                <Select
                  name="check_credit_days"
                  value={formData.check_credit_days}
                  onChange={handleChange}
                >
                  {yesNoOptions}
                </Select>
              </FormControl>

              {/* credit_limit (was specify_credit_limit) */}
              <FormControl>
                <FormLabel>Specify credit limit</FormLabel>
                <Input
                  type="number"
                  name="credit_limit"
                  value={formData.credit_limit}
                  onChange={handleChange}
                />
              </FormControl>

            </Grid>
          </Box>
        )}

        {/* ============================================================ */}
        {/* 3. INVENTORY                                                  */}
        {/* ============================================================ */}
        {currentConfig.showInventory && (
          <Box>
            <Divider mb={4} />
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {/* inventory_values_affected (was inventory_values_are_affected) */}
              <FormControl>
                <FormLabel>Inventory values are affected</FormLabel>
                <Select
                  name="inventory_values_affected"
                  value={formData.inventory_values_affected}
                  onChange={handleChange}
                >
                  {yesNoOptions}
                </Select>
              </FormControl>
            </Grid>
          </Box>
        )}

        {/* ============================================================ */}
        {/* 4. PAYROLL                                                    */}
        {/* ============================================================ */}
        {currentConfig.showPayroll && (
          <Box>
            <Divider mb={4} />
            <FormControl display="flex" alignItems="center" gap={3}>
              <FormLabel mb="0">Use for payroll</FormLabel>
              <Switch
                isChecked={formData.use_for_payroll === "Yes"}
                onChange={handlePayrollSwitch}
              />
            </FormControl>
          </Box>
        )}

        {/* ============================================================ */}
        {/* 5. INTEREST                                                   */}
        {/* ============================================================ */}
        {currentConfig.showInterest && (
          <Box >
            {/* <Divider mb={4} /> */}


            <Grid templateColumns="repeat(2, 1fr)" gap={4} >

              <FormControl>
                <FormLabel>Activate interest calculation</FormLabel>
                <Select
                  name="activate_interest_calculation"
                  value={formData.activate_interest_calculation}
                  onChange={handleChange}
                >
                  {yesNoOptions}
                </Select>
              </FormControl>

              {/* OD limit – only for Bank OCC / Bank OD accounts */}
              {currentConfig.showOdLimit && (
                <FormControl>
                  <FormLabel>Set OD limit</FormLabel>
                  <Input
                    type="number"
                    name="od_limit"
                    value={formData.od_limit}
                    onChange={handleChange}
                  />
                </FormControl>
              )}

            </Grid>

            {/* Interest parameters – only visible when activated */}
            {formData.activate_interest_calculation === "Yes" && (
              <Box borderWidth="1px" borderRadius="lg" mt={4} className="ledger_box">
                <Heading size="sm" mb={5} className="ledger_heading">Interest Parameters</Heading>

                {/* txn_by_txn_interest → calculate_transaction_by_transaction */}
                <Grid templateColumns="repeat(2, 1fr)" gap={4} p={6}>

                  <FormControl>
                    <FormLabel>Calculate Txn By Txn</FormLabel>
                    <Select
                      name="txn_by_txn_interest"
                      value={formData.txn_by_txn_interest}
                      onChange={handleChange}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Calculate interest based on</FormLabel>
                    <Select
                      name="interest_based_on"
                      value={formData.interest_based_on}
                      onChange={handleChange}
                    >
                      <option value="">Select Any One</option>
                      <option value="Bank/Reco date">Bank/Reco date</option>
                      <option value="Voucher date">Voucher date</option>
                    </Select>
                  </FormControl>

                </Grid>

                <Divider mb={6} />

                {/* 3 Interest Slabs (mirrors JSP iterator) */}
                {formData.interest_configs.map((cfg, index) => (
                  <Box
                    key={index}
                    borderWidth="1px"
                    borderRadius="md"
                    m={5}
                    mb={5} className="ledger_box"
                  >
                    <Heading size="xs" mb={4} className="ledger_heading">
                      Include transaction date for interest calculation {index + 1}
                    </Heading>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4} p={6}>

                      {/* for_amount_added → amount_added (0/1) */}
                      <FormControl>
                        <FormLabel>For amount added</FormLabel>
                        <Select
                          value={cfg.for_amount_added}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "for_amount_added", e.target.value)
                          }
                        >
                          <option value="">Select Any One</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Select>
                      </FormControl>

                      {/* for_amount_deduct → amount_deducted (0/1) */}
                      <FormControl>
                        <FormLabel>For amount deducted</FormLabel>
                        <Select
                          value={cfg.for_amount_deduct}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "for_amount_deduct", e.target.value)
                          }
                        >
                          <option value="">Select Any One</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Rate %</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          value={cfg.rate}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "rate", e.target.value)
                          }
                        />
                      </FormControl>

                      {/* rate_per */}
                      <FormControl>
                        <FormLabel>Rate % per</FormLabel>
                        <Select
                          value={cfg.rate_per}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "rate_per", e.target.value)
                          }
                        >
                          <option value="">Select Any One</option>
                          <option value="Calendar Month">Calendar Month</option>
                          <option value="Calendar Year">Calendar Year</option>
                        </Select>
                      </FormControl>

                      {/* rate_on */}
                      <FormControl>
                        <FormLabel>On</FormLabel>
                        <Select
                          value={cfg.rate_on}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "rate_on", e.target.value)
                          }
                        >
                          <option value="">Select Any One</option>
                          <option value="Credit Balances Only">Credit Balances Only</option>
                          <option value="Debit Balances Only">Debit Balances Only</option>
                        </Select>
                      </FormControl>

                      {/* applicability */}
                      <FormControl>
                        <FormLabel>Applicability</FormLabel>
                        <Select
                          value={cfg.applicability}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "applicability", e.target.value)
                          }
                        >
                          <option value="Always">Always</option>
                          <option value="Past Due Date">Past Due Date</option>
                        </Select>
                      </FormControl>

                      {/* by_days → applicability_days */}
                      <FormControl>
                        <FormLabel>By (days)</FormLabel>
                        <Input
                          type="number"
                          value={cfg.by_days}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "by_days", e.target.value)
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Grace period (days)</FormLabel>
                        <Input
                          type="number"
                          value={cfg.grace_period}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "grace_period", e.target.value)
                          }
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Calculate from</FormLabel>
                        <Select
                          value={cfg.calculate_from}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "calculate_from", e.target.value)
                          }
                        >
                          <option value="Date of Applicability">Date of Applicability</option>
                          <option value="Due Date of invoice/Ref">Due Date of invoice/Ref</option>
                          <option value="Eff. Date of Transaction">Eff. Date of Transaction</option>
                        </Select>
                      </FormControl>

                      {/* security → security_enabled (0/1) */}
                      <FormControl>
                        <FormLabel>Security</FormLabel>
                        <Select
                          value={cfg.security}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "security", e.target.value)
                          }
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Security amount</FormLabel>
                        <Input
                          type="number"
                          value={cfg.security_amount}
                          onChange={(e) =>
                            handleInterestConfigChange(index, "security_amount", e.target.value)
                          }
                        />
                      </FormControl>

                    </Grid>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* ============================================================ */}
        {/* 6. BANK ACCOUNT DETAILS                                       */}
        {/* ============================================================ */}
        {currentConfig.showBankDetails && (
          <Box className="ledger_box">

            <Heading size="sm" className="ledger_heading">Bank Account Details</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} p={6}>

              {/* account_holder_name (was acc_holder_name) */}
              <FormControl>
                <FormLabel>A/C holder's name</FormLabel>
                <Input
                  maxLength={100}
                  name="account_holder_name"
                  value={formData.bank_details.account_holder_name}
                  onChange={handleBankChange}
                />
              </FormControl>

              {/* account_number (was acc_number) */}
              <FormControl>
                <FormLabel>A/C no</FormLabel>
                <Input
                  maxLength={100}
                  name="account_number"
                  value={formData.bank_details.account_number}
                  onChange={handleBankChange}
                />
              </FormControl>

              {/* ifsc_code (was ifsc) */}
              <FormControl>
                <FormLabel>IFSC code</FormLabel>
                <Input
                  maxLength={100}
                  name="ifsc_code"
                  value={formData.bank_details.ifsc_code}
                  onChange={handleBankChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bank name</FormLabel>
                <Input
                  maxLength={100}
                  name="bank_name"
                  value={formData.bank_details.bank_name}
                  onChange={handleBankChange}
                />
              </FormControl>

              {/* branch_name (was branch) */}
              <FormControl>
                <FormLabel>Branch</FormLabel>
                <Input
                  maxLength={100}
                  name="branch_name"
                  value={formData.bank_details.branch_name}
                  onChange={handleBankChange}
                />
              </FormControl>

            </Grid>
          </Box>
        )}

        {/* ============================================================ */}
        {/* 7. BANK CONFIGURATION (cheque book / printing)               */}
        {/* ============================================================ */}
        {currentConfig.showBankConfig && (
          <Box className="ledger_box">

            <Heading size="sm" className="ledger_heading">Bank Configuration</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} p={6}>

              {/* cheque_book_enabled (was cheque_book, now 0/1 via toBool) */}
              <FormControl>
                <FormLabel>Set cheque books</FormLabel>
                <Select
                  name="cheque_book_enabled"
                  value={formData.bank_details.cheque_book_enabled}
                  onChange={handleBankChange}
                >
                  <option value="">Select Any One</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>

              {/* cheque_printing_enabled (was cheque_printing, now 0/1 via toBool) */}
              <FormControl>
                <FormLabel>Cheque printing</FormLabel>
                <Select
                  name="cheque_printing_enabled"
                  value={formData.bank_details.cheque_printing_enabled}
                  onChange={handleBankChange}
                >
                  <option value="">Select Any One</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
              </FormControl>

            </Grid>
          </Box>
        )}

        {/* ============================================================ */}
        {/* 8. MAILING DETAILS                                            */}
        {/* ============================================================ */}
        {/* <Box className="ledger_box">
              <Heading size="sm" className="ledger_heading">Mailing Details</Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} p={6}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input maxLength={100} name="mailing_name" value={formData.mailing_name} onChange={handleChange} />
                </FormControl>
                  <FormControl>
                  <FormLabel>Pincode (Enter Pincode First)</FormLabel>
                  <Input maxLength={40} name="pincode" value={formData.pincode} onChange={handleMailingPincodeChange} />
                </FormControl>

                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Select name="location" value={formData.location} onChange={handleChange} placeholder="Please Select">
                    {mailingAreas.length > 0
                      ? mailingAreas.map((area, i) => (
                        <option key={i} value={area.officename}>
                          {area.officename}
                        </option>
                      ))
                      : locationNames.map((loc, i) => (
                        <option key={i} value={loc.value ?? loc}>
                          {loc.label ?? loc}
                        </option>
                      ))
                    }
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input maxLength={40} name="country" value={formData.country} onChange={handleChange}/>
                </FormControl>

                <FormControl>
                  <FormLabel>State</FormLabel>
                  <Input maxLength={40} name="state" value={formData.state} onChange={handleChange}/>
                </FormControl>
              </Grid>
            </Box> */}

        {/* ============================================================ */}
        {/* 9. TAX REGISTRATION DETAILS                                   */}
        {/* ============================================================ */}
        {currentConfig.showTax && (
          <Box className="ledger_box">

            <Heading size="sm" className="ledger_heading">Tax Registration Details</Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} p={6}>

              {/* pan_no (was pan_it_number) */}
              {currentConfig.showPan && (
                <FormControl>
                  <FormLabel>PAN/IT No.</FormLabel>
                  <Input
                    maxLength={40}
                    name="pan_no"
                    value={formData.pan_no}
                    onChange={handleChange}
                  />
                </FormControl>
              )}

              {/* gst_no – top-level field (was wrongly inside ledgerBankAccount) */}
              <FormControl>
                <FormLabel>GSTIN/UN</FormLabel>
                <Input
                  maxLength={40}
                  name="gst_no"
                  value={formData.gst_no}
                  onChange={handleChange}
                />
              </FormControl>

            </Grid>
          </Box>
        )}


        <Box className="ledger_box">

          <Heading size="sm" className="ledger_heading">Opening Balance</Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={4} p={6}>

            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                name="opening_date"
                value={formData.opening_date}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Current balance</FormLabel>
              <Input
                type="number"
                name="opening_balance"
                value={formData.opening_balance}
                onChange={handleChange}
              />
            </FormControl>

            {/* balance_type (was cr_dr – renamed to match backend) */}
            <FormControl>
              <FormLabel>CR / DR</FormLabel>
              <Select
                name="balance_type"
                value={formData.balance_type}
                onChange={handleChange}
              >
                <option value="Cr">Cr</option>
                <option value="Dr">Dr</option>
              </Select>
            </FormControl>

          </Grid>
        </Box>

        <Box className="ledger_box">
          <Heading size="sm" className="ledger_heading">
            Party Details
          </Heading>

          <Grid templateColumns="repeat(2, 1fr)" gap={4} p={6}>

            <FormControl>
              <FormLabel>Customer Name</FormLabel>
              <Input
                name="customer_name"
                value={formData.crm_details.customer_name}
                onChange={handleCrmChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Customer DOB</FormLabel>
              <Input
                type="date"
                name="customer_dob"
                value={formData.crm_details.customer_dob}
                onChange={handleCrmChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Firm Name</FormLabel>
              <Input
                name="firm_name"
                value={formData.crm_details.firm_name}
                onChange={handleCrmChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Firm Type</FormLabel>

              <Select
                placeholder="Select Firm Type"
                name="firm_type"
                value={formData.crm_details.firm_type || ""}
                onChange={handleCrmChange}
              >
                <option value="proprietor">Proprietor</option>
                <option value="partner">Partner</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Firm Email</FormLabel>
              <Input type="email" name="firm_email" value={formData.crm_details.firm_email} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Firm Since</FormLabel>
              <Input type="date" name="firm_since" value={formData.crm_details.firm_since} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Firm PAN</FormLabel>
              <Input name="firm_pan" value={formData.crm_details.firm_pan} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Firm Aadhar</FormLabel>
              <Input
                name="firm_aadhar"
                value={formData.crm_details.firm_aadhar}
                onChange={handleCrmChange}
              />
            </FormControl>

            <FormControl >
              <FormLabel>GSTN Type</FormLabel>

              <Select
                placeholder="Select GSTN Type"
                name="firm_gstn_type"
                value={formData.crm_details.firm_gstn_type || ""}
                onChange={handleCrmChange}
              >
                <option value="Composition">Composition</option>
                <option value="Consumer">Consumer</option>
                <option value="Regular">Regular</option>
                <option value="Unregistered">Unregistered</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Annual Turnover</FormLabel>
              <Input type="number" name="firm_annual_turnover" value={formData.crm_details.firm_annual_turnover} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Expected Sale Per Year</FormLabel>
              <Input type="number" name="expected_sale_per_year" value={formData.crm_details.expected_sale_per_year} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Other Company Detail</FormLabel>
              <Input name="other_company_detail" value={formData.crm_details.other_company_detail} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input name="address" value={formData.crm_details.address} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>District</FormLabel>
              <Input name="district" value={formData.crm_details.district} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Pincode</FormLabel>
              <Input name="pincode" value={formData.crm_details.pincode} onChange={handleCrmChange} />
            </FormControl>
            <FormControl>
              <FormLabel>State</FormLabel>
              <Input name="state" value={formData.crm_details.state} onChange={handleCrmChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Tehsil</FormLabel>
              <Input name="tehsil" value={formData.crm_details.tehsil} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Landmark</FormLabel>
              <Input name="landmark" value={formData.crm_details.landmark} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Contact</FormLabel>
              <Input name="contact" value={formData.crm_details.contact} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Responsible Person Name</FormLabel>
              <Input name="responsible_person_name" value={formData.crm_details.responsible_person_name} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Responsible Person Contact</FormLabel>
              <Input name="responsible_person_contact" value={formData.crm_details.responsible_person_contact} onChange={handleCrmChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Responsible Person Address</FormLabel>
              <Input name="responsible_person_address" value={formData.crm_details.responsible_person_address} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Seed Licence No</FormLabel>
              <Input name="seed_licence_no" value={formData.crm_details.seed_licence_no} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Fertilizer Licence No</FormLabel>
              <Input name="fert_licence_no" value={formData.crm_details.fert_licence_no} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Pesticide Licence No</FormLabel>
              <Input name="pest_licence_no" value={formData.crm_details.pest_licence_no} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Transport Name</FormLabel>
              <Input name="transport_name" value={formData.crm_details.transport_name} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>CRM Bank Name</FormLabel>
              <Input name="bank_name" value={formData.crm_details.bank_name} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>CRM Account Number</FormLabel>
              <Input name="bank_acc_number" value={formData.crm_details.bank_acc_number} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>CRM IFSC</FormLabel>
              <Input name="bank_ifsc" value={formData.crm_details.bank_ifsc} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>CRM Bank Branch</FormLabel>
              <Input name="bank_branch" value={formData.crm_details.bank_branch} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Security Cheque No 1</FormLabel>
              <Input name="security_cheque_no1" value={formData.crm_details.security_cheque_no1} onChange={handleCrmChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Security Cheque No 2</FormLabel>
              <Input
                name="security_cheque_no2"
                value={formData.crm_details.security_cheque_no2}
                onChange={handleCrmChange}
              />
            </FormControl>

          </Grid>
        </Box>

        <Flex justify="end">
          <Button
            bg="#237086"
            fontWeight="500"
            fontSize="14px"
            color="white"
            _hover={{
              bg: "#1B5A6B",
            }}
            px={8}
            borderRadius="12px"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating..."
          >
            Create Ledger
          </Button>
        </Flex>

      </VStack>

    </Box>
  );
};

export default CreateLedger;