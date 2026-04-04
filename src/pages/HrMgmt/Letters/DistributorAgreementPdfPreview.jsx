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
import { CheckIcon } from "@chakra-ui/icons";
import React from "react";
// import bottom_ele from "../../../assets/images/bottom_right_ele.png";
import toprightcorner from '../../../assets/images/toprightcornerimg.png';
import bottomleft_img from '../../../assets/images/bottomleftlogoimg.png';
// import bootomleft from '../../../assets/images/';
import companyleft_logo from '../../../assets/images/jamidara_logo.png'
import companyright_logo from "../../../assets/images/jamidara_seeds_logo (1).png"
import r_logo from "../../../assets/images/jamidara_logo.png";
// import { formatDate } from "../../../components/common/helper";
import jsPDF from "jspdf";
import { toJpeg } from "html-to-image";

const DistributorAgreementPdfPreview = ({ isOpen, onClose, formData, partners, ownerAddress, otherCompanies }) => {

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

  // formate date 
  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
 
  const partner1 = partners?.[0] || {}; 

  const getPanAadharDetails = (formData, partner1, ownerAddress) => {
  const pan =
    formData?.firm_pan?.trim() || partner1?.pan_no?.trim() || ownerAddress?.pan_no?.trim() || "";

  const aadhar =
    formData?.firm_aadhar?.trim() || partner1?.aadhar_no?.trim() || ownerAddress?.aadhar_no?.trim() || "";

  return { pan, aadhar };
};
const { pan, aadhar } = getPanAadharDetails(formData, partner1,ownerAddress);


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
              <Image src={toprightcorner} position="absolute" top="0" right="0" w="350px" marginRight="-30px" marginTop="-8px" />
              <VStack spacing={6} mt="150px" align="center">
                <Flex position="absolute" top="300" left="100" >
                  <Image src={companyleft_logo} width="200px" />
                  <Image src={companyright_logo} width="490px" />
                </Flex>

                <Box w="100%" textAlign="center" position="absolute" top="500" >
                  <Text fontSize="40px" fontWeight="bold" mt={7}>An ISO 9001:2008 Certified Company</Text>
                  <Text fontSize="50px" fontWeight="black" letterSpacing="1px" color="#08750f" mt={6}>DISTRIBUTORSHIP </Text>
                  <Text fontSize="50px" fontWeight="black" letterSpacing="1px" color="#083d15">AGREEMENT </Text>
                </Box>
              </VStack>
              <Image src={bottomleft_img} position="absolute" bottom="0" left="0" w="350px" marginLeft="0px" marginBottom="0px" />
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
                <HStack mt={5}  >
                  <Text w="250px">BRANCH:</Text>
                  <Box borderBottom="1px solid black" w="410px" mt={3} textTransform="uppercase"><strong> {formData?.branch}</strong></Box>
                </HStack>

                {/* NAME OF FIRM */}
                <HStack align="flex-start" mt={3} >
                  <Text w="250px" mt={4}>
                    NAME OF THE FIRM WITH <br /> COMPLETE BUSINESS ADDRESS
                  </Text>
                  
                  <VStack flex="1" spacing={4} align="stretch">
                    <Box borderBottom="1px solid black" w="410px"
                      textTransform="uppercase"><strong> {formData?.firm_name} </strong>
                    </Box>

                    <Box borderBottom="1px solid black" w="410px"
                      textTransform="uppercase"><strong> {formData?.business_address}  {formData?.state}  {formData?.tehsil && `Teh: ${formData.tehsil}`}  {formData?.district && `Dist: ${formData.district}`}  {formData?.pincode && `Pincode: ${formData.pincode}`} </strong>

                    </Box>
                      </VStack>
                </HStack>
                <HStack align="flex-start" mt={3} >
                <Text w="250px">
                   LANDMARK:
                  </Text>  

                    <Box borderBottom="1px solid black" w="410px"
                      textTransform="uppercase">
                       
                       <strong> {formData?.landmark && formData.landmark} </strong>

                    </Box>

         </HStack>
                

                {/* partner/ solo pro details */}
                <HStack align="flex-start" mt={4} spacing={4}>

                  {/* LEFT MAIN HEADING */}


                  {/*  RIGHT SIDE CONTENT */}
                  <VStack flex="1" spacing={4} align="stretch">

                    {/* Proprietorship */}
                    {formData?.firm_type === "proprietorship" && (
                      <HStack align="flex-start">
                        <Text w="260px" mt={3}>
                          DETAIL OF THE PRO. PARTNERS DIRECTORS <br />
                          WITH COMPLETE RESI. ADDRESS
                        </Text>

                        <Box borderBottom="1px solid black" flex="1" mt={3} textTransform="uppercase">
                       <strong> {[
                            ownerAddress?.name,
                            ownerAddress?.address,
                            ownerAddress?.state,
                            ownerAddress?.tehsil && `Teh: ${ownerAddress.tehsil}`,
                            ownerAddress?.district && `Dist: ${ownerAddress.district}`,
                            ownerAddress?.pincode && `Pincode: ${ownerAddress.pincode}`,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                            </strong>  
                        </Box>
                      </HStack>
                    )}

                    {/*  Partnership */}
                    {formData?.firm_type === "partnership" &&
                      partners.map((partner, index) => (
                        <HStack key={index} align="flex-start">

                          {/*  LEFT SIDE (Partner Label) */}
                          <Text w="260px" >
                            DETAIL OF THE PRO. PARTNER {index + 1} <br />
                            WITH COMPLETE RESI. ADDRESS :
                          </Text>

                          {/*  RIGHT SIDE (Address) */}
                          <Box borderBottom="1px solid black" flex="1" mt={2} textTransform="uppercase">
                       <strong>    {[
                              partner?.address,
                              partner?.state,
                              partner?.tehsil && `Teh: ${partner.tehsil}`,
                              partner?.district && `Dist: ${partner.district}`,
                              partner?.pincode && `Pincode: ${partner.pincode}`,
                            ]
                              .filter(Boolean)
                              .join(", ")} </strong> 
                          </Box>

                        </HStack>
                      ))}

                  </VStack>
                </HStack>


                {/* hones emil and phone no  */}


                <HStack align="flex-start" mt={4} spacing={4}>
                  <Text w="250px">
                    HONE NOS. E-MAIL ID :
                  </Text>
                  <VStack flex="1" spacing={3}>
                    <Box borderBottom="1px solid black" w="100%" >
                    Email:<strong> {formData?.firm_email} </strong>
                    </Box>

                    {/* ❌ NO BORDER HERE */}
                    <Box w="100%" borderBottom="1px solid black" textTransform="uppercase">
                      LANDMARK: <strong> {formData?.landmark} </strong>
                    </Box>

                    <Box borderBottom="1px solid black" w="100%" display="flex" textTransform="uppercase">
                      <Box w="70%"> DIST: <strong> {formData?.district}</strong></Box> <Box w="40%">Pincode: <strong> {formData?.pincode}</strong></Box>

                    </Box>
                  </VStack>
                </HStack>

                {/* RESPONSIBLE PERSON */}
                <HStack align="flex-start" mt={4}>
                  <Text w="250px">
                    RESPONSIBLE/CONTACT PERSON <br />
                    WITH ADDRESS PHONE NOS.
                  </Text>
                  <VStack flex="1" spacing={3}>
                    <Box borderBottom="1px solid black" w="100%" ><Text textTransform="uppercase">
                      Name: <strong> {formData?.responsible_person_name} </strong>
                    </Text>
                    </Box>
                    <Box borderBottom="1px solid black" w="100%" textTransform="uppercase">Address: <strong> {formData?.responsible_person_address} </strong></Box>
                    <Box borderBottom="1px solid black" w="100%" textTransform="uppercase">Mobile no. <strong> {formData?.responsible_person_contact} </strong>, Alt mobile No.<strong> {formData?.responsible_person_alt_contact} </strong></Box>
                  </VStack>
                </HStack>

                {/* GST */}
                <HStack mt={5}>
                  <Text w="250px">GST NO. OF FIRM</Text>
                  <Box borderBottom="1px solid black" flex="1" textTransform="uppercase" mt={1}> <strong> {formData?.gst_number || ""} </strong></Box>
                </HStack>

                {/* PAN */}
                <HStack mt={5}>
                  <Text w="250px">PAN OR AADHAR OF THE FIRM/PROPRITOR</Text>
                  <Box borderBottom="1px solid black" flex="1" textTransform="uppercase" >
                    
                  <strong> {pan && `PAN NO: ${pan}`}
    {pan && aadhar && " , "}
    {aadhar && `AADHAR NO: ${aadhar}`}</strong></Box>
                </HStack>

                {/* LICENSE */}
                <HStack mt={5}>
                  <Text w="250px">SEED LICENCE NO./VALIDITY</Text>
                  <Box borderBottom="1px solid black" flex="1" textTransform="uppercase" > <strong> {formData?.seed_license_no} </strong></Box>
                </HStack>

                {/* STRUCTURE */}
                <HStack mt={5}>
                  <Text w="250px">ORGANISATION STRUCTURE</Text>
                  <Box borderBottom="1px solid black" flex="1" />
                </HStack>



                <HStack spacing={6} pl="250px" mt={5}>

                  {/* PROPRIETOR */}
                  <HStack>
                    <Text>SOLO PROPRIETOR</Text>
                    <Box
                      border="1px solid black"
                      w="14px"
                      h="14px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {formData?.firm_type === "proprietorship" && (
                        <CheckIcon boxSize={3} />
                      )}
                    </Box>
                  </HStack>

                  {/* PARTNERSHIP */}
                  <HStack>
                    <Text>PARTNERSHIP</Text>
                    <Box
                      border="1px solid black"
                      w="14px"
                      h="14px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {formData?.firm_type === "partnership" && (
                        <CheckIcon boxSize={3} />
                      )}
                    </Box>
                  </HStack>

                </HStack>

                {/* FOOTER */}
                <Text
                  mt={10}
                  textAlign="right"
                  fontSize="12px"
                >
                  (Specimen Signature (s) of proprietor Partner(s))
                </Text>

              </VStack>
            </Box>

            {/* PAGE 3: LICENSES & BANKING */}
            <Box className="pdf-page page-break" w="210mm" h="297mm" p="20mm">
              <VStack align="stretch" spacing={5} fontSize="14px">
                <HStack mt={5}>
                  <Text w="250px">FERTILIZER LICENCE NO. /VALIDITY :</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} textTransform="uppercase"> <strong> {formData?.fertilizer_license_no} </strong></Box>
                </HStack>


                <HStack >
                  <Text w="250px">PESTICIDE LICENCE NO./VALIDITY :</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} textTransform="uppercase"> <strong> {formData?.pesticide_license_no} </strong></Box>
                </HStack>
                <HStack w="100%">
                  <Text w="250px">NAME OF TRANSPORTS:</Text>
                  <Box display="flex" flexDirection="column">
                    <Box borderBottom="1px solid black" flex="1" mt={2} w="370px" textTransform="uppercase">(A):<strong> {formData?.transport_name_a} </strong></Box>
                    <Box borderBottom="1px solid black" flex="1" mt={2} w="370px" textTransform="uppercase">(B):<strong> {formData?.transport_name_b} </strong></Box>
                  </Box>
                </HStack>

                {/* years of bussines */}
                <HStack >
                  <Text w="250px">YEARS OF BUSINESS :</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={1} > START AT : <strong> {formData?.firm_since} </strong></Box>
                </HStack>
                {/* name of dealing bannk */}
                <HStack >
                  <Text w="250px">NAME OF DEALING BANK:</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} textTransform="uppercase" > <strong> {formData?.bank_name} </strong></Box>
                </HStack>
                <HStack >
                  <Text w="250px">BANK ACCOUNT NO:</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} > <strong> {formData?.bank_account_no} </strong></Box>
                </HStack>
                <HStack >
                  <Text w="250px">BANK IFSC CODE NO:</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} textTransform="uppercase"> <strong> {formData?.ifsc_code} </strong></Box>
                </HStack>
                {/* ANUAL TURN OVR OF COMAPNY */}
                <HStack >
                  <Text w="250px">ANNUAL TURNOVER OF THE PARTY:</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} >  <strong> {formData?.annual_turnover} </strong></Box>
                </HStack>
                {/* frist year turn over with us */}
                <HStack >
                  <Text w="250px">EXPECTED SALE OF JAMIDARA SEEDS (FIRST YEAR):</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} >  <strong> {formData?.expected_sale} </strong></Box>
                </HStack>



                <Text mt={4}>OTHER COMPANIES DEALING (sales in figures):</Text>
                <Table variant="simple" size="md" border="1px solid black">
                  <Tbody>


                    <Tr>
                      <Td border="1px solid black">S.No</Td>
                      <Td border="1px solid black">NAME OF THE COMPANY</Td>
                      <Td border="1px solid black">TURNOVER WITH THE COMPANY (aprx.)</Td>
                    </Tr>


                    {otherCompanies?.length > 0 && otherCompanies?.map((company, index) => (
                      <Tr key={index}>
                        <Td border="1px solid black">{index + 1}</Td>
                        <Td border="1px solid black">{company.name}</Td>
                        <Td border="1px solid black">{company.turnover}</Td>
                      </Tr>
                    ))}

                  </Tbody>
                </Table>


                {/* source of funds  */}
                <HStack >
                  <Text w="250px">SOURCES OF FUNDS FOR BUSINESS:</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={1} textTransform="uppercase" ><strong> {formData?.source_of_funds}</strong></Box>
                </HStack>

                <HStack >
                  <Text w="250px">(A) OWN SOURCES:</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={1} textTransform="uppercase" >RS .  {formData?.own_funds_details}</Box>
                </HStack>

                <HStack >
                  <Text w="250px">(B) FROM BANK:</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} textTransform="uppercase" >RS . {formData?.own_funds_details} </Box>
                </HStack>
                 <HStack >
                  <Text w="250px">(c) FROM INVESTMENT:</Text>
                  <Box borderBottom="1px solid black" flex="1" mt={2} textTransform="uppercase" >RS . {formData?.own_funds_details} </Box>
                </HStack>
                 
                <Text
                  mt={10}
                  textAlign="right"
                  fontSize="12px"
                >
                  (Specimen Signature (s) of proprietor Partner(s))
                </Text>
              </VStack>
            </Box>

            {/* PAGE 4: DOCUMENT CHECKLIST */}
            <Box className="pdf-page" w="210mm" h="297mm" p="20mm">
              <VStack justifyContent="space-between" flexDirection="column" mt={14} w="100%">
                <Text borderBottom="dotted" w="100%"> I <strong>{formData?.customer_name}</strong> AGREE ON  BEHALF OF  <strong>{formData?.firm_name}</strong> </Text><br />
                <Text borderBottom="dotted" w="100%"> DATE ON  <strong>{formatDate(formData?.approving_date)}</strong>  THIS AGREEMENT ALL TERMS AND CONDITIONS</Text>
                <Text borderBottom="dotted" w="100%" mt={4}>  AND RULES REGULATIONION  ARE ACCPTED</Text>

              </VStack>

              <VStack justifyContent="space-between" spacing={2} flexDirection="row" mt={16}>
                <Text>NAME OF PROPRIETOR/PARTNER (responsible person) 
                  <br />
                  <strong>{formData?.responsible_person_name}</strong>
                  <strong>{formData?.responsible_person_address}</strong>
                </Text>
                <Text>
                   
                  SIGNATURE 
                  <br />
             <strong>{formData?.responsible_person_name}</strong>

                 
                </Text>
              </VStack>

             

              <VStack justifyContent="space-between" spacing={2} flexDirection="row" mt={10}>
                {formData?.firm_type === "proprietorship" && (
                  <Box>  {ownerAddress?.upload_img && (
                    <img
                      src={URL.createObjectURL(ownerAddress.upload_img)}
                      alt="preview"
                      width="100"
                    />
                  )}</Box>)}


              </VStack>

              {formData?.firm_type === "partnership" && (
                <VStack justifyContent="space-evenly" spacing={3} flexDirection="row" mb={5}  >

                  {partners.map((partner, index) => (
                    partner?.upload_img && (
                      <Box key={index} border="1px solid black" borderRadius="lg" height="200px" overflow="hidden" width="170px">

                        <Text fontSize="sm" bg="#d2f1f9" p={1} borderTopRadius="lg">Partner {index + 1}</Text>

                        <img
                          src={URL.createObjectURL(partner.upload_img)}
                          alt={`partner-${index}`}
                          style={{
                            width: "100%",
                            height: "calc(100% - 30px)", // minus header height
                            objectFit: "cover"
                          }}

                        />

                      </Box>
                    )
                  ))}

                </VStack>
              )}

              <Text fontWeight="bold" fontSize="18px" mt={5}>REQUIRED DOCUMENTS (PHOTOCOPIES):</Text>
              <VStack align="flex-start" spacing={2} fontSize="14px">
                <Text textTransform="uppercase" mt={2}>1. Seeds Licence of the Firm.</Text>
                <Text textTransform="uppercase">2. Pan Card of Firm/Proprietor.</Text>
                <Text textTransform="uppercase">3. Aadhar Card of all Partners.</Text>
                <Text textTransform="uppercase">4. Partnership Agreement (if applicable).</Text>
                <Text textTransform="uppercase">5. GST Registration Certificate.</Text>
                <Text textTransform="uppercase">6. Letter Head of the Firm.</Text>
              </VStack>

              <Text spacing={2} fontSize="14px" justifyContent="end" display="flex" mt={5}>
                SIGNATURE OF SR/SO/SM/AASM <br />{formData?.approver_name}
              </Text>
            </Box>


            <Box className="pdf-page" w="210mm" h="297mm" p="20mm">

              <Box p={4} border="1px solid black" bg="gray.50" mt="70px">
                <Text fontWeight="bold">FOR OFFICE USE ONLY:</Text>
                <HStack mt={4} justifyContent="space-between">
                  <Text>Proposed Credit Limit: _______________________</Text>
                  <Text>Final Credit Limit: ________________</Text>
                </HStack>
                <Text mt={10}>Authorised Signatory: _________________________________________</Text>
                <Text mt={10}> Signature of ASM/manager/ <br />(sales)/RM(sales)(with name): _________________________________</Text>
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


export default DistributorAgreementPdfPreview;