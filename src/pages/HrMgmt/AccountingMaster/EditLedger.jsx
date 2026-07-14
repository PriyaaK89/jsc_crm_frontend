import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Box, Flex, SimpleGrid, Text, Input, Select, Textarea, Button, Switch, FormControl, FormLabel, FormErrorMessage, Tabs, TabList, Tab, TabPanels, TabPanel, Badge, Spinner, Center, Divider, HStack, VStack, useToast, IconButton, Heading, Breadcrumb, BreadcrumbItem, BreadcrumbLink, } from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { GROUP_CONFIG, DEFAULT_GROUP_CONFIG } from "../../HrMgmt/AccountingMaster/LedgerGroupConfig";

const TABS = [
    { id: "basic", label: "Basic Info", icon: "📋" },
    { id: "bank", label: "Bank Details", icon: "🏦" },
    { id: "interest", label: "Interest", icon: "📊" },
    { id: "crm", label: "Party Details", icon: "👤" },
];

const EMPTY_INTEREST_SLAB = {
    slab_no: 1,
    calculate_transaction_by_transaction: 0,
    interest_based_on: "",
    amount_added: 0,
    amount_deducted: 0,
    rate: 0,
    rate_per: "",
    rate_on: "",
    applicability: "",
    applicability_days: 0,
    grace_period: 0,
    security_enabled: 0,
    security_amount: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const val = (v, fallback = "") => (v === null || v === undefined ? fallback : v);
const numVal = (v) => (v === null || v === undefined ? "" : String(v));

// ─── Shared: SectionCard ─────────────────────────────────────────────────────
function SectionCard({ icon, title, children }) {
    return (
        <Box
            bg="#fbfbfb"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.200"
            p={5}
            mb={4}
            boxShadow="sm"
        >
            <HStack mb={4} spacing={2}>
                <Text fontSize="lg">{icon}</Text>
                <Text fontWeight="600" fontSize="md" color="gray.800">
                    {title}
                </Text>
            </HStack>
            {children}
        </Box>
    );
}

// ─── Shared: Toggle ───────────────────────────────────────────────────────────
function Toggle({ id, checked, onChange, label, desc }) {
    return (
        <FormControl
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            py={3}
            px={4}
            bg="gray.50"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
        >
            <Box>
                <FormLabel
                    htmlFor={id}
                    mb={0}
                    fontWeight="500"
                    fontSize="sm"
                    color="gray.700"
                    cursor="pointer"
                >
                    {label}
                </FormLabel>
                {desc && (
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                        {desc}
                    </Text>
                )}
            </Box>
            <Switch
                id={id}
                isChecked={!!checked}
                onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                colorScheme="blue"
                size="md"
            />
        </FormControl>
    );
}

// ─── Shared: Field ────────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
    return (
        <FormControl isInvalid={!!error} isRequired={required}>
            <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1}>
                {label}
            </FormLabel>
            {children}
            {error && <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>}
        </FormControl>
    );
}

// ─── Tab: Basic Info ──────────────────────────────────────────────────────────
function BasicInfoTab({ ledger, onChange, errors, config }) {
    return (
        <>
            {/* Core Details */}
            <SectionCard >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Field label="Ledger Name" required error={errors.ledger_name}>
                        <Input
                            value={val(ledger.ledger_name)}
                            onChange={(e) => onChange("ledger_name", e.target.value)}
                            placeholder="Enter ledger name"
                            size="sm"
                            borderRadius="lg"
                        />
                    </Field>
                    <Field label="Group ID" required error={errors.group_id}>
                        <Input
                            value={val(ledger.group_id)}
                            onChange={(e) => onChange("group_id", e.target.value)}
                            placeholder="Group ID"
                            size="sm"
                            borderRadius="lg"
                        />
                    </Field>
                    <Field label="Employee Under">
                        <Input
                            value={val(ledger.employee_under_name)}
                            onChange={(e) => onChange("employee_under_name", e.target.value)}
                            placeholder="Employee (optional)"
                            size="sm"
                            borderRadius="lg"
                        />
                    </Field>
                    <Field label="Balance Type">
                        <Select
                            value={val(ledger.balance_type, "Dr")}
                            onChange={(e) => onChange("balance_type", e.target.value)}
                            size="sm"
                            borderRadius="lg"
                        >
                            <option value="Dr">Dr (Debit)</option>
                            <option value="Cr">Cr (Credit)</option>
                        </Select>
                    </Field>
                    <Field label="Opening Balance">
                        <Input
                            type="number"
                            value={numVal(ledger.opening_balance)}
                            onChange={(e) => onChange("opening_balance", e.target.value)}
                            placeholder="0.00"
                            size="sm"
                            borderRadius="lg"
                        />
                    </Field>
                    <Field label="Opening Date">
                        <Input
                            type="date"
                            value={val(ledger.opening_date)}
                            onChange={(e) => onChange("opening_date", e.target.value)}
                            size="sm"
                            borderRadius="lg"
                        />
                    </Field>
                </SimpleGrid>
            </SectionCard>

            {/* Tax Details */}
            {config.showTax && (
                <SectionCard icon="🧾" title="Tax Details">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {config.showPan && (
                            <Field label="PAN No.">
                                <Input
                                    value={val(ledger.pan_no)}
                                    onChange={(e) => onChange("pan_no", e.target.value.toUpperCase())}
                                    placeholder="ABCDE1234F"
                                    size="sm"
                                    borderRadius="lg"
                                />
                            </Field>)}
                        <Field label="GST No.">
                            <Input
                                value={val(ledger.gst_no)}
                                onChange={(e) => onChange("gst_no", e.target.value.toUpperCase())}
                                placeholder="22AAAAA0000A1Z5"
                                size="sm"
                                borderRadius="lg"
                            />
                        </Field>
                    </SimpleGrid>
                </SectionCard>
            )}

            {/* Credit Settings */}
            {(
                config.showBillByBill ||
                config.showCreditLimit ||
                config.showCreditPeriod ||
                config.showOdLimit ||
                config.showVoucherCheck
            ) && (
                    <SectionCard icon="💳" title="Credit Settings">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                            {config.showCreditPeriod && (
                                <Field label="Default Credit Period (days)">
                                    <Input
                                        type="number"
                                        value={numVal(ledger.default_credit_period)}
                                        onChange={(e) => onChange("default_credit_period", e.target.value)}
                                        size="sm"
                                        borderRadius="lg"
                                    />
                                </Field>)}

                            {config.showCreditLimit && (
                                <Field label="Credit Limit">
                                    <Input
                                        type="number"
                                        value={numVal(ledger.credit_limit)}
                                        onChange={(e) => onChange("credit_limit", e.target.value)}
                                        size="sm"
                                        borderRadius="lg"
                                    />
                                </Field>)}

                            {config.showOdLimit && (
                                <Field label="OD Limit">
                                    <Input
                                        type="number"
                                        value={numVal(ledger.od_limit)}
                                        onChange={(e) => onChange("od_limit", e.target.value)}
                                        size="sm"
                                        borderRadius="lg"
                                    />
                                </Field>)}
                        </SimpleGrid>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {config.showBillByBill && (
                                <Toggle
                                    id="maintain_bill_by_bill"
                                    checked={ledger.maintain_bill_by_bill}
                                    onChange={(v) => onChange("maintain_bill_by_bill", v)}
                                    label="Maintain Bill-by-Bill"
                                    desc="Track each bill separately"
                                />)}
                            {config.showVoucherCheck && (
                                <Toggle
                                    id="check_credit_days"
                                    checked={ledger.check_credit_days}
                                    onChange={(v) => onChange("check_credit_days", v)}
                                    label="Check Credit Days"
                                />
                            )}
                        </SimpleGrid>
                    </SectionCard>)}

            {/* Features */}
            {(
                config.showInventory ||
                config.showPayroll ||
                config.showInterest
            ) && (
                    <SectionCard icon="⚙️" title="Features">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {config.showInventory && (
                                <Toggle
                                    id="inventory_values_affected"
                                    checked={ledger.inventory_values_affected}
                                    onChange={(v) => onChange("inventory_values_affected", v)}
                                    label="Inventory Values Affected"
                                />)}
                            {config.showPayroll && (
                                <Toggle
                                    id="use_for_payroll"
                                    checked={ledger.use_for_payroll}
                                    onChange={(v) => onChange("use_for_payroll", v)}
                                    label="Use for Payroll"
                                />)}
                            {config.showInterest && (
                                <Toggle
                                    id="activate_interest_calculation"
                                    checked={ledger.activate_interest_calculation}
                                    onChange={(v) => onChange("activate_interest_calculation", v)}
                                    label="Activate Interest Calculation"
                                    desc="Enable interest slabs in the Interest tab"
                                />)}
                        </SimpleGrid>
                    </SectionCard>)}
        </>
    );
}

// ─── Tab: Bank Details ────────────────────────────────────────────────────────
function BankTab({ bank, onChange }) {
    return (
        <SectionCard icon="🏦" title="Bank Account Details">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                <Field label="Account Holder Name">
                    <Input
                        value={val(bank.account_holder_name)}
                        onChange={(e) => onChange("account_holder_name", e.target.value)}
                        size="sm"
                        borderRadius="lg"
                    />
                </Field>
                <Field label="Account Number">
                    <Input
                        value={val(bank.account_number)}
                        onChange={(e) => onChange("account_number", e.target.value)}
                        size="sm"
                        borderRadius="lg"
                    />
                </Field>
                <Field label="IFSC Code">
                    <Input
                        value={val(bank.ifsc_code)}
                        onChange={(e) => onChange("ifsc_code", e.target.value.toUpperCase())}
                        placeholder="SBIN0000001"
                        size="sm"
                        borderRadius="lg"
                    />
                </Field>
                <Field label="Bank Name">
                    <Input
                        value={val(bank.bank_name)}
                        onChange={(e) => onChange("bank_name", e.target.value)}
                        size="sm"
                        borderRadius="lg"
                    />
                </Field>
                <Field label="Branch Name">
                    <Input
                        value={val(bank.branch_name)}
                        onChange={(e) => onChange("branch_name", e.target.value)}
                        size="sm"
                        borderRadius="lg"
                    />
                </Field>
            </SimpleGrid>

            <Divider my={4} />

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Toggle
                    id="cheque_book_enabled"
                    checked={bank.cheque_book_enabled}
                    onChange={(v) => onChange("cheque_book_enabled", v)}
                    label="Cheque Book Enabled"
                />
                <Toggle
                    id="cheque_printing_enabled"
                    checked={bank.cheque_printing_enabled}
                    onChange={(v) => onChange("cheque_printing_enabled", v)}
                    label="Cheque Printing Enabled"
                />
            </SimpleGrid>
        </SectionCard>
    );
}

// ─── Tab: Interest ────────────────────────────────────────────────────────────
function InterestTab({ slabs, onChange, onAdd, onRemove, interestEnabled }) {
    if (!interestEnabled) {
        return (
            <Center
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                py={16}
                px={8}
                boxShadow="sm"
                flexDirection="column"
                gap={3}
            >
                <Text fontSize="4xl">📊</Text>
                <Text fontWeight="600" fontSize="lg" color="gray.700">
                    Interest Calculation Disabled
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center" maxW="sm">
                    Enable "Activate Interest Calculation" in the Basic Info tab to configure interest slabs.
                </Text>
            </Center>
        );
    }

    return (
        <>
            <HStack mb={4}>
                <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                    📊 {slabs.length} slab{slabs.length !== 1 ? "s" : ""} configured
                </Badge>
            </HStack>

            {slabs.map((slab, idx) => (
                <Box
                    key={idx}
                    border="1px solid"
                    borderColor="blue.100"
                    borderRadius="xl"
                    p={5}
                    mb={4}
                    bg="#f7f7f7"
                >
                    {/* Slab Header */}
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontWeight="600" fontSize="md" color="blue.700">
                            Slab {idx + 1}
                        </Text>
                        {slabs.length > 1 && (
                            <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => onRemove(idx)}
                            >
                                ✕ Remove
                            </Button>
                        )}
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                        <Field label="Slab No.">
                            <Input
                                type="number"
                                value={numVal(slab.slab_no)}
                                onChange={(e) => onChange(idx, "slab_no", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            />
                        </Field>
                        <Field label="Rate (%)">
                            <Input
                                type="number"
                                step="0.01"
                                value={numVal(slab.rate)}
                                onChange={(e) => onChange(idx, "rate", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            />
                        </Field>
                        <Field label="Rate Per">
                            <Select
                                value={val(slab.rate_per)}
                                onChange={(e) => onChange(idx, "rate_per", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            >
                                <option value="">Select</option>
                                <option value="Day">Day</option>
                                <option value="Month">Month</option>
                                <option value="Year">Year</option>
                            </Select>
                        </Field>
                        <Field label="Rate On">
                            <Select
                                value={val(slab.rate_on)}
                                onChange={(e) => onChange(idx, "rate_on", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            >
                                <option value="">Select</option>
                                <option value="Balance">Balance</option>
                                <option value="Amount">Amount</option>
                            </Select>
                        </Field>
                        <Field label="Interest Based On">
                            <Select
                                value={val(slab.interest_based_on)}
                                onChange={(e) => onChange(idx, "interest_based_on", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            >
                                <option value="">Select</option>
                                <option value="Simple">Simple</option>
                                <option value="Compound">Compound</option>
                            </Select>
                        </Field>
                        <Field label="Applicability">
                            <Select
                                value={val(slab.applicability)}
                                onChange={(e) => onChange(idx, "applicability", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            >
                                <option value="">Select</option>
                                <option value="Due Date">Due Date</option>
                                <option value="Transaction Date">Transaction Date</option>
                            </Select>
                        </Field>
                        <Field label="Applicability Days">
                            <Input
                                type="number"
                                value={numVal(slab.applicability_days)}
                                onChange={(e) => onChange(idx, "applicability_days", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            />
                        </Field>
                        <Field label="Grace Period (days)">
                            <Input
                                type="number"
                                value={numVal(slab.grace_period)}
                                onChange={(e) => onChange(idx, "grace_period", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            />
                        </Field>
                        <Field label="Security Amount">
                            <Input
                                type="number"
                                value={numVal(slab.security_amount)}
                                onChange={(e) => onChange(idx, "security_amount", e.target.value)}
                                size="sm"
                                borderRadius="lg"
                                bg="white"
                            />
                        </Field>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Toggle
                            id={`calc_txn_${idx}`}
                            checked={slab.calculate_transaction_by_transaction}
                            onChange={(v) => onChange(idx, "calculate_transaction_by_transaction", v)}
                            label="Calc. Txn-by-Txn"
                        />
                        <Toggle
                            id={`security_enabled_${idx}`}
                            checked={slab.security_enabled}
                            onChange={(v) => onChange(idx, "security_enabled", v)}
                            label="Security Enabled"
                        />
                    </SimpleGrid>
                </Box>
            ))}

            <Button
                leftIcon={<Text>+</Text>}
                onClick={onAdd}
                variant="outline"
                colorScheme="blue"
                size="sm"
                borderRadius="lg"
                borderStyle="dashed"
                w="full"
                mt={2}
            >
                Add Interest Slab
            </Button>
        </>
    );
}

// ─── Tab: CRM ─────────────────────────────────────────────────────────────────
function CrmTab({ crm, onChange }) {
    return (
        <>
            {/* Customer & Firm */}
            <SectionCard icon="👤" title="Customer & Firm Details">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Field label="Customer Name">
                        <Input size="sm" borderRadius="lg" value={val(crm.customer_name)} onChange={(e) => onChange("customer_name", e.target.value)} />
                    </Field>
                    <Field label="Customer DOB">
                        <Input type="date" size="sm" borderRadius="lg" value={val(crm.customer_dob)} onChange={(e) => onChange("customer_dob", e.target.value)} />
                    </Field>
                    <Field label="Firm Name">
                        <Input size="sm" borderRadius="lg" value={val(crm.firm_name)} onChange={(e) => onChange("firm_name", e.target.value)} />
                    </Field>
                    <Field label="Firm Type">
                        <Select size="sm" borderRadius="lg" value={val(crm.firm_type)} onChange={(e) => onChange("firm_type", e.target.value)}>
                            <option value="">Select</option>
                            <option value="proprietor">Proprietor</option>
                            <option value="partner">Partner</option>
                        </Select>
                    </Field>
                    <Field label="Firm Email">
                        <Input type="email" size="sm" borderRadius="lg" value={val(crm.firm_email)} onChange={(e) => onChange("firm_email", e.target.value)} />
                    </Field>
                    <Field label="Firm Since">
                        <Input type="date" size="sm" borderRadius="lg" value={val(crm.firm_since)} onChange={(e) => onChange("firm_since", e.target.value)} />
                    </Field>
                    <Field label="Firm PAN">
                        <Input size="sm" borderRadius="lg" value={val(crm.firm_pan)} onChange={(e) => onChange("firm_pan", e.target.value.toUpperCase())} />
                    </Field>
                    <Field label="Firm Aadhar">
                        <Input size="sm" borderRadius="lg" value={val(crm.firm_aadhar)} onChange={(e) => onChange("firm_aadhar", e.target.value)} maxLength={12} />
                    </Field>
                    <Field label="GSTN Type">
                        <Select size="sm" borderRadius="lg" value={val(crm.firm_gstn_type)} onChange={(e) => onChange("firm_gstn_type", e.target.value)}>
                            <option value="">Select</option>
                            <option value="Composition">Composition</option>
                            <option value="Consumer">Consumer</option>
                            <option value="Regular">Regular</option>
                            <option value="Unregistered">Unregistered</option>
                        </Select>
                    </Field>
                    <Field label="Annual Turnover">
                        <Input type="number" size="sm" borderRadius="lg" value={numVal(crm.firm_annual_turnover)} onChange={(e) => onChange("firm_annual_turnover", e.target.value)} />
                    </Field>
                    <Field label="Expected Sale/Year">
                        <Input type="number" size="sm" borderRadius="lg" value={numVal(crm.expected_sale_per_year)} onChange={(e) => onChange("expected_sale_per_year", e.target.value)} />
                    </Field>
                    <Field label="Contact">
                        <Input size="sm" borderRadius="lg" value={val(crm.contact)} onChange={(e) => onChange("contact", e.target.value)} />
                    </Field>
                </SimpleGrid>

                <Divider my={4} />

                <Field label="Other Company Detail">
                    <Textarea
                        size="sm"
                        borderRadius="lg"
                        rows={3}
                        value={val(crm.other_company_detail)}
                        onChange={(e) => onChange("other_company_detail", e.target.value)}
                    />
                </Field>
            </SectionCard>

            {/* Address */}
            <SectionCard icon="📍" title="Address">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Field label="Address">
                        <Input size="sm" borderRadius="lg" value={val(crm.address)} onChange={(e) => onChange("address", e.target.value)} />
                    </Field>
                    <Field label="State">
                        <Input size="sm" borderRadius="lg" value={val(crm.state)} onChange={(e) => onChange("state", e.target.value)} />
                    </Field>
                    <Field label="District">
                        <Input size="sm" borderRadius="lg" value={val(crm.district)} onChange={(e) => onChange("district", e.target.value)} />
                    </Field>
                    <Field label="Tehsil">
                        <Input size="sm" borderRadius="lg" value={val(crm.tehsil)} onChange={(e) => onChange("tehsil", e.target.value)} />
                    </Field>
                    <Field label="Pincode">
                        <Input size="sm" borderRadius="lg" value={val(crm.pincode)} onChange={(e) => onChange("pincode", e.target.value)} />
                    </Field>
                    <Field label="Landmark">
                        <Input size="sm" borderRadius="lg" value={val(crm.landmark)} onChange={(e) => onChange("landmark", e.target.value)} />
                    </Field>
                    <Field label="Branch">
                        <Input size="sm" borderRadius="lg" value={val(crm.branch)} onChange={(e) => onChange("branch", e.target.value)} />
                    </Field>
                    <Field label="Transport Name">
                        <Input size="sm" borderRadius="lg" value={val(crm.transport_name)} onChange={(e) => onChange("transport_name", e.target.value)} />
                    </Field>
                </SimpleGrid>
            </SectionCard>

            {/* Responsible Person */}
            <SectionCard icon="🧑‍💼" title="Responsible Person">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Field label="Name">
                        <Input size="sm" borderRadius="lg" value={val(crm.responsible_person_name)} onChange={(e) => onChange("responsible_person_name", e.target.value)} />
                    </Field>
                    <Field label="Contact">
                        <Input size="sm" borderRadius="lg" value={val(crm.responsible_person_contact)} onChange={(e) => onChange("responsible_person_contact", e.target.value)} />
                    </Field>
                    <Box gridColumn="span 2">
                        <Field label="Address">
                            <Input size="sm" borderRadius="lg" value={val(crm.responsible_person_address)} onChange={(e) => onChange("responsible_person_address", e.target.value)} />
                        </Field>
                    </Box>
                </SimpleGrid>
            </SectionCard>

            {/* Licence Numbers */}
            <SectionCard icon="📜" title="Licence Numbers">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Field label="Seed Licence No.">
                        <Input size="sm" borderRadius="lg" value={val(crm.seed_licence_no)} onChange={(e) => onChange("seed_licence_no", e.target.value)} />
                    </Field>
                    <Field label="Fertilizer Licence No.">
                        <Input size="sm" borderRadius="lg" value={val(crm.fert_licence_no)} onChange={(e) => onChange("fert_licence_no", e.target.value)} />
                    </Field>
                    <Field label="Pesticide Licence No.">
                        <Input size="sm" borderRadius="lg" value={val(crm.pest_licence_no)} onChange={(e) => onChange("pest_licence_no", e.target.value)} />
                    </Field>
                </SimpleGrid>
            </SectionCard>

            {/* CRM Bank Details */}
            <SectionCard icon="🏦" title="Bank Details">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                    <Field label="Bank Name">
                        <Input size="sm" borderRadius="lg" value={val(crm.bank_name)} onChange={(e) => onChange("bank_name", e.target.value)} />
                    </Field>
                    <Field label="Account Number">
                        <Input size="sm" borderRadius="lg" value={val(crm.bank_acc_number)} onChange={(e) => onChange("bank_acc_number", e.target.value)} />
                    </Field>
                    <Field label="IFSC Code">
                        <Input size="sm" borderRadius="lg" value={val(crm.bank_ifsc)} onChange={(e) => onChange("bank_ifsc", e.target.value.toUpperCase())} />
                    </Field>
                    <Field label="Bank Branch">
                        <Input size="sm" borderRadius="lg" value={val(crm.bank_branch)} onChange={(e) => onChange("bank_branch", e.target.value)} />
                    </Field>
                </SimpleGrid>

                <Divider my={4} />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Field label="Security Cheque No. 1">
                        <Input size="sm" borderRadius="lg" value={val(crm.security_cheque_no1)} onChange={(e) => onChange("security_cheque_no1", e.target.value)} />
                    </Field>
                    <Field label="Security Cheque No. 2">
                        <Input size="sm" borderRadius="lg" value={val(crm.security_cheque_no2)} onChange={(e) => onChange("security_cheque_no2", e.target.value)} />
                    </Field>
                </SimpleGrid>
            </SectionCard>
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EditLedger = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [groupName, setGroupName] = useState("");
    const [activeTab, setActiveTab] = useState("basic");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // ── Form state ──────────────────────────────────────────────────────────────
    const [ledger, setLedger] = useState({
        ledger_name: "",
        group_id: "",
        employee_under_name: "",
        opening_balance: 0,
        balance_type: "Dr",
        opening_date: "",
        mailing_name: "",
        location: "",
        country: "",
        state: "",
        pincode: "",
        pan_no: "",
        gst_no: "",
        maintain_bill_by_bill: 0,
        default_credit_period: 0,
        check_credit_days: 0,
        credit_limit: 0,
        inventory_values_affected: 0,
        use_for_payroll: 0,
        activate_interest_calculation: 0,
        od_limit: 0,
    });

    const [bank, setBank] = useState({
        account_holder_name: "",
        account_number: "",
        ifsc_code: "",
        bank_name: "",
        branch_name: "",
        cheque_book_enabled: 0,
        cheque_printing_enabled: 0,
    });

    const [interestSlabs, setInterestSlabs] = useState([{ ...EMPTY_INTEREST_SLAB }]);

    const [crm, setCrm] = useState({
        customer_name: "", customer_dob: "",
        firm_name: "", firm_type: "", firm_email: "", firm_since: "",
        firm_pan: "", firm_aadhar: "", firm_gstn_type: "",
        firm_annual_turnover: "", expected_sale_per_year: "", other_company_detail: "",
        address: "", state: "", district: "", tehsil: "",
        pincode: "", landmark: "", branch: "", contact: "",
        responsible_person_name: "", responsible_person_address: "", responsible_person_contact: "",
        seed_licence_no: "", fert_licence_no: "", pest_licence_no: "", transport_name: "",
        bank_name: "", bank_acc_number: "", bank_ifsc: "", bank_branch: "",
        security_cheque_no1: "", security_cheque_no2: "",
    });

    // ── Toast helper ────────────────────────────────────────────────────────────
    const showToast = useCallback(
        (type, message) => {
            toast({
                title: message,
                status: type === "success" ? "success" : "error",
                duration: 3500,
                isClosable: true,
                position: "top-right",
            });
        },
        [toast]
    );

    const activeConfig =
        GROUP_CONFIG[groupName] || DEFAULT_GROUP_CONFIG;

    const TABS = [
        { id: "basic", label: "Basic Info", icon: "📋" },
        { id: "bank", label: "Bank Details", icon: "🏦" },
        { id: "interest", label: "Interest", icon: "📊" },
        { id: "crm", label: "Party Details", icon: "👤" },
    ];

    // ── Fetch ledger ────────────────────────────────────────────────────────────
    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            const response = await API.get(`${API_ENDPOINTS.get_ledger_by_id}/${id}`);
            const d = response?.data?.data || response?.data || {};

            setGroupName(d.group_name || "");

            setLedger({
                ledger_name: val(d.ledger_name),
                group_id: val(d.group_id),
                employee_under_name: val(d.employee_under_name),
                opening_balance: val(d.opening_balance, 0),
                balance_type: val(d.balance_type, "Dr"),
                opening_date: d.opening_date ? d.opening_date.slice(0, 10) : "",
                mailing_name: val(d.mailing_name),
                location: val(d.location),
                country: val(d.country),
                state: val(d.state),
                pincode: val(d.pincode),
                pan_no: val(d.pan_no),
                gst_no: val(d.gst_no),
                maintain_bill_by_bill: val(d.maintain_bill_by_bill, 0),
                default_credit_period: val(d.default_credit_period, 0),
                check_credit_days: val(d.check_credit_days, 0),
                credit_limit: val(d.credit_limit, 0),
                inventory_values_affected: val(d.inventory_values_affected, 0),
                use_for_payroll: val(d.use_for_payroll, 0),
                activate_interest_calculation: val(d.activate_interest_calculation, 0),
                od_limit: val(d.od_limit, 0),
            });

            if (d.bank_detail_id || d.account_number) {
                setBank({
                    account_holder_name: val(d.account_holder_name),
                    account_number: val(d.account_number),
                    ifsc_code: val(d.ifsc_code),
                    bank_name: val(d.bank_name),
                    branch_name: val(d.branch_name),
                    cheque_book_enabled: val(d.cheque_book_enabled, 0),
                    cheque_printing_enabled: val(d.cheque_printing_enabled, 0),
                });
            }

            const configs = Array.isArray(d.interest_configs) ? d.interest_configs : [];
            if (configs.length > 0) {
                setInterestSlabs(
                    configs.map((c) => ({
                        slab_no: val(c.slab_no, 1),
                        calculate_transaction_by_transaction: val(c.calculate_transaction_by_transaction, 0),
                        interest_based_on: val(c.interest_based_on),
                        amount_added: val(c.amount_added, 0),
                        amount_deducted: val(c.amount_deducted, 0),
                        rate: val(c.rate, 0),
                        rate_per: val(c.rate_per),
                        rate_on: val(c.rate_on),
                        applicability: val(c.applicability),
                        applicability_days: val(c.applicability_days, 0),
                        grace_period: val(c.grace_period, 0),
                        security_enabled: val(c.security_enabled, 0),
                        security_amount: val(c.security_amount, 0),
                    }))
                );
            }

            setCrm({
                customer_name: val(d.customer_name),
                customer_dob: d.customer_dob ? d.customer_dob.slice(0, 10) : "",
                firm_name: val(d.firm_name),
                firm_type: val(d.firm_type),
                firm_email: val(d.firm_email),
                firm_since: d.firm_since ? d.firm_since.slice(0, 10) : "",
                firm_pan: val(d.firm_pan),
                firm_aadhar: val(d.firm_aadhar),
                firm_gstn_type: val(d.firm_gstn_type),
                firm_annual_turnover: val(d.firm_annual_turnover),
                expected_sale_per_year: val(d.expected_sale_per_year),
                other_company_detail: val(d.other_company_detail),
                address: val(d.address),
                state: val(d.crm_state || d.state),
                district: val(d.district),
                tehsil: val(d.tehsil),
                pincode: val(d.crm_pincode || d.pincode),
                landmark: val(d.landmark),
                branch: val(d.branch),
                contact: val(d.contact),
                responsible_person_name: val(d.responsible_person_name),
                responsible_person_address: val(d.responsible_person_address),
                responsible_person_contact: val(d.responsible_person_contact),
                seed_licence_no: val(d.seed_licence_no),
                fert_licence_no: val(d.fert_licence_no),
                pest_licence_no: val(d.pest_licence_no),
                transport_name: val(d.transport_name),
                bank_name: val(d.crm_bank_name || d.bank_name),
                bank_acc_number: val(d.bank_acc_number),
                bank_ifsc: val(d.bank_ifsc),
                bank_branch: val(d.bank_branch),
                security_cheque_no1: val(d.security_cheque_no1),
                security_cheque_no2: val(d.security_cheque_no2),
            });
        } catch (error) {
            console.error("Fetch ledger error:", error);
            showToast("error", "Failed to load ledger details.");
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => { fetchLedger(); }, [fetchLedger]);

    // ── Change handlers ─────────────────────────────────────────────────────────
    const handleLedgerChange = (key, value) => {
        setLedger((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const handleBankChange = (key, value) =>
        setBank((prev) => ({ ...prev, [key]: value }));

    const handleSlabChange = (idx, key, value) =>
        setInterestSlabs((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [key]: value };
            return next;
        });

    const handleAddSlab = () =>
        setInterestSlabs((prev) => [
            ...prev,
            { ...EMPTY_INTEREST_SLAB, slab_no: prev.length + 1 },
        ]);

    const handleRemoveSlab = (idx) =>
        setInterestSlabs((prev) =>
            prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, slab_no: i + 1 }))
        );

    const handleCrmChange = (key, value) =>
        setCrm((prev) => ({ ...prev, [key]: value }));

    // ── Validation ──────────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!ledger.ledger_name?.trim()) errs.ledger_name = "Ledger name is required";
        if (!ledger.group_id) errs.group_id = "Group is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Submit ──────────────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        if (!validate()) {
            setActiveTab("basic");
            showToast("error", "Please fix validation errors before saving.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ledger: {
                    ...ledger,
                    opening_balance: Number(ledger.opening_balance) || 0,
                    default_credit_period: Number(ledger.default_credit_period) || 0,
                    credit_limit: Number(ledger.credit_limit) || 0,
                    od_limit: Number(ledger.od_limit) || 0,
                },
                bank_details: bank,
                interest_configs: ledger.activate_interest_calculation
                    ? interestSlabs.map((s) => ({
                        ...s,
                        slab_no: Number(s.slab_no) || 1,
                        rate: Number(s.rate) || 0,
                        applicability_days: Number(s.applicability_days) || 0,
                        grace_period: Number(s.grace_period) || 0,
                        security_amount: Number(s.security_amount) || 0,
                    }))
                    : [],
                other_details: {
                    ...crm,
                    firm_annual_turnover: crm.firm_annual_turnover ? Number(crm.firm_annual_turnover) : null,
                    expected_sale_per_year: crm.expected_sale_per_year ? Number(crm.expected_sale_per_year) : null,
                },
            };

            await API.put(`${API_ENDPOINTS.update_ledger}/${id}`, payload);
            showToast("success", "Ledger updated successfully!");
        } catch (error) {
            console.error("Update ledger error:", error);
            const msg = error?.response?.data?.message || "Failed to update ledger.";
            showToast("error", msg);
        } finally {
            setSaving(false);
        }
    };

    // ── Derived: controlled tab index ───────────────────────────────────────────
    const tabIndex = TABS.findIndex((t) => t.id === activeTab);

    // ─── Render ─────────────────────────────────────────────────────────────────
    return (
        <Box bg="white" mt={{ base: 2, md: 5 }} px={{ base: 3, md: 6 }} py={{ base: 3, md: 5 }} borderRadius="16px" boxShadow="sm">
            <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4} mb={3} >
                <Box>
                    <Breadcrumb color="#8B8D97" mb={1}>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to="/dashboard"> <GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbItem>
                            <BreadcrumbLink isCurrentPage color="#8B8D97" fontSize="13px" > Edit Ledger </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <Heading size="md" color="#1A202C" > Edit Ledger </Heading>
                </Box>
            </Flex>

            {loading ? (
                <Center py={24} flexDirection="column" gap={3}>
                    <Spinner size="lg" color="blue.500" thickness="3px" />
                    <Text fontSize="sm" color="gray.500">
                        Loading ledger details…
                    </Text>
                </Center>
            ) : (
                <Box maxW="1000px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
                    <Tabs index={tabIndex} onChange={(i) => setActiveTab(TABS[i].id)} variant="enclosed" colorScheme="blue" isLazy >
                        <TabList bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" p={1} mb={5} boxShadow="sm" overflowX="auto" gap={2} >
                            {TABS.map((tab) => (
                                <Tab
                                    key={tab.id}
                                    borderRadius="lg"
                                    fontSize="sm"
                                    fontWeight="500"
                                    _selected={{ bg: "blue.500", color: "white", fontWeight: "600", }}
                                    _hover={{ bg: "gray.100" }}
                                    px={4}
                                    py={2} >
                                    <HStack spacing={1.5}>
                                        <Text>{tab.icon}</Text>
                                        <Text>{tab.label}</Text>
                                    </HStack>
                                </Tab>
                            ))}
                        </TabList>

                        <TabPanels>
                            {/* Basic Info - always shown */}
                            <TabPanel p={0}>
                                <BasicInfoTab ledger={ledger} onChange={handleLedgerChange} errors={errors} config={activeConfig} />
                            </TabPanel>

                            {/* Bank Details - always a panel, conditionally show content */}
                            <TabPanel p={0}>
                                {activeConfig.showBankDetails
                                    ? <BankTab bank={bank} onChange={handleBankChange} />
                                    : <Center py={16}><Text color="gray.400">Not applicable for this ledger group.</Text></Center>
                                }
                            </TabPanel>

                            {/* Interest - always a panel */}
                            <TabPanel p={0}>
                                {activeConfig.showInterest
                                    ? <InterestTab slabs={interestSlabs} onChange={handleSlabChange} onAdd={handleAddSlab} onRemove={handleRemoveSlab} interestEnabled={!!ledger.activate_interest_calculation} />
                                    : <Center py={16}><Text color="gray.400">Not applicable for this ledger group.</Text></Center>
                                }
                            </TabPanel>

                            {/* CRM - always shown */}
                            <TabPanel p={0}>
                                <CrmTab crm={crm} onChange={handleCrmChange} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            )}
            <HStack justifyContent="end">
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
                    onClick={handleUpdate}
                    isLoading={saving}
                    loadingText="Saving…"
                    isDisabled={loading} textAlign="end"
                >
                    Update
                </Button>
            </HStack>
        </Box>
    );
};

export default EditLedger;