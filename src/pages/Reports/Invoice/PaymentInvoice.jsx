import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { useParams } from "react-router-dom";
import { toWords } from "number-to-words";
import stamp_img from "../../../assets/images/stamp_jsc.png"
import jamidara_seeds_logo from "../../../assets/images/jsc_logo_.png"
import { Box, Text, Table, Thead, Tbody, Tr, Td, Th, Divider, Flex, VStack, Img,} from "@chakra-ui/react";

const PaymentInvoice = () => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const { id } = useParams();

  const getPaymentVoucherDetails = async () => {
    try {
      const response = await API.get(
        `${API_ENDPOINTS.GENERATE_PAYMENT_INVOICE}/${id}`
      );

      if (response.status === 200) {
        setPaymentDetails(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPaymentVoucherDetails();
  }, []);

  if (!paymentDetails) {
    return <div>Loading...</div>;
  }

  const { payment, entries } = paymentDetails;

  const amountInWords = `Rupees ${toWords(
    Number(payment.total_amount)
  )} Only`;

  const formattedDate = new Date(payment.payment_date).toLocaleDateString(
    "en-GB"
  );

return (
  <Box bg="white" minH="100vh" fontSize="10px">
    <Box
      maxW="900px"
      mx="auto"
      fontFamily="serif"
      fontSize="13px"
    >
      {/* HEADER */}
      <Box py={2}>
        <img
          src={jamidara_seeds_logo}
          alt="logo"
          style={{
            width: "140px",
          }}
        />
      </Box>

      <Text
        textAlign="center"
        fontSize="15px"
        fontWeight="900"
        color="brown"
        textDecoration="underline" fontFamily="serif"
        mb={2}
      >
        PAYMENT VOUCHER
      </Text>

      {/* COMPANY DETAILS */}
      <Box mb={4}>
        <Text fontFamily="serif"  color="black"fontSize="10px" fontWeight="900">
          JAMIDARA SEEDS CORPORATION
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          P.B. Road Rane Bannure Distric-HAVERI,KARNATAKA
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          REG.ADD. 73,GANESH NAGAR-MURLIPURA JAIPUR
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          Phone no: +919414429966
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          Email: jamidaraseedscorporation@gmail.com
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          GSTIN: 08AANFJ6936B1Z7
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          State: Rajasthan
        </Text>
      </Box>

      {/* VOUCHER DETAILS */}
      <Table size="sm" variant="unstyled" mb={2}>
        <Thead>
          <Tr>
            <Th fontSize="10px">
              Payment To:
            </Th>

            <Th fontSize="10px">
              Payment Details
            </Th>

            <Th fontSize="10px"></Th>
          </Tr>
        </Thead>

        <Tbody>
          <Tr>
            <Td verticalAlign="top">
              <Text
                fontSize="11px"
                fontWeight="900"
              >
                {entries?.[0]?.ledger_name || "-"}
              </Text>

              <Text fontFamily="serif"  color="black" fontSize="11px">
                Account Ledger :
                {" "}
                {payment.account_ledger_name || "-"}
              </Text>
            </Td>

            <Td verticalAlign="top">
              <Text fontFamily="serif"  color="black"fontSize="11px">
                Payment Mode :
                {" "}
                {entries?.[0]?.transaction_type || "-"}
              </Text>

              <Text fontFamily="serif"  color="black"fontSize="11px">
                Transaction No. :
                {" "}
                {entries?.[0]?.transaction_no || "-"}
              </Text>

              <Text fontFamily="serif"  color="black" fontSize="11px">
                Through :
                {" "}
                {entries?.[0]?.bank_name || "-"}
              </Text>
            </Td>

            <Td verticalAlign="top">
              <Text
                fontSize="10px"
                fontWeight="900"
              >
                Under Emp. :
                {" "}
                {payment.employee_under_name || "-"}
              </Text>

              <Text
                fontSize="10px"
                fontWeight="900"
              >
                Voucher No. :
                {" "}
                {payment.voucher_no}
              </Text>

              <Text
                fontSize="10px"
                fontWeight="900"
              >
                Voucher Date :
                {" "}
                {formattedDate}
              </Text>
            </Td>
          </Tr>
        </Tbody>
      </Table>

      <Divider borderColor="#4e4e4e" />

      {/* TABLE */}
      <Box overflowX="auto">
        <Table
          size="sm"
          variant="unstyled"
          sx={{
            borderCollapse: "collapse",
          }}  className="purchase_invoice_table"
        >
          <Thead>
            <Tr
             borderTop="1px solid #4e4e4e" borderBottom="1px solid #4e4e4e"
            >
              <Th>S.N.</Th>
              <Th>Particulars</Th>
              <Th>Amount</Th>
              <Th>Transaction Type</Th>
              <Th>Txn/Cheque/DD No</Th>
              <Th>Through</Th>
            </Tr>
          </Thead>

          <Tbody>
            {entries.map((entry, index) => (
              <Tr
                key={entry.id}
                borderBottom="1px solid #ccc"
              >
                <Td>{index + 1}</Td>

                <Td>{entry.ledger_name}</Td>

                <Td textAlign="right">
                  {parseFloat(
                    entry.amount || 0
                  ).toFixed(2)}
                </Td>

                <Td>
                  {entry.transaction_type || "-"}
                </Td>

                <Td>
                  {entry.transaction_no || "-"}
                </Td>

                <Td>
                  {entry.bank_name || "-"}
                </Td>
              </Tr>
            ))}

            <Tr
              borderTop="1px solid #4e4e4e"
              bg="gray.50"
              fontWeight="bold"
            >
              <Td />

              <Td>TOTAL</Td>

              <Td textAlign="right">
                {parseFloat(
                  payment.total_amount || 0
                ).toFixed(2)}
              </Td>

              <Td />
              <Td />
              <Td />
            </Tr>
          </Tbody>
        </Table>
      </Box>

      <Divider borderColor="#4e4e4e" mt={2} />

      {/* AMOUNT IN WORDS */}
      <Flex
        gap={2}
        py={1}
        borderBottom="1px solid #4e4e4e"
        fontSize="10px"
      >
        <Text
          fontWeight="bold"
          minW="fit-content"
        >
          Amount In Words :
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">{amountInWords}</Text>
      </Flex>

      {/* NARRATION */}
      <Flex
        gap={2}
        py={1}
        borderBottom="1px solid #4e4e4e"
        fontSize="10px"
      >
        <Text
          fontWeight="bold"
          minW="fit-content"
        >
          Narration :
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          {payment.narration || "-"}
        </Text>
      </Flex>

      {/* SIGNATURES */}
      <Flex
        justify="space-between"
        mt="10px"
        mb="8px"
        px={4}
        alignItems="end"
      >
        <Text
          fontWeight="bold"
          fontSize="14px"
          fontFamily="serif"
        >
          Receiver's Signature
        </Text>

        <VStack>
          <Img
            src={stamp_img}
            width="80px"
          />

          <Text
            fontWeight="bold"
            fontSize="14px"
            fontFamily="serif"
          >
            Authorizer Signature
          </Text>
        </VStack>
      </Flex>

      {/* BANK DETAILS */}
      <Box
        borderTop="1px solid #000"
        pt={3}
        pb={2}
        borderBottom="1px solid #4e4e4e"
        fontSize="10px"
      >
        <Text
          fontWeight="bold"
          mb={1}
        >
          Bank Details :
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          Company Name : JAMIDARA SEEDS CORPORATION
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          Bank Name : STATE BANK OF INDIA
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          Account No. : 61180709821
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          IFSC Code : SBIN0031764
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          Bank Name : ICICI BANK
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          Account No. : 678805501229
        </Text>

        <Text fontFamily="serif"  color="black"fontSize="10px">
          IFSC Code : ICIC0000106
        </Text>
      </Box>

      {/* RULES */}
      <Box
        border="1px solid #000"
        mt={3}
        p={3}
        fontSize="8px"
      >
        <Text
          fontWeight="bold"
          textDecoration="underline"
          mb={2}
        >
          Rules & Regulations
        </Text>

        <Text fontFamily="serif"  color="black">
          ❖ All cash discount plans and other plans shall
          be valid as per the rules and conditions of the
          company.
        </Text>

        <Text mt="2px" fontFamily="serif">
          ❖ If any goods packet is received by the
          distributor, it will have to be reported to the
          company within three days.
        </Text>

        <Text mt="2px" fontFamily="serif">
          ❖ The freight fare for the goods will be paid by
          the company only for the price marked on the
          Bill-T.
        </Text>

        <Text mt="2px" fontFamily="serif">
          ❖ Transport fare will be paid by the company to
          the distributor only after receiving time of the
          bill.
        </Text>

        <Text mt="2px" fontFamily="serif">
          ❖ Company has full rights to do changes in the
          value of any product & schemes.
        </Text>

        <Text mt="2px" fontFamily="serif">
          ❖ Distributor has to send notice to company
          within 7 days regarding complaint.
        </Text>

        <Text mt="2px" fontFamily="serif">
          ❖ Interest @24% P.A. will be charged on late
          payment after 45 days.
        </Text>

        <Text mt="2px" fontFamily="serif">
          ❖ Supercash bill payment is mandatory within 7
          days from bill date.
        </Text>
      </Box>
    </Box>
  </Box>
);
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
  background: "#f5f5f5",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
};

export default PaymentInvoice;