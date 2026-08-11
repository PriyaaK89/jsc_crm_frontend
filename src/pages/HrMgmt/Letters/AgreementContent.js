/**
 * agreementContent.js
 * ---------------------------------------------------------------------------
 * Holds the legal text for:
 *   - Probationary Employment Agreement
 *   - Annexure A - Salary & Compensation
 *   - Annexure B - KPI / Target & Performance Schedule
 *   - Annexure C - Company Policy Acknowledgement + Schedules C-1 to C-6
 *
 * Content mirrors JSC_MASTER_EMPLOYMENT_JOINING_DOCUMENT.docx verbatim.
 * Content is authored as plain template strings using {{token}} placeholders.
 * Pages are separated with the literal marker  [[PAGE]]  on its own line.
 * Within a page, blocks are separated by a blank line. A block that starts
 * with "## " is rendered as a section heading. A block that starts with
 * "### " is rendered as a sub-heading (clause number + title).
 * A block that starts with "- " is rendered as a bullet list (split on \n).
 * A block that starts with "TABLE:" is handled specially by the renderer
 * (see PlainDocumentPages.jsx) - the table name after the colon selects
 * which <Table> to render (tables are NOT plain text, they're built from
 * formData directly in the component so numbers stay live/editable).
 *
 * INLINE TYPOGRAPHY MARKERS (rendered by PlainDocumentPages.jsx):
 *   %%text%%  -> bold + underline  (defined terms / filled-in values)
 *   **text**  -> bold
 *   __text__  -> underline
 *   *text*    -> italic            (e.g. the tagline under a title)
 * Leading clause numbers ("1.1 ", "19.4 ") and recitals ("WHEREAS,",
 * "NOW, THEREFORE,") are bolded automatically by the renderer, so they
 * do NOT need markers here.
 *
 * Everything else is rendered as a normal paragraph.
 * ---------------------------------------------------------------------------
 */

// ============================================================================
// Fill helper - replaces {{token}} with data[token], falling back to a blank
// underscore line so unfilled fields still look like a proper legal blank
// rather than "undefined".
// ============================================================================
export function fillTemplate(template, data) {
  return template.replace(/{{(\w+)}}/g, (_, key) => {
    const val = data[key];
    if (val === undefined || val === null || val === "") {
      return "__________";
    }
    return val;
  });
}

// Splits a filled template into pages -> blocks
export function paginateTemplate(filledTemplate) {
  return filledTemplate
    .split("[[PAGE]]")
    .map((page) =>
      page
        .split(/\n\s*\n/)
        .map((b) => b.trim())
        .filter(Boolean)
    );
}

// ============================================================================
// Builds the flat placeholder map from `employee` (backend record) and
// `formData` (the editable form state). formData wins when both define a
// field, since the user may want to override the stored value for this
// specific letter.
// ============================================================================
export function buildTemplateData(employee = {}, formData = {}) {
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  return {
    // ---- Employee identity ----
    employee_name: employee?.name,
    father_spouse_name: formData.father_spouse_name,
    residential_address: employee?.address_line1,
    city_state_pincode: [employee?.city, employee?.state, employee?.pincode]
      .filter(Boolean)
      .join(", "),
    mobile_no: employee?.contact_no,
    email_id: employee?.email,
    employee_id: formData.employee_id || employee?.employee_code,
    aadhaar_last4: formData.aadhaar_last4,

    // ---- Appointment particulars ----
    ref_no: formData.ref_no,
    date_of_issue: formData.date_of_issue,
    employment_starting_date: fmtDate(employee?.date_of_joining),
    employment_start_time: formData.employment_start_time,
    designation: formData.job_role_name,
    department_name: formData.department_name,
    reporting_manager_name: formData.reporting_manager_name,
    reporting_manager_designation: formData.reporting_manager_designation,
    headquarter: employee?.headquarter,
    territory_area: formData.territory_area,
    place_of_posting: formData.place_of_posting,
    appointer_state: formData.appointer_state,
    working_area: formData.working_area,
    notice_period_confirmed_days: formData.notice_period_confirmed_days,
    date_of_birth: fmtDate(employee?.date_of_birth),

    // ---- Employer side (mostly fixed) ----
    authorized_signatory: "GIRDHARI LAL",
    signatory_designation: "PARTNER / AUTHORIZED SIGNATORY",
    employer_place: "JAIPUR",
    hr_email: formData.hr_email,

    // ---- Salary summary (Joining Letter header figures) ----
    total_monthly_earning: formData.total_monthly_earning,
    total_annual_earning: formData.total_annual_earning,

    // ---- Notice pay / salary revision ----
    notice_pay_base_amount: formData.notice_pay_base_amount || formData.basic,
    salary_revision_after_months: formData.salary_revision_after_months,
    salary_revision_percent: formData.salary_revision_percent,

    // ---- Effective from ----
    effective_from: formData.date_of_issue,

    // ---- Review / KPI ----
    review_month_season: formData.review_month_season,

    // ---- Policy contacts ----
    ic_chairperson_name: formData.ic_chairperson_name,
    ic_contact_email: formData.ic_contact_email,
    hr_alternate_contact: formData.hr_alternate_contact,

    // ---- TA/DA & expense ----
    approved_mode_of_travel: formData.approved_mode_of_travel,
    bike_rate: formData.petrol_per_km,
    car_rate: formData.car_rate_per_km,
    hotel_limit: formData.hotel_limit_per_night,
    ta_daily_allowance: formData.ta_daily_allowance,
    expense_submission_days: formData.expense_submission_days,
    expense_approval_authority: formData.expense_approval_authority,
  };
}

// ============================================================================
// JOB JOINING LETTER  (rendered in the STYLED design - logos/colours kept)
// Kept here as the single source of truth for the letter's legal text. The
// styled preview (EmpJoiningLetterPreview.jsx) renders this same wording by
// hand inside its decorated .pdf-page blocks so paragraph-level styling
// (headings, tables) can match the rest of the branded design.
// ============================================================================
export const JOINING_LETTER_TEMPLATE = `
Date: {{date_of_issue}}    Ref. No.: {{ref_no}}

Employee Name: {{employee_name}}

Father/Mother/Spouse Name: {{father_spouse_name}}

Residential Address: {{residential_address}}, {{city_state_pincode}}

Mobile No.: {{mobile_no}}

Email ID: {{email_id}}

Dear Mr./Ms. {{employee_name}},

Further to the Provisional Offer Letter dated {{date_of_issue}} and your joining with the Company, we are pleased to record your probationary appointment with JAMIDARA SEEDS CORPORATION on the terms stated in this Joining Letter, the Employment Agreement and the applicable Annexures executed by you.

### APPOINTMENT PARTICULARS

TABLE:appointmentParticulars

[[PAGE]]

### SALARY / COMPENSATION

Your monthly and annual earning opportunity, Guaranteed Fixed Pay, Performance-Linked Variable Pay, additional incentive eligibility, statutory deductions and reimbursement terms shall be governed by the separately executed Salary & Compensation Annexure (Annexure A).

Total Monthly Earning Opportunity: ₹ {{total_monthly_earning}}     Total Annual Earning Opportunity: ₹ {{total_annual_earning}}

### PROBATION AND INITIAL 30-DAY SALES VALIDATION

Your confirmation is not automatic and shall be effective only upon a written confirmation communication issued by an authorised representative of the Company. For Sales/Marketing roles, the first thirty (30) days shall constitute an Initial Sales Validation Period. Performance may be reviewed on or around the 7th, 15th, 22nd and 30th day in accordance with Annexure B and the Employment Agreement.

During probation, the contractual notice period shall ordinarily be seven (7) days or salary in lieu of the unserved portion, subject always to mandatory Applicable Law. Where a State law provides a different mandatory employer-side termination, notice, inquiry or employee-side notice/recovery rule, that mandatory rule shall prevail.

### DURING EMPLOYMENT WITH US

- You shall devote your full working time and attention to authorised Company duties and shall comply with the Employment Agreement, lawful instructions, SOPs and acknowledged Company Policies.
- Your reporting line, headquarter, territory, place of posting, role or responsibilities may be reasonably changed for business requirements in accordance with the Employment Agreement and Applicable Law.
- You shall not undertake conflicting employment, consultancy, agency, distributorship, dealership or competing business activity without prior written approval where required.
- You shall maintain accurate attendance, CRM entries, field-visit records, GPS/geofence records, sales, collection, expense and other business records where such systems are applicable to your role.
- You shall protect Company Confidential Information, dealer/distributor/farmer data, pricing, business plans, passwords, CRM data, documents, stock, samples, cash and Company Property.
- You shall not make unauthorised credit, discount, warranty, scheme, collection or commercial commitments on behalf of the Company.
- You shall immediately notify the Company of any material change in your residential address, mobile number, email, qualification, licence or other employment-related particulars.

[[PAGE]]

### NOTICE PERIOD, RESIGNATION AND NOTICE-PAY SHORTFALL

After written confirmation, the applicable notice period shall be determined according to the designation/role and the Employment Agreement. The Company policy ordinarily provides thirty (30) days for FA/SO/TSM and equivalent junior sales roles, sixty (60) days for ASM/RSM/ZSM and equivalent managerial sales roles, and up to ninety (90) days only for specifically designated critical/key roles, subject to Applicable Law and the applicable appointment/confirmation terms.

If you resign, abandon employment or otherwise leave without serving the whole or any part of the applicable notice period, the Company may, to the extent permitted by Applicable Law, adjust or recover salary in lieu of the unserved portion. The contractual notice-pay amount shall be calculated on the Notice Pay Base stated in Annexure A. Any statutory cap on deduction/forfeiture from unpaid wages shall prevail, and any separately recoverable contractual balance may be pursued only through lawful means.

The Company may waive or reduce all or part of the notice period or notice-pay claim based on proper handover, dealer/distributor reconciliation, territory transition, business continuity and operational requirements. Earned wages, statutory dues and approved business expenses shall not be automatically forfeited merely because the full notice period was not served.

### STATE-SPECIFIC STATUTORY OVERRIDE

The employment shall be subject to the mandatory Central and State labour/employment law applicable at the Employee's actual place of employment. Where any mandatory provision relating to probation, notice period, termination, resignation, wages, deductions, working hours, leave, settlement or another employment condition differs from or overrides a contractual term, the mandatory statutory provision shall prevail to the extent of the inconsistency. If the Employee is transferred from one State to another, the mandatory law applicable at the legally relevant place of employment shall apply.

### PERFORMANCE, INCREMENT AND CONTINUATION

Performance targets, KPI weightages, review rules, Initial 30-Day Sales Validation standards and target acknowledgement shall be governed by Annexure B. Salary revision, increment or promotion is not automatic and shall depend on the applicable written performance standard, conduct, collection quality, business conditions and written approval of the Company.

[[PAGE]]

### CASH, COLLECTION, STOCK AND COMPANY PROPERTY

Any suspected non-deposit, diversion, unauthorised retention or misappropriation of Company/customer cash, cheque, stock, instruments or property may lead to suspension of collection/asset authority, reconciliation, show-cause, audit, disciplinary proceedings and civil/criminal remedies as permitted by law. Proven actual loss may be recovered through lawful means after applicable process. Earned wages and statutory dues shall not be automatically forfeited.

### EXIT CLEARANCE, HANDOVER AND FULL & FINAL SETTLEMENT

On separation you shall complete proper handover, dealer/distributor NOC and reconciliation where applicable, return Company Property, cash, stock, samples, records, devices, SIM, credentials and data, and complete the Exit Clearance requirements under the Employment Agreement. Disputed and undisputed amounts shall be dealt with separately in accordance with Applicable Law.

### DOCUMENT INTEGRATION AND PRIORITY

This Joining Letter shall be read together with the Provisional Offer Letter, Employment Agreement, Annexure A - Salary & Compensation, Annexure B - KPI / Target & Performance Schedule, and Annexure C - Company Policy Acknowledgement. In case of inconsistency, mandatory Applicable Law shall prevail; thereafter the signed Employment Agreement, subject-specific signed Annexures, this Joining Letter and the Provisional Offer Letter shall apply, unless a later written document expressly amends an earlier term.

### ELECTRONIC EXECUTION / AADHAAR eSIGN

This Joining Letter and the related employment documents may be issued, accepted and executed electronically. Where the Employee elects to use Aadhaar-based eSign or another legally recognised electronic-signature service, the electronic signature affixed through an authorised Certifying Authority/eSign service under the Information Technology Act, 2000 and applicable rules shall, to the extent permitted by law, have the same binding effect as a handwritten signature. Aadhaar e-KYC or OTP authentication by itself, without affixing a legally valid electronic signature through an authorised eSign process, shall not by itself constitute execution of this document.

The Employee acknowledges that he/she has read, understood or had explained the above terms and has received or been given access to the Employment Agreement and applicable Annexures/Policies.

TABLE:agreementSignatures
`;

// ============================================================================
// PROBATIONARY EMPLOYMENT AGREEMENT
// ============================================================================
export const AGREEMENT_TEMPLATE = `
## PROBATIONARY EMPLOYMENT AGREEMENT

*This agreement lays down the terms of probationary employment agreed upon by the Employer and the Employee. Both Parties shall maintain mutual confidence and trust and shall make only lawful and reasonable demands upon each other.*

______________________________________________________________________________________________________________________
______



This PROBATIONARY EMPLOYMENT AGREEMENT (hereinafter referred to as the "Agreement") is entered into on %%{{date_of_issue}}%% at Jaipur, Rajasthan.

$____________________________________________________________________________________________$

##### BY AND BETWEEN

%%JAMIDARA SEEDS CORPORATION%%, a partnership firm registered under the Indian Partnership Act, 1932, having its Registered Office at %%105, Nemi Chand Market, Alwar, Rajasthan%% and Corporate Office at %%S-19, Aggression Tower, Vidhyadher Nagar, Jaipur - 302039, Rajasthan%%, acting through its Authorized Signatory %%Mr. {{authorized_signatory}}, Partner%% (hereinafter referred to as the "Company" or "Employer", which expression shall, where the context permits, include its partners, successors and permitted assigns);

##### AND

Mr./Ms. %%{{employee_name}}%%, son/daughter/spouse of %%{{father_spouse_name}}%%, residing at %%{{residential_address}}, {{city_state_pincode}}%%, holding Aadhaar/other identity reference %%{{aadhaar_last4}}%% (hereinafter referred to as the "Employee", which expression shall include legal representatives only where the context lawfully permits).

WHEREAS, the Employee has represented that all information and documents submitted for employment are true, complete and authentic, and the Company has agreed to appoint the Employee as a probationer on the terms and conditions set out below;



[[PAGE]]

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the Parties agree as follows:

### 1. EMPLOYEE PARTICULARS AND APPOINTMENT SCHEDULE

TABLE:appointmentParticulars

1.1 The particulars above form an integral part of this Agreement. Any temporary change in reporting line, territory, headquarter, place of posting, shift, duties or work allocation made in accordance with this Agreement shall not by itself create a new contract of employment.

### 2. DEFINITIONS AND INTERPRETATION

2.1 //"Applicable Law" means the laws in force in India and the mandatory Central and State labour/employment laws applicable to the establishment, Employee category and actual place of employment/posting from time to time, including applicable labour codes, rules, notifications, standing orders, social-security laws, wage laws, workplace-safety laws, maternity and anti-harassment laws, and the applicable State Shops and Commercial Establishments law and amendments/ordinances/rules.//

[[PAGE]]

2.2 "Company Policies" means the policies, SOPs, manuals, circulars, instructions and lawful directions issued or amended by the Company from time to time, including the annexures to this Agreement.

2.3 "Confidential Information" includes non-public information relating to seeds, varieties, germplasm, breeding or trial data, product specifications, formulations, pricing, margins, sales plans, dealer/distributor/farmer databases, financial data, outstanding balances, software, source code, CRM data, passwords, business plans, contracts, employee information, marketing strategy and other information that is confidential by nature or designation.

2.4 "Company Property" includes physical and digital assets, documents, samples, stock, cash, mobile devices, SIM cards, laptops, identity cards, keys, vehicles, login credentials, files, records and data owned, licensed, supplied or paid for by the Company.

2.5 Headings are for convenience. Singular includes plural where appropriate. A reference to law includes amendments, replacements and subordinate legislation. If any term is inconsistent with a mandatory law, the mandatory law shall prevail and the term shall be read down to the maximum lawful extent.

### 3. PROBATION, CONFIRMATION AND CONTINUITY

3.1 The Employee is appointed as a probationer for six (6) months from the Employment Starting Date. The probation may be extended once or in parts, by written communication, for an aggregate period not exceeding three (3) additional months where performance, conduct, attendance, training, verification or role suitability requires further assessment.

3.2 Confirmation is not automatic. The Employee shall be treated as confirmed only upon issuance of a written confirmation letter by an authorized representative of the Company.

3.3 During probation, employment may be terminated by either Party by seven (7) days' written notice or salary in lieu thereof, subject to Applicable Law. The Company may terminate without notice for established fraud, theft, misappropriation, violence, serious harassment, data theft, material falsification or other grave misconduct, subject to lawful procedure where required.

[[PAGE]]

3.4 Completion of probation shall not waive any misrepresentation, misconduct, verification discrepancy, conflict of interest or breach discovered later.

#### INITIAL 30-DAY SALES VALIDATION PERIOD

3.5 The Employee is appointed on probation. The first thirty (30) days of employment shall constitute an Initial Sales Validation Period for evaluating the Employee's suitability, field activity, product knowledge, market coverage, reporting discipline, CRM and GPS compliance, dealer/distributor development, sales pipeline, booking performance, collection performance, conduct and overall ability to perform the assigned role.

3.6 The Employee's performance shall be reviewed on or around the 7th, 15th, 22nd and 30th day of employment. Continuation of employment beyond any review stage or beyond the Initial Sales Validation Period shall not be automatic.

3.7 Where the Employee fails to meet the minimum activity standards, reporting requirements, conduct standards or performance thresholds communicated by the Company, the Company may issue feedback, discontinue the probationary employment, or permit continuation subject to revised conditions, in accordance with this Agreement and Applicable Law.

3.8 The Company may discontinue the probationary employment before completion of thirty (30) days where the Employee fails to report for duty, remains unauthorisedly absent, fails to undertake assigned field activities, submits materially false reports, manipulates CRM or GPS records, commits misconduct, or is otherwise found unsuitable for the assigned position.

3.9 Upon discontinuation, the Employee shall be paid the Guaranteed Fixed Salary earned up to the last working day, eligible Performance-Linked Variable Pay, if any, approved business expenses and applicable statutory dues, subject to lawful deductions and reconciliation.

3.10 Continuation after thirty (30) days shall be effective only through a written continuation communication issued by the Company. Completion of the Initial Sales Validation Period shall not constitute confirmation of employment.


### 4. POSITION, DUTIES, PERFORMANCE AND REPORTING

4.1 The Employee shall faithfully, diligently and efficiently perform the duties of the stated designation and such related, reasonable and lawful duties as may be assigned, and shall devote full working time, attention and skill to the Company's business.
[[PAGE]]

4.2 Role-specific duties, key result areas, targets and reporting requirements are recorded in Annexure B. Targets are performance-management tools; mere shortfall, without dishonesty or misconduct, shall be dealt with through review, coaching, performance improvement, reassignment or lawful employment action and shall not automatically be treated as fraud.

4.3 The Employee shall comply with authorized reporting lines, submit accurate reports and records, attend reviews and training, promptly disclose risks, and not make false commitments, unauthorized discounts, credit assurances, warranties or representations to dealers, distributors, farmers, vendors or any third party.

4.4 The Employee shall maintain all licences, qualifications and documents legally required for the role and immediately inform the Company of any suspension, expiry, criminal proceeding, conflict or restriction affecting the role.

### 5. TRANSFER, POSTING AND CHANGE OF RESPONSIBILITIES

5.1 Considering business requirements, the Company may reasonably transfer or assign the Employee to another department, role, territory, headquarter, office, branch, field location, associated concern or project, temporarily or permanently, subject to Applicable Law, the Employee's competence and reasonable written communication.

5.2 A transfer shall not be used as punishment without due process. A material reduction in fixed monthly salary or statutory benefits shall not be made arbitrarily. Applicable travel, transfer or relocation support shall be governed by Company policy and written approval.

5.3 Promotion, redesignation, role enlargement or reassignment shall be documented in writing. Demotion or salary reduction for misconduct or persistent performance deficiency shall be subject to Applicable Law and a fair process.

[[PAGE]]

### 6. WORKING HOURS, ATTENDANCE, FIELD DUTY AND OVERTIME

6.1 Ordinary office hours shall be 9:30 a.m. to 6:30 p.m., including a one-hour rest/meal break, ordinarily from Monday to Saturday. Sunday shall ordinarily be the weekly off, unless a lawful roster, field requirement, season, event or approved business necessity requires otherwise.

6.2 The Company may prescribe shifts, seasonal schedules, field-tour timings, weekly-off rosters and flexible reporting hours, provided statutory limits relating to working hours, rest intervals, spread-over, weekly holiday and overtime are observed.

6.3 Attendance shall be recorded through the Company's authorized system, which may include biometric, CRM, mobile application, GPS/geofence, web portal, duty register, call log, tour report or any combination thereof. Proxy attendance, fake GPS, location spoofing or manipulated records are misconduct.

6.4 Field employees shall follow approved beat plans, tour programmes and visit reporting. Travel time, remote duty and outstation stay shall be treated according to Applicable Law and Company policy.

6.5 Overtime or compensatory off, where legally applicable, must be pre-authorized except in genuine emergencies and shall be provided in accordance with Applicable Law. Unauthorized self-declared overtime does not create an automatic entitlement, without prejudice to mandatory legal rights.

### 7. MONTHLY COMPENSATION, INCENTIVES AND STATUTORY BENEFITS

7.1 The Employee shall receive monthly compensation as specified in Annexure A. Salary shall be paid by bank transfer or another lawful traceable mode on or before the seventh day of the succeeding month, or within the time prescribed by Applicable Law, subject to payroll cut-off and statutory deductions.

#### PERFORMANCE-LINKED REMUNERATION

7.2 The Employee's monthly earning opportunity shall comprise a Guaranteed Fixed Monthly Pay and a Performance-Linked Variable Pay, as specified in the Salary Annexure.

[[PAGE]]

7.3 The Guaranteed Fixed Monthly Pay shall be payable for the period actually worked, subject to attendance, authorised leave, applicable minimum wages and lawful deductions.

7.4 The Performance-Linked Variable Pay shall not be guaranteed. It shall be earned only upon achievement of the applicable sales, collection, booking, dealer-development, market-activity, reporting and compliance parameters specified in the Performance Annexure.

7.5 Where the Employee's verified Overall Performance Score is below sixty per cent (60%), no Performance-Linked Variable Pay shall become payable for that review period. Non-achievement of targets shall not result in retrospective forfeiture of Guaranteed Fixed Pay already earned. The detailed payout slabs, including full salary eligibility at eighty per cent (80%) or above, shall be governed by Annexure A.

7.6 Variable pay, incentive, commission, performance-linked components, reimbursement and ex gratia payments are governed by the applicable written scheme and become payable only upon satisfaction and verification of the stated eligibility conditions. Earned statutory wages cannot be converted into discretionary incentive.

7.7 The Company may deduct income tax, provident fund, employee state insurance, professional tax, lawful notice pay, authorized recoveries and other statutory amounts where applicable. Any deduction for loss or damage shall be based on evidence, opportunity to explain and Applicable Law.

7.8 Reasonable and pre-approved business expenses shall be reimbursed upon timely submission of genuine bills, tour reports and supporting documents under the applicable Company Travel / TA-DA Policy acknowledged under Annexure C. False or inflated claims may result in rejection, recovery and disciplinary action.

7.9 Salary revision is not automatic and depends on business conditions, performance, conduct, affordability and written approval. Statutory minimum wages and mandatory benefits shall always be observed where applicable.



### 8. LEAVE, HOLIDAYS AND ABSENCE

8.1 Leave, weekly holidays, public holidays, maternity benefits and leave with wages shall be governed by Applicable Law and the applicable Company Leave / Attendance Policy acknowledged under Annexure C.
[[PAGE]]
8.2 Except in an emergency, leave must be applied for and approved in advance through the prescribed system. Intimation does not by itself amount to approval.

8.3 Medical evidence may be required for illness exceeding three consecutive working days or where repeated/exceptional absence reasonably requires verification.

8.4 Unauthorized absence may be treated as leave without pay and misconduct after due notice. Extended unexplained absence shall be handled under Clause 19 and the disciplinary policy.

### 9. EXCLUSIVITY, CONFLICT OF INTEREST AND OUTSIDE ACTIVITY

9.1 During employment, the Employee shall not accept another full-time or part-time employment, consultancy, agency, distributorship, dealership or business activity that conflicts with duties, competes with the Company, uses Company time/resources, or creates a conflict of interest, without prior written approval.

9.2 Passive investments that do not create control, influence or conflict may be permitted, subject to disclosure where relevant.

9.3 Breach may lead to disciplinary action and recovery of proven actual loss, but salary already earned shall not be automatically forfeited merely because an outside activity occurred.

### 10. CODE OF CONDUCT, ANTI-FRAUD AND LEGAL COMPLIANCE

10.1 The Employee shall act honestly, respectfully and lawfully and shall not engage in theft, fraud, bribery, kickbacks, document falsification, misrepresentation, intimidation, discrimination, harassment, retaliation, violence, substance abuse at work or any act that materially damages the Company or its stakeholders.

10.2 The Employee shall not accept personal cash, gifts, commissions, benefits or favours in connection with Company business except nominal customary items expressly permitted by policy and disclosed where required.

10.3 Any suspected fraud, safety incident, harassment, data breach, cash/stock discrepancy or unlawful instruction shall be promptly reported through the Reporting Manager, HR, Partner or designated grievance channel. Good-faith reporting shall not attract retaliation.

[[PAGE]]

10.4 Detailed conduct standards and disciplinary procedures shall be governed by this Agreement and the applicable Company Conduct / Disciplinary Policies acknowledged under Annexure C.

### 11. DEALER/DISTRIBUTOR CASH, GOODS, STOCK AND COLLECTION RESPONSIBILITY

11.1 The Employee shall not collect cash, cheque, goods, returns, samples, documents or instruments from any dealer, distributor, farmer or third party unless specifically authorized and supported by an official receipt, collection entry, challan or approved process.

11.2 All cash, cheques and instruments collected on behalf of the Company shall be deposited or handed over within the period prescribed by the Company, ordinarily on the same working day or the next banking day, and correctly credited to the concerned party ledger.

11.3 The Employee shall reconcile collections, returns, stock, schemes, credit notes and party balances and shall not divert, retain, adjust, set off, lend or use Company or customer funds/property for personal or unauthorized purposes.

11.4 In case of discrepancy, the Company may conduct an audit and issue a written show-cause notice. Upon proof of misappropriation, fraud, wilful loss or unauthorized retention, the Company may recover actual loss through lawful deductions, settlement, civil proceedings, criminal complaint or other remedies permitted by law.



### 12. CRM, MOBILE, GPS, GEOFENCE AND DATA MONITORING

12.1 Use of the Company's CRM, attendance system, official mobile application, email, SIM, device, dashboards and reporting tools is mandatory where assigned. The Employee shall maintain accurate and timely records and shall not share passwords, disable required controls or manipulate information.

12.2 For legitimate purposes including attendance, field-force safety, route/visit verification, customer service, fraud prevention, compliance and asset security, the Company may collect and process work-related location, geofence, device, login, call-metadata, CRM, attendance and usage data, subject to Applicable Law and the applicable IT / CRM / GPS / Data Policy acknowledged under Annexure C.
[[PAGE]]
12.3 Continuous personal surveillance outside duty hours is not intended. Location monitoring shall, as far as practicable, be limited to duty hours, approved tours, active field assignments or Company-owned devices, except where a lawful investigation or asset-security need reasonably requires otherwise.

12.4 Fake location applications, GPS spoofing, deletion of business records, unauthorized export of dealer/farmer data, personal cloud backups of Company data, or use of unofficial systems to bypass controls are material misconduct.

12.5 The Company may retain employment and business records for lawful operational, audit, tax, compliance, defence and statutory purposes and shall restrict access according to role and need.

### 13. CONFIDENTIALITY, PRIVACY AND RECORDS

13.1 The Employee shall use Confidential Information only for authorized Company work and shall protect it using reasonable security. Disclosure to any unauthorized person, competitor, personal account, social-media platform or external device is prohibited.

13.2 The confidentiality obligation does not prohibit information that is lawfully public, independently developed without Company information, rightfully received from an authorized third party, disclosed with written approval, or required by a court, regulator or law, provided lawful notice is given where permitted.

13.3 Trade secrets and information that remains confidential shall be protected for so long as it retains that character. Other confidential business information shall remain protected after termination for the maximum period enforceable under law.

13.4 Nothing in this Agreement prevents a lawful complaint, protected disclosure, testimony or cooperation with a competent authority.

### 14. INTELLECTUAL PROPERTY AND WORK PRODUCT

14.1 To the extent permitted by law, work product, inventions, designs, databases, documents, reports, content, software, source code, processes, research, crop-trial data and other intellectual property created by the Employee within assigned duties, using substantial Company resources, or specifically commissioned for the Company shall belong to the Company upon creation.

14.2 The Employee shall execute reasonable documents required to record or protect such ownership. Moral rights shall be dealt with according to Applicable Law.
[[PAGE]]
14.3 Pre-existing intellectual property disclosed in writing before use and personal work created entirely outside employment duties without Company resources or Confidential Information shall remain with the Employee, unless separately assigned in writing.



### 15. COMPANY PROPERTY, DOCUMENTS AND ACCESS

15.1 Company Property shall be used carefully, only for authorized purposes and in compliance with security, inventory and acceptable-use rules. The Employee shall immediately report loss, theft, damage, compromise or unauthorized access.

15.2 The Employee shall not create a lien over Company Property or retain it as security for any claim. Upon demand, transfer, suspension or termination, all property, documents, data, access credentials, samples, cash and stock shall be returned and all required access/handover completed under the applicable Exit / Handover Policy acknowledged under Annexure C.

15.3 Actual loss caused by proven fraud, wilful misconduct or gross negligence may be recovered in accordance with Applicable Law after giving an opportunity to respond. Normal wear and tear and ordinary business risk shall not be charged to the Employee.

### 16. PREVENTION OF SEXUAL HARASSMENT AND RESPECTFUL WORKPLACE

16.1 The Company maintains zero tolerance for sexual harassment, discrimination, bullying, retaliation and workplace violence. The Employee shall comply with the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013, applicable rules, Company policy and lawful directions of the Internal Committee/Local Committee or competent authority.

16.2 Complaints shall be handled confidentially, fairly and without retaliation. Interim measures, inquiry and disciplinary action shall follow Applicable Law and the applicable POSH / Respectful Workplace Policy acknowledged under Annexure C. The Company does not disclaim statutory duties merely because misconduct is committed by an individual.

16.3 Knowingly false evidence may be dealt with according to law; inability to prove a complaint shall not by itself make the complaint false or malicious.
[[PAGE]]
### 17. PERFORMANCE REVIEW, CORRECTIVE ACTION AND DISCIPLINE

17.1 The Company may conduct periodic performance reviews and may issue coaching, counselling, written expectations, a performance improvement plan, warning, role adjustment or other lawful corrective action.

17.2 Misconduct allegations may be investigated through show-cause notice, explanation, document review, inquiry and an opportunity of hearing where required. The level of process shall reflect the seriousness of the allegation and Applicable Law.

17.3 The Company may place the Employee under suspension pending inquiry where reasonably necessary, on terms required by Applicable Law and policy.

### 18. REMEDIES FOR MATERIAL BREACH

18.1 If the Employee materially breaches the obligations relating to fraud, exclusivity, cash/stock, confidentiality, data, intellectual property, non-solicitation or Company Property, the Company may discontinue future discretionary or conditional payments not yet earned, terminate employment in accordance with law, seek recovery of proven loss, injunction, specific relief, damages, costs and any other remedy available under Applicable Law.

18.2 For clarity, this clause does not authorize forfeiture of earned wages, statutory dues or approved expenses that must be paid under Applicable Law. The Company's rights are cumulative and shall be exercised through lawful process.



### 19. TERMINATION, RESIGNATION, NOTICE AND UNAUTHORISED ABSENCE

19.1 During probation, Clause 3.3 applies. After written confirmation, the applicable notice period shall be determined according to the Employee's designation/role as follows:

(a) Field Assistant (FA), Sales Officer (SO), Territory Sales Manager (TSM), Junior Sales/Marketing staff and equivalent roles: thirty (30) days.

(b) Area Sales Manager (ASM), Regional Sales Manager (RSM), Zonal Sales Manager (ZSM) and equivalent managerial sales roles: sixty (60) days.
[[PAGE]]
(c) Critical or key positions specifically designated in writing by the Company, including senior management, key R&D, highly confidential or business-critical roles: up to ninety (90) days, as expressly stated in the applicable appointment, confirmation or role-specific letter.

(d) Either Party may terminate employment by serving the applicable notice period. Where permitted by Applicable Law and the governing employment terms, salary in lieu of the unserved portion of notice may be paid, adjusted or recovered. The Company may, based on business continuity, handover, customer/territory transition and operational requirements, waive or reduce all or part of the notice period, or require the Employee to serve all or part of it. Any notice-pay adjustment or recovery shall be limited to the amount lawfully recoverable and shall not authorize unlawful withholding of earned wages, statutory dues or approved expenses. This Employee's applicable confirmed notice period is {{notice_period_confirmed_days}} days.

19.2 The Company may terminate employment for proven misconduct, fraud, theft, misappropriation, material falsification, serious insubordination, violence, harassment, data theft, wilful damage, bribery, repeated unauthorized absence, material breach or other lawful cause, with or without notice as permitted by Applicable Law and after required procedure.

19.3 Termination without misconduct shall be made with applicable notice or pay in lieu and statutory dues. Death or permanent incapacity shall end employment on the date recognized by law, and lawful dues shall be paid to the Employee or nominee/legal representative, as applicable.

19.4 An Employee absent without authorization for three consecutive working days shall be contacted and may receive a direction to report or explain. Continued failure to respond or report after reasonable notices may be treated as abandonment/unauthorized absence in accordance with Applicable Law; it shall not erase earned or statutory dues.

19.5 Resignation shall be submitted through the official email/HR system or signed written notice. Verbal statements, social-media messages or communication to an unauthorized person do not constitute final acceptance unless acknowledged by an authorized representative.
[[PAGE]]
### 20. EXIT CLEARANCE, DEALER/DISTRIBUTOR NOC, HANDOVER AND FULL & FINAL SETTLEMENT

20.1 Before release, the Employee shall complete a proper handover and submit all applicable dealer/distributor NOCs, party-wise balance confirmations, collection details, stock/sample statements, pending-order status, Company Property, documents, credentials, expense claims and other applicable exit-clearance items under the Company Exit / Handover Policy acknowledged under Annexure C.

20.2 Dealer/distributor NOC and reconciliation are material exit obligations, especially for sales, collection, territory and stock-handling roles. Failure to submit them may delay clearance, relieving documentation and settlement of disputed/reconcilable amounts, and may lead to audit, notice and lawful recovery proceedings.

20.3 The Company shall identify discrepancies in writing and provide the Employee a reasonable opportunity to respond. Proven cash, stock, notice-pay, asset or other lawful recoveries may be adjusted to the extent permitted by law. Undisputed earned salary and statutory dues shall not be withheld indefinitely merely because an NOC is pending.

20.4 Full and final settlement shall be processed after separation and completion of available reconciliation within the timeline prescribed by Applicable Law.

20.5 Relieving and experience letters may record factual employment details and may be issued after exit formalities, without prejudice to the Employee's statutory rights or the Company's recovery rights.



### 21. POST-EMPLOYMENT OBLIGATIONS AND NON-SOLICITATION

21.1 Nothing in this Agreement prohibits the Employee from lawfully pursuing a profession, trade or employment after separation. Any restriction shall be interpreted consistently with Section 27 of the Indian Contract Act, 1872 and other Applicable Law.

21.2 For twelve (12) months after separation, and only to the maximum extent legally enforceable, the Employee shall not use Confidential Information to directly solicit for a competing purpose those dealers, distributors, institutional customers or employees with whom the Employee had material dealings during the final twelve months of employment.
[[PAGE]]
21.3 General advertising, responding to an unsolicited approach, ordinary professional networking, or employment without misuse of Confidential Information shall not by itself constitute prohibited solicitation.

21.4 The Employee shall not falsely represent continued association with the Company, retain Company data or interfere with existing contracts through deception, misuse of information or unlawful inducement.

### 22. LIMITED INDEMNITY AND RECOVERY OF LOSS

22.1 The Employee shall indemnify the Company only for direct and proven loss, liability, penalty or reasonable legal cost arising from the Employee's fraud, wilful misconduct, criminal breach of trust, unauthorized commitment, deliberate data/confidentiality breach or gross negligence, to the extent permitted by law.

22.2 The Employee shall not be liable for ordinary business losses, market conditions, approved management decisions, normal wear and tear, or acts performed in good faith within authority. Recovery shall follow notice, evidence, opportunity to respond and Applicable Law.

### 23. NOTICES AND OFFICIAL COMMUNICATION

23.1 Notices may be delivered personally, by registered/speed post, courier, official email, HR portal or another traceable mode to the addresses recorded below. Electronic communication shall be valid where delivery can reasonably be evidenced.

TABLE:noticeDetails

23.2 Each Party shall promptly communicate any change in contact details. A notice sent to the last recorded contact shall be treated according to Applicable Law and the evidence of delivery available.
[[PAGE]]
### 24. GOVERNING LAW, LABOUR AUTHORITY AND JURISDICTION

24.1 This Agreement shall be governed by the laws of India and the mandatory employment and labour laws applicable at the Employee's actual place of employment/posting, including the applicable State Shops and Commercial Establishments law and other statutes applicable to the establishment and Employee category. Where the Employee is transferred to another State, the mandatory law applicable at the legally relevant place of employment shall prevail to the extent required by law.

24.2 Nothing in this Agreement excludes or limits the jurisdiction of a competent Labour Authority, Inspector-cum-Facilitator, Conciliation Officer, Internal Committee, Local Committee, Commissioner, Tribunal, Court or other statutory authority that has mandatory jurisdiction under Applicable Law.

24.3 Subject to Clause 24.2 and where legally permissible, all civil and contractual disputes arising out of or in connection with this Agreement shall be subject exclusively to the competent courts at Alwar, Rajasthan or Jaipur, Rajasthan, provided the selected court otherwise possesses jurisdiction under Applicable Law. Mandatory jurisdiction arising from the place of employment or statutory law shall prevail.

24.4 The Parties should first attempt good-faith internal resolution through HR/authorized management, without delaying any statutory limitation period or urgent legal remedy.



### 25. GENERAL PROVISIONS

25.1 This Agreement, its annexures, appointment/compensation letters and acknowledged Company Policies constitute the employment terms. In case of conflict, mandatory law prevails, followed by this Agreement, role-specific written terms and policies, unless a later document expressly amends an earlier one.

25.2 Any amendment must be in writing and authorized by the Company and acknowledged by the Employee, except reasonable policy/SOP updates that do not reduce mandatory statutory rights and are lawfully communicated.

25.3 If a provision is invalid or unenforceable, it shall be severed or read down and the remaining provisions shall continue. No delay in enforcing a right is a waiver.
[[PAGE]]
25.4 The Employee may not assign employment rights or duties. The Company may transfer this Agreement to a lawful successor or restructured employer, subject to continuity of mandatory rights.

25.5 This Agreement may be signed in counterparts or through a legally valid electronic signature. The Employee confirms having read or had explained the Agreement in a language understood by the Employee and having received an opportunity to seek independent advice before signing.

### 26. ACCEPTANCE AND SIGNATURES

IN WITNESS WHEREOF, the Parties sign this Agreement on the date stated above and confirm that all fields and annexures have been completed, read and accepted.

TABLE:agreementSignatures

TABLE:witnessSignatures
`;

// ============================================================================
// ANNEXURE A - SALARY & COMPENSATION
// ============================================================================
export const ANNEXURE_A_TEMPLATE = `
## ANNEXURE A - SALARY & COMPENSATION

This Annexure forms an integral part of the Employee's Joining Letter and Employment Agreement. All employee-specific monetary fields must be completed before execution.

TABLE:employeePayrollDetails

TABLE:monthlyCompensation
[[PAGE]]
### NOTICE PAY BASE

TABLE:noticePayBase

If the Employee does not serve the whole or any part of the applicable notice period, the contractual notice-pay shortfall may be calculated using the Notice Pay Base above for the number of unserved notice days. Any adjustment from unpaid wages/F&F and any separate recovery shall be limited by Applicable Law, including any applicable State statutory cap or recovery procedure.



### TA / DA & APPROVED BUSINESS EXPENSES - SEPARATE FROM SALARY

TABLE:taDaTable

TA/DA, hotel, mileage and genuine approved business-expense reimbursements are separate from Performance-Linked Variable Pay and shall be processed under the Travel & Expense Policy.

### PERFORMANCE-LINKED PAYOUT MATRIX

TABLE:payoutMatrix

Full Salary Eligibility Threshold: A verified Overall Performance Score of eighty per cent (80%) or above shall make the Employee eligible to earn one hundred per cent (100%) of the Total Monthly Earning Opportunity for that review period, subject to this Annexure and Applicable Law.

Below sixty per cent (60%), no Performance-Linked Variable Pay shall be earned for that review period; the Employee remains entitled to Guaranteed Fixed Pay earned for the period actually worked, subject to attendance, authorised leave, leave without pay and lawful deductions.

Additional Performance Incentive shall be payable over and above the Total Monthly Earning Opportunity only after verification of net sales/business, realised collection, approved dealer/distributor activation, compliance and applicable exclusions for returns, cancellations, credit notes and unauthorised discounts.

### SALARY REVISION / INCREMENT

After completion of {{salary_revision_after_months}} months, the Employee may be considered for a salary revision of up to {{salary_revision_percent}}% if the applicable written performance standard is achieved, collection quality and conduct are satisfactory, and the revision is approved in writing by the Company. No revision is automatic merely upon completion of time.

### STATUTORY INTERPRETATION

The component labels in this Annexure are for payroll administration. Minimum wages, statutory wages, provident fund, ESI, bonus, gratuity, tax and other statutory calculations, where applicable, shall be determined according to Applicable Law regardless of the label used.

TABLE:annexureASignatures
`;

// ============================================================================
// ANNEXURE B - KPI / TARGET & PERFORMANCE SCHEDULE
// ============================================================================
export const ANNEXURE_B_TEMPLATE = `
## ANNEXURE B - KPI / TARGET & PERFORMANCE SCHEDULE

Applicable primarily to Sales / Marketing roles. Role-specific targets must be communicated before or at the beginning of the relevant review period and acknowledged through this Annexure, official email, CRM or another traceable Company system.

TABLE:employeeRoleDetails

TABLE:businessTargetCommitment

### OVERALL PERFORMANCE SCORE - STANDARD WEIGHTAGE

TABLE:performanceWeightage

### INITIAL 30-DAY SALES VALIDATION

TABLE:initialValidation

[[PAGE]]

### PERFORMANCE MEASUREMENT RULES

- No target shall be applied retrospectively. The applicable target, review period, weightage and measurement basis must be communicated before or at the beginning of the review period.
- Sales/business achievement shall ordinarily be measured net of approved returns, cancellations, credit notes and unauthorised discounts.
- Collection shall ordinarily be counted only on actual realisation in the Company bank account or authorised ledger.
- Fake orders, fake parties, fake visits, GPS spoofing, manipulated CRM, artificial billing, unauthorised credit or stock dumping shall not count toward target achievement and may constitute misconduct.
- Material Company-side constraints such as non-availability of stock, Company-directed dispatch hold, territory change, product withdrawal or regulatory restriction shall be reasonably reviewed before final score calculation.
- An Overall Performance Score of 80% or above qualifies for 100% Total Monthly Earning Opportunity under Annexure A, subject to all eligibility conditions.
- Achievement of 80% for monthly salary payout does not by itself equal achievement of the full 100% business target for increment, promotion, annual appraisal or other performance benefits unless expressly stated in writing.

### ACKNOWLEDGEMENT

I acknowledge that the above targets/KPIs and measurement rules have been explained to me and that my Performance-Linked Variable Pay and probationary suitability may be evaluated in accordance with this Annexure, the Salary Annexure and the Employment Agreement.

TABLE:annexureBSignatures
`;

// ============================================================================
// ANNEXURE C - COMPANY POLICY ACKNOWLEDGEMENT + SCHEDULES C-1 to C-6
// ============================================================================
export const ANNEXURE_C_TEMPLATE = `
## ANNEXURE C - COMPANY POLICY ACKNOWLEDGEMENT

The Employee acknowledges receipt of, access to, or explanation of the following documents/policies and agrees to comply with them as lawfully amended and communicated from time to time. Acknowledgement does not waive any mandatory statutory right.

TABLE:employeeDetailsC

TABLE:policyAcknowledgementTable

Schedules C-1 to C-6 appearing after this Annexure form an integral part of this Policy Acknowledgement and are covered by the consolidated execution / Aadhaar eSign provisions below.

### EMPLOYEE DECLARATION

I confirm that I have received, read, understood and/or had explained to me the documents, policies and terms listed above. I acknowledge them and agree to comply with them as lawfully applicable and communicated, subject always to Applicable Law.

By affixing my handwritten signature or legally valid electronic signature / Aadhaar-based eSign to this Annexure, I confirm my acknowledgement of ALL items listed in this Annexure.

TABLE:annexureCSignatures

[[PAGE]]

### POLICY SCHEDULES - PART OF ANNEXURE C

TABLE:scheduleIndex

Statutory Override: Every Schedule is subject to Applicable Law. Where a mandatory Central or State law provides a different or more beneficial employee entitlement or imposes a mandatory procedure, that provision shall prevail to the extent of inconsistency.

### SCHEDULE C-1: WORKING HOURS, ATTENDANCE, LEAVE AND HOLIDAY POLICY

TABLE:scheduleC1

- Leave must be applied through the prescribed system and approved by the authorized manager/HR.
- Emergency leave must be intimated promptly by call/message/email and regularized on return.
- Late arrival, early departure and missed attendance must be regularized with evidence; repeated non-compliance may attract counselling or discipline.
- Field employees must start/end duty and record visits using the prescribed app/system during duty hours.
- Overtime/compensatory off is available only where legally applicable and properly authorized.

[[PAGE]]

### SCHEDULE C-2: CODE OF CONDUCT, ANTI-FRAUD, CASH, STOCK AND CUSTOMER DEALING POLICY

The Employee shall:

- Maintain honesty, professional behaviour, respectful communication and accurate documentation.
- Never collect unreceipted cash, issue unofficial commitments, alter invoices, create fake parties/orders/visits or manipulate schemes/returns.
- Deposit collections through authorized channels and preserve receipt and bank/ERP proof.
- Avoid personal financial dealings with dealers, distributors, farmers, vendors or subordinates that create conflict or pressure.
- Not receive kickbacks, commissions, costly gifts or benefits connected with Company decisions.
- Not sell, divert, exchange, pledge or retain Company stock, samples, promotional items or customer returns without authority.
- Immediately report short delivery, damage, shortage, suspected counterfeit product, complaint or adverse event.
- Cooperate with audits, reconciliation, investigations and lawful authorities.
- Preserve records and never destroy, backdate, overwrite or conceal evidence.

Recovery Rule: Only direct and proven loss caused by fraud, wilful misconduct, criminal breach of trust, unauthorized retention or gross negligence may be pursued, after notice and lawful process.

### SCHEDULE C-3: PREVENTION OF SEXUAL HARASSMENT AND RESPECTFUL WORKPLACE POLICY SUMMARY

Jamidara Seeds Corporation prohibits sexual harassment and maintains a respectful workplace. This summary does not replace the statutory policy or procedure where a separate detailed policy is required.

Prohibited conduct includes unwelcome physical contact or advances, demands or requests for sexual favours, sexually coloured remarks, showing pornography, unwelcome sexual messages or calls, stalking, retaliation, hostile conduct based on sex/gender, and other unwelcome verbal, non-verbal or physical conduct of a sexual nature.

- Complaints may be submitted to HR, the Internal Committee where constituted, the Local Committee or another legally competent channel.
- Confidentiality of the complaint, parties, witnesses and inquiry shall be maintained as required by law.
- Retaliation against a complainant, witness or person assisting an inquiry is prohibited.
- The respondent shall receive a fair opportunity to respond and the inquiry shall follow applicable procedure.

TABLE:complaintChannels

[[PAGE]]

### SCHEDULE C-4: IT, CRM, MOBILE, GPS, GEOFENCE, DATA AND PRIVACY POLICY

The Company may provide or authorize CRM, mobile applications, SIM cards, devices, email, cloud accounts and dashboards for business use. The following rules apply:

- Use assigned credentials personally; never share passwords or OTPs and enable required security controls.
- Record attendance, visits, orders, collection, expenses and market information accurately and on time.
- Do not install fake-location, cloning, unauthorized remote-access, data-scraping or security-bypass tools on a work device.
- Do not transfer Company data to personal email, messaging groups, cloud storage, pen drives or third-party applications without approval.
- Permit work-related GPS/geofence and device telemetry during duty hours, tours and active assignments for attendance, safety, route/visit verification, customer service, fraud prevention and asset protection.
- The Company should limit collection to legitimate purposes, role-based access and reasonable retention and should avoid unnecessary personal surveillance.
- Report lost devices, suspected compromise, phishing, password exposure or data breach immediately.
- On transfer or exit, return devices and ensure Company data is preserved and removed from personal devices under supervision where applicable.
- Business communications and data on Company systems may be audited or monitored for legitimate compliance, security and operational purposes.

Employee Consent and Acknowledgement: I understand the work-related data practices described above and consent to lawful processing necessary for employment and business administration. Covered by the consolidated acknowledgement and signature under Annexure C.

### SCHEDULE C-5: TRAVEL, DAILY ALLOWANCE AND EXPENSE REIMBURSEMENT POLICY

TABLE:scheduleC5

- Tour plan or travel must be approved except genuine emergency assignments.
- Claims require accurate route, date, purpose, customer/visit details and genuine bills where applicable.
- Mileage must reflect actual authorized travel; fake or inflated claims are misconduct.
- Personal detours, traffic fines, alcohol, tobacco, entertainment and unapproved upgrades are not reimbursable.
- Hotel reimbursement is limited to actual reasonable expense or the approved cap, whichever is lower, unless exceptional approval is recorded.
- The Company may verify claims through CRM, GPS, bills, customer confirmation and other lawful records.
- Tax invoice requirements, if any, must be followed.

[[PAGE]]

### SCHEDULE C-6: DISCIPLINARY PROCEDURE, EXIT CLEARANCE, NOC, HANDOVER AND PROPERTY RETURN

A. Indicative disciplinary process

- Preliminary review of the complaint, record or discrepancy.
- Written show-cause notice or charge communication where appropriate.
- Reasonable time and opportunity for the Employee to respond and submit evidence.
- Inquiry/hearing where required by law, seriousness or disputed facts.
- Reasoned decision and proportionate action, which may include counselling, warning, recovery, suspension, transfer, demotion or termination as lawfully permitted.
- Right to use internal grievance or appeal channel, if provided.

B. Mandatory exit-clearance checklist

TABLE:exitChecklist

Settlement Rule: NOC and handover are mandatory obligations, but disputed and undisputed amounts should be separated. Proven lawful recoveries may be adjusted.

END OF CONSOLIDATED EMPLOYMENT DOCUMENT
`;