import React from "react";
import { Box, Grid, Text, Badge, Flex, Image, Center } from "@chakra-ui/react";

const has = (v) => v !== null && v !== undefined && v !== "";

const pretty = (v) =>
  has(v) ? String(v).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : null;

const num = (v) => {
  if (!has(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : String(v);
};

const withUnit = (v, unit) => (has(v) ? `${num(v)}${unit ? ` ${unit}` : ""}` : null);

const fmtDate = (v) => {
  if (!has(v)) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-");
    return `${d}/${m}/${y}`;
  }
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? String(v) : dt.toLocaleDateString("en-IN");
};

const OUTCOME_COLOR = { POSITIVE: "green", NEUTRAL: "yellow", NEGATIVE: "red" };

// [label, (result) => value]
const STAGE_ROWS = {
  1: [
    ["Sowing Date", (r) => fmtDate(r.sowing_date)],
    ["Seed Qty Used", (r) => withUnit(r.qty_used, r.qty_used_unit)],
    ["Sowing Method", (r) => pretty(r.sowing_method)],
    ["Seed Treatment", (r) => r.seed_treatment],
    ["Field Area", (r) => withUnit(r.field_area, r.field_area_unit)],
    ["Irrigation", (r) => pretty(r.irrigation_type)],
    ["Soil Type", (r) => pretty(r.soil_type)],
    ["Germination", (r) => (has(r.germination_pct) ? `${num(r.germination_pct)} %` : null)],
    ["Plant Population", (r) => withUnit(r.plant_population, r.plant_population_unit)],
    ["Early Vigor", (r) => pretty(r.early_vigor)],
    ["Disease / Pest Level", (r) => pretty(r.disease_pest_level)],
    ["Disease / Pest Notes", (r) => r.disease_pest_notes],
  ],
  2: [
    ["Days After Sowing", (r) => num(r.days_after_sowing)],
    ["Crop Stage", (r) => r.crop_stage],
    ["Crop Condition", (r) => pretty(r.crop_condition)],
  ],
  3: [
    ["Harvest Date", (r) => fmtDate(r.harvest_date)],
    ["Yield", (r) => withUnit(r.yield_value, r.yield_unit)],
    ["Final Crop Condition", (r) => r.final_crop_condition],
    ["Harvested Area", (r) => withUnit(r.harvested_area, r.harvested_area_unit)],
    ["Total Production", (r) => withUnit(r.total_production, r.production_unit)],
    ["Satisfaction", (r) => (has(r.satisfaction_rating) ? `${num(r.satisfaction_rating)} / 5` : null)],
    ["Would Use Again", (r) => pretty(r.would_use_again)],
    ["Would Recommend", (r) => pretty(r.would_recommend)],
    ["Purchase Intention", (r) => pretty(r.purchase_intention)],
    ["Expected Next Qty", (r) => withUnit(r.expected_next_qty, r.expected_next_unit)],
  ],
};

const growthDisplay = (g) => {
  if (!has(g.field_value)) return "-";
  if (g.input_type === "BOOLEAN") return g.field_value === "1" ? "Yes" : "No";
  if (g.input_type === "DATE") return fmtDate(g.field_value);
  if (g.input_type === "DROPDOWN") return pretty(g.field_value);
  if (g.input_type === "NUMBER") return withUnit(g.field_value, g.unit);
  return g.field_value;
};

const Field = ({ label, value }) => (
  <Box bg="#f7faf8" border="1px solid #e0e8e2" borderRadius="6px" p={2}>
    <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.3px">{label}</Text>
    <Text fontSize="13px" fontWeight="600" color="gray.800" mt="2px" wordBreak="break-word">{value}</Text>
  </Box>
);

const ResultStagePanel = ({ stage, result }) => {
  if (!result) {
    return (
      <Center py={10} flexDirection="column">
        <Text fontSize="13px" fontWeight="600" color="gray.600">Result {stage} not submitted yet</Text>
        <Text fontSize="12px" color="gray.500" mt={1}>
          {stage === 1
            ? "The employee has not submitted the sowing result for this customer."
            : `Result ${stage - 1} must be submitted first.`}
        </Text>
      </Center>
    );
  }

  const rows = (STAGE_ROWS[stage] || [])
    .map(([label, fn]) => [label, fn(result)])
    .filter(([, v]) => has(v));
  const growth = (result.growth_values || []).filter((g) => has(g.field_value));
  const photos = (result.photo_urls || []).filter(Boolean);

  return (
    <Box>
      <Flex wrap="wrap" gap={3} align="center" mb={3}>
        <Badge colorScheme={OUTCOME_COLOR[result.outcome] || "gray"} px={3} py={1} borderRadius="full" fontSize="11px">
          {pretty(result.outcome)}
        </Badge>
        <Text fontSize="12px" color="gray.600">Date: <b>{fmtDate(result.result_date) || "-"}</b></Text>
        <Text fontSize="12px" color="gray.600">Submitted by: <b>{result.submitted_by_name || "-"}</b></Text>
      </Flex>

      {rows.length > 0 && (
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={2} mb={4}>
          {rows.map(([label, value]) => <Field key={label} label={label} value={value} />)}
        </Grid>
      )}

      {growth.length > 0 && (
        <Box mb={4}>
          <Text fontSize="12px" fontWeight="700" color="#237086" mb={2}>Crop Observations</Text>
          <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={2}>
            {growth.map((g, i) => (
              <Field key={`${g.field_name}-${i}`} label={g.field_name} value={growthDisplay(g)} />
            ))}
          </Grid>
        </Box>
      )}

      {has(result.customer_feedback) && (
        <Box mb={3}>
          <Text fontSize="12px" fontWeight="700" color="#237086" mb={1}>Customer Feedback</Text>
          <Text fontSize="13px" color="gray.700" whiteSpace="pre-wrap">{result.customer_feedback}</Text>
        </Box>
      )}

      {has(result.remarks) && (
        <Box mb={3}>
          <Text fontSize="12px" fontWeight="700" color="#237086" mb={1}>Remarks</Text>
          <Text fontSize="13px" color="gray.700" whiteSpace="pre-wrap">{result.remarks}</Text>
        </Box>
      )}

      {photos.length > 0 && (
        <Box>
          <Text fontSize="12px" fontWeight="700" color="#237086" mb={2}>Photos ({photos.length})</Text>
          <Flex gap={2} wrap="wrap">
            {photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <Image src={url} alt={`Result ${stage} photo ${i + 1}`} boxSize="110px"
                  objectFit="cover" borderRadius="6px" border="1px solid #d0d7de"
                  _hover={{ opacity: 0.85 }} />
              </a>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ResultStagePanel;