import {
  Page,
  Layout,
  Card,
  Button,
  DataTable,
  Badge,
  Text,
  Stack,
  Toast,
  Spinner,
} from "@shopify/polaris";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

const SizeDataManagement = () => {
  const fetch = useAuthenticatedFetch();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  /* =========================
     FETCH BRAND SUMMARY
  ========================= */
  const loadBrands = useCallback(async () => {
    try {
      const res = await fetch("/api/size-brands-summary");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setBrands(data.data);
      } else if (Array.isArray(data)) {
        setBrands(data);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
      setBrands([]);
    }
  }, [fetch]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  /* =========================
     CSV UPLOAD HANDLER
  ========================= */
  const handleCSVUpload = async (file) => {
    if (!file) return;

    // Validate extension instead of MIME (more reliable)
    if (!file.name.endsWith(".csv")) {
      setToastMessage("Please upload a valid .csv file.");
      setToastError(true);
      setToastActive(true);
      return;
    }

    const formData = new FormData();
    formData.append("csv_file", file);

    setUploading(true);

    try {
      const response = await fetch("/api/proxy/v1/import-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setToastMessage(data.message || "Upload failed.");
        setToastError(true);
      } else {
        setToastMessage(
          data.message ||
            "CSV file uploaded and import job dispatched successfully"
        );
        setToastError(false);

        // Reload brand summary
        loadBrands();
      }

      setToastActive(true);
    } catch (error) {
      console.error("Upload error:", error);
      setToastMessage("Network error. Please try again.");
      setToastError(true);
      setToastActive(true);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setUploading(false);
  };

  /* =========================
     TABLE ROWS
  ========================= */
  const rows = brands.map((b) => [
    b.brand_name || "—",
    b.specialist_category || "—",
    `${b.rules_count || 0} Rules`,
    `${b.updated_at || "—"} by ${b.updated_by || "—"}`,
    <Badge status={b.status === "Live" ? "success" : "attention"}>
      {b.status || "Draft"}
    </Badge>,
    "⋮",
  ]);

  return (
    <Page
      fullWidth
      title="Size Data Management"
      subtitle="Upload and manage shoe size charts via CSV."
      primaryAction={{
        content: "Upload CSV",
        loading: uploading,
        onAction: () => fileInputRef.current?.click(),
      }}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => handleCSVUpload(e.target.files[0])}
      />

      <Layout>
        {/* MAIN TABLE */}
        <Layout.Section>
          <Card padding="0">
            {uploading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <Spinner size="large" />
                <p>Uploading and dispatching import job...</p>
              </div>
            ) : (
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={[
                  "Brand",
                  "Specialist Category",
                  "Mapped Sizes",
                  "Last Modified",
                  "Visibility",
                  "Actions",
                ]}
                rows={rows}
              />
            )}
          </Card>
        </Layout.Section>

        {/* SIDE PANEL */}
        <Layout.Section secondary>
          <Card title="CSV Upload Instructions">
            <Stack vertical>
              <Text as="p">
                Ensure your CSV contains the following required headers:
              </Text>

              <Text as="p">
                brand_name, size_category, internal_group,
                measurement_type, measurement_name, style,
                width_group, us_size, uk_size, eu_size,
                value_cm_min, value_cm_max,
                value_inches_min, value_inches_max
              </Text>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* TOAST */}
      {toastActive && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setToastActive(false)}
        />
      )}
    </Page>
  );
};

export default SizeDataManagement;
