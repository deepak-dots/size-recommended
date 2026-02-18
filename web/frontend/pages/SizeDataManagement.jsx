// --- Existing imports remain unchanged ---
import {
  Page,
  Layout,
  Card,
  Button,
  Badge,
  Text,
  Stack,
  DataTable,
  TextField,
  Icon,
  Modal,
} from "@shopify/polaris";
import { SearchMinor, EditMinor, DeleteMinor, PlusMinor } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import QuickLinks from "./QuickLinks";
import CSVUpload from "./CSVUpload";  

export default function SizeDataManagement() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState("");

  // Fetch brand list
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await axios.get("api/proxy/v1/brands-list");
      const data = response.data.data;

      // --- Updated rows mapping ---
      const formattedRows = data.map((brand) => [
        brand.name || "N/A",
        <Badge>{brand.category || "General"}</Badge>,
        brand.mapped_sizes || "-",
        // Correct Last Modified column
        brand.updated_at
          ? new Date(brand.updated_at).toLocaleString()
          : new Date(brand.created_at).toLocaleString(),
        // Actions stack remains
        <Stack spacing="tight">
          <Button plain icon={EditMinor} onClick={() => openEditModal(brand)} />
          <Button plain icon={DeleteMinor} destructive onClick={() => deleteBrand(brand.id)} />
        </Stack>,
      ]);

      setRows(formattedRows);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filteredRows = rows.filter((row) =>
    row[0].toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingBrand(null);
    setBrandName("");
    setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name || brand[0]);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingBrand) {
        await axios.put(`api/proxy/v1/brands/${editingBrand.id}`, { name: brandName });
      } else {
        await axios.post("api/proxy/v1/brands", { name: brandName });
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
    }
  };

  const deleteBrand = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await axios.delete(`api/proxy/v1/brands/${id}`);
        fetchBrands();
      } catch (error) {
        console.error("Error deleting brand:", error);
      }
    }
  };

  return (
    <Page
      fullWidth
      title="Size Data Management"
      subtitle="Manage specialized sizing charts for AFO-friendly, extra-wide, and brace-compatible footwear."
    >
      <Layout>
        <Layout.Section>
          <Stack distribution="fill" spacing="tight">
            <Stack.Item fill={false} style={{ width: "10%" }}>
              <Card>
                <Card.Section>
                  <Text as="p" fontWeight="regular">
                    <Stack.Item fill={false} style={{ width: "20%" }}>
                      <QuickLinks />
                    </Stack.Item>
                  </Text>
                </Card.Section>
              </Card>
            </Stack.Item>

            <Stack.Item fill={false} style={{ width: "60%" }}>
              <Card>
                <Card.Section>
                  <Stack distribution="fill" alignment="center" style={{ marginBottom: "16px" }}>
                    <TextField
                      placeholder="Search brands or categories..."
                      prefix={<Icon source={SearchMinor} />}
                      value={search}
                      onChange={setSearch}
                    />
                    <Button primary icon={PlusMinor} onClick={openAddModal}>
                      Add Brand
                    </Button>
                  </Stack>

                  {/* --- Updated DataTable: removed Visibility column --- */}
                  <DataTable
                    columnContentTypes={["text", "text", "text", "text", "text"]}
                    headings={[
                      "Brand",
                      "Specialist Category",
                      "Mapped Sizes",
                      "Last Modified",
                      "Actions",
                    ]}
                    rows={filteredRows}
                    footerContent={`Showing ${filteredRows.length} of ${rows.length} brands`}
                    loading={loading}
                  />
                </Card.Section>
              </Card>
            </Stack.Item>

            <Stack.Item fill={false} style={{ width: "30%" }}>
              <Stack.Item fill={false} style={{ width: "30%" }}>
                <CSVUpload onUploadSuccess={fetchBrands} />
              </Stack.Item>
            </Stack.Item>
          </Stack>
        </Layout.Section>
      </Layout>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? "Edit Brand" : "Add Brand"}
        primaryAction={{ content: "Save", onAction: handleSave }}
        secondaryActions={[{ content: "Cancel", onAction: () => setIsModalOpen(false) }]}
      >
        <Modal.Section>
          <TextField
            label="Brand Name"
            value={brandName}
            onChange={setBrandName}
          />
        </Modal.Section>
      </Modal>
    </Page>
  );
}