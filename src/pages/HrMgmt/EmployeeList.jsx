import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,

} from "@chakra-ui/react";
import { GoHomeFill } from "react-icons/go";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import ViewUploadedDocument from "./DocUpload/ViewDocuments";
import UpdateEmpStatus from "../../utils/Emp/UpdateEmpStatus";
import DeleteEmployeeModel from "./DeleteEmployee";

const EmployeeList = () => {
  const [empList, setEmpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [selectedId, setSelectedId] = useState('');
  const navigate = useNavigate();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  const fetchEmployeeList = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.GET_USERS, {
        params: { page, limit, search },
      });

      if (response.status === 200) {
        setEmpList(response.data.data || []);
        const pg = response.data.pagination || {};
        setTotalItems(pg.total || 0);
        setPage(pg.page || 1);
        setLimit(pg.limit || 10);
        setTotalPages(pg.totalPages || 1);
      }
    } catch (error) {
      console.error("Employee List Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeList();
  }, [page, limit, search]);

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

  const handleEdit = (id) => {
    navigate(`/edit-employee-details/${id}`);
  };

  const handleDelete = (id) => {
    onDeleteModalOpen();
    setSelectedId(id)
  };

  const handleViewDocs = (id) => {
    onOpen();
  };

  return (
    <>
      <ViewUploadedDocument isOpen={isOpen} onClose={onClose} selectedId={selectedId} />
      <DeleteEmployeeModel isDeleteModalOpen={isDeleteModalOpen} onDeleteModalClose={onDeleteModalClose} selectedId={selectedId} fetchEmployeeList={fetchEmployeeList} />
      <Box backgroundColor='white' mt='1rem' padding='12px 20px' borderRadius='15px 15px 0px 0px'>
        {/* Header */}
        <HStack justify="space-between" mb={4}>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">
                <GoHomeFill />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href='/hr-mgmt/view-employee-list' color='#8B8D97' fontSize='13px'>Employee List</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Box w="40%">
            <InputGroup>
              <Input
                placeholder="Search by Employee Name"
                borderRadius="30px"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </InputGroup>
          </Box>
        </HStack>

        {/* Table */}
        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table size="sm" minW="1700px" variant="simple">
              <Thead bg="gray.50" >
                <Tr>
                  {["Name", "Email", "Department", "Role", "Contact", "City / State", "Salary(Rs.)", "DOJ", "Leaves", "Login", "Logout", "Approver", "View Doc", "Action", "Generate Letters"].map((header, index) => (
                    <Th key={index} fontSize='14px' fontWeight='500' color='#2C2D33' textTransform='capitalize'
                      width={header === "Name" ? "7%" : "auto" && header === "Role" ? '11%' : 'auto' && header === "Login" ? "8%" : 'auto'} borderColor='#D9D9D9'
                    >
                      <Flex alignItems="center" gap='7px'>
                        <Text fontSize='14px' color='#2C2D33' fontWeight='400' textTransform='capitalize' fontFamily='InterRegular'>
                          {header}
                        </Text>
                        {/* <Img src={sort_icon} alt='sort_icon' /> */}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              </Thead>

              <Tbody>
                {empList.length > 0 ? (
                  empList.map((emp) => (
                    <Tr key={emp.id} _hover={{ bg: "gray.50" }}>
                      <Td>{emp.name}</Td>
                      <Td>{emp.email}</Td>
                      <Td>{emp.department_name}</Td>
                      <Td>{emp.job_role_name}</Td>
                      <Td>{emp.contact_no || "-"}</Td>
                      <Td>
                        {emp.city || "-"}, {emp.state || "-"}
                      </Td>
                      <Td>{emp.salary || "-"}</Td>
                      <Td>
                        {emp.date_of_joining
                          ? new Date(
                              emp.date_of_joining
                            ).toLocaleDateString()
                          : "-"}
                      </Td>
                      <Td>{emp.total_leaves || "-"}</Td>
                      <Td>{formatTime(emp.login_time)}</Td>
                      <Td>{formatTime(emp.logout_time)}</Td>
                      <Td>{emp.approver_name || "-"}</Td>

                      <Td>
                        <Tooltip label="View Employee Documents" hasArrow>
                          <IconButton
                            icon={<FaEye style={{ width: "21px" }} />}
                            size="sm"
                            variant="ghost"
                            color="blue.600"
                            _hover={{ bg: "blue.50" }}
                            aria-label="View Documents"
                            onClick={() => handleViewDocs(emp?.id)}
                          />
                        </Tooltip>
                      </Td>

                      <Td>
                        <Flex gap="10px" justify="center">

                          <UpdateEmpStatus userId={emp.id} currentStatus={emp.is_active === 1 ? "activate" : "deactivate"} onSuccess={fetchEmployeeList} />

                          <Tooltip label="Edit Employee" hasArrow>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="ghost"
                              color="blue.600"
                              _hover={{ bg: "blue.50" }}
                              aria-label="Edit"
                              onClick={() => handleEdit(emp?.id)} />
                          </Tooltip>

                          <Tooltip label="Delete Employee" hasArrow>
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm" variant="ghost" color="red.600"
                              _hover={{ bg: "red.50" }} aria-label="Delete"
                              onClick={() => handleDelete(emp.id)}/>
                          </Tooltip>
                        </Flex>
                      </Td>
                      <Td >
                        <Flex gap="8px">
                          <Tooltip label="Generate Offer Letter">
                            <Button size="xs" colorScheme="blue"
                              onClick={() => navigate(`/generate-offer-letter/${emp.id}`)}>
                              Offer
                            </Button>
                          </Tooltip>

                          <Tooltip label="Generate Joining Letter">
                            <Button size="xs" colorScheme="green"
                              onClick={() => navigate(`/generate-joining-letter/${emp.id}`)}>
                              Joining
                            </Button>
                          </Tooltip>

                          <Tooltip label="Generate Agreement">
                            <Button size="xs" colorScheme="purple"
                              onClick={() => navigate(`/generate-agreement-letter/${emp.id}`)}>
                              Agreement
                            </Button>
                          </Tooltip>
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={15} textAlign="center" py={6}>
                      No employees found.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </>
  );
};

export default EmployeeList;