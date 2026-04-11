import React, { useState } from "react";
import axios from "axios";
import { Box } from "@chakra-ui/react";

const EmpKycReport = () => {
  const [form, setForm] = useState({
    mobile: "",
    name: ""
  });

  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const startKYC = async () => {
    if (!form.mobile ) {
      alert("Please enter mobile number ");
      return;
    }

    if (form.mobile.length !== 10) {
      alert("Enter valid 10 digit mobile number");
      return;
    }

    try {
      setLoading(true);

      // Call backend API
      const res = await axios.post("http://103.110.127.211:5001/digilocker-kyc", {
        mobile: form.mobile,
        name: form.name
      });

      const { id, access_token } = res.data.data;

      const requestId = id;
      const tokenId = access_token.id;

      const options = {
        environment: "sandbox", // or "sandbox"
        callback: function (response) {
          if (response.hasOwnProperty("error_code")) {
            console.error("KYC Failed:", response);
            alert("KYC Failed ");
          } else {
            console.log("KYC Success:", response);
            alert("KYC Completed ");
          }
        },
        logo: "https://your-logo-url.com/logo.png",
        theme: {
          primaryColor: "#4CAF50",
          secondaryColor: "#000000"
        }
      };

      const digio = new window.Digio(options);

      digio.init();

      digio.submit(requestId, form.mobile, tokenId);

    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
             bg="white"
             mt={{base:2, md:5}}
             px={{base:3, md:6}}
             py={{base:3, md:4}}
            borderRadius="lg"
            boxShadow="md"
         >
        <h2 style={styles.title}>Start KYC</h2>
      <Box display="flex" gap={4} alignItems="baseline">

        <input
          type="text"
          name="name"
          placeholder="Enter Full Name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="number"
          name="mobile"
          placeholder="Enter Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          style={styles.input}
        />

        <button onClick={startKYC} disabled={loading} style={styles.button}>
          {loading ? "Starting KYC..." : "Start KYC"}
        </button>
      </Box>
    </Box>
  );
};

// Simple styling
const styles = {
 
  title: {
    marginBottom: "20px"
  },
  input: {
    width: "80%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    width: "40%",
    padding: "6px 12px",
    background: "#4CAF50",
    color: "#fff",
    height: "40px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default EmpKycReport;
