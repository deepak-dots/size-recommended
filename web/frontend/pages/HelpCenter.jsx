import { Page, Card, Text, Link } from "@shopify/polaris";

export default function HelpCenter() {
  return (
    <Page title="Help Center">
      <Card padding="400">
        <Text>
          Need help? Visit our <Link>Size Mapping Guide</Link>.
        </Text>
      </Card>
    </Page>
  );
}
