import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  Stack,
  DataTable,
  TextField,
  Icon,
  Modal,
} from "@shopify/polaris";
import { SearchMinor, PlusMinor, EditMinor, DeleteMinor } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import QuickLinks from "./QuickLinks";
import CSVUpload from "./ClothCSVUpload";

export default function ClothSizeDataManagement() {

  const [brands, setBrands] = useState([]);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [brandName, setBrandName] = useState("");
  const [editingBrand, setEditingBrand] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* ================= FETCH BRANDS ================= */

  

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/proxy/v1/clothes/brands");
      const data = res.data.data || [];

      setBrands(data);

      const formattedRows = data.map((brand) => [
        brand.name,
        new Date(brand.updated_at).toLocaleString(),
        <Stack spacing="tight">
          <Button
            plain
            icon={EditMinor}
            onClick={() => openEditModal(brand)}
          />
          <Button
            plain
            destructive
            icon={DeleteMinor}
            onClick={() => deleteBrand(brand.id)}
          />
        </Stack>,
      ]);

      setRows(formattedRows);

    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD / EDIT ================= */

const openAddModal = () => {
  setEditingBrand(null);
  setBrandName("");
  setErrorMessage("");  
  setIsModalOpen(true);
};

const openEditModal = (brand) => {
  setEditingBrand(brand);
  setBrandName(brand.name);
  setErrorMessage("");   
  setIsModalOpen(true);
};

  

const handleSave = async () => {
  // Frontend validation
  if (!brandName.trim()) {
    setErrorMessage("Brand name is required.");
    return;
  }

  try {
    if (editingBrand) {
      await axios.put(`/api/proxy/v1/clothes/brands/${editingBrand.id}`, {
        name: brandName.trim(),
      });
    } else {
      await axios.post("/api/proxy/v1/clothes/brands", {
        name: brandName.trim(),
      });
    }

    setIsModalOpen(false);
    setErrorMessage("");
    fetchBrands();

  } catch (error) {
    if (error.response && error.response.status === 409) {
      setErrorMessage("Brand already exists.");
    } else if (error.response?.data?.message) {
      setErrorMessage(error.response.data.message);
    } else {
      setErrorMessage("Something went wrong. Please try again.");
    }
  }
};

  /* ================= DELETE ================= */

const deleteBrand = async (id) => {
  if (!window.confirm("Are you sure you want to delete this brand?")) return;

  try {
    await axios.delete(`/api/proxy/v1/clothes/brands/${id}`);
    fetchBrands();
  } catch (error) {
    console.error("Error deleting brand:", error);
  }
};

  /* ================= SEARCH FILTER ================= */

  const filteredRows = brands
    .filter((brand) =>
      brand.name.toLowerCase().includes(search.toLowerCase())
    )
    .map((brand) => [
      brand.name,
      new Date(brand.updated_at).toLocaleString(),
      <Stack spacing="tight">
        <Button
          plain
          icon={EditMinor}
          onClick={() => openEditModal(brand)}
        />
        <Button
          plain
          destructive
          icon={DeleteMinor}
          onClick={() => deleteBrand(brand.id)}
        />
      </Stack>,
    ]);

  /* ================= MOUNT ================= */

  useEffect(() => {
    fetchBrands();
  }, []);

  /* ================= UI ================= */

  return (
    <Page
      fullWidth
      title="Cloth Brand Management"
      subtitle="Manage cloth brands and their sizing charts."
    >
      <Layout>
        <Layout.Section>
          <Stack distribution="fill" spacing="tight">

            {/* Quick Links - 10% */}
            <Stack.Item fill={false} style={{ width: "10%" }}>
              <Card>
                <Card.Section>
                  <QuickLinks />
                </Card.Section>
              </Card>
            </Stack.Item>

            {/* Brand Table - 60% */}
            <Stack.Item fill={false} style={{ width: "60%" }}>
              <Card>
                <Card.Section>

                  <Stack distribution="fill" alignment="center" style={{ marginBottom: 16 }}>
                    <TextField
                      placeholder="Search brands..."
                      prefix={<Icon source={SearchMinor} />}
                      value={search}
                      onChange={setSearch}
                    />
                    <Button primary icon={PlusMinor} onClick={openAddModal}>
                      Add Brand
                    </Button>
                  </Stack>

                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["Brand Name", "Last Updated", "Actions"]}
                    rows={filteredRows}
                    loading={loading}
                    footerContent={`Showing ${filteredRows.length} brand(s)`}
                  />

                </Card.Section>
              </Card>
            </Stack.Item>

            {/* CSV Upload - 30% */}
            <Stack.Item fill={false} style={{ width: "30%" }}>
              <CSVUpload onUploadSuccess={fetchBrands} />
            </Stack.Item>

          </Stack>
        </Layout.Section>
      </Layout>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrorMessage("");   // clear error when closing
        }}
        title={editingBrand ? "Edit Brand" : "Add Brand"}
        primaryAction={{ content: "Save", onAction: handleSave }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setIsModalOpen(false);
              setErrorMessage("");
            },
          },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Brand Name"
            value={brandName}
            onChange={setBrandName}
            autoComplete="off"
            error={errorMessage ? errorMessage : undefined}
          />
        </Modal.Section>
      </Modal>
    </Page>
  );
}