import { Box, Button, HStack, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Text, VStack, Divider, Flex } from "@chakra-ui/react";
import html2pdf from "html2pdf.js";
import top_ele from "../../../assets/images/top_left_ele.png";
import bottom_ele from "../../../assets/images/bottom_right_ele.png";
import company_logo from "../../../assets/images/logo-removebg-preview.png";
import r_logo from "../../../assets/images/jamidara_logo.png";
import { formatDate } from "../../../components/common/helper";
import emailIcon from "../../../assets/images/email.png";
import webIcon from "../../../assets/images/web.png";


const OfferLetterPreviewModal = ({ isOpen, onClose, employee, formData, }) => {

  const handleDownloadPDF = () => {
    const element = document.getElementById("offer-letter-preview");

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
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent maxW="791px">
        <ModalBody p="0">
          <Box id="offer-letter-preview" fontFamily="serif">

            {/* ================= PAGE 1 ================= */}
            <Box className="pdf-page" >

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
                <Text fontSize="12px" color="green.800">North zone Office Add.-73 GANESH NAGAR-2, MURLIPURA JAIPUR, REG.OFFICE-105, NEMI CHAND MARKET ALWAR</Text>

                <Divider borderColor="blue.600" borderWidth="2px" w="92%" mt="1rem" />
              </VStack>

              <Box width="89%" marginLeft="3rem" className="letter-content">
                <Image src={r_logo} alt="Round Logo" className="watermark_img" />
                {/* Title */}
                <Text
                  textAlign="center"
                  fontSize="28px"
                  fontWeight="bold"
                  color="#1A365D"
                  mt="25px"
                  mb="30px"
                >
                  JOB OFFER LETTER
                </Text>

                {/* To Section */}
                <Box mb="20px">
                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold">To:</Text>
                    <Text fontSize="14px">{formData?.date_of_issue}</Text>
                  </HStack>
                  <Text>{employee?.name}</Text>
                  <Text textTransform="capitalize">{employee?.address_line1}</Text>
                  <Text>
                    {employee?.city}, {employee?.state}, {employee?.pincode}
                  </Text>
                  <Text>{employee.contact_no}</Text>
                </Box>

                {/* Body */}
                <VStack align="flex-start" spacing={3}>
                  <Text>Dear {employee?.name},</Text>

                  <Text>
                    Further to your application and personal discussions with us, we are
                    pleased to offer you employment with us as {employee?.job_role_name} in
                    {employee?.department_name} department. You will be based at{" "}
                    {formData?.emp_state || employee?.state}.
                  </Text>

                  <Text>Area – {employee?.area}</Text>
                  <Text>H.Q. – {employee?.headquarter}</Text>

                  <Text>You will receive salary and benefits as detailed in the Annexure.</Text>

                  <Text>
                    This appointment will be effective from the date of your joining on or
                    before {formatDate(employee?.date_of_joining)}.
                  </Text>

                  <Text>
                    Kindly bring the following documents at the time of joining:
                  </Text>

                  <Box ml="1.5rem">
                    <Text>• &nbsp; Previous organization salary slip (if applicable).</Text>
                    <Text>• &nbsp; Educational qualification certificates.</Text>
                    <Text>• &nbsp; Professional experience certificates.</Text>
                    <Text>• &nbsp; Two passport size photographs.</Text>
                    <Text>• &nbsp; Copy of PAN / Aadhaar / DL / Voter ID.</Text>
                    <Text>• &nbsp; Bank passbook copy.</Text>
                  </Box>
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

              <VStack align="flex-start" spacing={4} width="89%" marginLeft="4rem" className="letter-content">
                <Image src={r_logo} alt="Round Logo" className="watermark_img1" />
                <Text textAlign="center" mt="2rem" mb="2rem" width="89%">CONTD:-2</Text>
                <Text>
                  After checking the above documents, we will return the originals to you.
                </Text>

                <Text>
                  A detailed appointment letter with salary breakup and service conditions
                  will be issued upon joining.
                </Text>

                <Text>
                  Please confirm your acceptance and joining date before the mentioned date,
                  failing which this offer will stand cancelled.
                </Text>

                <Text>
                  Welcome to <strong>Jamidara Seeds Corporation</strong>.
                </Text>

                <Text fontWeight="bold" mt="10px">
                  Other Terms
                </Text>

                <Text>
                  As per company norms your salary package is Rs. {employee?.salary} per annum with incentives.
                </Text>

                <Text textDecoration="underline" fontWeight="bold">{formData?.salary_norms}</Text>
                <Text textDecoration="underline" fontWeight="bold">{formData?.salary_norms1}</Text>

                <Text>
                  Kindly send your salary slip, bank statement and two reference numbers.
                </Text>

                <Text>{formData?.sales_target}</Text>

                {/* Footer */}
                <Box mt="60px">
                  <Text>Warm Regards,</Text>
                  <Text mt="30px" fontWeight="bold">
                    HR Department,
                    <br />
                    Jamidara Seeds Corporation
                  </Text>
                </Box>
              </VStack>
              <VStack alignItems="flex-start" mt="20rem" spacing="4px" width="81%" ml="-2.5rem">
                <Divider borderColor="blue.600" borderWidth="1px" w="100%" mt="1rem" />
                <Divider borderColor="blue.300" borderWidth="2px" w="90%" mt="0px" />
                <Flex ml="1rem" gap="1rem" mt="2px">
                  <Flex alignItems="center" gap="8px" ><Image src={emailIcon} width="24px" mt="12px" /><Text fontSize="14px">jamidaraseedscorporation@gmail.com</Text></Flex>
                  <Flex alignItems="center" gap="8px"><Image src={webIcon} width="24px" mt="12px" /><Text fontSize="14px">www.jamidaraseeds.com</Text></Flex>
                </Flex>
              </VStack>
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
