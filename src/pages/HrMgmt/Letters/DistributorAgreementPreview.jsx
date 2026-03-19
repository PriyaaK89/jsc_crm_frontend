import {
  Box,
  Button,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  VStack,
  Divider,
  Flex,
  Table,
  Tbody,
  Tr,
  Td,
  Checkbox,
  Grid,
  GridItem,
  CloseButton,
  useToast
} from "@chakra-ui/react";
import React from "react";
import bottom_ele from "../../../assets/images/bottom_right_ele.png";
import toprightcorner from '../../../assets/images/toprightcornerimg.png';
import bottomleft_img from '../../../assets/images/bottomleftlogoimg.png';
// import bootomleft from '../../../assets/images/'
import companyleft_logo from '../../../assets/images/jamidara_logo.png'
import companyright_logo from "../../../assets/images/jamidara_seeds_logo (1).png"
import r_logo from "../../../assets/images/jamidara_logo.png";
import { formatDate } from "../../../components/common/helper";
import jsPDF from "jspdf";
import { toJpeg } from "html-to-image";

const DistributorAgreementPreview = ({ isOpen, onClose, formData }) => {
  const toast = useToast();

  const handleDownloadPDF = async () => {
    try {
      const pages = document.querySelectorAll(".pdf-page");
      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < pages.length; i++) {
        const dataUrl = await toJpeg(pages[i], { quality: 0.8, pixelRatio: 2 });
        const pdfWidth = 210;
        const pdfHeight = 297; 

        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }
      pdf.save(`Distributor_Agreement_${formData?.firm_name || "Form"}.pdf`);
    } catch (error) {
      toast({ description: "Error generating PDF", status: "error" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent maxW="850px" bg="gray.100">
        <ModalBody p="0">
          <Flex justifyContent="flex-end" p={2} bg="white">
            <CloseButton onClick={onClose} />
          </Flex>

          <Box id="distributor-agreement-content" bg="white" shadow="xl" borderTop="1px solid #e8e2e2">
            {/* PAGE 1: COVER / HEADER */}
            <Box className="pdf-page page-break disagr" >
              <Image src={toprightcorner} position="absolute" top="0" right="0" w="500px" marginRight="-30px" marginTop="-8px" />
              <VStack spacing={6} mt="150px" align="center">
                <Flex position="absolute" top="300" left="100" >
                <Image src={companyleft_logo} width="200px" />
                 <Image src={companyright_logo} width="430px" />
                </Flex>
                 
                <Box   w="80%" textAlign="center" position="absolute" top="500" >
                    <Text fontSize="40px" fontWeight="bold">An ISO 9001:2008 Certified Company</Text>
                  <Text fontSize="50px" fontWeight="black"   letterSpacing="1px" color="#08750f">DISTRIBUTOR </Text>
                  <Text fontSize="50px" fontWeight="black" letterSpacing="1px" color="#083d15">AGREEMENT FORM</Text>
                </Box>
              </VStack>
              <Image src={bottomleft_img} position="absolute" bottom="0" left="0" w="500px" marginLeft="0px" marginBottom="0px" />
            </Box>

            {/* PAGE 2: FIRM DETAILS */}
          <Box
  className="pdf-page page-break"

  bg="white"
  fontFamily="serif"
  fontSize="13px"
  color="black"
>
  <VStack align="stretch" spacing={3} h="100%">

    {/* HEADER */}
    <HStack align="center" spacing={4}>
      <Image src={r_logo} w="110px" />

      <VStack spacing={1} align="center" w="100%" color="#3f5f3f">
        <Text fontSize="18px" fontWeight="bold">
          AN ISO 9001:2008 CERTIFIED COMPANY
        </Text>

        <Text fontSize="33px" fontWeight="bold" letterSpacing="1px">
          JAMIDARA SEEDS CORPORATION
        </Text>

        <Text fontSize="16px" fontWeight="bold">
          Cor. Add : P.B. Road, Ranebennur, District Haveri, Karnataka - 581115
        </Text>

        <Text fontSize="15px" fontWeight="bold" >
          73, Ganesh Nagar - 2, Murli Pura Jaipur Rajasthan
        </Text>
      </VStack>
    </HStack>

    {/* DESCRIPTION */}
    <Text textAlign="center" mt={2} fontSize="13px" w="70%" marginLeft="150px">
      In order to smoothes services and correspondence we request you to kindly
      spare valuable time in furnishing of your organization in given format.
    </Text>

    {/* BRANCH */}
    <HStack mt={7} textAlign="center" w="300px" ml="180px">
      <Text w="80px">BRANCH:</Text>
      <Box borderBottom="1px solid black" flex="1" w="50px" ><Text>{formData?.firm_name}</Text></Box>
    </HStack>

    {/* NAME OF FIRM */}
    <HStack align="flex-start" mt={5} >
      <Text w="250px">
        NAME OF THE FIRM WITH <br /> COMPLETE BUSINESS ADDRESS
      </Text>
      <VStack flex="1" spacing={6}>
        <Box borderBottom="1px solid black" w="100%" >{formData?.business_address}
          {formData?.firm_type}
        </Box>
        <Box borderBottom="1px solid black" w="100%" />
        <Box borderBottom="1px solid black" w="100%" />
      </VStack>
    </HStack>

    {/* DETAILS */}
    <HStack align="flex-start" mt={5}>
      <Text w="250px">
        DETAIL OF THE PRO. PARTNERS DIRECTORS <br />
        WITH COMPLETE RESI. ADDRESS
      </Text>
      <VStack flex="1" spacing={6}>
        <Box borderBottom="1px solid black" w="100%" />
        <Box borderBottom="1px solid black" w="100%" />
      </VStack>
    </HStack>

    {/* CONTACT */}
    <HStack align="flex-start">
      <Text w="250px">HONE NOS. E-MAIL ID</Text>
      <VStack flex="1" spacing={3}>
        <Box borderBottom="1px solid black" w="100%" />
        <HStack w="100%">
          <Text>LAND MARK</Text>
          <Box borderBottom="1px solid black" flex="1" />
        </HStack>
        <HStack w="100%">
          <Text>DISTT.</Text>
          <Box borderBottom="1px solid black" flex="1" />
          <Text>PIN CODE</Text>
          <Box borderBottom="1px solid black" flex="1" />
        </HStack>
      </VStack>
    </HStack>

    {/* RESPONSIBLE PERSON */}
    <HStack align="flex-start">
      <Text w="250px">
        RESPONSIBLE/CONTACT PERSON <br />
        WITH ADDRESS PHONE NOS.
      </Text>
      <VStack flex="1" spacing={3}>
        <Box borderBottom="1px solid black" w="100%" />
        <Box borderBottom="1px solid black" w="100%" />
        <Box borderBottom="1px solid black" w="100%" />
      </VStack>
    </HStack>

    {/* GST */}
    <HStack>
      <Text w="250px">GST NO. OF FIRM</Text>
      <Box borderBottom="1px solid black" flex="1" />
    </HStack>

    {/* PAN */}
    <HStack>
      <Text w="250px">PAN OF THE FIRM/PROPRITOR</Text>
      <Box borderBottom="1px solid black" flex="1" />
    </HStack>

    {/* LICENSE */}
    <HStack>
      <Text w="250px">SEED LICENCE NO./VALIDITY</Text>
      <Box borderBottom="1px solid black" flex="1" />
    </HStack>

    {/* STRUCTURE */}
    <HStack>
      <Text w="250px">ORGANISATION STRUCTURE</Text>
      <Box borderBottom="1px solid black" flex="1" />
    </HStack>

    {/* CHECKBOX */}
    <HStack spacing={6} pl="250px">
      <HStack>
        <Text>SOLI PROPRIETOR</Text>
        <Box border="1px solid black" w="14px" h="14px" />
      </HStack>

      <HStack>
        <Text>PARTNERSHIP</Text>
        <Box border="1px solid black" w="14px" h="14px" />
      </HStack>
    </HStack>

    {/* FOOTER */}
    <Text
      mt="auto"
      textAlign="center"
      fontSize="12px"
    >
      (Specimen Signature (s) of proprietor Partner(s))
    </Text>

  </VStack>
</Box>

            {/* PAGE 3: LICENSES & BANKING */}
            <Box className="pdf-page page-break" w="210mm" h="297mm" p="20mm">
                <VStack align="stretch" spacing={5} fontSize="14px">
                    <Text><b>FERTILIZER LICENCE:</b> {formData?.fert_licence}</Text>
                    <Text><b>PESTICIDE LICENCE:</b> {formData?.pest_licence}</Text>
                    <Text><b>NAME OF TRANSPORTS:</b> A) {formData?.transport_a} B) {formData?.transport_b}</Text>
                    <HStack>
                        <Text><b>BANK NAME:</b> {formData?.bank_name}</Text>
                        <Text ml={10}><b>A/C NO:</b> {formData?.account_no}</Text>
                    </HStack>
                    
                    <Text fontWeight="bold" mt={4}>OTHER COMPANIES DEALING:</Text>
                    <Table variant="simple" size="sm" border="1px solid black">
                        <Tbody>
                            <Tr fontStyle="bold"><Td border="1px solid black">S.No</Td><Td border="1px solid black">Company Name</Td><Td border="1px solid black">Turnover</Td></Tr>
                            <Tr><Td border="1px solid black">1</Td><Td border="1px solid black">{formData?.comp1_name}</Td><Td border="1px solid black">{formData?.comp1_val}</Td></Tr>
                            <Tr><Td border="1px solid black">2</Td><Td border="1px solid black">{formData?.comp2_name}</Td><Td border="1px solid black">{formData?.comp2_val}</Td></Tr>
                        </Tbody>
                    </Table>
                </VStack>
            </Box>

            {/* PAGE 4: DOCUMENT CHECKLIST */}
            <Box className="pdf-page" w="210mm" h="297mm" p="20mm">
                <Text fontWeight="bold" fontSize="18px" mb={4}>REQUIRED DOCUMENTS (PHOTOCOPIES):</Text>
                <VStack align="flex-start" spacing={2} fontSize="14px">
                    <Text>1. Seeds Licence of the Firm.</Text>
                    <Text>2. Pan Card of Firm/Proprietor.</Text>
                    <Text>3. Aadhar Card of all Partners.</Text>
                    <Text>4. Partnership Agreement (if applicable).</Text>
                    <Text>5. GST Registration Certificate.</Text>
                    <Text>6. Letter Head of the Firm.</Text>
                </VStack>

                <Box mt="100px" p={5} border="1px solid black" bg="gray.50">
                    <Text fontWeight="bold">FOR OFFICE USE ONLY:</Text>
                    <HStack mt={4} justifyContent="space-between">
                        <Text>Proposed Credit Limit: ________</Text>
                        <Text>Final Credit Limit: ________</Text>
                    </HStack>
                    <Text mt={10}>Authorised Signatory: ____________________</Text>
                </Box>
            </Box>
          </Box>

          <Flex p={4} justifyContent="center" bg="white" borderTop="1px solid #eee">
            <Button onClick={onClose} mr={3}>Cancel</Button>
            <Button colorScheme="green" onClick={handleDownloadPDF}>Download Agreement PDF</Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DistributorAgreementPreview;