import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "../../services/endpoints";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Img,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
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
import { FiEdit2, FiTrash2, FiSearch, FiFileText } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { CloseIcon } from "@chakra-ui/icons";
import sort_icon from "../../assets/sort.svg";

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
  const [selectedId, setSelectedId] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [empName, setEmpName] = useState("");

  const navigate = useNavigate();

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();

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

  const headers = [
    "Profile Image",
    "Name",
    "Email",
    "Department",
    "Role",
    "Contact",
    "City / State",
    "Salary (Rs.)",
    "DOJ",
    "Leaves",
    "Login",
    "Logout",
    // "Last Seen",
    "Approver",
    "View Doc",
    "Action",
    "Generate Letters",
  ];

  const getColumnWidth = (header) => {
    switch (header) {
      case "Profile Image":
        return "140px";
      case "Name":
        return "150px";
      case "Email":
        return "250px";
      case "Department":
      case "Role":
      case "Approver":
        return "180px";
      case "Contact":
      case "Salary (Rs.)":
      case "DOJ":
      case "Login":
      case "Logout":
      // case "Last Seen":
      case "View Doc":
      case "Action":
        return "160px";
      case "City / State":
        return "200px";
      case "Generate Letters":
        return "320px";
      default:
        return "160px";
    }
  };

  const fetchEmployeeList = async () => {
    try {
      setLoading(true);

      const response = await API.get(API_ENDPOINTS.GET_USERS, {
        params: { page, limit, search },
      });

      if (response.status === 200) {
        setEmpList(response?.data?.data || []);

        const pg = response?.data?.pagination || {};
        setTotalItems(pg.total || 0);
        setPage(pg.page || 1);
        setLimit(pg.limit || 10);
        setTotalPages(pg.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch employee list:", error);
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
    date.setHours(Number(hours), Number(minutes));

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
    setSelectedId(id);
    onDeleteModalOpen();
  };

  const handleViewDocs = (id) => {
    setSelectedId(id);
    onOpen();
  };

  const handleVerifyModal = (id, name) => {
    setSelectedId(id);
    setEmpName(name);
    onVerifyModalOpen();
  };

  const getImageUrl = (url) => {
    const BASE_URL = "https://your-api-domain.com";

    if (!url) return "";
    if (url.startsWith("http")) return url;

    return `${BASE_URL}${url}`;
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
                  zIndex: 1,
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
                "&::-webkit-scrollbar": { width: "8px", height: "8px" },
                "&::-webkit-scrollbar-thumb": {
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
                minW="2950px"
                className="productsTable"
                tableLayout="fixed"
              >
                <Thead>
                  <Tr>
                    {headers.map((header, index) => (
                      <Th
                        key={index}
                        fontSize="14px"
                        fontWeight="500"
                        color="#2C2D33"
                        textTransform="capitalize"
                        width={getColumnWidth(header)}
                      >
                        <Flex alignItems="center" gap="7px">
                          <Text
                            fontSize="14px"
                            color="#2C2D33"
                            fontWeight="400"
                            textTransform="capitalize"
                            fontFamily="InterRegular"
                            overflow="hidden"
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
                        <Td width="140px" fontWeight="medium">
                          <Avatar
                            h="40px"
                            w="40px"
                            name={emp?.name}
                            src={getImageUrl(emp?.profile_image_url)}
                            cursor={emp?.profile_image_url ? "pointer" : "default"}
                            onClick={() => {
                              if (emp?.profile_image_url) {
                                setSelectedImage(getImageUrl(emp.profile_image_url));
                                onImageOpen();
                              }
                            }}
                          />
                        </Td>

                        <Td fontWeight="medium">{emp?.name || "-"}</Td>
                        <Td>{emp?.email || "-"}</Td>
                        <Td>{emp?.department_name || "-"}</Td>
                        <Td>{emp?.job_role_name || "-"}</Td>
                        <Td>{emp?.contact_no || "-"}</Td>
                        <Td>
                          {emp?.city || "-"}, {emp?.state || "-"}
                        </Td>
                        <Td>{emp?.salary || "-"}</Td>
                        <Td>
                          {emp?.date_of_joining
                            ? new Date(emp.date_of_joining).toLocaleDateString()
                            : "-"}
                        </Td>
                        <Td>{emp?.total_leaves ?? "-"}</Td>
                        <Td>{formatTime(emp?.login_time)}</Td>
                        <Td>{formatTime(emp?.logout_time)}</Td>
                       {/* <Td>
                          {emp?.last_seen
                            ? new Date(emp.last_seen).toLocaleString()
                            : "-"}
                        </Td> */}
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
                                onClick={() => handleDelete(emp?.id)}
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
                                  navigate(`/generate-offer-letter/${emp?.id}`)
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
                                  navigate(`/generate-joining-letter/${emp?.id}`)
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
                                  navigate(`/generate-agreement/${emp?.id}`)
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
                      <Td colSpan={17} textAlign="center">
                        No employees found.
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

      <Modal isOpen={isImageOpen} onClose={onImageClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalBody p={0}>
            <Box
              position="relative"
              borderRadius="xl"
              overflow="hidden"
              maxH="80vh"
              maxW="500px"
              mx="auto"
            >
              <IconButton
                icon={<CloseIcon />}
                position="absolute"
                top="10px"
                right="10px"
                zIndex="2"
                size="sm"
                borderRadius="full"
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: "blackAlpha.800" }}
                onClick={onImageClose}
                aria-label="Close"
              />

              <Image
                src={selectedImage}
                alt="Profile"
                w="100%"
                h="100%"
                maxH="80vh"
                objectFit="contain"
                borderRadius="xl"
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmployeeList;
