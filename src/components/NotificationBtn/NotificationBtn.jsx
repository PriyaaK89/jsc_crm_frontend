import React, { useEffect, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import NotificationModal from "../models/transaction-flow/NotificationModal";
import AlertTabModal from "../models/transaction-flow/AlertModal";

// Central config: add a new module here and it "just works" everywhere
const NOTIFICATION_MODULES = {
  SALES: {
    label: "Sale Order",
    moduleType: "SALES",
    headerTitle: "Sales Order Notifications",
    emptyTitle: "No sales order notifications",
    routeBase: "sales",
    reviewLabel: "sales order",
  },
  RECEIPT: {
    label: "Receipt",
    moduleType: "RECEIPT",
    headerTitle: "Receipt Notifications",
    emptyTitle: "No receipt notifications",
    routeBase: "receipt",
    reviewLabel: "receipt voucher",
  },
  CREDIT_NOTE: {
    label: "Credit Note",
    moduleType: "CREDIT_NOTE",
    headerTitle: "Credit Note Notifications",
    emptyTitle: "No credit note notifications",
    routeBase: "credit-note",
    reviewLabel: "credit note",
  },
  PURCHASE: {
    label: "Purchase Order",
    moduleType: "PURCHASE",
    headerTitle: "Purchase Order Notifications",
    emptyTitle: "No purchase order notifications",
    routeBase: "purchase",
    reviewLabel: "purchase order",
  },
  DEBIT_NOTE: {
    label: "Debit Note",
    moduleType: "DEBIT_NOTE",
    headerTitle: "Debit Note Notifications",
    emptyTitle: "No debit note notifications",
    routeBase: "debit-note",
    reviewLabel: "debit note",
  },
  PAYMENT: {
    label: "Payment",
    moduleType: "PAYMENT",
    headerTitle: "Payment Notifications",
    emptyTitle: "No payment notifications",
    routeBase: "payment",
    reviewLabel: "payment voucher",
  },
};

const NotificationBtn = () => {
  const [counts, setCounts] = useState({
    sales: 0, purchase: 0, payment: 0, receipt: 0,
    credit_note: 0, debit_note: 0, alert: 0,
  });

  // Single piece of state instead of one boolean per modal
  const [activeModal, setActiveModal] = useState(null); // e.g. "SALES" | "RECEIPT" | null
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await API.get(API_ENDPOINTS.GET_ORDER_NOTIFICATION_COUNT);

      const result = {
        sales: 0, purchase: 0, payment: 0, receipt: 0,
        credit_note: 0, debit_note: 0, alert: 0,
      };

      res.data.data.forEach((item) => {
        if (item.module_type === "SALES" && item.notification_category === "APPROVAL") result.sales = item.total;
        if (item.notification_category === "STATUS") result.alert += item.total;
        if (item.module_type === "PURCHASE" && item.notification_category === "APPROVAL") result.purchase = item.total;
        if (item.module_type === "PAYMENT" && item.notification_category === "APPROVAL") result.payment = item.total;
        if (item.module_type === "RECEIPT" && item.notification_category === "APPROVAL") result.receipt = item.total;
        if (item.module_type === "CREDIT_NOTE" && item.notification_category === "APPROVAL") result.credit_note = item.total;
        if (item.module_type === "DEBIT_NOTE" && item.notification_category === "APPROVAL") result.debit_note = item.total;
      });

      setCounts(result);
    } catch (err) {
      console.log(err);
    }
  };

  const buttons = [
    { label: "Open MailBox" },
    { label: "Receipt", count: counts.receipt, moduleKey: "RECEIPT" },
    { label: "Payment", count: counts.payment, moduleKey: "PAYMENT" },
    { label: "Debit Note", count: counts.debit_note, moduleKey: "DEBIT_NOTE" },
    { label: "Credit Note", count: counts.credit_note, moduleKey: "CREDIT_NOTE" },
    { label: "Sale Order", count: counts.sales, moduleKey: "SALES" },
    { label: "Purchase Order", count: counts.purchase, moduleKey: "PURCHASE" },
    { label: "Alert", count: counts.alert },
    { label: "E-Way Bill" },
    { label: "Whatsapp" },
  ];

  const activeConfig = activeModal ? NOTIFICATION_MODULES[activeModal] : null;

  return (
    <Box
      display="flex"
      justifyContent={{ base: "end", md: "flex-end" }}
      gap={{ base: 1, md: 2 }}
      flexWrap="wrap"
      width="100%"
      maxW="100%"
      mt={5} mb={5}
      p={{ base: 1, md: 3 }}>

      {/* One modal instance, reused for every module */}
      <NotificationModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        moduleType={activeConfig?.moduleType}
        headerTitle={activeConfig?.headerTitle}
        emptyTitle={activeConfig?.emptyTitle}
        routeBase={activeConfig?.routeBase}
        reviewLabel={activeConfig?.reviewLabel}
      />

      <AlertTabModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} />

      {buttons.map((btn, i) => (
        <Box key={i} position="relative">
          <Button
            color="white" height={{ base: "34px", sm: "34px", md: "38px" }}
            px={{ base: "6px", sm: "8px", md: "16px" }}
            bgGradient="linear(45deg, #325180, #8993b3)"
            transition="transform 0.6s ease-in-out"
            _hover={{
              bgGradient: "linear(45deg, #8993b3, #325180)",
              transform: "translateX(2px)",
              color: "white",
            }}
            variant="outline"
            borderRadius="lg"
            fontSize={{ sm: "10px", base: "9px", md: "12px" }}
            onClick={() => {
              if (btn.moduleKey) { setActiveModal(btn.moduleKey); return; }
              if (btn.label === "Alert") { setAlertModalOpen(true); }
              if (btn.label === "E-Way Bill") { window.open("https://ewaybillgst.gov.in/", "_blank"); }
              if (btn.label === "Open MailBox") { window.open("http://jamidaraseeds.com/webmail", "_blank"); }
              if (btn.label === "Whatsapp") { window.open("https://web.whatsapp.com/send", "_blank"); }
            }}
            fontWeight="500">
            {btn.label}
          </Button>

          {btn.count !== undefined && (
            <Box
              position="absolute"
              top={{ base: "-4px", md: "-6px" }}
              right={{ base: "-2px", md: "-6px" }}
              bg="#db336b"
              color="white"
              borderRadius="full"
              fontSize={{ base: "8px", sm: "10px", md: "10px" }}
              fontWeight="bold"
              minW={{ base: "16px", md: "18px" }}
              h={{ base: "16px", md: "18px" }}
              display="flex"
              alignItems="center"
              justifyContent="center">
              {btn.count}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default NotificationBtn;