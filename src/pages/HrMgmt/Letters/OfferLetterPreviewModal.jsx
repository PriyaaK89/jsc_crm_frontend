import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import html2pdf from "html2pdf.js";

const OfferLetterPreviewModal = ({
  isOpen,
  onClose,
  employee,
  formData,
}) => {
  const handleDownloadPDF = () => {
    const element = document.getElementById("offer-letter-preview");

    html2pdf()
      .set({
        margin: 10,
        filename: `Offer_Letter_${employee.name}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4" },
      })
      .from(element)
      .save();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Offer Letter Preview</ModalHeader>

        <ModalBody>
          <Box id="offer-letter-preview">
            <Text mt={2}>Dear {employee.name},</Text>

            <Text mt={3}>
              We are pleased to offer you the position of{" "}
              <b>{employee.job_role_name}</b> in the{" "}
              <b>{employee.department_name}</b>.
            </Text>

            <Text mt={3}>
              <b>Salary Norms:</b> {formData.salary_norms}
            </Text>

            <Text mt={2}>
              <b>Sales Target:</b> {formData.sales_target}
            </Text>

            <Text mt={2}>
              <b>Terms & Conditions:</b>
              <br />
              {formData.terms_conditions}
            </Text>

            <Text mt={4}>Regards,</Text>
            <Text><b>HR Department</b></Text>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="green" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OfferLetterPreviewModal;
