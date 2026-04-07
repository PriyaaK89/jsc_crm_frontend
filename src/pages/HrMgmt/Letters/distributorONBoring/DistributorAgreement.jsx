import React, { useState, useEffect,useRef } from "react";
import {
  Box,
  Button, Text,
  FormControl,
  FormLabel,
  Input, useDisclosure, InputGroup, Tooltip,
  InputRightElement, IconButton,
  InputLeftElement,
  Flex,
  SimpleGrid, Badge,
  Select,
  useToast
} from "@chakra-ui/react";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { WarningIcon } from "@chakra-ui/icons";
import { FiCheckCircle } from "react-icons/fi";
import { CloseIcon } from "@chakra-ui/icons";
import DistributorAgreementPdfPreview from "./DistributorAgreementPdfPreview";
import { validateEmail, validateContact } from "../../../../hook/Validation";
import useUsersapi from "../../../../Apis/GetUsersapi"
import DistributorDocuments from "./DistributorDocuments";
import API from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../services/endpoints";
// import DistributorAgreementPreview from "../DistributorAgreementPreviewModel";
import DistributorAgreementPreview from "./DistributorAgreementPreviewModel";
import AddressForm from './Distributoronboardingownerandpartneraddform';
import DisBussinessAddressForm from "./DisBussinessAddressForm";


function DistributorAgreement() {

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleChildData = (data) => { setFormData((prev) => ({ ...prev, documents: data, })); };

  const { users } = useUsersapi();
  const previewModal = useDisclosure();
  const generateModal = useDisclosure();
  const [firmtype, setFirmtype] = useState("");
  const [formData, setFormData] = useState({ gst_number: '' });
  const [kycId, setKycId] = useState("");
  const [kycStatus, setKycStatus] = useState(null);
  const [gstStatus, setGstStatus] = useState("");
  const [panStatus, setPanStatus] = useState({});
  const [errors, setError] = useState({});
  const [otherCompanies, setOtherCompanies] = useState([{ name: "", turnover: "" }]);
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

  const [partners, setPartners] = useState([]);

  useEffect(() => {
    if (formData.firm_type === "partnership") {
      setPartners([
        getEmptyPartner(),
        getEmptyPartner(),
      ]);
    } else {
      setPartners([]); // baaki cases me remove
    }
  }, [formData.firm_type]);

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

  const requirefilelds = [
    "customer_name", "customer_dob", "firm_name", "firm_type",
    "business_address", "business_territory", "state", "district", "tehsil", "landmark",
    "firm_landmark", "pincode", "contact_number", "alt_contact_number", "responsible_person_name", "responsible_person_contact",
    "responsible_person_address", "responsible_person_alt_contact",
    "firm_email", "branch", "firm_since", "seed_license_no", "seed_license_expiry", "transport_name_a", "transport_name_b", "source_of_funds",
    "own_funds_details", "bank_name", "bank_account_no", "ifsc_code", "bank_branch", "security_cheque_no", "security_cheque_no_2", "credit_duration",
    "approver_name", "approving_date"
  ]

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
        const status = (data?.status || data?.gst_status || "unknown").toLowerCase();
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
// -----------------------aadhar verifiction ------------------------------
const validateMobile = (mobile) => {
  return /^[6-9]\d{9}$/.test(mobile);
};


const handleResponsibleMobileVerify = async () => {
  const mobile = formData.responsible_person_contact;

  if (!mobile || !validateMobile(mobile)) {
    toast({
      description: "Enter valid 10 digit mobile number",
      status: "error",
      duration: 2000,
    });
    return;
  }

  try {
    setLoading(true);

    const res = await API.post(API_ENDPOINTS.verify_mobile_no, {
      mobile: mobile,
    });

    const response = res.data;

    const id = response?.data?.id;

    console.log("KYC ID:", id);

    if (id) {
      setKycId(id);
      // DIRECTLY PASS ID
      getKycStatus(id);
    }
    console.log("kyid",kycId)

    const requestId = response?.request_id;

    if (requestId) {
      toast({
        title: "Verification Link Sent",
        description: "User ko DigiLocker link bhej diya gaya hai",
        status: "success",
        duration: 3000,
      });
    }

  } catch (error) {
    console.error("Verification Error:", error);

    toast({
      description: "Mobile verification failed",
      status: "error",
      duration: 2000,
    });
  } finally {
    setLoading(false);
  }
};

// verify KID kycId
const getKycStatus = async (kycId) => {
  try {
    console.log("Calling status API with ID:", kycId);

    const res = await API.post(API_ENDPOINTS.get_aadhar_pan_kid(kycId)
    );

    console.log("KYC Status Response:", res.data);

    setKycStatus(res.data);

  } catch (error) {
    console.error("KYC Status Error:", error);
  }
};



  // ----------------------------pan verification------------------------------------------------------
  // pan valadition 
  const isValidPan = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };


  const handlePanVerification = async (pan, type, index = null) => {
    try {
      if (!pan || pan.length !== 10) {
        toast({
          description: "Enter valid PAN",
          status: "error",
          duration: 2000,
        });
        return;
      }

      setLoading(true);

      const res = await API.post(API_ENDPOINTS.verify_pan, {
        pan_number: pan,
      });

      const response = res.data;
      const data = response.data;

      if (response.success && data) {
        const status = data.status?.toLowerCase() || "verified";
        const name = data.full_name || "";

        setPanStatus((prev) => ({
          ...prev,
          [type]: { status, name },
        }));

        if (type === "firm_pan") {
          setFormData((prev) => ({
            ...prev,
            firm_name: name,
          }));
        }


        if (type === "owner_pan") {
          setOwnerAddress((prev) => ({
            ...prev,
            name: name,
          }));
        }


        if (type.startsWith("partner_") && index !== null) {
          const updated = [...partners];
          if (updated[index]) {
            updated[index].name = name;
            setPartners(updated);
          }
        }

        toast({
          description: `PAN ${status.toUpperCase()} verified`,
          status: "success",
          duration: 2000,
        });
      }
    } catch (err) {
      console.error(err);

      setPanStatus((prev) => ({
        ...prev,
        [type]: { status: "error", name: "" },
      }));

      toast({
        description: "PAN verification failed",
        status: "error",
        duration: 2000,
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


  // owner ke liye pincode 
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

  // for partners 

  const handlePartnerChange = async (index, field, value) => {
    const updated = [...partners];
    updated[index][field] = value;
    setPartners(updated);

    if (
      field === "pincode" &&
      value.length === 6 &&
      /^[0-9]+$/.test(value)
    ) {
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

  // post api for fomdata and partners and owner address and other company details
  
const isSubmitting = useRef(false);

  const handleformSubmit = async () => {
      if (isSubmitting.current) return;
      isSubmitting.current = true;
    const isValid = validateForm();

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        status: "error",
        duration: 3000,
      });
      return;
    }
    try {
      setLoading(true);

      const formDataToSend = new FormData();

      //  normal fields
      Object.keys(formData).forEach((key) => {
        if (key !== "documents") {
          formDataToSend.append(key, formData[key]);
        }
      });

      //  nested data
      if (formData.firm_type === "proprietorship") {

        const keyMap = {
          name: "owner_name",
          father_name: "owner_father_name",
          pan_no: "owner_pan",
          aadhar_no: "owner_aadhar",
          address: "owner_address",
          state: "owner_state",
          district: "owner_district",
          tehsil: "owner_tehsil",
          pincode: "owner_pincode",
          mobile_no: "owner_mobile",
          alt_mobile_no: "owner_alt_mobile",
          upload_img: "owner_photo",
        };

        Object.keys(ownerAddress).forEach((key) => {
          if (ownerAddress[key]) {
            const backendKey = keyMap[key];
            if (backendKey) {
              formDataToSend.append(backendKey, ownerAddress[key]);
            }
          }
        });

      }
      const partnersData = partners.map((p, index) => {
        const { partner_photo, ...rest } = p;

        //  image ko alag bhejo
        if (partner_photo) {
          formDataToSend.append(`partner_photo_${index + 1}`, partner_photo);
        }


        return rest;

      });


      //  JSON me only text data
      if (partners && partners.length > 0) {
        formDataToSend.append("partners", JSON.stringify(partnersData,));
      }

      if (otherCompanies && otherCompanies.length > 0) {
        formDataToSend.append("otherCompanies", JSON.stringify(otherCompanies));
      }


      const docs = formData.documents;

      if (docs) {

        //  SHOP IMAGES (convert to shop_image_1,2,3...)
        if (docs.shop_image && docs.shop_image.length > 0) {
          docs.shop_image.forEach((file,) => {
            formDataToSend.append(`shop_image`, file);
          });
        }

        // CHEQUE IMAGES
        if (docs.cheque_photo && docs.cheque_photo.length > 0) {
          docs.cheque_photo.forEach((file,) => {
            formDataToSend.append(`cheque_photo`, file);
          });
        }

        // SINGLE FILES
        if (docs.pan_photo) formDataToSend.append("pan_photo", docs.pan_photo);
        if (docs.aadhar_front) formDataToSend.append("aadhar_front", docs.aadhar_front);
        if (docs.aadhar_back) formDataToSend.append("aadhar_back", docs.aadhar_back);
        if (docs.gst_file) formDataToSend.append("gst_file", docs.gst_file);
        if (docs.seed_license) formDataToSend.append("seed_license", docs.seed_license);
        if (docs.fertilizer_license) formDataToSend.append("fertilizer_license", docs.fertilizer_license);
        if (docs.pesticide_license) formDataToSend.append("pesticide_license", docs.pesticide_license);
        if (docs.bank_diary) formDataToSend.append("bank_diary", docs.bank_diary);
        if (docs.letter_head) formDataToSend.append("letter_head", docs.letter_head);
        if (docs.authority_letter) formDataToSend.append("authority_letter", docs.authority_letter);
        if (docs.partnership_deed) formDataToSend.append("partnership_deed", docs.partnership_deed);
        if (docs.mai_letter) formDataToSend.append("mai_letter", docs.mai_letter);
      }


      const response = await API.post(
        API_ENDPOINTS.distributor_onbording_form,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API RESPONSE:", response);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // add mulyiple comapny ----------------------------------------------
  const handleOtherCompanyChange = (index, field, value) => {
    const updated = [...otherCompanies];
    updated[index][field] = value;
    setOtherCompanies(updated);
  };

  const addOtherCompany = () => {
    setOtherCompanies([
      ...otherCompanies,
      { name: "", turnover: "" } //  correct object
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
      (u) => u.id === formData.approver_name
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
  // form validation ---------------------------------------
  const validateForm = () => {
    let newErrors = {};

    //  Required fields (dynamic)
    requirefilelds.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });
    // customer name
    if (!formData.firm_name) newErrors.firm_name = "Firm Name Required"
    if (!formData.firm_type) newErrors.firm_type = "Firm Type is required";


    //  Email
    if (formData.firm_email && !validateEmail(formData.firm_email)) {
      newErrors.firm_email = "Invalid email";
    }

    if (formData.contact_number && !validateContact(formData.contact_number)) {
      newErrors.contact_number = "Invalid contact number";
    }

    // bussiness details 
    if (!formData.business_address) newErrors.business_address = "Address is required";
    if (!formData.business_territory) newErrors.business_territory = "Territory is required";
    if (!formData.district) newErrors.district = "District required";
    if (!formData.tehsil) newErrors.tehsil = "Tehsil is  required";
    if (!formData.landmark) newErrors.landmark = "Landmark required";
    if (!formData.state) newErrors.state = " State name required";
    if (!formData.contact_number) newErrors.contact_number = "Bussiness contact number required";
    if (!formData.alt_contact_number) newErrors.alt_contact_number = " Bussiness alt contact number  required";
    if (!formData.pincode) newErrors.pincode = "Pincode required";
    // responsiable person
    if (!formData.responsible_person_name) newErrors.responsible_person_name = "Responsible person name required";
    if (!formData.responsible_person_contact) newErrors.responsible_person_contact = "Responsible person Mobile No required";
    if (!formData.responsible_person_address) newErrors.responsible_person_address = "Responsible person Address required";
    if (!formData.responsible_person_alt_contact) newErrors.responsible_person_alt_contact = "Responsible person Alt no required";
    // firm 
    if (!formData.firm_landmark) newErrors.firm_landmark = "Firm Landmark is required";
    if (!formData.firm_since) newErrors.firm_since = "Firm since required";
    if (!formData.branch) newErrors.branch = "Firm  branch is required";
    // seed lic
    if (!formData.seed_license_no) newErrors.seed_license_no = "Seed license  no required";
    if (!formData.seed_license_expiry) newErrors.seed_license_expiry = "Seed license expiry is required";
    // transport 
    if (!formData.transport_name_a) newErrors.transport_name_a = "Transport name (A) is required";
    // if (!formData.transport_name_b) newErrors.transport_name_b = "Transport name (B) is required";
    // source of fund 
    if (!formData.source_of_funds) newErrors.source_of_funds = "Source Of funds is required";
    if (!formData.own_funds_details) newErrors.own_funds_details = "Own Funds details is required";
    // bank details
    if (!formData.bank_name) newErrors.bank_name = "Bank name is required";
    if (!formData.bank_account_no) newErrors.bank_account_no = "Bank account no is required";
    if (!formData.ifsc_code) newErrors.ifsc_code = "ifsc code is required";
    if (!formData.bank_branch) newErrors.bank_branch = "Bank branch is required";

    if (!formData.security_cheque_no) newErrors.security_cheque_no = "Security cheque no1 is required";
    if (!formData.security_cheque_no2) newErrors.security_cheque_no2 = "Security cheque no2 is required";

    if (!formData.approver_name) newErrors.approver_name = "Approver name is required";
    if (!formData.approving_date) newErrors.approving_date = "Approvering date is required";
    // if (!formData.credit_duration) newErrors.credit_duration = "Credit duration is required";
    if (!formData.security_amount) newErrors.security_amount = "Security amountis required";




    //  Owner validation
    if (firmtype === "proprietorship") {
      if (!ownerAddress.name) newErrors.owner_name = "Owner name required";
      if (!ownerAddress.father_name) newErrors.owner_father_name = "Owner Father name required";
      if (!ownerAddress.address) newErrors.owner_address = "Owner address required";
      if (!ownerAddress.pincode) newErrors.owner_pincode = "Owner pincode required";
      if (!ownerAddress.pan_no) newErrors.owner_pan_no = "Owner PAN required";
      if (!ownerAddress.state) newErrors.owner_state = "Owner state required";
      if (!ownerAddress.district) newErrors.owner_district = "Owner district required";
      if (!ownerAddress.tehsil) newErrors.owner_tehsil = "Owner tehsil required";
      if (!ownerAddress.aadhar_no) newErrors.owner_aadhar_no = "Owner aadhar required";
      if (!ownerAddress.mobile_no) newErrors.owner_mobile_no = "Owner mobile required";
      if (!ownerAddress.alt_mobile_no) newErrors.owner_alt_mobile_no = "Owner alt mobile required";
    }

    //  Partners validation
    if (firmtype === "partnership") {
      partners.forEach((p, i) => {
        if (!p.name) newErrors[`partner_${i}_name`] = "Required";
        if (!p.mobile_no) newErrors[`partner_${i}_mobile_no`] = "Required";
        if (!p.address) newErrors[`partner_${i}_address`] = "required";
        if (!p.pincode) newErrors[`partner_${i}_pincode`] = "required";
        if (!p.state) newErrors[`partner_${i}_state`] = "required";
        if (!p.district) newErrors[`partner_${i}_district`] = "required";
        if (!p.tehsil) newErrors[`partner_${i}_tehsil`] = "required";
        if (!p.aadhar_no) newErrors[`partner_${i}_aadhar_no`] = "required";
        if (!p.alt_mobile_no) newErrors[`partner_${i}_alt_mobile_no`] = "required";


        if (!p.father_name)
          newErrors[`partner_${i}_father_name`] = "Required";

        if (!p.pan_no)
          newErrors[`partner_${i}_pan_no`] = "Required";

      });
    }

    setError(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ------------------------------form input dte -----------------------------------------------------
  const formatToInputDate = (dateStr) => {
    if (!dateStr) return "";

    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };



  return (
    <>
      <Box
        bg="white"
        mt={{ base: 2, md: 5 }}
        px={{ base: 3, md: 6 }}
        py={{ base: 3, md: 4 }}
        borderRadius="lg"
        boxShadow="md"
      >

        <Text fontSize={{ base: "lg", md: "xl" }} mb={6} fontWeight="bold">
          Distributor Agreement Form
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>

          <FormControl isInvalid={errors.customer_name}>
            <FormLabel>Customer Name</FormLabel>
            <Input
              name="customer_name"
              value={formData.customer_name || ""}
              onChange={handleChange}
            />
            {errors.customer_name && (
              <Text color="red.500" fontSize="sm">{errors.customer_name}</Text>
            )}

          </FormControl>

          <FormControl isInvalid={errors.customer_dob}>
            <FormLabel>Customer DOB</FormLabel>
            <Input
              type="date"
              name="customer_dob"
              value={formData.customer_dob || ""}
              onChange={handleChange}
            />
            {errors.customer_dob && (
              <Text color="red.500" fontSize="sm">{errors.customer_dob}</Text>
            )}
          </FormControl>


          <FormControl >
            <FormLabel>Firm GSTN</FormLabel>

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


              <InputRightElement >
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
                    isDisabled={formData.gst_number.length !== 15}
                  />
                </Tooltip>
              </InputRightElement>

            </InputGroup>
          </FormControl>

          <FormControl isInvalid={errors.firm_name}>
            <FormLabel>Firm Name</FormLabel>
            <Input
              name="firm_name"
              value={formData.firm_name || ""}
              onChange={handleChange}
            />
            {errors.firm_name && (
              <Text color="red.500" fontSize="sm">
                {errors.firm_name}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={errors.firm_type}>
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
                    { address: "", state: "", district: "", tehsil: "", pincode: "", pan_no: "", aadharno: "" },
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
            {errors.firm_type && (
              <Text color="red.500" fontSize="sm">
                {errors.firm_type}
              </Text>
            )}
          </FormControl>
          <FormControl isInvalid={errors.firm_email}>
            <FormLabel>Firm Email Id</FormLabel>
            <Input
              name="firm_email"
              value={formData.firm_email}
              onChange={handleChange}
            // placeholder="Enter Firm GSTN"
            /> {errors.firm_email && (
              <Text color="red.500" fontSize="sm">
                {errors.firm_email}
              </Text>
            )}
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
          {formData.gst_type==="unregistered" &&(

             <FormControl>
                      <FormLabel>GST Unregistered Authority Latter </FormLabel>
                      <Input type="file" onChange={(e) => handleChange(e, "gst_unregistered_authority_latter")} />
                    </FormControl>
          )}

          <FormControl isInvalid={errors.firm_since}>
            <FormLabel> Firm Since</FormLabel>
            <Input
              name="firm_since"
              value={formatToInputDate(formData.firm_since || "")}
              onChange={handleChange}
              type="date"
              placeholder="Select Firm Start Date"
            />  {errors.firm_since && (
              <Text color="red.500" fontSize="sm">
                {errors.firm_since}
              </Text>
            )}



          </FormControl>

          <FormControl>
            <FormLabel>Firm PAN Number</FormLabel>

            <InputGroup>
              {panStatus.firm_pan && (
                <InputLeftElement width="auto" ml={2}  >
                  <Badge borderRadius="lg" p="2px"
                    colorScheme={
                      panStatus.firm_pan.status === "valid"



                        ? "green"
                        : panStatus.firm_pan.status === "error"
                          ? "red"
                          : "gray"
                    }
                  >
                    {panStatus.firm_pan.status.toUpperCase()}
                  </Badge>
                </InputLeftElement>
              )}

              <Input
                name="firm_pan"
                value={formData.firm_pan}
                onChange={handleChange}
                pl={panStatus.firm_pan ? "90px" : "12px"}
              />

              <InputRightElement>
                <IconButton
                  size="sm"
                  colorScheme="blue"
                  icon={<FiCheckCircle />}
                  isDisabled={!isValidPan(formData.firm_pan)}
                  onClick={() =>
                    handlePanVerification(formData.firm_pan, "firm_pan")
                  }
                />
              </InputRightElement>
            </InputGroup>
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

          <FormControl isInvalid={errors.branch}>
            <FormLabel>branch</FormLabel>
            <Input
              name="branch"
              value={formData.branch}
              onChange={handleChange}
            /> {errors.branch && (
              <Text color="red.500" fontSize="sm">
                {errors.branch}
              </Text>
            )}
          </FormControl>


          <FormControl isInvalid={errors.firm_landmark}>
            <FormLabel>Landmark</FormLabel>
            <Input
              name="firm_landmark"
              value={formData.firm_landmark}
              onChange={handleChange}
            /> {errors.firm_landmark && (
              <Text color="red.500" fontSize="sm">
                {errors.firm_landmark}
              </Text>
            )}
          </FormControl>



          {/* Business Address */}
        <DisBussinessAddressForm
        formData={formData}
        handleChange={handleChange}
         handlePanVerification={handlePanVerification}
                    panStatus={panStatus}
                    errors={errors}
        />

          {firmtype === "proprietorship" && (
            <AddressForm
              data={ownerAddress}
              label="Owner Address"
              handlePanVerification={handlePanVerification}
              panStatus={panStatus}
              errors={errors}
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
                    handlePanVerification={handlePanVerification}
                    panStatus={panStatus}
                    errors={errors}
                    onChange={handlePartnerChange}

                  />
                </Box>
              ))}

              <Button mt={4} onClick={addPartner} colorScheme="blue" leftIcon={<AddIcon />}>
                Add Partner
              </Button>
            </Box>
          )}



          <FormControl isInvalid={errors.responsible_person_name}>
            <FormLabel>Responsible Persone Name</FormLabel>
            <Input
              name="responsible_person_name"
              value={formData.responsible_person_name}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone Name"
            />
            {errors.responsible_person_name && (
              <Text color="red.500" fontSize="sm">
                {errors.responsible_person_name}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={errors.responsible_person_address}>
            <FormLabel>Responsible Persone Address</FormLabel>
            <Input
              name="responsible_person_address"
              value={formData.responsible_person_address}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone Address"
            /> {errors.responsible_person_address && (
              <Text color="red.500" fontSize="sm">
                {errors.responsible_person_address}
              </Text>
            )}
          </FormControl>

          {/* <FormControl isInvalid={errors.responsible_person_contact}>
            <FormLabel>Responsible Persone Contact No</FormLabel>
            <Input
              name="responsible_person_contact"
              value={formData.responsible_person_contact}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone No"
            /> {errors.responsible_person_contact && (
              <Text color="red.500" fontSize="sm">
                {errors.responsible_person_contact}
              </Text>
            )}
          </FormControl> */}
          <FormControl isInvalid={errors.responsible_person_contact}>
  <FormLabel>Responsible Person Contact No</FormLabel>

  <InputGroup>
    <Input
      name="responsible_person_contact"
      value={formData.responsible_person_contact}
      onChange={handleChange}
    />

    <InputRightElement>
      <IconButton
        size="sm"
        colorScheme="blue"
        icon={<FiCheckCircle />}
        isDisabled={
          !/^[6-9]\d{9}$/.test(formData.responsible_person_contact)
        }
        onClick={handleResponsibleMobileVerify}
      />
    </InputRightElement>
  </InputGroup>

  {errors.responsible_person_contact && (
    <Text color="red.500" fontSize="sm">
      {errors.responsible_person_contact}
    </Text>
  )}
</FormControl>
          <FormControl isInvalid={errors.responsible_person_alt_contact}>
            <FormLabel>Responsible Persone Alternat Contact No</FormLabel>
            <Input
              name="responsible_person_alt_contact"
              value={formData.responsible_person_alt_contact}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone No"
            /> {errors.responsible_person_alt_contact && (
              <Text color="red.500" fontSize="sm">
                {errors.responsible_person_alt_contact}
              </Text>
            )}
          </FormControl>


          <FormControl>
            <FormLabel> JURISDICTION AREA</FormLabel>
            <Select
              name="jurisdiction_area"
              value={formData.jurisdiction_area || ""}
              onChange={handleChange} placeholder="--please select--"
            >
              <option value="alwar">ALWAR</option>
              <option value="jaipur">JAIPUR</option>
            </Select>

          </FormControl>



          <FormControl isInvalid={errors.seed_license_no}>
            <FormLabel>Seed License No.</FormLabel>
            <Input
              name="seed_license_no"
              value={formData.seed_license_no}
              onChange={handleChange}
            /> {errors.seed_license_no && (
              <Text color="red.500" fontSize="sm">
                {errors.seed_license_no}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={errors.seed_license_expiry} >
            <FormLabel>Seed License Expiry Date</FormLabel>

            <Input
              type="date"
              name="seed_license_expiry"
              value={formData.seed_license_expiry || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seed_license_expiry: e.target.value
                }))
              }
            />  {errors.seed_license_expiry && (
              <Text color="red.500" fontSize="sm">
                {errors.seed_license_expiry}
              </Text>
            )}
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

          <FormControl isInvalid={errors.transport_name_a}>
            <FormLabel>Tranport Name (A)</FormLabel>
            <Input
              name="transport_name_a"
              value={formData.transport_name_a}
              onChange={handleChange}
            /> {errors.transport_name_a && (
              <Text color="red.500" fontSize="sm">
                {errors.transport_name_a}
              </Text>
            )}
          </FormControl>
          <FormControl >
            <FormLabel>Tranport Name (B)</FormLabel>
            <Input
              name="transport_name_b"
              value={formData.transport_name_b}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl isInvalid={errors.source_of_funds}>
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
              <option value="cc_od">CC/OD</option>
            </Select>
            {errors.source_of_funds && (
              <Text color="red.500" fontSize="sm">
                {errors.source_of_funds}
              </Text>
            )}

          </FormControl>

          {formData.source_of_funds === "loan" && (
            <FormControl >
              <FormLabel>Loan Details</FormLabel>
              <Input
                name="own_funds_details"
                value={formData.own_funds_details}
                onChange={handleChange} placeholder="Enter Loan Details"
              />
            </FormControl>
          )}

          {formData.source_of_funds === "own_funds" && (
            <FormControl>
              <FormLabel>Own Funds Details</FormLabel>
              <Input
                name="own_funds_details"
                value={formData.own_funds_details}
                onChange={handleChange} placeholder="Enter Own Funds Details"
              />
            </FormControl>
          )}
          {formData.source_of_funds === "investment" && (
            <FormControl >
              <FormLabel>Investment Details</FormLabel>
              <Input
                name="own_funds_details"
                value={formData.own_funds_details}
                onChange={handleChange} placeholder="Enter Investment Details"
              />
            </FormControl>
          )}

          {formData.source_of_funds === "cc_od" && (
            <FormControl >
              <FormLabel>CC/OD</FormLabel>
              <Input
                name="cc_od"
                value={formData.cc_od}
                onChange={handleChange} placeholder="Enter CC / OD  Details"
              />
            </FormControl>
          )}

          <FormControl isInvalid={errors.bank_name}>
            <FormLabel>Bank Name</FormLabel>
            <Input
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
            />  {errors.bank_name && (
              <Text color="red.500" fontSize="sm">
                {errors.bank_name}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={errors.bank_account_no}>
            <FormLabel>Bank Account No</FormLabel>
            <Input
              name="bank_account_no"
              value={formData.bank_account_no}
              onChange={handleChange}
            />  {errors.bank_account_no && (
              <Text color="red.500" fontSize="sm">
                {errors.bank_account_no}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={errors.ifsc_code}>
            <FormLabel>Bank IFSC</FormLabel>
            <Input
              name="ifsc_code"
              value={formData.ifsc_code}
              onChange={handleChange}
            />   {errors.ifsc_code && (
              <Text color="red.500" fontSize="sm">
                {errors.ifsc_code}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={errors.bank_branch}>
            <FormLabel>Bank branch</FormLabel>
            <Input
              name="bank_branch"
              value={formData.bank_branch}
              onChange={handleChange}
            />    {errors.bank_branch && (
              <Text color="red.500" fontSize="sm">
                {errors.bank_branch}
              </Text>
            )}
          </FormControl>
          <FormControl isInvalid={errors.security_cheque_no}>
            <FormLabel>Security Cheque No.</FormLabel>
            <Input
              name="security_cheque_no"
              value={formData.bank_cheaque_no}
              onChange={handleChange}
            />         {errors.security_cheque_no && (
              <Text color="red.500" fontSize="sm">
                {errors.security_cheque_no}
              </Text>
            )}
          </FormControl>
          <FormControl isInvalid={errors.security_cheque_no_2}>
            <FormLabel>Security Cheque No.</FormLabel>
            <Input
              name="security_cheque_no_2"
              value={formData.security_cheque_no_2}
              onChange={handleChange}
            />        {errors.security_cheque_no_2 && (
              <Text color="red.500" fontSize="sm">
                {errors.security_cheque_no_2}
              </Text>
            )}
          </FormControl>


          <FormControl>
            <FormLabel>Security Amount</FormLabel>
            <Input
              name="security_amount"
              value={formData.security_amount}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl >
            <FormLabel>Credit Amount</FormLabel>
            <Input
              name="credit_amount"
              value={formData.credit_amount}
              onChange={handleChange}
            /> 
          </FormControl>

          <FormControl >
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


          <FormControl gridColumn={{ base: "span 1", md: "span 2" }} border="1px solid #413e3e" p={4} borderRadius="lg" >
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
                    value={company.name}
                    onChange={(e) =>
                      handleOtherCompanyChange(index, "name", e.target.value)
                    }
                  />

                  {/* Turnover */}
                  <Input ml={{ base: 0, md: 3 }}
                    placeholder="Turnover"
                    value={company.turnover}
                    onChange={(e) =>
                      handleOtherCompanyChange(index, "turnover", e.target.value)
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
            <FormControl isInvalid={errors.approver_name}>
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
              {errors.approver_name && (
                <Text color="red.500" fontSize="sm">
                  {errors.approver_name}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={errors.approving_date}>
              <FormLabel>Approvering Date</FormLabel>

              <Input
                type="date"
                name="approving_date"
                value={formData.approving_date || ""}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.approving_date && (
                <Text color="red.500" fontSize="sm">
                  {errors.approving_date}
                </Text>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>Upload Approval Image</FormLabel>

              <Input
                type="file"
                accept="image/*"
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
              <Button onClick={() => document.getElementById("cameraUpload").click()} size={{ base: "sm", md: "lg" }}>
                📷 Upload Approver Image
              </Button>
            </FormControl>
          </SimpleGrid>
        </Box>


        {/* upload documents  */}
        <DistributorDocuments
          formData={formData}
          onSendData={handleChildData} />

      </Box>

      <Box textAlign="center">
        <Button
          colorScheme="blue" ml={5}
          mt={6}
          onClick={previewModal.onOpen}
        >
          Download  Latter
        </Button>

        <Button ml={5}
          colorScheme="green"
          mt={6}
          onClick={generateModal.onOpen}
        >
          Genrate  Disributor Aggrement Latter
        </Button>
        <Button ml={5}
          colorScheme="teal"
          mt={6}
          onClick={handleformSubmit}
        //  isDisabled={!formData.customer_name || !formData.gst_number}
        >

          Submit Form
        </Button>
      </Box>

      <DistributorAgreementPreview
        isOpen={generateModal.isOpen}
        onClose={generateModal.onClose}
        formData={formData}
        ownerAddress={ownerAddress}
        partners={partners}
        otherCompanies={otherCompanies}

      />
      <DistributorAgreementPdfPreview
        isOpen={previewModal.isOpen}
        onClose={previewModal.onClose}
        formData={formData}
        ownerAddress={ownerAddress}
        partners={partners}
        otherCompanies={otherCompanies}
      />




    </>
  )
}


export default DistributorAgreement
