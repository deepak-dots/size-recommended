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
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

const SizeDataManagement = () => {
  const fetch = useAuthenticatedFetch();

  const [uploading, setUploading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  /* =========================
     FETCH BRAND SUMMARY
  ========================= */
  const loadBrands = async () => {
    try {
      const res = await fetch("/api/size-brands-summary");
      const data = await res.json();

      // Ensure data is always an array
      if (Array.isArray(data)) {
        setBrands(data);
      } else {
        setBrands([]);
        console.warn("Expected array but got:", data);
      }
    } catch (e) {
      console.error("Failed to load brands", e);
      setBrands([]);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  /* =========================
     CSV UPLOAD HANDLER
  ========================= */
  const handleCSVUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("csv_file", file);

    setUploading(true);

    try {
      const res = await fetch("/api/import-shoes-size-chart", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();

      setToastMessage(data.message || "Upload complete");
      setToastActive(true);

      if (data.success) {
        loadBrands(); // refresh table safely
      }
    } catch (e) {
      console.error("CSV upload failed", e);
      setToastMessage("CSV upload failed: network error");
      setToastActive(true);
    }

    setUploading(false);
  };

  /* =========================
     TABLE ROWS
     -- safe mapping to prevent crash if data missing
  ========================= */
  const rows = brands.map((b) => [
    b.brand_name || "—",
    b.specialist_category || "—",
    `${b.rules_count || 0} Rules`,
    `${b.updated_at || "—"} by ${b.updated_by || "—"}`,
    <Badge status={b.status === "Live" ? "success" : "attention"}>
      {b.status || "Unknown"}
    </Badge>,
    "⋮",
  ]);

  return (
    <Page
      fullWidth
      title="Size Data Management"
      subtitle="Manage specialized sizing charts for AFO-friendly, extra-wide, and brace-compatible footwear and apparel."
      primaryAction={{
        content: "Upload CSV",
        loading: uploading,
        onAction: () =>
          document.getElementById("csv-upload-input").click(),
      }}
      secondaryActions={[
        {
          content: "+ Add New Brand",
          onAction: () => alert("Add Brand Modal"),
        },
      ]}
    >
      {/* Hidden File Input */}
      <input
        id="csv-upload-input"
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => handleCSVUpload(e.target.files[0])}
      />

      <Layout>
        {/* MAIN TABLE – FULL WIDTH */}
        <Layout.Section>
          <Card padding="0">
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
          </Card>
        </Layout.Section>

        {/* SIDE PANEL */}
        <Layout.Section secondary>
          <Card title="Accessibility Tip">
            <Stack vertical>
              <Text as="p">
                When mapping AFO (Ankle-Foot Orthosis) users, ensure you include
                the <strong>depth measurement</strong> in your CSV upload.
              </Text>

              <Button plain>
                View AFO Mapping Guide
              </Button>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* TOAST */}
      {toastActive && (
        <Toast
          content={toastMessage}
          onDismiss={() => setToastActive(false)}
        />
      )}
    </Page>
  );
};

export default SizeDataManagement;
