import React, { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Grid, GridItem, Box, Input, Select, Textarea, Text, Button, Tag, TagLabel, TagCloseButton,
  Wrap, WrapItem, useToast,
} from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { inputStyle, labelStyle, errMsg } from "./cropStyles";

const INPUT_TYPES = ["NUMBER", "TEXT", "DROPDOWN", "DATE", "BOOLEAN"];

const emptyForm = {
  field_name: "", field_code: "", input_type: "NUMBER", default_unit: "",
  min_value: "", max_value: "", decimal_places: "", description: "", help_text: "",
};

const slug = (s) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

const AddFieldModal = ({ isOpen, onClose, onCreated }) => {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [codeTouched, setCodeTouched] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionText, setOptionText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setCodeTouched(false);
      setOptions([]);
      setOptionText("");
    }
  }, [isOpen]);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onNameChange = (v) => {
    setForm((p) => ({ ...p, field_name: v, field_code: codeTouched ? p.field_code : slug(v) }));
  };

  const addOption = () => {
    const label = optionText.trim();
    if (!label) return;
    if (options.some((o) => slug(o) === slug(label))) {
      return toast({ title: "Option already added", status: "warning", duration: 2000, isClosable: true });
    }
    setOptions((p) => [...p, label]);
    setOptionText("");
  };

  const handleSave = async () => {
    const name = form.field_name.trim();
    const code = slug(form.field_code);
    if (!name) return toast({ title: "Field name is required", status: "warning", duration: 3000, isClosable: true });
    if (!code) return toast({ title: "Field code is required", status: "warning", duration: 3000, isClosable: true });

    const isNumber = form.input_type === "NUMBER";
    const isDropdown = form.input_type === "DROPDOWN";
    const min = isNumber ? toNum(form.min_value) : null;
    const max = isNumber ? toNum(form.max_value) : null;

    if (min !== null && max !== null && min > max) {
      return toast({ title: "Min value cannot exceed max value", status: "warning", duration: 3000, isClosable: true });
    }
    if (isDropdown && options.length === 0) {
      return toast({ title: "Add at least one option for a dropdown field", status: "warning", duration: 3000, isClosable: true });
    }

    setSaving(true);
    let newId = null;
    try {
      const res = await API.post(API_ENDPOINTS.create_growth_field, {
        field_code: code,
        field_name: name,
        description: form.description.trim() || null,
        input_type: form.input_type,
        default_unit: isNumber ? (form.default_unit.trim() || null) : null,
        min_value: min,
        max_value: max,
        decimal_places: isNumber ? toNum(form.decimal_places) : null,
        help_text: form.help_text.trim() || null,
      });
      newId = res?.data?.data?.id;

      if (isDropdown && newId) {
        for (let i = 0; i < options.length; i += 1) {
          // sequential so display_order is preserved
          // eslint-disable-next-line no-await-in-loop
          await API.post(API_ENDPOINTS.field_options(newId), {
            option_label: options[i],
            option_value: slug(options[i]),
            display_order: i + 1,
          });
        }
      }

      toast({ title: "Field added to library", status: "success", duration: 2500, isClosable: true });
      onCreated?.(newId);
      onClose();
    } catch (e) {
      if (newId) {
        // field was created but some options failed
        toast({
          title: "Field created, but adding options failed",
          description: errMsg(e, ""),
          status: "warning", duration: 5000, isClosable: true,
        });
        onCreated?.(newId);
        onClose();
      } else {
        toast({ title: errMsg(e, "Failed to create field"), status: "error", duration: 3000, isClosable: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const isNumber = form.input_type === "NUMBER";
  const isDropdown = form.input_type === "DROPDOWN";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">Add New Field to Library</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)" }} gap={3}>
            <GridItem>
              <Text {...labelStyle}>Field Name <Text as="span" color="red.500">*</Text></Text>
              <Input {...inputStyle} maxLength={100} value={form.field_name}
                placeholder="e.g. Grain Weight" onChange={(e) => onNameChange(e.target.value)} />
            </GridItem>
            <GridItem>
              <Text {...labelStyle}>Field Code <Text as="span" color="red.500">*</Text></Text>
              <Input {...inputStyle} maxLength={50} value={form.field_code}
                onChange={(e) => { setCodeTouched(true); setF("field_code", e.target.value); }} />
            </GridItem>
            <GridItem>
              <Text {...labelStyle}>Input Type</Text>
              <Select {...inputStyle} value={form.input_type} onChange={(e) => setF("input_type", e.target.value)}>
                {INPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </GridItem>
            {isNumber && (
              <>
                <GridItem>
                  <Text {...labelStyle}>Default Unit</Text>
                  <Input {...inputStyle} maxLength={20} value={form.default_unit}
                    placeholder="cm, kg, nos" onChange={(e) => setF("default_unit", e.target.value)} />
                </GridItem>
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
                  <Input {...inputStyle} type="number" min={0} value={form.decimal_places}
                    onChange={(e) => setF("decimal_places", e.target.value)} />
                </GridItem>
              </>
            )}

            {isDropdown && (
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Text {...labelStyle}>Dropdown Options <Text as="span" color="red.500">*</Text></Text>
                <Grid templateColumns="1fr auto" gap={2}>
                  <Input {...inputStyle} value={optionText} placeholder="Type an option and press Add"
                    onChange={(e) => setOptionText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }} />
                  <Button size="sm" h="40px" variant="outline" colorScheme="teal" onClick={addOption}>Add</Button>
                </Grid>
                <Wrap mt={2}>
                  {options.map((o) => (
                    <WrapItem key={o}>
                      <Tag size="sm" colorScheme="teal">
                        <TagLabel>{o}</TagLabel>
                        <TagCloseButton onClick={() => setOptions((p) => p.filter((x) => x !== o))} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </GridItem>
            )}

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Text {...labelStyle}>Description</Text>
              <Textarea rows={2} fontSize="12px" borderColor="#c8d0d8" maxLength={255} value={form.description}
                onChange={(e) => setF("description", e.target.value)} />
            </GridItem>
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Text {...labelStyle}>Help Text (shown to employee)</Text>
              <Input {...inputStyle} maxLength={255} value={form.help_text} onChange={(e) => setF("help_text", e.target.value)} />
            </GridItem>
          </Grid>
          <Box mt={3}>
            <Text fontSize="11px" color="gray.500">
              The field is added to the shared library. You can then add it to this crop and to any other crop.
              Code and input type cannot be changed later.
            </Text>
          </Box>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" bg="#237086" color="white" _hover={{ bg: "#1B5A6B" }} isLoading={saving} onClick={handleSave}>
            Create Field
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddFieldModal;