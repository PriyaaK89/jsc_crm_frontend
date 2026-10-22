import React, { useState, useEffect, useCallback } from "react";
import {
    Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerCloseButton, DrawerBody, DrawerFooter,
    Box, Input, Checkbox, Switch, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge,
    Spinner, Center, Flex, HStack, useToast,
    useDisclosure,
    Tabs,
    TabList,
    Tab,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { sectionStyle, sectionHeaderStyle, inputStyle, thStyle, tdStyle, errMsg } from "./cropStyles";
import { AddIcon } from "@chakra-ui/icons";
import AddFieldModal from "./AddFieldModal";

const CropFieldsDrawer = ({ crop, isOpen, onClose }) => {
    const toast = useToast();
    const [mapped, setMapped] = useState([]);
    const [available, setAvailable] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stage, setStage] = useState(2);

    const addModal = useDisclosure();

    const handleFieldCreated = async (newId) => {
        await load();
        if (newId) setSelected([newId]); // pre-tick the new field so admin can add it to this crop
    };

    const load = useCallback(async () => {
        if (!crop) return;
        setLoading(true);
        try {

            const [formRes, unmappedRes] = await Promise.all([
                API.get(`${API_ENDPOINTS.get_crop_growth_form}/${crop.id}?include_inactive=1&stage=${stage}`),
                API.get(`${API_ENDPOINTS.get_unmapped_fields_for_crop}/${crop.id}?stage=${stage}`),
            ]);
            const fields = formRes?.data?.data?.fields || [];
            setMapped(
                fields.map((f) => ({
                    ...f,
                    unit_override: f.unit_override ?? "",
                    mapping_help_text: f.mapping_help_text ?? "",
                }))
            );
            setAvailable(unmappedRes?.data?.data || []);
            setSelected([]);
        } catch (e) {
            toast({ title: errMsg(e, "Failed to load crop fields"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    }, [crop, stage, toast]);

    useEffect(() => { if (isOpen) load(); }, [isOpen, load]);

    const updateRow = (mappingId, patch) =>
        setMapped((prev) => prev.map((m) => (m.mapping_id === mappingId ? { ...m, ...patch } : m)));

    const toggleSelect = (id) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const allSelected = available.length > 0 && selected.length === available.length;
    const toggleAll = () => setSelected(allSelected ? [] : available.map((f) => f.id));

    const addSelected = async () => {
        if (!selected.length) return;
        setAdding(true);
        try {
            const maxOrder = Math.max(0, ...mapped.map((m) => Number(m.display_order) || 0));
            await Promise.all(
                selected.map((fieldId, idx) =>
                    API.post(API_ENDPOINTS.map_field_to_crop(crop.id), {
                        field_id: fieldId,
                        result_stage: stage,
                        display_order: maxOrder + idx + 1,
                        is_required: false,
                        is_active: true,
                    })
                )
            );
            toast({ title: `${selected.length} field(s) added`, status: "success", duration: 2500, isClosable: true });
            await load();
        } catch (e) {
            toast({ title: errMsg(e, "Failed to add fields"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setAdding(false);
        }
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            await Promise.all(
                mapped.map((m) =>
                    API.post(API_ENDPOINTS.map_field_to_crop(crop.id), {
                        field_id: m.field_id,
                        result_stage: stage,
                        display_order: Number(m.display_order) || 0,
                        is_required: !!m.is_required,
                        is_active: !!m.is_active,
                        unit_override: m.input_type === "NUMBER" ? (m.unit_override || "").trim() : "",
                        help_text: (m.mapping_help_text || "").trim(),
                    })
                )
            );
            toast({ title: "Changes saved", status: "success", duration: 2500, isClosable: true });
            await load();
        } catch (e) {
            toast({ title: errMsg(e, "Failed to save changes"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setSaving(false);
        }
    };

    const activeCount = mapped.filter((m) => m.is_active).length;

    return (
        <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="xl">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader fontSize="md" borderBottom="1px solid #e2e8f0">
                    Configure Result Fields – {crop?.crop_name}
                </DrawerHeader>

                <DrawerBody bg="#f7f9f9">
                    <Tabs index={stage === 2 ? 0 : 1} onChange={(i) => setStage(i === 0 ? 2 : 3)} colorScheme="teal" size="sm" pt={2}>
                        <TabList>
                            <Tab fontSize="13px">Result 2 – Crop Growth</Tab>
                            <Tab fontSize="13px">Result 3 – Final Evaluation</Tab>
                        </TabList>
                    </Tabs>
                    {stage === 3 && (
                        <Text fontSize="11px" color="gray.500" mt={2}>
                            If no fields are enabled for Result 3, the app shows the Result 2 fields instead.
                        </Text>
                    )}
                    {loading ? (
                        <Center py={20}><Spinner size="lg" color="#4f9190" /></Center>
                    ) : (
                        <>
                            {/* Section A: fields selected for this crop */}
                            <Box {...sectionStyle} mt={3}>
                                <Box {...sectionHeaderStyle}>
                                    <Text fontWeight="500" fontSize="sm">
                                        Fields for this crop ({activeCount} enabled of {mapped.length})
                                    </Text>
                                </Box>
                                <Box overflowX="auto">
                                    <Table size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th {...thStyle} w="70px">Order</Th>
                                                <Th {...thStyle} minW="170px">Field</Th>
                                                <Th {...thStyle} minW="90px">Unit</Th>
                                                <Th {...thStyle}>Required</Th>
                                                <Th {...thStyle} minW="160px">Help Text</Th>
                                                <Th {...thStyle}>Enabled</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {mapped.length === 0 && (
                                                <Tr>
                                                    <Td colSpan={6} textAlign="center" py={5} fontSize="12px" color="gray.500">
                                                        No fields selected yet. Pick from the list below.
                                                    </Td>
                                                </Tr>
                                            )}
                                            {mapped.map((m) => (
                                                <Tr key={m.mapping_id} opacity={m.is_active ? 1 : 0.5}>
                                                    <Td {...tdStyle}>
                                                        <Input {...inputStyle} type="number" min={0} value={m.display_order}
                                                            onChange={(e) => updateRow(m.mapping_id, { display_order: e.target.value })} />
                                                    </Td>
                                                    <Td {...tdStyle}>
                                                        <Text fontSize="12px" fontWeight="600">{m.field_name}</Text>
                                                        <HStack spacing={1}>
                                                            <Text fontSize="10px" color="gray.500">{m.field_code}</Text>
                                                            <Badge fontSize="9px" colorScheme="teal">{m.input_type}</Badge>
                                                        </HStack>
                                                        {m.input_type === "DROPDOWN" && m.options?.length > 0 && (
                                                            <Text fontSize="10px" color="gray.500" noOfLines={1}>
                                                                {m.options.map((o) => o.option_label).join(", ")}
                                                            </Text>
                                                        )}
                                                    </Td>
                                                    <Td {...tdStyle}>
                                                        {m.input_type === "NUMBER" ? (
                                                            <Input {...inputStyle} value={m.unit_override}
                                                                placeholder={m.default_unit || "unit"}
                                                                onChange={(e) => updateRow(m.mapping_id, { unit_override: e.target.value })} />
                                                        ) : (
                                                            <Text fontSize="12px" color="gray.400" textAlign="center">-</Text>
                                                        )}
                                                    </Td>
                                                    <Td {...tdStyle} textAlign="center">
                                                        <Checkbox colorScheme="teal" isChecked={m.is_required}
                                                            onChange={(e) => updateRow(m.mapping_id, { is_required: e.target.checked })} />
                                                    </Td>
                                                    <Td {...tdStyle}>
                                                        <Input {...inputStyle} value={m.mapping_help_text}
                                                            onChange={(e) => updateRow(m.mapping_id, { mapping_help_text: e.target.value })} />
                                                    </Td>
                                                    <Td {...tdStyle} textAlign="center">
                                                        <Switch size="sm" colorScheme="teal" isChecked={m.is_active}
                                                            onChange={(e) => updateRow(m.mapping_id, { is_active: e.target.checked })} />
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                                {mapped.length > 0 && (
                                    <Flex justify="space-between" align="center" p={3}>
                                        <Text fontSize="11px" color="gray.500">
                                            Only enabled fields are shown to employees in the app.
                                        </Text>
                                        <Button size="sm" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }}
                                            isLoading={saving} onClick={saveChanges}>
                                            Save Changes
                                        </Button>
                                    </Flex>
                                )}
                            </Box>

                            {/* Section B: master library fields not yet used by this crop */}
                            <Box {...sectionStyle}>
                                <Box {...sectionHeaderStyle}>
                                    <Flex justify="space-between" align="center">
                                        <Text fontWeight="500" fontSize="sm">Available fields ({available.length})</Text>
                                        <Button size="xs" leftIcon={<AddIcon />} variant="outline" colorScheme="white"
                                            fontSize="11px" onClick={addModal.onOpen}>
                                            Add New Field
                                        </Button>
                                    </Flex>
                                </Box>
                                {available.length === 0 ? (
                                    <Text p={4} fontSize="12px" color="gray.500">
                                        All fields from the library are already added to this crop.
                                    </Text>
                                ) : (
                                    <>
                                        <Box p={3} borderBottom="1px solid #e0e8e2">
                                            <Checkbox colorScheme="teal" isChecked={allSelected}
                                                isIndeterminate={selected.length > 0 && !allSelected} onChange={toggleAll}>
                                                <Text fontSize="12px" fontWeight="600">Select all</Text>
                                            </Checkbox>
                                        </Box>
                                        {available.map((f) => (
                                            <Flex key={f.id} px={3} py={2} align="center" justify="space-between"
                                                borderBottom="1px solid #eef2ef" _hover={{ bg: "#f4f9f8" }}>
                                                <Checkbox colorScheme="teal" isChecked={selected.includes(f.id)}
                                                    onChange={() => toggleSelect(f.id)}>
                                                    <Text fontSize="12px" fontWeight="600">{f.field_name}</Text>
                                                    <Text fontSize="10px" color="gray.500">
                                                        {f.field_code}{f.default_unit ? ` · ${f.default_unit}` : ""}
                                                    </Text>
                                                </Checkbox>
                                                <Badge fontSize="10px" colorScheme="teal">{f.input_type}</Badge>
                                            </Flex>
                                        ))}
                                        <Flex justify="flex-end" p={3}>
                                            <Button size="sm" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }}
                                                isDisabled={!selected.length} isLoading={adding} onClick={addSelected}>
                                                Add Selected ({selected.length})
                                            </Button>
                                        </Flex>
                                    </>
                                )}
                            </Box>
                        </>
                    )}
                </DrawerBody>

                <DrawerFooter borderTop="1px solid #e2e8f0">
                    <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
                </DrawerFooter>
                <AddFieldModal isOpen={addModal.isOpen} onClose={addModal.onClose} onCreated={handleFieldCreated} />
            </DrawerContent>
        </Drawer>
    );
};

export default CropFieldsDrawer;