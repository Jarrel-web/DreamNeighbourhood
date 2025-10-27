import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { changeEmail, changePassword, deleteAccount, refreshToken, sendVerificationEmail } from "@/services/userService";
import { CheckCircle, XCircle, Mail, RefreshCw } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { username, logoutUser, isVerified, loginUser } = useAuth();
  const displayName = username || "User";
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const refreshVerificationStatus = async () => {
    setRefreshing(true);
    try {
      const response = await refreshToken();
      loginUser(response.token);
      showMessage("success", "Status updated successfully!");
    } catch (error) {
      console.error("Failed to refresh verification status:", error);
      showMessage("error", "Failed to refresh status. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isVerified) {
      const interval = setInterval(() => {
        refreshVerificationStatus();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isVerified]);

  const handleSendVerificationEmail = async () => {
    setSendingVerification(true);
    try {
      await sendVerificationEmail();
      showMessage("success", "Verification email sent! Please check your inbox. The status will update automatically once verified.");
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Failed to send verification email");
    } finally {
      setSendingVerification(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await changeEmail(emailForm.newEmail);
      showMessage("success", "Email updated successfully. Please verify your new email.");
      setEmailForm({ newEmail: "" });
      await refreshVerificationStatus();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    setLoading(true);
    
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showMessage("success", "Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    
    try {
      await deleteAccount();
      showMessage("success", "Account deleted successfully");
      logoutUser();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${showDeleteModal ? 'blur-sm' : ''}`}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
          My Account
        </h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded ${
            message.type === "success" 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm border flex flex-col gap-6">
          <p className="text-lg font-medium">Hello {displayName},</p>

          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center gap-3">
              {isVerified ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Email Verified</p>
                    <p className="text-sm text-green-600">Your email address has been verified</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">Email Not Verified</p>
                    <p className="text-sm text-amber-600">
                      Verify your email to access all features
                      {refreshing && <span className="ml-2">(Checking status...)</span>}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isVerified && (
                <>
                  <button
                    onClick={refreshVerificationStatus}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    title="Check verification status"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleSendVerificationEmail}
                    disabled={sendingVerification || refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {sendingVerification ? "Sending..." : "Verify Email"}
                  </button>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleChangeEmail} className="flex flex-col gap-2">
            <label className="font-semibold">Change Email</label>
            <input
              type="email"
              placeholder="Enter new email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ newEmail: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Email"}
            </button>
          </form>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-2">
            <label className="font-semibold">Change Password</label>
            <input
              type="password"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <button 
            onClick={openDeleteModal}
            disabled={loading}
            className="w-full text-left px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-red-50 disabled:text-red-400 disabled:cursor-not-allowed"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 backdrop-blur-sm"></div>
          
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative z-10 shadow-xl border">
            <h2 className="text-xl font-bold mb-4">Confirm Account Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                No, Keep Account
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;