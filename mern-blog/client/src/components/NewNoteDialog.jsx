import { useState } from "react";
import { NotesAPI } from "../services/api";
import { useUser } from "@clerk/clerk-react";

export default function NewNoteDialog() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await NotesAPI.createPost({
        title,
        content,
        userId: user?.id,
        authorName: user?.fullName || user?.username || "Anonymous",
      });

      if (res.success) {
        setMessage("✅ Post created successfully!");
        setTitle("");
        setContent("");
      } else {
        setMessage("❌ Failed to create post.");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 h-40 focus:outline-none focus:ring focus:ring-blue-300"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Publish Post"}
      </button>

      {message && <p className="text-center mt-3 text-sm">{message}</p>}
    </form>
  );
}
