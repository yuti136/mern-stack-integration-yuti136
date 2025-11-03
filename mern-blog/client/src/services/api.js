// src/services/api.js

// 🔹 Backend API URL
const API_BASE = "http://localhost:5000/api";

/**
 * 🔐 Fetch Clerk JWT token from the browser
 */
async function getAuthToken() {
  try {
    if (!window.Clerk) {
      console.warn("⚠️ Clerk not initialized on window");
      return null;
    }

    const session = window.Clerk.session;

    if (!session) {
      console.warn("⚠️ No active Clerk session found");
      return null;
    }

    // Replace "default" with your JWT template name if different
    const token = await session.getToken({ template: "default" });

    if (!token) {
      console.warn("⚠️ Clerk JWT token not found — user might not be signed in");
      return null;
    }

    console.log("✅ Clerk JWT token retrieved:", token);
    return token;
  } catch (err) {
    console.error("❌ Failed to get Clerk token:", err);
    return null;
  }
}

/**
 * 🔁 Generic fetch helper with authorization
 */
async function authorizedFetch(url, options = {}) {
  const token = await getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      console.error("❌ Backend error response:", data);
      throw new Error(data?.message || `Request failed: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error("❌ Fetch error:", err);
    throw err;
  }
}

/**
 * 🧠 Posts API wrapper
 */
export const NotesAPI = {
  /** Get all posts */
  async getPosts() {
    return authorizedFetch(`${API_BASE}/posts`);
  },

  /** Get single post by ID or slug */
  async getPost(id) {
    return authorizedFetch(`${API_BASE}/posts/${id}`);
  },

  /** Create a new post */
  async createPost(data) {
    console.log("Submitting post to backend:", data);
    return authorizedFetch(`${API_BASE}/posts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update an existing post */
  async updatePost(id, data) {
    console.log("Updating post:", id, data);
    return authorizedFetch(`${API_BASE}/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Delete a post */
  async deletePost(id) {
    console.log("Deleting post:", id);
    return authorizedFetch(`${API_BASE}/posts/${id}`, {
      method: "DELETE",
    });
  },
};
