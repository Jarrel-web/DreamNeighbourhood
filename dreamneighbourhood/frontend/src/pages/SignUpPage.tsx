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
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { register } from "@/services/auth";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await register(username, email, password);
      setSuccess(
        "Registration successful. Please check your email to verify your account."
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-items-center px-6 md:px-16">
      {/* Login Form */}
      <div className="w-full flex justify-end mr-30">
        <Card className="w-full max-w-sm shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-start">
              Welcome !
            </CardTitle>
            <CardDescription className="text-start text-xl font-semi-bold">
              Sign Up to Dream Neighbourhood
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="your username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pr-10"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Toggle
                      pressed={showPassword}
                      onPressedChange={setShowPassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Toggle>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Label htmlFor="password">Confirm Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pr-10"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Toggle
                      pressed={showPassword}
                      onPressedChange={setShowPassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Toggle>
                  </div>
                </div>
              </div>
              {error ? (
                <p className="text-red-600 text-sm mt-4">{error}</p>
              ) : null}
              {success ? (
                <p className="text-green-600 text-sm mt-4">{success}</p>
              ) : null}
              <CardFooter className="flex flex-col mt-10 px-0 w-full">
                <Button
                  type="submit"
                  className="bg-light-blue text-white hover:bg-blue-300 w-full"
                  disabled={submitting}
                >
                  {submitting ? "Creating account..." : "Create account"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
          <CardContent className="flex items-center justify-center">
            <CardAction className="text-center items-center">
              <Button variant="link">
                <Link to="/login">Already have an account? Login here</Link>
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

export default SignUpPage;
