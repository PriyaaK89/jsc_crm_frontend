// Business Plan → plan detail (GET /business-plan/plans/:id + one call per tab)
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  HStack,
  Progress,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { bpApi, apiError, toRecordId } from "../../services/businessPlanApi";
import BpPlanFormModal from "./BpPlanFormModal";
import { AbsMonthModal, CorrectiveModal, DevelopmentModal, DistributorModal, MonthModal, ProductModal, RetailerModal } from "./BpLineModals";
import {
  ApprovalSteps,
  DataTable,
  Empty,
  ErrorBox,
  InvalidId,
  InfoGrid,
  Loading,
  PerfBadge,
  StatusBadge,
  fmtDate,
  fmtDateTime,
  money,
  pct,
  qty,
  signedMoney,
  useBpToast,
  useCommentPrompt,
  useConfirm,
} from "./bpShared";

const TABS = [
  ["overview", "Overview"],
  ["distributors", "Distributor"],
  ["retailers", "Retailer"],
  ["products", "Product"],
  ["monthly", "Monthly Plan"],
  ["collection", "Collection"],
  ["achievement", "Achievement"],
  ["variance", "Variance"],
  ["corrective-actions", "Corrective Actions"],
  ["revisions", "Revisions"],
  ["target-sheets", "Target Sheets"],
  ["approval-history", "Approval History"],
  ["audit-log", "Audit Log"],
];

const ACTION_LABELS = {
  PLAN_CREATED: "Plan Created",
  PLAN_UPDATED: "Plan Updated",
  LEVEL_APPROVED: "Approved (level) — sent to next approver",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  RETURNED: "Returned for Changes",
  REOPENED: "Reopened as Draft",
  CLOSED: "Closed",
  REVISION_STARTED: "Revision Started",
};
const actionLabel = (a) => ACTION_LABELS[a] || String(a || "").replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const Kpi = ({ label, value, color }) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={3}>
    <Text fontSize="xs" color="gray.500" fontWeight="600">
      {label}
    </Text>
    <Text fontSize="lg" fontWeight="800" color={color}>
      {value}
    </Text>
  </Box>
);

const Card = ({ title, right, children }) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={4} mb={4}>
    <Flex justify="space-between" align="center" mb={3}>
      <Text fontWeight="800" fontSize="sm">
        {title}
      </Text>
      {right}
    </Flex>
    {children}
  </Box>
);

const BpPlanDetail = () => {
  // the route is /business-plan/plans/:id. A missing / "undefined" / non-numeric id is
  // refused here (no API call) — that was the GET /plans/undefined -> 400 error.
  const params = useParams();
  const id = toRecordId(params.id ?? params.planId);
  const navigate = useNavigate();
  const notify = useBpToast();
  const [confirm, confirmDialog] = useConfirm();
  const [askComment, commentDialog] = useCommentPrompt();

  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [tabData, setTabData] = useState({});
  const [tabError, setTabError] = useState({});
  const [modal, setModal] = useState(null); // { type, item?, extra? }
  const [revision, setRevision] = useState(null); // an opened approved revision (snapshot)

  const plan = overview?.plan;
  const actions = overview?.actions || {};

  const loadPlan = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      setOverview(await bpApi.plan(id));
      setTabData({});
      setTabError({});
    } catch (err) {
      setError(apiError(err, "Could not load the plan"));
    }
  }, [id]);

  const loadTab = useCallback(
    async (key, force = false) => {
      if (key === "overview" || !id) return;
      if (!force && tabData[key] !== undefined) return;
      setTabError((e) => ({ ...e, [key]: null }));
      try {
        const d = await bpApi.planTab(id, key);
        setTabData((t) => ({ ...t, [key]: d }));
      } catch (err) {
        setTabError((e) => ({ ...e, [key]: apiError(err) }));
      }
    },
    [id, tabData],
  );

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  useEffect(() => {
    if (overview) loadTab(TABS[tabIndex][0]);
  }, [overview, tabIndex, loadTab]);

  // the corrective-action form needs the plan's distributors for its scope list
  useEffect(() => {
    if (modal?.type === "corrective") loadTab("distributors");
  }, [modal, loadTab]);

  // after any change: reload header/overview (totals) and the current tab
  const refresh = async () => {
    await loadPlan();
  };

  const runAction = async (action, { title, message, comment, commentRequired, danger } = {}) => {
    let text = "";
    if (comment) {
      text = await askComment(title, { required: commentRequired, placeholder: "Comment", yes: title, danger });
      if (text === null) return;
    } else if (!(await confirm(title, message, { yes: title, danger }))) {
      return;
    }
    setBusy(true);
    try {
      const res = await bpApi.planAction(id, action, text);
      notify.ok(res.message || "Done");
      await refresh();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };

  const deletePlan = async () => {
    if (!(await confirm("Delete plan", `Delete ${plan.plan_code}? This cannot be undone.`, { yes: "Delete", danger: true }))) return;
    try {
      const res = await bpApi.deletePlan(id);
      notify.ok(res.message || "Plan deleted");
      navigate("/business-plan/plans");
    } catch (err) {
      notify.fail(err);
    }
  };

  const deleteLine = async (kind, line, label) => {
    if (!(await confirm("Remove", `Remove ${label} from this plan?`, { yes: "Remove", danger: true }))) return;
    try {
      const res = await bpApi.deleteLine(id, kind, line.id);
      notify.ok(res.message || "Removed");
      await refresh();
    } catch (err) {
      notify.fail(err);
    }
  };

  if (!id) return <InvalidId what="business plan" onBack={() => navigate("/business-plan/plans")} />;
  if (error) return <ErrorBox message={error} onRetry={loadPlan} />;
  if (!overview) return <Loading />;
  if (!plan) return <ErrorBox message="The server did not return this business plan." onRetry={loadPlan} />;

  const k = overview.kpis || {};
  const tg = overview.targets || {};
  const approval = overview.approval || null;
  const nd = overview.new_distributor_acquisition || {};
  const nr = overview.new_retailer_development || {};
  // territory: the saved snapshot for approved / closed / rejected plans and open revisions,
  // otherwise the territory's latest version (GET /plans/:id -> territory)
  const terr = overview.territory || plan.territory || null;
  const canEdit = !!actions.can_edit;
  const tabState = (key) => ({ data: tabData[key], err: tabError[key] });

  const tabBody = (key, render) => {
    const { data, err } = tabState(key);
    if (err) return <ErrorBox message={err} onRetry={() => loadTab(key, true)} />;
    if (data === undefined) return <Loading />;
    return render(data);
  };

  return (
    <Box>
      {confirmDialog}
      {commentDialog}

      {/* ---------- header ---------- */}
      <Box border="1px solid" borderColor="gray.100" borderRadius="14px" p={4} mb={4}>
        <Flex justify="space-between" gap={4} wrap="wrap">
          <Box minW={0}>
            <Text fontSize="xs" fontWeight="800" color="gray.500">
              {plan.plan_code}
            </Text>
            <Text fontSize="lg" fontWeight="800">
              {plan.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              FY {plan.financial_year} · {plan.season} · {plan.state_name} / {plan.territory_name || "—"} · {plan.plan_type}
            </Text>
          </Box>
          <HStack align="flex-start">
            {Number(plan.revision_no) > 0 && <StatusBadge status="ACTIVE" label={`Revision ${plan.revision_no}`} />}
            {plan.in_revision && <StatusBadge status="UNDER_REVIEW" label={`Revision ${Number(plan.revision_no) + 1} in progress`} />}
            <StatusBadge status={plan.status} label={plan.status_label} />
            <PerfBadge performance={plan.performance} percent={plan.achievement_percent} />
          </HStack>
        </Flex>
        <Progress value={Math.min(plan.achievement_percent || 0, 100)} size="sm" borderRadius="full" mt={3} colorScheme={plan.performance?.tone === "green" ? "green" : plan.performance?.tone === "orange" ? "orange" : "red"} />
        <Text fontSize="xs" color="gray.500" mt={1}>
          {pct(plan.achievement_percent)} achieved · {plan.days_elapsed}/{plan.days_total} days ({pct(plan.elapsed_percent)}) elapsed
        </Text>
        {approval && approval.status === "IN_PROGRESS" && (
          <Text fontSize="sm" mt={2} fontWeight="700" color="orange.600">
            Approval: Level {approval.current_level} of {approval.total_levels} — pending with {approval.pending_with}
            {approval.pending_role && approval.pending_role !== "Admin / Super Admin" ? ` (${approval.pending_role})` : ""}
          </Text>
        )}
        {plan.in_revision && (
          <Alert status="info" borderRadius="10px" mt={3} fontSize="sm">
            <AlertIcon />
            This plan is being revised. Achievement and the employee's Target Sheet still use the approved revision {plan.revision_no} targets
            ({money(plan.approved_sales_target)} sales / {money(plan.approved_collection_target)} collection) until the revision is approved.
            Working targets: {money(plan.proposed_sales_target)} sales / {money(plan.proposed_collection_target)} collection.
          </Alert>
        )}
        {(overview.overlap_warnings || []).length > 0 && (
          <Alert status="warning" borderRadius="10px" mt={3} fontSize="sm" alignItems="flex-start">
            <AlertIcon />
            <Box>
              <Text fontWeight="700">Distributor also in another plan of this employee with overlapping dates</Text>
              {overview.overlap_warnings.map((o) => (
                <Text key={`${o.ledger_id}-${o.other_plan_id}`}>
                  {o.distributor}: {o.other_plan_code} ({o.other_season}, {fmtDate(o.other_start_date)} – {fmtDate(o.other_end_date)})
                </Text>
              ))}
              <Text fontSize="xs" color="gray.600" mt={1}>
                This plan is measured in its own dates. Combined dashboards and employee reports count each invoice and receipt once.
              </Text>
            </Box>
          </Alert>
        )}
        {plan.decision_remark && plan.status !== "ACTIVE" && (
          <Alert status={plan.status === "REJECTED" ? "error" : "warning"} borderRadius="10px" mt={3} fontSize="sm">
            <AlertIcon />
            Approver comment: {plan.decision_remark}
          </Alert>
        )}
        <Wrap mt={3} spacing={2}>
          {actions.can_submit && (
            <WrapItem>
              <Button size="sm" colorScheme="teal" isLoading={busy} onClick={() => runAction("submit", { title: "Submit for approval", message: `Send ${plan.plan_code} for approval? It goes to the reporting manager first, then up the reporting line to the final approver.` })}>
                {plan.status === "UNDER_REVIEW" ? "Resubmit for Approval" : "Submit for Approval"}
              </Button>
            </WrapItem>
          )}
          {actions.can_approve && (
            <WrapItem>
              <Button size="sm" colorScheme="green" isLoading={busy} onClick={() => runAction("approve", { title: actions.final_if_approved ? "Final approval" : `Approve level ${actions.approval_level || ""}`, comment: true })}>
                {actions.final_if_approved ? "Approve (Final)" : actions.approval_level ? `Approve (Level ${actions.approval_level})` : "Approve"}
              </Button>
            </WrapItem>
          )}
          {actions.can_return && (
            <WrapItem>
              <Button size="sm" colorScheme="orange" variant="outline" isLoading={busy} onClick={() => runAction("return", { title: "Return for changes", comment: true, commentRequired: true })}>
                Return
              </Button>
            </WrapItem>
          )}
          {actions.can_reject && (
            <WrapItem>
              <Button size="sm" colorScheme="red" variant="outline" isLoading={busy} onClick={() => runAction("reject", { title: "Reject", comment: true, commentRequired: true, danger: true })}>
                Reject
              </Button>
            </WrapItem>
          )}
          {actions.can_reopen && (
            <WrapItem>
              <Button size="sm" colorScheme="teal" variant="outline" isLoading={busy} onClick={() => runAction("reopen", { title: "Revise plan", message: "Reopen this rejected plan as Draft?" })}>
                Revise Plan
              </Button>
            </WrapItem>
          )}
          {actions.can_revise && (
            <WrapItem>
              <Button
                size="sm"
                colorScheme="purple"
                variant="outline"
                isLoading={busy}
                onClick={() => runAction("revise", { title: "Revise approved plan", comment: true, commentRequired: true })}
              >
                Revise Targets
              </Button>
            </WrapItem>
          )}
          {actions.can_close && (
            <WrapItem>
              <Button size="sm" variant="outline" isLoading={busy} onClick={() => runAction("close", { title: "Close plan", message: "Close this plan? It becomes read-only." })}>
                Close Plan
              </Button>
            </WrapItem>
          )}
          {canEdit && (
            <WrapItem>
              <Button size="sm" variant="outline" onClick={() => setModal({ type: "header" })}>
                Edit Details
              </Button>
            </WrapItem>
          )}
          {actions.can_delete && (
            <WrapItem>
              <Button size="sm" variant="ghost" colorScheme="red" onClick={deletePlan}>
                Delete
              </Button>
            </WrapItem>
          )}
        </Wrap>
      </Box>

      {/* ---------- tabs ---------- */}
      <Tabs index={tabIndex} onChange={setTabIndex} size="sm" variant="soft-rounded" colorScheme="teal" isLazy>
        <TabList overflowX="auto" pb={2} flexWrap={{ base: "nowrap", md: "wrap" }} gap={1}>
          {TABS.map(([key, label]) => (
            <Tab key={key} whiteSpace="nowrap">
              {label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {/* Overview */}
          <TabPanel px={0}>
            <Card title="Plan Information">
              <InfoGrid
                items={[
                  ["Assigned Employee", `${plan.assigned_user_name || "—"}${plan.assigned_job_role ? ` — ${plan.assigned_job_role}` : ""}`],
                  ["Reporting Manager", plan.reporting_manager_name],
                  ["Period", `${fmtDate(plan.start_date)} – ${fmtDate(plan.end_date)}`],
                  ["Plan Type", plan.plan_type],
                  ["State / Territory", `${plan.state_name || "—"} / ${plan.territory_name || "—"}`],
                  ["Created By", plan.created_by_name],
                  ["Submitted", plan.submitted_at ? fmtDateTime(plan.submitted_at) : "—"],
                  ["Decided By", plan.decided_by_name ? `${plan.decided_by_name}, ${fmtDateTime(plan.decided_at)}` : "—"],
                ]}
              />
            </Card>
            {terr && (
              <Card
                title="Territory"
                right={
                  <HStack spacing={1}>
                    {terr.version_no ? <StatusBadge status="PLAN" label={`Version ${terr.version_no}`} /> : null}
                    <StatusBadge
                      status={terr.frozen ? "ACTIVE" : "SUBMITTED"}
                      label={terr.frozen ? "Saved snapshot" : "Latest version"}
                    />
                  </HStack>
                }
              >
                <Text fontWeight="700" fontSize="sm">
                  {terr.name || "—"} <Text as="span" fontWeight="400" color="gray.500">· {terr.state_name || plan.state_name || "—"}</Text>
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1} whiteSpace="normal">
                  {(terr.district_names || []).length ? `Districts (${terr.district_names.length}): ${terr.district_names.join(", ")}` : "No districts recorded"}
                </Text>
                {terr.frozen ? (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    The territory as it was when this plan was approved{terr.captured_at ? ` (recorded ${fmtDateTime(terr.captured_at)})` : ""}.
                    {terr.updated_since ? ` The territory has changed since (now version ${terr.latest_version_no}); this plan keeps its saved coverage.` : ""}
                  </Text>
                ) : (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Draft / submitted / returned plans use the territory&apos;s latest version. It is frozen when the plan is approved.
                    {terr.territory_is_active === false ? " This territory is now inactive; the plan keeps it." : ""}
                  </Text>
                )}
              </Card>
            )}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
              <Kpi label={`Season Sales Target (${tg.plan_months || "—"} mo)`} value={money(k.sales_target)} />
              <Kpi label="Sales Achieved" value={money(k.sales_achieved)} color="green.600" />
              <Kpi label={`Season Collection Target (${tg.plan_months || "—"} mo)`} value={money(k.collection_target)} />
              <Kpi label="Collection Achieved" value={money(k.collection_achieved)} color="green.600" />
            </SimpleGrid>
            <Card title="Targets">
              <InfoGrid
                items={[
                  ["Annual Sales Target (distributors)", money(tg.annual_sales_target)],
                  ["Season Sales Target (used for achievement)", money(tg.season_sales_target)],
                  ["Annual Collection Target", money(tg.annual_collection_target)],
                  ["Season Collection Target (used for achievement)", money(tg.season_collection_target)],
                  ["Approved Revision", tg.revision_no ? `Revision ${tg.revision_no}` : "Not approved yet"],
                  ...(tg.in_revision
                    ? [["Proposed (revision in progress)", `${money(tg.proposed_sales_target)} sales / ${money(tg.proposed_collection_target)} collection`]]
                    : []),
                  ...(tg.abs_enabled
                    ? [["ABS Booking Target", money(tg.abs_booking_target)], ["ABS Advance Target", money(tg.abs_advance_target)]]
                    : []),
                ]}
              />
              <Text fontSize="xs" color="gray.500" mt={2}>
                Season target = seasonal target when entered, otherwise annual target × plan months ÷ 12.
              </Text>
            </Card>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
              <Card
                title="New Distributor Acquisition"
                right={actions.can_update_progress && (canEdit || plan.status === "ACTIVE") && <Button size="xs" onClick={() => setModal({ type: "development" })}>Edit</Button>}
              >
                <InfoGrid columns={1} items={[["Target", nd.target], ["Actual (billed)", nd.actual], ["Opened", nd.opened], ["Pending", nd.pending], ["Conversion %", pct(nd.conversion_percent)]]} />
              </Card>
              <Card
                title="New Retailer Development"
                right={actions.can_update_progress && (canEdit || plan.status === "ACTIVE") && <Button size="xs" onClick={() => setModal({ type: "development" })}>Edit</Button>}
              >
                <InfoGrid
                  columns={1}
                  items={[
                    ["Acquisition Target", nr.acquisition_target],
                    ["Contacted", nr.contacted],
                    ["Qualified", nr.qualified],
                    ["Onboarded", nr.onboarded],
                    ["Ordered (Productive)", nr.ordered],
                    ["Conversion Rate", pct(nr.conversion_percent)],
                    ["Expected Business", money(nr.expected_business)],
                    ["Actual Business (reported, not verified)", money(nr.actual_business)],
                  ]}
                />
              </Card>
            </SimpleGrid>
            <Card title="Employee Business Plan">
              <DataTable
                rows={overview.employee_business_plan || []}
                rowKey={(r) => r.user_id}
                columns={[
                  { key: "name", label: "Employee" },
                  { key: "sales", label: "Sales", render: (r) => `${money(r.sales_target)} (act ${money(r.sales_actual)})` },
                  { key: "coll", label: "Collection", render: (r) => `${money(r.collection_target)} (act ${money(r.collection_actual)})` },
                  { key: "new_distributor_target", label: "New Dist." },
                  { key: "new_retailer_target", label: "New Ret." },
                ]}
              />
            </Card>
          </TabPanel>

          {/* Distributors */}
          <TabPanel px={0}>
            {tabBody("distributors", (rows) => (
              <>
                {canEdit && <Button size="sm" colorScheme="teal" mb={3} onClick={() => setModal({ type: "distributor" })}>+ Add Distributor</Button>}
                <DataTable
                  rows={rows}
                  emptyText="No distributors in this plan yet."
                  onRowClick={canEdit ? (r) => setModal({ type: "distributor", item: r }) : undefined}
                  columns={[
                    { key: "name", label: "Distributor", render: (r) => (<Box><Text fontWeight="700">{r.name}</Text><Text fontSize="xs" color="gray.500">{r.location || r.district || ""}</Text></Box>) },
                    { key: "annual_target", label: "Annual Target", numeric: true, render: (r) => money(r.annual_target) },
                    { key: "season_target", label: "Season Target", numeric: true, render: (r) => money(r.performance_data?.season_sales_target) },
                    { key: "actual", label: "Actual", numeric: true, render: (r) => money(r.performance_data?.actual) },
                    { key: "pct", label: "Achv", render: (r) => <PerfBadge performance={r.performance_data?.performance} percent={r.performance_data?.achievement_percent} /> },
                    { key: "collection_target", label: "Annual Coll.", numeric: true, render: (r) => money(r.collection_target) },
                    { key: "season_coll", label: "Season Coll.", numeric: true, render: (r) => money(r.performance_data?.season_collection_target) },
                    { key: "outstanding", label: "Outstanding", numeric: true, render: (r) => money(r.performance_data?.outstanding) },
                    { key: "growth", label: "Planned Growth", render: (r) => pct(r.growth_percent) },
                    { key: "products", label: "Products", render: (r) => r.products?.length || 0 },
                    ...(canEdit
                      ? [{ key: "x", label: "", render: (r) => <Button size="xs" variant="ghost" colorScheme="red" onClick={(e) => { e.stopPropagation(); deleteLine("distributors", r, r.name); }}>Remove</Button> }]
                      : []),
                  ]}
                />
              </>
            ))}
          </TabPanel>

          {/* Retailers */}
          <TabPanel px={0}>
            {tabBody("retailers", (rows) => (
              <>
                {canEdit && <Button size="sm" colorScheme="teal" mb={3} onClick={() => setModal({ type: "retailer" })}>+ Add Retailer</Button>}
                {plan.status === "ACTIVE" && <Text fontSize="xs" color="gray.500" mb={2}>Click a retailer to record its actual (reported) business.</Text>}
                <DataTable
                  rows={rows}
                  emptyText="No retailers in this plan yet."
                  onRowClick={canEdit || plan.status === "ACTIVE" ? (r) => setModal({ type: "retailer", item: r }) : undefined}
                  columns={[
                    { key: "name", label: "Retailer" },
                    { key: "category", label: "Category", render: (r) => ({ POTENTIAL: "Potential", NEW: "New" }[r.category] || r.category) },
                    { key: "parent_distributor", label: "Under" },
                    { key: "sales_target", label: "Target", numeric: true, render: (r) => money(r.sales_target) },
                    { key: "reported_actual", label: "Actual (reported, unverified)", numeric: true, render: (r) => money(r.reported_actual) },
                    { key: "pct", label: "Achv", render: (r) => <PerfBadge performance={r.performance} percent={r.achievement_percent} /> },
                    { key: "visit_frequency", label: "Visits", render: (r) => String(r.visit_frequency || "").toLowerCase() },
                    ...(canEdit
                      ? [{ key: "x", label: "", render: (r) => <Button size="xs" variant="ghost" colorScheme="red" onClick={(e) => { e.stopPropagation(); deleteLine("retailers", r, r.name); }}>Remove</Button> }]
                      : []),
                  ]}
                />
              </>
            ))}
          </TabPanel>

          {/* Products */}
          <TabPanel px={0}>
            {tabBody("products", (rows) => (
              <>
                {canEdit && <Button size="sm" colorScheme="teal" mb={3} onClick={() => setModal({ type: "product" })}>+ Add Product Target</Button>}
                <DataTable
                  rows={rows}
                  emptyText="No product targets in this plan yet."
                  onRowClick={canEdit ? (r) => setModal({ type: "product", item: r }) : undefined}
                  columns={[
                    { key: "name", label: "Product", render: (r) => (<Box><Text fontWeight="700">{r.name}</Text><Text fontSize="xs" color="gray.500">{r.category || ""}</Text></Box>) },
                    { key: "qty_target", label: "Qty Target", numeric: true, render: (r) => qty(r.qty_target) },
                    { key: "actual_qty", label: "Actual Qty", numeric: true, render: (r) => qty(r.performance_data?.actual_qty) },
                    { key: "value_target", label: "Value Target", numeric: true, render: (r) => money(r.value_target) },
                    { key: "actual_value", label: "Actual Value", numeric: true, render: (r) => money(r.performance_data?.actual_value) },
                    { key: "pct", label: "Achv", render: (r) => <PerfBadge performance={r.performance_data?.performance} percent={r.performance_data?.achievement_percent} /> },
                    { key: "alloc", label: "States", wrap: true, render: (r) => (r.allocations || []).map((a) => `${a.state_name}: ${qty(a.qty)}`).join(", ") || "—" },
                    ...(canEdit
                      ? [{ key: "x", label: "", render: (r) => <Button size="xs" variant="ghost" colorScheme="red" onClick={(e) => { e.stopPropagation(); deleteLine("products", r, r.name); }}>Remove</Button> }]
                      : []),
                  ]}
                />
              </>
            ))}
          </TabPanel>

          {/* Monthly */}
          <TabPanel px={0}>
            {tabBody("monthly", (d) => (
              <>
                {canEdit && (
                  <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                    <Text fontSize="xs" color="gray.500">Click a month to change its targets. {d.rule || "Default = season target ÷ plan months."} Months changed by hand are kept.</Text>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={async () => {
                        if (!(await confirm("Reset monthly plan", "Go back to the default split for every month?", { yes: "Reset" }))) return;
                        try {
                          const res = await bpApi.resetMonthly(id);
                          notify.ok(res.message || "Reset");
                          setTabData((t) => ({ ...t, monthly: res.data }));
                        } catch (err) {
                          notify.fail(err);
                        }
                      }}
                    >
                      Reset to default
                    </Button>
                  </Flex>
                )}
                {!canEdit && d.rule && <Text fontSize="xs" color="gray.500" mb={3}>{d.rule}</Text>}
                {(d.plan_rows || []).length > 0 && (
                  <Card title="Plan total by month">
                    <DataTable
                      rows={d.plan_rows}
                      rowKey={(r) => r.month}
                      onRowClick={canEdit && d.abs_enabled ? (r) => setModal({ type: "abs-month", item: r }) : undefined}
                      columns={[
                        { key: "label", label: "Month" },
                        { key: "sales_target", label: "Sales Tgt", numeric: true, render: (r) => money(r.sales_target) },
                        { key: "collection_target", label: "Coll. Tgt", numeric: true, render: (r) => money(r.collection_target) },
                        ...(d.abs_enabled
                          ? [
                              { key: "abs_booking_target", label: "ABS Booking Tgt", numeric: true, render: (r) => (<>{money(r.abs_booking_target)}{r.abs_custom ? <Text as="span" fontSize="xs" color="teal.500"> · custom</Text> : null}</>) },
                              { key: "actual_abs_booking", label: "ABS Booked", numeric: true, render: (r) => money(r.actual_abs_booking) },
                              { key: "abs_advance_target", label: "ABS Advance Tgt", numeric: true, render: (r) => money(r.abs_advance_target) },
                              { key: "actual_abs_advance", label: "Advance Recd.", numeric: true, render: (r) => money(r.actual_abs_advance) },
                            ]
                          : []),
                      ]}
                    />
                    {d.abs_enabled && <Text fontSize="xs" color="gray.500" mt={2}>ABS advances are receipts: they are already inside collection and are shown here only as a separate KPI.</Text>}
                  </Card>
                )}
                {(d.groups || []).length === 0 && <Empty text="No monthly plan yet." />}
                {(d.groups || []).map((g) => (
                  <Card key={g.distributor_line_id} title={g.name}>
                    <DataTable
                      rows={g.rows}
                      rowKey={(r) => r.month}
                      onRowClick={canEdit ? (r) => setModal({ type: "month", item: r, extra: g }) : undefined}
                      columns={[
                        { key: "label", label: "Month", render: (r) => (<>{r.label}{r.is_custom ? <Text as="span" fontSize="xs" color="teal.500"> · custom</Text> : null}</>) },
                        { key: "sales_target", label: "Sales Tgt", numeric: true, render: (r) => money(r.sales_target) },
                        { key: "collection_target", label: "Coll. Tgt", numeric: true, render: (r) => money(r.collection_target) },
                        { key: "actual_sales", label: "Act. Sales", numeric: true, render: (r) => money(r.actual_sales) },
                        { key: "actual_collection", label: "Act. Coll.", numeric: true, render: (r) => money(r.actual_collection) },
                        { key: "pct", label: "Achv", render: (r) => <PerfBadge performance={r.performance} percent={r.achievement_percent} /> },
                      ]}
                    />
                  </Card>
                ))}
              </>
            ))}
          </TabPanel>

          {/* Collection */}
          <TabPanel px={0}>
            {tabBody("collection", (d) => (
              <>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
                  <Kpi label="Collection Target" value={money(d.summary?.collection_target)} />
                  <Kpi label="Achieved" value={money(d.summary?.achieved)} color="green.600" />
                  <Kpi label="Collection Gap" value={money(d.summary?.collection_gap)} color="red.500" />
                  <Kpi label="Achievement %" value={pct(d.summary?.achievement_percent)} />
                </SimpleGrid>
                <DataTable
                  rows={d.distributors}
                  emptyText="No distributor collection targets."
                  columns={[
                    { key: "name", label: "Distributor" },
                    { key: "target", label: "Target", numeric: true, render: (r) => money(r.target) },
                    { key: "actual", label: "Actual", numeric: true, render: (r) => money(r.actual) },
                    { key: "outstanding", label: "Outstanding", numeric: true, render: (r) => <Text as="span" color={r.max_outstanding > 0 && r.outstanding > r.max_outstanding ? "red.500" : undefined}>{money(r.outstanding)}</Text> },
                    { key: "max_outstanding", label: "Max Allowed", numeric: true, render: (r) => money(r.max_outstanding) },
                    { key: "pct", label: "Achv", render: (r) => <PerfBadge performance={r.performance} percent={r.achievement_percent} /> },
                  ]}
                />
              </>
            ))}
          </TabPanel>

          {/* Achievement */}
          <TabPanel px={0}>
            {tabBody("achievement", (d) => (
              <>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3}>
                  <Kpi label="Target" value={money(d.target)} />
                  <Kpi label="Achieved" value={money(d.achieved)} color="green.600" />
                  <Kpi label="Achievement" value={pct(d.achievement_percent)} />
                </SimpleGrid>
                <Alert status={d.performance?.tone === "green" ? "success" : d.performance?.tone === "orange" ? "warning" : "error"} borderRadius="10px" mb={4} fontSize="sm">
                  <AlertIcon />
                  Status: {d.performance?.label} · {pct(d.elapsed_percent)} of the plan period has elapsed
                </Alert>
                <DataTable
                  rows={d.distributors}
                  emptyText="No distributors in this plan."
                  columns={[
                    { key: "name", label: "Distributor" },
                    { key: "target", label: "Target", numeric: true, render: (r) => money(r.target) },
                    { key: "actual", label: "Actual", numeric: true, render: (r) => money(r.actual) },
                    { key: "pct", label: "Status", render: (r) => <PerfBadge performance={r.performance} percent={r.achievement_percent} /> },
                  ]}
                />
              </>
            ))}
          </TabPanel>

          {/* Variance */}
          <TabPanel px={0}>
            {tabBody("variance", (d) => (
              <>
                <Card title="Overall Variance">
                  <InfoGrid
                    items={[
                      ["Target", money(d.overall?.target)],
                      ["Actual", money(d.overall?.actual)],
                      ["Variance", signedMoney(d.overall?.variance)],
                      ["Achievement", pct(d.overall?.achievement_percent)],
                      ["Status", d.overall?.performance?.label],
                    ]}
                  />
                </Card>
                <DataTable
                  rows={d.distributors}
                  emptyText="No distributors in this plan."
                  columns={[
                    { key: "name", label: "Distributor" },
                    { key: "target", label: "Target", numeric: true, render: (r) => money(r.target) },
                    { key: "actual", label: "Actual", numeric: true, render: (r) => money(r.actual) },
                    { key: "variance", label: "Variance", numeric: true, render: (r) => <Text as="span" color={r.variance < 0 ? "red.500" : "green.600"}>{signedMoney(r.variance)}</Text> },
                    { key: "pct", label: "Status", render: (r) => <PerfBadge performance={r.performance} percent={r.achievement_percent} /> },
                    { key: "open", label: "Open Actions", render: (r) => r.open_corrective_actions },
                    {
                      key: "act",
                      label: "",
                      render: (r) =>
                        actions.can_add_corrective_action && r.needs_corrective_action ? (
                          <Button size="xs" colorScheme="teal" variant="outline" onClick={() => setModal({ type: "corrective", extra: r.line_id })}>
                            + Corrective Action
                          </Button>
                        ) : null,
                    },
                  ]}
                />
              </>
            ))}
          </TabPanel>

          {/* Corrective actions */}
          <TabPanel px={0}>
            {tabBody("corrective-actions", (rows) => (
              <>
                {actions.can_add_corrective_action && (
                  <Button size="sm" colorScheme="teal" mb={3} onClick={() => setModal({ type: "corrective" })}>
                    + Log Gap & Corrective Action
                  </Button>
                )}
                <DataTable
                  rows={rows}
                  emptyText="No corrective actions logged."
                  onRowClick={actions.can_add_corrective_action ? (r) => setModal({ type: "corrective", item: r }) : undefined}
                  columns={[
                    { key: "scope_label", label: "Scope" },
                    { key: "reason", label: "Reason" },
                    { key: "action_required", label: "Action", wrap: true },
                    { key: "responsible_user_name", label: "Owner" },
                    { key: "due_date", label: "Due", render: (r) => fmtDate(r.due_date) },
                    { key: "priority", label: "Priority", render: (r) => <StatusBadge status={r.priority} /> },
                    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
                  ]}
                />
              </>
            ))}
          </TabPanel>

          {/* Revisions */}
          <TabPanel px={0}>
            {tabBody("revisions", (rows) => (
              <>
                <Text fontSize="xs" color="gray.500" mb={3}>
                  Every final approval stores the plan's targets as a revision. Revisions never change; Target Sheets are signed on a revision.
                </Text>
                <DataTable
                  rows={rows}
                  rowKey={(r) => r.revision_no}
                  emptyText="No approved revision yet."
                  onRowClick={async (r) => {
                    try {
                      setRevision(await bpApi.planRevision(id, r.revision_no));
                    } catch (err) {
                      notify.fail(err);
                    }
                  }}
                  columns={[
                    { key: "revision_no", label: "Revision", render: (r) => `Revision ${r.revision_no}${r.revision_no === Number(plan.revision_no) ? " (current)" : ""}` },
                    { key: "sales_target", label: "Sales Target", numeric: true, render: (r) => money(r.sales_target) },
                    { key: "collection_target", label: "Collection Target", numeric: true, render: (r) => money(r.collection_target) },
                    { key: "approved_by_name", label: "Approved By", render: (r) => r.approved_by_name || "—" },
                    { key: "approved_at", label: "Approved", render: (r) => fmtDateTime(r.approved_at) },
                    { key: "remark", label: "Remark", wrap: true, render: (r) => r.remark || "—" },
                  ]}
                />
                {revision && (
                  <Card title={`Revision ${revision.revision_no} — monthly targets`} right={<Button size="xs" onClick={() => setRevision(null)}>Close</Button>}>
                    <DataTable
                      rows={revision.snapshot?.monthly || []}
                      rowKey={(r) => r.month}
                      columns={[
                        { key: "label", label: "Month" },
                        { key: "sales_target", label: "Sales", numeric: true, render: (r) => money(r.sales_target) },
                        { key: "collection_target", label: "Collection", numeric: true, render: (r) => money(r.collection_target) },
                        ...(tg.abs_enabled
                          ? [
                              { key: "abs_booking_target", label: "ABS Booking", numeric: true, render: (r) => money(r.abs_booking_target) },
                              { key: "abs_advance_target", label: "ABS Advance", numeric: true, render: (r) => money(r.abs_advance_target) },
                            ]
                          : []),
                      ]}
                    />
                    <Text fontSize="sm" fontWeight="700" mt={3} mb={2}>Distributors</Text>
                    <DataTable
                      rows={revision.snapshot?.distributors || []}
                      rowKey={(r) => r.line_id}
                      columns={[
                        { key: "name", label: "Distributor" },
                        { key: "annual_target", label: "Annual", numeric: true, render: (r) => money(r.annual_target) },
                        { key: "season_sales_target", label: "Season Sales", numeric: true, render: (r) => money(r.season_sales_target) },
                        { key: "season_collection_target", label: "Season Coll.", numeric: true, render: (r) => money(r.season_collection_target) },
                      ]}
                    />
                  </Card>
                )}
              </>
            ))}
          </TabPanel>

          {/* Target sheets built on this plan */}
          <TabPanel px={0}>
            {tabBody("target-sheets", (rows) => (
              <DataTable
                rows={rows}
                emptyText="No Target Sheet uses this plan yet."
                onRowClick={(r) => navigate(`/business-plan/target-sheets/${r.id}`)}
                columns={[
                  { key: "sheet_code", label: "Sheet" },
                  { key: "employee_name", label: "Employee" },
                  { key: "quarter", label: "Quarter", render: (r) => `Q${r.quarter} ${r.financial_year || ""}` },
                  { key: "version_no", label: "Version", render: (r) => `v${r.version_no}` },
                  { key: "plan_revision_no", label: "Signed on", render: (r) => `Revision ${r.plan_revision_no}` },
                  { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
                  { key: "targets_outdated", label: "", render: (r) => (r.targets_outdated ? <StatusBadge status="RETURNED" label="New targets to acknowledge" /> : null) },
                ]}
              />
            ))}
          </TabPanel>

          {/* Approval history */}
          <TabPanel px={0}>
            <ApprovalSteps approval={approval} showHistory={false} />
            {tabBody("approval-history", (rows) => (
              <DataTable
                rows={rows}
                emptyText="No approval steps yet."
                columns={[
                  { key: "created_at", label: "When", render: (r) => fmtDateTime(r.created_at) },
                  { key: "action", label: "Step", render: (r) => <StatusBadge status={r.to_status} label={actionLabel(r.action)} /> },
                  { key: "acted_by_name", label: "By", render: (r) => `${r.acted_by_name || "—"}${r.acted_by_role ? ` (${r.acted_by_role})` : ""}` },
                  { key: "detail", label: "Level", wrap: true, render: (r) => r.detail || "—" },
                  { key: "remark", label: "Comment", wrap: true, render: (r) => r.remark || "—" },
                ]}
              />
            ))}
          </TabPanel>

          {/* Audit log */}
          <TabPanel px={0}>
            {tabBody("audit-log", (rows) => (
              <DataTable
                rows={rows}
                emptyText="Nothing recorded yet."
                columns={[
                  { key: "created_at", label: "When", render: (r) => fmtDateTime(r.created_at) },
                  { key: "action", label: "Action", render: (r) => actionLabel(r.action) },
                  { key: "detail", label: "Detail", wrap: true, render: (r) => [r.detail, r.remark].filter(Boolean).join(" · ") || "—" },
                  { key: "acted_by_name", label: "By" },
                ]}
              />
            ))}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* ---------- modals ---------- */}
      <BpPlanFormModal isOpen={modal?.type === "header"} onClose={() => setModal(null)} plan={plan} onSaved={refresh} />
      <DevelopmentModal isOpen={modal?.type === "development"} onClose={() => setModal(null)} plan={plan} overview={overview} onSaved={refresh} />
      <DistributorModal isOpen={modal?.type === "distributor"} onClose={() => setModal(null)} plan={plan} line={modal?.type === "distributor" ? modal.item : null} onSaved={refresh} />
      <RetailerModal isOpen={modal?.type === "retailer"} onClose={() => setModal(null)} plan={plan} line={modal?.type === "retailer" ? modal.item : null} canEdit={canEdit} onSaved={refresh} />
      <ProductModal isOpen={modal?.type === "product"} onClose={() => setModal(null)} plan={plan} line={modal?.type === "product" ? modal.item : null} onSaved={refresh} />
      <CorrectiveModal
        isOpen={modal?.type === "corrective"}
        onClose={() => setModal(null)}
        plan={plan}
        action={modal?.type === "corrective" ? modal.item : null}
        presetLineId={modal?.type === "corrective" ? modal.extra : null}
        distributors={tabData.distributors || []}
        onSaved={refresh}
      />
      <AbsMonthModal
        isOpen={modal?.type === "abs-month"}
        onClose={() => setModal(null)}
        plan={plan}
        row={modal?.type === "abs-month" ? modal.item : null}
        onSaved={(d) => setTabData((t) => ({ ...t, monthly: d }))}
      />
      <MonthModal
        isOpen={modal?.type === "month"}
        onClose={() => setModal(null)}
        plan={plan}
        row={modal?.type === "month" ? modal.item : null}
        group={modal?.type === "month" ? modal.extra : null}
        onSaved={(d) => setTabData((t) => ({ ...t, monthly: d }))}
      />
    </Box>
  );
};

export default BpPlanDetail;