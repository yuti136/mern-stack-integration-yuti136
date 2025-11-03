import { useEffect, useState } from "react";
import { NotesAPI } from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser(); // Logged-in Clerk user

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await NotesAPI.getPosts();

        // Normalize the API response
        const postsArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setPosts(postsArray);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading)
    return <p className="text-center mt-6 text-gray-500">Loading posts...</p>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 px-4">
      {posts.length > 0 ? (
        posts.map((post) => {
          // Check if the current user is the author
          const isAuthor = user && post.userId?.toString() === user.id?.toString();

          return (
            <Card
              key={post._id}
              className="hover:shadow-lg transition border border-gray-200"
            >
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {post.content}
                </p>

                {/* Read More */}
                <Link
                  to={`/post/${post._id}`}
                  state={{ post }}
                  className="text-blue-600 hover:underline text-sm font-medium mr-4"
                >
                  Read More →
                </Link>

                {/* Show Edit/Delete buttons if current user is author */}
                {isAuthor && (
                  <div className="mt-2 flex gap-2">
                    <Link
                      to={`/edit/${post._id}`}
                      state={{ post }}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Are you sure you want to delete this post?")) return;
                        try {
                          await NotesAPI.deletePost(post._id);
                          alert("Post deleted successfully!");
                          setPosts(posts.filter((p) => p._id !== post._id)); // Remove deleted post
                        } catch (err) {
                          console.error("Failed to delete post:", err);
                          alert("Failed to delete post.");
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <p className="text-center col-span-full mt-6 text-gray-500">
          No posts available yet. Create your first post to get started.
        </p>
      )}
    </div>
  );
}
