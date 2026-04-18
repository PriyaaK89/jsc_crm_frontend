import React from "react";
import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  IconButton,
  SimpleGrid,
  Badge,
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  IconButton,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { FiCheckCircle } from "react-icons/fi";

const AddressForm = ({
  data,
  onChange,
  index = 0,
  label,
  panStatus,
  handlePanVerification,
  errors,
  data,
  onChange,
  index = 0,
  label,
  panStatus,
  handlePanVerification,
  errors,
}) => {
  const isOwner = label.includes("Owner");
  const isOwner = label.includes("Owner");

  const getError = (field) =>
    isOwner ? errors[`owner_${field}`] : errors[`partner_${index}_${field}`];

  const panKey = isOwner ? "owner_pan" : `partner_${index}`;
  const getError = (field) =>
    isOwner ? errors[`owner_${field}`] : errors[`partner_${index}_${field}`];

  const panKey = isOwner ? "owner_pan" : `partner_${index}`;

  const isValidPan = (pan) =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan || "");
  const isValidPan = (pan) =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan || "");

  return (
    <Box border="1px solid black" borderRadius="lg" mt={4} gridColumn={{ base: "span 1", md: "span 2" }}>
      
      <Text fontWeight="bold" bg="#e9f2ff" p={3} borderTopRadius="lg">
        {label}
      </Text>
  return (
    <Box border="1px solid black" borderRadius="lg" mt={4} gridColumn={{ base: "span 1", md: "span 2" }}>
      
      <Text fontWeight="bold" bg="#e9f2ff" p={3} borderTopRadius="lg">
        {label}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} p={4}>
        
        {/* NAME */}
        <FormControl isInvalid={!!getError("name")}>
          <FormLabel>Name</FormLabel>
          <Input
            value={data.name || ""}
            onChange={(e) => onChange(index, "name", e.target.value)}
          />
          {getError("name") && <Text color="red.500">{getError("name")}</Text>}
        </FormControl>

        {/* FATHER NAME */}
        <FormControl isInvalid={!!getError("father_name")}>
          <FormLabel>Father Name</FormLabel>
          <Input
            value={data.father_name || ""}
            onChange={(e) => onChange(index, "father_name", e.target.value)}
          />
        </FormControl>

        {/* PAN */}
        <FormControl isInvalid={!!getError("pan_no")}>
          <FormLabel>PAN No.</FormLabel>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} p={4}>
        
        {/* NAME */}
        <FormControl isInvalid={!!getError("name")}>
          <FormLabel>Name</FormLabel>
          <Input
            value={data.name || ""}
            onChange={(e) => onChange(index, "name", e.target.value)}
          />
          {getError("name") && <Text color="red.500">{getError("name")}</Text>}
        </FormControl>

        {/* FATHER NAME */}
        <FormControl isInvalid={!!getError("father_name")}>
          <FormLabel>Father Name</FormLabel>
          <Input
            value={data.father_name || ""}
            onChange={(e) => onChange(index, "father_name", e.target.value)}
          />
        </FormControl>

        {/* PAN */}
        <FormControl isInvalid={!!getError("pan_no")}>
          <FormLabel>PAN No.</FormLabel>

          <InputGroup>
            {panStatus?.[panKey] && (
              <InputLeftElement width="auto" ml={2}>
                <Badge
                  borderRadius="lg"
                  colorScheme={
                    panStatus[panKey].status === "verified"
                      ? "green"
                      : panStatus[panKey].status === "valid"
                      ? "green"
                      : "red"
                  }
                >
                  {panStatus[panKey].status}
                </Badge>
              </InputLeftElement>
            )}
          <InputGroup>
            {panStatus?.[panKey] && (
              <InputLeftElement width="auto" ml={2}>
                <Badge
                  borderRadius="lg"
                  colorScheme={
                    panStatus[panKey].status === "verified"
                      ? "green"
                      : panStatus[panKey].status === "valid"
                      ? "green"
                      : "red"
                  }
                >
                  {panStatus[panKey].status}
                </Badge>
              </InputLeftElement>
            )}

            <Input
              value={data.pan_no || ""}
              onChange={(e) =>
                onChange(index, "pan_no", e.target.value.toUpperCase())
              }
              pl={panStatus?.[panKey] ? "90px" : "12px"}
            />
            <Input
              value={data.pan_no || ""}
              onChange={(e) =>
                onChange(index, "pan_no", e.target.value.toUpperCase())
              }
              pl={panStatus?.[panKey] ? "90px" : "12px"}
            />

            <InputRightElement>
              <IconButton
                size="sm"
                colorScheme="blue"
                icon={<FiCheckCircle />}
                isDisabled={!isValidPan(data.pan_no)}
                onClick={() =>
                  handlePanVerification(data.pan_no, panKey, index)
                }
              />
            </InputRightElement>
          </InputGroup>
            <InputRightElement>
              <IconButton
                size="sm"
                colorScheme="blue"
                icon={<FiCheckCircle />}
                isDisabled={!isValidPan(data.pan_no)}
                onClick={() =>
                  handlePanVerification(data.pan_no, panKey, index)
                }
              />
            </InputRightElement>
          </InputGroup>

          {getError("pan_no") && (
            <Text color="red.500">{getError("pan_no")}</Text>
          )}
        </FormControl>
          {getError("pan_no") && (
            <Text color="red.500">{getError("pan_no")}</Text>
          )}
        </FormControl>

        {/* AADHAR */}
        <FormControl isInvalid={!!getError("aadhar_no")}>
          <FormLabel>Aadhar No.</FormLabel>
          <Input
            type="text"
            maxLength={12}
            value={data.aadhar_no || ""}
            onChange={(e) =>
              onChange(index, "aadhar_no", e.target.value.replace(/\D/g, ""))
            }
          />
        </FormControl>

        {/* MOBILE */}
        <FormControl isInvalid={!!getError("mobile_no")}>
          <FormLabel>Mobile No.</FormLabel>
          <Input
            maxLength={10}
            value={data.mobile_no || ""}
            onChange={(e) =>
              onChange(index, "mobile_no", e.target.value.replace(/\D/g, ""))
            }
          />
        </FormControl>
        {/* AADHAR */}
        <FormControl isInvalid={!!getError("aadhar_no")}>
          <FormLabel>Aadhar No.</FormLabel>
          <Input
            type="text"
            maxLength={12}
            value={data.aadhar_no || ""}
            onChange={(e) =>
              onChange(index, "aadhar_no", e.target.value.replace(/\D/g, ""))
            }
          />
        </FormControl>

        {/* MOBILE */}
        <FormControl isInvalid={!!getError("mobile_no")}>
          <FormLabel>Mobile No.</FormLabel>
          <Input
            maxLength={10}
            value={data.mobile_no || ""}
            onChange={(e) =>
              onChange(index, "mobile_no", e.target.value.replace(/\D/g, ""))
            }
          />
        </FormControl>

        {/* ALT MOBILE */}
        <FormControl isInvalid={!!getError("alt_mobile_no")}>
          <FormLabel>Alt Mobile No.</FormLabel>
          <Input
            maxLength={10}
            value={data.alt_mobile_no || ""}
            onChange={(e) =>
              onChange(index, "alt_mobile_no", e.target.value.replace(/\D/g, ""))
            }
          />
        </FormControl>

        {/* ADDRESS */}
        <FormControl isInvalid={!!getError("address")}>
          <FormLabel>Address</FormLabel>
          <Input
            value={data.address || ""}
            onChange={(e) => onChange(index, "address", e.target.value)}
          />
        </FormControl>
         {/* PINCODE */}
        <FormControl isInvalid={!!getError("pincode")}>
          <FormLabel>Pincode</FormLabel>
          <Input
            maxLength={6}
            value={data.pincode || ""}
            onChange={(e) =>
              onChange(index, "pincode", e.target.value.replace(/\D/g, ""))
            }
          />
        </FormControl>

        {/* STATE */}
        <FormControl isInvalid={!!getError("state")}>
          <FormLabel>State</FormLabel>
          <Input
            value={data.state || ""}
            onChange={(e) => onChange(index, "state", e.target.value)}
          />
        </FormControl>

        {/* DISTRICT */}
        <FormControl isInvalid={!!getError("district")}>
          <FormLabel>District</FormLabel>
          <Input
            value={data.district || ""}
            onChange={(e) => onChange(index, "district", e.target.value)}
          />
        </FormControl>

       

        {/* PHOTO */}
        <FormControl>
          <FormLabel>
            {isOwner ? "Upload Owner Photo" : "Upload Partner Photo"}
          </FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              onChange(
                index,
                isOwner ? "upload_img" : "partner_photo",
                e.target.files[0]
              )
            }
          />
        </FormControl>
      </SimpleGrid>
    </Box>
  );
};

export default AddressForm;