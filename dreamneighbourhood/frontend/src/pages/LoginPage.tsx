import React, { useState } from "react";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import loginImg from "../assets/images/Login.png";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { login } from "@/services/authService";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login(email, password);
      loginUser(res.token, res.user.username);
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 md:px-8">
      <div className="flex w-full max-w-[960px] items-center justify-center gap-8 md:gap-12 flex-wrap md:flex-nowrap">

        {/* Login Card */}
        <Card className="w-full max-w-[420px] flex-shrink-0 shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-start">Welcome !</CardTitle>
            <CardDescription className="text-start text-xl font-semi-bold">
              Login to Dream Neighbourhood
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="flex flex-col gap-6">
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
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgotPassword"
                      className="text-sm text-blue-600 hover:underline mt-1 md:mt-0"
                    >
                      Forgot your password?
                    </Link>
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
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Toggle>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

              <CardFooter className="flex flex-col mt-10 px-0 w-full">
                <Button
                  type="submit"
                  className="bg-light-blue text-white hover:bg-blue-300 w-full"
                  disabled={submitting}
                >
                  {submitting ? "Signing in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>

          <CardContent className="flex items-center justify-center">
            <CardAction className="text-center items-center">
              <Button variant="link">
                <Link to="/signup">Don’t have an Account? Register here</Link>
              </Button>
            </CardAction>
          </CardContent>
        </Card>

        {/* Illustration */}
        <div className="hidden md:flex justify-center items-center flex-shrink-0 flex-grow max-w-[calc(50%-2rem)] lg:max-w-[45%]">
          <img
            src={loginImg}
            alt="DreamNeighbourhood illustration"
            className="w-full h-auto max-w-[380px]"
          />
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
