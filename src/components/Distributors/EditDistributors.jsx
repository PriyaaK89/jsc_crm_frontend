import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  InputGroup,
  Tooltip,
  InputRightElement,
  IconButton,
  InputLeftElement,
  Flex,
  SimpleGrid,
  Badge,
  Select,
  useToast,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { WarningIcon } from "@chakra-ui/icons";
import { FiCheckCircle } from "react-icons/fi";
import { CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { useParams, Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import EditImageDistributor from "../Distributors/EditImageDistributor";
import DistributorAgreementPreview from "../../pages/HrMgmt/Letters/distributorONBoring/DistributorAgreementPreviewModel";



//  Address Component
const AddressForm = ({ data, onChange, index = 0, label }) => {
  return (
    <Box
      border="1px solid black"
      borderRadius="lg"
      mt={4}
      gridColumn={{ base: "span 1", md: "span 2" }}
    >
      <Text
        fontWeight="bold"
        mb={3}
        bg="#e9f2ff"
        p={3}
        borderTopRadius="lg"
        borderBottom="1px solid #f3f3f3"
      >
        {" "}
        {label}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} p={4}>
        <FormControl>
          <FormLabel>NAME.</FormLabel>
          <Input
            value={data.name || ""}
            onChange={(e) => onChange(index, "name", e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>FATHER NAME.</FormLabel>
          <Input
            value={data.father_name || ""}
            onChange={(e) => onChange(index, "father_name", e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>PAN NO.</FormLabel>
          <Input
            value={data.pan_no || ""}
            onChange={(e) => onChange(index, "pan_no", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Aadhar No.</FormLabel>
          <Input
            value={data.aadhar_no || ""}
            type="number"
            onChange={(e) => onChange(index, "aadhar_no", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Input
            value={data.address || ""}
            onChange={(e) => onChange(index, "address", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>State</FormLabel>
          <Input
            value={data.state || ""}
            onChange={(e) => onChange(index, "state", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>District</FormLabel>
          <Input
            value={data.district || ""}
            onChange={(e) => onChange(index, "district", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Tehsil</FormLabel>
          <Input
            value={data.tehsil || ""}
            onChange={(e) => onChange(index, "tehsil", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Pincode</FormLabel>
          <Input
            value={data.pincode || ""}
            onChange={(e) => onChange(index, "pincode", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Mobile No.</FormLabel>
          <Input
            value={data.mobile_no || ""}
            onChange={(e) => onChange(index, "mobile_no", e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Alt Mobile No.</FormLabel>
          <Input
            value={data.alt_mobile_no || ""}
            onChange={(e) => onChange(index, "alt_mobile_no", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>
            {label.includes("Partner")
              ? "Upload Partner Photo"
              : "Upload Owner Photo"}
          </FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              onChange(
                index,
                label.includes("Partner") ? "partner_photo" : "upload_img",
                e.target.files[0],
              )
            }
          />
        </FormControl>
      </SimpleGrid>
    </Box>
  );
};
function DistributorAgreement() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const generateModal = useDisclosure();
  const [distributorId, setDistributorId] = useState(null);
  // const handleChildData = (data) => {
  //   setFormData((prev) => ({ ...prev, documents: data }));
  // };


  const { users } = useUsersapi();
  const [firmtype, setFirmtype] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_dob: "",
    firm_name: "",
    gst_number: "",
    firm_type: "",
    business_address: "",
    state: "",
    district: "",
    tehsil: "",
    landmark: "",
    pin_code: "",
    contact_number: "",
    alt_contact_number: "",
    responsible_person_name: "",
    responsible_person_address: "",
    responsible_person_contact: "",
    firm_email: "",
    firm_pan: "",
    jurisdiction_area: "",
    brach: "",
    seed_license_no: "",
    fertilizer_license_no: "",
    pesticide_license_no: "",
    source_of_funds: "",
    own_funds_details: "",
    bank_name: "",
    bank_account_no: "",
    ifsc_code: "",
    bank_branch: "",
    security_cheque_no: "",
    security_amount: "",
    credit_duration: "",
    annual_turnover: "",
    expected_sale: "",
    approver_name: "",
    approving_date: "",
    created_at: "",
    approving_image: "",
    business_territory: "",
    firm_landmark: "",
    responsible_person_alt_contact: "",
    firm_since: "",
    seed_license_expiry: "",
    transport_name_a: "",
    transport_name_b: "",
    security_cheque_no_2: "",
    created_by: "",
    created_by_name: "",
    distributor: "",
    companies: "",
    partners: "",

  });
  const [gstStatus, setGstStatus] = useState("");
  const [otherCompanies, setOtherCompanies] = useState([
    { name: "", turnover: "" },
  ]);

  const [partners, setPartners] = useState([]);

  const [documents, setDocuments] = useState({});
  const [ownerAddress, setOwnerAddress] = useState({
    address: "",
    state: "",
    district: "",
    tehsil: "",
    pincode: "",
    pan_no: "",
    aadhar_no: "",
    mobile_no: "",
    alt_mobile_no: "",
    name: "",
    father_name: "",
    upload_img: null,
  });

  const getEmptyPartner = () => ({
    name: "",
    father_name: "",
    mobile_no: "",
    alt_mobile_no: "",
    address: "",
    state: "",
    district: "",
    tehsil: "",
    pincode: "",
    pan_no: "",
    aadhar_no: "",
    partner_photo: null,
  });

  // ---------------------------gst verification------------------------------------------------------
  const handleGSTverification = async () => {
    try {
      setLoading(true);

      if (!formData.gst_number) {
        toast({
          description: "Enter your GST number",
          duration: 2000,
          status: "error",
        });
        setLoading(false);
        return;
      }

      const response = await API.post(API_ENDPOINTS.Gst_verify, {
        gst_number: formData.gst_number,
      });

      const data = response?.data;

      if (data?.success) {
        const status = (
          data?.status ||
          data?.gst_status ||
          "unknown"
        ).toLowerCase();
        const businessType = data.business_type?.toLowerCase() || "";

        setGstStatus(status);
        setFirmtype(businessType);

        setFormData((prev) => ({
          ...prev,
          firm_name: data.business_name || "",
          firm_type: businessType,
          business_address: `${data.address?.building || ""}, ${data.address?.street || ""}, ${data.address?.location || ""}`,
          state: data.address?.state || "",
          district: data.address?.district || "",
          pin_code: data.address?.pincode || "",
          firm_since: data.reg_date || "",
          customer_name: data.legal_name || "",
        }));

        if (businessType === "proprietorship") {
          setOwnerAddress((prev) => ({
            ...prev,
            name: data.legal_name || "",
            address: `${data.address?.building || ""}, ${data.address?.street || ""}`,
            state: data.address?.state || "",
            district: data.address?.district || "",
            pincode: data.address?.pincode || "",
          }));
        } else if (businessType === "partnership") {
          setPartners((prev) => {
            const partnerupdated = [...prev];
            partnerupdated[0] = {
              ...partnerupdated[0],
              name: data.legal_name || "",
              address: `${data.address?.building || ""}, ${data.address?.street || ""}`,
              state: data.address?.state || "",
              district: data.address?.district || "",
              pincode: data.address?.pincode || "",
            };
            return partnerupdated; // Fixed: added return
          });
        }

        if (status === "active") {
          toast({
            title: "GST VERIFICATION",
            description: `GST ${status.toUpperCase()} verified successfully`,
            duration: 2000,
            status: "success",
          });
        }
      }
    } catch (error) {
      // THIS PART WAS MISSING
      console.error("GST Verification Error:", error);
      toast({
        title: "Error",
        description: "Failed to verify GST. Please try again.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------pincode based address auto fill--------------------------------------
  const handlePincodeChange = async (value) => {
    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    if (value.length === 6) {
      try {
        const res = await API.get(`/getstatecity/${value}`);
        const { state, district } = res.data.data;

        setFormData((prev) => ({
          ...prev,
          state,
          district,
        }));
      } catch (err) {
        console.error("Pincode lookup failed", err);
      }
    }
  };



  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();

    // //  1. Distributor basic fields
    // Object.keys(formData).forEach((key) => {
    //   formDataToSend.append(key, formData[key]);
    // });


      // 1. Basic Fields Append (Text data)
      Object.keys(formData).forEach((key) => {
        // Agar value object hai (jaise partners array), toh stringify karein
        if (Array.isArray(formData[key]) || (typeof formData[key] === 'object' && formData[key] !== null && !(formData[key] instanceof File))) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // 2. Documents (Files) handling - Direct from 'documents' state
      if (documents) {
        Object.keys(documents).forEach((key) => {
          const value = documents[key];

          if (Array.isArray(value)) {
            // Multiple Files (Shop images, Cheques)
            value.forEach((file, index) => {
              if (file instanceof File) {
                formDataToSend.append(`${key}_${index + 1}`, file);
              }
            });
          } else if (value instanceof File) {
            // Single File (PAN, Aadhar)
            formDataToSend.append(key, value);
          }
        });
      }


      // ✅ 2. Partners (files + data separate)
      const partnersData = partners.map((p, index) => {
        const { partner_photo, ...rest } = p;

        // file append
        if (partner_photo) {
          formDataToSend.append(`partner_photo_${index + 1}`, partner_photo);
        }

        return rest; // only text data
      });

      formDataToSend.append("partners", JSON.stringify(partnersData));

    //  3. Companies (normal JSON)
    formDataToSend.append("companies", JSON.stringify(otherCompanies));

    //  4. Documents ( FIXED PART)

      // PAN (single file)
      if (documents?.pan_photo) {
        formDataToSend.append("pan_photo", documents.pan_photo);
      }

      // Cheque photos (multiple)
      if (documents?.cheque_photo?.length > 0) {
        documents.cheque_photo.forEach((file, index) => {
          formDataToSend.append(`cheque_photo_${index + 1}`, file);
        });
      }

      // Shop images (multiple)
      if (documents?.shop_image?.length > 0) {
        documents.shop_image.forEach((file, index) => {
          formDataToSend.append(`shop_image_${index + 1}`, file);
        });
      }

      // ✅ 5. API Call
      const response = await API.put(
        `${API_ENDPOINTS.update_distributor}/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ 6. Success
      if (response.status === 200) {
        toast({
          title: "Distributor updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/accounting-master/distributor");

      }

    } catch (error) {
      //  Error
      toast({
        title: "Failed to update data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      console.error("Update Error:", error);
    }
  };



  const handleOwnerPincodeChange = async (value) => {
    setOwnerAddress((prev) => ({
      ...prev,
      pincode: value,
    }));

    if (value.length === 6) {
      try {
        const res = await API.get(`/getstatecity/${value}`);
        const { state, district } = res.data.data;

        setOwnerAddress((prev) => ({
          ...prev,
          state,
          district,
        }));
      } catch (err) {
        console.error("Owner Pincode lookup failed", err);
      }
    }
  };

  // // for partners

  const handlePartnerChange = async (index, field, value) => {
    const updated = [...partners];
    updated[index][field] = value;
    setPartners(updated);

    if (field === "pincode" && value.length === 6 && /^[0-9]+$/.test(value)) {
      try {
        const res = await API.get(`/getstatecity/${value}`);
        const { state, district } = res.data.data;

        updated[index].state = state;
        updated[index].district = district;

        setPartners([...updated]);
      } catch (err) {
        console.error("Partner pincode error", err);
      }
    }
  };

  // fetch distributor details
  const fetchDistributorDetails = async () => {
    try {
      const res = await API.get(`${API_ENDPOINTS.get_distributor}/${id}`);
      if (res.status === 200) {
        const data = res.data.data;

        setFormData(data.distributor || {});
        setPartners(data.partners || []);
        console.log(partners)
        setCompanies(data.companies || []);
        setDocuments(data.documents || {});
        setDistributorId(data.distributor?.id || null);
        // console.log(data.distributor?.id, "distributor details fetched");

        setFirmtype(data.firm_type?.toLowerCase()); // Normalize case

        if (data.firm_type?.toLowerCase() === "proprietorship") {
          setOwnerAddress({
            name: data.owner_name || "",
            father_name: data.owner_father_name || "",
            address: data.owner_address || "",
            state: data.owner_state || "",
            district: data.owner_district || "",
            tehsil: data.owner_tehsil || "",
            pincode: data.owner_pincode || "",
            pan_no: data.owner_pan || "",
            aadhar_no: data.owner_aadhar || "",
            mobile_no: data.owner_mobile || "",
            alt_mobile_no: data.owner_alt_mobile || "",
            upload_img: null,
          });
        }

        // Agar partners hain toh unhe set karein
        if (data.partners && data.partners.length > 0) {
          setPartners(data.partners);
        }
      }
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDistributorDetails();
    }
  }, [id]);

  const handleChildData = (data) => { console.log("Parent received data from Child:", data); setFormData((prev) => ({ ...prev, documents: data, })); };


  // add mulyiple comapny ----------------------------------------------
  const handleOtherCompanyChange = (index, field, value) => {
    const updated = [...otherCompanies];
    updated[index][field] = value;
    setOtherCompanies(updated);
  };

  const addOtherCompany = () => {
    setOtherCompanies([
      ...otherCompanies,
      { name: "", turnover: "" }, //  correct object
    ]);
  };
  const removeOtherCompany = (index) => {
    const updated = otherCompanies.filter((_, i) => i !== index);
    setOtherCompanies(updated);
  };

  //  Add Partner
  const addPartner = () => {
    setPartners([...partners, getEmptyPartner()]);
  };

  //  Remove Partner
  const removePartner = (index) => {
    if (partners.length <= 2) return;

    const updated = partners.filter((_, i) => i !== index);
    setPartners(updated);
  };

  const Approvername = () => {
    // const approvername = e.target.value;
    const selectedApprover = users?.find(
      (u) => u.id === formData.approver_name,
    );
    // console.log(approvername)

    setFormData((prev) => ({
      ...prev,
      approver_name: selectedApprover, //  proper key
    }));
  };
  // habndle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "gst_number") {
      setGstStatus("");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFileChange = (name, file) => {
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));
  };

  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);

    if (isNaN(date)) return ""; // safety

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  const handleGenerateAgreement = () => {
    if (!formData.customer_name || !formData.firm_name || !formData.gst_number) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        status: "error",
        duration: 2000,
      });
      console.log(formData, "formdatadistributor");

      generateModal.onClose();
      return;
    }

    generateModal.onOpen();

    // console.log(generateModal.onOpen(), "qwertyuio")
  };


  return (
    <>
      <DistributorAgreementPreview
        isOpen={generateModal.isOpen}
        onClose={generateModal.onClose}
        formData={formData}
        ownerAddress={ownerAddress}
        partners={partners}
        otherCompanies={otherCompanies}
        distributorId={distributorId}
        onUploadSuccess={() => {
          generateModal.onClose();
          navigate("/accounting-master/distributor");
        }}
      />
      <Box
        bg="white"
        mt={{ base: 2, md: 5 }}
        px={{ base: 3, md: 6 }}
        py={{ base: 3, md: 4 }}
        borderRadius="lg"
        boxShadow="md"
      >

        <HStack justifyContent="space-between" spacing="space-between">
          <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">

            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} fontSize="13px" to="/distributor/distributorlist" >
                Distributor List
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontSize="13px">
                Edit Distributor
              </BreadcrumbLink>
            </BreadcrumbItem>

          </Breadcrumb>
        </HStack>

        <Text fontSize={{ base: "lg", md: "xl" }} mb={6} fontWeight="bold">
          Edit Distributor
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <FormControl>
            <FormLabel>Customer Name</FormLabel>
            <Input
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Customer DOB</FormLabel>
            <Input
              type="date"
              name="customer_dob"
              value={formatToInputDate(formData.customer_dob || "")}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Firm GST</FormLabel>

            <InputGroup>
              {gstStatus && (
                <InputLeftElement width="auto" ml={2}>
                  <Badge
                    colorScheme={
                      gstStatus === "active"
                        ? "green"
                        : gstStatus === "suspended"
                          ? "red"
                          : gstStatus === "cancelled"
                            ? "orange"
                            : "gray"
                    }
                    fontSize="0.7em"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    {gstStatus.toUpperCase()}
                  </Badge>
                </InputLeftElement>
              )}

              <Input
                name="gst_number"
                value={formData.gst_number || ""}
                onChange={handleChange}
                placeholder="Enter GST Number"
                pl={gstStatus ? "90px" : "12px"}
              />

              <InputRightElement>
                <Tooltip label="Verify GST">
                  <IconButton
                    size="sm"
                    colorScheme="blue"
                    icon={
                      gstStatus === "error" ? (
                        <WarningIcon />
                      ) : (
                        <FiCheckCircle />
                      )
                    }
                    onClick={handleGSTverification}
                    // isLoading={loading}
                    aria-label="Verify GST"
                  // isDisabled={formData.gst_number.length !== 15}
                  />
                </Tooltip>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Firm Name</FormLabel>
            <Input
              name="firm_name"
              value={formData.firm_name || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Firm Type</FormLabel>
            <Select
              name="firm_type"
              value={formData.firm_type || ""}
              onChange={(e) => {
                handleChange(e);
                const value = e.target.value;
                setFirmtype(value);

                if (value === "partnership") {
                  setPartners([
                    {
                      address: "",
                      state: "",
                      district: "",
                      tehsil: "",
                      pincode: "",
                      pan_no: "",
                      aadharno: "",
                    },
                  ]);
                }

                if (value === "proprietorship") {
                  setPartners([]); // optional cleanup
                }
              }}
            >
              <option value="">Select</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="partnership">Private Limited</option>
            </Select>
          </FormControl>

          {/* Business Address */}
          <Box
            border="1px"
            borderColor="gray.900"
            gridColumn={{ base: "span 1", md: "span 2" }}
            p={4}
            borderRadius="lg"
          >
            <FormControl mt={3}>
              <FormLabel>Business Address</FormLabel>
              <Input
                name="business_address"
                value={formData.business_address || ""}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl mt={3}>
              <FormLabel>Business Territory</FormLabel>
              <Input
                name="business_territory"
                value={formData.business_territory || ""}
                onChange={handleChange}
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>
              <FormControl>
                <FormLabel>State</FormLabel>
                <Input
                  name="state"
                  value={formData.state || ""}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>District</FormLabel>
                <Input
                  name="district"
                  value={formData.district || ""}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tehsil</FormLabel>
                <Input
                  name="tehsil"
                  value={formData.tehsil || ""}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Landmark</FormLabel>
                <Input
                  name="landmark"
                  value={formData.landmark || ""}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Pincode</FormLabel>
                <Input
                  name="pincode"
                  value={formData.pincode || ""}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Contact No(without +91)</FormLabel>
                <Input
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                // placeholder="Enter Contact No (without +91)"
                />
              </FormControl>
              <FormControl>
                <FormLabel> Alt. Contact No</FormLabel>
                <Input
                  name="alt_contact_number"
                  value={formData.alt_contact_number}
                  onChange={handleChange}
                // placeholder="Enter Alternative Contact No (without +91)"
                />
              </FormControl>
            </SimpleGrid>
          </Box>

          {firmtype === "proprietorship" && (
            <AddressForm
              data={ownerAddress}
              label="Owner Address"
              onChange={(i, field, value) => {
                setOwnerAddress((prev) => ({
                  ...prev,
                  [field]: value,
                }));
                if (field === "pincode") {
                  handleOwnerPincodeChange(value);
                }
              }}
            />
          )}
          {/* Proprietorship */}

          {/* Partnership */}
          {firmtype === "partnership" && (
            <Box gridColumn={{ base: "span 1", md: "span 2" }}>
              {partners.map((partner, index) => (
                <Box key={index} position="relative">
                  <Button
                    size="sm"
                    colorScheme="red"
                    position="absolute"
                    top="10px"
                    right="10px"
                    onClick={() => removePartner(index)}
                    isDisabled={partners.length === 2}
                  >
                    <CloseIcon />
                  </Button>

                  <AddressForm
                    index={index}
                    data={partner}
                    label={`Partner ${index + 1} Address`}
                    onChange={handlePartnerChange}
                  />
                </Box>
              ))}

              <Button
                mt={4}
                onClick={addPartner}
                colorScheme="blue"
                leftIcon={<AddIcon />}
              >
                Add Partner
              </Button>
            </Box>
          )}

          <FormControl>
            <FormLabel>Responsible PersonName</FormLabel>
            <Input
              name="responsible_person_name"
              value={formData.responsible_person_name}
              onChange={handleChange}
            // placeholder="Enter Responsible PersonName"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Responsible PersonAddress</FormLabel>
            <Input
              name="responsible_person_address"
              value={formData.responsible_person_address}
              onChange={handleChange}
            // placeholder="Enter Responsible PersonAddress"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Responsible PersonContact No</FormLabel>
            <Input
              name="responsible_person_contact"
              value={formData.responsible_person_contact}
              onChange={handleChange}
            // placeholder="Enter Responsible PersonNo"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Responsible PersonAlternat Contact No</FormLabel>
            <Input
              name="responsible_person_alt_contact"
              value={formData.responsible_person_alt_contact}
              onChange={handleChange}
            // placeholder="Enter Responsible PersonNo"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Firm Email Id</FormLabel>
            <Input
              name="firm_email"
              value={formData.firm_email}
              onChange={handleChange}
            // placeholder="Enter Firm GSTN"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Firm GSTN type</FormLabel>
            <Select
              name="gst_type"
              value={formData.gst_type}
              onChange={handleChange}
            // placeholder="Select Firm GSTN Type"
            >
              <option value="composition">Composition</option>
              <option value="consumer">Consumer</option>
              <option value="regular">Regular</option>
              <option value="unregistered">Unregistered</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel> Firm Since</FormLabel>
            <Input
              name="firm_since"
              value={formatToInputDate(formData.firm_since || "")}
              onChange={handleChange}
              type="date"
              placeholder="Select Firm Start Date"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Firm PAN Number</FormLabel>
            <Input
              name="firm_pan"
              value={formData.firm_pan}
              onChange={handleChange}
            // placeholder="Enter Firm PAN Card No."
            />
          </FormControl>

          <FormControl>
            <FormLabel> Firm Aadhar Card</FormLabel>
            <Input
              name="firm_aadhar"
              value={formData.firm_aadhar}
              onChange={handleChange}
            // placeholder="Enter Firm Aadhar Card No."
            />
          </FormControl>

          <FormControl>
            <FormLabel> JURISDICTION AREA</FormLabel>
            <Select
              name="jurisdiction_area"
              value={formData.jurisdiction_area || ""}
              onChange={handleChange}
              placeholder="--please select--"
            >
              <option value="alwar">ALWAR</option>
              <option value="jaipur">JAIPUR</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>branch</FormLabel>
            <Input
              name="branch"
              value={formData.branch}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Landmark</FormLabel>
            <Input
              name="firm_landmark"
              value={formData.firm_landmark}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Seed License No.</FormLabel>
            <Input
              name="seed_license_no"
              value={formData.seed_license_no}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Seed License Expiry Date</FormLabel>

            <Input
              type="date"
              name="seed_license_expiry"
              value={formatToInputDate(formData.seed_license_expiry || "")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seed_license_expiry: e.target.value,
                }))
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Fertilizer License No.</FormLabel>
            <Input
              name="fertilizer_license_no"
              value={formData.fertilizer_license_no}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Pesticide License No.</FormLabel>
            <Input
              name="pesticide_license_no"
              value={formData.pesticide_license_no}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Tranport Name (A)</FormLabel>
            <Input
              name="transport_name_a"
              value={formData.transport_name_a}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Tranport Name (B)</FormLabel>
            <Input
              name="transport_name_b"
              value={formData.transport_name_b}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Source OF Funds For Bussiness</FormLabel>
            <Select
              name="source_of_funds"
              value={formData.source_of_funds || ""}
              onChange={handleChange}
            >
              <option value="">select Source of Funds</option>
              <option value="own_funds">Own Funds</option>
              <option value="loan">Loan</option>
              <option value="investment">Investment</option>
            </Select>
          </FormControl>

          {formData.source_of_funds === "loan" && (
            <FormControl>
              <FormLabel>Loan Details</FormLabel>
              <Input
                name="own_funds_details"
                value={formData.own_funds_details}
                onChange={handleChange}
                placeholder="Enter Loan Details"
              />
            </FormControl>
          )}

          {formData.source_of_funds === "own_funds" && (
            <FormControl>
              <FormLabel>Own Funds Details</FormLabel>
              <Input
                name="own_funds_details"
                value={formData.own_funds_details}
                onChange={handleChange}
                placeholder="Enter Own Funds Details"
              />
            </FormControl>
          )}
          {formData.source_of_funds === "investment" && (
            <FormControl>
              <FormLabel>Investment Details</FormLabel>
              <Input
                name="own_funds_details"
                value={formData.own_funds_details}
                onChange={handleChange}
                placeholder="Enter Investment Details"
              />
            </FormControl>
          )}

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
              name="bank_account_no"
              value={formData.bank_account_no}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bank IFSC</FormLabel>
            <Input
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bank branch</FormLabel>
            <Input
              name="bank_branch"
              value={formData.bank_branch}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Security Cheque No.</FormLabel>
            <Input
              name="security_cheque_no"
              value={formData.security_cheque_no}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Security Cheque No.</FormLabel>
            <Input
              name="security_cheque_no_2"
              value={formData.security_cheque_no_2}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Security Amount</FormLabel>
            <Input
              name="security_amount"
              value={formData.security_amount}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Credit Duration Period</FormLabel>
            <Input
              name="credit_duration"
              value={formData.credit_duration}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Firm Annual Turnover</FormLabel>
            <Input
              name="annual_turnover"
              value={formData.annual_turnover}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Expected Sale Per Year</FormLabel>
            <Input
              name="expected_sale"
              value={formData.expected_sale}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl
            gridColumn={{ base: "span 1", md: "span 2" }}
            border="1px solid #413e3e"
            p={4}
            borderRadius="lg"
          >
            <FormLabel>Other Company Detail</FormLabel>

            {otherCompanies.map((company, index) => (
              <Box key={index} position="relative" mb={3}>
                {/* Remove Button */}
                <Button
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  right="0"
                  top="-25px"
                  onClick={() => removeOtherCompany(index)}
                  isDisabled={otherCompanies.length === 1}
                >
                  remove
                </Button>

                {/* Company Name */}
                <SimpleGrid columns={{ base: 1, md: 2 }}>
                  <Input
                    mb={2}
                    placeholder={`Company ${index + 1}`}
                    value={otherCompanies.name}
                    onChange={(e) =>
                      handleOtherCompanyChange(index, "name", e.target.value)
                    }
                  />


                  {/* Turnover */}
                  <Input
                    ml={{ base: 0, md: 3 }}
                    placeholder="Turnover"
                    value={company.turnover}
                    onChange={(e) =>
                      handleOtherCompanyChange(
                        index,
                        "turnover",
                        e.target.value,
                      )
                    }
                  />
                </SimpleGrid>
              </Box>
            ))}

            <Button
              mt={0}
              size="sm"
              onClick={addOtherCompany}
              colorScheme="blue"
              leftIcon={<AddIcon />}
            >
              Add Company
            </Button>
          </FormControl>
        </SimpleGrid>

        <Box border="1px solid #313131" mt={5} p={5} borderRadius="lg">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl>
              <FormLabel>Approver Name</FormLabel>

              <Select
                name="approver_name"
                value={formData.approver_name || ""}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    approver_name: e.target.value,
                  }));
                }}
              >
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Approvering Date</FormLabel>

              <Input
                type="date"
                name="approving_date"
                value={formatToInputDate(formData.approving_date || "")}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Upload Approval Image</FormLabel>

              <Input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                display="none"
                id="cameraUpload"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData((prev) => ({
                    ...prev,
                    approver_image: file,
                  }));
                }}
              />
              <Button
                onClick={() => document.getElementById("cameraUpload").click()}
                size={{ base: "sm", md: "lg" }}
              >
                📷 Upload Approver Image
              </Button>
            </FormControl>
          </SimpleGrid>
        </Box>
        {/* upload document */}
        <EditImageDistributor
          formData={formData}
          onSendData={handleChildData}
          existingDocs={documents} />

        <Button colorScheme="blue" onClick={handleSubmit} mt={4}>
          Update Distributor
        </Button>
        <Button ml={5}
          colorScheme="green"
          mt={6}
          onClick={handleGenerateAgreement}
        >
          Genrate distributor  Aggrement Letter
        </Button>
      </Box>
    </>
  );
}

export default DistributorAgreement;
