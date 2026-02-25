import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { data, useNavigate } from "react-router-dom";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Flex, HStack, IconButton, Img, Input, InputGroup, Select, Spinner, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr, useDisclosure } from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { FiSearch } from "react-icons/fi";
import sort_icon from "../../assets/sort.svg"
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import ViewUploadedDocument from "./DocUpload/ViewDocuments";
import UpdateEmpStatus from "../../utils/Emp/UpdateEmpStatus";
import DeleteEmployeeModel from "./DeleteEmployee";

const EmployeeList = () => {

  const [empList, setEmpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const {onOpen, onClose, isOpen} = useDisclosure();
  const [selectedId, setSelectedId] = useState('');
  const navigate = useNavigate();
  const { isOpen: isDeleteModalOpen, onOpen:  onDeleteModalOpen,  onClose: onDeleteModalClose} = useDisclosure();

  const fetchEmployeeList = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.GET_USERS, {
        params: { page, limit, search }
      });

      if (response.status === 200) {
        setEmpList(response.data.data);
        const pg = response.data.pagination;
        setTotalItems(pg.total);
        setPage(pg.page);
        setLimit(pg.limit);
        setTotalPages(pg.totalPages);
        console.log(response.data, "EMPLOYEE RESPONSE");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeList();
  }, [page, limit, search]);

  const headers = ["Name", "Email", "Department", "Role", "Contact", "City / State", "Salary(Rs.)", "DOJ", "Leaves", "Login", "Logout", "Approver",];

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

  const handleEdit = (empId) => {
    navigate(`/edit-employee-details/${empId}`)
  };

  const handleDelete = (id) => {
onDeleteModalOpen();
    setSelectedId(id)
  };

  const handleViewDocs = (id)=>{
    onOpen();
    setSelectedId(id)
  }
  return (
    <>
    <ViewUploadedDocument isOpen={isOpen} onClose={onClose} selectedId={selectedId}/>
    <DeleteEmployeeModel isDeleteModalOpen={isDeleteModalOpen} onDeleteModalClose={onDeleteModalClose} selectedId={selectedId} fetchEmployeeList={fetchEmployeeList}/>
      <Box backgroundColor='white' mt='1rem' padding='12px 20px' borderRadius='15px 15px 0px 0px'>
        {/* Header */}
        <HStack justifyContent='space-between'>
          <Breadcrumb color="#8B8D97" padding='10px 0px 1rem 0px' >
            <BreadcrumbItem>
              <BreadcrumbLink href='/dashboard'><GoHomeFill color="#5570F1" /> </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink href='/products' color='#8B8D97' fontSize='13px'>Employee List</BreadcrumbLink>
            </BreadcrumbItem>

          </Breadcrumb>
          {/* <Button backgroundColor='#3E60AA' color='white' fontWeight='400' height='36px' fontSize='14px' borderRadius='12px' _hover={{ backgroundColor: '#5570F1' }}><span style={{ fontSize: '18px', paddingRight: '10px' }}><FaPlus /></span> Create a New Product</Button> */}

        </HStack>
        <Flex justifyContent="space-between" mb={4} alignItems='baseline'>

          <Box>
            <Text color='#45464E' fontSize='13px' fontWeight='500'>Employee List Management</Text>
          </Box>
          <Box position='relative' w='40%'>
            <InputGroup justifyContent='end'>
              <FiSearch fontSize='20px' style={{ color: '#8C8C91', position: 'absolute', top: '10px', right: '16px' }} />
              <Input placeholder="Search by Employee Name" border='1px solid #CFD3D4' borderRadius='32px' _placeholder={{ fontSize: '16px', color: '#8C8C91' }} boxShadow='0px 2px 2px #e5e5e5'
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
          </Box></Flex>

        {/* Table */}
        <Box bg="white" borderRadius="md" boxShadow="sm" overflowX="auto" border="1px solid #e5e5e5" >
          {loading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Table variant="striped" colorScheme="gray" size="sm" width="2650px" className="productsTable">
              <Thead>
                <Tr>
                  {["Name", "Email", "Department", "Role", "Contact", "City / State", "Salary(Rs.)", "DOJ", "Leaves", "Login", "Logout", "Approver","View Doc", "Action", "Generate Letters"].map((header, index) => (
                    <Th key={index} fontSize='14px' fontWeight='500' color='#2C2D33' textTransform='capitalize'
                      width={header === "Name" ? "7%" : "auto" && header === "Role" ? '11%' : 'auto' && header === "Login" ? "8%" : 'auto'} borderColor='#D9D9D9'
                    >
                      <Flex alignItems="center" gap='7px'>
                        <Text fontSize='14px' color='#2C2D33' fontWeight='400' textTransform='capitalize' fontFamily='InterRegular'>
                          {header}
                        </Text>
                        <Img src={sort_icon} alt='sort_icon' />
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              </Thead>

              <Tbody>
                {empList.length > 0 ? (
                  empList.map((emp) => (
                    <Tr key={emp.id}>
                      <Td fontWeight="medium">{emp.name}</Td>
                      <Td>{emp.email}</Td>
                      <Td>{emp.department_name}</Td>
                      <Td>{emp.job_role_name}</Td>
                      <Td>{emp.contact_no || "-"}</Td>
                      <Td>{emp.city || "-"}, {emp.state || "-"}</Td>
                      <Td>{emp.salary || "-"}</Td>
                      <Td>
                        {emp.date_of_joining
                          ? new Date(emp.date_of_joining).toLocaleDateString()
                          : "-"}
                      </Td>
                      <Td>{emp.total_leaves}</Td>
                      <Td>{formatTime(emp.login_time) || "-"}</Td>
                      <Td>{formatTime(emp.logout_time) || "-"}</Td>
                      <Td>{emp.approver_name || "-"}</Td>
                      <Td>
                      <Tooltip label="View Employee Documents" hasArrow>
                            <IconButton
                              icon={<FaEye  style={{width: "21px"}}/>}
                              size="sm"
                              variant="ghost"
                              color="blue.600"
                              _hover={{ bg: "blue.50" }}
                              aria-label="View Documents"
                             onClick={()=>handleViewDocs(emp?.id)}
                            />
                          </Tooltip>
                      </Td>
                      {/* ACTIONS */}
                      <Td>
                        <Flex gap="10px" justify="center">

  <UpdateEmpStatus
                userId={emp.id}
                currentStatus={emp.is_active === 1 ? "activate" : "deactivate"}
                onSuccess={fetchEmployeeList}
              />

                          <Tooltip label="Edit Employee" hasArrow>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="ghost"
                              color="blue.600"
                              _hover={{ bg: "blue.50" }}
                              aria-label="Edit"
                              onClick={() => handleEdit(emp?.id)}/>
                          </Tooltip>

                          <Tooltip label="Delete Employee" hasArrow>
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              color="red.600"
                              _hover={{ bg: "red.50" }}
                              aria-label="Delete"
                              onClick={() => handleDelete(emp.id)}
                            />
                          </Tooltip>
                        </Flex>
                      </Td>
                      <Td >
                        <Flex gap="8px">
                        <Tooltip label="Generate Offer Letter">
  <Button
    size="xs"
    colorScheme="blue"
    onClick={() => navigate(`/generate-offer-letter/${emp.id}`)}
  >
    Offer
  </Button>
</Tooltip>

<Tooltip label="Generate Joining Letter">
  <Button
    size="xs"
    colorScheme="green"
    onClick={() => navigate(`/generate-joining-letter/${emp.id}`)}
  >
    Joining
  </Button>
</Tooltip>

<Tooltip label="Generate Agreement">
  <Button
    size="xs"
    colorScheme="purple"
    onClick={() => navigate(`/generate-agreement/${emp.id}`)}
  >
    Agreement
  </Button>
</Tooltip>
</Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={13} textAlign="center"> No employees found. </Td>
                  </Tr>
                )}
              </Tbody>

            </Table>
          )}
        </Box>

        {/* Pagination */}
        <Box w="full" p={4}>
          <Flex justify="space-between" align="center">
            {/* Items per page */}
            <Flex align="center" gap="4px">
              <Select w="69px" h="25px" size="sm" value={limit} border="none" bg="#5e63661a" color="#8B8D97" borderRadius="10px"
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>

              <Flex gap="18px" ml={2}>
                <Text fontSize="14px" color="#A6A8B1"> Items per page </Text>
                <Text fontSize="14px" color="#666">
                  {(page - 1) * limit + 1}–
                  {Math.min(page * limit, totalItems)} of {totalItems} items
                </Text>
              </Flex>
            </Flex>

            {/* Page selector */}
            <Flex align="center">
              <Select w="60px" h="25px" size="sm" value={page} border="none" bg="#5e63661a" color="#8B8D97" borderRadius="10px"
                onChange={(e) => setPage(Number(e.target.value))}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}> {i + 1} </option>
                ))}
              </Select>

              <Text ml={2} fontSize="14px" color="#666"> of {totalPages} pages </Text>

              <Flex ml={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  ‹
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  ›
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Box>

      </Box>
    </>
  )
}

export default EmployeeList