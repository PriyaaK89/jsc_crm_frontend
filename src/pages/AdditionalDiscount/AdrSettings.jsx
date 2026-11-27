// Additional Discount → Settings (MANAGE_ADDITIONAL_DISCOUNT_SETTINGS): validity, expiry
// notice, RSM job roles, maximum %, document rules, request prefix, reason master, and a
// manual run of the daily expiry job.
import React, { useEffect, useState } from "react";
import { Badge, Box, Button, Flex, FormControl, FormHelperText, FormLabel, HStack, Input, SimpleGrid, Switch, Text } from "@chakra-ui/react";
import { DataTable, ErrorBox, Loading, PageTitle, Section, adrApi, useAdrToast, useLoad } from "./adrShared";

const AdrSettings = () => {
  const notify = useAdrToast();
  const { data, loading, error, reload } = useLoad(() => adrApi.settings(), []);
  const [form, setForm] = useState(null);
  const [newReason, setNewReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        validity_days: String(data.validity_days),
        expiry_warning_days: String(data.expiry_warning_days),
        rsm_job_roles: data.rsm_job_roles,
        max_discount_pct: data.max_discount_pct === null ? "" : String(data.max_discount_pct),
        require_attachment: data.require_attachment,
        max_attachments: String(data.max_attachments),
        max_attachment_mb: String(data.max_attachment_mb),
        request_prefix: data.request_prefix,
      });
    }
  }, [data]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    setSaving(true);
    try {
      await adrApi.saveSettings({ ...form, max_discount_pct: form.max_discount_pct === "" ? "" : Number(form.max_discount_pct) });
      notify.ok("Settings saved");
      reload();
    } catch (err) {
      notify.fail(err, "Could not save");
    } finally {
      setSaving(false);
    }
  };
  const addReason = async () => {
    try {
      await adrApi.addReason(newReason.trim());
      setNewReason("");
      notify.ok("Reason added");
      reload();
    } catch (err) {
      notify.fail(err, "Could not add the reason");
    }
  };
  const toggleReason = async (r) => {
    try {
      await adrApi.updateReason(r.id, { is_active: !r.is_active });
      reload();
    } catch (err) {
      notify.fail(err, "Could not change the reason");
    }
  };
  const runJob = async () => {
    try {
      const r = await adrApi.runJob();
      notify.ok(`Done: ${r.warned} expiry notice(s), ${r.expired} expired, ${r.rerouted} re-routed${r.errors.length ? `, ${r.errors.length} error(s)` : ""}`);
    } catch (err) {
      notify.fail(err, "Could not run the job");
    }
  };

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!form) return null;
  return (
    <Box>
      <PageTitle title="Discount Settings" subtitle="Admin configuration" right={<Button size="sm" variant="outline" onClick={runJob}>Run expiry job now</Button>} />
      <Section title="Rules">
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          <FormControl><FormLabel fontSize="sm">Validity (days from final approval)</FormLabel><Input size="sm" type="number" value={form.validity_days} onChange={(e) => set("validity_days", e.target.value)} /></FormControl>
          <FormControl><FormLabel fontSize="sm">"Expiring soon" notice (days before)</FormLabel><Input size="sm" type="number" value={form.expiry_warning_days} onChange={(e) => set("expiry_warning_days", e.target.value)} /></FormControl>
          <FormControl><FormLabel fontSize="sm">Maximum additional discount %</FormLabel><Input size="sm" type="number" value={form.max_discount_pct} onChange={(e) => set("max_discount_pct", e.target.value)} placeholder="blank = no cap" /></FormControl>
          <FormControl>
            <FormLabel fontSize="sm">RSM job roles</FormLabel>
            <Input size="sm" value={form.rsm_job_roles} onChange={(e) => set("rsm_job_roles", e.target.value)} />
            <FormHelperText fontSize="xs">Comma separated: job role names, id:&lt;n&gt; or level:&lt;n&gt;. Default "RSM,Regional Sales Manager".</FormHelperText>
          </FormControl>
          <FormControl><FormLabel fontSize="sm">Request number prefix</FormLabel><Input size="sm" value={form.request_prefix} onChange={(e) => set("request_prefix", e.target.value)} /></FormControl>
          <FormControl display="flex" alignItems="center" pt={6}><Switch isChecked={form.require_attachment} onChange={(e) => set("require_attachment", e.target.checked)} mr={2} /><FormLabel fontSize="sm" mb={0}>Supporting document required</FormLabel></FormControl>
          <FormControl><FormLabel fontSize="sm">Maximum documents per request</FormLabel><Input size="sm" type="number" value={form.max_attachments} onChange={(e) => set("max_attachments", e.target.value)} /></FormControl>
          <FormControl><FormLabel fontSize="sm">Maximum document size (MB, ≤ 10)</FormLabel><Input size="sm" type="number" value={form.max_attachment_mb} onChange={(e) => set("max_attachment_mb", e.target.value)} /></FormControl>
        </SimpleGrid>
        <Flex justify="flex-end" mt={4}><Button size="sm" colorScheme="teal" onClick={save} isLoading={saving}>Save settings</Button></Flex>
      </Section>

      <Section title="Reason master" right={<HStack><Input size="sm" maxW="240px" placeholder="New reason" value={newReason} onChange={(e) => setNewReason(e.target.value)} /><Button size="sm" onClick={addReason} isDisabled={newReason.trim().length < 2}>Add</Button></HStack>}>
        <DataTable
          rows={data.reasons}
          columns={[
            { key: "reason", label: "Reason" },
            { key: "sort_order", label: "Order", numeric: true },
            { key: "is_active", label: "Status", render: (r) => <Badge colorScheme={r.is_active ? "green" : "gray"}>{r.is_active ? "Active" : "Off"}</Badge> },
            { key: "action", label: "", render: (r) => (r.reason.toLowerCase() === "other" ? <Text fontSize="xs" color="gray.500">always last</Text> : <Button size="xs" variant="outline" onClick={() => toggleReason(r)}>{r.is_active ? "Switch off" : "Switch on"}</Button>) },
          ]}
        />
      </Section>
    </Box>
  );
};

export default AdrSettings;
