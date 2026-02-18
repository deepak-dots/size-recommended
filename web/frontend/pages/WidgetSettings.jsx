import { Page, Layout, Card, Text, Stack } from "@shopify/polaris";
import QuickLinks from "./QuickLinks.jsx";

export default function UserAnalytics() {
  return (
    <Page title="User Analytics" fullWidth>
      <Layout>
        <Layout.Section>
          <Stack distribution="fill" spacing="tight">
            {/* LEFT SIDEBAR - 20% */}
            <Stack.Item fill={false} style={{ width: "20%" }}>
              <Card>
                <Card.Section>
                  <QuickLinks />
                </Card.Section>
              </Card>
            </Stack.Item>

            {/* MAIN CONTENT - 80% */}
            <Stack.Item fill={false} style={{ width: "80%" }}>
              <Card padding="400">
                <Text>Analytics & usage insights coming soon.</Text>
              </Card>
            </Stack.Item>
          </Stack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
