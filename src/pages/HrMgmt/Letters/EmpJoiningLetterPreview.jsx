import { Box, Button, HStack, Image, Modal, ModalBody, ModalContent, ModalOverlay, Text, VStack, Divider, Flex, CloseButton, useToast } from "@chakra-ui/react";
import React from "react";
import top_ele1 from "../../../assets/images/pdf_logo__1.png";
import bottom_ele1 from "../../../assets/images/pdf_logo__2.png";
import company_logo from "../../../assets/images/jsc_logo_.png";
import r_logo from "../../../assets/images/jamidara_logo.png";
import emailIcon from "../../../assets/images/email_pdf.png";
import webIcon from "../../../assets/images/web_pdf.png";
import jsc_stamp from "../../../assets/images/stamp_jsc.png";
import { formatDate, formatTime } from "../../../components/common/helper";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import PlainDocumentPages from "./PlainDocumentPages";

/* ==========================================================================
   Small helper: renders a blank underscore line when a variable is empty,
   the same way the Word doc shows unfilled fields.
   ========================================================================== */
const g = (v) => (v === undefined || v === null || v === "" ? "__________" : v);

/* ==========================================================================
   Branded two-column key/value table used for "APPOINTMENT PARTICULARS"
   on page 1 - same black-border look already used elsewhere in this design,
   just reused here so the table styling stays consistent with the rest of
   the branded document.
   ========================================================================== */
const ParticularsTable = ({ rows }) => (
  <Box border="1px solid black" width="100%" overflow="hidden" mb="10px">
    {rows.map(([label, value], i) => (
      <Flex key={i} borderBottom={i === rows.length - 1 ? "none" : "1px solid black"}>
        <Box flex="1" p="4px 0px 4px 5px" borderRight="1px solid black" fontWeight="700" fontSize="12px" >
        <Text>  {label} </Text>
        </Box>
        <Box flex="1.3" p="4px 0px 4px 5px" fontSize="12px">
         <Text> {g(value)}</Text>
        </Box>
      </Flex>
    ))}
  </Box>
);

const SectionHeading = ({ children }) => (
  <Text fontWeight="600" fontSize="16px" color="#333333" mt="0px">
    {children}
  </Text>
);

const EmpJoiningLetterPreview = ({ isOpen, onClose, employee, formData }) => {

  const handleClose = () => {
    onClose(true);
  };

  const basic = Number(formData.basic) || 0;
  const houseRent = Number(formData.house_rent) || 0;
  const medical = Number(formData.medical) || 0;
  const dearnessAllowance = Number(formData.dearness_allowance) || 0;
  const otherAllowance = Number(formData.other_allowance) || 0;

  const monthlyGross =
    basic + houseRent + medical + dearnessAllowance + otherAllowance;

  const annualGross = monthlyGross * 12;

  const totalMonthlyEarning = formData?.total_monthly_earning || monthlyGross;
  const totalAnnualEarning = formData?.total_annual_earning || annualGross;

  const employmentStartingDateTime = `${formatDate(employee?.date_of_joining) || "__________"}${
    formData?.employment_start_time ? `, ${formData.employment_start_time}` : ""
  }`;

  const toast = useToast();
  const handleDownloadJoiningPDF = async () => {
    try {
      const pages = document.querySelectorAll(".pdf-page");
      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < pages.length; i++) {

        const page = pages[i];

        const dataUrl = await toJpeg(page, {
          quality: 0.75,
          pixelRatio: 1.5,
          cacheBust: true
        });

        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = 210;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      const pdfBlob = pdf.output("blob");

      // DOWNLOAD

      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Joining_Letter_${employee?.name}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // UPLOAD

      const formDataObj = new FormData();

      formDataObj.append(
        "file",
        pdfBlob,
        `Joining_Letter_${employee?.name}.pdf`
      );

      formDataObj.append("type", "employee_letters");
      formDataObj.append("employee_id", employee?.id);
      formDataObj.append("employee_name", employee?.name);
      formDataObj.append("document_type", "joining_letter");
      formDataObj.append("email", employee?.email);
      formDataObj.append("phone", employee?.contact_no);

      if (pdfBlob.size > 6 * 1024 * 1024) {
        toast({
          description: "PDF too large. Please reduce content.",
          status: "error",
        });
        return;
      }

      const res = await API.post(
        API_ENDPOINTS?.upload_emp_letters,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res?.status === 200) {
        toast({
          description:
            "Joining Letter Uploaded Successfully!" || res?.data?.message,
          duration: 2000,
          status: "success"
        });
      }

    } catch (error) {

      console.error("PDF generation/upload error:", error);

      toast({
        description:
          error?.response?.data?.message ||
          "Something went wrong, Please try again!",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent maxW="794px">
          <ModalBody p="0">
            <Flex justifyContent="flex-end" m={2}><CloseButton bg="#d3d2d2" p={5} onClick={handleClose} /></Flex>
            <Box id="joining-letter-preview" fontFamily="serif" borderTop="1px" borderColor="gray.300">

              {/* ================= PAGE 1 : HEADER + APPOINTMENT PARTICULARS ================= */}
              <Box className="pdf-page">
                <Image src={top_ele1} position="absolute" top="0" right="0" width="230px" />
                <Image src={bottom_ele1} position="absolute" bottom="-5px" left="0" width="230px" />

                <VStack spacing={0} align="center" ml="1rem">
                  <HStack spacing={4} alignItems="center" mb="0px">
                    <Image src={company_logo} width="230px" />
                    <Image src={r_logo} width="100px" />
                  </HStack>

                  <VStack justifyContent="flex-start" alignItems="flex-start" gap="0px" mt="12px">
                    <Text fontSize="16px" color="blue.700" fontWeight="bold">
                      Seeds Production &amp; Marketing Company
                    </Text>
                    <Text fontSize="11px" color="green.800">
                      North zone Office Add.-73 GANESH NAGAR-2, MURLIPURA
                      JAIPUR, REG.OFFICE-105, NEMI CHAND MARKET ALWAR
                    </Text>
                  </VStack>

                  <Divider borderColor="blue.600" borderWidth="1.5px" w="100%" mt="8px" />
                </VStack>

                <Box width="93%" marginLeft="1.5rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img" />

                  <Text textAlign="center" fontSize="16px" fontWeight="bold" color="#2b2b2c" mt="12px" mb="12px">
                    JOB JOINING LETTER
                  </Text>

                  <HStack justifyContent="end" fontSize="13px" mb="0px" gap="2.5rem">
                    <Text><strong>Date:</strong> {g(formData?.date_of_issue)}</Text>
                    <Text><strong>Ref. No.:</strong> {g(formData?.ref_no)}</Text>
                  </HStack>

                  <VStack align="flex-start" spacing="2px" fontSize="13px" mb="12px">
                    <Text><strong>Employee Name:</strong> {" "}{g(employee?.name)}</Text>
                    <Text><strong>Father/Mother/Spouse Name:</strong> {" "} {g(formData?.father_spouse_name)}</Text>
                    <Text>
                    <strong>  Residential Address:</strong> {" "}{g(employee?.address_line1)}
                      {employee?.city ? `, ${employee.city}` : ""}
                      {employee?.state ? `, ${employee.state}` : ""}
                      {employee?.pincode ? `, ${employee.pincode}` : ""}
                    </Text>
                    <Text><strong>Mobile No.:</strong> {" "}{g(employee?.contact_no)}</Text>
                    <Text><strong>Email ID:</strong>{" "} {g(employee?.email)}</Text>
                  </VStack>

                  <VStack align="flex-start"  fontSize="13px" spacing={0}>
                    <Text>Dear Mr./Ms. <strong>{g(employee?.name)}</strong>,</Text>
                    <Text textAlign="justify">
                      Further to the Provisional Offer Letter dated {g(formData?.date_of_issue)} and your joining with the Company, we
                      are pleased to record your probationary appointment with JAMIDARA SEEDS CORPORATION on the terms stated in this
                      Joining Letter, the Employment Agreement and the applicable Annexures executed by you.
                    </Text>
                  </VStack>

                  <Text fontSize="16px" mt="4px" fontWeight="bold" color="#2b2b2c" textDecoration="underline" >Appointment Particulars</Text>

                  <ParticularsTable 
                    rows={[
                      ["Employee ID", formData?.employee_id],
                      ["Employment Starting Date & Time", employmentStartingDateTime],
                      ["Designation", formData?.job_role_name],
                      ["Department / Function", formData?.department_name],
                      ["Reporting Manager", `${g(formData?.reporting_manager_name)} (${g(formData?.reporting_manager_designation)})`],
                      ["Headquarter", employee?.headquarter],
                      ["Territory / Area", formData?.territory_area],
                      ["Place of Posting", formData?.place_of_posting],
                      ["State of Posting", formData?.appointer_state],
                      ["Nature of Appointment", "PROBATIONARY EMPLOYMENT"],
                      ["Probation Period", "SIX (6) MONTHS"],
                      ["Maximum Probation Extension", "UP TO THREE (3) ADDITIONAL MONTHS BY WRITTEN COMMUNICATION"],
                      ["Initial Sales Validation (Sales/Marketing roles)", "FIRST THIRTY (30) DAYS"],
                      [
                        "Applicable Confirmed Notice Period",
                        formData?.notice_period_confirmed_days
                          ? `${formData.notice_period_confirmed_days} DAYS`
                          : "AS PER EMPLOYMENT AGREEMENT",
                      ],
                    ]}
                  />
                </Box>
              </Box>

              {/* ================= PAGE 2 : SALARY + PROBATION + DURING EMPLOYMENT ================= */}
              <Box className="pdf-page page-break">
                <Image src={top_ele1} position="absolute" top="0" right="0" width="230px" />
                <Image src={bottom_ele1} position="absolute" bottom="-5px" left="0" width="230px" />

                <VStack align="flex-start" spacing={4} width="92%" marginLeft="1.5rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img1" />
                  <Text textAlign="center" mt="1rem" mb="12px" ml="1.5rem" width="84%">CONTD:-2</Text>

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>Salary / Compensation</SectionHeading>
                    <Text fontSize="13px" textAlign="justify">
                      Your monthly and annual earning opportunity, Guaranteed Fixed Pay, Performance-Linked Variable Pay, additional
                      incentive eligibility, statutory deductions and reimbursement terms shall be governed by the separately executed
                      Salary &amp; Compensation Annexure (Annexure A).
                    </Text>
                    <Text fontSize="13px" fontWeight="600">
                      Total Monthly Earning Opportunity: ₹ {g(totalMonthlyEarning)} &nbsp;&nbsp; Total Annual Earning Opportunity: ₹ {g(totalAnnualEarning)}
                    </Text>
                  </VStack>

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>Probation and Initial 30-Day Sales Validation</SectionHeading>
                    <Text fontSize="13px" textAlign="justify">
                      Your confirmation is not automatic and shall be effective only upon a written confirmation communication issued by
                      an authorised representative of the Company. For Sales/Marketing roles, the first thirty (30) days shall constitute
                      an Initial Sales Validation Period. Performance may be reviewed on or around the 7th, 15th, 22nd and 30th day in
                      accordance with Annexure B and the Employment Agreement.
                    </Text>
                    <Text fontSize="13px" textAlign="justify">
                      During probation, the contractual notice period shall ordinarily be seven (7) days or salary in lieu of the unserved
                      portion, subject always to mandatory Applicable Law. Where a State law provides a different mandatory employer-side
                      termination, notice, inquiry or employee-side notice/recovery rule, that mandatory rule shall prevail.
                    </Text>
                  </VStack>

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>During Employment with Us</SectionHeading>
                    <VStack  spacing={0} >
                    {[
                      "You shall devote your full working time and attention to authorised Company duties and shall comply with the Employment Agreement, lawful instructions, SOPs and acknowledged Company Policies.",
                      "Your reporting line, headquarter, territory, place of posting, role or responsibilities may be reasonably changed for business requirements in accordance with the Employment Agreement and Applicable Law.",
                      "You shall not undertake conflicting employment, consultancy, agency, distributorship, dealership or competing business activity without prior written approval where required.",
                      "You shall maintain accurate attendance, CRM entries, field-visit records, GPS/geofence records, sales, collection, expense and other business records where such systems are applicable to your role.",
                      "You shall protect Company Confidential Information, dealer/distributor/farmer data, pricing, business plans, passwords, CRM data, documents, stock, samples, cash and Company Property.",
                      "You shall not make unauthorised credit, discount, warranty, scheme, collection or commercial commitments on behalf of the Company.",
                      "You shall immediately notify the Company of any material change in your residential address, mobile number, email, qualification, licence or other employment-related particulars.",
                    ].map((line, i) => (
                      <Text key={i} fontSize="13px" textAlign="justify">• {line}</Text>
                    ))}</VStack>
                  </VStack>
                </VStack>
              </Box>

              {/* ================= PAGE 3 : NOTICE PAY + STATE OVERRIDE + PERFORMANCE ================= */}
              <Box className="pdf-page page-break">
                <Image src={top_ele1} position="absolute" top="0" right="0" width="230px" />
                <Image src={bottom_ele1} position="absolute" bottom="-5px" left="0" width="230px" />

                <VStack align="flex-start" spacing={4} width="92%" marginLeft="1.5rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img1" />
                  <Text textAlign="center" mt="1rem" mb="12px" ml="1.5rem" width="84%">CONTD:-3</Text>

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>Notice Period, Resignation and Notice-Pay Shortfall</SectionHeading>
                    <Text fontSize="13px" textAlign="justify" lineHeight="21px">
                      After written confirmation, the applicable notice period shall be determined according to the designation/role and
                      the Employment Agreement. The Company policy ordinarily provides thirty (30) days for FA/SO/TSM and equivalent
                      junior sales roles, sixty (60) days for ASM/RSM/ZSM and equivalent managerial sales roles, and up to ninety (90) days
                      only for specifically designated critical/key roles, subject to Applicable Law and the applicable
                      appointment/confirmation terms.
                    </Text>
                    <Text fontSize="13px" textAlign="justify" lineHeight="21px">
                      If you resign, abandon employment or otherwise leave without serving the whole or any part of the applicable notice
                      period, the Company may, to the extent permitted by Applicable Law, adjust or recover salary in lieu of the unserved
                      portion. The contractual notice-pay amount shall be calculated on the Notice Pay Base stated in Annexure A. Any
                      statutory cap on deduction/forfeiture from unpaid wages shall prevail, and any separately recoverable contractual
                      balance may be pursued only through lawful means.
                    </Text>
                    <Text fontSize="13px" textAlign="justify" lineHeight="21px">
                      The Company may waive or reduce all or part of the notice period or notice-pay claim based on proper handover,
                      dealer/distributor reconciliation, territory transition, business continuity and operational requirements. Earned
                      wages, statutory dues and approved business expenses shall not be automatically forfeited merely because the full
                      notice period was not served.
                    </Text>
                  </VStack>

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>State-Specific Statutory Override</SectionHeading>
                    <Text fontSize="13px" textAlign="justify" lineHeight="21px">
                      The employment shall be subject to the mandatory Central and State labour/employment law applicable at the
                      Employee's actual place of employment. Where any mandatory provision relating to probation, notice period,
                      termination, resignation, wages, deductions, working hours, leave, settlement or another employment condition
                      differs from or overrides a contractual term, the mandatory statutory provision shall prevail to the extent of the
                      inconsistency. If the Employee is transferred from one State to another, the mandatory law applicable at the
                      legally relevant place of employment shall apply.
                    </Text>
                  </VStack>

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>Performance, Increment and Continuation</SectionHeading>
                    <Text fontSize="13px" textAlign="justify">
                      Performance targets, KPI weightages, review rules, Initial 30-Day Sales Validation standards and target
                      acknowledgement shall be governed by Annexure B. Salary revision, increment or promotion is not automatic and shall
                      depend on the applicable written performance standard, conduct, collection quality, business conditions and written
                      approval of the Company.
                    </Text>
                  </VStack>
                    <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>Cash, Collection, Stock and Company Property</SectionHeading>
                    <Text fontSize="13px" textAlign="justify">
                      Any suspected non-deposit, diversion, unauthorised retention or misappropriation of Company/customer cash, cheque,
                      stock, instruments or property may lead to suspension of collection/asset authority, reconciliation, show-cause,
                      audit, disciplinary proceedings and civil/criminal remedies as permitted by law. Proven actual loss may be recovered
                      through lawful means after applicable process. Earned wages and statutory dues shall not be automatically forfeited.
                    </Text>
                  </VStack>
                </VStack>
              </Box>

              {/* ================= PAGE 4 : CASH/EXIT/DOC INTEGRATION/eSIGN + SIGNATURES ================= */}
              <Box className="pdf-page page-break">
                <Image src={top_ele1} position="absolute" top="0" right="0" width="230px" />
                <Image src={bottom_ele1} position="absolute" bottom="-5px" left="0" width="230px" />

                <VStack align="flex-start" spacing={4} width="92%" marginLeft="1.5rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img1" />
                  <Text textAlign="center" mt="1.5rem" mb="12px" width="84%" ml="1.5rem">CONTD:-4</Text>

                

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>Exit Clearance, Handover and Full &amp; Final Settlement</SectionHeading>
                    <Text fontSize="13px" textAlign="justify">
                      On separation you shall complete proper handover, dealer/distributor NOC and reconciliation where applicable, return
                      Company Property, cash, stock, samples, records, devices, SIM, credentials and data, and complete the Exit Clearance
                      requirements under the Employment Agreement. Disputed and undisputed amounts shall be dealt with separately in
                      accordance with Applicable Law.
                    </Text>
                  </VStack>

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>Document Integration and Priority</SectionHeading>
                    <Text fontSize="13px" textAlign="justify">
                      This Joining Letter shall be read together with the Provisional Offer Letter, Employment Agreement, Annexure A -
                      Salary &amp; Compensation, Annexure B - KPI / Target &amp; Performance Schedule, and Annexure C - Company Policy
                      Acknowledgement. In case of inconsistency, mandatory Applicable Law shall prevail; thereafter the signed Employment
                      Agreement, subject-specific signed Annexures, this Joining Letter and the Provisional Offer Letter shall apply,
                      unless a later written document expressly amends an earlier term.
                    </Text>
                  </VStack>

                  <VStack align="flex-start" spacing={0.5} mt="8px" width="100%">
                    <SectionHeading>Electronic Execution / Aadhaar eSign</SectionHeading>
                    <Text fontSize="14px" textAlign="justify">
                      This Joining Letter and the related employment documents may be issued, accepted and executed electronically. Where
                      the Employee elects to use Aadhaar-based eSign or another legally recognised electronic-signature service, the
                      electronic signature affixed through an authorised Certifying Authority/eSign service under the Information
                      Technology Act, 2000 and applicable rules shall, to the extent permitted by law, have the same binding effect as a
                      handwritten signature. Aadhaar e-KYC or OTP authentication by itself, without affixing a legally valid electronic
                      signature through an authorised eSign process, shall not by itself constitute execution of this document.
                    </Text>
                    <Text fontSize="14px" textAlign="justify">
                      The Employee acknowledges that he/she has read, understood or had explained the above terms and has received or been
                      given access to the Employment Agreement and applicable Annexures/Policies.
                    </Text>
                  </VStack>

                  <HStack width="100%" align="flex-start" spacing={6} mt="14px">
                    <VStack align="flex-start" flex="1" spacing="2px" fontSize="13px">
                      <Text fontWeight="bold">FOR JAMIDARA SEEDS CORPORATION</Text>
                      <Text>Authorized Signatory: GIRDHARI LAL</Text>
                      <Text>Designation: PARTNER / AUTHORIZED SIGNATORY</Text>
                      <Text>Signature / eSign: __________________________</Text>
                      <Text>Date: ____ / ____ / ______ &nbsp; Place: JAIPUR</Text>
                      {formData.show_stamp && (
                        <Image src={jsc_stamp} alt="Company Stamp" boxSize="80px" mt="6px" />
                      )}
                    </VStack>
                    <VStack align="flex-start" flex="1" spacing="2px" fontSize="13px">
                      <Text fontWeight="bold">EMPLOYEE</Text>
                      <Text>Name: {g(employee?.name)}</Text>
                      <Text>Designation: {g(formData?.job_role_name)}</Text>
                      <Text>Signature / Aadhaar eSign: __________________</Text>
                      <Text>Date: ____ / ____ / ______ &nbsp; Place: __________</Text>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack alignItems="flex-end" mt="6rem" spacing="4px" width="76%" position="absolute" right="0px" bottom="1rem">
                  <Divider borderColor="green.600" borderWidth="1px" w="100%" mt="1rem" />
                  <Divider borderColor="green.300" borderWidth="2px" w="90%" mt="0px" />
                  <Flex mr="1rem" gap="1rem" mt="2px">
                    <Flex alignItems="center" gap="8px"><Image src={emailIcon} width="24px" mt="12px" /><Text fontSize="13px">jamidaraseedscorporation@gmail.com</Text></Flex>
                    <Flex alignItems="center" gap="8px"><Image src={webIcon} width="24px" mt="12px" /><Text fontSize="13px">www.jamidaraseeds.com</Text></Flex>
                  </Flex>
                </VStack>
              </Box>

              {/* =========================================================
                  PLAIN-DESIGN PAGES: Probationary Employment Agreement +
                  Annexure A (Salary) + Annexure B (KPI/Target) +
                  Annexure C (Policy Acknowledgement) + Schedules C-1..C-6.
                  These reuse the same .pdf-page capture mechanism above but
                  intentionally carry no logos / colour / watermark, per the
                  "plain design for the agreement" requirement. Numbering
                  continues from CONTD:-4 used above.
                  ========================================================= */}
              <PlainDocumentPages employee={employee} formData={formData} startContdAt={4} />
            </Box>
            <Flex p={1} justifyContent="center" borderTop="1px" borderColor="#bdbcbc">
              <Button colorScheme="gray" onClick={handleClose}>Close</Button>
              <Button colorScheme="blue" onClick={handleDownloadJoiningPDF} ml={5}>Download Joining Letter</Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmpJoiningLetterPreview;