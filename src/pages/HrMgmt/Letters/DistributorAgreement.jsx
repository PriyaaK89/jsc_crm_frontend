import React, { useState } from "react";
import {
  Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Button, Text,
  FormControl,
  FormLabel,
  Input, useDisclosure,
  Heading,
  SimpleGrid,
  VStack,
  Select,
  Divider
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { CloseIcon } from "@chakra-ui/icons";
import { GoHomeFill } from "react-icons/go";
import DistributorAgreementPreview from "./DistributorAgreementPreview";
import useUsersapi from "../../../Apis/GetUsersapi";


// ✅ Address Component
const AddressForm = ({ data, onChange, index = 0, label }) => {

  return (
    <Box border="1px solid black" borderRadius="lg" mt={4} gridColumn="span 2">
      <Text fontWeight="bold" mb={3} bg="#e9f2ff" p={3} borderTopRadius="lg" borderBottom="1px solid #f3f3f3"> {label}</Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} p={4}>
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
          <FormLabel>Upload owner Passport size Photo</FormLabel>

          <Input
            type="file"
            accept="image/*"

            onChange={(e) => {
               e.target.files[0];
              
            }}

          />
         

        </FormControl>
      </SimpleGrid>
    </Box>
  );
};

function DistributorAgreement() {
  const { users } = useUsersapi();

  const [firmtype, setFirmtype] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({});
  const [otherCompanies, setOtherCompanies] = useState([""]);

  const [firmAddress, setFirmAddress] = useState({
    address: "",
    state: "",
    district: "",
    tehsil: "",
    pincode: "",
  });

  const [ownerAddress, setOwnerAddress] = useState({
    address: "",
    state: "",
    district: "",
    tehsil: "",
    pincode: "",
    pan_no: "",
    aadharno: "",
  });

  const [partners, setPartners] = useState([
    { address: "", state: "", district: "", tehsil: "", pincode: "", pan_no: "", aadharno: "" },
  ]);

  // add mulyiple comapny
  const handleOtherCompanyChange = (index, value) => {
    const updated = [...otherCompanies];
    updated[index] = value;
    setOtherCompanies(updated);
  };

  const addOtherCompany = () => {
    setOtherCompanies([...otherCompanies, ""]);
  };
  const removeOtherCompany = (index) => {
    const updated = otherCompanies.filter((_, i) => i !== index);
    setOtherCompanies(updated);
  };

  // ✅ Partner change
  const handlePartnerChange = (index, field, value) => {
    const updated = [...partners];
    updated[index][field] = value;
    setPartners(updated);
  };

  // ✅ Add Partner
  const addPartner = () => {
    setPartners([
      ...partners,
      { address: "", state: "", district: "", tehsil: "", pincode: "", pan_no: "", aadharno: "" },
    ]);
  };

  // ✅ Remove Partner
  const removePartner = (index) => {
    const updated = partners.filter((_, i) => i !== index);
    setPartners(updated);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Box bg="white" p={6} borderRadius="lg">

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
              value={firmtype}
              onChange={(e) => {
                handleChange(e);
                setFirmtype(e.target.value);
              }}
            >
              <option value="">Select</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              {/* <option value="llp">LLP</option>
              <option value="private_limited">Private Limited</option>
              <option value="public_limited">Public Limited</option>
              <option value="opc">OPC</option> */}
            </Select>
          </FormControl>

          {/* Business Address */}
          <Box border="1px" borderColor="gray.900" gridColumn="span 2" p={4} borderRadius="lg">

            <FormControl mt={3}>
              <FormLabel>Business Address</FormLabel>
              <Input
                name="business_address"
                value={formData.business_address || ""}
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
                <Input name="pincode" value={formData.pincode || ""} onChange={handleChange} />
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
            <Box gridColumn="span 2">
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

          <FormControl>
            <FormLabel>Responsible Persone Name</FormLabel>
            <Input
              name="responsiblepersonename"
              value={formData.responsile_person_name}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone Name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Responsible Persone Address</FormLabel>
            <Input
              name="responsiblepersoneaddress"
              value={formData.responsile_person_address}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone Address"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Responsible Persone Contact No</FormLabel>
            <Input
              name="responsiblepersoneno"
              value={formData.responsile_person_no}
              onChange={handleChange}
            // placeholder="Enter Responsible Persone No"
            />
          </FormControl>


          <FormControl>
            <FormLabel>Firm GSTN</FormLabel>
            <Input
              name="firm_gstn"
              value={formData.firm_gstn_no}
              onChange={handleChange}
            // placeholder="Enter Firm GSTN"
            />
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
            <Input type="date"
              name="firm_start_date"
              value={formData.firm_since_date}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>PAN Number</FormLabel>
            <Input
              name="pan_no"
              value={formData.pan_no}
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
              name="fertilizer_license"
              value={formData.fertilizer_license}
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


          <FormControl gridColumn="span 2">
            <FormLabel>Other Company Detail</FormLabel>

            {otherCompanies.map((company, index) => (
              <Box
                key={index}
                position="relative"
                mb={3}
              // _hover={{ ".remove-btn": { opacity: 1 } }} // 👈 only this box reacts
              >

                {/* ❌ Remove Button */}
                <Button
                  className="remove-btn"
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  borderRadius="lg"
                  right="0"
                  top="-25px"
                  // opacity={0}
                  transition="0.2s"
                  onClick={() => removeOtherCompany(index)}
                  isDisabled={otherCompanies.length === 1}
                >
                  remove
                </Button>

                <Input
                  value={company}
                  mb={5}
                  onChange={(e) =>
                    handleOtherCompanyChange(index, e.target.value)
                  }
                  placeholder={`Company ${index + 1}`}
                />
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
                name="frim_gstn_type"
                value={formData.frim_gstn_type}
                onChange={handleChange}
              // placeholder="Select Firm GSTN Type"
              >{users?.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}

              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Approvering Date</FormLabel>

              <Input type="date"
                name="approveringdate"
                value={formData.approvering_date}
                onChange={handleChange}
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
              <Button onClick={() => document.getElementById("cameraUpload").click()}>
                📷 Upload Approver Image
              </Button>
            </FormControl>

          </SimpleGrid>
        </Box>

      </Box>

      <Button
        colorScheme="blue"
        mt={6}
        onClick={onOpen}
      >
        Create
      </Button>

      <DistributorAgreementPreview
        isOpen={isOpen}
        onClose={onClose}
        formData={formData}
      />




    </>
  )
}

export default DistributorAgreement
