import {
  Box,
  Text,
  Avatar,
  Flex,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API  from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";

const PersonalInfoCard = () => {

  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const { empId } = useParams();
  const toast = useToast();

  // Fetch
 const fetchEmployeeDetails = async () => {
  try {
    setLoading(true);

    const res = await API.get(
      `${API_ENDPOINTS.get_emp_details}/${empId}`
    );

    console.log("API Response:", res);

    if (res?.data.success) {
      setEmployeeDetails(res.data.data);
    }

  } catch (err) {
    console.error("Error:", err.response || err.message);
    toast({
      title: "Failed to load employee data",
      status: "error",
      duration: 3000,
    });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (empId) fetchEmployeeDetails();
    
  }, [empId]);

  // Loading state
  if (loading) return <Text>Loading...</Text>;

  // Safety check
  if (!employeeDetails) return <Text>No Data Found</Text>;
  console.log(employeeDetails)
  //  date formate 
  const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
   
  
    <Box
    bg="white"
    p={{ base: 4, md: 6 }}
    rounded="2xl"
    shadow="md"
    border="1px solid #eee"
    w="100%"
    h="100%"
    minW="0"
  >
    {/* Header */}
    <Flex justify="space-between" align="center" mb={4}>
      <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
        Personal Information
      </Text>
      <EditIcon boxSize={5} color="#5570F1" cursor="pointer" />
    </Flex>

    <Divider my={3} />

    {/* Profile Section */}
    <Flex
      direction={{ base: "column", md: "row" }}
      align={{ base: "center", md: "flex-start" }}
      gap={4}
      mb={4}
      minW="0"   
    >
      <Avatar size="xl" name={employeeDetails?.name}  />

      <Box textAlign={{ base: "center", md: "left" }} minW="0">
        <Text fontWeight="bold" fontSize="md">
          {employeeDetails?.name || "-"}
        </Text>

        <Text fontSize="sm" color="gray.500">
          {employeeDetails?.department_name || "-"}
        </Text>

        <Text fontSize="sm" color="gray.500">
          {employeeDetails?.role || "-"}
        </Text>

        <Flex
          justify={{ base: "center", md: "space-between" }}
          align="center"
          mt={2}
          flexWrap="wrap"
          gap={2}
        >
          <Text fontWeight="medium">Joining Date:</Text>
          <Text fontSize="sm" color="gray.500">
            {employeeDetails?.date_of_joining
              ? new Date(
                  employeeDetails.date_of_joining
                ).toLocaleDateString("en-IN")
              : "-"}
          </Text>
        </Flex>
      </Box>
    </Flex>

    <Divider my={4} />

    {/* Info Grid */}
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "1fr 2fr" }}
      gap={3}
      lineHeight="2"
      wordBreak="break-word"
      minW="0"
    >
      {/* Row Template */}
      {[
        ["Father Name", employeeDetails?.father_name],
        ["Date of Birth",employeeDetails?.date_of_birth],
        ["Pan Number", employeeDetails?.pan_number],
        ["Aadhar No", employeeDetails?.aadhar_no],
        ["Blood group",employeeDetails?.blood_group],
        
        
        ["Salary", employeeDetails?.salary],
        [
          "Travelling Allowance Per Km",
          employeeDetails?.travelling_allowance_per_km,
        ],
        [
          "AVG Travel KM per day",
          employeeDetails?.avg_travel_km_per_day,
        ],
        [
          "City Allowance per km",
          employeeDetails?.city_allowance_per_km,
        ],
        [
          "Daily Allowance Without Doc",
          employeeDetails?.daily_allowance_without_doc,
        ],
        ["Hotel Allowance", employeeDetails?.hotel_allowance],
        ["Total Leaves", employeeDetails?.total_leaves],
        [
          "Authentication Amount",
          employeeDetails?.authentication_amount,
        ],
        ["HeadQuarter", employeeDetails?.headquarter],
        ["Approver Name", employeeDetails?.approver_name],
        [
          "Login Time",
          employeeDetails?.login_time
            ? formatTime(employeeDetails.login_time)
            : "-",
        ],
        [
          "Logout Time",
          employeeDetails?.logout_time
            ? formatTime(employeeDetails.logout_time)
            : "-",
        ],
        ["PF", employeeDetails?.pf],
        ["ESI", employeeDetails?.esi],
      ].map(([label, value], index) => (
        <Flex
          key={index}
          justify="space-between"
          align="center"
          flexWrap="wrap" 
        >
          <Text fontWeight="medium">{label}:</Text>
          <Text color="gray.500">{value || "-"}</Text>
        </Flex>
      ))}
    </Box>
  </Box>
  );
};

export default PersonalInfoCard;
