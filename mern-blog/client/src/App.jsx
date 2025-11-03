import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Persistent navigation bar */}
      <Navbar />

      <main className="max-w-5xl mx-auto p-4">
        {/* 🚫 Show this section for signed-out users */}
        <SignedOut>
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h1 className="text-2xl font-semibold mb-4 text-gray-700">
              Please sign in to continue
            </h1>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* ✅ Protected routes visible only to signed-in users */}
        <SignedIn>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/edit/:id" element={<EditPost />} />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SignedIn>
      </main>
    </div>
  );
}
