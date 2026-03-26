import React, { useEffect, useState } from "react";
import {
  Box,
  HStack,
  Input,
  useToast,
  Select,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormControl,
  FormLabel,
  Button,
  SimpleGrid,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  Flex,
  Spinner,
  Tbody,
  useDisclosure
} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import useUsersapi from "../../Apis/GetUsersapi";
import UploadEmpExpense from "./UploadEmpExpenseModal"

const UploadEmployeeExpensives = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    hotel_amount: "",
    bus_train_toll_amount: "",
    pertrol_diesel_amount: "",
    other_amount: "",
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { users = [], fetchUsers } = useUsersapi();
  const [adminExpense, setAdminExpense] = useState([]);
  const [selectData, setSelectData] = useState(null);
  const {isOpen, onOpen, onClose}= useDisclosure();

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchAdminExpense = async () => {
    setLoading(true);
    try {
      const response = await API.get(`${API_ENDPOINTS?.get_uploaded_exp}`);
      if (response.status === 200) {
        setAdminExpense(response.data.data);
      }
    }
    catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }

  }
  useEffect(() => {
    fetchAdminExpense();
  }, [])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await API.post(
        API_ENDPOINTS?.set_expense_allocation,
        {
          user_id: Number(formData.user_id),
          hotel_amount: Number(formData.hotel_amount),
          bus_train_toll_amount: Number(formData.bus_train_toll_amount),
          pertrol_diesel_amount: Number(formData.pertrol_diesel_amount),
          other_amount: Number(formData.other_amount),
        }
      );

      if (response?.status === 200) {
        toast({
          title: "Expense allocation updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // reset form
        setFormData({
          user_id: "",
          hotel_amount: "",
          bus_train_toll_amount: "",
          pertrol_diesel_amount: "",
          other_amount: "",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update expense allocation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
    fetchAdminExpense();
  };

  const labelStyles = {
    fontSize: "12px",
    color: "#686868",
    marginBottom: "3px",
  };

  return (
    <>
    <UploadEmpExpense isOpen={isOpen} onClose={onClose} selectData={selectData}/>
    <Box
      bg="white"
      mt={{ base: 2, md: 5 }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 4 }}
      borderRadius="lg"
      boxShadow="md"
    >
      {/* Breadcrumb */}
      <HStack justifyContent="space-between">
        <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/dashboard">
              <GoHomeFill color="#5570F1" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink fontSize="13px">
              Upload Employee Expenses
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </HStack>

      {/* User Select */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>

        <FormControl mb={3}>
          <FormLabel {...labelStyles}>User</FormLabel>
          <Select
            placeholder="Select User"
            value={formData.user_id}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                user_id: e.target.value,
              }))
            }
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Inputs */}
        <FormControl mb={3}>
          <FormLabel>Hotel Amount</FormLabel>
          <Input
            type="number"
            name="hotel_amount"
            value={formData.hotel_amount}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Bus Train Toll Amount</FormLabel>
          <Input
            type="number"
            name="bus_train_toll_amount"
            value={formData.bus_train_toll_amount}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl mb={3}>
          <FormLabel>Petrol Diesel Amount</FormLabel>
          <Input
            type="number"
            name="pertrol_diesel_amount"
            value={formData.pertrol_diesel_amount}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Other Amount</FormLabel>
          <Input
            type="number"
            name="other_amount"
            value={formData.other_amount}
            onChange={handleChange}
          />
        </FormControl>
      </SimpleGrid >


      {/* Submit Button */}
      <Button
        colorScheme="blue"
        isLoading={loading}
        onClick={handleSubmit}
        mx="auto"
      >
        Submit
      </Button>
      {/* Table */}
      <Box bg="white" borderRadius="md" boxShadow="sm" border="1px solid #ccc"  mt={3} >
        {
          loading ? (
            <Flex justifyContent="center" align="center" py={10}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="striped" colorScheme="gray" size="sm">
                <Thead>
                  <Tr>
                    <Th minW="200px">Serail No</Th>
                    <Th minW="250px">Name</Th>
                    <Th minW="250px">Hotel</Th>
                    <Th minW="300px">Bus Train Toll</Th>
                    <Th minW="300px">Petrol Diesel</Th>
                    <Th minW="250px">Other</Th>
                    <Th minW="300px">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {adminExpense.map((admin, index)=>(
                   <Tr key={admin?.user_id}>
                     <Td>{index+1}</Td>
                     <Td>{admin.employee_name}</Td>
                     <Td>{admin.allocation.HOTEL}</Td>
                     <Td>{admin.allocation.BUS_TRAIN_TOLL}</Td>
                     <Td>{admin.allocation.PETROL_DIESEL}</Td>
                     <Td>{admin.allocation.OTHER}</Td>
                     <Td>
                       <Button colorScheme="blue" onClick={()=>{
                         setSelectData(admin);
                             onOpen();    
                       }}>View</Button>
                     </Td>
                   </Tr>  
                  ))}
                </Tbody>
              </Table>
            </Box>
          )
        }
      </Box>
    </Box>
        </>

  );
};

export default UploadEmployeeExpensives;