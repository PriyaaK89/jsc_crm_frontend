import React, { useState } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";

const labelStyles = {
  fontSize: "12px",
  color: "#444",
};

// ✅ All fields standardized
const defaultBox = {
  for_amount_added: "",
  for_amount_deducted: "",
  on: "",
  by_days: "",
  security: "",
  security_amount: "",
  rate: "",
  ratePer: "",
  applicability: "",
  grace: "",
  touched: {},
};

const CreateLedgerInterestParameter = () => {
  const [boxes, setBoxes] = useState([
    { ...defaultBox },
    { ...defaultBox },
    { ...defaultBox },
  ]);

  // ✅ HANDLE CHANGE
  const handleChange = (index, field, value) => {
    const updated = [...boxes];

    updated[index][field] = value;

    // mark touched
    if (index !== 0) {
      updated[index].touched[field] = true;
    }

    // propagate from first box
    if (index === 0) {
      for (let i = 1; i < updated.length; i++) {
        if (!updated[i].touched[field]) {
          updated[i][field] = value;
        }
      }
    }

    setBoxes(updated);
  };

  return (
    <Box border="1px solid #ccc" mt={5} borderRadius="lg">
      
      {/* HEADER */}
      <Box bg="#e9f2ff" borderBottom="1px solid #d9e5f8" p={3}>
        <Text fontWeight="bold">⚙ Interest Parameter</Text>
      </Box>

      <Box p={4}>
        <SimpleGrid columns={2} spacing={4}>
          <FormControl>
            <FormLabel {...labelStyles}>Calculate Txn by TxN</FormLabel>
            <Select>
              <option>No</option>
              <option>Yes</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel {...labelStyles}>Calculate interest based on</FormLabel>
            <Select>
              <option>Select Any One</option>
              <option>Daily Balance</option>
              <option>Monthly</option>
            </Select>
          </FormControl>
        </SimpleGrid>

        {/* 🔥 Dynamic Boxes */}
        {boxes.map((box, index) => (
          <Box key={index} border="1px solid #ccc" mt={5} borderRadius="lg">
            
            <Box bg="#e9f2ff" borderBottom="1px solid #d9e5f8" p={2}>
              <Text fontWeight="bold" fontSize="15px">
                ⦿ Include Transaction Date For Interest Calcuation: {index + 1}
              </Text>
            </Box>

            <Box p={4}>
              <SimpleGrid columns={2} spacing={4}>

                <FormControl>
                  <FormLabel {...labelStyles}>For amount added</FormLabel>
                  <Select
                    value={box.for_amount_added}
                    onChange={(e) =>
                      handleChange(index, "for_amount_added", e.target.value)
                    } placeholder="Select Any one"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>For amount deducted</FormLabel>
                  <Select
                    value={box.for_amount_deducted}
                    onChange={(e) =>
                      handleChange(index, "for_amount_deducted", e.target.value)
                    } placeholder="Select Any one"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>Rate %</FormLabel>
                  <Input
                    value={box.rate}
                    onChange={(e) =>
                      handleChange(index, "rate", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>Rate % per</FormLabel>
                  <Select
                    value={box.ratePer}
                    onChange={(e) =>
                      handleChange(index, "ratePer", e.target.value)
                    } placeholder="Select Any one"
                  >
                 
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>On</FormLabel>
                  <Select
                    value={box.on}
                    onChange={(e) =>
                      handleChange(index, "on", e.target.value)
                    }  placeholder="Select Any one"
                  >
                   <option value="debit_balance"> Debit Balance Only</option>
                    <option value="credit_balance"> Credit Balance Only</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>Applicability</FormLabel>
                  <Select
                    value={box.applicability}
                    onChange={(e) =>
                      handleChange(index, "applicability", e.target.value)
                    } placeholder="Select Any one"
                  >
                    <option value="always">Always</option>
                    <option value="after_due_date">After Due Date</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>By (days)</FormLabel>
                  <Input
                    value={box.by_days}
                    onChange={(e) =>
                      handleChange(index, "by_days", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>Grace Period</FormLabel>
                  <Input
                    value={box.grace}
                    onChange={(e) =>
                      handleChange(index, "grace", e.target.value)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>Security</FormLabel>
                  <Select
                    value={box.security}
                    onChange={(e) =>
                      handleChange(index, "security", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel {...labelStyles}>Security Amount</FormLabel>
                  <Input
                    value={box.security_amount}
                    onChange={(e) =>
                      handleChange(index, "security_amount", e.target.value)
                    }
                  />
                </FormControl>

              </SimpleGrid>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CreateLedgerInterestParameter;