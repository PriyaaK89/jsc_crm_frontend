// Additional Discount on a sales line (Order Voucher create, Sales voucher, approval screen).
// Lists the party's approved lines for this product that can be used today, with their balance
// (GET /additional-discount/eligible). The chosen line is sent as item.adr_request_item_id;
// the server checks party / product / unit / validity / balance and re-prices the order.
// Super-cash sales never use additional discount (props.disabled).
import React, { useEffect, useState } from "react";
import { Badge, Box, Button, Select, Text, Tooltip } from "@chakra-ui/react";
import { adrApi } from "../../services/additionalDiscountApi";

const rs = (v) => `₹${(Number(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// value: adr_request_item_id (or ""); onChange(id, line|null) — line has discount_per_unit
const AdrLinePicker = ({ partyId, stockItemId, value, onChange, disabled, disabledText = "Not available on super-cash sales" }) => {
  const [lines, setLines] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    if (!partyId || !stockItemId || disabled) {
      setLines([]);
      setLoaded(true);
      return undefined;
    }
    adrApi
      .eligible(partyId, stockItemId)
      .then((rows) => alive && setLines(rows || []))
      .catch(() => alive && setLines([]))
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [partyId, stockItemId, disabled]);

  if (disabled) {
    return value ? (
      <Box mt={1}>
        <Text fontSize="10px" color="red.500">{disabledText}</Text>
        <Button size="xs" variant="link" colorScheme="red" onClick={() => onChange("", null)}>Remove additional discount</Button>
      </Box>
    ) : null;
  }
  if (!loaded || (!lines.length && !value)) return null;

  return (
    <Box mt={1}>
      <Tooltip label="Approved additional discount for this party and product. The server checks the balance and validity when the order is saved." hasArrow>
        <Select
          size="xs"
          borderRadius="6px"
          bg="teal.50"
          borderColor="teal.200"
          value={value || ""}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : "";
            onChange(id, lines.find((l) => l.adr_request_item_id === id) || null);
          }}
        >
          <option value="">No additional discount</option>
          {value && !lines.some((l) => String(l.adr_request_item_id) === String(value)) && <option value={value}>Selected approval #{value}</option>}
          {lines.map((l) => (
            <option key={l.adr_request_item_id} value={l.adr_request_item_id}>
              {l.request_no} · {rs(l.discount_per_unit)}/unit · balance {l.balance_qty} · till {l.valid_till}
            </option>
          ))}
        </Select>
      </Tooltip>
      {value ? <Badge colorScheme="teal" fontSize="9px" mt={0.5}>Additional discount applied</Badge> : null}
    </Box>
  );
};

export default AdrLinePicker;
