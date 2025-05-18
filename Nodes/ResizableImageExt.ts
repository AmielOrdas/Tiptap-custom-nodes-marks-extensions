import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ResizableImageComponent from "./ResizableImageComponent";

const ResizableImage = Node.create({
  name: "image", // Name of the node
  group: "block", // Block node meaning it eats the whole row space
  selectable: true,
  draggable: true,

  // These are the default attributes when created
  addAttributes() {
    return {
      src: { default: null },
      width: { default: "auto" },
      height: { default: "auto" },
      align: { default: "center" },
    };
  },

  // Treat any <img src = "..."> as this node
  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  // When you see this image node, render it with these attributes
  /* 
  For example, you have these HTML Attributes:
  {
  src: '...',
  width: '100px',
  class: 'rounded-xl',
  }

  The output would be: <div class = "flex justify-(alignment) "><img  {...HTMLAttributes}/></div>
  */
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: `flex justify-${HTMLAttributes.align}` },
      ["img", mergeAttributes(HTMLAttributes)],
    ];
  },
  // addNodeView allows us to customize how an image will look like. If this node is rendered then it will look like the "ResizableImageComponent".
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;
