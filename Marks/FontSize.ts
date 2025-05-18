import { Mark } from "@tiptap/core";

// Interface for the font size options
export interface FontSizeOptions {
  types: string[];
}

// We include this inside tiptap/core
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Mark.create<FontSizeOptions>({
  name: "fontSize", // Name of the mark

  addOptions() {
    return {
      types: ["textStyle"], // Required for marks that affect inline text styles
    };
  },
  // These are the default attributes when this mark is applied to a node.
  addAttributes() {
    return {
      size: {
        default: "16px",
        // This gets the fontsize in style property like <p style = "fontSize: 18px"></p>
        parseHTML: (element) => element.style.fontSize || null,

        // This renders the size attribute to be used by the GLOBAL renderHTML.
        renderHTML: (attributes) => {
          if (!attributes.size) return {};
          return { style: `font-size: ${attributes.size}` };
        },
      },
    };
  },
  // Treat anything that has a style of font-size as this mark.
  parseHTML() {
    return [{ style: "font-size" }];
  },

  /*
  When you see this inline mark, render a span with HTML attributes.

  Example output: <span {...HTML attributes}>0</span>
  */
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  // addCommands allows us to add command in the editor so we can access it like editor.commands.setFontSize() or unsentFontSize().
  addCommands() {
    return {
      // setFontSize is a function that returns a function (lets call this inside function).
      setFontSize:
        (size: string) =>
        // The inside function contains chain allows us to do chain of commands
        ({ chain }) => {
          return chain().setMark("fontSize", { size }).run();
        },

      // unsetFontSize is a function that returns a function (lets call this inside function).
      unsetFontSize:
        () =>
        // The inside function contains chain allows us to do chain of commands
        ({ chain }) => {
          return chain().unsetMark("fontSize").run();
        },
    };
  },
});
