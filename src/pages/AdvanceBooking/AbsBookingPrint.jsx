// Printable Advance Booking Confirmation slip — given to the dealer / distributor as proof of
// the booking: varieties, booked and confirmed quantity, booking rate, schemes, advance terms
// and the payments received so far.
import React, { useEffect, useState } from "react";
import { Box, Button, Flex, HStack, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { absApi, apiError } from "../../services/absApi";
import { toRecordId } from "../../services/businessPlanApi";
import { ErrorBox, InvalidId, Loading, fmtDate, money, qty } from "./absShared";
import { BOOKING_STATUS } from "./absShared";

const Row = ({ label, children }) => (
  <Flex fontSize="12px" py="2px">
    <Text w="150px" color="gray.600" flexShrink={0}>{label}</Text>
    <Text fontWeight="600">{children || "—"}</Text>
  </Flex>
);

const AbsBookingPrint = () => {
  const { id: rawId } = useParams();
  const id = toRecordId(rawId);
  const navigate = useNavigate();
  const [b, setB] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    absApi.booking(id).then(setB).catch((err) => setError(apiError(err, "Could not load the booking")));
  }, [id]);

  if (!id) return <InvalidId what="booking" />;
  if (error) return <Box p={6}><ErrorBox message={error} /></Box>;
  if (!b) return <Loading />;

  const confirmed = !!b.confirmed_at;
  const posted = (b.payments || []).filter((p) => p.status === "POSTED");
  const totalQty = b.items.reduce((s, i) => s + Number(i.qty || 0), 0);
  const totalConfirmed = b.items.reduce((s, i) => s + Number(i.supply_qty ?? i.qty ?? 0), 0);

  return (
    <Box bg="gray.100" minH="100vh" py={6} sx={{ "@media print": { bg: "white", py: 0 } }}>
      <style>{"@media print { .no-print { display: none !important; } @page { size: A4; margin: 12mm; } }"}</style>
      <HStack className="no-print" justify="center" mb={4}>
        <Button size="sm" variant="outline" onClick={() => navigate(`/advance-booking/bookings/${b.id}`)}>Back</Button>
        <Button size="sm" colorScheme="teal" onClick={() => window.print()}>Print</Button>
      </HStack>
      <Box bg="white" maxW="800px" mx="auto" p={8} boxShadow="sm" sx={{ "@media print": { boxShadow: "none", p: 0 } }}>
        <Flex justify="space-between" align="flex-start" borderBottom="2px solid" borderColor="gray.700" pb={3} mb={4}>
          <Box>
            <Text fontSize="20px" fontWeight="800">Advance Booking {confirmed ? "Confirmation" : "Slip"}</Text>
            <Text fontSize="12px" color="gray.600">{b.season_name}{b.crop_season ? ` · ${b.crop_season}` : ""}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="16px" fontWeight="800">{b.booking_no}</Text>
            <Text fontSize="12px">Date: {fmtDate(b.booking_date)}</Text>
            <Text fontSize="12px" fontWeight="700">{(BOOKING_STATUS[b.status] || [null, b.status])[1]}</Text>
          </Box>
        </Flex>

        <Flex gap={8} mb={4} wrap="wrap">
          <Box flex="1" minW="260px">
            <Text fontSize="11px" fontWeight="800" color="gray.500" mb={1}>BOOKED BY (PARTY)</Text>
            <Row label="Party">{b.party_name}</Row>
            <Row label="Location">{b.party_location}</Row>
            <Row label="GSTIN">{b.party_gstin}</Row>
            <Row label="Delivery address">{b.delivery_address}</Row>
          </Box>
          <Box flex="1" minW="260px">
            <Text fontSize="11px" fontWeight="800" color="gray.500" mb={1}>BOOKING TERMS</Text>
            <Row label="Field officer">{b.booked_by_name}</Row>
            <Row label="Delivery window">{b.requested_delivery_from ? `${fmtDate(b.requested_delivery_from)} – ${fmtDate(b.requested_delivery_to)}` : null}</Row>
            <Row label="Advance required">{money(b.advance_required)}</Row>
            <Row label="Advance due by">{b.advance_due_date ? fmtDate(b.advance_due_date) : null}</Row>
            {confirmed && <Row label="Confirmed on">{fmtDate(b.confirmed_at)}{b.confirmed_by_name ? ` by ${b.confirmed_by_name}` : ""}</Row>}
          </Box>
        </Flex>

        <Table size="sm" variant="simple" mb={4} sx={{ "th, td": { fontSize: "11px", px: 2, borderColor: "gray.300" } }}>
          <Thead>
            <Tr><Th>#</Th><Th>Variety</Th><Th isNumeric>Booked</Th>{confirmed && <Th isNumeric>Confirmed</Th>}<Th isNumeric>Rate</Th><Th isNumeric>Scheme / unit</Th><Th isNumeric>Net rate</Th><Th isNumeric>GST %</Th><Th isNumeric>Amount</Th></Tr>
          </Thead>
          <Tbody>
            {b.items.map((i, n) => (
              <Tr key={i.id}>
                <Td>{n + 1}</Td>
                <Td>{i.item_name}{i.crop_name ? <Text as="span" color="gray.500"> · {i.crop_name}</Text> : null}</Td>
                <Td isNumeric>{qty(i.qty)} {i.unit || ""}</Td>
                {confirmed && <Td isNumeric>{qty(i.supply_qty)}</Td>}
                <Td isNumeric>{money(i.rate)}</Td>
                <Td isNumeric>{Number(i.discount_per_unit) ? money(i.discount_per_unit) : "—"}</Td>
                <Td isNumeric>{money(i.net_rate)}</Td>
                <Td isNumeric>{i.gst_percent}</Td>
                <Td isNumeric>{money(i.amount)}</Td>
              </Tr>
            ))}
            <Tr fontWeight="800">
              <Td /><Td>Total</Td><Td isNumeric>{qty(totalQty)}</Td>{confirmed && <Td isNumeric>{qty(totalConfirmed)}</Td>}<Td /><Td /><Td /><Td /><Td isNumeric>{money(b.net_value)}</Td>
            </Tr>
          </Tbody>
        </Table>

        <Flex justify="flex-end" mb={4}>
          <Box minW="280px" fontSize="12px">
            <Flex justify="space-between"><Text>Gross value</Text><Text>{money(b.gross_value)}</Text></Flex>
            <Flex justify="space-between"><Text>Scheme discount</Text><Text>− {money(b.scheme_discount)}</Text></Flex>
            <Flex justify="space-between" fontWeight="800" borderTop="1px solid" borderColor="gray.300" pt={1}><Text>Booking value (before GST)</Text><Text>{money(b.net_value)}</Text></Flex>
            <Flex justify="space-between"><Text>Advance received</Text><Text>{money(b.advance_received)}</Text></Flex>
            <Flex justify="space-between" color={b.advance_shortfall > 0 ? "red.600" : undefined}><Text>Advance still due</Text><Text>{money(b.advance_shortfall)}</Text></Flex>
          </Box>
        </Flex>

        {posted.length > 0 && (
          <>
            <Text fontSize="11px" fontWeight="800" color="gray.500" mb={1}>ADVANCE RECEIVED</Text>
            <Table size="sm" mb={4} sx={{ "th, td": { fontSize: "11px", px: 2 } }}>
              <Thead><Tr><Th>Date</Th><Th>Mode</Th><Th>Ref.</Th><Th>Receipt no.</Th><Th isNumeric>Amount</Th></Tr></Thead>
              <Tbody>
                {posted.map((p) => (
                  <Tr key={p.id}><Td>{fmtDate(p.collected_on)}</Td><Td>{p.payment_mode}</Td><Td>{p.instrument_no || "—"}</Td><Td>{p.receipt_voucher_no}</Td><Td isNumeric>{money(p.amount)}</Td></Tr>
                ))}
              </Tbody>
            </Table>
          </>
        )}

        <Box fontSize="10.5px" color="gray.700" borderTop="1px solid" borderColor="gray.300" pt={2} mb={10}>
          <Text fontWeight="800" mb={1}>Terms</Text>
          <Text>1. Booking rates are valid for this season and the quantities shown above. Final supply is as confirmed by the company, subject to seed production and certification.</Text>
          <Text>2. GST is charged extra on the invoice as applicable. Scheme benefits apply only on the quantity actually lifted within the delivery window.</Text>
          <Text>3. Advance paid is adjusted against the dispatch invoices. Advance against quantity not supplied by the company is refunded or carried forward.</Text>
          <Text>4. Dispatch is made only after the advance due is received, as per the company's dispatch policy.</Text>
          {b.remarks ? <Text mt={1}>Remarks: {b.remarks}</Text> : null}
        </Box>

        <Flex justify="space-between" fontSize="11px" pt={6}>
          <Text borderTop="1px solid" pt={1} minW="180px" textAlign="center">Party's signature &amp; stamp</Text>
          <Text borderTop="1px solid" pt={1} minW="180px" textAlign="center">Field officer</Text>
          <Text borderTop="1px solid" pt={1} minW="180px" textAlign="center">Authorised signatory</Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default AbsBookingPrint;
