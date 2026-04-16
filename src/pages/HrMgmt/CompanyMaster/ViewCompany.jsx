import React, { useEffect, useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Divider,
  Image,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

const FieldBox = ({ label, value }) => {
  const renderValue = () => {
    if (value === null || value === undefined || value === "") return "-";
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
    borderColor="gray.200"
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

const ViewCompany = () => {
  const { id } = useParams();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const getCompanyDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`${API_ENDPOINTS.Get_comapany_by_id}/${id}`);

      if (res.status === 200) {
        setData(res.data?.data || {});
      }
    } catch (error) {
      toast({
        title: "Failed to fetch company details",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getCompanyDetails();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };
  // 
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box bg="#FFFFFF" minH="100vh" p={{ base: 2, md: 4 }} borderRadius="lg">
 <HStack justifyContent="space-between">
                    <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to="/dashboard">
                                <GoHomeFill color="#5570F1" />
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink fontSize="13px" as={Link} to="/company-master/comapny-list">Company List</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink fontSize="13px">View Company</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </HStack>


      <VStack align="stretch" spacing={5}>

        {/* Header */}
        <Box
          bg="white"
          borderRadius="xl"
          p={4}
          border="1px solid"
          borderColor="gray.200"
          boxShadow="sm"
        >
          <HStack justify="space-between" align="center">

            <Box>
              <Heading size="lg" color="gray.800">
                {data.company_name || "Company"}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Company Details
              </Text>
            </Box>

            {data.company_logo_url ? (
              <Avatar
                src={data.company_logo_url}
                name={data.company_name}
                size="lg"
                border="2px solid"
                borderColor="gray.200"
              />
            ) : (
              <Avatar
                name={getInitials(data.company_name)}
                size="lg"
                bg="blue.500"
                color="white"
              />
            )}

          </HStack>

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mt={5}>
            <FieldBox label="Company Name" value={data.company_name} />
            <FieldBox label="Email" value={data.email} />
            <FieldBox label="Phone" value={data.phone} />
            <FieldBox label="Created At" value={formatDate(data.created_at)} />
          </SimpleGrid>
        </Box>

        {/* Sections */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>

          {/* Address */}
          <GridItem>
            <SectionCard title="Address Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Country" value={data.country} />
                <FieldBox label="State" value={data.state} />
                <FieldBox label="Pincode" value={data.pincode} />
                <FieldBox label="Address" value={data.address} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          {/* Business */}
          <GridItem>
            <SectionCard title="Business Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="GSTIN" value={data.gstin} />
                <FieldBox label="PAN No" value={data.pan_no} />
                <FieldBox label="CIN No" value={data.cin_no} />
                <FieldBox label="License No" value={data.license_no} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          {/* License */}
          <GridItem>
            <SectionCard title="License Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Seeds License" value={data.seeds_license_no} />
                <FieldBox label="Pesticide License" value={data.pesticide_license_no} />
                <FieldBox label="Fertilizer License" value={data.fertilizer_license_no} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          {/* Banking */}
          <GridItem>
            <SectionCard title="Bank Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Bank Name" value={data.bank_name} />
                <FieldBox label="Account No" value={data.account_no} />
                <FieldBox label="IFSC Code" value={data.ifsc_code} />
                <FieldBox label="Account Holder" value={data.account_holder_name} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          {/* Dates */}
          <GridItem>
            <SectionCard title="Financial Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FieldBox label="Financial Year Begin" value={formatDate(data.financial_year_begin)} />
                <FieldBox label="Books Begin From" value={formatDate(data.books_begin_from)} />
              </SimpleGrid>
            </SectionCard>
          </GridItem>

          {/* Images */}
          <GridItem>
            <SectionCard title="Company Images">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {data.company_logo_url ? (
                  <Image
                    src={data.company_logo_url}
                    alt="Logo"
                    maxH="150px"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                  />
                ) : (
                  <Text>-</Text>
                )}

                {data.signature_url ? (
                  <Image
                    src={data.signature_url}
                    alt="Signature"
                    maxH="150px"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                  />
                ) : (
                  <Text>-</Text>
                )}
              </SimpleGrid>
            </SectionCard>
          </GridItem>

        </Grid>

      </VStack>
    </Box>
  );
};

export default ViewCompany;