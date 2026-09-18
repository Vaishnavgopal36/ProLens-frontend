// @ts-expect-error css side-effect import
import "../src/index.css";
import React from "react";
import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { AppProviders } from "../src/app/providers";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    (Story) =>
      React.createElement(AppProviders, null, React.createElement(Story)),
  ],
};

export default preview;
