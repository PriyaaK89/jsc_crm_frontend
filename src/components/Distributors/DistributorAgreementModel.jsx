
import { Box, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, useToast, Button, Text, Flex, Spinner, Badge, IconButton, Progress, Tooltip } from "@chakra-ui/react";
import { FaFilePdf, FaEye, FaDownload } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { API_ENDPOINTS } from "./../../services/endpoints";

const DistributorAgreementModel = ({
  isOpen,
  onClose,
  selectedId,
  firm_name
}) => {

  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downoladloding, setDownloading] = useState(false)
  const [esignLoading, setEsignLoading] = useState(null);
  const [documentId, setDocumentId] = useState('');
  const [isPollingStopped, setIsPollingStopped] = useState(false);
  // console.log(selectedId, "Selected ID")

  // --------------------------get distributor ------------------------------------------------

  const getdistributordoc = async () => {
    try {
      setLoading(true);
      const response = await API.get(`${API_ENDPOINTS.get_distributor_agreement_pdf}/${selectedId}`);

      if (response.status === 200) {
        const docs = Array.isArray(response?.data?.data)
          ? response.data.data
          : response?.data?.data
            ? [response.data.data]
            : [];
        setDocuments(docs);
        setDocumentId(response?.data?.data?.digio_document_id || '');
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (isOpen && selectedId) {
      getdistributordoc(selectedId);
    }
  }, [isOpen, selectedId]);

  // ---------check digio document status -------------------------------------------------
  const checkDocumentStatus = async (selectedId) => {
    try {
      const response = await API.get(
        `${API_ENDPOINTS.get_distributor_esign_status}/${selectedId}`
      );

      const doc = response?.data?.data;

      if (!doc) return false;

      const isCompleted = doc?.agreement_status === "completed";

      if (isCompleted) {
        // await fetchSignedDocument(doc.id);
        getdistributordoc(); //  refresh UI
        return true; // stop polling
      }

      getdistributordoc();
      return false;

    } catch (error) {
      console.log("Document status error", error);
      return false;
    }
  };

  useEffect(() => {
    if (!selectedId || isPollingStopped) return;

    const interval = setInterval(async () => {
      const isCompleted = await checkDocumentStatus(selectedId); //  correct

      if (isCompleted) {
        setIsPollingStopped(true);
        clearInterval(interval);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedId]);

  // ---------------------status api response ----------------------
  const getAgreementUIStatus = (doc) => {
    const status = doc?.signing_status;
    if (status === "completed") return "signed";
    if (status === "requested") return "requested";

    return "pending";
  };

  // -------get sattus color----------------------------------------------------------------
  const getStatusColor = (status) => {
    if (status === "signed") return "green";
    if (status === "requested") return "blue";
    return "orange";
  };


  const getProgressValue = (status) => {
    if (status === "signed") return 100;
    if (status === "requested") return 60;
    return 20;
  };


  const viewDocument = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  // ---------download document ------------------------------------------------
 const downloadDocument = async (selectedId) => {
  try {
    setDownloading(true); //  start loading

    const response = await API.get(
      `${API_ENDPOINTS.download_distributor_signed_agreement}/${selectedId}`
    );

    const fileUrl = response?.data?.download_url;

    if (!fileUrl) {
      toast({
        title: "Download URL not found",
        status: "error",
      });
      setDownloading(false);
      return;
    }

   
    const fileResponse = await fetch(fileUrl);
    const blob = await fileResponse.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `signed_agreement_${firm_name}.pdf`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setDownloading(false); 

  } catch (error) {
    console.log("Download failed", error);

    setDownloading(false);

    toast({
      title: "Download failed",
      description: "Unable to download PDF",
      status: "error",
    });
  }
};

  // ---------------------------------send for esign ----------------------------------------------------------------

  const sendForESign = async (documentId) => {
    try {
      setEsignLoading(documentId);
      const response = await API.post(API_ENDPOINTS.get_distributor_send_esign, { distributor_id: selectedId });

      if (response?.data?.status === 1) {
        toast({
          title: response?.data?.messages?.[0]?.message || "Document sent for eSign",
          status: "success",
          duration: 3000,
          isClosable: true
        });


        getdistributordoc(); // refresh status
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
  // s--------------------signed document downoal ------------------------
  // const downloadDocument = async (doc) => {

  //   try {
  // fetchSignedDocument(url)

  //     const response = await fetch(url);
  //     const blob = await response.blob();

  //     const fileName = `${doc?.file_name || "agreement"}`.replace(/\s+/g, "_");

  //     const link = document.createElement("a");
  //     link.href = window.URL.createObjectURL(blob);
  //     link.download = fileName;

  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(link.href);

  //   } catch (error) {
  //     console.error("Download failed", error);

  //     toast({
  //       title: "Download failed",
  //       description: "Unable to download file",
  //       status: "error",
  //     });
  //   }
  // };





  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />

      <ModalContent width={{ base: "90%", sm: "90%", md: "100%" }}>
        <Flex bg="#2e89c1" padding="12px" borderRadius="5px 5px 0px 0px">
          <Text fontSize={{ sm: "14px", md: "18px", lg: "18px" }} color="white" marginBottom="0px" mb="0" fontWeight="600" >
            Employee Document <strong>({" " + firm_name + " "})</strong>
          </Text>
          <ModalCloseButton color="white" />
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
            documents.map((doc) => {

              const status = getAgreementUIStatus(doc);
              return (
                <Box key={doc.id} border="1px solid #E2E8F0"
                  borderRadius="10px" p={4} mb={4}>

                  <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={{ base: 4, md: 'auto' }}>

                    <Flex align={{ base: "start", md: "center" }} gap="12px">
                      <FaFilePdf size="24px" color="#E53E3E" style={{ marginTop: "4px" }} />
                      <Box>
                        <Text fontWeight="600" textTransform="capitalize">
                          {doc?.document_type}
                        </Text>


                        <Badge colorScheme={getStatusColor(status)}>
                          {status === "signed"
                            ? "Signed"
                            : status === "requested"
                              ? "Requested"
                              : "Pending"}
                        </Badge>
                      </Box>
                    </Flex>

                    <Flex gap="8px">
                      <Tooltip label="View Document">
                        <IconButton
                          icon={<FaEye />}
                          size="sm"
                          onClick={() => viewDocument(doc?.presigned_url)}
                        />
                      </Tooltip>

                      {status === "signed" && (
                        <Tooltip label="Download Signed Document">
                          <IconButton
                            icon={downoladloding ? <Spinner size="sm" /> : <FaDownload />}
                            size="sm"
                            colorScheme="green"
                            isLoading={downoladloding}
                            isDisabled={downoladloding}
                            onClick={() => downloadDocument(doc?.distributor_id)}
                          />
                        </Tooltip>
                      )}

                      {doc.document_type === "agreement" && (
                        <Button
                          size="sm"
                          leftIcon={<FiSend />}
                          isLoading={esignLoading === doc.id}
                          isDisabled={status === "signed"}
                          colorScheme="blue"
                          onClick={() => sendForESign(doc.id)}
                        >
                          Send eSign
                        </Button>
                      )}
                    </Flex>
                  </Flex>

                  <Progress
                    mt={4}
                    value={getProgressValue(status)}
                    size="sm"
                    borderRadius="md"
                  />
                </Box>
              );
            })
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DistributorAgreementModel;