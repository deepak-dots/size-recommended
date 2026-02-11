import { Page, Card, Checkbox, FormLayout } from "@shopify/polaris";

export default function WidgetSettings() {
  return (
    <Page title="Widget Settings">
      <Card padding="400">
        <FormLayout>
          <Checkbox label="Enable Size Widget" checked />
          <Checkbox label="Show on Product Page" checked />
        </FormLayout>
      </Card>
    </Page>
  );
}
