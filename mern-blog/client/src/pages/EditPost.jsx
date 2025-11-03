import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { NotesAPI } from "../services/api";

export default function EditPost() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 🧠 If post is passed via state (from PostDetail), use it; otherwise fetch.
  const [post, setPost] = useState(location.state?.post || null);
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [loading, setLoading] = useState(!post); // if post not passed, fetch
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 Fetch post if not passed via location.state
  useEffect(() => {
    if (post) return; // skip if we already have post
    async function fetchPost() {
      try {
        const response = await NotesAPI.getPost(id);
        const data = response?.data ?? response;
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to load post.");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id, post]);

  // 💾 Handle update
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await NotesAPI.updatePost(id, { title, content });
      alert("Post updated successfully!");
      navigate(`/posts/${id}`); // go back to post detail page
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  // 🚫 Cancel editing
  const handleCancel = () => {
    navigate(`/posts/${id}`);
  };

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="8"
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded text-white ${
              saving ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
