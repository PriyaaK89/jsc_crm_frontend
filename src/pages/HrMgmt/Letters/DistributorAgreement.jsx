import React, { useState, useEffect } from "react";
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

import useUsersapi from "../../../Apis/GetUsersapi";
import DistributorDocuments from "./DistributorDocuments";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import DistributorAgreementPreview from "./DistributorAgreementPreviewModel";



//  Address Component
const AddressForm = ({ data, onChange, index = 0, label }) => {

  return (
    <Box border="1px solid black" borderRadius="lg" mt={4} gridColumn={{ base: "span 1", md: "span 2" }}>
      <Text fontWeight="bold" mb={3} bg="#e9f2ff" p={3} borderTopRadius="lg" borderBottom="1px solid #f3f3f3"> {label}</Text>

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
          <FormLabel>{label.includes("Partner") ? "Upload Partner Photo" : "Upload Owner Photo"}</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              onChange(
                index,
                label.includes("Partner") ? "partner_photo" : "upload_img",
                e.target.files[0]
              )
            }
          />


        </FormControl>
      </SimpleGrid>
    </Box>
  );
};
// -------------------------main function------------------------------------------------------
function DistributorAgreement() {

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const handleChildData = (data) => { setFormData((prev) => ({ ...prev, documents: data, })); };

  const { users } = useUsersapi();
  const previewModal = useDisclosure();
  const generateModal = useDisclosure();
  const [firmtype, setFirmtype] = useState("");
  const [formData, setFormData] = useState({ gst_number: '' });
  const [gstStatus, setGstStatus] = useState("");
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

  // useEffect(() => {
  //   if (formData.pincode && formData.pincode.length === 6) {
  //     handlePincodeChange();
  //   }
  // }, []);

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
  const handleformSubmit = async () => {
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
  // const handleFileChange = (name, file) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: file,
  //   }));
  // };
  // date formate set 
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

          <FormControl>
            <FormLabel>Customer Name</FormLabel>
            <Input
              name="customer_name"
              value={formData.customer_name || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Customer DOB</FormLabel>
            <Input
              type="date"
              name="customer_dob"
              value={formData.customer_dob || ""}
              onChange={handleChange}
            />
          </FormControl>


          <FormControl>
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
          </FormControl>


          {/* Business Address */}
          <Box border="1px" borderColor="gray.900" gridColumn={{ base: "span 1", md: "span 2" }} p={4} borderRadius="lg">

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
                <Input name="state" value={formData.state || ""} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>District</FormLabel>
                <Input name="district" value={formData.district || ""} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Tehsil</FormLabel>
                <Input name="tehsil" value={formData.tehsil || ""} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Landmark</FormLabel>
                <Input name="landmark" value={formData.landmark || ""} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Pincode</FormLabel>
                <Input name="pincode" value={formData.pincode || ""} onChange={(e) => handlePincodeChange(e.target.value)} />
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

              <Button mt={4} onClick={addPartner} colorScheme="blue" leftIcon={<AddIcon />}>
                Add Partner
              </Button>
            </Box>
          )}



          <FormControl>
            <FormLabel>Responsible Persone Name</FormLabel>
            <Input
              name="responsible_person_name"
              value={formData.responsible_person_name}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone Name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Responsible Persone Address</FormLabel>
            <Input
              name="responsible_person_address"
              value={formData.responsible_person_address}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone Address"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Responsible Persone Contact No</FormLabel>
            <Input
              name="responsible_person_contact"
              value={formData.responsible_person_contact}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone No"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Responsible Persone Alternat Contact No</FormLabel>
            <Input
              name="responsible_person_alt_contact"
              value={formData.responsible_person_alt_contact}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone No"
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
              onChange={handleChange} placeholder="--please select--"
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

          <FormControl >
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
              value={formData.bank_cheaque_no}
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
                value={formData.approving_date || ""}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
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
