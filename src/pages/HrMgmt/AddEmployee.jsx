import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import {
  Box,
  Button,
  Input,
  Select,
  Text,
  SimpleGrid,
  VStack,
  useToast,
  FormControl,
  FormLabel,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import CustomDatePicker from "../../components/common/CustomDatepicker";
import { GoHomeFill } from "react-icons/go";
import { FormErrorMessage } from "@chakra-ui/react";
import { validateEmail, validatePan, validateAadhar, validateContact, validateRequiredFields } from "../../hook/Validation";

const AddEmployee = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [jobRole, setJobRole] = useState([]);
  const {users} =useUsersapi();
  // const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(100)
  const navigate = useNavigate();

  const [error, setError] = useState({
    name: "",
    gender: "",
    date_of_birth: "",
    email: "",
    contact_no: "",
    address_line1: "",
    area: "",
    pincode: "",
    father_name: "",
    department_id: "",
    job_role_id: "",
    date_of_joining: "",
    two_travelling_allowance_per_km: "",
    four_travelling_allowance_per_km: "",
    avg_travel_km_per_day: "",
    daily_allowance_with_doc: "",
    city_allowance_per_km: "",
    hotel_allowance: "",
    salary: "",
    week_off: "",
    total_leaves: "",
    headquarter: "",
    approver_name: "",
    reporting_under: "",
    aadhar_no: "",
    pan_number: "",
  });

  const requiredFields = [
    "name",
    "gender",
    "email",
    "contact_no",
    "date_of_birth",
    "address_line1",
    "pincode",
    "area",
    "father_name",
    "department_id",
    "job_role_id",
    "date_of_joining",
    "two_travelling_allowance_per_km",
    "four_travelling_allowance_per_km",
    "avg_travel_km_per_day",
    "city_allowance_per_km",
    "daily_allowance_with_doc",
    "hotel_allowance",
    "salary",
    "total_leaves",
    "headquarter",
    "approver_name",
    "reporting_under",
  ];

  const [areas, setAreas] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    contact_no: "",
    date_of_birth: "",
    email: "",
    address_line1: "",
    address_line2: "",
    country: "India",
    state: "",
    city: "",
    district: "",
    area: "",
    pincode: "",
    father_name: "",
    pan_number: "",
    aadhar_no: "",
    blood_group: "",
    department_id: "",
    job_role_id: "",
    date_of_joining: "",
    salary: "",
    week_off: "Sunday",

    two_travelling_allowance_per_km: "",
    four_travelling_allowance_per_km:"",
    travelling_per_day: "",
    avg_travel_km_per_day: "",
    city_allowance_per_km: "",
    daily_allowance_with_doc: "",
    daily_allowance_without_doc: "",
    hotel_allowance: "",
    attendance_time: "",
    total_leaves: "",
    authentication_amount: "",
    headquarter: "",
    login_time: "",
    logout_time: "",
    pf: "",
    esi: "",
    approver_name: "",
    reporting_under: "",
    profile_image: null
  });
 

 const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]:
      name === "department_id" ||
      name === "job_role_id" ||
      name === "reporting_under"
        ? Number(value)   
        : value,
  }));

  setError((prev) => ({
    ...prev,
    [name]: "",
  }));
};


 const handleSubmit = async () => {
  // VALIDATIONS
  const requiredFieldErrors = validateRequiredFields(formData, requiredFields);

  const emailError = validateEmail(formData.email);
  const contactError = validateContact(formData.contact_no);
  const aadharError = validateAadhar(formData.aadhar_no);
  const panError = validatePan(formData.pan_number);

  const newError = {
    ...requiredFieldErrors,
    email: emailError,
    contact_no: contactError,
    aadhar_no: aadharError,
    pan_number: panError,
  };

  setError(newError);

 
  // if (Object.values(newError).some((err) => err)) {
  //   toast({
  //     title: "Validation Error",
  //     description:
  //       newError.email ||
  //       newError.contact_no ||
  //       newError.aadhar_no ||
  //       newError.pan_number ||
  //       "Please fill all required fields",
  //     status: "error",
  //     duration: 3000,
  //     isClosable: true,
  //   });
  //   return;
  // }

  try {
    setLoading(true);

    //  FormData create
    const formDataToSend = new FormData();

    //  Append all fields
    Object.keys(formData).forEach((key) => {
      if (key === "profile_image") {
        if (formData.profile_image) {
          formDataToSend.append("profile_image", formData.profile_image);
        }
      } else {
        formDataToSend.append(key, formData[key] ?? "");
      }
    });

    //  Convert numeric fields
    const numberFields = [
      "department_id",
      "job_role_id",
      "salary",
      "four_travelling_allowance_per_km",
      "two_travelling_allowance_per_km",
      "avg_travel_km_per_day",
      "city_allowance_per_km",
      "daily_allowance_with_doc",
      "daily_allowance_without_doc",
      "hotel_allowance",
      "total_leaves",
      "authentication_amount",
      "pf",
      "esi",
      "attendance_time",
      "travelling_per_day",
    ];

    numberFields.forEach((field) => {
      if (formData[field] !== "" && formData[field] !== null) {
        formDataToSend.set(field, Number(formData[field]));
      }
    });

    //  Default values
    formDataToSend.set("week_off", formData.week_off || "Sunday");

    //  FINAL API CALL
   const response = await API.post(
  API_ENDPOINTS.CREATE_USERS,
  formDataToSend
);

    if (response?.status === 201) {
      toast({
        title: "User created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/upload-documents", {
        state: {
          userId: response?.data?.id,
          email: response?.data?.email,
          mustChangePassword: response?.data?.must_change_password,
        },
      });

     
      setFormData({
        name: "",
        gender: "",
        contact_no: "",
        date_of_birth: "",
        email: "",
        address_line1: "",
        address_line2: "",
        country: "India",
        state: "",
        city: "",
        district: "",
        pincode: "",
        area: "",
        father_name: "",
        pan_number: "",
        aadhar_no: "",
        blood_group: "",
        department_id: "",
        job_role_id: "",
        date_of_joining: "",
        salary: "",
        total_leaves: "",
        week_off: "Sunday",
        approver_name: "",
        reporting_under: "",
        two_travelling_allowance_per_km:"",
        four_travelling_allowance_per_km:"",
        profile_image: null, 
      });
    }
  } catch (error) {
    toast({
      title: "Failed to create user",
      description: error.response?.data?.message || "Something went wrong",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setLoading(false);
  }
};

  const fetchDepartmentList = async () => {
    try {
      const response = await API.get(API_ENDPOINTS?.get_department);
      if (response?.status === 200) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.log("Department fetch error", error);
    }
  };
  useEffect(() => {
    fetchDepartmentList();
  }, []);

  const fetchRoleList = async (deptId) => {
    try {
      const response = await API.get(
        `${API_ENDPOINTS?.get_jobRole_list}/${deptId}`,
      );
      if (response?.status === 200) {
        setJobRole(response?.data);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };






  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      department_id: deptId,
      job_role_id: "",
    }));

    setError((prev) => ({
      ...prev,
      department_id: "",
      job_role_id: "",
    }));

    if (deptId) {
      fetchRoleList(deptId);
    }
  };

  const handlePincodeChange = async (value) => {
    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    if (value.length === 6) {
      try {
        const res = await API.get(`/getstatecity/${value}`);
        const { state, district, city } = res.data.data;

        setFormData((prev) => ({
          ...prev,
          state,
          district,
          city,
        }));

        // const areaRes = await API.get(`/areas?district=${district}`);
        const areaRes = await API.get(`/areas?pincode=${value}`);

        setAreas(areaRes.data.data);
      } catch (err) {
        console.error("Pincode lookup failed", err);
      }
    }
  };

  const lableStyles = {
    fontSize: "12px",
    color: "#686868",
    marginBottom: "3px",
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="10px"
        px={{ base: 4, md: 6 }}
        py={4}
        // maxW="1200px"
        // mx="auto"
        overflow="hidden"
      >
        <HStack justifyContent="space-between">
          <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink
                as={Link}
                to="/hr-mgmt/view-employee-list"
                color="#8B8D97"
                fontSize="13px"
              >
                Employee List
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          {/* <Button backgroundColor='#3E60AA' color='white' fontWeight='400' height='36px' fontSize='14px' borderRadius='12px' _hover={{ backgroundColor: '#5570F1' }}><span style={{ fontSize: '18px', paddingRight: '10px' }}><FaPlus /></span> Create a New Product</Button> */}
        </HStack>
        <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
          Create User
        </Text>

        <VStack spacing={6} align="stretch">
          {/* BASIC DETAILS */}
          <Text fontWeight="bold">Basic Details</Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <FormControl isRequired isInvalid={error.name}>
              <FormLabel {...lableStyles} >Name</FormLabel>
              <Input
                name="name"
                placeholder="Enter name"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.gender}>
              <FormLabel {...lableStyles}>Select Gender</FormLabel>
              <Select
                fontSize="13px"
                color="gray.400"
                name="gender"
                placeholder="Gender"
                onChange={handleChange}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
              <FormErrorMessage>{error.gender}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={error.contact_no}>
              <FormLabel {...lableStyles}>Contact No.</FormLabel>
              <Input
                name="contact_no"
                placeholder="Enter your Contact No"
                maxLength={10}
                value={formData.contact_no}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setFormData((prev) => ({
                      ...prev, contact_no: value,
                    }))
                    setError((prev) => ({
                      ...prev, contact_no: "",
                    }))
                  }
                }}
              />

              <FormErrorMessage>{error.contact_no}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.date_of_birth}>
              <CustomDatePicker
                label="Date of Birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={(date) => {
                  setFormData((prev) => ({
                    ...prev,
                    date_of_birth: date,
                  }));
                  setError((prev) => ({
                    ...prev,
                    date_of_joining: "",
                  }))
                }}
                placeholder="Select date of Birth"
              />
            </FormControl>
            <FormControl >
              <FormLabel {...lableStyles}>Profile Image</FormLabel>

             <Input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];

    setFormData((prev) => ({
      ...prev,
      profile_image: file,
    }));
  }}
/>
            </FormControl>




            <FormControl isRequired isInvalid={error.email}>
              <FormLabel {...lableStyles}>Email</FormLabel>
              <Input
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev, email: value,
                  }))
                  setError((prev) => ({
                    ...prev,
                    email: ""
                  }))
                }}
              />
              <FormErrorMessage>{error.email}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          {/* ADDRESS */}
          <Text fontWeight="bold">Address</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isRequired isInvalid={error.address_line1}>
              <FormLabel {...lableStyles}>Address</FormLabel>
              <Input
                name="address_line1"
                placeholder="Address Line 1"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.address_line1}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel {...lableStyles}>Address</FormLabel>
              <Input
                name="address_line2"
                placeholder="Address Line 2"
                onChange={handleChange}
              />
            </FormControl>
            <FormControl isRequired isInvalid={error.pincode}>
              <FormLabel {...lableStyles}>Pincode</FormLabel>
              <Input
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
              />
              <FormErrorMessage>{error.pincode}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel {...lableStyles}>Country</FormLabel>
              <Input
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl >
              <FormLabel {...lableStyles}>State</FormLabel>
              <Input name="state" value={formData.state || ""} isReadOnly />
            </FormControl>
            <FormControl>
              <FormLabel {...lableStyles}>City</FormLabel>
              <Input name="city" value={formData.city || ""} isReadOnly />
            </FormControl>
            <FormControl>
              <FormLabel {...lableStyles}>District</FormLabel>
              <Input
                name="district"
                value={formData.district || ""}
                isReadOnly
              />
            </FormControl>

            <FormControl isRequired isInvalid={error.area}>
              <FormLabel {...lableStyles}>Select Area</FormLabel>
              <Select
                placeholder="Select Area"
                value={formData.area}
                isDisabled={!areas.length}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    area: e.target.value,
                  }));

                  setError((prev) => ({
                    ...prev,
                    area: "",
                  }));
                }}
              >
                {areas.map((a, index) => (
                  <option key={index} value={a.officename}>
                    {a.officename}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{error.area}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          {/* PERSONAL INFO */}
          <Text fontWeight="bold">Personal Info</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isRequired isInvalid={error.father_name}>
              <FormLabel {...lableStyles}>Father's Name</FormLabel>
              <Input
                name="father_name"
                placeholder="Father Name"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.father_name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.pan_number}>
              <FormLabel {...lableStyles}>Pan Number</FormLabel>
              <Input
                name="pan_number"
                placeholder="PAN Number"
                maxLength={10}
                value={formData.pan_number}
                onChange={(e) => {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");

                  if (value.length <= 10) {
                    setFormData((prev) => ({
                      ...prev,
                      pan_number: value,
                    }));
                    setError((prev) => ({
                      ...prev,
                      pan_number: "",
                    }))
                  }
                }}
              />
              <FormErrorMessage>{error.pan_number}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={error.aadhar_no}>
              <FormLabel {...lableStyles}>Aadhar No.</FormLabel>
              <Input
                name="aadhar_no"
                placeholder="Aadhar No"
                maxLength={12}
                value={formData.aadhar_no}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 12) {
                    setFormData((prev) => ({
                      ...prev,
                      aadhar_no: value,
                    }));
                    setError((prev) => ({
                      ...prev,
                      aadhar_no: "",
                    }))
                  }
                }}
              />
              <FormErrorMessage>{error.aadhar_no}</FormErrorMessage>

            </FormControl>
            <FormControl >
              <FormLabel {...lableStyles}>Blood Group</FormLabel>
              <Select name="blood_group" placeholder="Select Blood Group" onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          {/* JOB DETAILS */}
          <Text fontWeight="bold">Job Details</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isRequired isInvalid={error.department_id}>
              <FormLabel {...lableStyles}>Department Name</FormLabel>
              <Select
                placeholder="Select Department"
                fontSize="13px"
                color="gray.400"
                value={formData.department_id}
                onChange={handleDepartmentChange}
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {" "}
                    {dept.name}{" "}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{error.department_id}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.job_role_id}>
              <FormLabel {...lableStyles}>Job Role Name</FormLabel>
              <Select
                placeholder="Select Job Role"
                fontSize="13px"
                color="gray.400"
                value={formData.job_role_id}
                name="job_role_id"
                onChange={handleChange}
                isDisabled={!jobRole.length}
              >
                {jobRole.map((role) => (
                  <option key={role.id} value={role.id}>
                    {" "}
                    {role.name}{" "}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{error.job_role_id}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.date_of_joining}>
              <CustomDatePicker
                label="Date of Joining"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={(date) => {
                  setFormData((prev) => ({
                    ...prev,
                    date_of_joining: date,
                  }));

                  setError((prev) => ({
                    ...prev,
                    date_of_joining: "",
                  }));
                }}
                placeholder="Select date of joining"
              />

              <FormErrorMessage>{error.date_of_joining}</FormErrorMessage>
            </ FormControl>
            <FormControl isRequired isInvalid={error.salary}>
              <FormLabel {...lableStyles}>Salary</FormLabel>
              <Input
                name="salary"
                placeholder="Salary"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.salary}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.two_travelling_allowance_per_km}>
              <FormLabel {...lableStyles}>
             Two wheeler Travelling Allowance Per K.M.
              </FormLabel>
              <Input
                name="two_travelling_allowance_per_km"
                placeholder=" Two Wheeler Travelling Allowance (per km)"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.two_travelling_allowance_per_km}</FormErrorMessage>
            </FormControl>
           
            <FormControl isRequired isInvalid={error.four_travelling_allowance_per_km}>
              <FormLabel {...lableStyles}>
                 Four wheeler Travelling Allowance Per K.M.
              </FormLabel>
              <Input
                name="four_travelling_allowance_per_km"
                placeholder=" Four Wheeler Travelling Allowance (per km)"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.four_travelling_allowance_per_km}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.travelling_per_day} >
              <FormLabel {...lableStyles}>
                Avg. Travelling Per Day (In K.M.)
              </FormLabel>
              <Input
                name="travelling_per_day"
                placeholder="Avg Travel / Day (km)"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.travelling_per_day}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={error.city_allowance_per_km}>
              <FormLabel {...lableStyles}>City Allowance (Per K.M.)</FormLabel>
              <Input
                name="city_allowance_per_km"
                placeholder="City Allowance (per km)"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.city_allowance_per_km}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={error.daily_allowance_with_doc}>
              <FormLabel {...lableStyles}>Daily Allowance (with DOC)</FormLabel>
              <Input
                name="daily_allowance_with_doc"
                placeholder="Daily Allowance (with doc)"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.daily_allowance_with_doc}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel {...lableStyles}>
                Daily Allowance (without DOC)
              </FormLabel>
              <Input
                name="daily_allowance_without_doc"
                placeholder="Daily Allowance (without doc)"
                onChange={handleChange}
              />
            </FormControl>
            <FormControl isRequired isInvalid={error.hotel_allowance}>
              <FormLabel {...lableStyles}>Hotel Allowance</FormLabel>
              <Input
                name="hotel_allowance"
                placeholder="Hotel Allowance"
                onChange={handleChange}
              />
              <FormErrorMessage>{error.hotel_allowance}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={error.week_off}>
              <FormLabel {...lableStyles}>Select Week Off</FormLabel>
              <Select
                name="week_off"
                fontSize="13px"
                color="gray.700"
                placeholder="Select Week Off"
                value={formData.week_off ? formData.week_off : "Sunday"}
                onChange={handleChange}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </Select>
              <FormErrorMessage>{error.week_off}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={error.total_leaves}>
              <FormLabel {...lableStyles}>Total Leaves</FormLabel>
              <Input name="total_leaves" onChange={handleChange} />
              <FormErrorMessage>{error.total_leaves}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={error.headquarter}>
              <FormLabel {...lableStyles}>Headquarter</FormLabel>
              <Input name="headquarter" onChange={handleChange} />
              <FormErrorMessage>{error.headquarter}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.approver_name} >
              <FormLabel {...lableStyles}>Approver Name</FormLabel>
              <Select
                name="approver_name"
                placeholder="Select Approver"
                onChange={handleChange}
              >
                {users?.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{error.approver_name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={error.reporting_under}>
              <FormLabel {...lableStyles}>Reporting Under</FormLabel>
              <Select
                name="reporting_under"
                placeholder="Select reporting under"
                onChange={handleChange}
              >
                {users?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{error.reporting_under}</FormErrorMessage>
            </FormControl>


          </SimpleGrid>

          <Text fontWeight="bold">Office Timing & Payroll</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel {...lableStyles}>Login Time</FormLabel>
              <Input type="time" name="login_time" onChange={handleChange} value={formData.login_time || "10:00:P.M"}
              />
            </FormControl>

            <FormControl>
              <FormLabel {...lableStyles}>Logout Time</FormLabel>
              <Input type="time" name="logout_time" onChange={handleChange} value={formData.logout_time} />
            </FormControl>

            <FormControl>
              <FormLabel {...lableStyles}>Attendance Time</FormLabel>
              <Input
                name="attendance_time"
                value={formData.attendance_time || "11 A.M."}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel {...lableStyles}>Authentication Amount</FormLabel>
              <Input name="authentication_amount" onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel {...lableStyles}>PF Amount</FormLabel>
              <Input name="pf" onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel {...lableStyles}>ESI Amount</FormLabel>
              <Input name="esi" onChange={handleChange} />
            </FormControl>
          </SimpleGrid>

          <Button
            colorScheme="blue"
            alignSelf="center"
            isLoading={loading}
            onClick={handleSubmit}
          >
            Create User
          </Button>



          {/* <DocumentUploadTable/> */}
        </VStack>
      </Box>
    </>
  );
};

export default AddEmployee;
