import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import loginImg from "../assets/images/Login.png";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import resetPasswordImg from "../assets/images/resetPassword.png";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { resetPassword } from "@/services/authService";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    setSubmitting(true);
    
    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully! You can now login with your new password.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-items-center px-6 md:px-16">
        <div className="w-full flex justify-end mr-30">
          <Card className="w-full max-w-sm shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-start text-red-600">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-start">
                The password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <CardAction className="text-center items-center">
                <Button variant="link">
                  <Link to="/forgot-password">Request a new reset link</Link>
                </Button>
              </CardAction>
            </CardContent>
          </Card>
        </div>
        <section className="flex justify-center items-center">
          <img
            src={loginImg}
            alt="DreamNeighbourhood illustration"
            className="max-w-full h-auto rounded-lg"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-items-center px-6 md:px-16">
      {/* Reset Password Form */}
      <div className="w-full flex justify-end mr-30">
        <Card className="w-full max-w-sm shadow-md border border-gray-200">
          <section className="flex justify-center items-center">
            <img
              src={resetPasswordImg}
              alt="DreamNeighbourhood illustration"
              className="max-w-full h-auto rounded-lg"
            />
          </section>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-start">
              Set New Password
            </CardTitle>
            <CardDescription className="text-start">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>
              <CardFooter className="flex flex-col mt-6 px-0 w-full">
                <Button
                  type="submit"
                  className="bg-light-blue text-white hover:bg-blue-300 w-full"
                  disabled={submitting}
                >
                  {submitting ? "Resetting..." : "Reset Password"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
          <CardContent className="flex items-center justify-center">
            <CardAction className="text-center items-center">
              <Button variant="link">
                <Link to="/login">Back to Login</Link>
              </Button>
            </CardAction>
          </CardContent>
        </Card>
      </div>

      {/* Image Section */}
      <section className="flex justify-center items-center">
        <img
          src={loginImg}
          alt="DreamNeighbourhood illustration"
          className="max-w-full h-auto rounded-lg"
        />
      </section>
    </div>
  );
};

export default ResetPasswordPage;