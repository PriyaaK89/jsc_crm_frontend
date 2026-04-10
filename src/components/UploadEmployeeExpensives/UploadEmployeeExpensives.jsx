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
  Img,
  Table,
  Thead,
  SimpleGrid,
  Text,
  Th,
  Tr,
  Td,
  InputGroup,
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
import Pagination from "../../Pagination/Pagination";
import { FiSearch } from "react-icons/fi";
import sort_icon from "../../assets/sort.svg";
import CustomDatePicker from "../common/CustomDatepicker";

const UploadEmployeeExpensives = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    select_all: "",
    hotel_amount: "",
    bus_train_toll_amount: "",
    petrol_diesel_amount: "",
    other_amount: "",
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { users = [], fetchUsers } = useUsersapi();
  const [adminExpense, setAdminExpense] = useState([]);
  const [selectData, setSelectData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expenseType, setExpenseType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchAdminExpense = async () => {
    setLoading(true);
    try {
      const response = await API.get(`${API_ENDPOINTS?.get_uploaded_exp}?page=${page}&limit=${limit}&search=${search}&expense_type=${expenseType}&start_date=${startDate}&end_date=${endDate}`);
      if (response.status === 200) {
        setAdminExpense(response.data.data);
        const pg = response.data;
        setPage(pg.page);
        setLimit(pg.limit);
        setTotalItems(pg.totalItems);
        setTotalPages(pg.total_pages);
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
  }, [page, limit, search, expenseType, startDate, endDate])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const tableHeader = ["S.No", "Name", "Hotel", "Bus Train Toll", "Petrol Diesel", "Other", "Action"];
  const tableWidth = {
  "S.No": "80px",
  Name: "150px",
  Hotel: "120px",
  "Bus Train Toll": "150px",
  "Petrol Diesel": "150px",
  Other: "120px",
  Action: "100px",
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
          petrol_diesel_amount: Number(formData.petrol_diesel_amount),
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
          petrol_diesel_amount: "",
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



  return (
    <>
      <UploadEmpExpense isOpen={isOpen} onClose={onClose} selectData={selectData} />
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
        <Box py={7} px={6} border="1px solid #ccc" boxShadow="md" borderRadius="lg">

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 5 }} spacing={6} >

            <FormControl mb={3}>
              <FormLabel>User</FormLabel>
              <Select
                placeholder="Select User"
                value={formData.user_id}
                size="sm"
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
            <FormControl mb={3} >
              <FormLabel>Hotel Amount</FormLabel>
              <Input
                type="number"
                name="hotel_amount"
                value={formData.hotel_amount}
                onChange={handleChange}
                size="sm"
              />
            </FormControl>

            <FormControl mb={3} >
              <FormLabel >Bus Train Toll Amount</FormLabel>
              <Input
                type="number"
                name="bus_train_toll_amount"
                value={formData.bus_train_toll_amount}
                onChange={handleChange}
                size="sm"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel  >Petrol Diesel Amount</FormLabel>
              <Input
                type="number"
                name="petrol_diesel_amount"
                value={formData.petrol_diesel_amount}
                onChange={handleChange}
                size="sm"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel >Other Amount</FormLabel>
              <Input
                type="number"
                name="other_amount"
                value={formData.other_amount}
                onChange={handleChange}
                size="sm"
              />
            </FormControl>

          </SimpleGrid>
          <Flex justifyContent="flex-end" mt={4}>
            <Button
              colorScheme="blue"
              isLoading={loading}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Flex>
        </Box>

        {/* heading and  buttons*/}
        <Flex
          flexDirection={{base: "column", md:"column", lg:"row"}}
            align={{base:"stretch",md:"stretch",lg:"center"}}
          mt={10}
          px={6}
          py={4}
          gap={4}
        >

          <Text flexShrink={0}>Allocate Expense Table </Text>
          {/* <Flex> */}
          <Flex flexDirection={{base:"column", md: "column", lg: "row"}} ml={{base: "0", md: "0", lg:"auto"}} gap={3} alignItems="center">


            <FormControl>
              <FormLabel>Expense Type</FormLabel>
              <Select width="100%" size="sm" value={expenseType} onChange={(e) => {
                setExpenseType(e.target.value);
                setPage(1);
                
              }}  >
                <option value="HOTEL">Hotel</option>
                <option value="BUS_TRAIN_TOLL">Bus Train Toll</option>
                <option value="PETROL_DIESEL">Petrol Diesel</option>
                <option value="OTHER">other</option>

              </Select>
            </FormControl>
        
            <CustomDatePicker
              label="Start Date"
              name="start"
              value={startDate}
              onChange={(date) => {
                setStartDate(date);
                setPage(1);
              }}
            />
            <CustomDatePicker
              label="End Date"
              name="end"
              value={endDate}
              onChange={(date) => {
                setEndDate(date);
                setPage(1)
              }}
            />

            <Box >
              <InputGroup justifyContent={{base:"start",md:"start",lg:"end"}}  width={{base:"100%", md:"100%", lg:"200px"}} mt="10px" position="relative">
                <Box display={{ base: "none", md: "none", lg: "block" }} style={{ color: '#8C8C91', position: 'absolute', top: '10px', right: '7px' }}
                >
                  <FiSearch fontSize='20px' />
                </Box>

                <Input placeholder="Search by Employee Name" border='1px solid #CFD3D4' borderRadius='32px' _placeholder={{ fontSize: '12px', color: '#8C8C91' }} boxShadow='0px 2px 2px #e5e5e5'
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </InputGroup>
            </Box>
                     </Flex>

        </Flex>


        {/* </Flex> */}

        {/* Table */}
        <Box bg="white" borderRadius="md" boxShadow="sm" border="1px solid #ccc" mt={3} >
          {
            loading ? (
              <Flex justifyContent="center" align="center" py={10}>
                <Spinner size="lg" />
              </Flex>
            ) : (
              <Box overflowX="auto"
              whiteSpace="nowrap"
              sx={{
                "&::-webkit-scrollbar": { width: "8px", height: "12px" },
                "&::-webkit-scrollbar-thumb": {
                  width: "8px",
                  backgroundColor: "#7A7A7A",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#E8E8E8",
                  borderRadius: "4px",
                },
              }}
               >
                <Table variant="striped" colorScheme="gray" size="sm" className="productsTable" minW="1200px" >
                  <Thead>
                    <Tr>
                      {
                        tableHeader.map((header, index) => (
                          <Th key={index} fontSize='14px' fontWeight='500' color='#2C2D33' textTransform='capitalize' whiteSpace="nowrap" width={header[tableWidth]}>

                              <Flex alignItems="center" gap='7px'>
                              <Text fontSize='14px' color='#2C2D33' fontWeight='400' textTransform='capitalize' fontFamily='InterRegular' >
                                {header}
                              </Text>
                              <Img src={sort_icon} alt='sort_icon' />
                            </Flex>
                          </Th>
                        ))

                      }

                    </Tr>
                  </Thead>
                  <Tbody>
                    {adminExpense.map((admin, index) => (
                      <Tr key={admin?.user_id}>
                        <Td>{index + 1}</Td>
                        <Td>{admin.employee_name}</Td>
                        <Td>{admin.allocation.HOTEL}</Td>
                        <Td>{admin.allocation.BUS_TRAIN_TOLL}</Td>
                        <Td>{admin.allocation.PETROL_DIESEL}</Td>
                        <Td>{admin.allocation.OTHER}</Td>
                        <Td>
                          <Button colorScheme="blue" onClick={() => {
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
        <Pagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      </Box>
    </>

  );
};

export default UploadEmployeeExpensives;