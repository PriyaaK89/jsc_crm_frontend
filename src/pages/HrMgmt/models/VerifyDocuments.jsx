import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, useToast, Button, Text, Flex, Spinner, Badge, IconButton, Progress, Tooltip} from "@chakra-ui/react";
import { FaFilePdf, FaEye, FaDownload } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { API_ENDPOINTS } from "../../../services/endpoints";

const VerifyDocumentModel = ({ isVerifyModelOpen, onVerifyModalClose, selectedId,empName}) => {

  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [esignLoading, setEsignLoading] = useState(null);
  const [legID, setLegID] = useState('')

 const getEmployeeDocs = async () => {
  try {
    setLoading(true);
    const response = await API.get( `${API_ENDPOINTS.get_emp_docs}/${selectedId}` );
    const docs = response?.data?.data || [];
    setDocuments(docs);
    setLegID(response?.data?.data[0]?.leegality_document_id)
    console.log(response?.data?.data[0]?.leegality_document_id, "qwertyuewq")
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

   useEffect(() => {
  if (isVerifyModelOpen && selectedId) {
    getEmployeeDocs();
  }
}, [isVerifyModelOpen, selectedId]);

  // ---------check legality status ----
 const checkDocumentStatus = async (legID) => {
  try {
    const response = await API.get(
      `${API_ENDPOINTS.document_status}/${legID}`
    );

  } catch (error) {
    console.log("Document status error", error);
  }
};

  // -------get sattus color----
  const getStatusColor = (status) => {
    if (status === "signed") return "green";
    if (status === "pending") return "orange";
    return "gray";
  };

  const getProgressValue = (status) => {
    if (status === "signed") return 100;
    if (status === "completed") return 100;
    if (status === "pending") return 50;
    return 10;
  };


 const viewDocument = (url) => {
  if (!url) return;
  window.open(url, "_blank");
};

const downloadDocument = async (url, doc) => {
  try {
    if (!url) return;

    const response = await fetch(url);
    const blob = await response.blob();

    // Create custom filename
    const status = ["signed", "completed"].includes(doc.signing_status)
      ? "signed"
      : "pending";

    const fileName = `${doc.employee_name}_${doc.employee_id}_${doc.document_type}_${status}.pdf`
      .replace(/\s+/g, "_")
      .toLowerCase();

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error("Download failed", error);
    toast({
      title: "Download failed",
      description: "Unable to download file",
      status: "error",
    });
  }
};


  const sendForESign = async (docId) => {
    // console.log(docId,"docis")
    try {
      setEsignLoading(docId);
      const response = await API.post( API_ENDPOINTS.send_esign, { document_id: docId });

      if (response?.data?.status === 1) {
        toast({
          title: response?.data?.messages?.[0]?.message || "Document sent for eSign",
          status: "success",
          duration: 3000,
          isClosable: true
        });
        console.log(response?.data?.data?.invitees?.[0]?.signUrl);
        getEmployeeDocs(); // refresh status
      } else {
        toast({
          title: "Failed to send for eSign",
          description:
            response?.data?.messages?.[0]?.message || "Something went wrong",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }

    } catch (error) {
      toast({
        title: "Failed to send for eSign",
        description:
          error?.response?.data?.messages?.[0]?.message ||
          error?.response?.data?.message ||
          "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setEsignLoading(null);
    }
  };

const handleSendForESignDigio = async (docId) => {
  try {
    setEsignLoading(docId);

    const response = await API.post(
      API_ENDPOINTS.digio_send_eSign,
      { document_id: docId }
    );

    if (response?.data?.success) {
      toast({
        title: response?.data?.message || "Sent for eSign via Digio",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      console.log(response?.data?.data); 
      getEmployeeDocs();
    } else {
      toast({
        title: "Failed to send for eSign",
        description: response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    }
  } catch (error) {
    toast({
      title: "Digio eSign failed",
      description:
        error?.response?.data?.message || "Something went wrong",
      status: "error",
    });
  } finally {
    setEsignLoading(null);
  }
};

const handleCheckDigioStatus = async (docId) => {
  try {
    const response = await API.get(
      `${API_ENDPOINTS.check_digio_Status}/${docId}`
    );

    if (response?.data?.success) {
      const status = response?.data?.data?.agreement_status;

      //  If signed → fetch signed PDF
      if (status === "completed" || status === "signed") {
        await handleFetchSignedDoc(docId);
      } else {
        console.log("Still pending:", docId);
      }
    }
  } catch (error) {
    console.log("Status check failed", error);
  }
};

const handleFetchSignedDoc = async (docId) => {
  try {
    const response = await API.get(
      `${API_ENDPOINTS.download_Signed_Letter_digio}/${docId}`
    );

    if (response?.data?.success) {
      console.log("Signed document fetched & stored");

      //  Refresh documents so signed_file_url comes
      getEmployeeDocs();
    } else {
      console.log("Failed to fetch signed document");
    }

  } catch (error) {
    console.log("Fetch signed PDF failed", error);
  }
};

useEffect(() => {
  if (!documents.length) return;

  documents.forEach((doc) => {
    const isDigioDoc =
      doc.document_type === "joining_letter" ||
      doc.document_type === "agreement_letter";

    const isPending =
      !["signed", "completed"].includes(doc.signing_status);

    if (isDigioDoc && isPending && doc.id) {
      handleCheckDigioStatus(doc.id);
    }
  });
}, [documents]);

  return (
    <Modal isOpen={isVerifyModelOpen} onClose={onVerifyModalClose} size="xl">
      <ModalOverlay />

      <ModalContent width={{base: "90%",sm: "90%", md: "100%"}}>
        <Flex bg="#2e89c1" padding="12px" borderRadius="5px 5px 0px 0px">
          <Text fontSize={{sm:"14px",md: "18px", lg:"18px"}} color="white" marginBottom="0px" mb="0" fontWeight="600" >
            Employee Document ({empName})
          </Text>
        <ModalCloseButton color="white"/>
        </Flex>

        <ModalBody p={6}>
          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner size="lg" />
            </Flex>
          ) : documents.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              No documents found
            </Text>
          ) : (
            documents.map((doc) => (
              <Box key={doc.id} border="1px solid #E2E8F0"
                borderRadius="10px" p={4} mb={4}>

                <Flex justify="space-between" align={{base: "start",md:"center"}} direction={{base: "column", md: "row"}} gap={{base: 4, md: 'auto'}}>

                  <Flex align={{base: "start",md:"center"}} gap="12px">
                    <FaFilePdf size="24px" color="#E53E3E" style={{marginTop: "4px"}} />
                    <Box>
                      <Text fontWeight="600" textTransform="capitalize" fontSize={{base: "14px", md: "16px"}}>
                        {doc.document_type.replace("_", " ")}
                      </Text>

                      <Badge
                        mt="4px" fontSize={{base: "11px", md: "12px"}}
                        colorScheme={getStatusColor(doc.signing_status)}>
                        {["signed", "completed"].includes(doc.signing_status)  ? "eSigned" : "Pending"}
                      </Badge>

                    </Box>
                  </Flex>

                  {/* RIGHT ACTIONS */}
                  <Flex gap="8px">  
                    {/* VIEW DOCUMENT */}
                    <Tooltip label="View Document">
                      <IconButton
                        icon={<FaEye />}
                        size="sm"
                        onClick={() => viewDocument(doc?.file_url)}/>
                    </Tooltip>

                    {doc.signed_file_url && (
                      <Tooltip label="Download Signed Document">
                        <IconButton
                          icon={<FaDownload />}
                          size="sm"
                          colorScheme="green"
                          onClick={() => downloadDocument(doc.signed_file_url, doc)}
                        />
                      </Tooltip>
                    )}

                    {doc.document_type === "offer_letter" && (
                      <Button
                        size="sm"
                        leftIcon={<FiSend />} isLoading={esignLoading === doc.id}
                        isDisabled={["signed", "completed"].includes(doc.signing_status)}
                        colorScheme="blue" onClick={() => sendForESign(doc.id)} fontSize={{base: "11px", md: "14px"}}>
                        Send eSign
                      </Button>
                    )}

                    {doc.document_type === "joining_letter" && (
                      <>
                        <Button
                          size="sm"
                          leftIcon={<FiSend />}
                          isLoading={esignLoading === doc.id}
                          colorScheme="blue" fontSize={{base: "11px", md: "14px"}}
                          isDisabled={["signed", "completed"].includes(doc.signing_status)}
                          onClick={() => handleSendForESignDigio(doc.id)}
                        >
                          {["signed", "completed"].includes(doc.signing_status) ? "Signed" : "Send eSign"}
                        </Button>
                        <Button size="sm" colorScheme="purple" fontSize={{base: "11px", md: "14px"}}>
                          Send eStamp
                        </Button>
                      </>
                    )}

                    {doc.document_type === "agreement_letter" && (
                      <>
                       <Button
                          size="sm"
                          leftIcon={<FiSend />} isLoading={esignLoading === doc.id}
                          colorScheme="blue" fontSize={{base: "11px", md: "14px"}}
                          isDisabled={["signed", "completed"].includes(doc.signing_status)}
                          onClick={() => handleSendForESignDigio(doc.id)}>
                          Send eSign
                        </Button>
                      <Button size="sm" colorScheme="purple" fontSize={{base: "11px", md: "14px"}}>
                        Send eStamp
                      </Button>
                      </>
                    )}

                  </Flex>
                </Flex>

                <Progress
                  mt={4}
                  value={getProgressValue(doc.signing_status)}
                  size="sm" borderRadius="md" />
              </Box>
            ))
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VerifyDocumentModel;