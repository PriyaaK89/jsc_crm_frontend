import React from "react";
import {
    Box,
    Button, Text,
    FormControl,
    FormLabel,
    Input, InputGroup,
    InputRightElement, IconButton,
    InputLeftElement,
    Flex,
    SimpleGrid, Badge,
    Select,
} from "@chakra-ui/react";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { WarningIcon } from "@chakra-ui/icons";
import { FiCheckCircle } from "react-icons/fi";
import { CloseIcon } from "@chakra-ui/icons";




//  Address Component
const AddressForm = ({
    data,
    onChange,
    index = 0,
    label,
    panStatus,
    handlePanVerification,
    handleaadharverify,
    errors
}) => {

    const isOwner = label.includes("Owner");

    const getError = (field) => {
        if (isOwner) return errors[`owner_${field}`];
        return errors[`partner_${index}_${field}`];
    };

    const panKey = label.includes("Owner")
        ? "owner_pan"
        : `partner_${index}`;

    const isValidPan = (pan) => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan);
    };
    //   const validateMobile = (mobile) => {
    //   const regex = /^[6-9]\d{9}$/;
    //   return regex.test(mobile);
    // };

    return (
        <Box border="1px solid black" borderRadius="lg" mt={4} gridColumn={{ base: "span 1", md: "span 2" }}>
            <Text fontWeight="bold" mb={3} bg="#e9f2ff" p={3} borderTopRadius="lg" borderBottom="1px solid #f3f3f3"> {label}</Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} p={4}>
                <FormControl isInvalid={getError("name")}>
                    <FormLabel>NAME.</FormLabel>
                    <Input
                        value={data.name || ""}
                        onChange={(e) => onChange(index, "name", e.target.value)}

                    /> {getError("name") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("name")}
                        </Text>
                    )}


                </FormControl>
                <FormControl isInvalid={getError("father_name")}>
                    <FormLabel>FATHER NAME.</FormLabel>
                    <Input
                        value={data.father_name || ""}
                        onChange={(e) => onChange(index, "father_name", e.target.value)}
                    />
                    {getError("father_name") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("father_name")}
                        </Text>
                    )}
                </FormControl>
                <FormControl isInvalid={getError("pan_no")}>
                    <FormLabel>PAN NO.</FormLabel>

                    <InputGroup>
                        {/*  STATUS BADGE */}
                        {panStatus?.[panKey] && (
                            <InputLeftElement width="auto" ml={2}>
                                <Badge
                                    borderRadius="lg"

                                    colorScheme={
                                        panStatus[panKey].status === "valid"
                                            ? "green"
                                            : panStatus[panKey].status === "verified"
                                                ? "green"
                                                : "red"
                                    }
                                >
                                    {panStatus[panKey].status}
                                </Badge>
                            </InputLeftElement>
                        )}

                        {/* INPUT */}
                        <Input
                            value={data.pan_no || ""}
                            onChange={(e) =>
                                onChange(index, "pan_no", e.target.value.toUpperCase())
                            }
                            pl={panStatus?.[panKey] ? "90px" : "12px"}
                        />
                        {/*  VERIFY BUTTON */}

                        <InputRightElement>
                            <IconButton
                                size="sm"
                                colorScheme="blue"
                                icon={<FiCheckCircle />}
                                isDisabled={!isValidPan(data.pan_no)}
                                onClick={() =>
                                    handlePanVerification(
                                        data.pan_no,
                                        panKey,
                                        index
                                    )
                                }

                            />
                        </InputRightElement>
                    </InputGroup>

                    {getError("pan_no") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("pan_no")}
                        </Text>
                    )}
                </FormControl>

                <FormControl isInvalid={getError("aadhar_no")}>
                    <FormLabel>Aadhar No.</FormLabel>
                    <Input
                        value={data.aadhar_no || ""}
                        type="number"
                        onChange={(e) => onChange(index, "aadhar_no", e.target.value)}
                    /> {getError("aadhar_no") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("aadhar_no")}
                        </Text>
                    )}
                </FormControl>


                <FormControl isInvalid={getError("address")}>
                    <FormLabel>Address</FormLabel>
                    <Input
                        value={data.address || ""}
                        onChange={(e) => onChange(index, "address", e.target.value)}
                    /> {getError("address") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("address")}
                        </Text>
                    )}
                </FormControl>

                <FormControl isInvalid={getError("state")}>
                    <FormLabel>State</FormLabel>
                    <Input
                        value={data.state || ""}
                        onChange={(e) => onChange(index, "state", e.target.value)}
                    /> {getError("state") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("state")}
                        </Text>
                    )}
                </FormControl>

                <FormControl isInvalid={getError("district")}>
                    <FormLabel>District</FormLabel>
                    <Input
                        value={data.district || ""}
                        onChange={(e) => onChange(index, "district", e.target.value)}
                    /> {getError("district") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("district")}
                        </Text>
                    )}
                </FormControl>

                <FormControl isInvalid={getError("tehsil")}>
                    <FormLabel>Tehsil</FormLabel>
                    <Input
                        value={data.tehsil || ""}
                        onChange={(e) => onChange(index, "tehsil", e.target.value)}
                    /> {getError("tehsil") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("tehsil")}
                        </Text>
                    )}
                </FormControl>

                <FormControl isInvalid={getError("pincode")}>
                    <FormLabel>Pincode</FormLabel>
                    <Input type="number"
                        value={data.pincode || ""}
                        onChange={(e) => onChange(index, "pincode", e.target.value)}
                    /> {getError("pincode") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("pincode")}
                        </Text>
                    )}
                </FormControl>

                <FormControl isInvalid={getError("mobile_no")}>
                    <FormLabel>Mobile No.</FormLabel>
                    <InputGroup>
                        <Input
                            value={data.mobile_no || ""}
                            maxLength={10}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                onChange(index, "mobile_no", value);
                            }}
                        />
                        <InputRightElement>
                            <IconButton
                                size="sm"
                                colorScheme="blue"
                                icon={<FiCheckCircle />}
                                //  isDisabled={!validateMobile(data.mobile)}
                                onClick={() =>
                                    handleaadharverify(
                                        data.mobile_no,
                                        panKey,
                                        index
                                    )
                                    
                                }

                            />
                        </InputRightElement>
                    </InputGroup>
                    {getError("mobile_no") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("mobile_no")}
                        </Text>
                    )}
                </FormControl >



                <FormControl isInvalid={getError("alt_mobile_no")}>
                    <FormLabel>Alt Mobile No.</FormLabel>
                    <Input type="number"
                        value={data.alt_mobile_no || ""}
                        onChange={(e) => onChange(index, "alt_mobile_no", e.target.value)}
                    /> {getError("alt_mobile_no") && (
                        <Text color="red.500" fontSize="sm">
                            {getError("alt_mobile_no")}
                        </Text>
                    )}
                </FormControl>

                <FormControl >
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

export default AddressForm;
