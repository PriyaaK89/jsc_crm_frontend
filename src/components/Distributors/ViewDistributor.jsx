import React, { useEffect, useState } from "react";
import {
  Box, VStack, HStack, BreadcrumbItem, BreadcrumbLink, Breadcrumb,
  Grid,
  GridItem,
  Heading,
  Text,
  SimpleGrid,
  Divider,
  Badge,
  Image,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const FieldBox = ({ label, value }) => {
    
  const renderValue = () => {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "object") {
      return JSON.stringify(value); // 👈 ya custom format
    }

    return value;
  };

  return (
    <Box>
      <Text fontSize="sm" color="gray.500" mb={1}>
        {label}
      </Text>
      <Text fontSize="md" fontWeight="medium" color="gray.800">
        {renderValue()}
      </Text>
    </Box>
  );
};
const SectionCard = ({ title, children }) => (
  <Box
    bg="white"
    border="1px solid"
    borderColor="gray.300"
    borderRadius="xl"
    p={5}
    boxShadow="sm"
  >
    <Heading size="md" mb={4} color="gray.700">
      {title}
    </Heading>
    {children}
  </Box>
);

const ViewDistributor = () => {
  const { id } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [ownerDetails, setOwnerDetails] = useState({});
    const [companies, setCompanies] = useState([]);
    const [partners, setPartners] = useState([]);

  const getDistributorDetails = async () => {
    try {
      setLoading(true);

      const response = await API.get(`${API_ENDPOINTS.get_distributor}/${id}`);

      if (response.status === 200 || response.data.success) {
        // const data = response.data.data || response.data;
        // setFormData(response.data.data || response.data);
        const resData = response.data.data || response.data;

  setFormData(resData.distributor || {});
  setOwnerDetails(resData.partners?.[0] || {});
    setCompanies(resData.companies || []);
    setPartners(resData.partners || []);

      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({
        title: "Failed to fetch distributor details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getDistributorDetails();
    }
  }, [id]);


  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
// foemm date --
const formatDateTime = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


  return (
    <Box bg="#FFFFFF" minH="100vh" p={{ base: 2, md: 4 }} borderRadius="lg" boxShadow="sm">
      <HStack justifyContent='space-between'>
                      <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                        <BreadcrumbItem>
                          <BreadcrumbLink as={Link} to='/dashboard'> <GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                          <BreadcrumbLink as={Link} to='/distributor/distributorlist' color='#8B8D97' fontSize='13px'> Distributor List </BreadcrumbLink>
                        </BreadcrumbItem>
              
                        <BreadcrumbItem>
                          <BreadcrumbLink isCurrentPage color='#8B8D97' fontSize='13px'> View Distributor Details  </BreadcrumbLink>
                        </BreadcrumbItem>
              
                      </Breadcrumb>
              
              
                    </HStack>
      
      <VStack align="stretch" spacing={5}>
        <Box
          bg="white"
          borderRadius="xl"
          p={4}
          border="1px solid"
          borderColor="gray.300"
          boxShadow="sm"
        >
          <Heading size="lg" color="gray.800">
            Distributor Details
          </Heading>
          {/* <Text mt={2} color="gray.600">
            Complete distributor profile and agreement information
          </Text> */}

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mt={5}>
            <Box>
              <Text fontSize="sm" color="gray.500">Firm Name</Text>
              <Text fontSize="md" fontWeight="bold">{formData.firm_name || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.500">Customer Name</Text>
              <Text fontSize="md" fontWeight="bold">{formData.customer_name || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.500">Firm Type</Text>
              <Badge colorScheme="blue" fontSize="0.9em" px={3} py={1} borderRadius="full">
                {formData.firm_type || "-"}
              </Badge>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.500">Created At</Text>
              <Text fontSize="md" fontWeight="bold">{formatDateTime(formData.created_at) || "-"}</Text>
            </Box>
          </SimpleGrid>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
          <GridItem>
            <SectionCard title="Basic Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Customer Name" value={formData.customer_name} />
                <FieldBox label="Customer DOB" value={formData.customer_dob} />
                <FieldBox label="Firm Name" value={formData.firm_name} />
                <FieldBox label="GST Number" value={formData.gst_number} />
                <FieldBox label="Firm Type" value={formData.firm_type} />
                <FieldBox label="Firm Email" value={formData.firm_email} />
                <FieldBox label="Firm PAN" value={formData.firm_pan} />
                <FieldBox label="Firm Since" value={formatDateTime(formData.firm_since)} />
                <FieldBox label="Branch" value={formData.branch} />
                <FieldBox label="Jurisdiction Area" value={formData.jurisdiction_area} />
                <FieldBox label="Business Territory" value={formData.business_territory} />
                <FieldBox label="Created By" value={formData.created_by_name || formData.created_by} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          <GridItem>
            <SectionCard title="Business Address">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Business Address" value={formData.business_address} />
                <FieldBox label="Business Territory" value={formData.business_territory} />
                <FieldBox label="State" value={formData.state} />
                <FieldBox label="District" value={formData.district} />
                <FieldBox label="Tehsil" value={formData.tehsil} />
                <FieldBox label="Landmark" value={formData.landmark} />
                <FieldBox label="Firm Landmark" value={formData.firm_landmark} />
                <FieldBox label="Pin Code" value={formData.pin_code} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          <GridItem>
            <SectionCard title="Contact Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Contact Number" value={formData.contact_number} />
                <FieldBox label="Alt Contact Number" value={formData.alt_contact_number} />
                <FieldBox label="Responsible Person" value={formData.responsible_person_name} />
                <FieldBox label="Responsible Address" value={formData.responsible_person_address} />
                <FieldBox label="Responsible Contact" value={formData.responsible_person_contact} />
                <FieldBox label="Responsible Alt Contact" value={formData.responsible_person_alt_contact} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          <GridItem>
            <SectionCard title="License Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Seed License No" value={formData.seed_license_no} />
                <FieldBox label="Seed License Expiry" value={formData.seed_license_expiry} />
                <FieldBox label="Fertilizer License No" value={formData.fertilizer_license_no} />
                <FieldBox label="Pesticide License No" value={formData.pesticide_license_no} />
                <FieldBox label="Transport Name A" value={formData.transport_name_a} />
                <FieldBox label="Transport Name B" value={formData.transport_name_b} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          <GridItem>
            <SectionCard title="Banking Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Bank Name" value={formData.bank_name} />
                <FieldBox label="Bank Account No" value={formData.bank_account_no} />
                <FieldBox label="IFSC Code" value={formData.ifsc_code} />
                <FieldBox label="Bank Branch" value={formData.bank_branch} />
                <FieldBox label="Security Cheque No 1" value={formData.security_cheque_no} />
                <FieldBox label="Security Cheque No 2" value={formData.security_cheque_no_2} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          <GridItem>
            <SectionCard title="Financial Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Source Of Funds" value={formData.source_of_funds} />
                <FieldBox label="Own Funds Details" value={formData.own_funds_details} />
                <FieldBox label="Security Amount" value={formData.security_amount} />
                <FieldBox label="Credit Amount" value={formData.credit_amount} />
                <FieldBox label="Credit Limit" value={formData.credit_limit} />
                <FieldBox label="Credit Duration" value={formData.credit_duration} />
                <FieldBox label="Annual Turnover" value={formData.annual_turnover} />
                <FieldBox label="Expected Sale" value={formData.expected_sale} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          <GridItem>
            <SectionCard title="Approval Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Approver Name" value={formData.approver_name} />
                <FieldBox label="Approving Date" value={formatDateTime(formData.approving_date)} />
              </SimpleGrid>

              <Divider my={4} />

              <Text fontSize="sm" color="gray.500" mb={2}>
                Approving Image
              </Text>
              {formData.approving_image ? (
                <Image
                  src={formData.approving_image}
                  alt="Approving"
                  maxH="180px"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.300"
                />
              ) : (
                <Text>-</Text>
              )}
            </SectionCard>
          </GridItem>
        </Grid>

        {formData?.firm_type === "proprietorship" && (
          <SectionCard title="Proprietor Details">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Name" value={ownerDetails?.name} />
                <FieldBox label="DOB" value={ownerDetails?.father_name} />
                <FieldBox label="Mobile" value={ownerDetails?.mobile_no} />
                <FieldBox label="Alt Mobile" value={ownerDetails?.alt_mobile_no} />
                <FieldBox label="PAN" value={ownerDetails?.pan_no} />
                <FieldBox label="Aadhar" value={ownerDetails?.aadhar_no} />
                <FieldBox label="Address" value={ownerDetails?.address} />
                <FieldBox label="State" value={ownerDetails?.state} />
                <FieldBox label="District" value={ownerDetails?.district} />
                <FieldBox label="Pincode" value={ownerDetails?.pincode} />
                </SimpleGrid>
            </SectionCard>
         )} 

{formData?.firm_type=== "Partnership" && (
        <SectionCard title="Partners">
          {partners?.length > 0 ? (
            <VStack align="stretch" spacing={4}>
              {partners.map((partner, index) => (
                <Box
                  key={index}
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="lg"
                  p={4}
                >
                  <Heading size="sm" mb={3}>
                    Partner {index + 1}
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FieldBox label="Name" value={partner.name} />
                    <FieldBox label="Father Name" value={partner.father_name} />
                    <FieldBox label="Mobile" value={partner.mobile_no} />
                    <FieldBox label="Alt Mobile" value={partner.alt_mobile_no} />
                    <FieldBox label="PAN" value={partner.pan_no} />
                    <FieldBox label="Aadhar" value={partner.aadhar_no} />
                    <FieldBox label="Address" value={partner.address} />
                    <FieldBox label="State" value={partner.state} />
                    <FieldBox label="District" value={partner.district} />
                    <FieldBox label="Pincode" value={partner.pincode} />
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No partners available</Text>
          )}
        </SectionCard>
)}



        <SectionCard title="Companies">
          {companies.length > 0 ? (
            <VStack align="stretch" spacing={4}>
              {companies.map((company, index) => (
                <Box
                  key={index}
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="lg"
                  p={4}
                >
                  <Heading size="sm" mb={3}>
                    Company {index + 1}
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FieldBox label="Name" value={company.name} />
                    <FieldBox label="Turnover" value={company.turnover} />
                  </SimpleGrid>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No companies available</Text>
          )}
        </SectionCard>

      </VStack>
    </Box>
  );
};

export default ViewDistributor
