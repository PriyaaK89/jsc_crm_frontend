import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Text,
  Avatar,
  Divider,
  Progress,
  Image,
  SimpleGrid,
  IconButton,
  Button,
  useDisclosure,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { ViewIcon, CloseIcon, RepeatIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import CustomDatePicker from "../common/CustomDatepicker";

/* ------------------------------------------------------------------ */
/* Constants + helpers                                                 */
/* ------------------------------------------------------------------ */

const TYPE_ORDER = ["HOTEL", "BUS_TRAIN_TOLL", "PETROL_DIESEL", "OTHER"];

const TYPE_META = {
  HOTEL: { label: "Hotel", icon: "🏨", color: "purple" },
  BUS_TRAIN_TOLL: { label: "Travel", icon: "🚌", color: "blue" },
  PETROL_DIESEL: { label: "Petrol", icon: "⛽", color: "orange" },
  OTHER: { label: "Other", icon: "📦", color: "teal" },
};

const STATUS_COLOR = {
  PENDING: "yellow",
  APPROVED: "green",
  REJECTED: "red",
};

const LABEL_OVERRIDES = {
  AUTO_CAB: "Auto / Cab",
  UPI: "UPI",
};

// "today" in India (matches the backend), not UTC
const todayIST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const isIso = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}/.test(s);

const parseYMD = (s) => {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// DatePicker may hand back a Date object or a string
const toDateStr = (d) => {
  if (!d) return "";
  if (d instanceof Date) return toYMD(d);
  return d;
};

const shiftDays = (ymd, delta) => {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + delta);
  return toYMD(d);
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = isIso(value) ? parseYMD(value) : new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const daysBetween = (start, end) => {
  if (!isIso(start) || !isIso(end)) return 1;
  const diff = Math.round((parseYMD(end) - parseYMD(start)) / 86400000) + 1;
  return diff > 0 ? diff : 1;
};

const nightsBetween = (checkIn, checkOut) => {
  if (!isIso(checkIn) || !isIso(checkOut)) return null;
  return Math.max(0, Math.round((parseYMD(checkOut) - parseYMD(checkIn)) / 86400000));
};

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const formatType = (type) => type?.replaceAll("_", " ");

const prettify = (v) => {
  if (!v) return "-";
  if (LABEL_OVERRIDES[v]) return LABEL_OVERRIDES[v];
  return String(v)
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const getPercent = (used, total) => (total ? Math.round((used / total) * 100) : 0);

const getColor = (percent) => {
  if (percent <= 50) return "green";
  if (percent <= 80) return "yellow";
  return "red";
};

// Turns an entry's `details` object into label/value rows, per expense type
const getDetailRows = (item) => {
  const d = item.details || {};

  // entries created before the new fields existed have no details at all
  const hasAny = Object.values(d).some((v) => v !== null && v !== undefined && v !== "");
  if (!hasAny) return [];

  switch (item.expense_type) {
    case "HOTEL": {
      const nights = nightsBetween(d.check_in_date, d.check_out_date);
      return [
        { label: "Hotel", value: d.hotel_name || "-" },
        { label: "City", value: d.city || "-" },
        { label: "Check-in", value: formatDate(d.check_in_date) },
        { label: "Check-out", value: formatDate(d.check_out_date) },
        {
          label: "Stay",
          value:
            nights === null
              ? "-"
              : nights === 0
              ? "Same day"
              : `${nights} night${nights > 1 ? "s" : ""}`,
        },
        { label: "Payment", value: prettify(d.payment_mode) },
      ];
    }

    case "BUS_TRAIN_TOLL":
      return [
        { label: "Mode", value: prettify(d.travel_mode) },
        { label: "Route", value: `${d.from_location || "-"} → ${d.to_location || "-"}` },
      ];

    case "PETROL_DIESEL": {
      const liters = parseFloat(d.fuel_liters);
      const amount = parseFloat(item.amount);
      const rate = liters > 0 && amount > 0 ? `₹${(amount / liters).toFixed(2)} / L` : "-";
      return [
        { label: "Vehicle", value: prettify(d.vehicle_type) },
        { label: "Fuel", value: prettify(d.fuel_type) },
        { label: "Odometer", value: d.odometer_km != null ? `${d.odometer_km} km` : "-" },
        { label: "Liters", value: d.fuel_liters != null ? `${d.fuel_liters} L` : "-" },
        { label: "Rate", value: rate },
      ];
    }

    case "OTHER":
      return [{ label: "Category", value: prettify(d.category) }];

    default:
      return [];
  }
};

/* ------------------------------------------------------------------ */
/* Small presentational components (OUTSIDE the modal so they don't    */
/* remount on every render)                                            */
/* ------------------------------------------------------------------ */

const SummaryCard = ({ type, summary, days }) => {
  const meta = TYPE_META[type];
  const perDay = parseFloat(summary?.[type]?.allocated_amount || 0);
  const used = parseFloat(summary?.[type]?.used_amount || 0);
  const budget = perDay * days;
  const left = Math.max(budget - used, 0);
  const percent = getPercent(used, budget);
  const overBudget = used > budget;

  return (
    <Box p={4} borderRadius="12px" bg="gray.50" border="1px solid" borderColor="gray.100">
      <Flex justify="space-between" mb={2} align="center">
        <Flex align="center" gap={2}>
          <Text fontWeight="600">
            {meta.icon} {meta.label}
          </Text>
          {overBudget && (
            <Badge colorScheme="red" fontSize="10px">
              Over budget
            </Badge>
          )}
        </Flex>
        <Text fontSize="sm" color="gray.500">
          {percent}%
        </Text>
      </Flex>

      <Progress
        value={Math.min(percent, 100)}
        size="sm"
        borderRadius="6px"
        colorScheme={getColor(percent)}
      />

      <Flex justify="space-between" mt={2} fontSize="xs" color="gray.600">
        <Text>Budget: {formatINR(budget)}</Text>
        <Text>Used: {formatINR(used)}</Text>
        <Text>Left: {formatINR(left)}</Text>
      </Flex>

      {days > 1 && (
        <Text fontSize="10px" color="gray.400" mt={1}>
          {formatINR(perDay)}/day × {days} days
        </Text>
      )}
    </Box>
  );
};

const DetailGrid = ({ rows }) => (
  <SimpleGrid columns={2} spacing={2} mt={2} p={2} bg="gray.50" borderRadius="8px">
    {rows.map((row) => (
      <Box key={row.label} gridColumn={row.label === "Route" ? "span 2" : undefined}>
        <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="0.4px">
          {row.label}
        </Text>
        <Text fontSize="12px" fontWeight="500" color="gray.700" wordBreak="break-word">
          {row.value}
        </Text>
      </Box>
    ))}
  </SimpleGrid>
);

const EntryCard = ({ item, onPreview }) => {
  const meta = TYPE_META[item.expense_type] || {
    label: formatType(item.expense_type),
    icon: "🧾",
    color: "gray",
  };
  const rows = getDetailRows(item);
  const isHold = item.hold_status === "HOLD";

  return (
    <Box
      borderRadius="12px"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
      bg="white"
      _hover={{ boxShadow: "md" }}
      transition="0.2s"
    >
      <Box position="relative" h="150px" bg="gray.100">
        {item.bill_url ? (
          <>
            <Image
              src={item.bill_url}
              alt="Bill"
              objectFit="cover"
              w="100%"
              h="150px"
              loading="lazy"
              cursor="pointer"
              onClick={() => onPreview(item.bill_url)}
              fallback={
                <Flex h="150px" align="center" justify="center" color="gray.400" fontSize="sm">
                  Bill unavailable
                </Flex>
              }
            />
            <IconButton
              aria-label="Preview bill"
              icon={<ViewIcon />}
              size="sm"
              position="absolute"
              top="8px"
              right="8px"
              onClick={() => onPreview(item.bill_url)}
              bg="blackAlpha.600"
              color="white"
              _hover={{ bg: "blackAlpha.800" }}
            />
          </>
        ) : (
          <Flex h="150px" align="center" justify="center" color="gray.400" fontSize="sm">
            No bill uploaded
          </Flex>
        )}

        <Box
          position="absolute"
          bottom="8px"
          left="8px"
          bg="blackAlpha.700"
          color="white"
          px={2}
          py={1}
          borderRadius="6px"
          fontSize="xs"
          fontWeight="600"
        >
          {formatINR(item.amount)}
        </Box>
      </Box>

      <Box p={3}>
        <Flex justify="space-between" align="center" mb={1} gap={2} flexWrap="wrap">
          <Badge colorScheme={meta.color} fontSize="10px">
            {meta.icon} {meta.label}
          </Badge>
          <Flex gap={1}>
            {isHold && (
              <Badge colorScheme="orange" fontSize="10px">
                On Hold
              </Badge>
            )}
            {/* <Badge colorScheme={STATUS_COLOR[item.status] || "gray"} fontSize="10px">
              {item.status}
            </Badge> */}
          </Flex>
        </Flex>

        <Text fontSize="12px" color="gray.500">
          📅 {formatDate(item.expense_date)}
        </Text>

        {rows.length > 0 ? (
          <DetailGrid rows={rows} />
        ) : (
          <Text fontSize="11px" color="gray.400" mt={2}>
            No extra details recorded
          </Text>
        )}

        {item.remarks && (
          <Text fontSize="12px" mt={2} color="gray.600">
            <Text as="span" fontWeight="600">
              {item.expense_type === "OTHER" ? "Description: " : "Remarks: "}
            </Text>
            {item.remarks}
          </Text>
        )}

        {isHold && item.hold_reason && (
          <Box mt={2} p={2} bg="orange.50" borderRadius="6px">
            <Text fontSize="11px" color="orange.700">
              Hold reason: {item.hold_reason}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

const UploadEmpExpenseModal = ({ isOpen, onClose, selectData, initialStart, initialEnd }) => {
  const [rotation, setRotation] = useState(0);
  const [previewImg, setPreviewImg] = useState(null);
  const { isOpen: isPreviewOpen, onOpen, onClose: onPreviewClose } = useDisclosure();

  const [startDate, setStartDate] = useState(todayIST());
  const [endDate, setEndDate] = useState(todayIST());
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null); // fresh data from admin-expense-by-date
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [rangeError, setRangeError] = useState("");

  const requestIdRef = useRef(0);

  const openPreview = (img) => {
    setPreviewImg(img);
    setRotation(0);
    onOpen();
  };

  // fetch fresh, date-scoped data for this employee whenever
  // the modal opens or the admin changes the date range inside it
  const fetchDetail = async (employeeId, start, end) => {
    if (!employeeId || !start || !end) return;

    if (isIso(start) && isIso(end) && start > end) {
      setRangeError("Start date cannot be after end date");
      return;
    }
    setRangeError("");

    const reqId = ++requestIdRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("employee_id", employeeId);
      params.append("start_date", start);
      params.append("end_date", end);
      params.append("limit", 100); // API default is 10 — ask for more so bills aren't hidden

      const url = `${API_ENDPOINTS?.get_employee_expense_by_date}?${params.toString()}`;
      const response = await API.get(url);

      if (reqId !== requestIdRef.current) return; // stale response

      if (response.status === 200) {
        setDetail(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch employee expense detail:", error);
      if (reqId === requestIdRef.current) setDetail(null);
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  };

  // whenever the modal opens with a new employee, reset the range and fetch
  useEffect(() => {
    if (isOpen && selectData?.user_id) {
      const hasInitial = initialStart && initialEnd;
      const s = hasInitial ? initialStart : todayIST();
      const e = hasInitial ? initialEnd : todayIST();
      setStartDate(s);
      setEndDate(e);
      setTypeFilter("ALL");
      setRangeError("");
      fetchDetail(selectData.user_id, s, e);
    }
    if (!isOpen) {
      requestIdRef.current += 1; // drop any in-flight response
      setDetail(null); // clear stale data when modal closes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectData?.user_id]);

  const handleStartChange = (date) => {
    const value = toDateStr(date);
    setStartDate(value);
    fetchDetail(selectData?.user_id, value, endDate);
  };

  const handleEndChange = (date) => {
    const value = toDateStr(date);
    setEndDate(value);
    fetchDetail(selectData?.user_id, startDate, value);
  };

  const applyQuickRange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    fetchDetail(selectData?.user_id, start, end);
  };

  const today = todayIST();
  const quickRanges = [
    { label: "Today", start: today, end: today },
    { label: "Yesterday", start: shiftDays(today, -1), end: shiftDays(today, -1) },
    { label: "Last 7 days", start: shiftDays(today, -6), end: today },
    { label: "This month", start: `${today.slice(0, 8)}01`, end: today },
  ];

  const summary = detail?.summary || {};
  const entries = detail?.entries || [];
  const employeeName = detail?.employee?.name || selectData?.employee_name;

  // budget is a PER-DAY cap, so a multi-day range gets (per-day × number of days)
  const rangeDays = daysBetween(detail?.start_date ?? startDate, detail?.end_date ?? endDate);

  const totalUsed = TYPE_ORDER.reduce(
    (sum, t) => sum + parseFloat(summary?.[t]?.used_amount || 0),
    0
  );
  const totalBudget = TYPE_ORDER.reduce(
    (sum, t) => sum + parseFloat(summary?.[t]?.allocated_amount || 0) * rangeDays,
    0
  );
  const pendingCount = entries.filter((e) => e.status === "PENDING").length;

  const countByType = TYPE_ORDER.reduce((acc, t) => {
    acc[t] = entries.filter((e) => e.expense_type === t).length;
    return acc;
  }, {});

  const visibleEntries =
    typeFilter === "ALL" ? entries : entries.filter((e) => e.expense_type === typeFilter);

  const totalEntries = detail?.pagination?.total ?? entries.length;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="16px" maxH="90vh">
          <Flex
            bg="blue.600"
            color="white"
            px={5}
            py={4}
            justify="space-between"
            align="center"
            borderTopRadius="16px"
          >
            <Box>
              <Text fontWeight="600">Employee Expense Overview</Text>
              <Text fontSize="xs" opacity={0.85}>
                {formatDate(startDate)}
                {startDate !== endDate ? ` – ${formatDate(endDate)}` : ""}
              </Text>
            </Box>
            <ModalCloseButton position="static" color="white" />
          </Flex>

          <ModalBody p={5} overflowY="auto">
            {selectData ? (
              <>
                <Flex align="center" mb={4}>
                  <Avatar name={employeeName} mr={3} />
                  <Box>
                    <Text fontWeight="600">{employeeName}</Text>
                    <Text fontSize="xs" color="gray.400">
                      Expense Summary
                    </Text>
                  </Box>
                </Flex>

                {/* Date range — lets admin drill into any specific day/range */}
                <Flex gap={3} mb={2} flexWrap="wrap">
                  <Box flex="1" minW="140px">
                    <CustomDatePicker
                      label="Start Date"
                      name="detail_start"
                      value={startDate}
                      onChange={handleStartChange}
                    />
                  </Box>
                  <Box flex="1" minW="140px">
                    <CustomDatePicker
                      label="End Date"
                      name="detail_end"
                      value={endDate}
                      onChange={handleEndChange}
                    />
                  </Box>
                </Flex>

                <Flex gap={2} mb={2} flexWrap="wrap">
                  {quickRanges.map((r) => {
                    const active = startDate === r.start && endDate === r.end;
                    return (
                      <Button
                        key={r.label}
                        size="xs"
                        variant={active ? "solid" : "outline"}
                        colorScheme="blue"
                        onClick={() => applyQuickRange(r.start, r.end)}
                      >
                        {r.label}
                      </Button>
                    );
                  })}
                </Flex>

                {rangeError && (
                  <Text fontSize="12px" color="red.500" mb={2}>
                    {rangeError}
                  </Text>
                )}

                <Divider my={4} />

                {loading ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="lg" />
                  </Flex>
                ) : (
                  <>
             

                    {/* Per-type summary cards */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {TYPE_ORDER.map((type) => (
                        <SummaryCard key={type} type={type} summary={summary} days={rangeDays} />
                      ))}
                    </SimpleGrid>

                    {/* Entries */}
                    {entries.length > 0 ? (
                      <Box mt={6}>
                        <Text fontWeight="600" mb={3}>
                          Expense Bills ({formatDate(startDate)} – {formatDate(endDate)})
                        </Text>

                        <Flex gap={2} mb={4} flexWrap="wrap">
                          <Button
                            size="xs"
                            variant={typeFilter === "ALL" ? "solid" : "outline"}
                            colorScheme="blue"
                            onClick={() => setTypeFilter("ALL")}
                          >
                            All ({entries.length})
                          </Button>
                          {TYPE_ORDER.map((t) => (
                            <Button
                              key={t}
                              size="xs"
                              variant={typeFilter === t ? "solid" : "outline"}
                              colorScheme={TYPE_META[t].color}
                              isDisabled={countByType[t] === 0}
                              onClick={() => setTypeFilter(t)}
                            >
                              {TYPE_META[t].icon} {TYPE_META[t].label} ({countByType[t]})
                            </Button>
                          ))}
                        </Flex>

                        {totalEntries > entries.length && (
                          <Text fontSize="12px" color="orange.500" mb={3}>
                            Showing the first {entries.length} of {totalEntries} bills. Narrow the
                            date range to see the rest.
                          </Text>
                        )}

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {visibleEntries.map((item) => (
                            <EntryCard key={item.id} item={item} onPreview={openPreview} />
                          ))}
                        </SimpleGrid>
                      </Box>
                    ) : (
                      <Text textAlign="center" color="gray.500" mt={6}>
                        No bills uploaded in this date range
                      </Text>
                    )}
                  </>
                )}
              </>
            ) : (
              <Text textAlign="center">No Data Found</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Image preview modal — unchanged */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            position="relative"
            role="group"
            w="90vw"
            h="80vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <IconButton
              aria-label="Close preview"
              icon={<CloseIcon />}
              position="absolute"
              top="10px"
              left="50%"
              transform="translateX(-50%)"
              zIndex="20"
              borderRadius="full"
              bg="white"
              size="sm"
              opacity={{ base: 1, md: 0 }}
              _groupHover={{ md: { opacity: 1 } }}
              onClick={onPreviewClose}
            />
            <IconButton
              aria-label="Rotate image"
              icon={<RepeatIcon />}
              position="absolute"
              bottom="10px"
              left="50%"
              transform="translateX(-50%)"
              zIndex="20"
              borderRadius="full"
              bg="white"
              size="sm"
              opacity={{ base: 1, md: 0 }}
              _groupHover={{ md: { opacity: 1 } }}
              onClick={() => setRotation((prev) => prev + 90)}
            />
            <Box
              maxW="100%"
              maxH="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              borderRadius="lg"
            >
              <Image
                src={previewImg}
                alt="Preview"
                maxW="80vw"
                maxH="80vh"
                objectFit="contain"
                transform={`rotate(${rotation}deg)`}
                transition="0.3s ease"
                borderRadius="lg"
              />
            </Box>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UploadEmpExpenseModal;