// Create / edit the plan header (POST /business-plan/plans, PUT /business-plan/plans/:id)
// The plan's sales and collection targets are not typed here: they are calculated from the
// distributor lines (season target = seasonal target, or annual target x plan months / 12).
// ABS booking / advance targets appear only when the Advance Booking module is installed.
import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { bpApi, apiError } from "../../services/businessPlanApi";
import { Loading, useBpToast, useMasters } from "./bpShared";

const EMPTY = {
  name: "",
  financial_year: "",
  season: "",
  start_date: "",
  end_date: "",
  state_id: "",
  territory_id: "",
  assigned_user_id: "",
  plan_type: "",
  abs_booking_target: "",
  abs_advance_target: "",
};

// fields that identify a plan (one live plan per employee + financial year + season)
const IDENTITY = ["assigned_user_id", "financial_year", "season"];

// calendar months touched by a period (same rule as the backend)
const monthCount = (from, to) => {
  if (!from || !to || from > to) return 0;
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
};

const BpPlanFormModal = ({ isOpen, onClose, plan, onSaved }) => {
  const { masters, loading } = useMasters();
  const notify = useBpToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const absEnabled = !!masters?.abs_enabled;
  const inRevision = !!plan?.in_revision;

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setServerError("");
    setForm(
      plan
        ? {
            name: plan.name || "",
            financial_year: plan.financial_year || "",
            season: plan.season || "",
            start_date: plan.start_date || "",
            end_date: plan.end_date || "",
            state_id: plan.state_id ? String(plan.state_id) : "",
            territory_id: plan.territory_id ? String(plan.territory_id) : "",
            assigned_user_id: plan.assigned_user_id ? String(plan.assigned_user_id) : "",
            plan_type: plan.plan_type || "",
            abs_booking_target: Number(plan.abs_booking_target) ? String(plan.abs_booking_target) : "",
            abs_advance_target: Number(plan.abs_advance_target) ? String(plan.abs_advance_target) : "",
          }
        : EMPTY,
    );
  }, [isOpen, plan]);

  const set = (key) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [key]: v, ...(key === "state_id" ? { territory_id: "" } : {}) }));
    setErrors((x) => ({ ...x, [key]: undefined }));
    setServerError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Plan name is required";
    ["financial_year", "season", "plan_type", "state_id", "assigned_user_id", "start_date", "end_date"].forEach((k) => {
      if (!form[k]) e[k] = "Required";
    });
    if (form.start_date && form.end_date && form.start_date > form.end_date) e.end_date = "End date must be after start date";
    if (absEnabled) {
      const booking = form.abs_booking_target === "" ? 0 : Number(form.abs_booking_target);
      const advance = form.abs_advance_target === "" ? 0 : Number(form.abs_advance_target);
      if (!Number.isFinite(booking) || booking < 0) e.abs_booking_target = "Enter an amount of 0 or more";
      if (!Number.isFinite(advance) || advance < 0) e.abs_advance_target = "Enter an amount of 0 or more";
      else if (advance > booking) e.abs_advance_target = "Advance target cannot be more than the booking target";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    const body = {
      name: form.name.trim(),
      financial_year: form.financial_year,
      season: form.season,
      start_date: form.start_date,
      end_date: form.end_date,
      plan_type: form.plan_type,
      state_id: Number(form.state_id),
      territory_id: form.territory_id ? Number(form.territory_id) : null,
      assigned_user_id: Number(form.assigned_user_id),
    };
    if (absEnabled) {
      body.abs_booking_target = form.abs_booking_target === "" ? 0 : Number(form.abs_booking_target);
      body.abs_advance_target = form.abs_advance_target === "" ? 0 : Number(form.abs_advance_target);
    }
    if (inRevision) IDENTITY.forEach((k) => delete body[k]);
    setSaving(true);
    setServerError("");
    try {
      const res = plan ? await bpApi.updatePlan(plan.id, body) : await bpApi.createPlan(body);
      notify.ok(res.message || (plan ? "Plan updated" : "Plan created"));
      onSaved?.(res.data);
      onClose();
    } catch (err) {
      // 409 = this employee already has a plan for the season: show it in the form
      if (err?.response?.status === 409) setServerError(apiError(err));
      else notify.fail(err, "Could not save the plan");
    } finally {
      setSaving(false);
    }
  };

  const territories = (masters?.territories || []).filter((t) => String(t.state_id) === String(form.state_id));
  const months = monthCount(form.start_date, form.end_date);
  const field = (key, label, input, helper) => (
    <FormControl isRequired={!["territory_id", "abs_booking_target", "abs_advance_target"].includes(key)} isInvalid={!!errors[key]}>
      <FormLabel fontSize="sm">{label}</FormLabel>
      {input}
      {helper ? <FormHelperText fontSize="xs">{helper}</FormHelperText> : null}
      <FormErrorMessage>{errors[key]}</FormErrorMessage>
    </FormControl>
  );
  const select = (key, options, placeholder = "Select") => (
    <Select size="sm" value={form[key]} onChange={set(key)} placeholder={placeholder} isDisabled={inRevision && IDENTITY.includes(key)}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </Select>
  );
  const money = (key) => (
    <Input size="sm" type="number" min={0} step="0.01" value={form[key]} onChange={set(key)} placeholder="0" />
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">
          {plan ? `Edit ${plan.plan_code}${inRevision ? ` — revision ${Number(plan.revision_no || 0) + 1}` : ""}` : "Create Business Plan"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading || !masters ? (
            <Loading />
          ) : (
            <>
              {serverError ? (
                <Alert status="warning" mb={3} fontSize="sm" borderRadius="md">
                  <AlertIcon />
                  {serverError}
                </Alert>
              ) : null}
              {inRevision ? (
                <Alert status="info" mb={3} fontSize="sm" borderRadius="md">
                  <AlertIcon />
                  This approved plan is being revised. The employee, financial year and season cannot change. The approved targets
                  stay in force until the revision is approved.
                </Alert>
              ) : null}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <FormControl isRequired isInvalid={!!errors.name} gridColumn={{ md: "span 2" }}>
                  <FormLabel fontSize="sm">Plan Name</FormLabel>
                  <Input size="sm" value={form.name} onChange={set("name")} maxLength={200} placeholder="e.g. Jaipur Rural — Kharif 2026" />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
                {field("financial_year", "Financial Year", select("financial_year", masters.financial_years.map((v) => [v, v])))}
                {field("season", "Season", select("season", masters.seasons.map((v) => [v, v])))}
                {field("start_date", "Start Date", <Input size="sm" type="date" value={form.start_date} onChange={set("start_date")} />)}
                {field(
                  "end_date",
                  "End Date",
                  <Input size="sm" type="date" value={form.end_date} onChange={set("end_date")} />,
                  months ? `${months} plan month${months === 1 ? "" : "s"}` : null,
                )}
                {field("state_id", "State", select("state_id", masters.states.map((s) => [s.id, s.name])))}
                {field(
                  "territory_id",
                  "Territory",
                  select("territory_id", territories.map((t) => [t.id, t.name]), territories.length ? "Select (optional)" : "No territory for this state"),
                )}
                {field(
                  "assigned_user_id",
                  "Assigned Employee",
                  select("assigned_user_id", masters.employees.map((e) => [e.id, e.job_role ? `${e.name} — ${e.job_role}` : e.name])),
                  "One plan per employee, financial year and season.",
                )}
                {field("plan_type", "Plan Type", select("plan_type", masters.plan_types.map((v) => [v, v])))}
                {absEnabled ? (
                  <>
                    {field("abs_booking_target", "ABS Booking Target (₹)", money("abs_booking_target"), "Advance booking value for the plan period")}
                    {field("abs_advance_target", "ABS Advance Target (₹)", money("abs_advance_target"), "Advance to be collected; counted inside collection")}
                  </>
                ) : null}
              </SimpleGrid>
              <Text fontSize="xs" color="gray.500" mt={3}>
                Sales and collection targets are calculated from the distributor lines: the seasonal target when entered, otherwise
                the annual target × plan months ÷ 12. Monthly targets default to the season target ÷ plan months.
              </Text>
            </>
          )}
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>
            {plan ? "Save Changes" : "Create Draft Plan"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BpPlanFormModal;
