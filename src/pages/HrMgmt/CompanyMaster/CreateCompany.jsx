import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  FormControl,
  FormLabel,
  VStack, HStack, BreadcrumbItem, BreadcrumbLink, Breadcrumb,
  Input,
  Button,
  SimpleGrid,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { Smile } from "lucide-react";
import { GoHomeFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

const CreateCompany = () => {
  const toast = useToast();
    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    company_name: "",
    account_no: "",
    confirm_account_no: "",
    country: "",
    state: "",
    pincode: "",
    address: "",
    financial_year_begin: "",
    books_begin_from: "",
    gstin: "",
    license_no: "",
    seeds_license_no: "",
    pesticide_license_no: "",
    fertilizer_license_no: "",
    cin_no: "",
    pan_no: "",
    bank_name: "",
    account_holder_name: "",
    ifsc_code: "",

  });

  const [loading, setLoading] = useState(false);
  // validation erros ---------------
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!formData.company_name) newErrors.company_name = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.address) newErrors.address = "Required";
    if (!formData.phone) newErrors.phone = "Required";

    if (formData.account_no !== formData.confirm_account_no) {
      newErrors.confirm_account_no = "Account numbers do not match";
       toast({
          title: "Please Check Confirm Account no.",
          status: "warning",
          duration: 3000,
        });
      
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Handle Input Change
  const handleChange = (e) => {
    console.log("btn target ")
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Form
  const handleSubmit = async (e) => {

    e.preventDefault();
    const isValid = validate();
    if (!isValid) return;
    setLoading(true);

    try {
      const formPayload = new FormData();

      Object.keys(formData).forEach((key) => {
        formPayload.append(key, formData[key] || "");
      });

      const response = await API.post(API_ENDPOINTS.create_company, formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status == 201) {
        toast({
          title: "Company Created Successfully",
          status: "success",
          duration: 3000,
        });
        
    //     setFormData({
    //  email: "",
    // phone: "",
    // company_name: "",
    // account_no: "",
    // confirm_account_no: "",
    // country: "",
    // state: "",
    // pincode: "",
    // address: "",
    // financial_year_begin: "",
    // books_begin_from: "",
    // gstin: "",
    // license_no: "",
    // seeds_license_no: "",
    // pesticide_license_no: "",
    // fertilizer_license_no: "",
    // cin_no: "",
    // pan_no: "",
    // bank_name: "",
    // account_holder_name: "",
    // ifsc_code: "",
    //     })
    setTimeout(() => {
       navigate("/company-master/comapny-list");
    }, 3000);
        
      }
      
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
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
    >
      <HStack justifyContent='space-between'>
        <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to='/dashboard'> <GoHomeFill color="#5570F1" /> </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink isCurrentPage color='#8B8D97' fontSize='13px'>Create Company</BreadcrumbLink>
          </BreadcrumbItem>

        </Breadcrumb>


      </HStack>
      <Heading size="md" textAlign="center" mb={6}>
        Create Company
      </Heading>

      <Box>
        <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={5} >


          <FormControl isRequired isInvalid={errors.company_name}>
            <FormLabel>Company Name</FormLabel>
            <Input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </FormControl>

          <FormControl isRequired isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </FormControl>

          <FormControl isRequired isInvalid={errors.address}>
            <FormLabel>Address</FormLabel>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </FormControl>
       

          <FormControl isRequired isInvalid={errors.country}>
            <FormLabel>Country</FormLabel>
            <Input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter country"
            />
          </FormControl>


          <FormControl isRequired isInvalid={errors.state}>
            <FormLabel>State</FormLabel>
            <Input
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state"
            />
          </FormControl>
       
        
          <FormControl isRequired isInvalid={errors.pincode}>
            <FormLabel>Zip Code</FormLabel>
            <Input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter pin code"
            />
          </FormControl>


       
       

          <FormControl isRequired isInvalid={errors.phone}>
            <FormLabel>Phone</FormLabel>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </FormControl>
          <formControl isRequired isInvalid={errors.financial_year_begin}>
            <FormLabel>Financial Year Begin</FormLabel>
            <Input

              name="financial_year_begin"
              type="date"
              value={formData.financial_year_begin} 
              onChange={handleChange}
              placeholder="Select financial year begin date"
            />
          </formControl>
          <formControl isRequired isInvalid={errors.books_begin_from}>
            <FormLabel>Books Begin From</FormLabel>
            <Input
              name="books_begin_from"
              type="date"
              value={formData.books_begin_from}
              onChange={handleChange}
              placeholder="Select books begin from date"
            />
          </formControl>

          <FormControl isRequired isInvalid={errors.gstin}>
            <FormLabel>Company GSTIN No.</FormLabel>
            <Input
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              placeholder="Enter GSTIN number"
            />
          </FormControl>
       
        
          <FormControl isRequired isInvalid={errors.license_no}>
            <FormLabel>Company License No.</FormLabel>
            <Input
              name="license_no"
              value={formData.license_no}
              onChange={handleChange}
              placeholder="Enter license number"
            />
          </FormControl>



          <FormControl isRequired isInvalid={errors.seeds_license_no}>
            <FormLabel>Company Seeds License No.</FormLabel>
            <Input
              name="seeds_license_no"
              value={formData.seeds_license_no}
              onChange={handleChange}
              placeholder="Enter seeds license number"
            />
          </FormControl>
        
      
          <FormControl isRequired isInvalid={errors.pesticide_license_no}>
            <FormLabel>Company Pesticide License No.</FormLabel>
            <Input
              name="pesticide_license_no"
              value={formData.pesticide_license_no}
              onChange={handleChange}
              placeholder="Enter pesticide license number"
            />
          </FormControl>
          <FormControl isRequired isInvalid={errors.fertilizer_license_no}>
            <FormLabel>Company Fertilizer License No.</FormLabel>
            <Input
              name="fertilizer_license_no"
              value={formData.fertilizer_license_no}
              onChange={handleChange}
              placeholder="Enter fertilizer license number"
            />
          </FormControl>


       
       
          <FormControl isRequired isInvalid={errors.cin_no}>
            <FormLabel>Company CIN REG No.</FormLabel>
            <Input
              name="cin_no"
              value={formData.cin_no}
              onChange={handleChange}
              placeholder="Enter CIN REG number"
            />
          </FormControl>
          <FormControl isRequired isInvalid={errors.pan_no}>
            <FormLabel>Company PAN No.</FormLabel>
            <Input
              name="pan_no"
              value={formData.pan_no}
              onChange={handleChange}
              placeholder="Enter PAN number"
            />
          </FormControl>

       

       
          <FormControl isRequired isInvalid={errors.bank_name}>
            <FormLabel>Bank Details(Bank Name).</FormLabel>
            <Input
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              placeholder="Enter bank name"
            />
          </FormControl>

          <FormControl isRequired isInvalid={errors.account_no}>
            <FormLabel>Bank Account No.</FormLabel>
            <Input
              name="account_no"
              value={formData.account_no}
              onChange={handleChange}
              placeholder="Enter bank account number"
            />
          </FormControl>
       
      
          <FormControl isRequired isInvalid={errors.confirm_account_no}>
            <FormLabel> Confirm Bank Account No.</FormLabel>
            <Input
              name="confirm_account_no"
              value={formData.confirm_account_no}
              onChange={handleChange}
              placeholder="Enter confirm bank account number"
            />
          </FormControl>
          <FormControl isRequired isInvalid={errors.ifsc_code}>
            <FormLabel>IFSC Code</FormLabel>
            <Input
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
              placeholder="Enter IFSC code"
            />
          </FormControl>
      
        
          <FormControl isRequired isInvalid={errors.account_holder_name}>
            <FormLabel>Bank Details(Account Holder Name)</FormLabel>
            <Input
              name="account_holder_name"
              value={formData.account_holder_name}
              onChange={handleChange}
              placeholder="Enter account holder name"
            />
          </FormControl>

          <FormControl isRequired isInvalid={errors.company_logo}>
            <FormLabel> Upload Company Logo </FormLabel>
            <Input
              type="file"
              name="company_logo"
              onChange={(e) =>
                setFormData({ ...formData, company_logo: e.target.files[0] })
              }
            />
          </FormControl>

          <FormControl isRequired isInvalid={errors.signature}>
            <FormLabel fontSize="13px" color="gray.600">
              Upload Signature
            </FormLabel>

            <VStack align="stretch" spacing={2}>
              <Input
                type="file"
                name="signature"
                onChange={(e) =>
                  setFormData({ ...formData, signature: e.target.files[0] })
                }
                placeholder="Upload signature"
                fontSize="13px"
                w="100%"

              />

            </VStack>
          </FormControl>

        </SimpleGrid>



        <Box textAlign="center" mt={8}>
          <Button
           
            type="submit"
            colorScheme="blue"
            size="md"
            isLoading={loading}
          
          >
            Create
          </Button>
 
        </Box>
</form>
      </Box>
      
    </Box>
  );
};




export default CreateCompany
