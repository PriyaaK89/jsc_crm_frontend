import React, { useEffect, useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    Button, VStack, FormControl, FormLabel, Input, Select, Text, useToast, Spinner, Flex, Box, HStack,} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const EditEmpIndividualTargetModal = ({
    isEditModalOpen,
    onEditModalClose,
    selectedId,
    getEmployeeTargets,
}) => {

    // ================= TOAST =================
    const toast = useToast();


    // ================= STATES =================
    const [loading, setLoading] = useState(false);

    const [btnLoading, setBtnLoading] = useState(false);

    const [empTargetInfo, setEmpTargetInfo] = useState({
        // user_name,
        user_id: "",
        role: "",
        target_type: "",
        duration_type: "",
        start_date: "",
        target_amount: "",
        categories: [],
    });



    // ================= RESET FORM =================
    const resetForm = () => {

        setEmpTargetInfo({
            user_id: "",
            role: "",
            target_type: "",
            duration_type: "",
            start_date: "",
            target_amount: "",
            categories: [],
        });
    };



    // ================= CLOSE MODAL =================
    const handleClose = () => {

        resetForm();

        onEditModalClose();
    };



    // ================= GET TARGET INFO =================
    const getEmpTargetInfoById = async () => {

        if (!selectedId) return;

        try {

            setLoading(true);

            const response = await API.get(
                `${API_ENDPOINTS.get_individual_targets_by_id}/${selectedId}`
            );

            const data = response?.data?.data;

            setEmpTargetInfo({
                user_id: data?.user_id || "",
                user_name: data?.user_name || "",
                role: data?.role || "",
                target_type: data?.target_type || "",
                duration_type: data?.duration_type || "",
                start_date: data?.start_date?.split("T")[0] || "",
                target_amount: data?.target_amount || "",
                categories: data?.category_ids
                    ? data.category_ids.split(",").map(Number)
                    : [],
            });

        } catch (error) {

            console.log(error, "Error");

            toast({
                title: "Error",
                description: "Failed to fetch target details",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        } finally {

            setLoading(false);
        }
    };



    // ================= USE EFFECT =================
    useEffect(() => {

        if (isEditModalOpen && selectedId) {
            getEmpTargetInfoById();
        }

    }, [selectedId, isEditModalOpen]);



    // ================= HANDLE CHANGE =================
    const handleChange = (e) => {

        const { name, value } = e.target;

        setEmpTargetInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };



    // ================= HANDLE UPDATE =================
    const handleEditEmpTargets = async () => {

        try {

            setBtnLoading(true);

            await API.put(
                `${API_ENDPOINTS.edit_individual_target}/${selectedId}`,
                empTargetInfo
            );

            toast({
                title: "Success",
                description: "Employee target updated successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            getEmployeeTargets();

            handleClose();

        } catch (error) {

            console.log(error, "Error in updating!");

            toast({
                title: "Error",
                description:
                    error?.response?.data?.message ||
                    "Failed to update target",
                status: "error",
                duration: 3000,
                isClosable: true,
            });

        } finally {

            setBtnLoading(false);
        }
    };



    return (
        <>
            <Modal isOpen={isEditModalOpen} onClose={handleClose} isCentered size="lg" >
                <ModalOverlay />
                <ModalContent borderRadius="20px" overflow="hidden" >
                    <Box bg="#c3dae0" px={6} py={6} borderBottom="1px solid" borderColor="gray.100" >
                        <ModalHeader p={0}>
                            <VStack spacing={2} align="start" >
                                <HStack>
                                    <Text fontSize="16px" fontWeight="600" color="gray.700" > Edit Employee Target </Text>
                                    <Text fontSize="13px" fontWeight="500">({empTargetInfo?.user_name})</Text>
                                </HStack>
                            </VStack>
                        </ModalHeader>
                        <ModalCloseButton top="10px" right="10px" />
                    </Box>


                    <ModalBody pb={6}>
                        {loading ? (
                            <Flex justify="center" align="center" py={10}>
                                <Spinner size="lg" color="blue.500" />
                            </Flex>
                        ) : (

                            <VStack spacing={5} align="stretch">

                                {/* ROLE */}

                                <FormControl>
                                    <FormLabel fontSize="14px" fontWeight="600" color="gray.700" > Role </FormLabel>
                                    <Input name="role" value={empTargetInfo?.role} onChange={handleChange} placeholder="Enter role" bg="gray.50" fontSize="14px" color="gray.600" />
                                </FormControl>

                                <FormControl>

                                    <FormLabel fontSize="14px" fontWeight="600" color="gray.700" >
                                        Target Type
                                    </FormLabel>

                                    <Select name="target_type" value={empTargetInfo?.target_type} onChange={handleChange} bg="gray.50"  fontSize="14px" color="gray.600">
                                        <option value=""> Select Target Type </option>
                                        <option value="SALE"> SALES </option>
                                        <option value="COLLECTION"> COLLECTION </option>
                                    </Select>

                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="14px" fontWeight="600" color="gray.700"> Duration Type </FormLabel>
                                    <Select name="duration_type" value={empTargetInfo?.duration_type} onChange={handleChange} bg="gray.50"  fontSize="14px" color="gray.600" >
                                        <option value=""> Select Duration </option>
                                        <option value="MONTHLY"> MONTHLY </option>
                                        <option value="QUARTERLY"> QUARTERLY </option>
                                        <option value="HALF_YEARLY"> HALF YEARLY </option>
                                        <option value="YEARLY"> YEARLY </option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="14px" fontWeight="600" color="gray.700" > Start Date </FormLabel>
                                    <Input type="date" name="start_date" value={empTargetInfo?.start_date} onChange={handleChange} bg="gray.50"  fontSize="14px" color="gray.600"/>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="14px" fontWeight="600" color="gray.700" >
                                        Target Amount
                                    </FormLabel>
                                    <Input
                                        type="number"
                                        name="target_amount"
                                        value={empTargetInfo?.target_amount}
                                        onChange={handleChange}
                                        placeholder="Enter target amount"
                                        bg="gray.50"  fontSize="14px" color="gray.600"/>

                                </FormControl>

                            </VStack>
                        )}

                    </ModalBody>

                    <ModalFooter gap={3}>

                        <Button variant="ghost" onClick={handleClose} >
                            Cancel
                        </Button>

                        <Button  onClick={handleEditEmpTargets} isLoading={btnLoading} loadingText="Updating"  
                        bg="#237086" color="white"
                        _hover={{ bg: "#1B5A6B" }} fontWeight="500"
                        borderRadius="12px"
                        minW="160px" fontSize="14px">
                            Update Target
                        </Button>

                    </ModalFooter>

                </ModalContent>

            </Modal>
        </>
    );
};

export default EditEmpIndividualTargetModal;