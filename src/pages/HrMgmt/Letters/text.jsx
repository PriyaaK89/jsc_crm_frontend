import { Box, Button, Divider, Heading, HStack, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text, VStack } from "@chakra-ui/react";
import html2pdf from "html2pdf.js";
import React from "react";

const EmpAgreementL = ({ isOpen, onClose, employee, formData, age }) => {

      const handleDownloadPDF = () => {
        const element = document.getElementById("agre-letter-preview");
    
       html2pdf()
  .set({
    margin: 0,
    filename: `Agre_Letter_${employee?.name}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollY: 0
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    },
    pagebreak: {
      mode: ['css', 'legacy']
    }
  })
  .from(element)
  .save();

    
      };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent maxW="none"
                    width="fit-content"
                    bg="transparent"
                    boxShadow="none">
                    <ModalBody p={0}>
                        <Box id="agre-letter-preview" fontFamily="Georgia">
                            <VStack spacing={0}>
                                <Box className="pdf-page"  textAlign="justify" >
                                    <Text fontWeight="bold" fontSize="22px" textAlign="center">EMPLOYMENT AGREEMENT</Text>
                                    <Text color="gray.500" mt="1rem" textAlign="center">This agreement lays down the terms of employment, agreed upon by the employer and employee. Whether stated explicitly in the agreement or not, both the employee and the employer have the duty of mutual confidence and trust, and to make only lawful and reasonable demands on each other.</Text>
                                    <Divider borderColor="black"
                                        borderWidth="1px"
                                        w="92%"
                                        mt="2rem" mb="1rem" />
                                    <Text textAlign="center">This EMPLOYMENT AGREEMENT (Hereinafter, the “Agreement”) is entered into on this {formData?.date_of_issue}</Text>
                                    <VStack gap="1.5rem" alignItems="center">
                                        <Text fontWeight="600" mt="2rem">BY AND BETWEEN</Text>
                                        <Text>JAMIDARA SEEDS CORPORATION,- FORM A UNDER SECTION 58 OF THE INDIAN PARTNER-SHIP ACT.1932 having its registered office at_105,NEMI CHAND MARKET ALWAR RAJ.(hereinafter referred to as the “Company” or “Employer”, which expression shall, unless repugnant to the meaning or context hereof, be deemed to include all permitted successors and assigns), </Text>
                                        <Text fontWeight="600">AND</Text>
                                        <Text>{employee?.name} son/of  {employee?.father_name}, aged {age} years and residing at S/0 {employee?.father_name}, {employee?.address_line1}, {employee?.area}, DIST.- {employee?.district} - {employee?.pincode} ({employee?.state})(Hereinafter referred to as the "Employee", which expression shall, unless repugnant to the meaning or context hereof, be deemed to include all permitted successors and assigns). </Text>

                                        <Text><strong>WHEREAS,</strong> the parties hereto desire to enter into this Agreement to define and set forth the terms and conditions of the employment of the Employee by the Company;</Text>
                                        <Text><strong>NOW, THEREFORE,</strong> in consideration of the mutual covenants and agreements set forth below, it is hereby covenanted and agreed by the Company and the Employee as follows:</Text>
                                    </VStack>
                                    <Box>
                                        <VStack mt="2rem" alignItems="flex-start">
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold">1.	Interpretation</Text>
                                                <Text fontSize="15px">In this agreement the following terms shall have the following meanings:</Text>


                                            </Box>

                                        </VStack>
                                    </Box>
                                </Box>
                                <Box className="pdf-page page-break">
                                    <VStack width="95%" margin="auto" gap="1rem">
                                        <Box mt="2rem">
                                            <HStack alignItems="baseline" mb="1rem">
                                                <Text width="34%">a)  “Confidential  Information”</Text>
                                                <Text textAlign="justify" width="100%" fontSize="15px">Any trade secret or other information which is confidential or commercially sensitive and which is not in the public domain (other than through the wrongful disclosure by the Employee) and which belongs to any Group Company (whether stored or recorded in documentary or electronic form) and which (without limitation) relates to the business methods, management systems, marketing plans, strategic plans, finances, new or maturing business opportunities, marketing activities, processes, inventions, designs or similar of any Group Company, or to which any Group Company owes a duty of confidentiality to any third party and including in particular [insert specific named items of Confidential Information];</Text>
                                            </HStack>
                                            <HStack alignItems="baseline" mb="1rem">
                                                <Text width="34%">b) “The Employment”</Text>
                                                <Text textAlign="justify" width="100%" fontSize="15px">The employment of the Employee by the Company in accordance with the terms of this agreement;</Text>
                                            </HStack>
                                            <HStack alignItems="baseline" mb="1rem">
                                                <Text width="34%">c) “Group Company”</Text>
                                                <Text textAlign="justify" width="100%" fontSize="15px">The Company, any company of which it is a Subsidiary (being a holding company of the Company) and any Subsidiaries of the Company or any holding company, from time to time;</Text>
                                            </HStack>
                                            <HStack alignItems="baseline" mb="1rem">
                                                <Text width="34%">d) “Subsidiary”</Text>
                                                <Text textAlign="justify" width="100%" fontSize="15px">A company as defined in section 1159 of the Companies Act 2006;</Text>
                                            </HStack>
                                            <HStack alignItems="baseline" mb="1rem">
                                                <Text width="34%">e) “Termination Date”</Text>
                                                <Text textAlign="justify" width="100%" fontSize="15px">The date on which the Employment ceases.</Text>
                                            </HStack>
                                        </Box>

                                        <Box>
                                            <Text fontSize="24px" fontWeight="bold" mb="10px">2. Position</Text>
                                            <Text mb="18px" fontSize="15px">a)  Upon execution of this Agreement, the employee would be posted as the {employee?.job_role_name} of the Company. H.Q.{employee?.headquarter} OFFICE  Area: {employee?.area}.</Text>
                                            <Text mb="18px" fontSize="15px">b)  During the term period of this Agreement, the Company may change the employee's above mentioned post (or position) or location based on the Company's production, operation or working requirements or according to the employee's working capacities and performance, including but not limited to adjustments made to the employee's job description or work place, promotion, work transfer at the same level, and demotion, etc., or adjustments made to the employee's responsibilities without any change to employee's post (or position).</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="24px" fontWeight="bold" mb="10px">3. Term and Probation Period</Text>
                                            <Text mb="18px" fontSize="15px">a)  It is understood and agreed that the first 6 MONTH (180) days of employment shall constitute a probationary period (“Probationary Period”) during which period the Employer may, in its absolute discretion, terminate the Employee's employment, without assigning any reasons and without notice or cause.</Text>

                                        </Box>
                                    </VStack>
                                </Box>
                                <Box className="pdf-page page-break">
                                    <VStack width="95%" margin="auto" gap="1rem">
                                        <Box mt="2rem">
                                            <Text mb="18px" fontSize="15px">b)  After the end of the Probationary Period, the Employer may decide to confirm the Employment of the Employee, in its sole discretion.</Text>
                                            <Text mb="18px" fontSize="15px">c)  After the end of the Probationary Period, this Agreement may be terminated in accordance with Clause 12 of this Agreement.</Text>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px"> 4. Performance of Duties </Text>
                                                <Text mb="18px" fontSize="15px">a)  The Employee agrees that during the Employment Period, he/she shall devote his/her full business time to the business affairs of the Company and shall perform the duties assigned to him/her faithfully and efficiently, and shall endeavor, to the best of his/her abilities to achieve the goals and adhere to the parameters set by the Company. </Text>
                                                <Text mb="18px" fontSize="15px">b)  The Employee shall be responsible for:</Text>
                                                <Box ml="1rem">
                                                    <Text mb="18px" fontSize="15px">i.  Achieving the performance targets and measurable goals assigned by the Company from time to time. The Employee understands that his/her work will be evaluated based on defined performance indicators, and salary revisions, incentives, confirmation, or continued employment will depend on satisfactory performance.</Text>
                                                    <Text mb="18px" fontSize="15px">ii. Properly carrying out the duties and responsibilities related to his/her role, including timely completion of assigned tasks, maintaining quality standards, taking ownership of work, and contributing to the overall objectives of the department. These responsibilities shall form part of the Employee’s defined areas of responsibility.</Text>
                                                    <Text mb="18px" fontSize="15px">iii. Following all Company policies, rules, reporting systems, and Standard Operating Procedures (SOPs), and ensuring that all work is performed in accordance with the processes, guidelines, and ethical standards set by the Company from time to time.</Text>
                                                </Box>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  5.  Compensation </Text>
                                                <Text mb="18px" fontSize="15px">Subject to the following provisions of this Agreement, during the Employment Period, the Employee shall be compensated for his services as follows:</Text>
                                                <Text mb="18px" fontSize="15px">a) &nbsp;  The Employee shall receive an annual salary, payable in monthly or more frequent installments, as per the convenience of the Employer, an amount of {employee?.salary}/- per annum/ month, subject to such increases from time to time, as determined by the Employer. Such payments shall be subject to such normal statutory deductions by the Employer. </Text>
                                                <Text mb="18px" fontSize="15px">b) &nbsp; During the term of this Agreement, the Employee's salary shall be paid by means of bank transfer, cheque, or any other method convenient to the Employer, and consented to by the Employee.</Text>

                                            </Box>
                                        </Box>
                                    </VStack>
                                </Box>
                                <Box className="pdf-page page-break">
                                    <VStack width="95%" margin="auto" gap="1rem">
                                        <Box mt="3rem">
                                            <Text mb="14px">c) &nbsp; All reasonable expenses arising out of employment shall be reimbursed assuming that the same have been authorized prior to being incurred and with the provision of appropriate receipts.</Text>
                                            <Text fontSize="24px" fontWeight="bold" mb="10px">  6.	Obligations of the Employee</Text>
                                            <Text mb="14px">a) &nbsp; Upon execution of agreement, the Employee shall not engage in any sort of theft, fraud, misrepresentation or any other illegal act neither in the employment space nor outside the premise of employment. If he/she shall do so, the Company shall not be liable for such an act done at his own risk.</Text>
                                            <Text mb="14px">b) &nbsp; The Employee further promises to never engage in any theft of the Employer’s property or attempt to defraud the Employer in any manner.</Text>
                                            <Text mb="14px">c) &nbsp; The Employee shall always ensure that his/her conduct is in accordance with all the rules, regulations and policies of the Company as notified from time to time.</Text>
                                            <Text mb="14px">d) &nbsp; The Employee shall not take up part-time or full-time employment or consultation with any other party or be involved in any other business during the term of his/her employment with the Company.</Text>
                                            <Text mb="14px">e) &nbsp; The Employee shall always ensure that his/her conduct is in accordance with all the rules, regulations and policies of the Company as notified from time to time, including but not limited to Leave Policy and Sexual Harassment Policy.</Text>
                                            <Text mb="14px">f) &nbsp; The Employer hereby prohibits the Employee from engaging in any sexual harassment and the Employee promises to refrain from any form of sexual harassment during the course of employment in and around the premise of employment. If the Employee violates this term in the agreement, he shall be fully responsible for his/her actions and the Employer shall not be held responsible for any illegal acts committed at the discretion of the Employee.</Text>
                                            <Text mb="14px">g) &nbsp; If  an  employee  receives  any  goods  or  cash  from  any  distributor  or  dealer and  pays  the  goods  and cash is  not  credited  to  the  account  of    the     concerned dealer   or  distributor  &  company,  the  company  shall,  in  that  case  be entitled to  pay  the  employees  security  checks  by  putting  the  money  and   obtaining the  payment  of  the  distributor  and  will  be  entitled  to take all type of legal action file  a  case  against  Employee  in  the  court.</Text>

                                        </Box>
                                        <Box>
                                            <Text fontSize="24px" fontWeight="bold" mb="10px">  7. Leave Policy</Text>

                                            <Text mb="14px">a) &nbsp; The Employee is entitled to ____ (_12__) days of paid casual leaves in a year and ____(__4_)days of sick leave. In addition, the Employee will be entitled to _____ (__) public holidays mentioned under the Leave Policy of the Employer.</Text>

                                        </Box>
                                    </VStack>
                                </Box>
                                <Box className="pdf-page page-break">
                                    <VStack width="95%" margin="auto" gap="1rem">
                                        <Box mt="3rem">
                                            <Text mb="14px">b) &nbsp; The Employee may not carry forward or en cash any holiday to the next holiday year.</Text>
                                            <Text mb="14px">c) &nbsp; In the event that the Employee is absent from work due to sickness or injury, he/she will follow the Leave Policy and inform the designated person as soon as possible and will provide regular updates as to his/her recovery and as far as practicable will inform the designated person of the Employer of his/her expected date of return to work.</Text>

                                            <Text mb="14px">d) &nbsp; If the Employee is absent from work due to sickness or injury for more than three consecutive days he/she must submit to the Employer a self-certification form. If such absence lasts for more than seven consecutive days the Employee must obtain a medical certificate from his/her doctor and submit it to the employer.</Text>
                                            <Text mb="14px">e) &nbsp; For any period of absence due to sickness or injury the Employee will be paid statutory sick pay only, provided that he satisfies the relevant requirements. The Employee’s qualifying days for statutory sick pay purposes are Monday to Friday.</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="24px" fontWeight="bold" mb="10px">  8.	Assignment</Text>
                                            <Text mb="14px">a) &nbsp; The Employee acknowledges that any work including without limitation inventions, designs, ideas, concepts, drawings, working notes, artistic works that the Employee may individually or jointly conceive or develop during the term of Employment are “works made for hire” and to the fullest extent permitted by law, Employee shall assign, and does hereby assign, to the Employer all of Employee's right, title and interest in and to all Intellectual Property improved, developed, discovered or written in such works.</Text>
                                            <Text mb="14px">b) &nbsp; Employee shall, upon request of the Employer, execute, acknowledge, deliver and file any and all documents necessary or useful to vest in the Employer all of Employee's right, title and interest in and to all such matters.</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="24px" fontWeight="bold" mb="10px">  9.	Competing Businesses  </Text>
                                            <Text mb="14px"> During the Term of this Agreement and for a period of one (1) year after the termination of this Agreement, the Employee agrees not to engage in any employment, consulting, or other activity involving_______________ that competes with the business, proposed business or business interests of the Employer, without the Employer’s prior written consent. </Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="24px" fontWeight="bold" mb="10px">  10.	Confidentiality  </Text>
                                            <Text mb="14px">a) &nbsp; The Employee acknowledges that, in the course of performing and fulfilling his duties hereunder, </Text>

                                        </Box>
                                    </VStack>
                                </Box>
                                <Box className="pdf-page page-break">
                                    <VStack width="95%" margin="auto" gap="1rem">
                                        <Box mt="3rem">
                                            <Text mb="14px">he may have access to and be entrusted with confidential information concerning the present and contemplated financial status and activities of the Employer, the disclosure of any of which confidential information to the competitors of the Employer would be highly detrimental to the interests of the Employer.</Text>
                                            <Text mb="14px">b) &nbsp; The Employee further acknowledges and agrees that the right to maintain the confidentiality of trade secrets, source code, website information, business plans or client information or other confidential or proprietary information, for the purpose of enabling the other party such information constitutes a proprietary right which the Employer is entitled to protect.</Text>
                                            <Text mb="14px">c) &nbsp; Accordingly, the Employee covenants and agrees with the Employer that he will not, under any circumstance during the continuance of this agreement, disclose any such confidential information to any person, firm or corporation, nor shall he use the same, except as required in the normal course of his engagement hereunder, and even after the termination of employment, he shall not disclose or make use of the same or cause any of confidential information to be disclosed in any manner.</Text>
                                            <Text mb="14px">d) &nbsp; The Employer owns any intellectual property created by the Employee during the course of the employment, or in relation to a certain field, and he shall thereon have all the necessary rights to retain it. After termination of employment, Employee shall not impose any rights on the intellectual property created. Any source code, software or other intellectual property developed, including but not limited to website design or functionality that was created by the employee, during the course of employment under this Agreement, shall belong to the Employer.</Text>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  11.  Remedies </Text>
                                                <Text mb="18px" fontSize="15px">If at any time the Employee violates to a material extent any of the covenants or agreements set forth in paragraphs 6 and 9, the Company shall have the right to terminate all of its obligations to make further payments under this Agreement. The Employee acknowledges that the Company would be irreparably injured by a violation of paragraph 6 or 9 and agrees that the Company
                                                    shall be entitled to an injunction restraining the Employee from any actual or threatened breach of paragraph 6 or 9 or to any other appropriate equitable remedy without any bond or other security being required.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  12.  Amendment and Termination </Text>
                                                <Text mb="18px" fontSize="15px">a) In case the Employer terminates the employment without just cause, in which case the Employer shall provide the Employee with advance notice of termination or compensation in lieu of notice equal to 15 DAY (HALF) month(s).</Text>
                                            </Box>
                                        </Box>

                                    </VStack>
                                </Box>
                                <Box className="pdf-page page-break">
                                    <VStack width="95%" margin="auto" gap="1rem">
                                        <Box mt="3rem">
                                            <Box>
                                                <Text mb="18px" fontSize="15px">b) The Employee may terminate his employment at any time by providing the Employer with at least 30 DAYS (ONE) month(s) advance notice of his intention to resign.</Text>
                                                <Text mb="18px" fontSize="15px">c) The Employee may terminate on the last day of the month in which the date of the Employee’s death occurs; or the date on which the Company gives notice to the Employee if such termination is for Cause or Disability.</Text>
                                                <Text mb="18px" fontSize="15px">d) For purposes of this Agreement, "Cause" means the Employee's gross misconduct resulting in material damage to the Company, willful insubordination or disobedience, theft, fraud or dishonesty, willful damage or loss of Employer’s property, bribery and habitual lateness or absence, or any other willful and material breach of this Agreement.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  13.  Remedies </Text>
                                                <Text mb="18px" fontSize="15px">Following the termination of employment of the Employee by the Employer,
                                                    with or without cause, or the voluntary withdrawal by the Employee from the Employer, the  Employee shall,
                                                    for a period of three years following the said termination or voluntary  withdrawal, refrain from either directly
                                                    or indirectly soliciting or attempting to solicit the business of any client or customer of the Employer for his own
                                                    benefit or that of any third person or organization, and shall refrain from either directly or indirectly attempting
                                                    to obtain the withdrawal from the employment by the Employer of any other Employee of the Employer having regard to
                                                    the same geographic and temporal restrictions. The Employee shall not directly or indirectly divulge any financial information
                                                    relating to the Employer or any of its affiliates or clients to any person whatsoever.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  14.  Notices </Text>
                                                <Text mb="18px" fontSize="15px">a) Any notice required to be given hereunder shall be deemed to have been properly given if delivered personally or sent by pre-paid registered mail as follows: </Text>
                                                <Text mb="18px" fontSize="15px" ml="10px">•	To the Employee: ______________________________</Text>
                                                <Text mb="18px" fontSize="15px" ml="10px">•	To the Employer: ______________________________</Text>
                                                <Text mb="18px" fontSize="15px">b) And if sent by registered mail shall be deemed to have been received on the 4th business day of uninterrupted postal service following the date of mailing. Either party may change its address for notice at any time, by giving notice in writing to the other party pursuant to the provisions of this agreement.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  15. Non-Assignment </Text>
                                                <Text mb="18px" fontSize="15px">The interests of the Employee under this Agreement are not subject to the claims of his creditors and may not be voluntarily or involuntarily assigned, alienated or encumbered.</Text>
                                            </Box>
                                        </Box>
                                    </VStack>

                                </Box>
                                <Box className="pdf-page page-break">
                                    <VStack width="95%" margin="auto" gap="1rem">
                                        <Box mt="3rem">
                                          <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  16. Successors </Text>
                                                <Text mb="18px" fontSize="15px">This agreement shall be assigned by the Employer to any successor employer and be binding upon the successor employer. The Employer shall ensure that the successor employer shall continue the provisions of this agreement as if it were the original party of the first part.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  17. Indemnification </Text>
                                                <Text mb="18px" fontSize="15px">The Employee shall indemnify the employer against any and all expenses, including amounts paid upon judgments, counsel fees, environmental penalties and fines, and amounts paid in settlement (before or after suit is commenced), incurred by the employer in connection with his/her defense or settlement of any claim, action, suit or proceeding in which he/she is made a party or which may be asserted against his/her by reason of his/her employment or the performance of duties in this Agreement. Such indemnification shall be in addition to any other rights to which those indemnified may be entitled under any law, by-law, agreement, or otherwise.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">  18. Modification </Text>
                                                <Text mb="18px" fontSize="15px">Any modification of this Agreement or additional obligation assumed by either party in connection with this Agreement shall be binding only if evidenced in writing signed by each party or an authorized representative of each party.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">19. Severability</Text>
                                                <Text mb="18px" fontSize="15px">Each paragraph of this agreement shall be and remain separate from and independent of and severable from all and any other paragraphs herein except where otherwise indicated by the context of the agreement. The decision or declaration that one or more of the paragraphs are null and void shall have no effect on the remaining paragraphs of this agreement.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">20. Paragraph headings</Text>
                                                <Text mb="18px" fontSize="15px">The titles to the paragraphs of this Agreement are solely for the convenience of the parties and shall not be used to explain, modify, simplify, or aid in the interpretation of the provisions of this Agreement.</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">21. Applicable Law  and Jurisdiction</Text>
                                                <Text mb="18px" fontSize="15px">This Agreement shall be governed by and construed in accordance with the laws of _____, _______. Each party hereby irrevocably submits to the exclusive jurisdiction of the courts of ALWAR,_(RAJ.), for the adjudication of any dispute hereunder or in connection herewith.</Text>
                                            </Box>
                                           
                                        </Box>
                                    </VStack>
                                </Box>
                                <Box className="pdf-page page-break">
                                    <VStack width="95%" margin="auto" gap="1rem">
                                        <Box mt="3rem">
                                             <Box>
                                                <Text fontSize="24px" fontWeight="bold" mb="10px">22. Counterparts</Text>
                                                <Text mb="18px" fontSize="15px">The Agreement may be executed in two or more counterparts, any one of which shall be deemed the original without reference to the others.</Text>
                                                <Text mb="18px" fontSize="15px">IN WITNESS WHEREOF, the Employee has hereunto set his hand, and the Company has caused these presents to be executed in its name and on its behalf, all as of the day and year first above written.</Text>
                                            </Box>
                                            <Box>
                                              <HStack width="90%" justifyContent="space-between" marginTop="4rem">  <Text>____________________	</Text>
                                              <Text>___________________</Text>
                                              </HStack>
                                              <HStack width="80%" justifyContent="space-between" >
                                                <Text mb="18px" fontSize="15px" fontWeight="600" color="#3d3d3d">(Employee)</Text>
                                                <Text mb="18px" fontSize="15px" fontWeight="600" color="#3d3d3d">(The Employer)</Text>
                                              </HStack>
                                            </Box>
                                            <Box>
                                                <HStack width="93%" justifyContent="space-between">
                                                    <Text mb="18px" fontSize="15px">Name: _________________	</Text>
                                                    <Box>
                                                    <Text  fontSize="15px">Represented	By:</Text>
                                                    <Text mb="18px" fontSize="15px">
                                                        Designation: _________________
                                                    </Text>
                                                    </Box>
                                                </HStack>
                                            </Box>
                                        </Box>
                                    </VStack>
                                </Box>
                            </VStack>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                              <Button colorScheme="blue" onClick={handleDownloadPDF}>
                                Download PDF
                              </Button>
                            </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default EmpAgreementL