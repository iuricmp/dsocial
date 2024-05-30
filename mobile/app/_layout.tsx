// order matters here
import "react-native-polyfill-globals/auto";

// Polyfill async.Iterator. For some reason, the Babel presets and plugins are not doing the trick.
// Code from here: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html#caveats
(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator");

import { Stack } from "expo-router";
import { Provider as ReduxProvider } from "react-redux";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { store } from "@gno/redux";
import { Guard } from "@gno/components/auth/guard";
import { GnoNativeProvider } from "@gnolang/gnonative";
import { IndexerProvider } from "@gno/provider/indexer-provider";
import { View } from "react-native";
import Text from "@gno/components/text";

const gnoDefaultConfig = {
  remote: process.env.EXPO_PUBLIC_GNO_REMOTE!,
  chain_id: process.env.EXPO_PUBLIC_GNO_CHAIN_ID!,
};

const indexerDefaultConfig = {
  remote: process.env.EXPO_PUBLIC_INDEXER_REMOTE!,
};

export default function AppLayout() {
  return (
    <GnoNativeProvider config={gnoDefaultConfig}>
      <IndexerProvider config={indexerDefaultConfig}>
        <ReduxProvider store={store}>
          <ThemeProvider value={DefaultTheme}>
						<DsocialProvider
            <Guard>
              <Stack
                screenOptions={{
                  headerShown: false,
                  headerLargeTitle: true,
                  headerBackVisible: false,
                }}
              />
            </Guard>
						</DsocialProvider>
          </ThemeProvider>
        </ReduxProvider>
      </IndexerProvider>
    </GnoNativeProvider>
  );
}
