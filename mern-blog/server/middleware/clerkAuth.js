// middleware/clerkAuth.js
const { Clerk } = require("@clerk/clerk-sdk-node");
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Middleware to verify Clerk token and attach user info to req.user
 */
module.exports = async function clerkAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Missing token" });
    }

    const token = authHeader.split(" ")[1];
    const session = await clerk.sessions.verifySession(token);
    if (!session) {
      return res.status(401).json({ success: false, message: "Invalid session" });
    }

    const user = await clerk.users.getUser(session.userId);
    req.user = {
      id: user.id,
      name: user.username || user.firstName || "User",
    };

    next();
  } catch (err) {
    console.error("Clerk auth error:", err.message);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
