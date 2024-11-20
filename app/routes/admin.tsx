import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  DraggableComponent,
  DroppedComponent,
  QUIZ_COMPONENTS,
  type QuizComponent,
} from "../components/quiz/QuizComponents";

interface Frame {
  id: string;
  title: string;
  content: string;
  components: QuizComponent[];
}

interface LoaderData {
  frames: Frame[];
}

export const loader = async () => {
  return json<LoaderData>({
    frames: Array(9)
      .fill(null)
      .map((_, index) => ({
        id: `frame-${index + 1}`,
        title: `Frame ${index + 1}`,
        content: "Frame content here",
        components: [],
      })),
  });
};

export default function AdminRoute() {
  const { frames } = useLoaderData<typeof loader>();
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [pageTitle, setPageTitle] = useState("");
  const [viewState, setViewState] = useState<"Default" | "Hover" | "Clicked">(
    "Default"
  );
  const [frameComponents, setFrameComponents] = useState<QuizComponent[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );

  const handleDragStart = (type: QuizComponent["type"], e: React.DragEvent) => {
    const data = { type };
    e.dataTransfer.setData("application/json", JSON.stringify(data));
  };

  const handleAddComponent = (type: QuizComponent["type"]) => {
    const newComponent: QuizComponent = {
      id: crypto.randomUUID(),
      type,
      position: { x: 50, y: 100 }, // Default position in the center-top area
    };
    setFrameComponents((prev) => [...prev, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));

      if (data.type) {
        // New component from sidebar
        const newComponent: QuizComponent = {
          id: crypto.randomUUID(),
          type: data.type,
          position: { x, y },
        };
        setFrameComponents((prev) => [...prev, newComponent]);
        setSelectedComponent(newComponent.id);
      } else if (data.id) {
        // Moving existing component
        setFrameComponents((prev) =>
          prev.map((comp) =>
            comp.id === data.id ? { ...comp, position: { x, y } } : comp
          )
        );
      }
    } catch (err) {
      console.error("Error handling drop:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleComponentMove = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setFrameComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, position } : comp))
    );
  };

  const handleComponentDelete = (id: string) => {
    setFrameComponents((prev) => prev.filter((comp) => comp.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const handlePreviewClick = () => {
    setSelectedComponent(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar */}
      <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search within Video"
              className="w-full pl-8 pr-4 py-2 bg-gray-100 rounded-lg"
              aria-label="Search within video"
            />
            <svg
              className="absolute left-2 top-3 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-4 py-3 border-b">
          <button className="px-3 py-1 rounded bg-gray-200">Frames</button>
          <button className="px-3 py-1 rounded bg-green-100 text-green-800">
            Tooltip
          </button>
          <button className="px-3 py-1 rounded bg-gray-200">Question</button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Frame Grid */}
          <div className="grid grid-cols-3 gap-3 p-4">
            {frames.map((frame, index) => (
              <div
                key={frame.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFrame(index)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedFrame(index)}
                className={`aspect-[9/16] bg-purple-100 rounded-lg cursor-pointer hover:ring-2 hover:ring-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 overflow-hidden ${
                  selectedFrame === index ? "ring-2 ring-purple-500" : ""
                }`}
              >
                <div className="h-1/3 bg-gradient-to-br from-purple-500 to-blue-500" />
                <div className="p-2">
                  <p className="text-xs text-gray-600">{frame.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Component Palette - Fixed at bottom */}
        <div className="border-t bg-gray-50 p-4">
          <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Components
          </h3>
          <div className="space-y-2">
            {QUIZ_COMPONENTS.map((component) => (
              <DraggableComponent
                key={component.type}
                type={component.type}
                label={component.label}
                onDragStart={handleDragStart}
                onAdd={handleAddComponent}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Add page title"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
            <div className="flex gap-2">
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Edit"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Reset"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* View State Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {(["Default", "Hover", "Clicked"] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => setViewState(state)}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewState === state ? "bg-white shadow" : ""
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="p-2 rounded hover:bg-gray-100">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="max-w-[375px] mx-auto">
          <div
            className={`aspect-[9/16] bg-purple-50 rounded-[40px] shadow-xl overflow-hidden border-8 border-gray-800 relative transition-all ${
              isDraggingOver ? "ring-4 ring-purple-500 ring-opacity-50" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handlePreviewClick}
          >
            {isDraggingOver && (
              <div className="absolute inset-0 bg-purple-500 bg-opacity-10 pointer-events-none flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg px-4 py-2 text-purple-600">
                  Drop component here
                </div>
              </div>
            )}

            {/* Status Bar */}
            <div className="h-6 bg-white flex items-center justify-between px-4 text-xs">
              <span>9:30</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 relative">
              <h2 className="text-lg font-semibold">
                Frame {selectedFrame + 1}
              </h2>
              <p className="text-gray-600 mt-2">
                {frames[selectedFrame].content}
              </p>

              {/* Draggable Components */}
              {frameComponents.map((component) => (
                <DroppedComponent
                  key={component.id}
                  component={component}
                  onMove={handleComponentMove}
                  onDelete={handleComponentDelete}
                  isSelected={component.id === selectedComponent}
                  onSelect={() => setSelectedComponent(component.id)}
                />
              ))}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2">
              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full bg-green-800 text-white">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
