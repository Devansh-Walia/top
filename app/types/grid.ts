export type ComponentType =
  | "progress-bar"
  | "timer"
  | "question-number"
  | "question-text"
  | "image"
  | "option";

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridComponent {
  id: string;
  type: ComponentType;
  position: Position;
  content?: string;
  isCorrect?: boolean; // For option components
}

export interface QuizQuestion {
  id: string;
  components: GridComponent[];
  correctAnswer?: string;
}

export interface DraggableComponentMeta {
  type: ComponentType;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
}
