import React from "react";
import { Box, Text, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import {
  AGREEMENT_TEMPLATE,
  ANNEXURE_A_TEMPLATE,
  ANNEXURE_B_TEMPLATE,
  ANNEXURE_C_TEMPLATE,
  fillTemplate,
  paginateTemplate,
  buildTemplateData,
} from "./agreementContent";

/**
 * PlainDocumentPages
 * ---------------------------------------------------------------------------
 * Same content/template pipeline as before. UI now matches
 * EmpAgreementLetterPreview.jsx: Georgia font, justified body copy,
 * numbered-clause heading sizes, black-bordered Chakra <Table/> for
 * key/value + grid data, and a small light-blue page number centered
 * at the bottom of every page.
 *
 * TYPOGRAPHY UPDATE (matches JSC_MASTER_EMPLOYMENT_JOINING_DOCUMENT.docx):
 *  - "## " titles / "### " section headings -> bold + underline
 *  - "#### " sub-labels (e.g. "BY AND BETWEEN") -> bold only, left aligned
 *  - Leading clause numbers ("1.1", "19.1"...) -> auto-bolded, no template edits needed
 *  - Leading "WHEREAS," / "NOW, THEREFORE," -> auto-bolded
 *  - Standalone "AND" paragraph -> bold
 *  - Underscore-only lines -> rendered as a real horizontal rule
 *  - Inline markers inside template strings: %%text%% = bold+underline,
 *    **text** = bold, __text__ = underline, *text* = italic
 * Nothing about data flow, pagination, table building, or props changed.
 * ---------------------------------------------------------------------------
 */

const g = (v) => (v === undefined || v === null || v === "" ? "__________" : v);
const money = (v) => (v === undefined || v === null || v === "" ? "__________" : `₹ ${v}`);

/* ============================== inline formatting ============================== */
// Supports (in this priority order, so they never collide):
//   %%text%%  -> bold + underline
//   **text**  -> bold
//   __text__  -> underline
//   *text*    -> italic
const INLINE_REGEX = /(%%[^%]+%%|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g;

function renderInline(text) {
  if (typeof text !== "string" || text === "") return text;
  const parts = text.split(INLINE_REGEX);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("%%") && part.endsWith("%%")) {
      return (
        <span key={idx} style={{ fontWeight: "bold", textDecoration: "underline", fontFamily:"Georgia", }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("//") && part.endsWith("//")) {
      return (
        <span key={idx} style={{ fontWeight: "bold", fontFamily:"Georgia", }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={idx} style={{ fontWeight: "bold" }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return (
        <span key={idx} style={{ fontWeight: "600" }}>
          {part.slice(2, -2)}
        </span>
      );
    }

    if (part.startsWith("__") && part.endsWith("__")) {
      return (
        <span key={idx} style={{ textDecoration: "underline" }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <span key={idx} style={{ fontFamily:"Georgia", fontStyle: "italic" }}>
          {part.slice(1, -1)}
        </span>
      );
    }
  
    return part;
  });
}

// Leading "1.1 ", "19.4 " style clause numbers -> bold, rest of the
// paragraph goes through renderInline as normal. Leading "WHEREAS," /
// "NOW, THEREFORE," recitals -> bold, same treatment for the remainder.
const CLAUSE_NUM_REGEX = /^(\d{1,2}\.\d{1,2})(\s+)/;
const RECITAL_REGEX = /^(WHEREAS,|NOW, THEREFORE,)(\s*)/;

function renderParagraphContent(block) {
  const clauseMatch = block.match(CLAUSE_NUM_REGEX);
  const recitalMatch = !clauseMatch && block.match(RECITAL_REGEX);

  if (clauseMatch) {
    const rest = block.slice(clauseMatch[0].length);
    return (
      <>
        <span style={{ fontWeight: "bold", fontSize: "14px", fontFamily: "Georgia" }}>{clauseMatch[1]}&nbsp;</span>
        {renderInline(rest)}
      </>
    );
  }
  if (recitalMatch) {
    const rest = block.slice(recitalMatch[0].length);
    return (
      <>
        <span style={{ fontWeight: "bold", fontFamily: "Georgia" }}>{recitalMatch[1]}</span>{" "}
        {renderInline(rest)}
      </>
    );
  }
  return renderInline(block);
}

/* ============================== page shell ============================== */

const PlainPage = ({ children, pageNumber }) => (
  <Box className="pdf-page page-break" fontFamily="Georgia" bg="white">
    <VStack width="90%" margin="auto" gap="1rem" align="stretch">
      <Box mt="3.5rem">
        <VStack align="flex-start" spacing={0} width="100%">
          {children}
        </VStack>
      </Box>
    </VStack>
    <Box>
      <Text textAlign="center" fontSize="12px" color="#a8b9d2" mt="3.5rem">
        {pageNumber}
      </Text>
    </Box>
  </Box>
);

/* ============================== tables ============================== */
// Key/value table (label | value), same visual language as the salary-policy
// table in EmpAgreementLetterPreview.jsx: black border, Georgia, 14px cells.
const KV = ({ rows }) => (
  <Table variant="simple" border="1px solid black" mb="10px" w="100%">
    <Tbody>
      {rows.map(([label, value], i) => (
        <Tr key={i}>
          <Td
            style={{ borderRight: "1px solid black", borderBottom: i === rows.length - 1 ? "none" : "1px solid black" }}
            fontWeight="600"
            fontSize="13px"
            fontFamily="Georgia"
            // bg="gray.50"
            padding="8px 2px 8px 4px"
            whiteSpace="normal"
            wordBreak="break-word"
          >
            {label}
          </Td>
          <Td
            style={{ borderBottom: i === rows.length - 1 ? "none" : "1px solid black" }}
            fontSize="13px"
            fontWeight="600"
            fontFamily="Georgia"
            padding="8px 10px"
            whiteSpace="normal"
            wordBreak="break-word"
          >
            {g(value)}
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

// Multi-column data table (headers + rows), styled exactly like the
// "Target Achievement / Salary Payout" table on the agreement cover.
const GridTable = ({ headers, rows }) => (
  <Table variant="simple" border="1px solid black" mb="10px" w="100%">
    <Thead>
      <Tr>
        {headers.map((h, i) => (
          <Th
            key={i}
            style={{
              borderRight: i === headers.length - 1 ? "none" : "1px solid black",
              borderBottom: "1px solid black",
            }}
            fontSize="13px"
            fontFamily="Georgia"
            textTransform="none"
            padding="8px 10px"
          >
            {h}
          </Th>
        ))}
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((row, ri) => (
        <Tr key={ri}>
          {row.map((cell, ci) => (
            <Td
              key={ci}
              style={{
                borderRight: ci === row.length - 1 ? "none" : "1px solid black",
                borderBottom: ri === rows.length - 1 ? "none" : "1px solid black",
              }}
              fontSize="13px"
              fontFamily="Georgia"
              padding="8px 10px"
              whiteSpace="normal"
              wordBreak="break-word"
            >
              {cell}
            </Td>
          ))}
        </Tr>
      ))}
    </Tbody>
  </Table>
);

/* ============================== signatures ============================== */

const SignatureBlock = ({ formData }) => (
  <HStack width="100%" align="flex-start" spacing={6} mt="18px" fontFamily="Georgia">
    <VStack align="flex-start" flex="1" spacing={1} fontSize="15px">
      <Text fontWeight="bold" mb="4px">FOR JAMIDARA SEEDS CORPORATION</Text>
      <Text>Authorized Signatory: GIRDHARI LAL</Text>
      <Text>Designation: PARTNER / AUTHORIZED SIGNATORY</Text>
      <Text mt="10px">Signature / eSign: __________________________</Text>
      <Text>Date: ____ / ____ / ______&nbsp;&nbsp; Place: JAIPUR</Text>
    </VStack>
    <VStack align="flex-start" flex="1" spacing={1} fontSize="15px">
      <Text fontWeight="bold" mb="4px">EMPLOYEE</Text>
      <Text>Name: {g(formData?.employee_name)}</Text>
      <Text>Designation: {g(formData?.job_role_name)}</Text>
      <Text mt="10px">Signature / Aadhaar eSign: __________________</Text>
      <Text>Date: ____ / ____ / ______&nbsp;&nbsp; Place: __________</Text>
    </VStack>
  </HStack>
);

const WitnessBlock = () => (
  <HStack width="100%" align="flex-start" spacing={6} mt="14px" fontFamily="Georgia">
    <VStack align="flex-start" flex="1" spacing={1} fontSize="15px">
      <Text fontWeight="bold" mb="4px">WITNESS 1</Text>
      <Text>Signature: __________________________</Text>
      <Text>Name &amp; Address: ____________________</Text>
      <Text>Date: ____________________</Text>
    </VStack>
    <VStack align="flex-start" flex="1" spacing={1} fontSize="15px">
      <Text fontWeight="bold" mb="4px">WITNESS 2</Text>
      <Text>Signature: __________________________</Text>
      <Text>Name &amp; Address: ____________________</Text>
      <Text>Date: ____________________</Text>
    </VStack>
  </HStack>
);

/* ============================== table registry (unchanged logic) ============================== */
function buildTableRegistry(employee, formData, d) {
  const basic = Number(formData?.basic) || 0;
  const houseRent = Number(formData?.house_rent) || 0;
  const medical = Number(formData?.medical) || 0;
  const dearness = Number(formData?.dearness_allowance) || 0;
  const other = Number(formData?.other_allowance) || 0;
  const guaranteedMonthly = basic + houseRent + medical + dearness + other;
  const guaranteedAnnual = guaranteedMonthly * 12;
  const variableUpto = Number(formData?.variable_pay_upto) || 0;
  const totalMonthlyUpto = guaranteedMonthly + variableUpto;

  return {
    appointmentParticulars: (
      <KV
        rows={[
          ["Nature of Appointment", "PROBATIONER APPOINTMENT"],
          ["Employment Starting Date", d.employment_starting_date],
          ["Designation", d.designation],
          ["Department/Function", d.department_name],
          ["Reporting Manager", `${g(d.reporting_manager_name)} (${g(d.reporting_manager_designation)})`],
          ["Headquarter", d.headquarter],
          ["Territory/Area", d.territory_area],
          ["Place of Posting", d.place_of_posting],
          ["Probation Period", "SIX (6) MONTHS"],
          ["Maximum Extension", "UP TO THREE (3) ADDITIONAL MONTHS BY WRITTEN NOTICE"],
          ["Weekly Off", "SUNDAY OR AS PER DUTY ROSTER / COMPANY CALENDAR"],
          ["Ordinary Office Hours", "9:30 A.M. TO 6:30 P.M., INCLUDING ONE-HOUR REST/MEAL BREAK"],
        ]}
      />
    ),

    noticeDetails: (
      <KV
        rows={[
          ["Employee Address for Notice", d.residential_address],
          ["Employee Official Email", d.email_id],
          ["Employee Mobile Number", d.mobile_no],
          ["Employer Address for Notice", "S-19, Aggression Tower, Vidhyadher Nagar, Jaipur - 302039, Rajasthan"],
          ["Employer Official Email", d.hr_email],
        ]}
      />
    ),

    agreementSignatures: <SignatureBlock formData={{ employee_name: employee?.name, job_role_name: formData?.job_role_name }} />,
    witnessSignatures: <WitnessBlock />,
    annexureASignatures: <SignatureBlock formData={{ employee_name: employee?.name, job_role_name: formData?.job_role_name }} />,
    annexureBSignatures: <SignatureBlock formData={{ employee_name: employee?.name, job_role_name: formData?.job_role_name }} />,
    annexureCSignatures: <SignatureBlock formData={{ employee_name: employee?.name, job_role_name: formData?.job_role_name }} />,

    employeePayrollDetails: (
      <KV
        rows={[
          ["Employee Name", employee?.name],
          ["Employee ID", d.employee_id],
          ["Designation", d.designation],
          ["Department", d.department_name],
          ["Headquarter", d.headquarter],
          ["State of Posting", d.appointer_state],
          ["Effective From", d.effective_from],
        ]}
      />
    ),

    monthlyCompensation: (
      <GridTable
        headers={["COMPONENT", "MONTHLY (₹)", "ANNUAL (₹)", "NATURE"]}
        rows={[
          ["Basic Pay", basic || "__________", basic ? basic * 12 : "__________", "Guaranteed Fixed"],
          ["House Rent Allowance (HRA)", houseRent || "__________", houseRent ? houseRent * 12 : "__________", "Guaranteed Fixed"],
          ["Medical Allowance", medical || "__________", medical ? medical * 12 : "__________", "Guaranteed Fixed"],
          ["Special / Dearness Allowance", dearness || "__________", dearness ? dearness * 12 : "__________", "Guaranteed Fixed"],
          ["Other Fixed Allowance", other || "__________", other ? other * 12 : "__________", "Guaranteed Fixed"],
          [<b key="a">A. Guaranteed Fixed Monthly Pay</b>, <b key="am">{guaranteedMonthly || "__________"}</b>, <b key="aa">{guaranteedMonthly ? guaranteedAnnual : "__________"}</b>, <b key="an">Target: 50%</b>],
          [<b key="b">B. Performance-Linked Variable Pay</b>, <b key="bm">Up to {variableUpto || "__________"}</b>, <b key="ba">Up to {variableUpto ? variableUpto * 12 : "__________"}</b>, <b key="bn">Target: Up to 50%</b>],
          [<b key="t">TOTAL MONTHLY EARNING OPPORTUNITY (A+B)</b>, <b key="tm">Up to {totalMonthlyUpto || "__________"}</b>, <b key="ta">Up to {totalMonthlyUpto ? totalMonthlyUpto * 12 : "__________"}</b>, <b key="tn">100% before Incentive</b>],
        ]}
      />
    ),

    noticePayBase: (
      <KV
        rows={[
          ["Notice Pay Base", `BASIC PAY / ${money(d.notice_pay_base_amount)} PER MONTH`],
          ["Daily Notice Pay Base", "MONTHLY NOTICE PAY BASE ÷ 30, subject to Applicable Law"],
        ]}
      />
    ),

    taDaTable: (
      <GridTable
        headers={["ITEM", "RATE / LIMIT", "TREATMENT"]}
        rows={[
          ["Bike Reimbursement", `${money(d.bike_rate)} / KM`, "Approved business travel"],
          ["Car Reimbursement", `${money(d.car_rate)} / KM`, "Approved business travel"],
          ["Daily Allowance (DA)", `${money(d.ta_daily_allowance)} / eligible day`, "Approved tour/field duty"],
          ["Hotel / Lodging", `Up to ${money(d.hotel_limit)} / night`, "Actual or approved limit, whichever is less"],
          ["Public Transport", "Actual / Approved", "Supporting proof as required"],
          ["Expense Submission Deadline", `Within ${g(d.expense_submission_days)} days`, `Approval: ${g(d.expense_approval_authority)}`],
        ]}
      />
    ),

    payoutMatrix: (
      <GridTable
        headers={["VERIFIED PERFORMANCE", "GUARANTEED FIXED", "VARIABLE PAY EARNED", "TOTAL PAYOUT", "ADDITIONAL INCENTIVE"]}
        rows={[
          ["Below 60%", "100% of Guaranteed Fixed", "NIL", "50% of Total Earning Opportunity", "NIL"],
          ["60% - 69.99%", "100% of Guaranteed Fixed", "40% of PLVP", "70% of Total Earning Opportunity", "NIL"],
          ["70% - 79.99%", "100% of Guaranteed Fixed", "70% of PLVP", "85% of Total Earning Opportunity", "NIL"],
          ["80% - 89.99%", "100% of Guaranteed Fixed", "100% of PLVP", "100% Salary", `Level 1: ${g(formData?.incentive_level1_percent)}% / ${money(formData?.incentive_level1_amount)}`],
          ["90% - 99.99%", "100% of Guaranteed Fixed", "100% of PLVP", "100% Salary", `Level 2: ${g(formData?.incentive_level2_percent)}% / ${money(formData?.incentive_level2_amount)}`],
          ["100% - 109.99%", "100% of Guaranteed Fixed", "100% of PLVP", "100% Salary", `Level 3: ${g(formData?.incentive_level3_percent)}% / ${money(formData?.incentive_level3_amount)}`],
          ["110% - 119.99%", "100% of Guaranteed Fixed", "100% of PLVP", "100% Salary", `Accelerator: ${g(formData?.incentive_accelerator_percent)}% / ${money(formData?.incentive_accelerator_amount)}`],
          ["120% & Above", "100% of Guaranteed Fixed", "100% of PLVP", "100% Salary", `Super Accelerator: ${g(formData?.incentive_super_accelerator_percent)}% / ${money(formData?.incentive_super_accelerator_amount)}`],
        ]}
      />
    ),

    employeeRoleDetails: (
      <KV
        rows={[
          ["Employee Name", employee?.name],
          ["Employee ID", d.employee_id],
          ["Designation", d.designation],
          ["Reporting Manager", d.reporting_manager_name],
          ["Headquarter", d.headquarter],
          ["Territory / Area", d.territory_area],
          ["State of Posting", d.appointer_state],
          ["Review Month / Season", d.review_month_season],
        ]}
      />
    ),

    businessTargetCommitment: (
      <GridTable
        headers={["KPI / COMMITMENT", "TARGET / STANDARD", "MEASUREMENT SOURCE"]}
        rows={[
          ["Annual / Seasonal Sales Commitment", g(formData?.annual_sales_commitment), "Verified net sales / ERP"],
          ["Monthly Sales Target", g(formData?.monthly_sales_target), "Verified net sales / ERP"],
          ["Collection / Realisation Target", g(formData?.collection_target), "Company bank / authorised ledger"],
          ["New Active Dealer / Distributor", g(formData?.new_dealer_target), "Approved activation"],
          ["Product / ABS Booking Target", g(formData?.product_booking_target), "Approved booking records"],
          ["Market / Field Visit Standard", g(formData?.field_visit_standard), "CRM + GPS / visit proof"],
          ["Team Target (managerial role)", g(formData?.team_target), "Approved team performance report"],
          ["Other Role KPI", g(formData?.other_kpi_name), g(formData?.other_kpi_measurement)],
        ]}
      />
    ),

    performanceWeightage: (
      <GridTable
        headers={["PERFORMANCE AREA", "WEIGHT", "ACHIEVEMENT", "WEIGHTED SCORE"]}
        rows={[
          ["Net Sales / Business Achievement", "40%", "________%", "________"],
          ["Collection / Realisation", "30%", "________%", "________"],
          ["New Dealer / Distributor Development", "15%", "________%", "________"],
          ["Market / Team Coverage & Execution", "5%", "________%", "________"],
          ["CRM / GPS / Reporting Compliance", "10%", "________%", "________"],
          [<b key="tot">TOTAL</b>, <b key="totw">100%</b>, "", <b key="tots">________%</b>],
        ]}
      />
    ),

    initialValidation: (
      <GridTable
        headers={["REVIEW", "ACTIVITY / EXPECTATION", "TARGET", "ACTUAL", "DECISION / REMARKS"]}
        rows={[
          ["Day 7", "Product knowledge, field activity, verified visits, CRM/GPS discipline", "____________", "____________", "____________"],
          ["Day 15", "Qualified pipeline, dealer/distributor prospects, follow-up, collection activity", "____________", "____________", "____________"],
          ["Day 22", "Commercial validation, booking/order/collection progress, market execution", "____________", "____________", "____________"],
          ["Day 30", "Overall suitability and performance decision", "____________", "____________", "Continue / Revise / Discontinue"],
        ]}
      />
    ),

    employeeDetailsC: (
      <KV
        rows={[
          ["Employee Name", employee?.name],
          ["Employee ID", d.employee_id],
          ["Designation", d.designation],
          ["Department", d.department_name],
          ["State of Posting", d.appointer_state],
          ["Effective Date", d.effective_from],
          ["Mobile No.", d.mobile_no],
          ["Email ID", d.email_id],
        ]}
      />
    ),

    policyAcknowledgementTable: (
      <GridTable
        headers={["SR.", "POLICY / DOCUMENT", "ACKNOWLEDGEMENT"]}
        rows={[
          ["1", "Provisional Offer Letter and Job Joining Letter", "ACKNOWLEDGED"],
          ["2", "Probationary Employment Agreement", "ACKNOWLEDGED"],
          ["3", "Annexure A - Salary & Compensation / Incentive Scheme", "ACKNOWLEDGED"],
          ["4", "Annexure B - KPI / Target & Performance Schedule", "ACKNOWLEDGED"],
          ["5", "Applicable State Law / Mandatory Statutory Override", "ACKNOWLEDGED"],
          ["6", "Working Hours, Attendance, Leave and Holiday Policy", "ACKNOWLEDGED"],
          ["7", "Code of Conduct, Ethics and Anti-Fraud Policy", "ACKNOWLEDGED"],
          ["8", "Cash, Stock, Collection and Customer Dealing SOP", "ACKNOWLEDGED"],
          ["9", "Prevention of Sexual Harassment (POSH) Policy", "ACKNOWLEDGED"],
          ["10", "IT, CRM, Mobile, GPS, Geofence, Data and Privacy Policy", "ACKNOWLEDGED"],
          ["11", "Travel, TA/DA and Expense Reimbursement Policy", "ACKNOWLEDGED"],
          ["12", "Disciplinary Procedure and Grievance Process", "ACKNOWLEDGED"],
          ["13", "Exit Clearance, NOC, Handover and Property Return Policy", "ACKNOWLEDGED"],
          ["14", "Confidentiality and Intellectual Property Obligations", "ACKNOWLEDGED"],
          ["15", "Notice Period, Resignation and Notice-Pay Shortfall Rules", "ACKNOWLEDGED"],
          ["16", "Electronic Execution / Aadhaar eSign Terms", "ACKNOWLEDGED"],
        ]}
      />
    ),

    scheduleIndex: (
      <GridTable
        headers={["SCHEDULE", "POLICY / PROCEDURE"]}
        rows={[
          ["C-1", "Working Hours, Attendance, Leave and Holiday Policy"],
          ["C-2", "Code of Conduct, Anti-Fraud, Cash, Stock and Customer Dealing Policy"],
          ["C-3", "Prevention of Sexual Harassment and Respectful Workplace Policy Summary"],
          ["C-4", "IT, CRM, Mobile, GPS, Geofence, Data and Privacy Policy"],
          ["C-5", "Travel, Daily Allowance and Expense Reimbursement Policy"],
          ["C-6", "Disciplinary Procedure, Exit Clearance, NOC, Handover and Property Return"],
        ]}
      />
    ),

    scheduleC1: (
      <GridTable
        headers={["ITEM", "COMPANY STANDARD", "CONDITIONS"]}
        rows={[
          ["Ordinary Office Hours", "9:30 a.m. to 6:30 p.m.", "Includes one-hour rest/meal break"],
          ["Working Days", "Monday to Saturday", "Subject to roster/season/field requirement"],
          ["Weekly Off", "Sunday", "Alternative weekly off may be rostered"],
          ["Casual Leave", "7 days per completed year", "Pro-rata; no carry-forward unless required"],
          ["Sick Leave", "7 days per completed year", "Medical proof may be required"],
          ["Earned/Privilege Leave", "As per Applicable Law", "Accrual, carry-forward and encashment per law"],
          ["Public Holidays", "As per Company annual holiday list", "Mandatory national/festival holidays"],
          ["Leave Without Pay", "At Company discretion/law", "When paid leave unavailable or not approved"],
        ]}
      />
    ),

    complaintChannels: (
      <KV
        rows={[
          ["Internal Committee Chairperson", formData?.ic_chairperson_name],
          ["IC Contact Email", formData?.ic_contact_email],
          ["HR / Alternate Complaint Contact", formData?.hr_alternate_contact],
        ]}
      />
    ),

    scheduleC5: (
      <GridTable
        headers={["APPROVED TRAVEL LIMITS", "VALUE"]}
        rows={[
          ["Bike Reimbursement Rate", `${money(d.bike_rate)} per KM`],
          ["Car Reimbursement Rate", `${money(d.car_rate)} per KM`],
          ["Hotel Limit", `${money(d.hotel_limit)} per night`],
          ["Daily Allowance", `${money(d.ta_daily_allowance)} per eligible day`],
          ["Expense Submission Deadline", `Within ${g(d.expense_submission_days)} days of expense/tour`],
          ["Approval Authority", g(d.expense_approval_authority)],
        ]}
      />
    ),

    exitChecklist: (
      <GridTable
        headers={["✓", "CLEARANCE ITEM", "STATUS / REMARKS"]}
        rows={[
          ["☐", "Resignation/termination acknowledgement and last working day recorded", "________"],
          ["☐", "Departmental work handover and pending-task list", "________"],
          ["☐", "Dealer/distributor-wise NOC and ledger/collection reconciliation", "________"],
          ["☐", "Cash, cheque, instrument and receipt-book reconciliation", "________"],
          ["☐", "Stock, samples, returns and promotional material reconciliation", "________"],
          ["☐", "Laptop/mobile/SIM/charger/accessories returned", "________"],
          ["☐", "Identity card, keys, documents, files and stationery returned", "________"],
          ["☐", "CRM, email, passwords, shared folders and data access handed over", "________"],
          ["☐", "Final expense claim submitted", "________"],
          ["☐", "Notice-period shortfall/leave balance identified", "________"],
          ["☐", "HR, Accounts, IT, Reporting Manager and Partner clearance obtained", "________"],
        ]}
      />
    ),
  };
}

/* ============================== block rendering (restyled) ============================== */

function renderBlock(block, i, tables) {
  const trimmed = block.trim();

  // Top-level document title, e.g. "## PROBATIONARY EMPLOYMENT AGREEMENT"
  // -> bold + underline, matching the docx title treatment.
  if (block.startsWith("## ")) {
    return (
      <Text
        key={i}
        fontWeight="bold"
        fontSize="18px"
        textAlign="center"
        width="100%"
        mt="0rem"
        mb="1.25rem"
        fontFamily="Georgia"
        textDecoration="underline"
      >
        {block.replace("## ", "")}
      </Text>
    );
  }

  // Numbered clause heading, e.g. "### 1. EMPLOYEE PARTICULARS..."
  // -> bold + underline, matching the docx section-heading treatment.
  if (block.startsWith("### ")) {
    return (
      <Text
        key={i}
        fontSize="18px"
        fontWeight="bold"
        mb="10px"
        mt="14px"
        fontFamily="Georgia"
        textDecoration="underline"
      >
        {block.replace("### ", "")}
      </Text>
    );
  }

  // Sub-label like "BY AND BETWEEN" -> bold only, left aligned, no
  // underline (matches the docx, which does NOT underline this one).
  if (block.startsWith("#### ")) {
    return (
      <Text key={i} width="100%" mb="10px" mt="10px" fontSize="15px" fontWeight="bold" fontFamily="Georgia">
        {block.replace("#### ", "")}
      </Text>
    );
  }
   if (block.startsWith("##### ")) {
    return (
      <Text key={i} width="100%" mb="1.75rem" mt="1.5rem" fontSize="15px" textAlign="center" fontWeight="bold" fontFamily="Georgia">
        {block.replace("##### ", "")}
      </Text>
    );
  }

  if (block.startsWith("TABLE:")) {
    const key = block.replace("TABLE:", "").trim();
    return (
      <Box key={i} width="100%">
        {tables[key] || null}
      </Box>
    );
  }

  if (block.startsWith("- ")) {
    const items = block.split("\n").map((l) => l.replace(/^- /, ""));
    return (
      <VStack key={i} align="flex-start" spacing="10px" width="100%">
        {items.map((it, ii) => (
          <Text key={ii} fontSize="15px" textAlign="justify" fontFamily="Georgia">
            •&nbsp; {renderInline(it)}
          </Text>
        ))}
      </VStack>
    );
  }

  // Underscore-only divider line -> a real horizontal rule instead of
  // literal underscore glyphs.
  if (/^_{10,}$/.test(trimmed)) {
    return <Box key={i} width="100%" borderBottom="1.5px solid black" my="10px" />;
  }

  // Standalone "AND" paragraph joining the two contracting parties.
  if (trimmed === "AND") {
    return (
      <Text key={i} fontWeight="bold" fontSize="15px" width="100%" mb="14px" fontFamily="Georgia">
        AND
      </Text>
    );
  }

  // Closing statement at the very end of the consolidated document.
  if (trimmed === "END OF CONSOLIDATED EMPLOYMENT DOCUMENT") {
    return (
      <Text key={i} fontWeight="bold" fontSize="15px" textAlign="center" width="100%" mt="20px" mb="14px" fontFamily="Georgia">
        {trimmed}
      </Text>
    );
  }

  // Default paragraph: leading clause numbers ("1.1", "19.4"...) and
  // recitals ("WHEREAS,", "NOW, THEREFORE,") are auto-bolded; any
  // %% ** __ * markers inside the text render as bold+underline / bold /
  // underline / italic respectively.
  return (
    <Text key={i} fontSize="16px" textAlign="justify" width="100%" mb="14px" fontFamily="Georgia">
      {renderParagraphContent(block)}
    </Text>
  );
}

/* ============================== main export ============================== */

const PlainDocumentPages = ({ employee, formData }) => {
  const d = buildTemplateData(employee, formData);
  const tables = buildTableRegistry(employee, formData, d);

  const sections = [
    { label: "AGREEMENT", template: AGREEMENT_TEMPLATE },
    { label: "ANNEXURE A", template: ANNEXURE_A_TEMPLATE },
    { label: "ANNEXURE B", template: ANNEXURE_B_TEMPLATE },
    { label: "ANNEXURE C", template: ANNEXURE_C_TEMPLATE },
  ];

  let pageCounter = 4; // continues numbering after the 4 styled joining-letter pages

  return (
    <>
      {sections.map((section) => {
        const filled = fillTemplate(section.template, d);
        const pages = paginateTemplate(filled);
        return pages.map((blocks, pIdx) => {
          pageCounter += 1;
          return (
            <PlainPage key={`${section.label}-${pIdx}`} pageNumber={pageCounter}>
              {blocks.map((block, i) => renderBlock(block, i, tables))}
            </PlainPage>
          );
        });
      })}
    </>
  );
};

export default PlainDocumentPages;