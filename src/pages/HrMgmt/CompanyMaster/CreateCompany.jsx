import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  FormControl,
  FormLabel,
  VStack,
  Input,
  Button,
  SimpleGrid,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { Smile } from "lucide-react";

const CreateCompany = () => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://103.110.127.211:8080/WeaverBO/com/stpl/pms/action/bo/um/bo_um_createCompany.action",
        formData
      );

      toast({
        title: "Company Created Successfully",
        status: "success",
        duration: 3000,
      });

      console.log(response.data);

    } catch (error) {
      toast({
        title: "Failed to create company",
        status: "error",
        duration: 3000,
      });

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box   mt={10} p={8}  borderRadius="lg" bg="white">
      <Heading size="md" textAlign="center" mb={6}>
        Create Company
      </Heading>

      <Box as="form" onSubmit={handleSubmit}>
                         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={5} >


          <FormControl isRequired>
            <FormLabel>Company Name</FormLabel>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Address</FormLabel>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </FormControl>
</SimpleGrid>
           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={5} >

          <FormControl isRequired>
            <FormLabel>City</FormLabel>
            <Input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
            />
           </FormControl>
         

          <FormControl isRequired>
            <FormLabel>State</FormLabel>
            <Input
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state"
            />
          </FormControl>
          </SimpleGrid>
 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5} >
          <FormControl>
            <FormLabel>Zip Code</FormLabel>
            <Input
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="Enter zip code"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </FormControl>
</SimpleGrid>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5} >

          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Company GSTIN No.</FormLabel>
            <Input
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              placeholder="Enter GSTIN number"
            />
          </FormControl>
          </SimpleGrid>
 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5} >
          <FormControl>
            <FormLabel>Company License No.</FormLabel>
            <Input
              name="licenseNo"
              value={formData.licenseNo}
              onChange={handleChange}
              placeholder="Enter license number"
            />
          </FormControl>

      

          <FormControl>
            <FormLabel>Company Seeds License No.</FormLabel>
            <Input
              name="seedsLicenseNo"
              value={formData.seedsLicenseNo}
              onChange={handleChange}
              placeholder="Enter seeds license number"
            />
          </FormControl>
          </SimpleGrid>
<SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5} >
          <FormControl>
            <FormLabel>Company Pesticide License No.</FormLabel>
            <Input
              name="pesticideLicenseNo"
              value={formData.pesticideLicenseNo}
              onChange={handleChange}
              placeholder="Enter pesticide license number"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Company Fertilizer License No.</FormLabel>
            <Input
              name="fertilizerLicenseNo"
              value={formData.fertilizerLicenseNo}
              onChange={handleChange}
              placeholder="Enter fertilizer license number"
            />
          </FormControl>


</SimpleGrid>
<SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5} >
          <FormControl>
            <FormLabel>Company CIN REG No.</FormLabel>
            <Input
              name="cinRegNo"
              value={formData.cinRegNo}
              onChange={handleChange}
              placeholder="Enter CIN REG number"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Company PAN No.</FormLabel>
            <Input
              name="panNo"
              value={formData.panNo}
              onChange={handleChange}
              placeholder="Enter PAN number"
            />
          </FormControl>

</SimpleGrid>

<SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>
          <FormControl>
            <FormLabel>Bank Details(Bank Name).</FormLabel>
            <Input
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter bank name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bank Account No.</FormLabel>
            <Input
              name="bankAccountNo"
              value={formData.bankAccountNo}
              onChange={handleChange}
              placeholder="Enter bank account number"
            />
          </FormControl>
          </SimpleGrid>
<SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5} >
          <FormControl>
            <FormLabel> Confirm Bank Account No.</FormLabel>
            <Input
              name="confirmBankAccountNo"
              value={formData.confirmBankAccountNo}
              onChange={handleChange}
              placeholder="Enter confirm bank account number"
            />
          </FormControl>
          <FormControl>
            <FormLabel>IFSC Code</FormLabel>
            <Input
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="Enter IFSC code"
            />
          </FormControl>
</SimpleGrid>
<SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5} >
          <FormControl>
            <FormLabel>Bank Details(Account Holder Name)</FormLabel>
            <Input
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Enter account holder name"
            />
          </FormControl>

          <FormControl>
            <FormLabel> Upload Company Logo </FormLabel>
            <Input
              type="file" fontSize="13px" color="gray.500"
              name="companyLogoUrl"
              value={formData.companyLogoUrl}
              onChange={handleChange}
              placeholder="Enter company logo URL"
            />
          </FormControl>
          
             <FormControl isRequired>
      <FormLabel fontSize="13px" color="gray.600">
        Upload Signature
      </FormLabel>

      <VStack align="stretch" spacing={2}>
        <Input
          type="file"
          name="companySignatureUrl"
          fontSize="13px"
          w="100%"
          
        />

      </VStack>
    </FormControl>

</SimpleGrid>



         <Box textAlign="center" mt={8}>
            <Button
              w={{ base: "100%", md: "200px" }}
              colorScheme="blue" isLoading={loading}
            >
              Create
            </Button>
          </Box>
        
      </Box>
    </Box>
  );
};




export default CreateCompany
