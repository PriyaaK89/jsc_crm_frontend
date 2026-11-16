// One employee target sheet, read-only, with Approve / Return for the approver of the
// current level (or an admin). Field keys and table columns match the app's form (ets_form.dart).
//
// Two kinds of sheet:
//   Business Plan targets (target_source PLAN) — the targets come from the employee's approved
//     Business Plan revisions (plan_targets). The employee writes only his commitments, prospects,
//     support required and the declaration. Signed versions are kept; the monthly review compares
//     the targets with CRM transactions.
//   Legacy (sheets made before this change) — typed targets, shown exactly as they were saved.
import React, { useCallback, useEffect, useState } from "react";
import { Alert, AlertIcon, Box, Button, Flex, HStack, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { bpApi, apiError, toRecordId } from "../../services/businessPlanApi";
import {
  ApprovalSteps,
  DataTable,
  ErrorBox,
  InfoGrid,
  InvalidId,
  Loading,
  StatusBadge,
  fmtDate,
  fmtDateTime,
  money,
  pct,
  qty,
  useBpToast,
  useCommentPrompt,
  useConfirm,
} from "./bpShared";

const SECTIONS = [
  ["1. Employment Document Reference", [
    ["company", "Company / Employing Entity"], ["employeeName", "Employee Name"], ["employeeCode", "Employee Code"],
    ["designation", "Designation"], ["hq", "HQ / Territory"], ["doj", "Date of Joining"],
    ["offerDate", "Offer Letter Date"], ["offerRef", "Offer Letter Ref."], ["apptDate", "Appointment / Joining Letter Date"],
    ["apptRef", "Appointment / Joining Letter Ref."], ["agrDate", "Employee Agreement Date"], ["agrRef", "Employee Agreement Ref."],
    ["periodFrom", "Business Plan Period — From"], ["periodTo", "Business Plan Period — To"],
  ]],
  ["2. Territory Status", [
    ["territoryType", "Territory Type"], ["state", "State"], ["districts", "District(s)"], ["hq2", "HQ"],
    ["prevSales", "Previous Year Company Sales (₹)"], ["exDist", "Existing Active Distributors"],
    ["exRet", "Existing Active Retailers"], ["oldOut", "Old Outstanding (₹)"], ["crops", "Major Crops"], ["competitors", "Major Competitors"],
  ]],
  ["8. Annual Business Summary", [
    ["totalSales", "Total Sales Target (₹)"], ["absBooking", "Total ABS Booking Target (₹)"],
    ["absAdvance", "Total ABS Advance Collection (₹)"], ["newDistTarget", "New Active Distributor Target"],
    ["newRetTarget", "New Active Retailer Target"], ["maxOutstanding", "Maximum Closing Outstanding Allowed (₹)"],
  ]],
  ["12. Declaration and Approval", [
    ["signName", "Employee Name / Typed Signature"], ["signDate", "Employee Signature Date"],
    ["mgrName", "Reporting Manager Name / Approval"], ["mgrDate", "Reporting Manager Date"],
    ["apprName", "Authorized Company Approver"], ["apprDate", "Authorized Approver Date"],
  ]],
];

// LEGACY sheets: * = mandatory for all three months of the quarter
const KPIS = [
  ["sales", "Sales Target *"], ["coll", "Current Sales Collection *"], ["old", "Old Outstanding Recovery"], ["tot", "Total Collection"],
  ["absB", "ABS Booking Value *"], ["absA", "ABS Advance Collection"], ["dist", "New Active Distributors"], ["ret", "New Active Retailers"],
  ["dm", "Distributor Meetings"], ["rv", "Retailer / Market Visits"], ["fm", "Farmer / Dealer Meetings"],
];

const TABLES = [
  ["abs", "4. ABS Plan — First 3 Months", [["month", "Month"], ["crop", "Crop"], ["season", "Season"], ["product", "Product / Variety"], ["parties", "No. of Parties"], ["qty", "Qty."], ["unit", "Qty. Unit"], ["absValue", "ABS Value (₹)"], ["advance", "Advance Collection (₹)"]]],
  ["annual", "5. Annual Crop / Product / Variety Business Plan", [["crop", "Crop / Category"], ["product", "Product / Variety"], ["season", "Season"], ["pack", "Pack"], ["qty", "Qty. (packs)"], ["rate", "Avg. Rate / pack (₹)"], ["sales", "Sales Value (₹)"], ["collection", "Collection (₹)"]]],
  ["dist", "6. Distributor Development Plan", [["name", "Distributor / Prospect"], ["location", "Location"], ["type", "Existing / New"], ["stage", "Stage"], ["crop", "Crop / Product"], ["salesTarget", "Sales Target (₹)"], ["absTarget", "ABS Target (₹)"], ["collTarget", "Collection Target (₹)"]]],
  ["ret", "7. Retailer / Market Development Plan", [["name", "Retailer / Market"], ["village", "Village / Location"], ["type", "Existing / New"], ["distributor", "Mapped Distributor"], ["expected", "Expected Business (₹)"]]],
  ["support", "9. Company Support Required", [["item", "Support Required"], ["request", "Employee Request"], ["remarks", "Approved / Remarks"]]],
  ["review", "10. Monthly Performance Review", [["month", "Review Month"], ["kpi", "KPI"], ["target", "Target"], ["actual", "Actual"], ["ach", "Achievement %"], ["reason", "Reason / Corrective Action"]]],
];

// PLAN sheets: what the employee writes
const PLAN_TABLES = [
  ["dist", "6. New Distributor Prospects", [["name", "Prospect"], ["location", "Location"], ["stage", "Stage"], ["crop", "Crop / Product"]]],
  ["ret", "7. New Retailer / Market Prospects", [["name", "Retailer / Market"], ["village", "Village / Location"], ["distributor", "Mapped Distributor"]]],
  ["support", "9. Company Support Required", [["item", "Support Required"], ["request", "Employee Request"], ["remarks", "Approved / Remarks"]]],
];
const COMMITMENTS = [["dm", "Distributor Meetings"], ["rv", "Retailer / Market Visits"], ["fm", "Farmer / Dealer Meetings"]];

const MONTH_KEYS = ["1st Month", "2nd Month", "3rd Month"];

const n = (v) => Number(String(v ?? "").replace(/,/g, "")) || 0;
const hasContent = (row, cols, ignore = []) => cols.some(([k]) => !ignore.includes(k) && String(row[k] ?? "").trim() !== "");

const Section = ({ title, right, children }) => (
  <Box border="1px solid" borderColor="gray.100" borderRadius="12px" p={4} mb={4}>
    <Flex justify="space-between" align="center" mb={3} gap={2} wrap="wrap">
      <Text fontWeight="800" fontSize="sm">{title}</Text>
      {right}
    </Flex>
    {children}
  </Box>
);

// quarter targets from the approved plans (live, or frozen at approval)
const PlanTargets = ({ targets, values }) => {
  if (!targets) return null;
  const kpis = targets.kpis || {};
  const months = (targets.months || []).map((m) => m.label);
  const dev = targets.development || {};
  const third = (x) => Math.round((Number(x) || 0) / 3 * 100) / 100;
  const rows = [
    { key: "sales", label: "Sales Target", cells: kpis.sales || [], money: true },
    { key: "coll", label: "Collection Target", cells: kpis.collection || [], money: true },
    ...(targets.abs_enabled
      ? [
          { key: "absB", label: "ABS Booking Target", cells: kpis.abs_booking || [], money: true },
          { key: "absA", label: "ABS Advance Target (inside collection)", cells: kpis.abs_advance || [], money: true },
        ]
      : []),
    { key: "nd", label: "New Active Distributors", cells: [1, 2, 3].map(() => third(dev.quarter_new_distributor_target)) },
    { key: "nr", label: "New Retailers", cells: [1, 2, 3].map(() => third(dev.quarter_new_retailer_target)) },
    ...COMMITMENTS.map(([k, l]) => ({ key: k, label: `${l} (employee commitment)`, cells: [1, 2, 3].map((m) => values[`kpi.${k}.m${m}`] || "—"), commitment: true })),
  ];
  const fmt = (r, v) => (r.money ? money(v) : r.commitment ? v : qty(v));
  const total = (r) => (r.commitment ? r.cells.reduce((s, x) => s + n(x), 0) : r.cells.reduce((s, x) => s + (Number(x) || 0), 0));
  return (
    <>
      <Section
        title={`3. Quarter Targets from the Business Plan${targets.frozen ? " (signed — frozen at approval)" : " (approved plan revisions)"}`}
        right={targets.frozen && targets.frozen_at ? <Text fontSize="xs" color="gray.500">Frozen {fmtDateTime(targets.frozen_at)}</Text> : null}
      >
        {(targets.plans || []).length === 0 ? (
          <Alert status="warning" borderRadius="10px" fontSize="sm"><AlertIcon />No approved Business Plan covers this quarter yet.</Alert>
        ) : (
          <>
            <DataTable
              rows={targets.plans}
              rowKey={(p) => p.plan_id}
              columns={[
                { key: "plan_code", label: "Plan" },
                { key: "season", label: "Season", render: (p) => `${p.season} ${p.financial_year}` },
                { key: "period", label: "Plan Period", render: (p) => `${fmtDate(p.start_date)} – ${fmtDate(p.end_date)} (${p.plan_months} mo)` },
                { key: "months_in_quarter", label: "Months in this quarter", render: (p) => (p.months_in_quarter || []).length },
                { key: "revision_no", label: "Revision", render: (p) => `Revision ${p.revision_no}${p.in_revision ? " · new revision in progress" : ""}` },
              ]}
            />
            <Box mt={3}>
              <DataTable
                rows={rows}
                rowKey={(r) => r.key}
                columns={[
                  { key: "label", label: "KPI" },
                  ...[0, 1, 2].map((i) => ({ key: `m${i}`, label: months[i] ? `${MONTH_KEYS[i]} (${months[i]})` : MONTH_KEYS[i], numeric: true, render: (r) => fmt(r, r.cells[i]) })),
                  { key: "total", label: "Quarter", numeric: true, render: (r) => fmt(r, total(r)) },
                ]}
              />
            </Box>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Targets are read from the approved Business Plan and cannot be typed on the sheet. A disagreement is raised as a target
              revision request; the targets change only when the plan revision is approved.
            </Text>
          </>
        )}
      </Section>
      {(targets.distributors || []).length > 0 && (
        <Section title="Distributor Targets (from the plan)">
          <DataTable
            rows={targets.distributors.map((d, i) => ({ ...d, __i: i }))}
            rowKey={(d) => d.__i}
            columns={[
              { key: "name", label: "Distributor", render: (d) => (<Box><Text fontWeight="700">{d.name}</Text><Text fontSize="xs" color="gray.500">{d.location}</Text></Box>) },
              { key: "plan_code", label: "Plan", render: (d) => `${d.plan_code} · ${d.season}` },
              { key: "annual_target", label: "Annual", numeric: true, render: (d) => money(d.annual_target) },
              { key: "season_sales_target", label: "Season", numeric: true, render: (d) => money(d.season_sales_target) },
              { key: "quarter_sales_target", label: "Quarter Sales", numeric: true, render: (d) => money(d.quarter_sales_target) },
              { key: "quarter_collection_target", label: "Quarter Collection", numeric: true, render: (d) => money(d.quarter_collection_target) },
              { key: "max_outstanding", label: "Max Outstanding", numeric: true, render: (d) => money(d.max_outstanding) },
            ]}
          />
        </Section>
      )}
      {(targets.products || []).length > 0 && (
        <Section title="5. Product Targets (from the plan)">
          <DataTable
            rows={targets.products.map((x, i) => ({ ...x, __i: i }))}
            rowKey={(x) => x.__i}
            columns={[
              { key: "name", label: "Product / Variety" },
              { key: "crop", label: "Crop", render: (x) => x.crop || "—" },
              { key: "plan_code", label: "Plan", render: (x) => `${x.plan_code} · ${x.season}` },
              { key: "quarter_qty_target", label: "Quarter Qty", numeric: true, render: (x) => qty(x.quarter_qty_target) },
              { key: "quarter_value_target", label: "Quarter Value", numeric: true, render: (x) => money(x.quarter_value_target) },
            ]}
          />
        </Section>
      )}
      {(targets.retailers || []).length > 0 && (
        <Section title="Retailer Targets (from the plan)">
          <DataTable
            rows={targets.retailers.map((x, i) => ({ ...x, __i: i }))}
            rowKey={(x) => x.__i}
            columns={[
              { key: "name", label: "Retailer" },
              { key: "parent_distributor", label: "Under", render: (x) => x.parent_distributor || "—" },
              { key: "plan_code", label: "Plan" },
              { key: "quarter_sales_target", label: "Quarter Target", numeric: true, render: (x) => money(x.quarter_sales_target) },
            ]}
          />
        </Section>
      )}
    </>
  );
};

const Review = ({ review }) => {
  if (!review) return null;
  return (
    <Section title="10. Monthly Performance Review (actuals from CRM transactions)">
      <DataTable
        rows={review.rows.map((r, i) => ({ ...r, __i: i }))}
        rowKey={(r) => r.__i}
        emptyText="No review rows."
        columns={[
          { key: "label", label: "Month" },
          { key: "kpi_label", label: "KPI" },
          { key: "target", label: "Target", numeric: true, render: (r) => (r.target === null ? "—" : r.unit === "money" ? money(r.target) : qty(r.target)) },
          { key: "actual", label: "Actual", numeric: true, render: (r) => (r.unit === "money" ? money(r.actual) : qty(r.actual)) },
          { key: "achievement_percent", label: "Achv", render: (r) => <Text as="span" color={r.gap ? "red.500" : undefined}>{pct(r.achievement_percent)}</Text> },
          { key: "reason", label: "Reason / Corrective Action", wrap: true, render: (r) => (r.reason ? `${r.reason}: ${r.action_required || ""}` : r.gap ? "Not given yet" : "—") },
        ]}
      />
      <Box mt={2}>
        {(review.rules || []).map((x) => (
          <Text key={x} fontSize="xs" color="gray.500">• {x}</Text>
        ))}
        <Text fontSize="xs" color="gray.500">
          • Reported retailer business (employee-entered, not verified): {money(review.reported_retailer_business?.amount)} — not part of any achievement.
        </Text>
      </Box>
    </Section>
  );
};

const BpTargetSheetView = () => {
  // a missing / invalid id never reaches the API
  const params = useParams();
  const id = toRecordId(params.id);
  const navigate = useNavigate();
  const notify = useBpToast();
  const [askComment, commentDialog] = useCommentPrompt();
  const [confirm, confirmDialog] = useConfirm();
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(null);
  const [decidable, setDecidable] = useState(new Set());
  const [version, setVersion] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const s = await bpApi.sheet(id);
      setSheet(s);
      setVersion(null);
      if (!s.is_legacy && s.status === "APPROVED") {
        bpApi.sheetReview(id).then(setReview).catch(() => setReview(null));
      } else {
        setReview(null);
      }
      if (!s.is_legacy && (s.revision_requests || []).some((r) => r.status === "OPEN")) {
        bpApi
          .revisionRequests("pending")
          .then((rows) => setDecidable(new Set((rows || []).filter((r) => r.can_decide).map((r) => r.id))))
          .catch(() => setDecidable(new Set()));
      } else {
        setDecidable(new Set());
      }
    } catch (err) {
      setError(apiError(err, "Could not load the target sheet"));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const back = () => navigate("/business-plan/target-sheets");
  if (!id) return <InvalidId what="target sheet" onBack={back} />;
  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!sheet) return <Loading />;

  const v = sheet.values || {};
  const t = sheet.tables || {};
  const a = sheet.actions || {};
  const legacy = !!sheet.is_legacy;
  const approval = sheet.approval || null;
  const months = sheet.quarter_months || null; // ["Oct 2026", "Nov 2026", "Dec 2026"]
  const monthLabel = (i) => (months ? `${MONTH_KEYS[i]} (${months[i]})` : MONTH_KEYS[i]);
  const approveText = a.final_if_approved ? "Approve (Final)" : a.approval_stage === "MANAGER" ? "Approve (Reporting Manager)" : a.approval_level ? `Approve (Level ${a.approval_level})` : "Approve";
  const pt = sheet.plan_targets;

  const run = async (fn, okText) => {
    setBusy(true);
    try {
      const res = await fn();
      notify.ok(res.message || okText);
      await load();
    } catch (err) {
      notify.fail(err);
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    const comment = await askComment(approveText, {
      required: false,
      placeholder: a.final_if_approved ? "Comment (optional) — this is the final approval" : "Comment (optional) — the sheet then goes to the next approver",
      yes: "Approve",
    });
    if (comment === null) return;
    await run(() => bpApi.approveSheet(id, comment), "Approved");
  };

  const sendBack = async () => {
    const comment = await askComment("Return for changes", { required: true, placeholder: "What should the employee change?", yes: "Return" });
    if (comment === null) return;
    await run(() => bpApi.returnSheet(id, comment), "Returned");
  };

  const rebase = async () => {
    const yes = await confirm(
      "Move to Business Plan targets",
      "The sheet's typed targets are kept unchanged as an archived version. The sheet becomes a Draft that reads the employee's approved Business Plan targets and must be acknowledged and submitted again.",
      { yes: "Move" },
    );
    if (!yes) return;
    await run(() => bpApi.rebaseSheet(id), "Moved");
  };

  const decide = async (rq, decision) => {
    const comment = await askComment(decision === "ACCEPT" ? "Accept revision request" : "Decline revision request", {
      required: decision === "DECLINE",
      placeholder: decision === "ACCEPT" ? "Comment (optional). Then revise the Business Plan." : "Why is the request declined?",
      yes: decision === "ACCEPT" ? "Accept" : "Decline",
      danger: decision === "DECLINE",
    });
    if (comment === null) return;
    await run(() => bpApi.decideRevisionRequest(rq.id, decision, comment), "Done");
  };

  const openVersion = async (no) => {
    try {
      setVersion(await bpApi.sheetVersion(id, no));
    } catch (err) {
      notify.fail(err);
    }
  };

  const kpiTotal = (k) => (k === "tot" ? [1, 2, 3].reduce((s, m) => s + n(v[`kpi.coll.m${m}`]) + n(v[`kpi.old.m${m}`]), 0) : [1, 2, 3].reduce((s, m) => s + n(v[`kpi.${k}.m${m}`]), 0));
  const kpiCell = (k, m) => (k === "tot" ? n(v[`kpi.coll.m${m}`]) + n(v[`kpi.old.m${m}`]) : v[`kpi.${k}.m${m}`] || "—");

  // section 8 of a PLAN sheet: from the plan targets
  const planSummary = pt
    ? [
        ["Quarter Sales Target (₹)", money(pt.summary?.quarter_sales_target)],
        ["Quarter Collection Target (₹)", money(pt.summary?.quarter_collection_target)],
        ["Season Sales Target of the plans (₹)", money(pt.summary?.season_sales_target)],
        ["Annual Sales Target of the plans (₹)", money(pt.summary?.annual_sales_target)],
        ...(pt.abs_enabled
          ? [["Quarter ABS Booking Target (₹)", money(pt.summary?.quarter_abs_booking_target)], ["Quarter ABS Advance Target (₹)", money(pt.summary?.quarter_abs_advance_target)]]
          : []),
        ["New Active Distributor Target (quarter)", qty(pt.development?.quarter_new_distributor_target)],
        ["New Retailer Target (quarter)", qty(pt.development?.quarter_new_retailer_target)],
        ["Maximum Closing Outstanding Allowed (₹)", money(pt.summary?.max_outstanding)],
      ]
    : [];

  return (
    <Box>
      {commentDialog}
      {confirmDialog}
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3} mb={4}>
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="800">
            {sheet.sheet_code} · version {sheet.version_no || 1}
          </Text>
          <Text fontSize="lg" fontWeight="800">{sheet.employee_name} — Employee Target Sheet</Text>
          <Text fontSize="sm" color="gray.500">
            {sheet.quarter ? `${sheet.quarter_label || `Q${sheet.quarter}`} · FY ${sheet.financial_year} (${fmtDate(sheet.period_from)} – ${fmtDate(sheet.period_to)}) · ` : ""}
            Submitted {sheet.submitted_at ? fmtDateTime(sheet.submitted_at) : "—"} · Quarter sales target {money(sheet.total_sales)}
          </Text>
          {approval && approval.status === "IN_PROGRESS" && (
            <Text fontSize="sm" mt={1} fontWeight="700" color="orange.600">
              Approval: Level {approval.current_level} of {approval.total_levels} — pending with {approval.pending_with}
            </Text>
          )}
        </Box>
        <Wrap justify="flex-end">
          <WrapItem><StatusBadge status={legacy ? "LEGACY" : "PLAN"} label={legacy ? "Legacy (typed targets)" : "Business Plan targets"} /></WrapItem>
          <WrapItem><StatusBadge status={sheet.status} label={sheet.status_label} /></WrapItem>
          {a.can_approve && (
            <WrapItem>
              <Button size="sm" colorScheme="green" onClick={approve} isLoading={busy}>{approveText}</Button>
            </WrapItem>
          )}
          {a.can_return && (
            <WrapItem>
              <Button size="sm" colorScheme="orange" variant="outline" onClick={sendBack} isLoading={busy}>Return</Button>
            </WrapItem>
          )}
          {a.can_rebase && (
            <WrapItem>
              <Button size="sm" variant="outline" colorScheme="purple" onClick={rebase} isLoading={busy}>Move to Business Plan targets</Button>
            </WrapItem>
          )}
          <WrapItem><Button size="sm" variant="ghost" onClick={back}>Back</Button></WrapItem>
        </Wrap>
      </Flex>
      {sheet.return_remark && sheet.status === "RETURNED" && (
        <Alert status="warning" borderRadius="10px" mb={4} fontSize="sm"><AlertIcon />Returned: {sheet.return_remark}</Alert>
      )}
      {sheet.targets_outdated && (
        <Alert status="warning" borderRadius="10px" mb={4} fontSize="sm">
          <AlertIcon />
          {sheet.status === "APPROVED"
            ? "The Business Plan was revised after this sheet was signed. The signed version stays unchanged; the employee must acknowledge the new targets in a new version."
            : "The Business Plan was revised after this sheet was submitted. Return it so the employee acknowledges the new targets."}
        </Alert>
      )}
      {legacy && (
        <Alert status="info" borderRadius="10px" mb={4} fontSize="sm">
          <AlertIcon />
          This sheet was made before targets came from the Business Plan. Its typed targets are shown as they were saved.
        </Alert>
      )}
      {!sheet.quarter && (
        <Alert status="info" borderRadius="10px" mb={4} fontSize="sm"><AlertIcon />This sheet was created before quarterly plans; it has no quarter.</Alert>
      )}

      <ApprovalSteps approval={approval} />

      {SECTIONS.slice(0, 2).map(([title, fields]) => (
        <Section key={title} title={title}>
          <InfoGrid items={fields.map(([k, l]) => [l, v[k] || "—"])} />
          {!legacy && title.startsWith("2") && <Text fontSize="xs" color="gray.500" mt={2}>Sales, distributor, retailer and outstanding figures are read from the CRM.</Text>}
        </Section>
      ))}

      {legacy ? (
        <>
          <Section title="3. First 3 Months Business Plan">
            <DataTable
              rows={KPIS.map(([k, l]) => ({ key: k, label: l }))}
              rowKey={(r) => r.key}
              columns={[
                { key: "label", label: "KPI" },
                { key: "m1", label: monthLabel(0), numeric: true, render: (r) => kpiCell(r.key, 1) },
                { key: "m2", label: monthLabel(1), numeric: true, render: (r) => kpiCell(r.key, 2) },
                { key: "m3", label: monthLabel(2), numeric: true, render: (r) => kpiCell(r.key, 3) },
                { key: "total", label: "90-Day Total", numeric: true, render: (r) => kpiTotal(r.key) },
              ]}
            />
            <Text fontSize="xs" color="gray.500" mt={2}>* Mandatory for all three months. ABS = Advance Booking value booked in the month.</Text>
          </Section>
          {TABLES.map(([key, title, cols]) => {
            // default rows (month / item / kpi pre-filled) are hidden when nothing else was entered
            const rows = (t[key] || []).filter((r) => hasContent(r, cols, ["month", "item", "kpi", "type", "stage"]));
            const monthCol = (r) => {
              const i = MONTH_KEYS.indexOf(r.month);
              return i >= 0 && months ? `${r.month} (${months[i]})` : r.month || "—";
            };
            return (
              <Section key={key} title={title}>
                <DataTable
                  rows={rows.map((r, i) => ({ ...r, __i: i, sales: key === "annual" ? money(n(r.qty) * n(r.rate)) : r.sales }))}
                  rowKey={(r) => r.__i}
                  emptyText="Nothing entered."
                  columns={cols.map(([k, l]) => ({
                    key: k,
                    label: l,
                    wrap: true,
                    render: (r) => (key === "abs" && k === "month" ? monthCol(r) : r[k] === undefined || r[k] === "" ? "—" : r[k]),
                  }))}
                />
              </Section>
            );
          })}
        </>
      ) : (
        <>
          <PlanTargets targets={pt} values={v} />
          {PLAN_TABLES.map(([key, title, cols]) => {
            const rows = (t[key] || []).filter((r) => hasContent(r, cols, ["item", "stage"]));
            return (
              <Section key={key} title={title}>
                <DataTable
                  rows={rows.map((r, i) => ({ ...r, __i: i }))}
                  rowKey={(r) => r.__i}
                  emptyText="Nothing entered."
                  columns={cols.map(([k, l]) => ({ key: k, label: l, wrap: true, render: (r) => (r[k] === undefined || r[k] === "" ? "—" : r[k]) }))}
                />
              </Section>
            );
          })}
          <Section title="8. Quarter Business Summary (from the plan)">
            <InfoGrid items={planSummary} />
          </Section>
          <Review review={review} />
          {(sheet.revision_requests || []).length > 0 && (
            <Section title="Target Revision Requests">
              <DataTable
                rows={sheet.revision_requests}
                emptyText="No requests."
                columns={[
                  { key: "created_at", label: "Raised", render: (r) => fmtDateTime(r.created_at) },
                  { key: "plan_code", label: "Plan" },
                  {
                    key: "items",
                    label: "Targets",
                    wrap: true,
                    render: (r) => (r.items || []).map((x) => `${x.label || x.area}: ${x.current || "—"} → ${x.proposed || "—"}`).join("; ") || "—",
                  },
                  { key: "remark", label: "Reason", wrap: true },
                  { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} label={r.status_label} /> },
                  { key: "decision_remark", label: "Decision", wrap: true, render: (r) => (r.decided_by_name ? `${r.decided_by_name}: ${r.decision_remark || "—"}` : "—") },
                  {
                    key: "act",
                    label: "",
                    render: (r) =>
                      r.status === "OPEN" && decidable.has(r.id) ? (
                        <HStack>
                          <Button size="xs" colorScheme="teal" onClick={() => decide(r, "ACCEPT")} isLoading={busy}>Accept</Button>
                          <Button size="xs" variant="outline" colorScheme="red" onClick={() => decide(r, "DECLINE")} isLoading={busy}>Decline</Button>
                        </HStack>
                      ) : null,
                  },
                ]}
              />
              <Text fontSize="xs" color="gray.500" mt={2}>
                Accepting does not change any target. Revise the Business Plan; when the revision is approved the request is resolved and
                the employee acknowledges the new targets.
              </Text>
            </Section>
          )}
        </>
      )}

      {(sheet.versions || []).length > 0 && (
        <Section title="Signed / Archived Versions">
          <DataTable
            rows={sheet.versions}
            rowKey={(x) => x.version_no}
            onRowClick={(x) => openVersion(x.version_no)}
            columns={[
              { key: "version_no", label: "Version", render: (x) => `v${x.version_no}` },
              { key: "target_source", label: "Targets", render: (x) => (x.target_source === "LEGACY" ? "Typed (legacy)" : "Business Plan") },
              { key: "archived_reason", label: "Kept because", render: (x) => ({ APPROVED: "Signed (final approval)", LEGACY_APPROVED: "Legacy sheet (approved) moved to plan targets", LEGACY_REBASE: "Legacy sheet moved to plan targets" }[x.archived_reason] || x.archived_reason) },
              { key: "plan_links", label: "Plan revisions", render: (x) => (x.plan_links || []).map((l) => `#${l.plan_id} r${l.revision_no}`).join(", ") || "—" },
              { key: "approved_by_name", label: "Approved By", render: (x) => (x.approved_by_name ? `${x.approved_by_name}, ${fmtDateTime(x.approved_at)}` : "—") },
            ]}
          />
          {version && (
            <Box mt={3} bg="gray.50" borderRadius="10px" p={3}>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="700" fontSize="sm">Version {version.version_no}</Text>
                <Button size="xs" onClick={() => setVersion(null)}>Close</Button>
              </Flex>
              {version.target_snapshot ? (
                <PlanTargets targets={{ ...version.target_snapshot, frozen: true }} values={version.values || {}} />
              ) : (
                <InfoGrid
                  items={[
                    ["Sales target typed (month 1 / 2 / 3)", [1, 2, 3].map((m) => (version.values || {})[`kpi.sales.m${m}`] || "—").join(" / ")],
                    ["Collection typed (month 1 / 2 / 3)", [1, 2, 3].map((m) => (version.values || {})[`kpi.coll.m${m}`] || "—").join(" / ")],
                    ["Annual product rows", String(((version.tables || {}).annual || []).length)],
                    ["ABS rows", String(((version.tables || {}).abs || []).length)],
                  ]}
                />
              )}
            </Box>
          )}
        </Section>
      )}

      {SECTIONS.slice(legacy ? 2 : 3).map(([title, fields]) => (
        <Section key={title} title={title}>
          <InfoGrid items={fields.map(([k, l]) => [l, k === "totalSales" ? money(sheet.total_sales) : v[k] || "—"])} />
          {title.startsWith("12") && (
            <>
              <Text fontSize="sm" mt={3} color={sheet.acknowledged ? "green.600" : "red.500"} fontWeight="700">
                {sheet.acknowledged
                  ? legacy
                    ? "✓ Employee acknowledged the terms and declaration"
                    : "✓ Employee acknowledged the Business Plan targets, the terms and the declaration"
                  : "Acknowledgement not given"}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={2}>
                Reporting Manager Name / Date are stamped by the system when the reporting manager (level 1) approves.
                Authorized Company Approver / Date are stamped at the final approval (RSM, or Admin / Super Admin).
                They cannot be typed by the employee and are cleared when a returned sheet is resubmitted.
              </Text>
            </>
          )}
        </Section>
      ))}
    </Box>
  );
};

export default BpTargetSheetView;
