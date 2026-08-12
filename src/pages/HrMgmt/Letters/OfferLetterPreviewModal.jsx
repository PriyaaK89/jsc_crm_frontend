import { Box, Button, HStack, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text, VStack, Divider, Flex, useToast, Table, Thead, Tr, Th, Tbody, Td, SimpleGrid } from "@chakra-ui/react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import top_ele1 from "../../../assets/images/pdf_logo__1.png";
import bottom_ele1 from "../../../assets/images/pdf_logo__2.png";
import company_logo from "../../../assets/images/jsc_logo_.png";
import r_logo from "../../../assets/images/jamidara_logo.png";
import { formatDate } from "../../../components/common/helper";
import emailIcon from "../../../assets/images/email_pdf.png";
import webIcon from "../../../assets/images/web_pdf.png";
import jsc_stamp from "../../../assets/images/stamp_jsc.png"
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

// Rows for the Month 1-3 performance commitment table (must match OfferLetterPage.jsx)
const TARGET_ROWS = [
  { key: "sales_target", label: "Sales Target (₹)" },
  { key: "collection_target", label: "Collection / Realisation Target (₹)" },
  { key: "new_distributor", label: "New Distributor Open / Activated (Nos.)" },
  { key: "distributor_visits", label: "Distributor Visits (Nos.)" },
  { key: "dealer_visits", label: "Dealer Visits (Nos.)" },
  { key: "farmer_visits", label: "Farmer Visits / Meetings (Nos.)" },
];

const OfferLetterPreviewModal = ({ isOpen, onClose, employee, formData }) => {

  const toast = useToast();

  const handleDownloadPDF = async () => {
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

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Offer_Letter_${employee?.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const formDataObj = new FormData();

      formDataObj.append(
        "file",
        pdfBlob,
        `Offer_Letter_${employee?.name}.pdf`
      );

      formDataObj.append("type", "employee_letters");
      formDataObj.append("employee_id", employee?.id);
      formDataObj.append("employee_name", employee?.name);
      formDataObj.append("document_type", "offer_letter");
      formDataObj.append("email", employee?.email);
      formDataObj.append("phone", employee?.contact_no);
      formDataObj.append( "document_type", "offer_letter" );
      formDataObj.append("reference_no", formData.offer_ref_no);

      if (pdfBlob.size > 5 * 1024 * 1024) {
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
            "Offer Letter Uploaded Successfully!" || res?.data?.message,
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
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent maxW="793px">
        <ModalBody p="0">
          <Box id="offer-letter-preview" fontFamily="serif">

            {/* ================= PAGE 1 ================= */}
            <Box className="pdf-page" >
              <Box className="pdf-inner">

                <Image src={top_ele1} position="absolute" top="-3px" right="-2px" width="240px" />
                <Image src={bottom_ele1} position="absolute" bottom="0" left="-2px" width="240px" />

                {/* Header */}
                <VStack spacing={0} align="center" ml="0rem">
                  <HStack spacing={4} alignItems="center" mb="4px">
                    <Image src={company_logo} width="240px" />
                    <Image src={r_logo} width="100px" />
                  </HStack>

                  <Text mt="16px" fontSize="11px" color="green.800">Registered Office: 105, Nemi Chand Market, Alwar, Rajasthan</Text>
                  <Text fontSize="11px" color="green.800">Corporate Office: S-19, Aggression Tower, Vidhyadhar Nagar, Jaipur - 302039, Rajasthan</Text>

                  <Divider borderColor="green.600" borderWidth="2px" w="96%" mt="10px" />
                </VStack>

                <Box width="92%" marginLeft="1.5rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img" />
                  <Text textAlign="center" fontSize="18px" fontWeight="bold" color="#333333" mt="18px" mb="15px"> PROVISIONAL OFFER LETTER </Text>

                  <VStack justifyContent="left" alignItems="left" mb="1rem" spacing={0}>
                    <Text fontSize="13px" lineHeight="21px"><b>Date:</b> {formData?.date_of_issue ? formatDate(formData?.date_of_issue) : ""}</Text>
                    <Text fontSize="13px" lineHeight="21px"><b>Offer Ref. No.:</b> {formData?.offer_ref_no}</Text>
                  </VStack>

                  {/* To Section */}
                  <Box mb="16px">
                    <Text fontWeight="bold">To:</Text>
                    <Text><b>Employee Name:</b>{employee?.name}</Text>
                    <Text textTransform="capitalize"><b>Address:</b>
                      {employee?.address_line1} {employee?.address_line2}
                      {employee?.address_line2 ? "," : ""}
                      {employee?.area}, {employee?.city}, {employee?.state} - {employee?.pincode}
                    </Text>
                    <Text><b>Mobile No.:</b> {employee?.contact_no}</Text>
                    <Text><b>Email ID:</b> {employee?.email}</Text>
                  </Box>

                  <Text mb="10px">Subject: Provisional Offer of Employment for the Post of <u><b>{formData?.designation || employee?.job_role_name}</b></u></Text>

                  {/* Body */}
                  <VStack align="flex-start" spacing={0}>
                    <Text mb={2}>Dear <b><u> Mr./Ms. {employee?.name},</u></b></Text>

                    <Text mb={2}>
                      Further to your application and discussions with us, we are pleased to offer you probationary
                      employment with <strong>JAMIDARA SEEDS CORPORATION</strong> on the terms summarised in this
                      Offer Letter and subject to execution of the Company's Employment Agreement and applicable
                      Annexures at the time of joining.
                    </Text>
                    <VStack spacing={2} align="stretch" mb={2}>
                      <SimpleGrid columns={2} spacingX={8} spacingY={2}>
                        <Text>
                          Designation: <u><b>{formData?.designation || employee?.job_role_name}</b></u>
                        </Text>

                        <Text>
                          Department: <u><b>{formData?.department || employee?.department_name}</b></u>
                        </Text>

                        <Text>
                          Reporting Manager: <u><b>{formData?.reporting_officer_name}</b></u>
                        </Text>

                        <Text>
                          Headquarter: <u><b>{formData?.headquarter}</b></u>
                        </Text>

                        <Text>
                          Territory / Area: <u><b>{formData?.working_area}</b></u>
                        </Text>

                        <Text>
                          Place of Posting: <u><b>{formData?.place_of_posting}</b></u>
                        </Text>

                        <Text>
                          Proposed Joining Date:{" "}
                          <u>
                            <b>
                              {formData?.proposed_joining_date
                                ? formatDate(formData.proposed_joining_date)
                                : ""}
                            </b>
                          </u>
                        </Text>

                        <Text>
                          Nature of Appointment: <b>PROBATIONARY EMPLOYMENT</b>
                        </Text>
                      </SimpleGrid>

                      <Text>
                        Probation: Six (6) months, subject to the Employment Agreement.
                      </Text>
                    </VStack>
                    <Text fontWeight="bold" mt="6px" >Compensation:</Text>
                    <Text mb={2}>
                      Monthly Earning Opportunity: ₹ <u><b>{(formData?.annual_earning / 12).toFixed(2)}</b></u>
                      &nbsp;&nbsp; Annual: ₹ <u><b>{formData?.annual_earning || employee?.salary}</b></u>
                    </Text>
                    <Text>
                      The detailed salary breakup, Guaranteed Fixed Pay, Performance-Linked Variable Pay, TA/DA and
                      incentive eligibility shall be governed by the Salary Annexure signed at joining.
                    </Text>

                  </VStack>
                </Box>
              </Box>
            </Box>

            {/* ================= PAGE 2 ================= */}
            <Box className="pdf-page page-break">
              <Box className="pdf-inner">
                <Image src={top_ele1} position="absolute" top="-3px" right="-2px" width="250px" />
                <Image src={bottom_ele1} position="absolute" bottom="0" left="-2px" width="250px" />

                <VStack align="flex-start" spacing={4} width="92%" marginLeft="2rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img1" />
                  <Text textAlign="center" mt="1rem" mb="12px" width="89%" fontSize="13px">CONTD:-2</Text>

                  <VStack align="flex-start" width="100%" spacing={0}>
                    <Box>
                      <Text fontSize="13px">Please bring / submit the following documents at the time of joining:</Text>

                      <Box ml="1.5rem" fontSize="13px">
                        <Text>• &nbsp; Recent salary slip(s) and/or bank statement, where applicable.</Text>
                        <Text>• &nbsp; Educational qualification certificates.</Text>
                        <Text>• &nbsp; Experience / relieving certificates, where applicable.</Text>
                        <Text>• &nbsp; PAN and Aadhaar / other valid identity and address proof.</Text>
                        <Text>• &nbsp; Bank account proof / cancelled cheque / passbook copy.</Text>
                        <Text>• &nbsp; Recent passport-size photographs.</Text>
                      </Box>
                      <Text fontSize="13px" lineHeight="21px">
                        Original documents physically produced for verification will be returned after verification,
                        unless retention is legally required or separately authorised.
                      </Text></Box>
                    <Text fontWeight="700" fontSize="15px" mt={4}>COMPENSATION, PERFORMANCE & PROBATION FRAMEWORK</Text>

                    <Text fontWeight="600" fontSize="13px" lineHeight="21px" mb={0} mt={2}>1. Initial 30-Day Sales Validation Period</Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify" mt={1}>
                      For a Sales / Marketing role, the first thirty (30) days of employment shall constitute an
                      Initial Sales Validation Period. Suitability and performance may be reviewed on or around the
                      7th, 15th, 22nd and 30th day on parameters including field activity, product knowledge, market
                      coverage, dealer/distributor development, sales pipeline, collection performance, conduct,
                      attendance, CRM/GPS compliance and reporting discipline.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      Continuation beyond any review stage or beyond the first thirty (30) days is not automatic. The
                      Company may continue, revise expectations, extend assessment where lawfully permitted, or
                      discontinue probationary employment in accordance with the Employment Agreement and Applicable Law.
                    </Text>

                    <Text fontWeight="600" fontSize="13px" lineHeight="21px" mt={3}>2. Performance & Target Commitment</Text>
                    <Text fontSize="13px" lineHeight="21px" mt={1}><b>Annual / Monthly / Seasonal Sales Commitment: ₹ </b><u>{formData?.annual_sales_commitment}</u></Text>
                    <Text fontSize="13px" lineHeight="21px"><b>Collection Commitment: ₹ </b><u>{formData?.collection_commitment}</u></Text>
                    <Text fontSize="13px" lineHeight="21px"><b>New Dealer / Distributor Commitment: </b><u>{formData?.new_dealer_commitment}</u></Text>
                    <Text fontSize="13px" lineHeight="21px"><b>Other Key Performance Commitment:</b> <u>{formData?.other_kpi_commitment}</u></Text>

                    <Text fontWeight="700" fontSize="13px" lineHeight="21px" textAlign="left" width="100%" mt="14px">
                      FIRST THREE-MONTH PERFORMANCE COMMITMENT (MONTH 1 TO MONTH 3)
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify" mt={1}>
                      The following initial targets shall be completed before acceptance of this Offer Letter /
                      joining, or in any event before commencement of the relevant review month. Month 1, Month 2
                      and Month 3 mean the first, second and third performance review months from the Employment
                      Starting Date, unless another commencement date is expressly recorded in writing.
                    </Text>

                    <Table size="sm" variant="simple" border="1px solid #efefef" mt="4px" >
                      <Thead >
                        <Tr>
                          <Th fontSize="11px" padding="2px 4px">PERFORMANCE COMMITMENT</Th>
                          <Th fontSize="11px" padding="2px 4px">MONTH 1</Th>
                          <Th fontSize="11px" padding="2px 4px">MONTH 2</Th>
                          <Th fontSize="11px" padding="2px 4px">MONTH 3</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {TARGET_ROWS.map((row) => (
                          <Tr key={row.key}>
                            <Td fontSize="12px" padding="2px 4px">{row.label}</Td>
                            <Td fontSize="12px" padding="2px 4px">{formData?.month_targets?.[row.key]?.[0]}</Td>
                            <Td fontSize="12px" padding="2px 4px">{formData?.month_targets?.[row.key]?.[1]}</Td>
                            <Td fontSize="12px" padding="2px 4px">{formData?.month_targets?.[row.key]?.[2]}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>
                </VStack>
              </Box>
            </Box>

            {/* ================= PAGE 3 ================= */}
            <Box className="pdf-page page-break">
              <Box className="pdf-inner">
                <Image src={top_ele1} position="absolute" top="-3px" right="-2px" width="250px" />
                <Image src={bottom_ele1} position="absolute" bottom="0" left="-2px" width="250px" />

                <VStack align="flex-start" spacing={3} width="92%" marginLeft="2rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img1" />
                  <Text textAlign="center" mt="1rem" mb="12px" width="89%" fontSize="13px">CONTD:-3</Text>
                  <Box>
                    <Text fontSize="12px" textAlign="justify" mt="18px" fontWeight="600" lineHeight="20px">
                      CANDIDATE / EMPLOYEE TARGET ACCEPTANCE: By signing or legally eSigning this Offer Letter, I
                      specifically confirm that every completed Month 1, Month 2 and Month 3 target stated in the
                      above table has been communicated and explained to me before commencement of the relevant
                      review period, and I acknowledge and accept those completed targets as my initial performance
                      commitments. A blank field shall not be treated as a target communicated or accepted by me,
                      and no target shall be back-filled retrospectively after execution.
                    </Text>
                    <Text fontSize="12px" textAlign="justify" lineHeight="20px" mt="8px">
                      Monthly / seasonal targets, KPI weightages, measurement rules and target acknowledgement shall
                      be recorded in the KPI / Target Annexure, official CRM, email or another traceable Company
                      system. No performance target shall be applied retrospectively. Any revision to a communicated
                      target shall apply prospectively and shall be communicated through a traceable Company system
                      before the relevant revised review period.
                    </Text>
                  </Box>
                  <VStack align="flex-start" width="100%" spacing={3}>

                    <Text fontWeight="600" fontSize="13px" lineHeight="21px" mt={2}>3. Performance-Linked Compensation</Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      The compensation for Sales / Marketing roles may comprise a Guaranteed Fixed component and a
                      Performance-Linked Variable component. The exact breakup, payout threshold, additional
                      incentive slabs and exclusions shall be stated in the Salary Annexure. Performance-linked
                      amounts shall become payable only when the applicable measurable conditions are achieved and
                      verified.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify" mt={2}>
                      The Company shall not retrospectively reduce Guaranteed Fixed Pay already earned merely
                      because a target was not achieved. Approved TA/DA and genuine business-expense reimbursement
                      shall be governed separately by Company Policy.
                    </Text>

                    <Text fontWeight="600" fontSize="13px" lineHeight="21px" mt={2}>4. Performance Measurement Principles</Text>
                    <Box ml="1rem">
                      <Text fontSize="13px" lineHeight="21px">• &nbsp; Verified net sales / business achievement after applicable returns, cancellations and credit notes.</Text>
                      <Text fontSize="13px" lineHeight="21px">• &nbsp; Collection / realisation in the Company bank account or authorised ledger.</Text>
                      <Text fontSize="13px" lineHeight="21px">• &nbsp; Approved dealer / distributor development and activation.</Text>
                      <Text fontSize="13px" lineHeight="21px">• &nbsp; Field coverage, market execution and reporting discipline.</Text>
                      <Text fontSize="13px" lineHeight="21px">• &nbsp; CRM, GPS, geofence, attendance and other compliance requirements applicable to the role.</Text>
                      <Text fontSize="13px" lineHeight="21px">• &nbsp; Product availability, season, territory potential and material Company-side constraints may be considered in a fair review.</Text>
                    </Box>

                    <Text fontWeight="600" fontSize="13px" lineHeight="21px" mt="6px">5. Incentive & Salary Revision</Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      Additional incentive, if applicable, shall be payable over and above the stated earning
                      opportunity only in accordance with the signed Salary / Incentive Annexure. Any salary
                      revision or increment after probation or a specified review period shall require the
                      applicable performance standard and written approval of the Company; no increment shall be
                      automatic unless expressly stated in writing.
                    </Text>


                  </VStack>
                </VStack>
              </Box>
            </Box>

            {/* ================= PAGE 4 ================= */}
            <Box className="pdf-page page-break">
              <Box className="pdf-inner">
                <Image src={top_ele1} position="absolute" top="-3px" right="-2px" width="250px" />
                <Image src={bottom_ele1} position="absolute" bottom="0" left="-2px" width="250px" />

                <VStack align="flex-start" spacing={4} width="92%" marginLeft="2rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img1" />
                  <Text textAlign="center" mt="1rem" mb="12px" width="89%" fontSize="13px">CONTD:-4</Text>
                  <VStack alignItems="left">
                    <Text fontWeight="600" fontSize="13px" lineHeight="21px" mt={2}>6. Notice Period</Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      During probation, the applicable notice period shall be as stated in the Employment Agreement.
                      After written confirmation, the applicable notice period shall ordinarily be role-based: 30
                      days for FA / SO / TSM or equivalent junior sales roles, 60 days for ASM / RSM / ZSM or
                      equivalent managerial roles, and up to 90 days only for specifically designated critical / key
                      roles, subject always to Applicable Law and the final Employment Agreement.
                    </Text>
                  </VStack>
                  <VStack align="flex-start" width="100%" spacing={3} mt={2}>
                    <Text fontWeight="700" fontSize="16px">OTHER TERMS & CONDITIONS</Text>

                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      <b>Offer Conditions:</b> This is a provisional offer and is subject to satisfactory
                      verification of the information and documents provided by you, your joining on or before the
                      agreed date, and execution / acceptance of the applicable employment documents.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      <b>Employment Documents:</b> At joining, you may be required to execute the Appointment /
                      Joining Letter, Employment Agreement, Salary Annexure, KPI / Target Annexure, policy
                      acknowledgements and other role-specific documents. In case of conflict, mandatory law shall
                      prevail, followed by the signed Employment Agreement and applicable Annexures.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      <b>Transfer / Posting:</b> Your headquarter, territory, reporting line, place of posting and
                      responsibilities may be reasonably changed in accordance with business requirements, Company
                      Policy, the Employment Agreement and Applicable Law.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      <b>Confidentiality & Company Data:</b> You shall protect confidential information, customer /
                      dealer / distributor data, pricing, product information, Company records, CRM data and other
                      proprietary information and shall use them only for authorised Company work.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      <b>CRM / GPS / Attendance:</b> Where applicable to your role, use of the Company CRM,
                      attendance application, GPS / geofence, official communication systems and reporting tools
                      shall be mandatory during duty hours / approved field assignments in accordance with the
                      Employment Agreement and Company Policy.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      <b>Outside Employment / Conflict:</b> During employment, you shall not undertake conflicting
                      employment, consultancy, agency, dealership, distributorship or other business activity
                      without prior written approval where required by the Employment Agreement.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      <b>Company Policies:</b> You shall comply with the lawful Company policies and SOPs
                      communicated from time to time, including conduct, anti-fraud, POSH, travel / expense, cash /
                      collection, data security, leave, attendance and exit / handover requirements.
                    </Text>




                    {/* Footer */}

                  </VStack>
                </VStack>


              </Box>
            </Box>

            {/* ================= PAGE 5 ================= */}
            <Box className="pdf-page page-break">
              <Box className="pdf-inner">
                <Image src={top_ele1} position="absolute" top="-3px" right="-2px" width="250px" />
                <Image src={bottom_ele1} position="absolute" bottom="0" left="-2px" width="250px" />

                <VStack align="flex-start" spacing={4} width="92%" marginLeft="2rem" className="letter-content">
                  <Image src={r_logo} alt="Round Logo" className="watermark_img1" />
                  <Text textAlign="center" mt="1rem" mb="12px" width="89%" fontSize="13px">CONTD:-5</Text>

                  <VStack align="flex-start" width="100%" spacing={2}>

                    <Text fontWeight="700" fontSize="15px" mt="6px">ELECTRONIC EXECUTION / AADHAAR eSIGN</Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      The Candidate expressly agrees that this Offer Letter, its acceptance and related employment
                      documents may be issued, accepted and executed in electronic form. Where the Candidate elects
                      to use Aadhaar-based eSign or another legally recognised electronic-signature service, the
                      electronic signature affixed through a Certifying Authority / eSign service operating under
                      the Information Technology Act, 2000 and applicable rules shall, to the extent permitted by
                      Applicable Law, be treated as valid, binding and equivalent in effect to a handwritten
                      signature.
                    </Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      The Candidate consents to the use of the registered mobile number, email address and
                      authentication information reasonably required for the eSign transaction and to preservation
                      of the electronic audit trail, consent record and signature-validation information. For
                      clarity, Aadhaar e-KYC / OTP authentication by itself, without affixing a legally valid
                      electronic signature through an authorised eSign process, shall not by itself constitute
                      execution of this document.
                    </Text>
                    <Text fontWeight="bold">{formData?.salary_norms1}</Text>
                    <Text fontWeight="700" fontSize="15px" mt="6px">OFFER ACCEPTANCE</Text>
                    <Text fontSize="13px" lineHeight="21px" textAlign="justify">
                      If you accept this provisional offer, please sign / eSign below and return the accepted copy
                      on or before <u><b>{formData?.acceptance_deadline ? formatDate(formData?.acceptance_deadline) : "____________________"}</b></u>. If
                      acceptance and joining are not completed within the stated time, the Company may withdraw or
                      treat this offer as lapsed, subject to any written extension.
                    </Text>

                    <VStack spacing={0} align="stretch" mt={4}>
                      <Flex>
                        <Box flex="1">
                          <Text fontSize="12px">
                            <b>Authorized Signatory:</b> {formData?.authorised_signatory}
                          </Text>
                        </Box>

                        <Box flex="1" textAlign="left">
                          <Text fontSize="12px">
                            <b>Name:</b> {employee?.name}
                          </Text>
                        </Box>
                      </Flex>

                      <Flex>
                        <Box flex="1">
                          <Text fontSize="12px">
                            <b>Designation:</b> Partner / Authorized Signatory
                          </Text>
                        </Box>

                        <Box flex="1" textAlign="left">
                          <Text fontSize="12px" display="flex" width="125%">
                            <b>Designation Offered:</b>
                            <p> {formData?.designation || employee?.job_role_name}</p>
                          </Text>
                        </Box>
                      </Flex>

                      <Flex>
                        <Box flex="1">
                          <Text fontSize="12px">
                            <b>Place:</b> Jaipur, Rajasthan
                          </Text>
                        </Box>

                        <Box flex="1" textAlign="left">
                          <Text fontSize="12px">
                            <b>Place:</b> {formData?.place_of_posting || employee?.city}
                          </Text>
                        </Box>
                      </Flex>
                    </VStack>

                    {/* Footer */}
                    <Box mt="30px">
                      {formData.show_stamp && (
                        <Image src={jsc_stamp} alt="Company Stamp" boxSize="84px" mt={2} mb={2} />)}
                      <Text fontWeight="bold">
                        HR Department,
                        <br />
                        Jamidara Seeds Corporation
                      </Text>
                    </Box>
                  </VStack>
                </VStack>

                <VStack alignItems="flex-end" bottom="81px" spacing="4px" width="76%" position='absolute' right='0px'>
                  <Divider borderColor="green.600" borderWidth="1px" w="100%" mt="1rem" />
                  <Divider borderColor="green.300" borderWidth="2px" w="90%" mt="0px" />
                  <Flex mr="1rem" gap="1rem" mt="2px">
                    <Flex alignItems="center" gap="8px" ><Image src={emailIcon} width="24px" mt="12px" /><Text fontSize="13px" lineHeight="21px">jamidaraseedscorporation@gmail.com</Text></Flex>
                    <Flex alignItems="center" gap="8px"><Image src={webIcon} width="24px" mt="12px" /><Text fontSize="13px" lineHeight="21px">www.jamidaraseeds.com</Text></Flex>
                  </Flex>
                </VStack>
              </Box>
            </Box>

          </Box>

        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OfferLetterPreviewModal;