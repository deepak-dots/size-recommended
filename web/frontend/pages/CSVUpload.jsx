import { useState, useRef } from "react";
import { Card, Button, Text, Stack, Toast, Frame, Modal } from "@shopify/polaris";
import axios from "axios";

export default function CSVUpload({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  // When file selected
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setModalOpen(true); // Show confirmation modal
  };

  // Confirm Upload
  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("csv_file", selectedFile);

    try {
      setLoading(true);
      const response = await axios.post(
        "api/proxy/v1/import-csv",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setToast({ content: response.data.message || "CSV uploaded successfully", error: false });

      onUploadSuccess && onUploadSuccess();

    } catch (error) {
      setToast({ content: "Failed to upload CSV", error: true });
    } finally {
      setLoading(false);
      setModalOpen(false);
      setSelectedFile(null);

      // IMPORTANT: Reset input so same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Frame>
      {toast && (
        <Toast
          content={toast.content}
          error={toast.error}
          onDismiss={() => setToast(null)}
        />
      )}

      <Card>
        <Card.Section>
          <Stack vertical spacing="tight">
            <Text variant="headingSm">Upload CSV</Text>
            <Text as="p">
              Upload your brand CSV including all sizing and measurement data.
            </Text>

            <Button
              loading={loading}
              onClick={() => fileInputRef.current.click()}
            >
              Upload CSV
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Stack>
        </Card.Section>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm CSV Upload"
        primaryAction={{
          content: "Yes, Upload",
          onAction: handleConfirmUpload,
          loading: loading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <Text>
            Are you sure you want to upload this CSV file?
          </Text>
        </Modal.Section>
      </Modal>
    </Frame>
  );
}
