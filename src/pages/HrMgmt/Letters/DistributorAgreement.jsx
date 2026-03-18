import React, { useState } from "react";
import {
  Box,Breadcrumb,BreadcrumbItem,BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  Input,useDisclosure,
  Heading,
  SimpleGrid,
  VStack
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import DistributorAgreementPreview from "./DistributorAgreementPreview";

function DistributorAgreement() {
     const { isOpen, onOpen, onClose } = useDisclosure();

    const [formData, setFormData] = useState({
  branch: "",
  firm_name: "",
  business_address: "",
  contact_person: "",
  phone: "",
  email: "",
  gst_no: "",
  pan_no: "",
  seed_license: "",
  fertilizer_license: "",
  pesticide_license: "",
  years_of_business: "",
  bank_name: "",
  bank_account: "",
  security_cheque: "",
  annual_turnover: "",
  expected_sale: "",
});

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};
  return (
    <>
    <Box bg="white" p={6} borderRadius="lg">

         <Breadcrumb mb={6}>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">
                    <GoHomeFill color="#5570F1" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
        
                <BreadcrumbItem>
                  <BreadcrumbLink fontSize="13px">
                  Distributor Agreement Form
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>

<Heading size="md" mb={6}>
Distributor Agreement Form
</Heading>

<SimpleGrid columns={{ base:1, md:2 }} spacing={5}>

<FormControl>
<FormLabel>Branch</FormLabel>
<Input
name="branch"
value={formData.branch}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>Firm Name</FormLabel>
<Input
name="firm_name"
value={formData.firm_name}
onChange={handleChange}
/>
</FormControl>

<FormControl gridColumn="span 2">
<FormLabel>Business Address</FormLabel>
<Input
name="business_address"
value={formData.business_address}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>Contact Person</FormLabel>
<Input
name="contact_person"
value={formData.contact_person}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>Phone</FormLabel>
<Input
name="phone"
value={formData.phone}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>Email</FormLabel>
<Input
name="email"
value={formData.email}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>GST Number</FormLabel>
<Input
name="gst_no"
value={formData.gst_no}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>PAN Number</FormLabel>
<Input
name="pan_no"
value={formData.pan_no}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>Seed License No</FormLabel>
<Input
name="seed_license"
value={formData.seed_license}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>Fertilizer License</FormLabel>
<Input
name="fertilizer_license"
value={formData.fertilizer_license}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>Bank Name</FormLabel>
<Input
name="bank_name"
value={formData.bank_name}
onChange={handleChange}
/>
</FormControl>

<FormControl>
<FormLabel>Bank Account No</FormLabel>
<Input
name="bank_account"
value={formData.bank_account}
onChange={handleChange}
/>
</FormControl>

</SimpleGrid>

<Button
colorScheme="blue"
mt={6}
onClick={onOpen}
>
Create 
</Button>

 <DistributorAgreementPreview
        isOpen={isOpen}
        onClose={onClose}
        formData={formData}
      />

</Box>

      
    </>
  )
}

export default DistributorAgreement
