// Business Plan → Settings
//   General      (lists, thresholds, allocation rule, lock date, approval roles) — MANAGE_BUSINESS_PLAN_SETTINGS
//   Territories  (territories, versions, territory managers) — Admin / Super Admin, or
//                MANAGE_BP_TERRITORIES with assigned states (see BpTerritories.jsx)
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { bpApi, apiError } from "../../services/businessPlanApi";
import { ErrorBox, Loading, PageTitle, fmtDate, refreshMasters, useBpToast, useConfirm, useMasters } from "./bpShared";
import BpTerritories from "./BpTerritories";

const LISTS = [
  ["FINANCIAL_YEAR", "Financial Years", "e.g. 2027-28"],
  ["SEASON", "Seasons", "e.g. Zaid"],
  ["PLAN_TYPE", "Plan Types", "e.g. Distributor Wise"],
  ["GAP_REASON", "Variance / Gap Reasons", "e.g. Heavy rain"],
];

const Block = ({ title, children, right }) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={4} mb={4}>
    <Flex justify="space-between" align="center" mb={3}>
      <Text fontWeight="800" fontSize="sm">{title}</Text>
      {right}
    </Flex>
    {children}
  </Box>
);

// add one value to a list
const AddOption = ({ listKey, placeholder, onAdded }) => {
  const notify = useBpToast();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const add = async () => {
    if (!value.trim()) return;
    setSaving(true);
    try {
      const res = await bpApi.addOption(listKey, value.trim());
      notify.ok(res.message || "Added");
      setValue("");
      onAdded();
    } catch (err) {
      notify.fail(err);
    } finally {
      setSaving(false);
    }
  };
  return (
    <HStack mt={3} maxW="420px">
      <Input size="sm" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
      <Button size="sm" onClick={add} isLoading={saving}>+ Add</Button>
    </HStack>
  );
};

const GeneralSettings = () => {
  const notify = useBpToast();
  const [confirm, confirmDialog] = useConfirm();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [thresholds, setThresholds] = useState({});
  const [lockDate, setLockDate] = useState("");
  const [finalRoles, setFinalRoles] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const s = await bpApi.settings();
      setSettings(s);
      setThresholds(s.thresholds || {});
      setLockDate(s.lock_date || "");
      setFinalRoles(s.final_approver_roles || "");
    } catch (err) {
      setError(apiError(err, "Could not load settings"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // reload this page and the cached dropdown lists used everywhere else
  const changed = async () => {
    await load();
    try {
      await refreshMasters();
    } catch {
      /* lists refresh on next page open */
    }
  };

  const save = async (body, okText) => {
    setSaving(true);
    try {
      const res = await bpApi.saveSettings(body);
      notify.ok(res.message || okText);
      await changed();
    } catch (err) {
      notify.fail(err);
    } finally {
      setSaving(false);
    }
  };

  const removeOption = async (option, listTitle) => {
    if (!(await confirm("Remove value", `Remove "${option.value}" from ${listTitle}? Plans that already use it keep it.`, { yes: "Remove", danger: true }))) return;
    try {
      const res = await bpApi.removeOption(option.id);
      notify.ok(res.message || "Removed");
      await changed();
    } catch (err) {
      notify.fail(err);
    }
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!settings) return <Loading />;

  return (
    <Box>
      {confirmDialog}

      {LISTS.map(([key, title, placeholder]) => (
        <Block key={key} title={title}>
          <Wrap>
            {(settings.lists?.[key] || []).map((o) => (
              <WrapItem key={o.id}>
                <Tag size="md" borderRadius="full" variant="subtle" colorScheme="teal">
                  <TagLabel>{o.value}</TagLabel>
                  <TagCloseButton onClick={() => removeOption(o, title)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
          <AddOption listKey={key} placeholder={placeholder} onAdded={changed} />
        </Block>
      ))}

      <Block
        title="Performance Thresholds"
        right={
          <Button size="sm" colorScheme="teal" isLoading={saving} onClick={() => save({ thresholds: Object.fromEntries(Object.entries(thresholds).map(([k, v]) => [k, Number(v)])) }, "Thresholds saved")}>
            Save Thresholds
          </Button>
        }
      >
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
          {[
            ["over_achieved", "Over Achieved above (%)"],
            ["achieved", "Achieved at (%)"],
            ["on_track", "On Track at (%)"],
            ["attention", "Attention Required at (%)"],
          ].map(([k, l]) => (
            <FormControl key={k}>
              <FormLabel fontSize="xs">{l}</FormLabel>
              <NumberInput size="sm" min={0} max={1000} value={thresholds[k] ?? ""} onChange={(v) => setThresholds((t) => ({ ...t, [k]: v }))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
          ))}
        </SimpleGrid>
        <Text fontSize="xs" color="gray.500" mt={2}>Must go down in order. Below “Attention Required” a plan is shown as Critical.</Text>
      </Block>

      <Block title="Target Allocation Rule">
        <FormControl display="flex" alignItems="center">
          <Switch
            colorScheme="teal"
            isChecked={!settings.allow_allocation_override}
            onChange={(e) => save({ allow_allocation_override: !e.target.checked }, "Policy updated")}
            isDisabled={saving}
            mr={3}
          />
          <FormLabel mb={0} fontSize="sm">
            Enforce “child ≤ parent” (state allocation ≤ product target, seasonal ≤ annual, product planning ≤ distributor target)
          </FormLabel>
        </FormControl>
      </Block>

      <Block title="Business Plan Lock Date">
        <Text fontSize="sm" mb={2}>Locked after: <b>{settings.lock_date ? fmtDate(settings.lock_date) : "Not set"}</b> (only admins can create or change plans after this date)</Text>
        <HStack maxW="420px">
          <Input size="sm" type="date" value={lockDate} onChange={(e) => setLockDate(e.target.value)} />
          <Button size="sm" colorScheme="teal" isLoading={saving} isDisabled={!lockDate} onClick={() => save({ lock_date: lockDate }, "Lock date saved")}>Save</Button>
          {settings.lock_date && <Button size="sm" variant="ghost" onClick={() => save({ lock_date: null }, "Lock date removed")}>Remove</Button>}
        </HStack>
      </Block>

      <Block title="Approval Levels — Final Approver Role">
        <Text fontSize="sm" mb={2}>
          A submitted business plan / target sheet goes up the employee&apos;s reporting line, one level per manager.
          The first manager whose job role is listed here (the RSM) gives the final approval. If no such manager is
          found, an Admin / Super Admin gives the final approval. Admin and Super Admin can approve any plan at any level.
        </Text>
        <HStack maxW="620px">
          <Input size="sm" value={finalRoles} placeholder="RSM, Regional Sales Manager" onChange={(e) => setFinalRoles(e.target.value)} />
          <Button size="sm" colorScheme="teal" isLoading={saving} onClick={() => save({ final_approver_roles: finalRoles }, "Final approver roles saved")}>Save</Button>
        </HStack>
        <Text fontSize="xs" color="gray.500" mt={2}>
          Comma separated. Each entry is a job role name (case, dots and spaces ignored; the short name in brackets also counts, so
          &quot;RSM&quot; matches &quot;Regional Sales Manager (R.S.M)&quot;), or <b>id:2</b> for a job role id, or <b>level:2</b> for a job role level.
          Business Plans go up the reporting line to this role; Target Sheets need only the reporting manager and this role (RSM).
          Applies to new submissions.
        </Text>
      </Block>

      <Button
        size="sm"
        variant="outline"
        colorScheme="red"
        onClick={async () => {
          if (!(await confirm("Reset settings", "Thresholds, the allocation rule and the lock date go back to default. Lists are not changed.", { yes: "Reset", danger: true }))) return;
          try {
            const res = await bpApi.resetSettings();
            notify.ok(res.message || "Settings reset");
            await changed();
          } catch (err) {
            notify.fail(err);
          }
        }}
      >
        Reset Settings to Default
      </Button>

    </Box>
  );
};

// The page: each tab only for the users who may use it (the server checks every call again)
const BpSettings = () => {
  const { masters, loading, error, reload } = useMasters();
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (loading || !masters) return <Loading />;
  const me = masters.me || {};
  const ta = me.territory_access || {};
  const showGeneral = !!me.can_manage_settings;
  const showTerritories = !!(me.is_admin || ta.has_permission || ta.can_manage_territories);
  return (
    <Box>
      <PageTitle title="Business Plan Settings" subtitle="Configuration used by the app and this dashboard" />
      {!showGeneral && !showTerritories ? (
        <ErrorBox message="You do not have access to Business Plan settings." />
      ) : (
        <Tabs colorScheme="teal" isLazy variant="enclosed">
          <TabList>
            {showGeneral && <Tab fontSize="sm">General</Tab>}
            {showTerritories && <Tab fontSize="sm">Territories</Tab>}
          </TabList>
          <TabPanels>
            {showGeneral && (
              <TabPanel px={0}>
                <GeneralSettings />
              </TabPanel>
            )}
            {showTerritories && (
              <TabPanel px={0}>
                <BpTerritories />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

export default BpSettings;
