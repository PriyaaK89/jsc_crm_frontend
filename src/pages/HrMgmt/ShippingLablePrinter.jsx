import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";

import { useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import autoTable from "jspdf-autotable";
import logo from "../../assets/images/jamidaraBIllLogo.jpeg";
const ShippingLablePrinter = () => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pdfUrl, setPdfUrl] = useState(null);

 const [formData,setFormData] = useState({
  ledgerName:"",
  ConsigneeFirmName:"",
  ConsigneePropName:"",
  ConsigneeDeliveryPlace:"",
  ConsigneeDistric:"",
  ConsigneeContact:"",
  DevliveryPlace:"",
  FreightChargeType:"",
  toPay:"",
  Paid:"",
  transport:"",
  parcel:"",
  freight:"",
  qrInfo:"",
  barcode:""
});

  const handleChange = (e)=>{
    setFormData({
      ...formData,
      [e.target.name]:e.target.value
    });
  };

 const handleSubmit = (e)=>{
  e.preventDefault();

  generatePDF(formData); // PDF create
  onOpen();              // modal open
};

// genrate or and bar code genrtae function
const generateQRCode = async (text) => {
  return await QRCode.toDataURL(text);
};
const generateBarcode = (value) => {
  const canvas = document.createElement("canvas");

  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: true
  });

  return canvas.toDataURL("image/png");
};

// pdf genrtae 
 const generatePDF = async (data) => {

const qrData = `
Name: ${data.ConsigneeFirmName}
Parcel: ${data.parcel}
Transport: ${data.transport}
Contact: ${data.ConsigneeContact}
`;

const doc = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: [120, 150]
});

const barcodeImage = generateBarcode(data.barcode || "123456789");
const qrImage = await generateQRCode(qrData);

// LOGO
doc.addImage(logo, "PNG", 5, 5, 20, 20);

// TO
doc.setFont("helvetica", "bolditalic");
doc.setFontSize(10);
doc.text("TO,", 5, 30);

doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text(data.ConsigneeFirmName || "", 5, 37);

doc.setFontSize(10);
doc.text(data.ConsigneePropName || "", 5, 42);

doc.text("District - " + (data.ConsigneeDistric || ""), 5, 48);
doc.text("Delivery - " + (data.DevliveryPlace || ""), 5, 54);
doc.text(data.ConsigneeContact || "", 5, 60);
  
// PARCEL DETAILS
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text("Parcel: " + (data.parcel || ""), 5, 70);

doc.setFontSize(12);
doc.text((data.FreightChargeType || ""), 5, 76);

doc.setFontSize(10);
doc.text((data.transport || ""), 5, 82);

// FROM
doc.setFontSize(9);
doc.text("FROM,", 5, 92);
doc.text("JAMIDARA SEEDS CORPORATION", 5, 97);
doc.text("District - HAVERI", 5, 102);
doc.text("Phone: +91 9414429966", 5, 107);

// QR CODE
doc.setFontSize(9);
doc.text("QR", 5, 115);
doc.addImage(qrImage, "PNG", 5, 118, 25, 25);

// BARCODE
doc.text("BARCODE", 40, 115);
doc.addImage(barcodeImage, "PNG", 35, 118, 55, 18);

const pdfBlob = doc.output("blob");
const url = URL.createObjectURL(pdfBlob);

setPdfUrl(url);
};

  return (

    <Box bg="white" p={6} borderRadius="lg">
       <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink fontSize="13px" >
              Shipping Label Print
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      <Heading size="md" mb={6} textAlign="center">
        Shipping Label Print
      </Heading>

      <Box as="form" onSubmit={handleSubmit}>

        <SimpleGrid columns={{base:1,md:2}} spacing={5}>
          <FormControl>
            <FormLabel >Select Ledger</FormLabel>
            <Select name="ledgerName" onChange={handleChange} placeholder="plese select">
              <option>murli</option>
              <option>jaya bijj</option>
              <option>balaji khad bij bhandar chomu</option>
              <option>jay </option>
              <option>neha </option>
              <option>helo</option>
              <option>radheyshayma</option>
              <option>shyam</option>

            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Consignee firm Name</FormLabel>
            <Input name="ConsigneeFirmName" onChange={handleChange}/>
          </FormControl>

          <FormControl>
            <FormLabel> Consignee Prop Name</FormLabel>
            <Input name="ConsigneePropName" onChange={handleChange}/>
          </FormControl>


          <FormControl>
            <FormLabel> Consignee Delivery Place</FormLabel>
            <Input name="ConsigneeDeliveryPlace" onChange={handleChange}/>
          </FormControl>
          
          <FormControl>
            <FormLabel> Consignee Distric</FormLabel>
            <Input name="ConsigneeDistric" onChange={handleChange}/>
          </FormControl>

          <FormControl>
            <FormLabel>Consignee Contact</FormLabel>
            <Input name="ConsigneeContact" onChange={handleChange}/>
          </FormControl>

         
          <FormControl>
            
            <FormLabel>Devlivery Place</FormLabel>
            <Input name="DevliveryPlace" onChange={handleChange}/>
          </FormControl>
          <FormControl>
            
            <FormLabel>Parcel</FormLabel>
            <Input name="parcel" onChange={handleChange}/>
          </FormControl>

        

          <FormControl>
            <FormLabel>Freight Charge Type</FormLabel>
            <Select name="FreightChargeType" onChange={handleChange} placeholder="--plese select--">
              <option Value="toPay">TO PAY</option>
              <option Value="Paid">PAID</option>
            </Select>
          </FormControl>
          

          <FormControl>
            <FormLabel>Transport</FormLabel>
            <Input name="transport" onChange={handleChange}/>
          </FormControl>

          <FormControl>
            <FormLabel>QR Info</FormLabel>
            <Input name="qrInfo" onChange={handleChange}/>
          </FormControl>

          <FormControl>
            <FormLabel>Barcode</FormLabel>
            <Input name="barcode" onChange={handleChange}/>
          </FormControl>

        </SimpleGrid>

        <Button
          mt={6}
          colorScheme="blue"
          type="submit">
         Print
        </Button>

      </Box>

      {/* PREVIEW MODAL */}

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">

        <ModalOverlay />

        <ModalContent>

          <ModalHeader>
            Shipping Label Preview
          </ModalHeader>

          <ModalCloseButton />

         <ModalBody>

  {pdfUrl && (
    <iframe
      src={pdfUrl}
      width="100%"
      height="500px"
      style={{ border: "none" }}
      title="PDF Preview"
    />
  )}x

</ModalBody>

          <ModalFooter>

            <Button
  colorScheme="green"
  mr={3}
  onClick={() => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "shipping_label.pdf";
    link.click();
  }}
>
  Download PDF
</Button>

            <Button onClick={onClose}>
              Close
            </Button>

          </ModalFooter>

        </ModalContent>

      </Modal>

    </Box>
  );
};

export default ShippingLablePrinter;