import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NotesAPI } from "../services/api";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PostDetails() {
  const { id } = useParams(); // Post ID from URL
  const navigate = useNavigate();
  const { user } = useUser(); // Logged-in Clerk user
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false); // Disable multiple deletes

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await NotesAPI.getPostById(id);
        console.log("Fetched post:", data); // ✅ Debug
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Delete post
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeleting(true);
      await NotesAPI.deletePost(id);
      alert("Post deleted successfully!");
      navigate("/"); // Redirect after deletion
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  // Edit post
  const handleEdit = () => {
    navigate(`/edit/${id}`, { state: { post } }); // Pass post to edit page
  };

  if (loading)
    return <p className="text-center mt-6 text-gray-500">Loading post...</p>;
  if (error)
    return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (!post)
    return <p className="text-center mt-6 text-gray-500">Post not found.</p>;

  // ✅ Check author safely
  const isAuthor = user && post.userId?.toString() === user.id?.toString();
  console.log("Current user:", user, "Is author:", isAuthor); // Debug

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>
          <p className="text-gray-600 text-sm mb-4">
            Author: {post.authorName || "Unknown"}
          </p>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>

          {isAuthor && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`px-4 py-2 rounded text-white ${deleting ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"}`}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}

          <div className="mt-6">
            <Link
              to="/"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
