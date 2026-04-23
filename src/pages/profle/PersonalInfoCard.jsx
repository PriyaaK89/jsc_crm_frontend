import {
  Box,
  Text,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Flex,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
import API  from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { useRef } from "react";
import { IoCameraSharp } from "react-icons/io5";
// import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const PersonalInfoCard = ({ data, fetchEmployeeDetails }) => {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null); 
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
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("profile_image", file);

      const res = await API.put(
        API_ENDPOINTS.update_profile_image,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res?.data?.success) {
        await fetchEmployeeDetails(); 

        toast({
          title: "Profile image updated",
          status: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        status: "error",
      });
    } finally {
      setUploading(false);
    }
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
      <Box position="relative">

      <Avatar
  size="xl"
  name={data?.name}
        src= {data?.profile_image_url}

  sx={{
    "& span": {
      lineHeight: "3",
    }
  }}
/>
 <Box
            position="absolute"
            bottom="0"
            right="0"
            bg="blue.500"
            borderRadius="full"
            p={2}
            cursor="pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <IoCameraSharp color="white" size={18} />
          </Box>
          <input
        type="file"
        ref={fileInputRef}
        hidden
        onChange={handleImageChange}
      />
</Box>

      <Box textAlign={{ base: "center", md: "left" }} minW="0">
        <Text fontWeight="bold" fontSize="md">
          {data?.name || "-"}
        </Text>

        <Text fontSize="sm" color="gray.500">
          {data?.department_name || "-"}
        </Text>

        <Text fontSize="sm" color="gray.500">
          {data?.role || "-"}
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
            {data?.date_of_joining
              ? new Date(
                  data.date_of_joining
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
        ["Father Name", data?.father_name],
        ["Date of Birth", data?.date_of_birth],
        ["Pan Number", data?.pan_number],
        ["Aadhar No", data?.aadhar_no],
        ["Blood group", data?.blood_group],
        
        
        ["Salary", data?.salary],
        [
          "Travelling Allowance Per Km",
          data?.travelling_allowance_per_km,
        ],
        [
          "AVG Travel KM per day",
          data?.avg_travel_km_per_day,
        ],
        [
          "City Allowance per km",
          data?.city_allowance_per_km,
        ],
        [
          "Daily Allowance Without Doc",
          data?.daily_allowance_without_doc,
        ],
        ["Hotel Allowance", data?.hotel_allowance],
        ["Total Leaves", data?.total_leaves],
        [
          "Authentication Amount",
          data?.authentication_amount,
        ],
        ["HeadQuarter", data?.headquarter],
        ["Approver Name", data?.approver_name],
        [
          "Login Time",
          data?.login_time
            ? formatTime(data.login_time)
            : "-",
        ],
        [
          "Logout Time",
          data?.logout_time
            ? formatTime(data.logout_time)
            : "-",
        ],
        ["PF", data?.pf],
        ["ESI", data?.esi],
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
