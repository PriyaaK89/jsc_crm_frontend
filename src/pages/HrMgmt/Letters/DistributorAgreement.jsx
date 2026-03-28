import React, { useState } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Button, Text,
  FormControl,
  FormLabel,
  Input, useDisclosure,
  Heading, Flex,
  SimpleGrid,
  VStack,
  Select,
  Divider,
  Image,             
  Modal,              
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useToast
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { CloseIcon } from "@chakra-ui/icons";
import { GoHomeFill } from "react-icons/go";
import DistributorAgreementPdfPreview from "./DistributorAgreementPdfPreview";
import DistributorAgreementPreview from './DistributorAgreementpreview';
import useUsersapi from "../../../Apis/GetUsersapi";
import DistributorDocuments from "./DistributorDocuments";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";


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
          <FormLabel>Upload owner Passport size Photo</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onChange(index, "upload_img", e.target.files[0])}
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
const handleChildData = (data) => {
  setFormData((prev) => ({
    ...prev,
    documents: data, //  keep separate
  }));
};
 

 
  const { users } = useUsersapi();
  const previewModal = useDisclosure();
  const generateModal = useDisclosure();



  const [firmtype, setFirmtype] = useState("");
  const [formData, setFormData] = useState({firm_gstn_no: ''});
  const [otherCompanies, setOtherCompanies] = useState([
    { name: "", turnover: "" }
  ]);

  // const [firmAddress, setFirmAddress] = useState({
  //   address: "",
  //   state: "",
  //   district: "",
  //   tehsil: "",
  //   pincode: "",
  // });

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

  const [partners, setPartners] = useState([
    {
      address: "", state: "", district: "", tehsil: "", pincode: "", pan_no: "", aadhar_no: "", mobile_no: "", alt_mobile_no: "", name: "",
      father_name: "", upload_img: null
    },
  ]);

const handleGSTverification = async () => {
  try {
    // setLoading(true);
    if (!formData.firm_gstn_no) {
      toast({
        description: "Enter your gst number",
        duration: 2000,
        status: 'error'
      });
      return;
    }
console.log("GST VALUE:", formData.firm_gstn_no);
    const response = await API.post(API_ENDPOINTS.Gst_verify, {
      gst_number: formData.firm_gstn_no,
    });

    const data = response?.data;

    if (data?.success && data?.isVerified) {

      setFormData((prev) => ({
        ...prev,

        firm_name: data.business_name || "",
        firm_type: data.business_type?.toLowerCase() || "",

        business_address: `${data.address?.building || ""}, ${data.address?.street || ""}, ${data.address?.location || ""}`,
        state: data.address?.state || "",
        district: data.address?.district || "",
        pin_code: data.address?.pincode || "",

        frim_gstn_type: data.business_type === "Proprietorship"
          ? "Regular"
          : prev.frim_gstn_type,

        customername: data.legal_name || "",
      }));

      if (data.business_type === "Proprietorship") {
        setOwnerAddress((prev) => ({
          ...prev,
          name: data.legal_name || "",
          address: `${data.address?.building || ""}, ${data.address?.street || ""}`,
          state: data.address?.state || "",
          district: data.address?.district || "",
          pincode: data.address?.pincode || "",
        }));
      }

      toast({
        description: "GST verified and Values are auto filled",
        duration: 2000,
        status: 'success'
      })

    } else {
      toast({
        description: "GST not verified",
        duration: 1500,
        status: 'error'
      })
    }
    // setLoading(false);

  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
};

  // add mulyiple comapny
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

  //  Partner change
  const handlePartnerChange = (index, field, value) => {
    const updated = [...partners];
    updated[index][field] = value;
    setPartners(updated);
  };

  //  Add Partner
  const addPartner = () => {
    setPartners([
      ...partners,
      {
        address: "", state: "", district: "", tehsil: "", pincode: "", pan_no: "", aadhar_no: "", name: "",
        father_name: "",
      },
    ]);
  };

  //  Remove Partner
  const removePartner = (index) => {
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
      approver_name: selectedApprover, // ✅ proper key
    }));
  };
  // habndle change 
  const handleChange = (e) => {
    const { name, value } = e.target;

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



  return (
    <>
       <Box
           bg="white"
           mt={{base:2, md:5}}
           px={{base:3, md:6}}
           py={{base:3, md:4}}
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
              name="customername"
              value={formData.customername || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Customer DOB</FormLabel>
            <Input
              type="date"
              name="customerdob"
              value={formData.customerdob || ""}
              onChange={handleChange}
            />
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
              <option value="private_limited">Private Limited</option>
            </Select>
          </FormControl>

          {formData?.firm_type === "partnership" && (
            <FormControl>
              <FormLabel>Upload Authority latter </FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("authoratyfile", e.target.files[0])}
              />
            </FormControl>
          )}

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
              <FormLabel>Business Tarritory</FormLabel>
              <Input
                name="tarritory"
                value={formData.tarritory || ""}
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
                <FormLabel>Pincode</FormLabel>
                <Input name="pin_code" value={formData.pin_code || ""} onChange={handleChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Contact No(without +91)</FormLabel>
                <Input
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                // placeholder="Enter Contact No (without +91)"
                />
              </FormControl>
              <FormControl>
                <FormLabel> Alt. Contact No</FormLabel>
                <Input
                  name="alternative_contact_person"
                  value={formData.alternative_contact_person}
                  onChange={handleChange}
                // placeholder="Enter Alternative Contact No (without +91)"
                />
              </FormControl>
            </SimpleGrid>
          </Box>

          {/* Proprietorship */}
          {firmtype === "proprietorship" && (
            <AddressForm
              data={ownerAddress}
              label="Owner Address"
              onChange={(i, field, value) =>
                setOwnerAddress({ ...ownerAddress, [field]: value })
              }
            />
          )}

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
                    isDisabled={partners.length === 1}
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
              name="responsile_person_name"
              value={formData.responsile_person_name}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone Name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Responsible Persone Address</FormLabel>
            <Input
              name="responsile_person_address"
              value={formData.responsile_person_address}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone Address"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Responsible Persone Contact No</FormLabel>
            <Input
              name="responsile_person_no"
              value={formData.responsile_person_no}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone No"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Responsible Persone Alternat Contact No</FormLabel>
            <Input
              name="responsile_Alternat_person_no"
              value={formData.responsile_Alternat_person_no}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone No"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Firm Email Id</FormLabel>
            <Input
              name="firm_email_id"
              value={formData.firm_email_id}
              onChange={handleChange}
            // placeholder="Enter Firm GSTN"
            />
          </FormControl>

          <FormControl>
  <FormLabel>Firm GSTN</FormLabel>

  <Flex gap={2}>
    <Input
      name="firm_gstn_no"
      value={formData.firm_gstn_no }
      onChange={handleChange}
      placeholder="Enter GST Number"
    />

    <Button
      colorScheme="blue"
      onClick={handleGSTverification}
      // isDisabled={!formData.firm_gstn_no}
    >
      Verify
    </Button>
  </Flex>
</FormControl>

          <FormControl>
            <FormLabel>Firm GSTN type</FormLabel>
            <Select
              name="frim_gstn_type"
              value={formData.frim_gstn_type}
              onChange={handleChange}
            // placeholder="Select Firm GSTN Type"
            >
              <option>Composition</option>
              <option>Consumer</option>
              <option>Regular</option>
              <option>Unregisterd</option>
            </Select>
          </FormControl>


          <FormControl>
            <FormLabel> Firm Since</FormLabel>
            <Select
              name="firm_since_date"
              value={formData.firm_start_date || ""}
              onChange={handleChange}
            >
              <option value="">Select Year</option>

              {Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </Select>

          </FormControl>

          <FormControl>
            <FormLabel>Firm PAN Number</FormLabel>
            <Input
              name="firm_pan_no"
              value={formData.firm_pan_no}
              onChange={handleChange}
            // placeholder="Enter Firm PAN Card No."
            />
          </FormControl>

          <FormControl>
            <FormLabel> Firm Aadhar Card</FormLabel>
            <Input
              name="firm_aadhar_no"
              value={formData.firm_aadhar_no}
              onChange={handleChange}
            // placeholder="Enter Firm Aadhar Card No."
            />
          </FormControl>

          <FormControl>
            <FormLabel> JURISDICTION AREA</FormLabel>
            <Select
              name="jurisdiction_district"
              value={formData.jurisdiction_district || ""}
              onChange={handleChange} placeholder="--please select--"
            >
              <option value="alwar">ALWAR</option>
              <option value="jaipur">JAIPUR</option>
            </Select>

          </FormControl>


          <FormControl>
            <FormLabel>Branch</FormLabel>
            <Input
              name="branch"
              value={formData.branch}
              onChange={handleChange}
            />
          </FormControl>


          <FormControl>
            <FormLabel>Landmark</FormLabel>
            <Input
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Seed License No.</FormLabel>
            <Input
              name="seed_license"
              value={formData.seed_license}
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
              name="fertilizer_license"
              value={formData.fertilizer_license}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Pesticide License No.</FormLabel>
            <Input
              name="pesticide_license"
              value={formData.pesticide_license}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Tranport Name</FormLabel>
            <Input
              name="transportname"
              value={formData.transport_name}
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

          <FormControl>
            <FormLabel>Bank IFSC</FormLabel>
            <Input
              name="bank_ifsc"
              value={formData.bank_ifsc}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bank Branch</FormLabel>
            <Input
              name="bank_Branch"
              value={formData.bank_Branch}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Security Cheque No.</FormLabel>
            <Input
              name="bank_cheaque_no"
              value={formData.bank_cheaque_no}
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
              name="credit_duration_period"
              value={formData.credit_duration_period}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Firm Annual Turnover</FormLabel>
            <Input
              name="firm_anual_turnover"
              value={formData.firm_anual_turnover}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Expected Sale Per Year</FormLabel>
            <Input
              name="expected_sale_per_year"
              value={formData.expected_sale_per_year}
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
                  <Input ml={{base:0,md:3}}
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
                name="approvering_date"
                value={formData.approvering_date || ""}
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
                    approvering_image: file,
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
       onSendData={handleChildData}/>
 
      </Box>

      <Box textAlign="center">
        <Button
          colorScheme="blue" ml={5}
          mt={6}
          onClick={previewModal.onOpen}
        >
          Download Aggrement Latter
        </Button>

        <Button ml={5}
          colorScheme="green"
          mt={6}
          onClick={generateModal.onOpen}
        >
          Genrate  Disributor Aggrement
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
