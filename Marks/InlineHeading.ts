import { Mark, mergeAttributes } from "@tiptap/core";

// Possible options
export interface InlineHeadingOptions {
  levels: number[]; // level dictates the heading level (h1,h2, etc.)
  defaultLevel: number; // Default heading level
  HTMLAttributes: Record<string, any>; // HTML attributes of the node
}
// Put this mark inside tiptap/core module
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineHeading: {
      toggleInlineHeading: (level?: number) => ReturnType;
    };
  }
}

export const InlineHeading = Mark.create<InlineHeadingOptions>({
  name: "inlineHeading", // Name of this mark

  addOptions() {
    return {
      HTMLAttributes: {},
      levels: [1, 2, 3], // Can only be h1-h3 options
      defaultLevel: 1, // Default is lvl 1
    };
  },

  // These are the default attributes when this mark is applied to a node.
  addAttributes() {
    return {
      level: {
        default: this.options.defaultLevel, // Default level 1
        // This gets the data-level ATTRIBUTE to be given later to parseHTML.
        parseHTML: (element) =>
          element.getAttribute("data-level") || this.options.defaultLevel,

        // This renders the data-level attribute to be given used by the GLOBAL renderHTML.
        renderHTML: (attributes) => ({ "data-level": attributes.level }),
      },
    };
  },
  // Treat any <span data-heading=""></span> as inlineHeading mark. Get the data-level attribute as well.
  parseHTML() {
    return [
      {
        tag: "span[data-heading]",
        getAttrs: (node) => ({
          level:
            (node as HTMLElement).getAttribute("data-level") || this.options.defaultLevel,
        }),
      },
    ];
  },
  // When you see this inline mark then render it with these attributes.
  /*
  Example output: <span {htmlAttributes} data-heading="2" style="font-size: 1.5rem; font-weight: bold;">Your selected text here</span>

  */
  renderHTML({ mark }) {
    const level = mark.attrs.level || this.options.defaultLevel;
    const fontSizeMap: Record<number, string> = {
      1: "2.25rem", // text-4xl
      2: "1.5rem", // text-2xl
      3: "1.125rem", // text-lg
    };
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-heading": level,
        style: `font-size: ${fontSizeMap[level] || "1rem"}; font-weight: bold;`,
      }),
      0,
    ];
  },

  // addCommands allows us to add command in the editor so we can access it like editor.commands.toggleInlineHeading().
  addCommands() {
    return {
      // toggleInlineHeading is a function that returns a function (lets call this inside function).
      toggleInlineHeading:
        (level) =>
        // The inside function contains chain which allows us to chain commands while state is the current state of the editor.
        ({ chain, state }) => {
          // selection = current text selected in the editor.
          // schema = the document schema defining nodes and marks.
          const { selection, schema } = state;

          // Gets the inlineHeading mark
          const markType = schema.marks.inlineHeading;

          if (!markType) return false;

          // Check if the selected text has a mark already
          const hasMark = state.doc.rangeHasMark(selection.from, selection.to, markType);

          return chain() // We create a chain of commands which is to mark first then run the command.
            .setMark(
              this.name, // this.name is "inlineHeading"
              hasMark ? undefined : { level: level || this.options.defaultLevel } // If it already has a mark then we return undefined (meaning we do remove the mark). If there is no mark then the passed level or the default level.
            )
            .run(); // Run the command
        },
    };
  },
});

/* 
This is the flowchart of what's happening:

HTML --> Tiptap Document

<span data-heading="true" data-level="2">My Text</span>
        │
        ▼
[Global parseHTML()] → Detects <span data-heading>
        │
        ▼
[Attribute-level parseHTML()] → Extracts data-level="2"
        │
        ▼
Creates mark with: { type: 'inlineHeading', attrs: { level: 2 } }

Tiptap Document --> HTML (rendering for the user to see)

Mark: { type: 'inlineHeading', attrs: { level: 2 } }
        │
        ▼
[Attribute-level renderHTML()] → Returns: { "data-level": 2 }
        │
        ▼
[Global renderHTML()] → Creates:
<span data-heading="true" data-level="2" style="font-size: 1.5rem; font-weight: bold;">My Text</span>

*/

/*
Very summarized version

<span data-level> element
  ↓
 Global parseHTML (wraps and attaches the mark) 
  ↓
Attribute-level parseHTML 
  ↓
Attribute-level renderHTML (adds back attributes like data-level)
  ↓
Global renderHTML (wraps everything in <span> with styles)

The global parseHTML checks the HTML for span with data-level. The attribute parseHTML gets the data-level attribute. When its time for rendering, the attribute renderHTML provides the data-level attribute. The global renderHTML combines everything like HTMLAttributes, tags, and the attribute data-level into one element.

*/
