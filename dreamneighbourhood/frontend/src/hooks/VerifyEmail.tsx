import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { sendVerificationEmail } from "@/services/auth";

export default function VerifyEmail() {
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const handleSendEmail = async () => {
    try {
      setIsSending(true);

      // Replace with the actual user's email if available in your state
      const email = (window as any).dnEmail ?? "user@example.com";
      await sendVerificationEmail(email);

      // ✅ Show success toast
      toast.success("Check your email to verify your account");

      // ⏳ Wait for a few seconds before rerouting
      setTimeout(() => {
        navigate("/reset-password");
      }, 3000); // 3 seconds delay
    } catch (error) {
      console.error(error);
      toast.error("Failed to send verification email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Button onClick={handleSendEmail} disabled={isSending}>
        {isSending ? "Sending..." : "Send Verification Email"}
      </Button>
    </div>
  );
}
