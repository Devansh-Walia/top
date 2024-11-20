import { useState } from "react";

export interface QuizComponent {
  id: string;
  type: "progress-bar" | "timer" | "question-text" | "image" | "option";
  position: { x: number; y: number };
  content?: string;
}

interface DraggableComponentProps {
  type: QuizComponent["type"];
  label: string;
  onDragStart: (type: QuizComponent["type"], e: React.DragEvent) => void;
  onAdd: (type: QuizComponent["type"]) => void;
}

export function DraggableComponent({
  type,
  label,
  onDragStart,
  onAdd,
}: DraggableComponentProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart(type, e);

    // Use the dragged element itself as the drag image
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    onAdd(type);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAdd(type);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Add ${label} component`}
      className={`p-3 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-all border border-gray-200 
        ${
          isDragging
            ? "opacity-50 ring-2 ring-purple-500"
            : "hover:border-purple-500"
        }`}
    >
      <div className="flex items-center gap-2">
        {type === "progress-bar" && (
          <div className="w-4 h-1 bg-green-500 rounded-full"></div>
        )}
        {type === "timer" && (
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {type === "question-text" && (
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
        {type === "image" && (
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
        {type === "option" && (
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <span className="text-sm text-gray-700">{label}</span>
        <div className="ml-auto text-xs text-gray-400">Click to add</div>
      </div>
    </div>
  );
}

interface DroppedComponentProps {
  component: QuizComponent;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function DroppedComponent({
  component,
  onMove,
  onDelete,
  isSelected,
  onSelect,
}: DroppedComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [dragStartMousePosition, setDragStartMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [emptyImage] = useState(() => {
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    return img;
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);

    // Store the initial component position
    setDragStartPosition({
      x: component.position.x,
      y: component.position.y,
    });

    // Store the initial mouse position
    setDragStartMousePosition({
      x: e.clientX,
      y: e.clientY,
    });

    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: component.id,
        initialPosition: component.position,
        mouseOffset: {
          x: e.clientX - component.position.x,
          y: e.clientY - component.position.y,
        },
      })
    );

    // Set empty image as drag image to prevent ghost
    e.dataTransfer.setDragImage(emptyImage, 0, 0);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.clientX || !e.clientY) return; // Ignore invalid drag events

    // Calculate the delta from the start position
    const deltaX = e.clientX - dragStartMousePosition.x;
    const deltaY = e.clientY - dragStartMousePosition.y;

    // Apply the delta to the original position
    const newX = dragStartPosition.x + deltaX;
    const newY = dragStartPosition.y + deltaY;

    onMove(component.id, { x: newX, y: newY });
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);

    if (!e.clientX || !e.clientY) return; // Ignore invalid drag events

    // Calculate final position using the same delta method
    const deltaX = e.clientX - dragStartMousePosition.x;
    const deltaY = e.clientY - dragStartMousePosition.y;

    const finalX = dragStartPosition.x + deltaX;
    const finalY = dragStartPosition.y + deltaY;

    onMove(component.id, { x: finalX, y: finalY });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onDelete(component.id);
    } else if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      const STEP = 10;
      const newPosition = { ...component.position };

      switch (e.key) {
        case "ArrowLeft":
          newPosition.x -= STEP;
          break;
        case "ArrowRight":
          newPosition.x += STEP;
          break;
        case "ArrowUp":
          newPosition.y -= STEP;
          break;
        case "ArrowDown":
          newPosition.y += STEP;
          break;
      }

      onMove(component.id, newPosition);
    }
  };

  const getComponentContent = () => {
    switch (component.type) {
      case "progress-bar":
        return (
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-green-500 transition-all duration-300"></div>
          </div>
        );
      case "timer":
        return (
          <div className="font-mono text-lg bg-white px-4 py-2 rounded-lg shadow flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            00:30
          </div>
        );
      case "question-text":
        return (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="font-medium text-lg">
              {component.content || "Question text goes here"}
            </div>
          </div>
        );
      case "image":
        return (
          <div className="bg-white rounded-lg shadow p-2">
            <div className="bg-gray-100 rounded flex items-center justify-center h-32">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        );
      case "option":
        return (
          <div className="bg-white p-3 rounded-lg shadow border border-gray-200 hover:border-purple-500 transition-colors">
            {component.content || "Option text"}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${component.type} component`}
      style={{
        position: "absolute",
        left: component.position.x,
        top: component.position.y,
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
      className={`min-w-[100px] group ${
        isDragging ? "ring-2 ring-purple-500" : ""
      } 
        ${isSelected ? "ring-2 ring-purple-500" : ""}`}
    >
      {getComponentContent()}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(component.id);
        }}
        aria-label="Delete component"
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
}

export const QUIZ_COMPONENTS = [
  { type: "progress-bar" as const, label: "Progress Bar" },
  { type: "timer" as const, label: "Timer" },
  { type: "question-text" as const, label: "Question Text" },
  { type: "image" as const, label: "Image" },
  { type: "option" as const, label: "Option" },
];
