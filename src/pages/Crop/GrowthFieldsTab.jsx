import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Grid, GridItem, Input, Select, Textarea, Text, Button, Table, Thead, Tbody, Tr, Th, Td,
  Switch, Badge, Spinner, Center, Flex, HStack, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { sectionStyle, sectionHeaderStyle, labelStyle, inputStyle, thStyle, tdStyle, errMsg } from "./cropStyles";

const INPUT_TYPES = ["NUMBER", "TEXT", "DROPDOWN", "DATE", "BOOLEAN"];

const emptyForm = {
  field_code: "", field_name: "", description: "", input_type: "NUMBER",
  default_unit: "", min_value: "", max_value: "", decimal_places: "", help_text: "",
};

const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

const GrowthFieldsTab = () => {
  const toast = useToast();
  const formModal = useDisclosure();
  const optModal = useDisclosure();

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // options modal
  const [optField, setOptField] = useState(null);
  const [options, setOptions] = useState([]);
  const [newOpt, setNewOpt] = useState({ option_label: "", option_value: "", display_order: "" });
  const [optBusy, setOptBusy] = useState(false);

  const loadFields = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`${API_ENDPOINTS.growth_fields_list}?include_inactive=1`);
      setFields(res?.data?.data || []);
    } catch (e) {
      toast({ title: errMsg(e, "Failed to load fields"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadFields(); }, [loadFields]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    formModal.onOpen();
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      field_code: f.field_code || "",
      field_name: f.field_name || "",
      description: f.description || "",
      input_type: f.input_type || "NUMBER",
      default_unit: f.default_unit || "",
      min_value: f.min_value ?? "",
      max_value: f.max_value ?? "",
      decimal_places: f.decimal_places ?? "",
      help_text: f.help_text || "",
    });
    formModal.onOpen();
  };

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const code = form.field_code.trim().toUpperCase().replace(/\s+/g, "_");
    if (!editing && !code) return toast({ title: "Field code is required", status: "warning", duration: 3000, isClosable: true });
    if (!form.field_name.trim()) return toast({ title: "Field name is required", status: "warning", duration: 3000, isClosable: true });

    const isNumber = form.input_type === "NUMBER";
    const min = isNumber ? toNum(form.min_value) : null;
    const max = isNumber ? toNum(form.max_value) : null;
    if (min !== null && max !== null && min > max) {
      return toast({ title: "Min value cannot exceed max value", status: "warning", duration: 3000, isClosable: true });
    }

    const payload = {
      field_name: form.field_name.trim(),
      description: form.description.trim() || null,
      default_unit: isNumber ? (form.default_unit.trim() || null) : null,
      min_value: min,
      max_value: max,
      decimal_places: isNumber ? toNum(form.decimal_places) : null,
      help_text: form.help_text.trim() || null,
    };
    if (!editing) {
      payload.field_code = code;
      payload.input_type = form.input_type;
    }

    setSaving(true);
    try {
      if (editing) {
        await API.put(`${API_ENDPOINTS.update_growth_field}/${editing.id}`, payload);
        toast({ title: "Field updated", status: "success", duration: 2500, isClosable: true });
      } else {
        await API.post(API_ENDPOINTS.create_growth_field, payload);
        toast({ title: "Field created", status: "success", duration: 2500, isClosable: true });
      }
      formModal.onClose();
      loadFields();
    } catch (e) {
      toast({ title: errMsg(e, "Failed to save field"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (f) => {
    try {
      await API.patch(API_ENDPOINTS.set_growth_field_active(f.id), { is_active: !f.is_active });
      loadFields();
    } catch (e) {
      toast({ title: errMsg(e, "Failed to update status"), status: "error", duration: 3000, isClosable: true });
    }
  };

  // ---------- dropdown options ----------
  const loadOptions = async (fieldId) => {
    try {
      const res = await API.get(API_ENDPOINTS.field_options(fieldId));
      setOptions(res?.data?.data || []);
    } catch (e) {
      toast({ title: errMsg(e, "Failed to load options"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const openOptions = (f) => {
    setOptField(f);
    setOptions([]);
    setNewOpt({ option_label: "", option_value: "", display_order: "" });
    optModal.onOpen();
    loadOptions(f.id);
  };

  const addOption = async () => {
    if (!newOpt.option_label.trim() || !newOpt.option_value.trim()) {
      return toast({ title: "Label and value are required", status: "warning", duration: 3000, isClosable: true });
    }
    setOptBusy(true);
    try {
      await API.post(API_ENDPOINTS.field_options(optField.id), {
        option_label: newOpt.option_label.trim(),
        option_value: newOpt.option_value.trim(),
        display_order: Number(newOpt.display_order) || options.length + 1,
      });
      setNewOpt({ option_label: "", option_value: "", display_order: "" });
      loadOptions(optField.id);
    } catch (e) {
      toast({ title: errMsg(e, "Failed to add option"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setOptBusy(false);
    }
  };

  const toggleOption = async (o) => {
    try {
      await API.patch(API_ENDPOINTS.set_field_option_active(o.id), { is_active: !o.is_active });
      loadOptions(optField.id);
    } catch (e) {
      toast({ title: errMsg(e, "Failed to update option"), status: "error", duration: 3000, isClosable: true });
    }
  };

  const isNumber = form.input_type === "NUMBER";

  return (
    <>
      <Box {...sectionStyle}>
        <Box {...sectionHeaderStyle}>
          <HStack justifyContent="space-between">
            <Text fontWeight="500" fontSize="sm">Growth Field Catalog</Text>
            <Button size="xs" leftIcon={<AddIcon />} variant="outline" colorScheme="white" fontSize="11px" onClick={openCreate}>
              Add Field
            </Button>
          </HStack>
        </Box>

        {loading ? (
          <Center py={10}><Spinner color="#4f9190" /></Center>
        ) : (
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th {...thStyle}>#</Th>
                  <Th {...thStyle}>Field Name</Th>
                  <Th {...thStyle}>Code</Th>
                  <Th {...thStyle}>Type</Th>
                  <Th {...thStyle}>Unit</Th>
                  <Th {...thStyle}>Range</Th>
                  <Th {...thStyle}>Active</Th>
                  <Th {...thStyle}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {fields.length === 0 && (
                  <Tr><Td colSpan={8} textAlign="center" py={6} fontSize="12px" color="gray.500">No fields yet. Click "Add Field".</Td></Tr>
                )}
                {fields.map((f, i) => (
                  <Tr key={f.id} bg={i % 2 === 0 ? "white" : "#f7faf8"}>
                    <Td {...tdStyle} fontSize="12px">{i + 1}</Td>
                    <Td {...tdStyle} fontSize="12px" fontWeight="600">{f.field_name}</Td>
                    <Td {...tdStyle} fontSize="12px">{f.field_code}</Td>
                    <Td {...tdStyle}><Badge colorScheme="teal" fontSize="10px">{f.input_type}</Badge></Td>
                    <Td {...tdStyle} fontSize="12px">{f.default_unit || "-"}</Td>
                    <Td {...tdStyle} fontSize="12px">
                      {f.min_value !== null || f.max_value !== null ? `${f.min_value ?? "…"} – ${f.max_value ?? "…"}` : "-"}
                    </Td>
                    <Td {...tdStyle}>
                      <Switch size="sm" colorScheme="teal" isChecked={!!f.is_active} onChange={() => toggleActive(f)} />
                    </Td>
                    <Td {...tdStyle}>
                      <HStack spacing={1}>
                        <Button size="xs" variant="outline" colorScheme="teal" onClick={() => openEdit(f)}>Edit</Button>
                        {f.input_type === "DROPDOWN" && (
                          <Button size="xs" variant="outline" colorScheme="purple" onClick={() => openOptions(f)}>Options</Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Create / Edit modal */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">{editing ? "Edit Growth Field" : "Add Growth Field"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={3}>
              <GridItem>
                <Text {...labelStyle}>Field Code <Text as="span" color="red.500">*</Text></Text>
                <Input {...inputStyle} value={form.field_code} isDisabled={!!editing}
                  placeholder="e.g. PLANT_HEIGHT" onChange={(e) => setF("field_code", e.target.value)} />
              </GridItem>
              <GridItem>
                <Text {...labelStyle}>Field Name <Text as="span" color="red.500">*</Text></Text>
                <Input {...inputStyle} value={form.field_name} placeholder="e.g. Plant Height"
                  onChange={(e) => setF("field_name", e.target.value)} />
              </GridItem>
              <GridItem>
                <Text {...labelStyle}>Input Type</Text>
                <Select {...inputStyle} value={form.input_type} isDisabled={!!editing}
                  onChange={(e) => setF("input_type", e.target.value)}>
                  {INPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </GridItem>
              {isNumber && (
                <GridItem>
                  <Text {...labelStyle}>Default Unit</Text>
                  <Input {...inputStyle} value={form.default_unit} placeholder="cm, kg, %"
                    onChange={(e) => setF("default_unit", e.target.value)} />
                </GridItem>
              )}
              {isNumber && (
                <>
                  <GridItem>
                    <Text {...labelStyle}>Min Value</Text>
                    <Input {...inputStyle} type="number" value={form.min_value} onChange={(e) => setF("min_value", e.target.value)} />
                  </GridItem>
                  <GridItem>
                    <Text {...labelStyle}>Max Value</Text>
                    <Input {...inputStyle} type="number" value={form.max_value} onChange={(e) => setF("max_value", e.target.value)} />
                  </GridItem>
                  <GridItem>
                    <Text {...labelStyle}>Decimal Places</Text>
                    <Input {...inputStyle} type="number" min={0} value={form.decimal_places} onChange={(e) => setF("decimal_places", e.target.value)} />
                  </GridItem>
                </>
              )}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Text {...labelStyle}>Description</Text>
                <Textarea rows={2} fontSize="12px" borderColor="#c8d0d8" value={form.description}
                  onChange={(e) => setF("description", e.target.value)} />
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Text {...labelStyle}>Help Text (shown to employee)</Text>
                <Input {...inputStyle} value={form.help_text} onChange={(e) => setF("help_text", e.target.value)} />
              </GridItem>
            </Grid>
            {editing && (
              <Text fontSize="11px" color="gray.500" mt={3}>
                Field code and input type are locked after creation so existing results are not affected.
              </Text>
            )}
          </ModalBody>
          <ModalFooter gap={2}>
            <Button size="sm" variant="ghost" onClick={formModal.onClose}>Cancel</Button>
            <Button size="sm" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} isLoading={saving} onClick={handleSave}>
              {editing ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dropdown options modal */}
      <Modal isOpen={optModal.isOpen} onClose={optModal.onClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Options – {optField?.field_name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="1fr 1fr 80px auto" gap={2} alignItems="end" mb={4}>
              <Box>
                <Text {...labelStyle}>Label</Text>
                <Input {...inputStyle} value={newOpt.option_label} onChange={(e) => setNewOpt((p) => ({ ...p, option_label: e.target.value }))} />
              </Box>
              <Box>
                <Text {...labelStyle}>Value</Text>
                <Input {...inputStyle} value={newOpt.option_value} onChange={(e) => setNewOpt((p) => ({ ...p, option_value: e.target.value }))} />
              </Box>
              <Box>
                <Text {...labelStyle}>Order</Text>
                <Input {...inputStyle} type="number" value={newOpt.display_order} onChange={(e) => setNewOpt((p) => ({ ...p, display_order: e.target.value }))} />
              </Box>
              <Button size="sm" h="40px" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} isLoading={optBusy} onClick={addOption}>Add</Button>
            </Grid>

            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th {...thStyle}>Order</Th>
                  <Th {...thStyle}>Label</Th>
                  <Th {...thStyle}>Value</Th>
                  <Th {...thStyle}>Active</Th>
                </Tr>
              </Thead>
              <Tbody>
                {options.length === 0 && (
                  <Tr><Td colSpan={4} textAlign="center" py={4} fontSize="12px" color="gray.500">No options yet</Td></Tr>
                )}
                {options.map((o) => (
                  <Tr key={o.id}>
                    <Td {...tdStyle} fontSize="12px">{o.display_order}</Td>
                    <Td {...tdStyle} fontSize="12px">{o.option_label}</Td>
                    <Td {...tdStyle} fontSize="12px">{o.option_value}</Td>
                    <Td {...tdStyle}>
                      <Switch size="sm" colorScheme="teal" isChecked={!!o.is_active} onChange={() => toggleOption(o)} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" onClick={optModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GrowthFieldsTab;