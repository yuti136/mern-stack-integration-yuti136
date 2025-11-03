import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NotesAPI } from "../services/api";
import { useUser } from "@clerk/clerk-react";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser(); // Clerk logged-in user
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await NotesAPI.getPost(id);
        const postData = response?.data ?? response;
        setPost(postData);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  // 🗑️ Delete post
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setDeleting(true);
      await NotesAPI.deletePost(id);
      alert("Post deleted successfully!");
      navigate("/"); // redirect after deletion
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  // ✏️ Navigate to Edit page
  const handleEdit = () => {
    navigate(`/edit/${id}`, { state: { post } }); // navigate to edit form
  };

  // 🔙 Back to home
  const handleBackHome = () => {
    navigate("/");
  };

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!post) return <div className="p-4">Post not found.</div>;

  // ✅ Only show Edit/Delete if current user is the author
  const isAuthor = user && (post.userId === user.id || post.authorId === user.id);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 text-sm mb-2">
        Author: {post.authorName || "Unknown"}
      </p>
      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
        {post.content}
      </p>

      {/* --- Buttons Section --- */}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={handleBackHome}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          ← Back to Home
        </button>

        {isAuthor && (
          <>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`px-4 py-2 rounded text-white ${
                deleting ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
