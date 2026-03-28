import {
    Box, Button, Divider, Heading,
    Text,
    Table,
    Tbody,
    Tr,
    Td, HStack, Flex, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, useToast, VStack, TableContainer, Thead, Th,
} from "@chakra-ui/react";
import { toWords } from "number-to-words";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import React from "react";
// import jsc_stamp from "../../../assets/images/stamp_jsc.png";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { CloseButton } from "@chakra-ui/react";
import { Bold } from "lucide-react";

const DistributorAgreementPreviewModel = ({ isOpen, onClose, formData, employee, partners, ownerAddress, otherCompanies }) => {


    //    for check firm type 
    const isSolo = formData?.firm_type === "proprietorship";

    const handleClose = () => {
        onClose(true);
    };


    const toast = useToast();
    const handleDownloadAgreementPDF = async () => {
        try {

            const pages = document.querySelectorAll(".pdf-page");
            const pdf = new jsPDF("p", "mm", "a4");

            for (let i = 0; i < pages.length; i++) {

                const page = pages[i];

                const dataUrl = await toJpeg(page, {
                    quality: 0.9,
                    pixelRatio: 2,
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

            // Download

            const url = URL.createObjectURL(pdfBlob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `Agreement_Letter_${employee?.name}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Upload

            const uploadFormData = new FormData();

            uploadFormData.append(
                "file",
                pdfBlob,
                `Agreement_Letter_${employee?.name}.pdf`
            );

            uploadFormData.append("employee_id", employee?.id);
            uploadFormData.append("employee_name", employee?.name);
            uploadFormData.append("document_type", "agreement_letter");

            const res = await API.post(
                API_ENDPOINTS.upload_emp_letters,
                uploadFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (res?.status === 200) {
                toast({
                    description: "Agreement Letter Uploaded Successfully!",
                    duration: 2000,
                    status: "success"
                });
            }

        } catch (error) {

            console.error("Agreement PDF generation/upload error:", error);

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



    const isPartner = formData?.firm_type === "partnership";

    const personName = isPartner
        ? partners?.[0]?.name
        : formData?.name;

    const personAadhar = isPartner
        ? partners?.[0]?.aadhar_no
        : ownerAddress?.aadhar_no;

    const personAddress = isPartner
        ? partners?.[0]?.address
        : formData?.responsile_person_address;

    const personContact = isPartner
        ? partners?.[0]?.contact_no
        : formData?.responsile_person_no;


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent maxW="none"
                    width="fit-content"
                    bg="white"
                    boxShadow="none">
                    <ModalBody p={0}>
                        <Flex justifyContent="flex-end" m={4} ><CloseButton bg="#d3d2d2" p={3} onClick={handleClose} /></Flex>

                        <Box id="agre-letter-preview" fontFamily="Georgia" >
                            <VStack spacing={0}>
                                {/* part 1st  */}
                                {/* page 1 */}
                                <Box className="pdf-page" p="40px" fontFamily="Times New Roman" fontSize="13px" lineHeight="1.6">

                                    <Text textAlign="center" fontWeight="bold" textDecoration="underline" fontSize="20px" mt={40}  >
                                        DISTRIBUTOR   AGREEMENT FORM
                                    </Text>

                                    <Text mt={10}>
                                        This Distributorship Agreement (“Agreement”) is made and entered into this ____________________ by and between
                                    </Text>

                                    <Text mt={4}>
                                        <mark> <strong>JAMIDARA SEEDS CORPORATION </strong>  </mark>, a Company INDIAN PARTNER-SHIP ACT,1932,  and having its ZONEL registered office at, <strong> JAMIDARA SEEDS CORPORATION 73,GANESH NAGAR-||, MURLIPURA JAIPUR (RAJ)-302039, </strong> registered office at JAMIDARA SEEDS CORPORATION 105 NEMI CHNAD MARKET ALWAR-301001, (hereinafter referred to as “the Company”) which expression shall, unless repugnant to the subject or context or meaning thereof, include, if applicable, successors and assigns) of the ONE PART.
                                    </Text>

                                    <Text mt={4} textAlign="center" fontSize="15px">And</Text>

                                    <Text mt={4}>
                                        <mark><strong>  {formData?.firm_name} </strong> </mark>,  a {formData?.firm_type} concern having its place of business at <strong> {formData?.business_address}. </strong>Represented through its proprietor.<strong>{ownerAddress?.name}{partners?.name} </strong> residing at S/O-<strong>{ownerAddress?.father_name}{partners?.father_name}</strong> address <strong> {ownerAddress?.address}{partners?.address}</strong> (hereinafter collectively referred to as “Distributor” ) which expression shall unless repugnant to the context or meaning thereof be deemed to include his /her heirs, executors, administrators, permitted assigns and successors of the OTHER PART.
                                    </Text>

                                    <Text mt={4}>
                                        Company and Distributor both hereinafter referred individually as “Party” or collectively as the “Parties”.
                                    </Text>

                                    <Text mt={6} fontWeight="bold">WHEREAS:</Text>

                                    <Text mt={4}>
                                        (A)  Company carries on the business of manufacturing, marketing, distribution of various SEEDS like  VEGETABLE SEEDS, CROPS SEEDS , FODDER SEEDS ,crop protection chemicals etc. (hereinafter referred to as “the Products”);
                                    </Text>

                                    <Text mt={3}>
                                        (B)  Distributor had approached and represented to the Company that it has got the required valid  Seeds, pesticide ,license, skill and experience to market the  seeds & agro chemical products and has shown interest to act as a Distributor of the said Products on non-exclusive basis for the Company at <strong>{formData?.tarritory}</strong>(“Territory”);
                                    </Text>

                                    <Text mt={3}>
                                        (C)  Company, based on the representation of the Distributor and documents / details submitted / agreed to submit (more specifically detailed in Annexure “A” herein) appointed it as a Distributor for <strong> {formData?.tarritory}</strong>  marketing the said Products in the said  <strong>{formData?.district} </strong> Territory;
                                    </Text>

                                    <Text mt={3}>
                                        (D)  The Parties herein now agrees to reduce in writing the terms and conditions under which the Distributor was engaged by the Company, which are as follows.
                                    </Text>

                                    <Text mt={6} fontWeight="bold">
                                        NOW THIS AGREEMENT WITHNESSETH AND IT IS HEREBY AGREED BY AND BETWEEN THE PARTIES HERETO AS FOLLOWS;
                                    </Text>
                                </Box>
                                {/* 1 st page end here  */}

                                {/* 2second page start  */}
                                <Box className="pdf-page" p="40px" fontFamily="Times New Roman" fontSize="13px" lineHeight="1.6">

                                    <Text mt={6} fontWeight="bold" textDecorationLine="underline"> 1. ENGAGEMENT</Text>

                                    <Text mt={3}>
                                        Company have granted to Distributor and Distributor have accepts from Company the non-exclusive right to distribute the Products in the Territory, upon and subject to all terms and conditions set forth in this Agreement. Company shall sell and the Distributor shall purchase on a principal to principal basis the Products offered by the Company. Distributor covenants and agrees to purchase the said products for its own account exclusively from Company and to market, distribute and sell the same only in the Territory based on the label claim of the Product and in compliance with all statutory provisions.
                                    </Text>

                                    <Text mt={3}>
                                        Company reserves its right to appoint more than one Distributor at its own discretion in the Territory in which the Distributor shall operate under this Agreement. The Company shall also have the right to sell the Products directly to any other person / party in the Territory of the Distributor or appoint additional Distributors/dealers (s) in the Territory.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 2. TERM</Text>

                                    <Text mt={3}>
                                        This appointment (unless otherwise terminated as provided in Termination clause) shall be effective from 8ST APRIL,2023. This Aagreement shall remain valid until terminated in terms of this present.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">3. TERMS OF SECURITY DEPOSIT</Text>

                                    <Text mt={3}>
                                        (i)  Distributor has furnished an amount of Rs.<mark> <strong> {formData?.security_amount} {toWords(formData?.security_amount || 0)}/- </strong> (Rupees) </mark> as and by way of interest free Security Deposit for due performance of the terms and conditions mentioned in this Agreement.
                                    </Text>

                                    <Text mt={3}>
                                        (ii)  Distributor shall furnish all necessary security documents as per requirement of Company from time to time. Further, Distributor will keep as a security its secured assets which will depend goods/ stocks made available to it. Company will not have any right over said assets but if Distributor defaults its payment then Company will use its right to lien over said assets to the extent of amount of default.
                                    </Text>

                                    <Text fontWeight="bold" textDecoration="underline"> 4. PRICE</Text>

                                    <Text mt={3}>
                                        (i) Products will be sold to Distributor at a price in force. All levies, duties, Octopi or any other taxes etc, as may be applicable from time to time will be charged extra. No other discount like quantity, etc will be allowed unless explicitly specified in writing by Company. Company reserves the right to change the price of the Products or vary/ alter the terms and conditions of sale, if necessary from time to time.
                                    </Text>

                                    <Text mt={3}>
                                        (ii)  The said prices shall be carriage Pay to (CPT) basis at the Company’s premises and shall be exclusive of GST payable on the Products or in respect of the sale or purchase thereof.
                                    </Text>

                                    <Text mt={3}>
                                        (iii)  Company further reserve to itself the absolute right to revise the prices of the Products and or the term and conditions for delivery and payment from time to time and such revised prices terms and conditions shall come into effect from the date announced by the Company to the Distributor.
                                    </Text>

                                    <Text mt={6} fontWeight="bold">5. PAYMENT</Text>

                                    <Text mt={3}>
                                        (a)  Distributor shall make payment to Company in accordance with the terms and conditions specified in the Invoice accompanying each consignment of the Products supplied to it. Any delay in payment would make Distributor liable to pay interest from the due date till the date of realization of payment, at such rate as may be specified in the Invoice.
                                    </Text>

                                    <Text mt={3}>
                                        (b)  Company shall have lien over the Products sold and supplied by Company until Distributor pays the entire sale price of the same to the Company. The Company shall have right to take back entire or part of the Products as it deems fit and proper to recover its dues.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 6. CASH DISCOUNT</Text>

                                    <Text mt={3}>
                                        Cash Discount, if any shall be as mentioned in prevailing price list or any cash discount scheme as offered by Company in writing,
                                    </Text>
                                </Box>

                                <Box className="pdf-page" p="40px" fontFamily="Times New Roman" fontSize="13px" lineHeight="1.6">


                                    <Text mt={3}>such cash discount will only be considered on that amount which has been received by Company within the stipulated time. Date of demand draft and / or day of deposit of Cash /cheques / online transfer will be considered by the Company to offer Cash Discount, if any.</Text>


                                    <Text mt={6} fontWeight="bold" textDecoration="underline">7. THE MAXIMUM CREDIT PERIOD</Text>

                                    <Text mt={3}>
                                        The maximum credit period will be <mark> <strong>
                                            {formData?.credit_duration_period} ( {toWords(formData?.credit_duration_period || 0)})
                                        </strong></mark> days from the date of Invoice. In case of any delay in payment over the stipulated time, interest at the rate of 24 % per annum shall be charged by the Company.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 8. PAYMENT TERMS FOR CREDIT SALE</Text>

                                    <Text mt={3}>
                                        (i)  Payment towards credit sales shall be made within the stipulated period by way of RTGS/NEFT transfer/DD/Cheque.
                                    </Text>

                                    <Text mt={3}>
                                        (ii)  No cash to be handed over to any of Company’s sales or development staff. No reimbursement to Distributor will be made by the Company for any cash given to the Sales / development staff under any circumstances.
                                    </Text>


                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 9.DELIVERY</Text>

                                    <Text mt={3}>
                                        Company’s liability shall cease when the Products are delivered by the Company to the carrier at despatching point for delivery to the Distributor’s place. However, Company may at its discretion deliver the Products to the Distributor premises at its cost.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 10. SALES PROMOTION</Text>

                                    <Text mt={3}>
                                        Apart from adequate stock keeping it is clearly understood that the Distributor shall engage itself in active selling, including participation in local and/ or regional agricultural fairs and exhibitions and in general, contribute to the promotion of sales of the Products in co-operation with Company’s representatives.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">11. STOCK RETURNS</Text>

                                    <Text mt={3}>
                                        For any stock returns or replacement, to and fro fright charges will be debited to the Distributor within 15 days from the date of Invoicing for replacement subject to the approval of the Zonal head of Company.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">12. DAMAGED/ LEAKAGE STOCKS</Text>

                                    <Text mt={3}>
                                        (i)  Any damage or leakage stocks should be intimated by the Distributor within 15 days from the date of receipt:
                                    </Text>

                                    <Text mt={3}>
                                        (ii)  Copy of Company’s area manager/ area officer’s verification report, which is obtained by the Distributor during his first visit to Distributor after being advised of the damage/ leakage and duly counter signed by the area manager/ regional head.
                                    </Text>

                                    <Text mt={3}>
                                        (iii)  All the defective containers and stored material shall have to be forwarded to the depot within 7 days after the above verification.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">13. CLAIMS</Text>

                                    <Text mt={3}>
                                        Claims based on verbal commitments made by the sales/ field staff without the prior sanction in writing from Zonal Heads, will not be entertained or passed under any circumstance.
                                    </Text>

                                    <Text mt={5} fontWeight="bold" textDecoration="underline"> 14. POLICY ON DISHONORED CHEQUES</Text>

                                    <Text mt={3}>
                                        A service chares @ 2.6% of the cheque value per dishonoured cheques will be levied in case of dishonour of cheques issued against any Invoice issued for the supplies made. The Company reserves the right to discontinue the supplies if more than 3 cheques are dishonoured. In case, more than 2 cheques are dishonoured, during a financial year then the Company shall have the right to withdraw or reduce any discounts or schemes incentives that are offered from time to time and may also result in a downward revision of the credit ceiling offered to the Distributor.
                                    </Text>
                                </Box>

                                <Box className="pdf-page" p="40px" fontFamily="Times New Roman" fontSize="13px" lineHeight="1.6">
                                    <Text mt={3}>Distributor shall honour each cheque on presentation and no excuse will be considered. The Company shall have the absolute right to initiate any proceedings which includes but not limited to proceedings under section 138 of the Negotiable Instruments Act and any amendment thereof in the event of dishonour of cheque.</Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">15. CONFIDENTIALITY</Text>

                                    <Text mt={3}>
                                        Distributor recognizes and agrees that the information to which it has access as a result of the present Agreement have a relevant commercial value, and that its non-authorized disclosure may result in substantial damages to the Company. Therefore, except when previously and expressly authorized by Company, the Distributor agrees not to disclose, even after the termination or cancellation of the present.
                                    </Text>
                                    <Text fontWeight="bold" textDecoration="underline"> 16. INDEMNITY</Text>

                                    <Text mt={3}>
                                        Distributor shall indemnify and keep harmless at all times the Company and its officials,  representatives from and/ or against all claims, demands, actions, proceedings, fines, expense, penalties and other liabilities of whatsoever nature made or brought against Company and its officials,  representatives etc. as a consequence of any non-compliance on the part of the Distributor.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 17. FORCE MAJEURE</Text>

                                    <Text mt={3}>
                                        Neither party shall be held responsible for non- fulfilment of its respective obligations under this Agreement due to the existence of one or more of the force majeure events such as but not limited to acts of God, war, flood, earthquakes, strikes not confirmed to the premises of the party, lockouts beyond the control of the party claiming force majeure.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 18. WARRANTY</Text>

                                    <Text mt={3}>
                                        The Company manufactures the Products as per the highest available quality standards. The Products manufactured and then sold by the Company are duly tested and are suitable for the purpose recommended, if correctly applied in conformity with the label claim / instructions / leaflet. However, since the Company cannot exercise sufficient control over the end use or application by the user, the Company accepts no responsibility for any damage arising directly or indirectly from their inappropriate use. Company shall not be responsible for any legal action initiated by the department of agriculture against the Company in Distributor’s designated area due to inappropriate use of the Products.
                                    </Text>



                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 19. TRADEMARKS</Text>

                                    <Text mt={3}>
                                        Distributor shall not use or be deemed to have the right to use any Trade Mark, trade name, colour scheme or legend of Company under which the Products are sold to Distributor. On the termination of this Agreement, Distributor shall immediately discontinue the use in any manner whatsoever all such Trade Mark, trade names, designs, colour, schemes or legends.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline"> 20. PRINCIPAL TO PRINCIPAL AGREEMENT</Text>

                                    <Text mt={3}>
                                        This Agreement is on a principal to principal basis and Distributor shall not in any way represent itself to be a Company’s agent. Company shall not be liable for any act or any omission on Distributor’s part. Distributor shall give an undertaking that it will market the Products supplied to it by Company and it shall not alter the labels of the containers or packages in any way and shall not deface, remove, obliterate or in any manner modify or alter the Trade Marks, grade indications and other matters appearing thereon.
                                    </Text>

                                </Box>


                                {/* fourh 4page  */}
                                <Box className="pdf-page" p="40px" fontFamily="Times New Roman" fontSize="13px" lineHeight="1.6">
                                    {/* part 4 */}


                                    <Text fontWeight="bold" textDecoration="underline"> 21. DISPUTES AND JURISDICTION</Text>

                                    <Text mt={3}>
                                        Any disputes arising between the Distributor and the Company shall be resolved by mutual discussion. Unresolved disputes, if any shall be referred to Arbitration by a sole Arbitrator to be appointed by the Company under the provisions of the Arbitration and Conciliation Act, 1996. The venue of Arbitration shall be ALWAR. This Agreement shall be governed by the laws of India and subject to the jurisdiction of courts of ALWAR.
                                    </Text>

                                    <Text mt={8}>
                                        IN WITHNESS WHEREOF the parties hereto have subscribed their hands to these presents on the day and month herein above first entered
                                    </Text>





                                    <Text fontWeight="bold" textDecoration="underline">
                                        21. DUTIES / OBLIGATIONS OF DISTRIBUTOR
                                    </Text>

                                    <Text mt={3}>
                                        The Distributor shall:
                                    </Text>

                                    <Text mt={2}>
                                        i) use its best efforts to sell and promote Products in the Territory, including (i) attendance by Distributor at trade shows at which Distributor shall promote the Products, (ii) listing the products in Distributor’s product lists and other marketing information.
                                    </Text>

                                    <Text mt={2}>
                                        ii) protect Copyrights, Trade Marks and other proprietary rights of Company in the Products.
                                    </Text>

                                    <Text mt={2}>
                                        iii) offer technical support of the products to its customers and to advise Company immediately if it is unable to respond to customer inquiries / complaints effectively.
                                    </Text>

                                    <Text mt={2}>
                                        iv) Comply with all applicable laws and ordinances in performing its duties under this Agreement and in any of its dealings with Company or the Products. Distributor agrees that it will not export or re-export any products.
                                    </Text>

                                    <Text mt={2}>
                                        v) sell the Products in compliance with the approved label claims.
                                    </Text>

                                    <Text mt={2}>
                                        vi) not re sell the Products at prices higher than the maximum recommended retail prices stipulated by the Company from time to time.
                                    </Text>

                                    <Text mt={2}>
                                        vii) when required by the Company, the distributor shall execute on its own behalf and or/on behalf of its associate/affiliate/subsidiary concerns guarantee/s in favour of the Company, in the form/s and for the amount/s determined by the Company and shall also renew such guarantee/s whenever due. Notwithstanding anything herein contained the Distributor shall furnish any additional Security, Bond or undertaking as may be required by the Company at its sole discretion.
                                    </Text>

                                    <Text mt={2}>
                                        viii) being fully aware of the hazardous/toxic nature of the Products and shall undertake to comply with all statutory precautions and shall be solely responsible and liable for their safe custody at its storage points and their safe transportation and handling. Company shall not be liable or responsible for any loss, damage or injury incurred or suffered by the Distributor or any of its employee or workmen or contractor engage by it in the course of handling or transportation of the Products or otherwise however and the distributor shall at all times, indemnify and keep indemnified the Company from and against all claims, demands, fines, penalties, actions, proceedings and liabilities of whatsoever nature made, imposed, brought against or suffered by the Company by reason of any such loss, damage or injury aforesaid.
                                    </Text>

                                    <Text mt={2}>
                                        ix) always maintain adequate stock during the term of this Agreement and shall submit Products inventory in detail to the Company within eight 8 (Eight) days from the end of each calendar month recording detail of the Inventory Products / stocked by the Distributor in the preceding colander month together with a statement showing the Products sold by it during such calendar month. The Distributor shall follow an annual marketing plan as per the requirement of the Company.
                                    </Text>

                                    <Text mt={2}>
                                        x) from time to time advise the Company in writing of all local laws and regulations relating to the storage, sale and use of the Products.
                                    </Text>

                                    <Text mt={2}>
                                        xi) observe and comply with all the applicable laws, orders, ordinances, notifications, rules, regulations, legislations or other enactments, or modifications thereof for the time being in force relating or in any wise appertaining to the performance by the Distributor of its duties and obligations under the Agreement.
                                    </Text>

                                    <Text mt={2}>
                                        xii) maintain at his/its office / Shops / Godowns all Registers, books, Records as would be statutorily required under various laws and maintain infrastructure like computers/printer as may be required of him/it for facilitating the transfer of data/information to the Company.
                                    </Text>

                                    <Text mt={4}>
                                        xiii) rotate the said Products on a first-in-first out basis. If any quantities of the said Products remain unsold and expired, then the same will be to the account of the Distributor only. The Distributor cannot force the Company to take back any expired stocks.
                                    </Text>

                                    <Text mt={2}>
                                        xiv) not tamper with or in any way alter, modify, change, process, reprocess, adapt, or treat the Products and/or their packing and shall not sell / keep for sale or offer to sell/barter/ supply the said Products, as supplied by the Company, after the Expiry Date mentioned on the container, mark or label.
                                    </Text>

                                    <Text mt={2}>
                                        xv) forthwith intimate the Company in the event of seizure of any Products by statutory Authority in the Territory and send all the documents in respect of the same.
                                    </Text>

                                </Box>

                                {/* 5th page  */}
                                <Box className="pdf-page" p="40px" fontFamily="Times New Roman" fontSize="12px" lineHeight="1.5">

                                    <Text mt={2}>
                                        xvi) forthwith intimate the Company in the event of receipt of any Notice from the statutory Authority concerning misbranding etc.
                                    </Text>

                                    <Text mt={2}>
                                        xvii) assist the Company in any matter as and when required by the Company in the Territory
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">
                                        22. LEGAL REQUIREMENTS / COMPLIANCE
                                    </Text>

                                    <Text mt={3}>
                                        Distributor shall be obliged to take all requisite registrations, licenses, permissions, etc., including but not limited to under the provisions of Seeds ACT-1966 & Seed act 1983,Insecticides Act,1968 & Rules framed there under, Fertilizer (Control) Orders, Legal Metrology Act, 2009 & Rules framed there under, Goods and Service Tax & Rules framed there under, any and all Central and State Acts or Rules which is mandatorily required for doing business for stocking, exhibiting, transporting, selling of the Products, before commencement of operations and submit copies of such registrations/licenses/permissions to the Company and should renew and keep the same valid from time to time. In case of any change of statutory provisions by way of any Acts, Order, Notifications etc. then it will be the sole responsibility of the Distributor to comply such provisions and to immediately intimate to the Company. Further, Distributor will also arrange a proper godown for storage of the said products and if any storage license is necessary such license from the concerned authority shall also be obtained by the Distributor in its own name and at its own cost.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">
                                        23. PROHIBITION AGAINST RE-FORMULATION OF THE PRODUCTS
                                    </Text>

                                    <Text mt={2}>
                                        Distributor under no circumstances breaks open the packages, containing the Products and re-sell them in their existing form or re-formulated, mixed or blended with any other goods.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">
                                        24. PROHIBITION AGAINST COMPETITIVE MANUFACTURE
                                    </Text>

                                    <Text mt={2}>
                                        Distributor undertake not to, directly or indirectly, manufacture the Products or any of them by itself or through any third party / related party.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">
                                        25. ASSIGNMENT:-
                                    </Text>

                                    <Text mt={2}>
                                        Distributor shall not assign, delegate or transfer any of the rights, duties or obligations under this Agreement without Company’s prior written consent.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">
                                        26. NOTICE
                                    </Text>

                                    <Text mt={2}>
                                        Distributor shall forthwith inform Company of any change in its status (Proprietary, Partnership, Company etc.) location, telephone or fax number by giving written notice of such change.
                                    </Text>

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">
                                        27. TERMINATION:-
                                    </Text>

                                    <Text mt={2}>
                                        a) Company reserves the right to terminate this Agreement by giving 30 (Thirty) days’ notice in writing without assigning any reason. Distributor also has right to terminate this Agreement by giving 90 (Ninety) days’ notice subject to the entire outstanding payments being cleared along with interest, if any, pertaining to all the supplies made to Distributor.
                                    </Text>

                                    <Text mt={2}>
                                        b) Company shall be entitled to terminate this Agreement forthwith without any notice if Distributor is found to be violating the terms & conditions of this Agreement including dishonour of cheque or non – payment of any cheque / Invoice amount.
                                    </Text>

                                    <Text mt={2}>
                                        c) Any termination or expiration of this Agreement shall be without prejudice to any claim, remedy or right of action, previously accrued to either party against the other. Provided further Company shall not be liable or responsible for payment of any compensation to the Distributor on this Agreement being terminated as per the provisions herein above.
                                    </Text>

                                    <Text mt={2}>
                                        d) Upon expiration or termination of this Agreement, the Distributor shall forthwith return to the Company all Samples, display, photographs, brochures, and other printed sales promotional material and literature and other property to the Company. The Distributor further agrees to remove all signs or evidences of his/its relationship with Company on such expiration or termination.
                                    </Text>
                                    <Text>
                                        e) Upon termination of this Agreement for any reason the Company shall make and prepare a final account in respect of its dealings with the Distributor and shall submit such account statement in duplicate to the Distributor, any amount to be due payable under such account by the Distributor to Company shall be paid by Distributor within 8 (Eight) days from the date of submission of such account to the Distributor. The final account prepared by Company as aforesaid shall be final and binding upon the Distributor and shall not be called in question, except for any manifest error which may be apparent on the face thereof.
                                    </Text>
                                    <Text>f)Any notice contemplated hereunder shall be deemed to be properly made if served on its last known address in Distributor’s record.</Text>

                                </Box>

                                {/* sixth page 6 */}
                                <Box className="pdf-page" p="40px" fontFamily="Times New Roman" fontSize="12px" lineHeight="1.5">

                                    <Text mt={6} fontWeight="bold" textDecoration="underline">
                                        28. DISPUTES AND JURISDICTION
                                    </Text>

                                    <Text mt={6}>
                                        Any disputes arising between the Distributor and the Company shall be resolved by mutual discussion. Unresolved disputes, if any shall be referred to Arbitration by a sole Arbitrator to be appointed by the Company under the provisions of the Arbitration and Conciliation Act, 1996. The venue of Arbitration shall be<strong> {formData?.jurisdiction_district}</strong>. This Agreement shall be governed by the laws of India and subject to the jurisdiction of courts of <strong>{formData?.jurisdiction_district}</strong>.
                                    </Text>
                                    <Text mt={6}>
                                        IN WITHNESS WHEREOF the parties hereto have subscribed their hands to these presents on the day and month herein above first entered
                                    </Text>

                                    <Text mt={10}>
                                        SIGNED and DELLIVERED for and on<strong> Jamidara SEEDS CORPORATION </strong>
                                    </Text>
                                    <Text mt={5}>Behalf of the with named Company<strong> Jamidara SEEDS CORPORATION </strong></Text>
                                    <Text mt={10}>Through its M.D:– Supply Chain_________________________________</Text>
                                    <Text mt={10}>GM – Supply Chain                         )</Text>

                                    <Text>In the presence of (witnesses) </Text>

                                    <Text>1. ____________________________________ </Text>
                                    <Text>2. ____________________________________ </Text>





                                    <Text>
                                        SIGNED and DELIVERED for and on Jamindara SEEDS CORPORATION
                                    </Text>

                                    <Text>
                                        Behalf of the with named Company Jamindara seeds Corporation
                                    </Text>

                                    <Text mt={2}>
                                        Through its M.D – Supply Chain
                                    </Text>

                                    <Text mt={4}>
                                        GM – Supply Chain
                                    </Text>

                                    <Text mt={6}>
                                        In the presence of (witnesses)
                                    </Text>

                                    <HStack mt={4} spacing="80px">
                                        <Text>1. ____________________</Text>
                                        <Text>2. ____________________</Text>
                                    </HStack>


                                    <Text mt={10}>
                                        SIGNED and DELIVERED for and on For
                                    </Text>

                                    <Text>
                                        Behalf of the with named Distributor
                                    </Text>

                                    <HStack mt={4} justify="space-between">
                                        <Box>
                                            <Text>Through its PROPRIETOR</Text>
                                            <Text mt={6}>______________________ </Text>
                                        </Box>

                                        <Box textAlign="right">
                                            <Text>Name:{formData?.customername}</Text>
                                            <Text mt={2}>Designation: PROPRIETOR</Text>
                                        </Box>
                                    </HStack>


                                    <Text mt={10}>
                                        In the presence of (witnesses)
                                    </Text>

                                    <HStack mt={4} spacing="80px">
                                        <Text>1. ____________________</Text>
                                        <Text>2. ____________________</Text>
                                    </HStack>
                                </Box>



                                <Box
                                    className="pdf-page"
                                    p="40px"
                                    fontFamily="Times New Roman"
                                    fontSize="12px"
                                    lineHeight="1.6"
                                >

                                    <Box mt={16} border="2px solid black">

                                        <Text textAlign="center" fontWeight="bold" mt={2}>
                                            Annexure "A"
                                        </Text>

                                        <Text textAlign="center" mb={2}>
                                            List of Documents of the Distributor
                                        </Text>
                                        <Table variant="simple" size="sm" sx={{ borderCollapse: "collapse" }}>
                                            <Tbody>
                                                {[
                                                    [
                                                        "Name and Address of the Distributor (with valid address document)",
                                                        `${formData?.firm_name || ""}, ${formData?.business_address || ""}`
                                                    ],

                                                    [
                                                        "Name of Key Person/s with Aadhaar No.",
                                                        `${personName || ""}, ${personAadhar || ""}`
                                                    ],

                                                    [
                                                        "Residential Address (with supporting documents)",
                                                        personAddress
                                                    ],

                                                    [
                                                        "Contact No. (Official & Residential)",
                                                        `${personContact || ""}, ${formData?.responsile_Alternat_person_no || ""}`
                                                    ],

                                                    ["E-mail Id", formData?.firm_email_id],

                                                    ["SEED License No.", formData?.seed_license],

                                                    ["PESTICIDE License No.", formData?.pesticide_license],

                                                    ["FERTILIZER SEED License No.", formData?.fertilizer_license],

                                                    ["GST Registration No.", formData?.firm_gstn_no],

                                                    ["Name of the Banker", formData?.bank_name],

                                                    ["Account No.", formData?.bank_account],

                                                    ["Bank Guarantee, if any", "Na"]  ,
                                                    [ "Authority Letter for signing the Agreement (if applicable)",
                                                        isSolo ? "NA" : "YES" ],
                                   
                                                ].map((row, i) => (
                                                    <Tr key={i}>
                                                        <Td border="1px solid black" p="6px" w="50%">
                                                            {row[0]}
                                                        </Td>
                                                        <Td border="1px solid black" p="6px" w="50%">
                                                            {row[1] || " "}
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>

                                    </Box>
                                </Box>


                            </VStack>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Flex p={1} justifyContent="center" borderTop="1px" borderColor="#bdbcbc" w="100%">
                            <Button colorScheme="gray" onClick={handleClose} >Close</Button>
                            <Button colorScheme="blue" onClick={handleDownloadAgreementPDF} ml={5}>Download PDF</Button>
                        </Flex>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}



export default DistributorAgreementPreviewModel
