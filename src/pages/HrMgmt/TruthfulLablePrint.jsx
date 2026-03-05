
import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select
} from "@chakra-ui/react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack,VStack} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { useState } from "react";
import jsPDF from "jspdf";
import logo from "../../assets/images/jamidaraBIllLogo.jpeg";

const TruthfulLablePrint = () => {
 

const { isOpen, onOpen, onClose } = useDisclosure();
const [pdfUrl,setPdfUrl] = useState(null);

const [formData,setFormData] = useState({
kind:"",
germination:"",
physicalPurity:"",
geneticPurity:"",
netQty:"",
moisture:"",
variety:"",
black:"",
gold:"",
brown:"",
sliver:"",
yellow:"",
lotNo:"",
batchNo:"",
packedOn:"",
dateOfTest:"",
validUpto:"",
treatedWith:"",
pouches:"",
mrp:"",
kharif:"",
rabi:""
});

const handleChange=(e)=>{
setFormData({
...formData,
[e.target.name]:e.target.value
});
};


const handleSubmit=(e)=>{
e.preventDefault();
generatePDF(formData);
onOpen();
};

const generatePDF = (data) => {

const doc = new jsPDF({
orientation: "portrait",
unit: "mm",
format: [250,200]
});

/* PAGE WIDTH */
const pageWidth = doc.internal.pageSize.getWidth();



/* TITLE */
doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.text("TRUTHFUL LABEL", pageWidth / 2, 20, { align: "center" });

/* CONTENT START */
doc.setFont("helvetica", "normal");
doc.setFontSize(12);

let leftX = 10;
let rightX = 110;
let y = 45;

/* ROW 1 */
doc.setFontSize(14);
doc.text(`KIND : ${data.kind}`, leftX, y);
doc.text(`VARIETY : ${data.variety}`, rightX, y);
y += 10;

/* ROW 2 */
doc.text(`GERMINATION (MIN) : ${data.germination}%`, leftX, y);
doc.text(`LOT NO : ${data.lotNo}`, rightX, y);
y += 10;

/* ROW 3 */
doc.text(`PHYSICAL PURITY (MIN) : ${data.physicalPurity}%`, leftX, y);
doc.text(`BATCH NO : ${data.batchNo}`, rightX, y);
y += 10;

/* ROW 4 */
doc.text(`GENETIC PURITY (MIN) : ${data.geneticPurity}%`, leftX, y);
doc.text(`PACKED ON : ${data.packedOn}`, rightX, y);
y += 10;

/* ROW 5 */
doc.text(`NET QTY of each retail pak : ${data.netQty} GM`, leftX, y);
doc.text(`DATE OF TEST : ${data.dateOfTest}`, rightX, y);
y += 10;

/* ROW 6 */
doc.text(`MOISTURE (MAX) : ${data.moisture}%`, leftX, y);
doc.text(`VALID UP TO : ${data.validUpto} months from DOP`, rightX, y);

y += 15;

/* TREATED */
doc.setFont("helvetica", "bold");
doc.text(`TREATED WITH : ${data.treatedWith}`, leftX, y);
y += 10;

/* POUCHES */
doc.setFont("helvetica", "bold");
doc.text(`NO. OF POUCHES INSIDE THE BAG : ${data.pouches} PKT`, leftX, y);
y += 10;

/* MRP */
doc.setFont("helvetica", "bold");
doc.text(`MRP : Rs ${data.mrp}/- (Incl of all taxes)`, leftX, y);

y += 15;

/* CULTIVATION */
doc.setFont("helvetica", "bold");
doc.text("RECOMMENDED FOR CULTIVATION", leftX, y);

doc.setFont("helvetica", "normal");
y += 10;

doc.text(`KHARIF : ${data.kharif}`, leftX, y);
y += 8;

doc.text(`RABI : ${data.rabi}`, leftX, y);
y += 8;

doc.text(`SUMMER : ${data.summer}`, leftX, y);

y += 15;

/* COMPANY */
/* LOGO */
doc.addImage(logo, "PNG", 10, 175, 40, 40);

doc.setFont("helvetica", "bold");
doc.text("JAMIDARA SEEDS CORPORATION", 10 ,210);

doc.setFont("helvetica", "normal");
doc.text("P.B. Road Rane Bennur", 10,215);
doc.text("District - HAVERI, KARNATAKA", 10,220);
doc.text("Reg Add: 73 Ganesh Nagar Murlipura",10,225);
doc.text("Jaipur, Rajasthan",10,230);


/* CAUTION BOX */

const boxWidth = 90;
const boxHeight = 45;
// const centerX = pageWidth / 2;
const boxX = 107
const boxY = 150;

/* BOX */
doc.setLineWidth(0.8);
doc.rect(boxX, boxY, boxWidth, boxHeight);

/* CAUTION TITLE */

doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.text("CAUTION", 146, boxY + 10, { align: "center" });

/* CAUTION TEXT */

doc.setFont("helvetica", "normal");
doc.setFontSize(14);

doc.text("SEEDS TREATED WITH POISON", 146, boxY + 20, { align: "center" });

doc.text("DO NOT USE FOR FOOD", 146, boxY + 30, { align: "center" });
doc.text(" FEED OR OIL PURPOSES", 146, boxY + 40, { align: "center" });



/* PREVIEW */

const blob = doc.output("blob");
const url = URL.createObjectURL(blob);

setPdfUrl(url);

};

return(

<Box bg="white" p={6} borderRadius="lg">

<HStack justifyContent='space-between'>
                       <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                         <BreadcrumbItem>
                           <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                         </BreadcrumbItem>
            
                         <BreadcrumbItem>
                          <BreadcrumbLink href='/print/mgmt/truthful_labelprint' color='#8B8D97' fontSize='13px'> TruthFull lable printer</BreadcrumbLink>
                         </BreadcrumbItem>
            
                      </Breadcrumb>
                   
            
                     </HStack>
                
       
                <Heading size="md" textAlign="center" mb={6}>
                 TruthFull lable printer
                 </Heading>

<Box as="form" onSubmit={handleSubmit}>

<SimpleGrid columns={{base:1,md:2}} spacing={5}>

<FormControl>
<FormLabel>KIND</FormLabel>
<Input name="kind" placeholder="enter KIND  name" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>GERMINATION (MIN)</FormLabel>
<Input type="number" name="germination" placeholder="enter in 10%,20%"  min={0} max={100} onChange={handleChange}/>
{formData.germination > 100 && (
    <FormErrorMessage>Germination cannot exceed 100%</FormErrorMessage>
  )}
</FormControl>

<FormControl>
<FormLabel>PHYSICAL PURITY (MIN)</FormLabel>
 <Input type="number" name="physicalPurity" placeholder="enter in 10%,20%" min={0} max={100} onChange={handleChange}/>
{formData.germination > 100 && (
    <FormErrorMessage>Germination cannot exceed 100%</FormErrorMessage>
  )}
</FormControl>

<FormControl>
<FormLabel>GENETIC PURITY (MIN)</FormLabel>
<Input type="number" name="geneticPurity" placeholder="enter in 10%,20%" min={0} max={100} onChange={handleChange}/>
{formData.germination > 100 && (
    <FormErrorMessage>Germination cannot exceed 100%</FormErrorMessage>
  )}
</FormControl>

<FormControl>
<FormLabel>NET QTY of each reatil pak:</FormLabel>
<Input name="netQty" type='number' placeholder="enter net qty in number eg =" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>MOISTURE (MAX)</FormLabel>
<Input type="number" name="moisture" placeholder="enter moisture in %" min={0} max={100} onChange={handleChange}/>
{formData.germination > 100 && (
    <FormErrorMessage>Germination cannot exceed 100%</FormErrorMessage>
  )}
</FormControl>

<FormControl>
<FormLabel>VARIETY</FormLabel>
<Select name ="variety" Value="variety" onChange={handleChange} placeholder="--plese select--">
  <option  Value ="black">black</option>
  <option Value ="gold">gold</option>
  <option Value ="sliver">sliver</option>
  <option Value ="brown">brown</option>
  <option Value ="yellow">yellow</option>
</Select>
</FormControl>

<FormControl>
<FormLabel>LOT NO</FormLabel>
<Input name="lotNo" placeholder="enter moisture in number eg=1,2,3" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>BATCH NO</FormLabel>
<Input name="batchNo"  placeholder="batch no." onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>PACKED ON</FormLabel>
<Input type="date" 
    placeholder="DD-MM-YYYY" 
    name="packedOn"
   onChange={handleChange} />
</FormControl>

<FormControl>
<FormLabel>DATE OF TEST</FormLabel>
<Input type="date"   placeholder="DD-MM-YYYY"  name="dateOfTest" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>VALID UP TO</FormLabel>
<Input type="number"    placeholder="enter only months eg=6,5,36,24"  name="validUpto" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>TREATED WITH</FormLabel>
<Input name="treatedWith" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>NO. of POUCHES</FormLabel>
<Input name="pouches" placeholder="enter no of pouches" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>MRP (Rs)</FormLabel>
<Input name="mrp" type="number" placeholder="enter MRP" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>KHARIF</FormLabel>
<Input name="kharif" onChange={handleChange}/>
</FormControl>

<FormControl>
<FormLabel>RABI</FormLabel>
<Input name="rabi" onChange={handleChange}/>
</FormControl>
<FormControl>
<FormLabel>SUMMER</FormLabel>
<Input name="summer" onChange={handleChange}/>
</FormControl>

</SimpleGrid>

<Button mt={6} colorScheme="blue" type="submit">
Print
</Button>

</Box>

{/* MODAL */}

<Modal isOpen={isOpen} onClose={onClose} size="4xl">

<ModalOverlay />

<ModalContent p={4}>

<ModalBody>

{pdfUrl && (
<iframe
src={pdfUrl}
width="100%"
height="600px"
style={{ border: "none"}}
/>
)}

</ModalBody>

<ModalFooter justifyContent="center" gap={4}>

{/* PRINT BUTTON */}

<Button
colorScheme="blue"
onClick={() => {
const iframe = document.querySelector("iframe");
iframe.contentWindow.print();
}}
>
Print
</Button>

{/* DOWNLOAD BUTTON */}

<Button
colorScheme="green"
onClick={() => {

const link = document.createElement("a");
link.href = pdfUrl;
link.download = "truthful_label.pdf";
link.click();

}}
>
Download
</Button>

</ModalFooter>

</ModalContent>

</Modal>

</Box>

);
};


export default TruthfulLablePrint;