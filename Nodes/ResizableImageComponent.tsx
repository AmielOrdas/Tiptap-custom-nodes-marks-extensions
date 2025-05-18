import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useState, useRef } from "react";
import clsx from "clsx";
import { Circle } from "lucide-react";

const ResizableImageComponent = ({ node, updateAttributes, selected }: NodeViewProps) => {
  // size
  const [size, setSize] = useState({
    width: node.attrs.width || "auto",
    height: node.attrs.height || "auto",
  });

  // References
  const imgRef = useRef<HTMLImageElement | null>(null);
  const resizingRef = useRef(false);
  const resizeDirection = useRef<string | null>(null);

  // Alignment Classes
  const alignmentClasses: Record<string, string> = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  // Triggers when one of the corners are clicked.
  function handleMouseDown(e: React.MouseEvent, direction: string) {
    e.preventDefault();
    resizingRef.current = true;
    resizeDirection.current = direction;

    const startX = e.clientX; // Initial horizontal mouse position at the start of the resize

    const startWidth = imgRef.current?.offsetWidth || 0; // current width of the image in pixels
    const startHeight = imgRef.current?.offsetHeight || 0; // current height of the image in pixels
    const aspectRatio = startWidth / startHeight;

    function handleMouseMove(moveEvent: MouseEvent) {
      if (!resizingRef.current) return;

      let deltaX = moveEvent.clientX - startX;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (resizeDirection.current === "BR" || resizeDirection.current === "TR") {
        newWidth = startWidth + deltaX;
      } else if (resizeDirection.current === "BL" || resizeDirection.current === "TL") {
        newWidth = startWidth - deltaX;
      }

      newHeight = newWidth / aspectRatio;

      setSize({ width: `${newWidth}px`, height: `${newHeight}px` }); // This forces the editor to re-render to show the changes.
      updateAttributes({ width: `${newWidth}px`, height: `${newHeight}px` }); // This updates the width and height of the image node in tiptap.
    }

    function handleMouseUp() {
      resizingRef.current = false;
      resizeDirection.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <NodeViewWrapper className={`flex ${alignmentClasses[node.attrs.align]} my-2`}>
      {/*NodeViewWrapper is the required when creating custom node wrapper */}

      {/* Wrapper for image */}
      <div
        className={clsx(
          "relative inline-block group",
          selected && "border border-gray-300"
        )}
      >
        <img
          ref={imgRef}
          src={node.attrs.src}
          className="max-w-full h-auto"
          style={{ width: size.width, height: size.height }}
          alt="Resizable"
        />

        {/* Resize Handles */}
        {selected && (
          <>
            <Circle
              className="absolute top-0 left-0 w-3 h-3 bg-blue-500 cursor-nwse-resize"
              onMouseDown={(e) => handleMouseDown(e, "TL")}
            />
            <Circle
              className="absolute top-0 right-0 w-3 h-3 bg-blue-500 cursor-nesw-resize"
              onMouseDown={(e) => handleMouseDown(e, "TR")}
            />
            <Circle
              className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 cursor-nesw-resize"
              onMouseDown={(e) => handleMouseDown(e, "BL")}
            />
            <Circle
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-nwse-resize"
              onMouseDown={(e) => handleMouseDown(e, "BR")}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ResizableImageComponent;
