import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Select, Button, useToast, Spinner, } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import useUsersapi from "../../Apis/GetUsersapi";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const SectionHeader = ({ title }) => (
    <Flex align="center" gap={2} bg="#6a9493" px={4} borderRadius="8px 8px 0px 0px" py={2} borderBottom="1px solid #ccc" >
        <SettingsIcon color="white" boxSize={4} />
        <Text fontWeight="500" fontSize="sm" color="white">
            {title}
        </Text>
    </Flex>
);

const FormRow = ({ label, children }) => (
    <Flex align="center" px={6} py={3} gap={4}  ml={20}>
        <Text fontSize="12px" color="gray.700" minW="200px" textAlign="right" >
            {label}
        </Text>
        {children}
    </Flex>
);

const TransactionApproval = () => {
    const { users } = useUsersapi();
    const toast = useToast();

    // Search section
    const [searchEmployeeId, setSearchEmployeeId] = useState("");
    const [searching, setSearching] = useState(false);

    // Form section (shown after search)
    const [existingConfig, setExistingConfig] = useState(null); // null = not searched yet
    const [configId, setConfigId] = useState(null); // existing record ID for update

    const [formData, setFormData] = useState({
        employee_id: "",
        junior_accountant_id: "",
        dispatcher_id: "",
        senior_accountant_id: "",
    });

    const [submitting, setSubmitting] = useState(false);

    // When searchEmployeeId changes, sync employee_id in form
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            employee_id: searchEmployeeId,
        }));
    }, [searchEmployeeId]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ── SEARCH ─────────────────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!searchEmployeeId) {
            toast({
                title: "Select an employee first",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        setSearching(true);
        setExistingConfig(null);
        setConfigId(null);

        try {
            const response = await API.get(
                `${API_ENDPOINTS.GET_TRANSACTION_APPROVAL_BY_ID}/${searchEmployeeId}`
            );

            if (response.data?.success && response.data?.data) {
                const config = response.data.data;
                setExistingConfig(config);
                setConfigId(config.id);
                setFormData({
                    employee_id: searchEmployeeId,
                    junior_accountant_id: String(config.junior_accountant_id || ""),
                    dispatcher_id: String(config.dispatcher_id || ""),
                    senior_accountant_id: String(config.senior_accountant_id || ""),
                });
                toast({
                    title: "Configuration found",
                    description: "Existing approval config loaded. You can update it.",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });
            } else {
                // No existing config — ready for create
                setExistingConfig(false);
                setFormData({
                    employee_id: searchEmployeeId,
                    junior_accountant_id: "",
                    dispatcher_id: "",
                    senior_accountant_id: "",
                });
            }
        } catch (error) {
            // 404 or not found means no existing config
            if (error?.response?.status === 404 || !error?.response?.data?.data) {
                setExistingConfig(false);
                setFormData({
                    employee_id: searchEmployeeId,
                    junior_accountant_id: "",
                    dispatcher_id: "",
                    senior_accountant_id: "",
                });
            } else {
                toast({
                    title: "Search failed",
                    description: error?.response?.data?.message || error.message,
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        } finally {
            setSearching(false);
        }
    };

    // ── SUBMIT (Create or Update) ───────────────────────────────────────────────
    const handleSubmit = async () => {
        const { employee_id, junior_accountant_id, dispatcher_id, senior_accountant_id } =
            formData;

        if (!employee_id || !junior_accountant_id || !dispatcher_id || !senior_accountant_id) {
            toast({
                title: "All fields are required",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        setSubmitting(true);

        try {
            let response;

            if (existingConfig && configId) {
                // ── UPDATE ──
                response = await API.put(
                    `${API_ENDPOINTS.UPDATE_TRANSACTION_APPROVAL}/${configId}`,
                    {
                        junior_accountant_id,
                        dispatcher_id,
                        senior_accountant_id,
                    }
                );
            } else {
                // ── CREATE ──
                response = await API.post(
                    `${API_ENDPOINTS.CREATE_TRANSACTION_APPROVAL}`,
                    {
                        employee_id,
                        junior_accountant_id,
                        dispatcher_id,
                        senior_accountant_id,
                    }
                );
            }

            if (response.data?.success) {
                toast({
                    title: existingConfig
                        ? "Configuration updated successfully"
                        : "Configuration created successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                });

                // After create, mark as existing so next submit is update
                if (!existingConfig && response.data?.id) {
                    setConfigId(response.data.id);
                    setExistingConfig(true);
                }
            } else {
                throw new Error(response.data?.message || "Operation failed");
            }
        } catch (error) {
            toast({
                title: existingConfig ? "Update failed" : "Create failed",
                description: error?.response?.data?.message || error.message,
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "bottom",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ── RESET ──────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSearchEmployeeId("");
        setExistingConfig(null);
        setConfigId(null);
        setFormData({
            employee_id: "",
            junior_accountant_id: "",
            dispatcher_id: "",
            senior_accountant_id: "",
        });
    };

    // ── RENDER ─────────────────────────────────────────────────────────────────
    return (
        <Box >
            {/* Page Title */}


            {/* ── Search Card ─────────────────────────────────────────── */}
            <Box bg="white" border="1px solid #ccc" borderRadius="10px" mb={4} mt={6}>
                <SectionHeader title="Transaction Approval" />

                <FormRow label="Employee Name:">
                    <Select
                        placeholder="-- Select Employee --"
                        value={searchEmployeeId}
                        onChange={(e) => {
                            setSearchEmployeeId(e.target.value);
                            // Reset result when employee changes
                            setExistingConfig(null);
                            setConfigId(null);
                        }}
                        maxW="340px"
                       
                    >
                        {users?.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </Select>
                </FormRow>

                <Flex  borderRadius="0px 0px 8px 8px"
                        justify="flex-end"
                        gap={2}
                        px={4}
                        py={1}
                        borderTop="1px solid #ddd"
                        bg="#eef3f5">
                    <Button 
                        onClick={handleSearch}
                        isLoading={searching}
                        loadingText="Searching..."
                         size="sm"
                            color="white"
                            bg="green.700" fontWeight="500"
                            _hover={{ bg: "#598f60" }}
                       
                    >
                        Search
                    </Button>
                </Flex>
            </Box>

            {/* ── Approval Config Card (shown after search) ───────────── */}
            {existingConfig !== null && (
                <Box bg="white" border="1px solid #ccc" borderRadius="10px">
                    <SectionHeader
                        title={`Employee Transaction Approval${existingConfig ? " (Edit)" : " (New)"}`}
                    />

                    <FormRow label="Junior Accountant Approval:">
                        <Select
                            placeholder="-- Select --"
                            value={formData.junior_accountant_id}
                            onChange={(e) =>
                                handleChange("junior_accountant_id", e.target.value)
                            }
                              maxW="340px"
                           
                        >
                            {users?.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </Select>
                    </FormRow>

                    <FormRow label="Dispatcher Approval:">
                        <Select
                            placeholder="-- Select --"
                            value={formData.dispatcher_id}
                            onChange={(e) =>
                                handleChange("dispatcher_id", e.target.value)
                            }
                            maxW="340px"
                           
                        >
                            {users?.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </Select>
                    </FormRow>

                    <FormRow label="Senior Accountant Approval:">
                        <Select
                            placeholder="-- Select --"
                            value={formData.senior_accountant_id}
                            onChange={(e) =>
                                handleChange("senior_accountant_id", e.target.value)
                            }
                            maxW="340px"
                          
                        >
                            {users?.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </Select>
                    </FormRow>

                    <Flex
                    borderRadius="0px 0px 8px 8px"
                        justify="flex-end"
                        gap={2}
                        px={4}
                        py={3}
                        borderTop="1px solid #ddd"
                        bg="#eef3f5"
                    >
                        <Button
                            size="sm"
                           color="white"
                           bg="yellow.600" fontWeight="500"
                           
                            _hover={{ bg: "#dbbd38" }}
                            onClick={handleReset}
                        >
                            RESET
                        </Button>
                        <Button
                            size="sm"
                            color="white"
                            bg="green.700" fontWeight="500"
                            _hover={{ bg: "#598f60" }}
                            onClick={handleSubmit}
                            isLoading={submitting}
                            loadingText={existingConfig ? "Updating..." : "Saving..."}
                            px={6}
                        >
                            {existingConfig ? "UPDATE" : "APPROVE"}
                        </Button>
                    </Flex>
                </Box>
            )}
        </Box>
    );
};

export default TransactionApproval;