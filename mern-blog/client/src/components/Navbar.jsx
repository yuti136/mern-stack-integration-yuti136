import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-3">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-4">
        <Link to="/" className="text-xl font-bold text-blue-600">MERN Blog</Link>
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <Link to="/create" className="text-white bg-green-600 px-3 py-2 rounded-lg hover:bg-green-700">
  + New Post
</Link>
      </div>
    </nav>
  );
}
