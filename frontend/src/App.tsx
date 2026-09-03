import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { ConsolePage } from "./pages/ConsolePage";

export default function App() {
  return (
    <FluentProvider theme={webLightTheme} className="min-h-screen">
      <ConsolePage />
    </FluentProvider>
  );
}
