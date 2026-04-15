import React, { useEffect, useState } from "react";
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    Button,
    SimpleGrid,
    Heading, VStack,
    useToast,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Center } from "@chakra-ui/react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

const EditCompany = () => {
    const { id } = useParams();
    const toast = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [preview, setPreview] = useState({
        logo: "",
        signature: "",
    });

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

    // date formate 
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split("T")[0];
    };

    useEffect(() => {
        getCompanyDetails();
    }, []);

    const getCompanyDetails = async () => {
        try {
            const res = await API.get(`${API_ENDPOINTS.Get_comapany_by_id}/${id}`);

            if (res.status === 200) {

                const data = res.data?.data || {};
                setPreview({
                    logo: data.company_logo_url || "",
                    signature: data.signature_url || "",
                });

                setFormData({
                    company_name: data.company_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    account_no: data.account_no || "",
                    confirm_account_no: data.account_no || "",
                    bank_name: data.bank_name || "",
                    ifsc_code: data.ifsc_code || "",
                    account_holder_name: data.account_holder_name || "",
                    gstin: data.gstin || "",
                    pan_no: data.pan_no || "",
                    country: data.country || "",
                    state: data.state || "",
                    pincode: data.pincode || "",
                    financial_year_begin: formatDate(data.financial_year_begin),
                    books_begin_from: formatDate(data.books_begin_from),
                    license_no: data.license_no || "",
                    seeds_license_no: data.seeds_license_no || "",
                    pesticide_license_no: data.pesticide_license_no || "",
                    fertilizer_license_no: data.fertilizer_license_no || "",
                    cin_no: data.cin_no || "",
                });

            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Failed to fetch company data",
                status: "error",
            });
        } finally {
            setFetchLoading(false);
        }
    };


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    //  UPDATE API
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.account_no !== formData.confirm_account_no) {
            toast({
                title: "Account numbers do not match",
                status: "error",
            });
            return;
        }

        setLoading(true);

        try {
            const formPayload = new FormData();

            Object.keys(formData).forEach((key) => {
                if (
                    formData[key] !== null &&
                    formData[key] !== "" &&
                    key !== "confirm_account_no"
                ) {
                    formPayload.append(key, formData[key]);
                }
            });

            const res = await API.put(
                `${API_ENDPOINTS.Update_comapany}/${id}`,
                formPayload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.status === 200) {
                toast({
                    title: "Company Updated Successfully",
                    status: "success",
                });

                navigate("/company-master/comapny-list");
            }

        } catch (error) {
            console.error(error);
            toast({
                title: "Update failed",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <Center h="60vh">
                <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
            </Center>
        );
    }





    return (
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={6} textAlign="center">
                Edit Company
            </Heading>

            <form onSubmit={handleSubmit}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>




                    <FormControl >
                        <FormLabel>Company Name</FormLabel>
                        <Input
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            placeholder="Enter company name"
                        />
                    </FormControl>

                    <FormControl >
                        <FormLabel>Email</FormLabel>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                        />
                    </FormControl>

                    <FormControl >
                        <FormLabel>Address</FormLabel>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter address"
                        />
                    </FormControl>


                    <FormControl >
                        <FormLabel>Country</FormLabel>
                        <Input
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Enter country"
                        />
                    </FormControl>


                    <FormControl >
                        <FormLabel>State</FormLabel>
                        <Input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Enter state"
                        />
                    </FormControl>


                    <FormControl >
                        <FormLabel>Zip Code</FormLabel>
                        <Input
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="Enter pin code"
                        />
                    </FormControl>

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
                        <FormLabel>Financial Year Begin</FormLabel>
                        <Input

                            name="financial_year_begin"
                            type="date"
                            value={formData.financial_year_begin}
                            onChange={handleChange}
                            placeholder="Select financial year begin date"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Books Begin From</FormLabel>
                        <Input
                            name="books_begin_from"
                            type="date"
                            value={formData.books_begin_from}
                            onChange={handleChange}
                            placeholder="Select books begin from date"
                        />
                    </FormControl>

                    <FormControl >
                        <FormLabel>Company GSTIN No.</FormLabel>
                        <Input
                            name="gstin"
                            value={formData.gstin}
                            onChange={handleChange}
                            placeholder="Enter GSTIN number"
                        />
                    </FormControl>


                    <FormControl >
                        <FormLabel>Company License No.</FormLabel>
                        <Input
                            name="license_no"
                            value={formData.license_no}
                            onChange={handleChange}
                            placeholder="Enter license number"
                        />
                    </FormControl>



                    <FormControl>
                        <FormLabel>Company Seeds License No.</FormLabel>
                        <Input
                            name="seeds_license_no"
                            value={formData.seeds_license_no}
                            onChange={handleChange}
                            placeholder="Enter seeds license number"
                        />
                    </FormControl>


                    <FormControl>
                        <FormLabel>Company Pesticide License No.</FormLabel>
                        <Input
                            name="pesticide_license_no"
                            value={formData.pesticide_license_no}
                            onChange={handleChange}
                            placeholder="Enter pesticide license number"
                        />
                    </FormControl>
                    <FormControl >
                        <FormLabel>Company Fertilizer License No.</FormLabel>
                        <Input
                            name="fertilizer_license_no"
                            value={formData.fertilizer_license_no}
                            onChange={handleChange}
                            placeholder="Enter fertilizer license number"
                        />
                    </FormControl>


                    <FormControl >
                        <FormLabel>Company CIN REG No.</FormLabel>
                        <Input
                            name="cin_no"
                            value={formData.cin_no}
                            onChange={handleChange}
                            placeholder="Enter CIN REG number"
                        />
                    </FormControl>
                    <FormControl >
                        <FormLabel>Company PAN No.</FormLabel>
                        <Input
                            name="pan_no"
                            value={formData.pan_no}
                            onChange={handleChange}
                            placeholder="Enter PAN number"
                        />
                    </FormControl>

                    <FormControl >
                        <FormLabel>Bank Details(Bank Name).</FormLabel>
                        <Input
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleChange}
                            placeholder="Enter bank name"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Bank Account No.</FormLabel>
                        <Input
                            name="account_no"
                            value={formData.account_no}
                            onChange={handleChange}
                            placeholder="Enter bank account number"
                        />
                    </FormControl>


                    <FormControl >
                        <FormLabel> Confirm Bank Account No.</FormLabel>
                        <Input
                            name="confirm_account_no"
                            value={formData.confirm_account_no}
                            onChange={handleChange}
                            placeholder="Enter confirm bank account number"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>IFSC Code</FormLabel>
                        <Input
                            name="ifsc_code"
                            value={formData.ifsc_code}
                            onChange={handleChange}
                            placeholder="Enter IFSC code"
                        />
                    </FormControl>


                    <FormControl >
                        <FormLabel>Bank Details(Account Holder Name)</FormLabel>
                        <Input
                            name="account_holder_name"
                            value={formData.account_holder_name}
                            onChange={handleChange}
                            placeholder="Enter account holder name"
                        />
                    </FormControl>


                    <FormControl>
                        <FormLabel>Upload Logo</FormLabel>
                        <Input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files[0];

                                setFormData({
                                    ...formData,
                                    company_logo: file,
                                });

                                if (file) {
                                    setPreview({
                                        ...preview,
                                        logo: URL.createObjectURL(file),
                                    });
                                }
                            }}
                        />
                    </FormControl>
                 

                    <FormControl>
                        <FormLabel>Upload Signature</FormLabel>
                        <Input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files[0];

                                setFormData({
                                    ...formData,
                                    signature: file,
                                });

                                if (file) {
                                    setPreview({
                                        ...preview,
                                        signature: URL.createObjectURL(file),
                                    });
                                }
                            }}
                        />
                    </FormControl>
                    <Box display="flex" gridColumn="span 2" width="100%" justifyContent="space-between">
                       {preview.logo && (
                        <Box mt={2} border="1px solid gray" width="100%" m={2}>
                            <FormLabel>Company logo</FormLabel>
                            <img
                                src={preview.logo}
                                alt="Company Logo"
                                style={{ width: "100px", borderRadius: "8px" }}
                            />
                        </Box>
                    )}
                    {preview.signature && (
                        <Box mt={2} width="100%" border="1px solid gray" m={2}>
                            <img
                                src={preview.signature}
                                alt="Signature"
                                style={{ width: "100px", borderRadius: "8px" }}
                            />
                        </Box>
                    )}
                    </Box>
                    {loading && (
                        <Center
                            position="fixed"
                            top="0"
                            left="0"
                            w="100%"
                            h="100%"
                            bg="rgba(0,0,0,0.3)"
                            zIndex="999"
                        >
                            <Spinner size="xl" color="white" />
                        </Center>
                    )}
                </SimpleGrid>

                <Box textAlign="center" mt={6}>
                    <Button type="submit" colorScheme="blue" isLoading={loading}
                        loadingText="Updating...">
                        Update Company
                    </Button>
                </Box>
            </form>
        </Box>
    );
};



export default EditCompany
