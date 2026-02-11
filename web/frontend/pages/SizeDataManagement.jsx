import {
  Page,
  Layout,
  Card,
  Button,
  Badge,
  Text,
  Stack,
  DataTable,
  Tabs,
  TextField,
  Icon,
} from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { useState } from "react";

export default function SizeDataManagement() {
  const [tab, setTab] = useState(0);

  /* =========================
     STATIC TABLE DATA
  ========================= */
  const rows = [
    [
      "Nike Adaptive",
      <Badge>AFO-Friendly</Badge>,
      "32 Rules",
      "Oct 12, 2023 by Alex Carter",
      <Badge status="success">Live</Badge>,
      "⋮",
    ],
    [
      "Friendly Shoes",
      <Badge tone="attention">Extra Wide</Badge>,
      "24 Rules",
      "Oct 10, 2023 by Alex Carter",
      <Badge status="success">Live</Badge>,
      "⋮",
    ],
    [
      "Billy Footwear",
      <Badge>Wrap-Around</Badge>,
      "45 Rules",
      "Sep 28, 2023 by Sarah Miller",
      <Badge status="attention">Draft</Badge>,
      "⋮",
    ],
  ];

  return (
    <Page
      fullWidth
      title="Size Data Management"
      subtitle="Manage specialized sizing charts for AFO-friendly, extra-wide, and brace-compatible footwear and apparel."
      primaryAction={{ content: "Upload CSV" }}
      secondaryActions={[{ content: "+ Add New Brand" }]}
    >
      <Layout>
        {/* MAIN CONTENT */}
        <Layout.Section>
          <Card>
            <Stack vertical spacing="loose">
              {/* Tabs + Search */}
              <Stack align="center" justify="space-between">
                <Tabs
                  tabs={[
                    { id: "shoes", content: "Shoe Data" },
                    { id: "clothing", content: "Clothing Data" },
                  ]}
                  selected={tab}
                  onSelect={setTab}
                />

                <div style={{ width: 260 }}>
                  <TextField
                    placeholder="Search brands or categories..."
                    prefix={<Icon source={SearchMinor} />}
                  />
                </div>
              </Stack>

              {/* Table */}
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

              <Text variant="bodySm" tone="subdued">
                Showing 3 of 12 brands
              </Text>
            </Stack>
          </Card>
        </Layout.Section>

        {/* SIDE CARD */}
        <Layout.Section secondary>
          <Card>
            <Stack vertical spacing="tight">
              <Text variant="headingSm">Accessibility Tip</Text>
              <Text as="p">
                When mapping AFO (Ankle-Foot Orthosis) users, ensure you include
                the <strong>depth measurement</strong> in your CSV upload.
                Standard sizes often lack the volume required for brace
                hardware.
              </Text>
              <Button plain>View AFO Mapping Guide</Button>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
