import React, { useContext, useEffect, useState } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Select, useToast, VStack, HStack, Breadcrumb,BreadcrumbItem,BreadcrumbLink} from "@chakra-ui/react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";
import { GoHomeFill } from "react-icons/go";


const CreateJobRole = () => {
  const [jobRole, setJobRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  // Create Job Role
  const addJobRole = async (e) => {
    e.preventDefault();

    if (!jobRole.trim() || !departmentId) {
      toast({
        description: "Department and role name are required",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await API.post( API_ENDPOINTS?.create_jobRole,
        {
          department_id: departmentId,
          name: jobRole,
        },
      );

      if (response?.status === 201) {
        toast({
          description: "Job Role Added Successfully!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        setJobRole("");
        setDepartmentId("");
      }
    } catch (error) {
      toast({
        description:
          error.response?.data?.message ||
          "Something went wrong, please try again!",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  //  Fetch Department List
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

  return (
    <Box w="100%" bg="white" p={6} borderRadius="md" boxShadow="md">
     <HStack justifyContent='space-between'>
               <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
                 <BreadcrumbItem>
                   <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
                 </BreadcrumbItem>
     
                 <BreadcrumbItem>
                   <BreadcrumbLink href='/hr-mgmt/view-employee-list' color='#8B8D97' fontSize='13px'>Employee List</BreadcrumbLink>
                 </BreadcrumbItem>
     
               </Breadcrumb>
               {/* <Button backgroundColor='#3E60AA' color='white' fontWeight='400' height='36px' fontSize='14px' borderRadius='12px' _hover={{ backgroundColor: '#5570F1' }}><span style={{ fontSize: '18px', paddingRight: '10px' }}><FaPlus /></span> Create a New Product</Button> */}
     
             </HStack>
      <Heading size="md" textAlign="center" mb={6} fontWeight="600">
        Create Job Role
      </Heading>

      <Box as="form" onSubmit={addJobRole}>
        <VStack spacing={4}>
          {/* Department Dropdown */}
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="400">
              Department
            </FormLabel>
            <Select
              placeholder="Select department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Job Role Name */}
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="400">
              Job Role Name
            </FormLabel>
            <Input
              placeholder="Enter role name"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Creating..."
            w="200px"
          >
            Create Job Role
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default CreateJobRole;
