import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { NotesAPI } from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { SignedIn, SignedOut, SignInButton, useSession, useUser } from "@clerk/clerk-react";

export default function CreatePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useUser();
  const session = useSession();

  // Check if we are editing (pass post via state)
  const editingPost = location.state?.post || null;

  const [title, setTitle] = useState(editingPost?.title || "");
  const [content, setContent] = useState(editingPost?.content || "");
  const [categories, setCategories] = useState(editingPost?.categories?.join(",") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setCategories(editingPost.categories?.join(",") || "");
    }
  }, [editingPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    if (!session || !user) {
      setError("You must be signed in to submit a post.");
      return;
    }

    setLoading(true);
    setError("");

    const postData = {
      title,
      content,
      categories: categories
        ? categories.split(",").map((cat) => cat.trim())
        : [],
    };

    try {
      if (editingPost) {
        // 🔹 Update existing post
        await NotesAPI.updatePost(editingPost._id, postData);
        alert("✅ Post updated successfully!");
      } else {
        // 🔹 Create new post
        await NotesAPI.createPost(postData);
        alert("✅ Post created successfully!");
      }

      navigate(editingPost ? `/posts/${editingPost._id}` : "/");
    } catch (err) {
      console.error("Error submitting post:", err);
      setError(err.message || "Failed to submit post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card className="p-6 shadow-md">
        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">
            {editingPost ? "Edit Post" : "Create New Post"}
          </h2>

          {error && (
            <p className="text-red-500 bg-red-50 p-2 rounded mb-3">{error}</p>
          )}

          <SignedIn>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border w-full p-2 mb-3 rounded"
              />

              <textarea
                placeholder="Write your content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border w-full p-2 mb-3 rounded min-h-[150px]"
              />

              <input
                type="text"
                placeholder="Categories (comma separated)"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                className="border w-full p-2 mb-4 rounded"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
              </button>
            </form>
          </SignedIn>

          <SignedOut>
            <div className="text-center mt-6">
              <p className="mb-3 text-gray-600">
                You must be signed in to {editingPost ? "edit" : "create"} a post.
              </p>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  Sign In to Continue
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </CardContent>
      </Card>
    </div>
  );
}
