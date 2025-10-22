import React from "react";
import { useAuth } from "../context/AuthContext";

const ProfilePage: React.FC = () => {
  const { username } = useAuth(); // get username directly
  const displayName = username || "User";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
        My Account
      </h1>

      <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm border flex flex-col gap-6">
        {/* Greeting */}
        <p className="text-lg font-medium">Hello {displayName},</p>

        {/* Change Email Section */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Change Email</label>
          <input
            type="email"
            placeholder="Enter new email"
            className="w-full px-3 py-2 border rounded"
          />
          <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Update Email
          </button>
        </div>

        {/* Change Password Section */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Change Password</label>
          <input
            type="password"
            placeholder="Current password"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-3 py-2 border rounded"
          />
          <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Update Password
          </button>
        </div>

        {/* Delete Account */}
        <button className="w-full text-left px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
