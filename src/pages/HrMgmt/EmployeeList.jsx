import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { data, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  IconButton,
  Img,
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
import sort_icon from "../../assets/sort.svg";
import { FiEdit2, FiTrash2, FiSearch, FiFileText } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import ViewUploadedDocument from "./DocUpload/ViewDocuments";
import UpdateEmpStatus from "../../utils/Emp/UpdateEmpStatus";
import DeleteEmployeeModel from "./DeleteEmployee";
import VerifyDocumentModel from "./models/VerifyDocuments";
import Pagination from "../../Pagination/Pagination";

const EmployeeList = () => {
  const [empList, setEmpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [selectedId, setSelectedId] = useState("");
  const [empName, setEmpName] = useState("");
  const navigate = useNavigate();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const {
    isOpen: isVerifyModelOpen,
    onOpen: onVerifyModalOpen,
    onClose: onVerifyModalClose,
  } = useDisclosure();

  const fetchEmployeeList = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_ENDPOINTS.GET_USERS, {
        params: { page, limit, search },
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
    navigate(`/edit-employee-details/${empId}`);
  };

  const handleView = (id) => {
    navigate(`/view-employee-details/${id}`);
  };

  const handleDelete = (id) => {
    onDeleteModalOpen();
    setSelectedId(id);
  };
  const tableHeader = [
    "Name",
    "Email",
    "Department",
    "Role",
    "Contact",
    "City / State",
    "Salary(Rs.)",
    "DOJ",
    "Leaves",
    "Login",
    "Logout",
    "Approver",
    "View Doc",
    "Action",
    "Generate Letters",
  ];
  const widthMap = {
    Name: "150px",
    Email: "250px",
    Department: "180px",
    Role: "180px",
    Contact: "150px",
    "City / State": "200px",
    "Salary(Rs.)": "150px",
    DOJ: "140px",
    Leaves: "120px",
    Login: "150px",
    Logout: "150px",
    Approver: "180px",
    "View Doc": "140px",
    Action: "160px",
    "Generate Letters": "320px",
  };

  const handleViewDocs = (id) => {
    onOpen();
    setSelectedId(id);
  };

  const handleVerifyModal = (id, name) => {
    onVerifyModalOpen();
    setSelectedId(id);
    setEmpName(name);
  };
  return (
    <>
      <VerifyDocumentModel
        isVerifyModelOpen={isVerifyModelOpen}
        onVerifyModalClose={onVerifyModalClose}
        selectedId={selectedId}
        fetchEmployeeList={fetchEmployeeList}
        empName={empName}
      />
      <ViewUploadedDocument
        isOpen={isOpen}
        onClose={onClose}
        selectedId={selectedId}
      />
      <DeleteEmployeeModel
        isDeleteModalOpen={isDeleteModalOpen}
        onDeleteModalClose={onDeleteModalClose}
        selectedId={selectedId}
        fetchEmployeeList={fetchEmployeeList}
      />
      {/* <Box backgroundColor='white' mt='1rem' padding='12px 20px' borderRadius='15px 15px 0px 0px' width="100%"> */}
      <Box
        backgroundColor="white"
        mt="1rem"
        padding="12px 20px"
        pt={{ base: 2, md: 3 }}
        px={{ base: 1, md: 4 }}
        borderRadius="15px 15px 0px 0px"
        width="100%"
      >
        <HStack justifyContent="space-between">
          <Breadcrumb color="#8B8D97" padding="10px 0px 1rem 0px">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                <GoHomeFill color="#5570F1" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} color="#8B8D97" fontSize="13px">
                Employee List
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </HStack>
        <Flex justifyContent="space-between" mb={4} alignItems="baseline">
          <Box>
            <Text color="#45464E" fontSize="13px" fontWeight="500">
              Employee List Management
            </Text>
          </Box>
          <Box position="relative" w="40%">
            <InputGroup justifyContent="end">
              <Box
                display={{ base: "none", md: "none", lg: "block" }}
                style={{
                  color: "#8C8C91",
                  position: "absolute",
                  top: "10px",
                  right: "16px",
                }}
              >
                <FiSearch fontSize="20px" />
              </Box>

              <Input
                placeholder="Search by Employee Name"
                border="1px solid #CFD3D4"
                borderRadius="32px"
                _placeholder={{ fontSize: "16px", color: "#8C8C91" }}
                boxShadow="0px 2px 2px #e5e5e5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Box>
        </Flex>

        {/* Table */}
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="sm"
          border="1px solid #e5e5e5"
          width="100%"
        >
          {loading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Box
              overflowX="auto"
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
              <Table
                variant="striped"
                colorScheme="gray"
                size="sm"
                minW="2650px"
                className="productsTable"
              >
                <Thead>
                  <Tr>
                    {tableHeader.map((header,index) =>(

                    <Th
                      key={index}
                      fontSize="14px"
                      fontWeight="500"
                      color="#2C2D33"
                      textTransform="capitalize"
                      width={widthMap[header]} 

                    >
                      <Flex alignItems="center" gap="7px">
                        <Text
                          fontSize="14px"
                          color="#2C2D33"
                          fontWeight="400"
                          textTransform="capitalize"
                          fontFamily="InterRegular"
                        >
                          {header}
                        </Text>
                        <Img src={sort_icon} alt="sort_icon" />
                      </Flex>
                    </Th>
                      ))}

                  </Tr>
                </Thead>

                <Tbody>
                  {empList?.length > 0 ? (
                    empList.map((emp) => (
                      <Tr key={emp?.id}>
                        <Td fontWeight="medium">{emp?.name}</Td>
                        <Td>{emp?.email}</Td>
                        <Td>{emp?.department_name}</Td>
                        <Td>{emp?.job_role_name}</Td>
                        <Td>{emp?.contact_no || "-"}</Td>
                        <Td>
                          {emp?.city || "-"}, {emp?.state || "-"}
                        </Td>
                        <Td>{emp?.salary || "-"}</Td>
                        <Td>
                          {emp?.date_of_joining
                            ? new Date(
                                emp?.date_of_joining,
                              ).toLocaleDateString()
                            : "-"}
                        </Td>
                        <Td>{emp.total_leaves}</Td>
                        <Td>{formatTime(emp?.login_time) || "-"}</Td>
                        <Td>{formatTime(emp?.logout_time) || "-"}</Td>
                        <Td>{emp?.approver_name || "-"}</Td>
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
                        {/* ACTIONS */}
                        <Td>
                          <Flex gap="10px" justify="center">
                            <UpdateEmpStatus
                              userId={emp?.id}
                              currentStatus={
                                emp?.is_active === 1 ? "activate" : "deactivate"
                              }
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
                                onClick={() => handleEdit(emp?.id)}
                              />
                            </Tooltip>

                            <Tooltip label="View Employee" hasArrow>
                              <IconButton
                                icon={<FiFileText />}
                                size="sm"
                                variant="ghost"
                                color="blue.600"
                                _hover={{ bg: "blue.50" }}
                                aria-label="View"
                                onClick={() => handleView(emp?.id)}
                              />
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
                        <Td>
                          <Flex gap="8px">
                            <Tooltip label="Generate Offer Letter">
                              <Button
                                size="xs"
                                colorScheme="blue"
                                onClick={() =>
                                  navigate(`/generate-offer-letter/${emp.id}`)
                                }
                              >
                                Offer
                              </Button>
                            </Tooltip>

                            <Tooltip label="Generate Joining Letter">
                              <Button
                                size="xs"
                                colorScheme="green"
                                onClick={() =>
                                  navigate(`/generate-joining-letter/${emp.id}`)
                                }
                              >
                                Joining
                              </Button>
                            </Tooltip>

                            <Tooltip label="Generate Agreement">
                              <Button
                                size="xs"
                                colorScheme="purple"
                                onClick={() =>
                                  navigate(`/generate-agreement/${emp.id}`)
                                }
                              >
                                Agreement
                              </Button>
                            </Tooltip>

                            <Tooltip label="Verify Documents">
                              <Button
                                size="xs"
                                colorScheme="yellow"
                                onClick={() =>
                                  handleVerifyModal(emp?.id, emp?.name)
                                }
                              >
                                Verify Documents
                              </Button>
                            </Tooltip>
                          </Flex>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={15} textAlign="center">
                        {" "}
                        No employees found.{" "}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
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

export default EmployeeList;
