// Additional Discount → Create / Edit request (steps of discount.html: Party → Products →
// Reason → Payment & order → Documents → Review). Every amount shown comes from the server
// (POST /calculate); the server recalculates again when the request is saved.
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, AlertIcon, Box, Button, Flex, FormControl, FormLabel, HStack, IconButton, Input, Select, SimpleGrid,
  Table, TableContainer, Tbody, Td, Text, Textarea, Th, Thead, Tr,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  AttachmentList, ErrorBox, Loading, PageTitle, Section, adrApi, apiError, label, rs, useAdrMe, useAdrToast,
} from "./adrShared";

const STEPS = ["Party", "Products", "Reason", "Payment & order", "Documents", "Review"];
const emptyLine = () => ({ key: Math.random().toString(36).slice(2), stock_item_id: "", qty: "", discount_type: "PERCENT", discount_value: "" });

const AdrRequestForm = () => {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const navigate = useNavigate();
  const notify = useAdrToast();
  const { me, refresh } = useAdrMe();
  const fileRef = useRef();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(null);
  const [parties, setParties] = useState([]);
  const [partySearch, setPartySearch] = useState("");
  const [products, setProducts] = useState([]);
  const [header, setHeader] = useState({
    party_ledger_id: "", reason_id: "", reason_text: "", justification: "",
    competitor_name: "", competitor_price: "", competitor_note: "",
    payment_terms: "", payment_note: "", order_link_type: "", order_reference: "",
  });
  const [lines, setLines] = useState([emptyLine()]);
  const [calc, setCalc] = useState(null);
  const [calcError, setCalcError] = useState(null);
  const [files, setFiles] = useState([]);
  const [existing, setExisting] = useState(null); // edit: { request, attachments }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // masters
  useEffect(() => {
    (async () => {
      try {
        const [fd, prods] = await Promise.all([adrApi.formData(), adrApi.products("")]);
        setForm(fd);
        setProducts(prods || []);
        if (editId) {
          const d = await adrApi.detail(editId);
          if (!d.actions.can_edit) {
            notify.warn(`${d.request.request_no} cannot be edited now (${d.request.status_label}).`);
            navigate(`/additional-discount/requests/${editId}`, { replace: true });
            return;
          }
          const r = d.request;
          setExisting({ request: r, attachments: d.attachments });
          setHeader({
            party_ledger_id: String(r.party_ledger_id), reason_id: r.reason_id ? String(r.reason_id) : "", reason_text: r.reason_text || "",
            justification: r.justification || "", competitor_name: r.competitor_name || "", competitor_price: r.competitor_price ?? "",
            competitor_note: r.competitor_note || "", payment_terms: r.payment_terms || "", payment_note: r.payment_note || "",
            order_link_type: r.order_link_type || "", order_reference: r.order_reference || "",
          });
          setParties([{ id: r.party_ledger_id, ledger_name: r.party_name, state: r.party_state }]);
          setLines(d.items.map((i) => ({ key: String(i.id), stock_item_id: String(i.stock_item_id), qty: String(i.requested_qty), discount_type: i.discount_type, discount_value: String(i.requested_value) })));
          setStep(1);
        }
      } catch (err) {
        setError(apiError(err, "Could not load the form"));
      } finally {
        setLoading(false);
      }
    })();
  }, [editId]); // eslint-disable-line react-hooks/exhaustive-deps

  // party search (own parties; Admin: all)
  useEffect(() => {
    if (editId && existing && existing.request.status !== "DRAFT") return undefined;
    const t = setTimeout(async () => {
      try {
        setParties(await adrApi.parties(partySearch.trim()));
      } catch (err) {
        notify.fail(err, "Could not load parties");
      }
    }, 300);
    return () => clearTimeout(t);
  }, [partySearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // live server calculation
  const filled = useMemo(
    () => lines.filter((l) => l.stock_item_id && Number(l.qty) > 0 && Number(l.discount_value) > 0).map((l) => ({ stock_item_id: Number(l.stock_item_id), qty: Number(l.qty), discount_type: l.discount_type, discount_value: Number(l.discount_value) })),
    [lines],
  );
  useEffect(() => {
    if (!filled.length) {
      setCalc(null);
      setCalcError(null);
      return undefined;
    }
    const t = setTimeout(async () => {
      try {
        setCalc(await adrApi.calculate({ party_ledger_id: header.party_ledger_id || undefined, request_id: editId || undefined, items: filled }));
        setCalcError(null);
      } catch (err) {
        setCalc(null);
        setCalcError(apiError(err, "Could not calculate"));
      }
    }, 350);
    return () => clearTimeout(t);
  }, [filled, header.party_ledger_id, editId]);

  const setH = (k, v) => setHeader((h) => ({ ...h, [k]: v }));
  const setLine = (key, k, v) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, [k]: v } : l)));
  const party = parties.find((p) => String(p.id) === String(header.party_ledger_id));
  const reasons = form ? form.reasons : [];
  const isOther = reasons.some((r) => String(r.id) === String(header.reason_id) && r.reason.toLowerCase() === "other");
  const product = (sid) => products.find((p) => String(p.id) === String(sid));

  const stepError = (s) => {
    if (s >= 0 && !header.party_ledger_id) return "Choose the party";
    if (s >= 1 && (!filled.length || filled.length !== lines.filter((l) => l.stock_item_id || l.qty || l.discount_value).length)) return "Complete every product line (product, quantity and discount)";
    if (s >= 1 && calcError) return calcError;
    if (s >= 2 && !header.reason_id && !header.reason_text.trim()) return "Choose the reason";
    if (s >= 2 && isOther && !header.reason_text.trim()) return "Write the reason";
    if (s >= 2 && header.justification.trim().length < 10) return "Write a justification (at least 10 characters)";
    if (s >= 4 && form && form.settings.require_attachment && !files.length && !(existing && existing.attachments.length)) return "Attach at least one supporting document";
    return null;
  };
  const next = () => {
    const e = stepError(step);
    if (e) return notify.warn(e);
    return setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const body = () => ({
    party_ledger_id: Number(header.party_ledger_id),
    reason_id: header.reason_id ? Number(header.reason_id) : null,
    reason_text: isOther || !header.reason_id ? header.reason_text.trim() || null : null,
    justification: header.justification.trim(),
    competitor_name: header.competitor_name.trim() || null,
    competitor_price: header.competitor_price === "" ? null : Number(header.competitor_price),
    competitor_note: header.competitor_note.trim() || null,
    payment_terms: header.payment_terms || null,
    payment_note: header.payment_note.trim() || null,
    order_link_type: header.order_link_type || null,
    order_reference: header.order_reference.trim() || null,
    items: filled,
  });

  const save = async (submit) => {
    const e = stepError(submit ? STEPS.length - 1 : 1);
    if (e) return notify.warn(e);
    setSaving(true);
    try {
      let r;
      if (editId) r = await adrApi.update(editId, { ...body(), version: existing.request.version });
      else r = await adrApi.create({ ...body(), submit: false });
      if (files.length) await adrApi.addAttachments(r.id, files);
      if (submit) {
        if (existing && existing.request.status === "CLARIFICATION") {
          notify.ok(`${r.request_no} saved. Now reply to the clarification to send it back.`);
          navigate(`/additional-discount/requests/${r.id}`);
          return undefined;
        }
        const fresh = await adrApi.detail(r.id);
        r = await adrApi.submit(r.id, fresh.request.version);
        notify.ok(r.status === "PENDING_RSM" ? `${r.request_no} sent to ${r.rsm_name} (RSM)` : `${r.request_no} sent directly for final approval (no RSM in your reporting line)`);
      } else {
        notify.ok(`${r.request_no} saved`);
      }
      if (refresh) refresh();
      navigate(`/additional-discount/requests/${r.id}`);
    } catch (err) {
      notify.fail(err, "Could not save the request");
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (me && !me.can_create && !editId) return <ErrorBox message="You do not have permission to create additional discount requests." />;
  const lockedParty = !!(existing && existing.request.status !== "DRAFT");

  return (
    <Box>
      <PageTitle
        title={editId ? `Edit ${existing ? existing.request.request_no : ""}` : "Request Additional Discount"}
        subtitle="Step-by-step request — the server calculates every amount"
        right={<Button size="sm" variant="ghost" onClick={() => navigate(-1)}>Back</Button>}
      />
      <Flex mb={6} gap={2} overflowX="auto" pb={1}>
        {STEPS.map((s, i) => (
          <Flex
            key={s}
            align="center"
            gap={2}
            px={3}
            py={1.5}
            borderRadius="full"
            flexShrink={0}
            cursor={i < step ? "pointer" : "default"}
            onClick={() => (i < step ? setStep(i) : undefined)}
            bg={i === step ? "teal.500" : i < step ? "teal.50" : "gray.50"}
            color={i === step ? "white" : i < step ? "teal.700" : "gray.500"}
            border="1px solid"
            borderColor={i <= step ? "teal.200" : "gray.200"}
          >
            <Box w="20px" h="20px" borderRadius="full" bg={i === step ? "whiteAlpha.300" : "white"} fontSize="11px" fontWeight="800" display="flex" alignItems="center" justifyContent="center">
              {i < step ? "✓" : i + 1}
            </Box>
            <Text fontSize="xs" fontWeight="700">{s}</Text>
          </Flex>
        ))}
      </Flex>

      {step === 0 && (
        <Section title="1. Select party">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Search</FormLabel>
              <Input size="sm" value={partySearch} onChange={(e) => setPartySearch(e.target.value)} placeholder="Party name" isDisabled={lockedParty} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Party (your assigned parties)</FormLabel>
              <Select size="sm" value={header.party_ledger_id} onChange={(e) => setH("party_ledger_id", e.target.value)} placeholder="-- Select party --" isDisabled={lockedParty}>
                {parties.map((p) => <option key={p.id} value={p.id}>{p.ledger_name}{p.state ? ` · ${p.state}` : ""}</option>)}
              </Select>
            </FormControl>
          </SimpleGrid>
          {party && (
            <Box mt={4} p={3} bg="gray.50" borderRadius="10px">
              <Text fontWeight="700">{party.ledger_name}</Text>
              <Text fontSize="sm" color="gray.600">{party.state || ""}{party.gst_no ? ` · GSTIN ${party.gst_no}` : ""}{party.employee_name ? ` · ${party.employee_name}` : ""}</Text>
              <Button size="xs" mt={2} variant="link" onClick={() => window.open(`/additional-discount/party-history?party=${party.id}`, "_blank")}>Party discount history →</Button>
            </Box>
          )}
        </Section>
      )}

      {step === 1 && (
        <Section title="2. Products, quantities and additional discount" right={<Text fontSize="xs" color="gray.500">{form.regular_discount_note}</Text>}>
          <TableContainer overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="10px" minW="220px">Product</Th>
                  <Th fontSize="10px" isNumeric>Selling price</Th>
                  <Th fontSize="10px" isNumeric minW="90px">Qty</Th>
                  <Th fontSize="10px" minW="150px">Discount as</Th>
                  <Th fontSize="10px" isNumeric minW="100px">Value</Th>
                  <Th fontSize="10px" isNumeric>₹ / unit</Th>
                  <Th fontSize="10px" isNumeric>Discount</Th>
                  <Th fontSize="10px" isNumeric>Final rate</Th>
                  <Th fontSize="10px" isNumeric>Taxable</Th>
                  <Th fontSize="10px" isNumeric>GST</Th>
                  <Th w="30px" />
                </Tr>
              </Thead>
              <Tbody>
                {lines.map((l) => {
                  const p = product(l.stock_item_id);
                  const c = calc ? calc.lines.find((x) => String(x.stock_item_id) === String(l.stock_item_id)) : null;
                  return (
                    <Tr key={l.key}>
                      <Td>
                        <Select size="sm" value={l.stock_item_id} onChange={(e) => setLine(l.key, "stock_item_id", e.target.value)} placeholder="-- Product --">
                          {products.map((x) => (
                            <option key={x.id} value={x.id} disabled={lines.some((o) => o.key !== l.key && String(o.stock_item_id) === String(x.id))}>{x.item_name}</option>
                          ))}
                        </Select>
                      </Td>
                      <Td isNumeric>{p ? <Box><Text>{rs(p.selling_price)}</Text><Text fontSize="xs" color="gray.500">per {p.unit_symbol || "unit"} · GST {p.gst_percent}%</Text></Box> : "—"}</Td>
                      <Td><Input size="sm" type="number" min={0} value={l.qty} onChange={(e) => setLine(l.key, "qty", e.target.value)} textAlign="right" /></Td>
                      <Td>
                        <Select size="sm" value={l.discount_type} onChange={(e) => setLine(l.key, "discount_type", e.target.value)}>
                          {form.discount_types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </Select>
                      </Td>
                      <Td><Input size="sm" type="number" min={0} step="0.01" value={l.discount_value} onChange={(e) => setLine(l.key, "discount_value", e.target.value)} textAlign="right" placeholder={l.discount_type === "PERCENT" ? "%" : "₹"} /></Td>
                      <Td isNumeric>{c ? rs(c.requested_per_unit) : "—"}</Td>
                      <Td isNumeric>{c ? rs(c.requested_amount) : "—"}</Td>
                      <Td isNumeric>{c ? rs(c.est_final_rate) : "—"}</Td>
                      <Td isNumeric>{c ? rs(c.est_taxable_value) : "—"}</Td>
                      <Td isNumeric>{c ? rs(c.est_gst_value) : "—"}</Td>
                      <Td>
                        <IconButton size="xs" variant="ghost" colorScheme="red" icon={<CloseIcon />} aria-label="Remove line" onClick={() => setLines((ls) => (ls.length === 1 ? [emptyLine()] : ls.filter((x) => x.key !== l.key)))} />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
          <Button size="sm" mt={3} variant="outline" onClick={() => setLines((ls) => [...ls, emptyLine()])}>+ Add product</Button>
          {form.settings.max_discount_pct ? <Text fontSize="xs" color="gray.500" mt={2}>Maximum allowed: {form.settings.max_discount_pct}% of the selling price.</Text> : null}
          {calcError && <Alert status="error" mt={3} borderRadius="8px" fontSize="sm"><AlertIcon />{calcError}</Alert>}
          {calc && (
            <>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={4}>
                <Box p={3} bg="gray.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Gross value</Text><Text fontWeight="800">{rs(calc.totals.gross_value)}</Text></Box>
                <Box p={3} bg="gray.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Regular discount</Text><Text fontWeight="800">{rs(calc.totals.regular_discount_value)}</Text></Box>
                <Box p={3} bg="orange.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Additional discount requested</Text><Text fontWeight="800" color="orange.700">{rs(calc.totals.requested_discount_value)}</Text></Box>
                <Box p={3} bg="gray.50" borderRadius="10px"><Text fontSize="xs" color="gray.500">Total quantity</Text><Text fontWeight="800">{calc.totals.total_qty}</Text></Box>
              </SimpleGrid>
              {calc.in_approval.length > 0 && (
                <Alert status="error" mt={3} borderRadius="8px" fontSize="sm">
                  <AlertIcon />
                  {calc.in_approval.map((c) => `${c.item_name} is already in approval on ${c.request_no}`).join("; ")}. You can save a draft, but it cannot be submitted until that request is decided.
                </Alert>
              )}
              {calc.active_approvals.length > 0 && (
                <Alert status="info" mt={3} borderRadius="8px" fontSize="sm">
                  <AlertIcon />
                  This party already has approved balance: {calc.active_approvals.map((a) => `${a.item_name} ${a.balance_qty} left at ${rs(a.approved_per_unit)}/unit on ${a.request_no}`).join("; ")}.
                </Alert>
              )}
            </>
          )}
        </Section>
      )}

      {step === 2 && (
        <Section title="3. Reason, justification and competitor (information)">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Reason</FormLabel>
              <Select size="sm" value={header.reason_id} onChange={(e) => setH("reason_id", e.target.value)} placeholder="-- Select reason --">
                {reasons.map((r) => <option key={r.id} value={r.id}>{r.reason}</option>)}
              </Select>
            </FormControl>
            {isOther && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Other reason</FormLabel>
                <Input size="sm" value={header.reason_text} onChange={(e) => setH("reason_text", e.target.value)} maxLength={150} />
              </FormControl>
            )}
          </SimpleGrid>
          <FormControl isRequired mt={4}>
            <FormLabel fontSize="sm">Justification</FormLabel>
            <Textarea size="sm" rows={4} value={header.justification} onChange={(e) => setH("justification", e.target.value)} placeholder="Why is this discount needed? Market, volume, commitment…" />
          </FormControl>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
            <FormControl><FormLabel fontSize="sm">Competitor</FormLabel><Input size="sm" value={header.competitor_name} onChange={(e) => setH("competitor_name", e.target.value)} /></FormControl>
            <FormControl><FormLabel fontSize="sm">Competitor price (₹)</FormLabel><Input size="sm" type="number" value={header.competitor_price} onChange={(e) => setH("competitor_price", e.target.value)} /></FormControl>
            <FormControl><FormLabel fontSize="sm">Competitor note</FormLabel><Input size="sm" value={header.competitor_note} onChange={(e) => setH("competitor_note", e.target.value)} /></FormControl>
          </SimpleGrid>
        </Section>
      )}

      {step === 3 && (
        <Section title="4. Payment terms and order link (information only)">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Payment terms</FormLabel>
              <Select size="sm" value={header.payment_terms} onChange={(e) => setH("payment_terms", e.target.value)} placeholder="-- Select --">
                {form.payment_terms.map((p) => <option key={p} value={p}>{label(p)}</option>)}
              </Select>
            </FormControl>
            <FormControl><FormLabel fontSize="sm">Payment note</FormLabel><Input size="sm" value={header.payment_note} onChange={(e) => setH("payment_note", e.target.value)} placeholder="Credit days, cheque details…" /></FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Order link</FormLabel>
              <Select size="sm" value={header.order_link_type} onChange={(e) => setH("order_link_type", e.target.value)} placeholder="-- Select --">
                {form.order_link_types.map((p) => <option key={p} value={p}>{label(p)}</option>)}
              </Select>
            </FormControl>
            <FormControl><FormLabel fontSize="sm">Order reference</FormLabel><Input size="sm" value={header.order_reference} onChange={(e) => setH("order_reference", e.target.value)} /></FormControl>
          </SimpleGrid>
          <Text fontSize="xs" color="gray.500" mt={3}>These fields help the approvers. They never change the routing or the amounts.</Text>
        </Section>
      )}

      {step === 4 && (
        <Section title="5. Supporting documents">
          {existing && <Box mb={3}><Text fontSize="sm" fontWeight="700" mb={1}>Already attached</Text><AttachmentList attachments={existing.attachments} /></Box>}
          <Input ref={fileRef} type="file" multiple display="none" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx" onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files || [])])} />
          <Button size="sm" variant="outline" onClick={() => fileRef.current && fileRef.current.click()}>Choose files</Button>
          <Text fontSize="xs" color="gray.500" mt={2}>PDF, image, Word or Excel · up to {form.settings.max_attachment_mb} MB each · at most {form.settings.max_attachments} per request{form.settings.require_attachment ? " · at least one is required" : ""}</Text>
          {files.map((f, i) => (
            <Flex key={`${f.name}-${i}`} justify="space-between" mt={2} p={2} bg="gray.50" borderRadius="8px">
              <Text fontSize="sm">{f.name} · {Math.round(f.size / 1024)} KB</Text>
              <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setFiles((x) => x.filter((_, k) => k !== i))}>Remove</Button>
            </Flex>
          ))}
        </Section>
      )}

      {step === 5 && (
        <Section title="6. Review and submit">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
            <Box><Text fontSize="xs" color="gray.500">Party</Text><Text fontWeight="700">{party ? party.ledger_name : "—"}</Text></Box>
            <Box><Text fontSize="xs" color="gray.500">Reason</Text><Text fontWeight="700">{isOther ? header.reason_text : (reasons.find((r) => String(r.id) === String(header.reason_id)) || {}).reason || header.reason_text}</Text></Box>
            <Box gridColumn={{ md: "span 2" }}><Text fontSize="xs" color="gray.500">Justification</Text><Text fontSize="sm" whiteSpace="pre-wrap">{header.justification}</Text></Box>
          </SimpleGrid>
          {calc && (
            <TableContainer border="1px solid" borderColor="gray.100" borderRadius="10px">
              <Table size="sm">
                <Thead bg="gray.50"><Tr><Th fontSize="10px">Product</Th><Th fontSize="10px" isNumeric>Qty</Th><Th fontSize="10px" isNumeric>₹/unit</Th><Th fontSize="10px" isNumeric>Discount</Th><Th fontSize="10px" isNumeric>Final rate</Th></Tr></Thead>
                <Tbody>
                  {calc.lines.map((c) => (
                    <Tr key={c.stock_item_id}><Td>{c.item_name}</Td><Td isNumeric>{c.requested_qty}</Td><Td isNumeric>{rs(c.requested_per_unit)}</Td><Td isNumeric>{rs(c.requested_amount)}</Td><Td isNumeric>{rs(c.est_final_rate)}</Td></Tr>
                  ))}
                  <Tr fontWeight="800"><Td>Total</Td><Td isNumeric>{calc.totals.total_qty}</Td><Td /><Td isNumeric>{rs(calc.totals.requested_discount_value)}</Td><Td /></Tr>
                </Tbody>
              </Table>
            </TableContainer>
          )}
          <Alert status="info" mt={4} borderRadius="8px" fontSize="sm">
            <AlertIcon />
            On submit it goes to the RSM in your reporting line for a recommendation, then to final approval (Super Admin / Admin / final approvers). If there is no RSM in your line it goes directly to final approval. Nothing can be used on sales before final approval.
          </Alert>
        </Section>
      )}

      <Flex justify="space-between" mt={2} gap={2} wrap="wrap">
        <Button size="sm" variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} isDisabled={step === 0}>Back</Button>
        <HStack>
          {(!existing || existing.request.status === "DRAFT") && <Button size="sm" variant="outline" onClick={() => save(false)} isLoading={saving} isDisabled={!header.party_ledger_id || !filled.length}>Save draft</Button>}
          {existing && existing.request.status === "CLARIFICATION" && <Button size="sm" variant="outline" onClick={() => save(false)} isLoading={saving}>Save changes</Button>}
          {step < STEPS.length - 1 ? (
            <Button size="sm" colorScheme="teal" onClick={next}>Next</Button>
          ) : (
            <Button size="sm" colorScheme="teal" onClick={() => save(true)} isLoading={saving}>
              {existing && existing.request.status === "CLARIFICATION" ? "Save and go to reply" : "Submit request"}
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default AdrRequestForm;
