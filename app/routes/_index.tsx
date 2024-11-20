import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Quiz App</h1>

        <div className="space-y-4">
          <Link
            to="/admin"
            className="block w-full py-3 px-4 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
          >
            Admin View
          </Link>

          <Link
            to="/user"
            className="block w-full py-3 px-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
          >
            User View
          </Link>
        </div>

        <p className="mt-6 text-center text-gray-500">
          Choose a view to get started
        </p>
      </div>
    </div>
  );
}
