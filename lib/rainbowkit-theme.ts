import { lightTheme } from "@rainbow-me/rainbowkit";

// Maps Vellichor's design tokens (app/globals.css) onto RainbowKit's theme
// shape so the Connect Wallet modal matches the site instead of RainbowKit's
// default blue/purple styling.
export const vellichorRainbowKitTheme = lightTheme({
  accentColor: "#b9722e", // --amber
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  fontStack: "system",
});

vellichorRainbowKitTheme.colors.modalBackground = "#ffffff"; // --panel
vellichorRainbowKitTheme.colors.modalBorder = "#e6ded0"; // --line
vellichorRainbowKitTheme.colors.modalText = "#221c15"; // --ink
vellichorRainbowKitTheme.colors.modalTextSecondary = "#6e6252"; // --ink-dim
vellichorRainbowKitTheme.colors.modalTextDim = "#6e6252"; // --ink-dim
vellichorRainbowKitTheme.colors.generalBorder = "#e6ded0"; // --line
vellichorRainbowKitTheme.colors.generalBorderDim = "#e6ded0"; // --line
vellichorRainbowKitTheme.colors.menuItemBackground = "#fbf8f2"; // --panel-2
vellichorRainbowKitTheme.colors.profileForeground = "#fbf8f2"; // --panel-2
vellichorRainbowKitTheme.colors.closeButton = "#6e6252"; // --ink-dim
vellichorRainbowKitTheme.colors.closeButtonBackground = "#fbf8f2"; // --panel-2
vellichorRainbowKitTheme.colors.connectButtonBackground = "#b9722e"; // --amber
vellichorRainbowKitTheme.colors.connectButtonInnerBackground = "#8f5a22"; // --amber-deep
vellichorRainbowKitTheme.colors.actionButtonBorder = "#e6ded0"; // --line
vellichorRainbowKitTheme.colors.actionButtonSecondaryBackground = "#fbf8f2"; // --panel-2
vellichorRainbowKitTheme.colors.selectedOptionBorder = "#b9722e"; // --amber
vellichorRainbowKitTheme.colors.standby = "#a6893f"; // --gold
