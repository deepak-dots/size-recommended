// QuickLinks.jsx
import { Stack, Button, Text } from "@shopify/polaris";

export default function QuickLinks() {
  return (
    <Stack vertical spacing="tight">
      <Text variant="headingSm">Quick Links</Text>
      <Button plain url="/ShoeSizeDataManagement">
        Shoe Size Data Management
      </Button>
      <Button plain url="/ClothSizeDataManagement">
        Cloth Size Data Management
      </Button>
      <Button plain url="/UserAnalytics">
        User Analytics
      </Button>
      <Button plain url="/WidgetSettings">
        Widget Settings
      </Button>
      <Button plain url="/HelpCenter">
        Help Center
      </Button>
    </Stack>
  );
}
