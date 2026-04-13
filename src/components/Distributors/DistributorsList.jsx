import React, { useEffect, useState } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Text,
  Table,
  Img,
  Flex,
  Thead,
  Tr,
  Th,
  Tbody,
  InputLeftElement,
  Td,
  Button,
  Input,
  InputGroup,
  useDisclosure,
  IconButton,
  Select,
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import sort_icon from "../../assets/sort.svg";
import ViewDistributorsDocumentsModal from "./ViewDistributorsDocumentsModal";
import DistributorAgreementModel from "./DistributorAgreementModel";
import ViewCompanyModal from "./ViewCompanyModal";
import ViewPartnersModal from "./ViewPartnersModal";
import Pagination from "../../Pagination/Pagination";
import DeleteDistributorModal from "./DeleteDistributorModal";
import { FiSearch } from "react-icons/fi";
import { ViewIcon } from "@chakra-ui/icons";

import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

const DistributorsList = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("");
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()

  const {
    isOpen: isCompanyOpen,
    onOpen: onCompanyOpen,
    onClose: onCompanyClose,
  } = useDisclosure();
  const {
    isOpen: isPartnersOpen,
    onOpen: onPartnersOpen,
    onClose: onPartnersClose,
  } = useDisclosure();

  const {
    isOpen: ispenaltyModalOpen,
    onOpen: onpenaltyModalOpen,
    onClose: onpenaltyModalClose,
  } = useDisclosure();


  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const headers = [
    "S.No",
    "Customer Name",
    // "Cutomer Date of Birth",
    "Firm Name",
    "view Dist.",
    "GST No",
    // "GST Type",
    "Firm Type",
    "Business Address",
    "State",
    "District",
    // "Tehsil",
    // "Landmark",
    // "Pincode",
    "Contact Number",
    // "Alternate Contact Number",
    // "Renponsible Person Name",
    // "Renponsible Person Contact No",
    "Firm Email",
    // "Firm Pan",
    // "Firm Aadhar",
    // "Jurisdiction Area",
    // "Branch",
    "Seed License No",
    // "Fertilizer License No",
    // "Pesticide License No",
    // "Source of Funds",
    // "Own Funds Details",
    // "Bank Name",
    // "Bank Account No",
    // "IFSC Code",
    // "Bank Branch",
    // "Security Cheque No",
    "Security Amount",
    "Credit Duration",
    // "Annual Turnover",
    // "Expected Sale",
    // "Approver Name",
    // "Approvering Date",
    "Created At",
    // "Approver Image",
    // "Firm Landmark",
    // "Business Territory",
    // "Firm Landmark",
    // "Responsible Person Address",
    // "Responsible Person Alt Contact No",
    // "Firm Since",
    "Seed License Expiry",
    "Transport Name A",
    // "Transport Name B",
    // "Security Cheque No 2",
    "Created By Name",
    "Partners",
    "Companies",
    "Documents",
    "Distributor Agreement",
    "Action",
    "Delete"
  ];
  const widthMap = {
    "S No": "80px",
    "Customer Name": "180px",
    "Customer Date of Birth": "180px",
    "Firm Name": "200px",
    "GST No": "160px",
    "GST Type": "140px",
    "Firm Type": "140px",
    "Business Address": "250px",
    State: "140px",
    District: "140px",
    Tehsil: "140px",
    Landmark: "200px",
    Pincode: "120px",
    "Contact Number": "160px",
    "Alternate Contact Number": "180px",
    "Responsible Person Name": "200px",
    "Responsible Person Contact No": "200px",
    "Firm Email": "220px",
    "Firm Pan": "160px",
    "Firm Aadhar": "180px",
    "Jurisdiction Area": "200px",
    Branch: "140px",
    "Seed License No": "180px",
    "Fertilizer License No": "200px",
    "Pesticide License No": "200px",
    "Source of Funds": "180px",
    "Own Funds Details": "220px",
    "Bank Name": "180px",
    "Bank Account No": "200px",
    "IFSC Code": "140px",
    "Bank Branch": "180px",
    "Security Cheque No": "200px",
    "Security Amount": "160px",
    "Credit Duration": "160px",
    "Annual Turnover": "180px",
    "Expected Sale": "160px",
    "Approver Name": "180px",
    "Approvering Date": "180px",
    "Created At": "180px",
    // "Approver Image": "160px",
    "Business Territory": "200px",
    "Firm Landmark": "200px",
    "Responsible Person Address": "250px",
    "Responsible Person Alt Contact No": "220px",
    "Firm Since": "160px",
    "Seed License Expiry": "180px",
    "Transport Name A": "180px",
    "Transport Name B": "180px",
    "Security Cheque No 2": "200px",
    "Created By Name": "180px",
    Partners: "180px",
    Companies: "180px",
    Documents: "160px",
    Action: "180px",
  };

  const handleDelete = (id) => {
    onDeleteModalOpen();
    setSelectedId(id);

  }

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.get_distributors, {
        params: {
          page,
          limit,
          search,
          state: selectedState,
        },
      });

      if (response.status === 200) {
        setDistributors(response?.data?.data || response?.data || []);
        setPage(response?.data?.page);
        setTotalItems(response?.data?.total);
        setTotalPages(response?.data?.totalPages);
        setLimit(response?.data?.limit);
      }
    } catch (error) {
      console.error("Error fetching distributors:", error);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-Us", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchDistributors();
  }, [page, limit, search, selectedState]);

 const handleGenerateAgreement = async (id) => {
  try {
    setPdfLoading(true);

    const response = await API.get(
      `${API_ENDPOINTS.get_distributor_agreement_pdf}/${id}`
    );

    if (response.status === 200) {
      const data = response?.data?.data;

      // 🔥 priority order (important)
      const pdfLink =
        data?.signed_file_url ||   // if signed
        data?.presigned_url ||    // best option
        data?.file_url;           // fallback

      console.log("PDF LINK:", pdfLink);

      if (!pdfLink) {
        alert("PDF not available");
        return;
      }

      setPdfUrl(pdfLink);
    }
  } catch (error) {
    console.error("Error fetching PDF:", error);
  } finally {
    setPdfLoading(false);
  }
};

  return (
    <>
      <ViewDistributorsDocumentsModal
        isOpen={isOpen}
        onClose={onClose}
        distributor={selectedDistributor}
      />
      <DistributorAgreementModel
        isOpen={ispenaltyModalOpen}
        onClose={onpenaltyModalClose}
        pdfUrl={pdfUrl}
        loading={pdfLoading}
        selectedId={selectedId}
      />
      <ViewPartnersModal
        isOpen={isPartnersOpen}
        onClose={onPartnersClose}
        partners={selectedDistributor}
      />
      <ViewCompanyModal
        isOpen={isCompanyOpen}
        onClose={onCompanyClose}
        companies={selectedDistributor}
      />
      <DeleteDistributorModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        selectedId={selectedId}
        fetchDistributors={fetchDistributors}
      />
      <Box
        bg="white"
        mt={{ base: 2, md: 5 }}
        px={{ base: 3, md: 6 }}
        py={{ base: 3, md: 4 }}
        borderRadius="lg"
        boxShadow="md"
      >
        {/* Breadcrumb */}
        <HStack justifyContent="space-between">
          <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontSize="13px">Distributor List</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </HStack>

        <Flex justifyContent="space-between" mb={4} alignItems="center" gap={4}>
          {/* TITLE */}
          <Text color="#45464E" fontSize="13px" fontWeight="500">
            Distributor List Management
          </Text>

          {/* LEFT SIDE (Country + State) */}

          {/* State Dropdown */}
          <Select
            placeholder="Select State"
            w="150px"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {states.map((state, index) => (
              <option key={index} value={state}>
                {state}
              </option>
            ))}
          </Select>

          {/* SEARCH */}
          <Box w="20%">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="#8C8C91" />
              </InputLeftElement>

              <Input
                pl="40px"
                placeholder="Search by Employee Name"
                border="1px solid #CFD3D4"
                borderRadius="32px"
                value={search || ""}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Box>
        </Flex>

        {/* TABLE */}
        <Box
          overflowX="auto"
          whiteSpace="nowrap"
          sx={{
            "&::-webkit-scrollbar": { width: "8px", height: "8px" },
            "&::-webkit-scrollbar-thumb": {
              width: "8px",
              backgroundColor: "#7A7A7A",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#E8E8E8",
              borderRadius: "4px",
            },
          }}
        >
          <Table
            variant="striped"
            colorScheme="gray"
            size="sm"
            minW="2400px"
            className="productsTable"
          >
            {/* THEAD */}
            <Thead bg="#F9FAFB">
              <Tr>
                {headers.map((header, index) => (
                  <Th
                    key={index}
                    fontSize="14px"
                    fontWeight="500"
                    color="#2C2D33"
                    textTransform="capitalize"
                    width={widthMap[header]}
                  >
                    <Flex align="center" gap="7px">
                      <Text fontSize="14px">{header}</Text>
                      <Img src={sort_icon} alt="sort" />
                    </Flex>
                  </Th>
                ))}
              </Tr>
            </Thead>

            {/* TBODY */}
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={headers.length} textAlign="center">
                    Loading...
                  </Td>
                </Tr>
              ) : distributors.length === 0 ? (
                <Tr>
                  <Td colSpan={headers.length} textAlign="center">
                    No Data Founds
                  </Td>
                </Tr>
              ) : (
                distributors.map((item, index) => (
                  <Tr key={index}>
                    <Td>{(page - 1) * limit + index + 1}</Td>
                    <Td>{item?.customer_name || "-"}</Td>
                    {/* <Td> {formatDate(item?.customer_dob || "-")} </Td> */}
                    <Td>{item?.firm_name || "-"}</Td>

                    <Td> <IconButton
                      icon={<ViewIcon />}
                      size="sm"
                      variant="ghost"
                      color="blue.600"
                      _hover={{ bg: "blue.50" }}
                      aria-label="view Distributor"
                      onClick={() => {
                        navigate(`/accounting-master/view-distributor/${item?.id}`);
                      }}
                    /></Td>
                    <Td>{item?.gst_number || "-"}</Td>
                    {/* <Td>{item?.gst_type || "-"}</Td> */}
                    <Td>{item?.firm_type || "-"}</Td>
                    <Td>{item?.business_address || "-"}</Td>
                    <Td>{item?.state || "-"}</Td>
                    <Td>{item?.district || "-"}</Td>
                    {/* <Td>{item?.tehsil || "-"}</Td> */}
                    {/* <Td>{item?.landmark || "-"}</Td> */}
                    {/* <Td>{item?.pincode || "-"}</Td> */}
                    <Td>{item?.contact_number || "-"}</Td>
                    {/* <Td>{item?.alt_contact_number || "-"}</Td> */}
                    {/* <Td>{item?.responsible_person_name || "-"}</Td> */}
                    {/* <Td>{item?.responsible_person_contact || "-"}</Td> */}
                    <Td>{item?.firm_email || "-"}</Td>
                    {/* <Td>{item?.firm_pan || "-"}</Td> */}
                    {/* <Td>{item?.firm_aadhar || "-"}</Td> */}
                    {/* <Td>{item?.jurisdiction_area || "-"}</Td> */}
                    {/* <Td>{item?.branch || "-"}</Td> */}
                    <Td>{item?.seed_license_no || "-"}</Td>
                    {/* <Td>{item?.fertilizer_license_no || "-"}</Td> */}
                    {/* <Td>{item?.pesticide_license_no || "-"}</Td> */}
                    {/* <Td>{item?.source_of_funds || "-"}</Td> */}
                    {/* <Td>{item?.own_funds_details || "-"}</Td> */}
                    {/* <Td>{item?.bank_name || "-"}</Td> */}
                    {/* <Td>{item?.bank_account_no || "-"}</Td> */}
                    {/* <Td>{item?.ifsc_code || "-"}</Td> */}
                    {/* <Td>{item?.bank_branch || "-"}</Td> */}
                    {/* <Td>{item?.security_cheque_no || "-"}</Td> */}
                    <Td>{item?.security_amount || "-"}</Td>
                    <Td>{item?.credit_duration || "-"}</Td>
                    {/* <Td>{item?.annual_turnover || "-"}</Td> */}
                    {/* <Td>{item?.expected_sale || "-"}</Td> */}
                    {/* <Td>{item?.approver_name || "-"}</Td> */}
                    {/* <Td> {formatDate(item?.approving_date || "-")} </Td> */}

                    <Td> {formatDateTime(item?.created_at || "-")} </Td>
                    {/* <Td>
                      <Img
                        src={item?.approver_image}
                        alt="approver image"
                        boxSize="16px"
                        cursor="pointer"
                      />
                    </Td> */}
                    {/* <Td>{item?.business_territory || "-"}</Td> */}
                    {/* <Td>{item?.firm_landmark || "-"}</Td> */}
                    {/* <Td>{item?.responsible_person_address || "-"}</Td> */}
                    {/* <Td>{item?.responsible_person_alt_contact || "-"}</Td> */}
                    {/* <Td> {formatDate(item?.firm_since || "-")}</Td> */}
                    <Td> {formatDate(item?.seed_license_expiry || "-")}</Td>
                    <Td>{item?.transport_name_a || "-"}</Td>
                    {/* <Td>{item?.transport_name_b || "-"}</Td> */}
                    {/* <Td>{item?.security_cheque_no_2 || "-"}</Td> */}
                    <Td>{item?.created_by_name || "-"}</Td>
                    <Td>
                      <Button
                        colorScheme="blue"
                        size="xs"
                        onClick={() => {
                          setSelectedDistributor(item?.partners);
                          onPartnersOpen();
                        }}
                      >
                        View Partners
                      </Button>
                    </Td>
                    <Td>
                      <Button
                        colorScheme="green"
                        size="xs"
                        onClick={() => {
                          setSelectedDistributor(item?.companies);
                          onCompanyOpen();
                        }}
                      >
                        View Companies
                      </Button>
                    </Td>
                    <Td>
                      <Button
                        colorScheme="purple"
                        size="xs"
                        onClick={() => {
                          setSelectedDistributor(item?.documents);
                          onOpen();
                        }}
                      >
                        View Document
                      </Button>
                    </Td>
                    <Td>
                      <Button
                        colorScheme="teal"
                        size="xs"
                        onClick={() => {
                          setSelectedId(item?.id);
                           handleGenerateAgreement(item?.id); 
                          onpenaltyModalOpen();
                        }}
                      >
                        View Agreement
                      </Button>
                    </Td>

                    <Td>

                      <IconButton
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="ghost"
                        color="blue.600"
                        _hover={{ bg: "blue.50" }}
                        aria-label="edit Documents"
                        onClick={() => {
                          navigate(`/accounting-master/edit-distributor/${item?.id}`);
                        }}
                      />
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        color="red.600"
                        _hover={{ bg: "red.50" }}
                        aria-label="Delete"
                        onClick={() => {
                          handleDelete(item?.id)
                        }}

                      />
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
        <Pagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      </Box>
    </>
  );
};

export default DistributorsList;
