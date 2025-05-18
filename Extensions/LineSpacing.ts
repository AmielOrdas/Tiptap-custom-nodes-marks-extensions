import { Extension } from "@tiptap/core";

// Interface for the Line Height Options
export interface LineHeightOptions {
  types: string[];
  heights: string[];
  defaultHeight: string;
}
// We include this inside tiptap/core
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (height: string) => ReturnType;

      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: "lineHeight", // Name of the mark

  addOptions() {
    return {
      types: ["paragraph", "heading"], // Define types that can have line height
      heights: ["1", "1.25", "1.5", "2"], // Define possible line heights
      defaultHeight: "1.0", // Default line height
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultHeight,
            // This gets the line spacing in the style property.
            parseHTML: (element) =>
              element.style.lineHeight || this.options.defaultHeight,
            // Renders the lineHeight style attribute based on the attribute value
            renderHTML: (attributes) => {
              const lineHeightMap: Record<string, string> = {
                "1.0": "1.25",
                "1.25": "1.5",
                "1.50": "1.75",
                "2": "2",
              };
              const lineHeightValue =
                lineHeightMap[attributes.lineHeight] || attributes.lineHeight;
              return { style: `line-height: ${lineHeightValue}` }; // Render custom line-height
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (height: string) =>
        ({ commands }) => {
          // Ensure the line height is within the allowed values
          if (!this.options.heights.includes(height)) {
            return false;
          }

          // Update the line height for all the specified node types
          return this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight: height })
          );
        },

      unsetLineHeight:
        () =>
        ({ commands }) => {
          // Reset the line height attribute for all specified node types
          return this.options.types.every((type) =>
            commands.resetAttributes(type, "lineHeight")
          );
        },
    };
  },
});
