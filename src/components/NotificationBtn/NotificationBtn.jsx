import React, { useEffect, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import SalesOrderModal from "../models/transaction-flow/SalesOrderModal";
import AlertTabModal from "../models/transaction-flow/AlertModal";

const NotificationBtn = () => {
    const [counts, setCounts] = useState({
        sales: 0,
        purchase: 0,
        payment: 0,
        receipt: 0,
        credit_note: 0,
        debit_note: 0,
        alert: 0,
    });
    const [salesModalOpen, setSalesModalOpen] = useState(false);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const EWAY_BILL_URL = "https://ewaybillgst.gov.in/";

    useEffect(() => {
        fetchCounts();
    }, []);

const fetchCounts = async () => {
  try {
    const res = await API.get(
      API_ENDPOINTS.GET_ORDER_NOTIFICATION_COUNT
    );

    const result = {
      sales: 0,
      purchase: 0,
      payment: 0,
      receipt: 0,
      credit_note: 0,
      debit_note: 0,
      alert: 0,
    };

    res.data.data.forEach((item) => {
      if (
        item.module_type === "SALES" &&
        item.notification_category === "APPROVAL"
      ) {
        result.sales = item.total;
      }

      if (
        item.notification_category === "STATUS"
      ) {
        result.alert += item.total;
      }

      if (
        item.module_type === "PURCHASE" &&
        item.notification_category === "APPROVAL"
      ) {
        result.purchase = item.total;
      }

      if (
        item.module_type === "PAYMENT" &&
        item.notification_category === "APPROVAL"
      ) {
        result.payment = item.total;
      }

      if (
        item.module_type === "RECEIPT" &&
        item.notification_category === "APPROVAL"
      ) {
        result.receipt = item.total;
      }

      if (
        item.module_type === "CREDIT_NOTE" &&
        item.notification_category === "APPROVAL"
      ) {
        result.credit_note = item.total;
      }

      if (
        item.module_type === "DEBIT_NOTE" &&
        item.notification_category === "APPROVAL"
      ) {
        result.debit_note = item.total;
      }
    });

    setCounts(result);
  } catch (err) {
    console.log(err);
  }
};


    const buttons = [
          { label: "Open MailBox" },
  { label: "Receipt", count: counts.receipt },
  { label: "Payment", count: counts.payment },
  { label: "Debit Note", count: counts.debit_note },
  { label: "Credit Note", count: counts.credit_note },
  { label: "Sale Order", count: counts.sales },
  { label: "Purchase Order", count: counts.purchase },
  { label: "Alert", count: counts.alert },
    { label: "E-Way Bill" },
        { label: "Whatsapp" },
];

    return (
        <Box
            display="flex"
            justifyContent="end"
            gap={{ base: "4px", sm: "4px", md: "7.5px" }}
            flexWrap="wrap"
            mt={5}
            margin={{ base: 1, sm: 1, md: 5 }}>
            <SalesOrderModal
                isOpen={salesModalOpen}
                onClose={() => setSalesModalOpen(false)}
            />

            <AlertTabModal
                isOpen={alertModalOpen}
                onClose={() => setAlertModalOpen(false)}
            />

            {buttons.map((btn, i) => (
                <Box key={i} position="relative">
                    {/* Button */}
                    <Button
                        color="white"
                        px={{ base: "8px", sm: "8px", md: "16px" }}
                        bgGradient="linear(45deg, #325180, #8993b3)"
  transition="transform 0.6s ease-in-out"
  _hover={{
    bgGradient: "linear(45deg, #8993b3, #325180)",
    transform: "translateX(2px)",
    color: "white",
  }}
                       
                        variant="outline"
                        borderRadius="lg"
                        fontSize={{ sm: "11px", base: "11px", md: "12px" }}
                        onClick={() => {
                            if (btn.label === "Sale Order") { setSalesModalOpen(true); }
                            if (btn.label === "Alert") { setAlertModalOpen(true); }
                            if (btn.label === "E-Way Bill") { window.open("https://ewaybillgst.gov.in/", "_blank"); }
                            if(btn.label === "Open MailBox"){window.open("http://jamidaraseeds.com/webmail", "_blank");}
                            if(btn.label === "Whatsapp"){window.open("https://web.whatsapp.com/send", "_blank");}
                        }}
                        fontWeight="500">
                        {btn.label}
                    </Button>

                    {/* Notification Badge */}
                    {btn.count !== undefined && (
                        <Box
                            position="absolute"
                            top="-6px"
                            right="-6px"
                            bg="#e53e77"
                            color="white"
                            borderRadius="full"
                            fontSize="10px"
                            fontWeight="bold"
                            minW="18px"
                            h="18px"
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
