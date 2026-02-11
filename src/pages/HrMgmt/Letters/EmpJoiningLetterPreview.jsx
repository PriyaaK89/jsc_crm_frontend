import {
  Box,
  Button,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  VStack,
  Divider,
  Flex,
} from "@chakra-ui/react";
import React from "react";
import top_ele from "../../../assets/images/top_left_ele.png";
import bottom_ele from "../../../assets/images/bottom_right_ele.png";
import company_logo from "../../../assets/images/logo-removebg-preview.png";
import r_logo from "../../../assets/images/jamidara_logo.png";

import emailIcon from "../../../assets/images/email.png";
import webIcon from "../../../assets/images/web.png";
import { formatDate, formatTime } from "../../../components/common/helper";
import html2pdf from "html2pdf.js";

const EmpJoiningLetterPreview = ({ isOpen, onClose, employee, formData }) => {

  const basic = Number(formData?.basic) || 0;
  const houseRent = Number(formData?.house_rent) || 0;
  const medical = Number(formData?.medical) || 0;

  const monthlyGross = basic + houseRent + medical;
  const annualGross = monthlyGross * 12;

  const petrolRate = Number(formData?.petrol_per_km) || 0;
  const maxKm = Number(formData?.max_km) || 0;

   const handleDownloadPDF = () => {
      const element = document.getElementById("joining-letter-preview");
  
      html2pdf()
        .set({
          margin: 0,
          filename: `Offer_Letter_${employee?.name}.pdf`,
          image: { type: "jpeg", quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            windowWidth: 1200
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
          },
          pagebreak: { mode: ['css'] }
        })
  
        .from(element)
        .save();
  
    };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent maxW="791px">
          <ModalBody p="0">
            <Box id="joining-letter-preview" fontFamily="serif">
              <Box className="pdf-page">
                {/* Decorative Images */}
                <Image
                  src={top_ele}
                  position="absolute"
                  top="0"
                  left="0"
                  width="175px"
                />
                <Image
                  src={bottom_ele}
                  position="absolute"
                  bottom="0"
                  right="0"
                  width="175px"
                />

                {/* Header */}
                <VStack spacing={0} align="center" ml="1rem">
                  <HStack spacing={4} alignItems="baseline" mb="4px">
                    <Image src={company_logo} width="260px" />
                    <Image src={r_logo} width="120px" />
                  </HStack>

                  {/* <Text fontSize="12px" color="gray.600">
                             Corpo Add. : P.B. Road, R.N.B. District Haveri, Karnataka
                           </Text> */}
                  <VStack
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    gap="0px"
                    mt="14px">
                    <Text fontSize="18px" color="blue.700" fontWeight="bold">
                      Seeds Production & Marketing Company
                    </Text>
                    <Text fontSize="11px" color="green.800">
                      North zone Office Add.-73 GANESH NAGAR-2, MURLIPURA
                      JAIPUR, REG.OFFICE-105, NEMI CHAND MARKET ALWAR
                    </Text>
                  </VStack>

                  <Divider
                    borderColor="blue.600"
                    borderWidth="2px"
                    w="92%"
                    mt="10px"
                  />
                </VStack>

                <Box width="83%" marginLeft="3rem" className="letter-content">
                  <Image
                    src={r_logo}
                    alt="Round Logo"
                    className="watermark_img"
                  />
                  {/* Title */}
                  <Text
                    textAlign="center"
                    fontSize="22px"
                    fontWeight="bold"
                    color="#1A365D"
                    mt="25px"
                    mb="30px">
                    JOB JOINING LETTER
                  </Text>

                  {/* To Section */}
                  <Box mb="20px">
                    <HStack justifyContent="space-between">

                      <Text>{employee?.name}</Text>
                      <Text fontSize="14px">{formData?.date_of_issue}</Text>
                    </HStack>
                    <Text textTransform="capitalize">
                      {employee?.address_line1}
                    </Text>
                    <Text>
                      {employee?.city}, {employee?.state}, {employee?.pincode}
                    </Text>
                    <Text>{employee?.contact_no}</Text>
                  </Box>

                  {/* Body */}
                  <VStack align="flex-start" spacing={3}>
                    <Text>Dear {employee?.name},</Text>
                    <Text>
                      Further to the interview you had with us and subsequent to
                      your joining the company we have pleasure in offering you
                      appointment as {" "}
                      {employee?.job_role_name} in {" "}
                      {employee?.department_name} department in our organization.
                    </Text>
                    <Text>As per requirements of our organization, your appointment will be on the terms and conditions mentioned below.</Text>
                    <Text>Your appointment is effective from {formatDate(employee?.date_of_joining)} {formatTime(employee?.login_time)} based at H.Q.- {employee?.headquarter} ({employee?.state}), AREA - {formData?.area}.</Text>

                    <HStack>
                      <Text> <Text fontWeight="600" fontSize="18px">Salary:</Text> You will receive salary and benefits as detailed in the Annexure. </Text>
                    </HStack>
                    <HStack>
                      <Text>  <Text fontWeight="600" fontSize="18px">Probationary Period:</Text> Your appointment is subject to confirmation on satisfactory completion of probationary period. The duration is normally six months but may be reduced or increased at the discretion of the company. During the probationary period your engagement will be subject to termination at any time by without notice or salary.</Text>
                    </HStack>

                    {/* During Employment Section */}


                    <Text fontWeight="600" fontSize="18px">
                      During Employment with us:
                    </Text>

                    {/* Point A */}
                    <HStack align="flex-start">
                      <Text fontWeight="bold">a.</Text>
                      <Text fontSize="14px" textAlign="justify">
                        Your services may be transferred to other divisions / locations or associates
                        of our company, existing or to be formed in future or to any of our group
                        companies and you will abide by the company’s rules and regulations that may
                        be in force at the time of your appointment and also those that may be
                        promulgated from time to time thereafter.
                      </Text>
                    </HStack>

                  </VStack>
                </Box>
              </Box>

              {/* ================= PAGE 2 ================= */}
              <Box className="pdf-page page-break">
                {/* Decorative Images */}
                <Image
                  src={top_ele}
                  position="absolute"
                  top="0"
                  left="0"
                  width="175px"
                />

                <Image
                  src={bottom_ele}
                  position="absolute"
                  bottom="0"
                  right="0"
                  width="175px"
                />

                <VStack
                  align="flex-start"
                  spacing={4}
                  width="83%"
                  marginLeft="3.8rem"
                  className="letter-content">
                  <Image
                    src={r_logo}
                    alt="Round Logo"
                    className="watermark_img1"
                  />
                  <Text textAlign="center" mt="2rem" mb="2rem" width="84%">
                    CONTD:-2
                  </Text>

                  <HStack align="flex-start">
                    <Text fontWeight="bold">b.</Text>
                    <Text fontSize="14px" textAlign="justify">
                      You shall not engage yourself directly or indirectly, with or without
                      remuneration, on whole time or part time basis in any trade, occupation,
                      employment or calling other than that of the company. You shall not undertake
                      any activities which are contrary to or inconsistent either with the
                      company’s or with your duties and obligations as an employee of our
                      organization. You shall devote your whole time and attention to your duties
                      to promote the interest of the organization.
                    </Text>
                  </HStack>

                  {/* Point C */}
                  <HStack align="flex-start">
                    <Text fontWeight="bold">c.</Text>
                    <Text fontSize="14px" textAlign="justify">
                      You should inform us of any changes in your residential address and qualifications.
                    </Text>
                  </HStack>

                  {/* Point D */}
                  <HStack align="flex-start">
                    <Text fontWeight="bold">d.</Text>
                    <Text fontSize="14px" textAlign="justify">
                      Your salary increment will depend upon your performance during the year and
                      shall not be automatic. You may earn higher increment through outstanding
                      performance and no increment may be given in the case of unsatisfactory
                      performance.
                    </Text>
                  </HStack>

                  {/* Point E */}
                  <HStack align="flex-start">
                    <Text fontWeight="bold">e.</Text>
                    <Text fontSize="14px" textAlign="justify">
                      After your confirmation your service may be terminated at any time by giving
                      one month’s notice in writing by either side. You shall not proceed on leave
                      during the notice period.
                    </Text>
                  </HStack>

                  {/* Additional Paragraphs */}
                  <Text fontSize="14px" textAlign="justify">
                    In case you resign from the services of the company by giving one month’s
                    notice, the company shall have the right to accept the notice forthwith and
                    relieve you from service without payment for the unexpired period of notice.
                  </Text>

                  <Text fontSize="14px" textAlign="justify">
                    No notice of resignation will be effective if it is given during the leave
                    period and you shall not be entitled to proceed on leave during the notice period.
                  </Text>

                  <Text fontSize="14px" textAlign="justify">
                    While leaving the service, you shall hand over charge to a person nominated
                    by the company. Settlement of your account will be made upon your duly handing
                    over such charge.
                  </Text>

                  <Text fontSize="14px" textAlign="justify">
                    If at any time you are found guilty of dishonesty, disobedience, negligence,
                    absence from duty without permission, or any misconduct considered detrimental
                    to our interest or violation of one or more terms of this letter, your services
                    may be terminated in accordance with law.
                  </Text>

                  <Text fontSize="14px" textAlign="justify">
                    You will also be subject at all times to the service rules and regulations of
                    the company applicable to employees of your status as are in force at present
                    or shall come into force from time to time.
                  </Text>

                  <Text fontSize="14px" textAlign="justify">
                    You are forbidden to make any unauthorized disclosure of any official
                    information pertaining to the company’s operations or its employees while in
                    service or even thereafter. You shall have to sign a confidentiality agreement
                    to this effect after joining the company.
                  </Text>

                  <Text>Your date of birth as confirmed by you is {formatDate(employee?.date_of_birth)} and
                    you will retire on attaining the age of 58 years. The company, however, reserves the right
                    to modify and amend the retirement policy and age.</Text>
                </VStack>
              </Box>

              <Box className="pdf-page page-break">
                {/* Decorative Images */}
                <Image src={top_ele} position="absolute" top="0" left="0" width="175px" />
                <Image src={bottom_ele} position="absolute" bottom="0" right="0" width="175px" />

                <VStack
                  align="flex-start"
                  spacing={4}
                  width="83%"
                  marginLeft="3.8rem"
                  className="letter-content">
                  <Image
                    src={r_logo}
                    alt="Round Logo"
                    className="watermark_img1"
                  />
                  <Text textAlign="center" mt="2rem" mb="2rem" width="84%">
                    CONTD:-3
                  </Text>

                  <HStack align="flex-start">

                    <Text fontSize="14px" textAlign="justify">   <Text fontWeight="600" fontSize="18px">Other Terms and Conditions: </Text>
                      It should be understood that all information pertaining
                      to hour pay roll is strictly confidential and  as such , you are requested not to
                      disclose or discuss any information relating to your /others salary or perks either
                      with your colleagues or any other person directly or indirectly connected with the
                      company .
                    </Text>
                  </HStack>
                  <Text>You will be responsible for the safe custody of all company property, keeping and returning it in good condition, and maintaining it properly at all times. <br />
                    You have indicated your interest in working for a long time with our company, and we welcome you on the basis of such long-term interest. I assure you of full support from the management in pursuing the objectives of the company sincerely and constructively. <br />
                    This appointment is offered on the basis of the information furnished by you. If at any time it is found that the employment has been obtained by furnishing misleading or insufficient information, or by withholding material information, the company will be free to terminate your services at any time without any notice. <br />
                    If any cash payment is received by you from any distributor and such payment is not deposited into the company’s account, the company will take legal action against you. Your entire salary payment will be stopped in such a case.</Text>



                  {/* Point E */}
                  <HStack align="flex-start">

                    <Text fontSize="14px" textAlign="justify"><Text fontWeight="600" fontSize="18px">Other Allowances:</Text>
                      No other allowances will be applicable other than your salary Anx. For travelling expenses you will be informed separately as per the norms of the company.
                    </Text>
                  </HStack>
                  <Text>Please acknowledge and return us the duplicate copy of this letter in token of your acceptance of the above terms and condition of employment. <br />
                    I wish you a successful tenure in the company and advise you to be devoted and sincere in your duties.
                  </Text>
                  <Text mt="30px" fontWeight="bold">
                    HR Department,
                    <br />
                    Jamidara Seeds Corporation
                  </Text>

                  <VStack spacing={0} alignItems="flex-start">
                    <Text>{formData?.appoint_under_name}</Text>
                    <Text>{formData?.job_role_name},{formData?.appointer_state}</Text>
                  </VStack>



                </VStack>

              </Box>
              <Box className="pdf-page page-break">
                {/* Decorative Images */}
                <Image src={top_ele} position="absolute" top="0" left="0" width="175px" />
                <Image src={bottom_ele} position="absolute" bottom="0" right="0" width="175px" />

                <VStack
                  align="flex-start"
                  spacing={4}
                  width="83%"
                  marginLeft="3.8rem"
                  className="letter-content">
                  <Image
                    src={r_logo}
                    alt="Round Logo"
                    className="watermark_img1"
                  />
                  <Text textAlign="center" mt="2rem" mb="2rem" width="84%">
                    CONTD:-3
                  </Text>



                  <Box mt="0rem" width="100%">
                    <Text fontSize="20px" fontWeight="bold" textAlign="center" mb="12px">
                      Salary Annexure
                    </Text>

                    <Text mb="1rem">
                      Fixed Annual Compensation For - <b>{employee?.name}</b>
                    </Text>

                    <Box border="1px solid black">
                      {/* Header Row */}
                      <Flex borderBottom="1px solid black">
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          <b>Particulars</b>
                        </Box>
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          <b>Monthly (₹)</b>
                        </Box>
                        <Box flex="1" p="10px">
                          <b>Annual (₹)</b>
                        </Box>
                      </Flex>

                      {/* Basic */}
                      <Flex borderBottom="1px solid black">
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          Basic
                        </Box>
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          {basic}/-
                        </Box>
                        <Box flex="1" p="10px">
                          {basic * 12}/-
                        </Box>
                      </Flex>

                      {/* House Rent */}
                      <Flex borderBottom="1px solid black">
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          House Rent
                        </Box>
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          {houseRent}/-
                        </Box>
                        <Box flex="1" p="10px">
                          {houseRent * 12}/-
                        </Box>
                      </Flex>

                      {/* Medical */}
                      <Flex borderBottom="1px solid black">
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          Medical Reimbursement
                        </Box>
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          {medical}/-
                        </Box>
                        <Box flex="1" p="10px">
                          {medical * 12}/-
                        </Box>
                      </Flex>

                      {/* Gross Total */}
                      <Flex>
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          <b>Gross Total</b>
                        </Box>
                        <Box flex="1" p="10px" borderRight="1px solid black">
                          <b>{monthlyGross}/-</b>
                        </Box>
                        <Box flex="1" p="10px">
                          <b>{annualGross}/-</b>
                        </Box>
                      </Flex>
                    </Box>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">  Daily Allowance will be on variable basis. <br />
                      TRAVELING ALLOWANCE/DAILY ALLOWANCE/OUT STATION BOARDING AND/LODGING(NIGHT HAULT) POLICY.</Text>

                  </Box>
                  <Flex border="1px solid black" width="100%">
                    <Box flex="1" p="6px" borderRight="1px solid black" fontWeight="bold" textAlign='center'>
                      PETROL PER / K.M.
                    </Box>

                    <Box flex="1" p="6px" borderRight="1px solid black" textAlign='center'>
                      ₹ {petrolRate} or Public Transport
                    </Box>

                    <Box flex="1" p="6px" borderRight="1px solid black" textAlign='center'>
                      {maxKm} K.M. MAX.
                    </Box>

                  </Flex>

                  <Box mt="2rem">

  <Text fontWeight="bold" textDecoration="underline" mb="1rem">
    Note:
  </Text>

  <VStack align="flex-start" spacing={3} pl="1rem">

    <Text>
      1):- In case of boarding (FOOD) Bill are required. Shall be paid up to maximum limits specified.
    </Text>

    <Text>
      2):- In case of LODGING (Hotel) claims are settled at actual (or) up to limits specified,{" "}
      <Text as="span" textDecoration="underline" fontWeight="bold">
        which ever is less.
      </Text>{" "}
      Claims shall not be settled without bills.
    </Text>

    <Text>
      3):- In case of TRAVLE claims are settled{" "}
      <Text as="span" textDecoration="underline" fontWeight="bold">
        only on submission of counter foils of TRAIN / BUS TICKETS.
      </Text>
    </Text>

  </VStack>
</Box>


                </VStack>
                <VStack
                  alignItems="flex-start"
                  mt="20rem"
                  spacing="4px"
                  width="81%"
                  ml="-2.5rem" position="absolute" bottom="75px">
                  <Divider
                    borderColor="blue.600"
                    borderWidth="1px"
                    w="100%"
                    mt="1rem"
                  />
                  <Divider
                    borderColor="blue.300"
                    borderWidth="2px"
                    w="90%"
                    mt="0px"
                  />
                  <Flex ml="1rem" gap="1rem" mt="2px">
                    <Flex alignItems="center" gap="8px">
                      <Image src={emailIcon} width="24px" mt="12px" />
                      <Text fontSize="14px">
                        jamidaraseedscorporation@gmail.com
                      </Text>
                    </Flex>
                    <Flex alignItems="center" gap="8px">
                      <Image src={webIcon} width="24px" mt="12px" />
                      <Text fontSize="14px">www.jamidaraseeds.com</Text>
                    </Flex>
                  </Flex>
                </VStack>
              </Box>
            </Box>
            <VStack mb='1rem'>
              <Button colorScheme="blue" onClick={handleDownloadPDF}>Download Joining Letter</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmpJoiningLetterPreview;
