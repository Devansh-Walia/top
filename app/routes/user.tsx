import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface LoaderData {
  quizName: string;
  currentQuestion: number;
  totalQuestions: number;
  question: QuizQuestion;
}

export const loader = async () => {
  // Mock data - in real app, fetch from backend
  return json<LoaderData>({
    quizName: "Name of the Quiz",
    currentQuestion: 1,
    totalQuestions: 10,
    question: {
      id: "q1",
      text: "Question Text goes here which can be really long. as long as three to four lines. Adding more more and more lines, wrap the question",
      options: [
        "What is the Capital of France?",
        "France",
        "What is the Capital of France?",
        "France",
      ],
      correctAnswer: "Paris",
    },
  });
};

export default function UserRoute() {
  const { quizName, currentQuestion, totalQuestions, question } =
    useLoaderData<typeof loader>();
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per question
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatQuestionNumber = (num: number) => {
    return String(num).padStart(2, "0");
  };

  const handleSubmit = () => {
    if (!answer) return;
    setShowResult(true);
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return answer === option
        ? "bg-green-50 border-2 border-green-500"
        : "bg-gray-50 hover:bg-gray-100";
    }

    if (option === question.correctAnswer) {
      return "bg-green-100 border-2 border-green-500";
    }

    if (answer === option && option !== question.correctAnswer) {
      return "bg-red-100 border-2 border-red-500";
    }

    return "bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center">
          <span className="text-lg">9:30</span>
          <div className="w-2 h-2 bg-black rounded-full mx-4"></div>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-gray-200"></div>
            <div className="w-4 h-4 bg-gray-300"></div>
          </div>
        </div>
      </header>

      {/* Quiz Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b">
        <Link to="/admin" className="text-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-medium">{quizName}</h1>
        <button className="text-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Progress and Timer */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="text-gray-400" disabled={currentQuestion === 1}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="text-gray-400"
            disabled={currentQuestion === totalQuestions}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <span className="text-lg font-medium">
            {formatQuestionNumber(currentQuestion)}/
            {formatQuestionNumber(totalQuestions)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="h-1 bg-green-500"
        style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
      ></div>

      {/* Question */}
      <div className="px-4 py-6">
        <h2 className="text-2xl font-medium mb-8">
          <span className="font-bold">Q. </span>
          {question.text}
        </h2>

        {/* Options */}
        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && setAnswer(option)}
              disabled={showResult}
              className={`w-full p-6 text-left rounded-xl transition-colors ${getOptionStyle(
                option
              )}`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Help Text */}
        <p className="text-gray-500 text-center mt-6 mb-4">
          Enter the answer in the textbox given above. There&apos;s no character
          limit for the answer
        </p>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!answer || showResult}
          className={`w-full py-4 text-white rounded-xl text-xl font-medium transition-colors
            ${
              !answer || showResult
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {showResult ? "Answer submitted" : "Check your answer"}
        </button>

        {/* Result Feedback */}
        {showResult && (
          <div
            className={`mt-4 p-4 rounded-xl text-center ${
              answer === question.correctAnswer
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {answer === question.correctAnswer
              ? "Correct! Well done!"
              : `Incorrect. The correct answer is: ${question.correctAnswer}`}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-2">Powered By</p>
          <span className="font-bold text-xl">choobi</span>
        </div>
      </div>
    </div>
  );
}
