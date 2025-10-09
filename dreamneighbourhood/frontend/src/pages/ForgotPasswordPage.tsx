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
import resetPasswordImg from "../assets/images/resetPassword.png";
import { useState } from "react";
import { toast } from "react-hot-toast";
// import { sendVerificationEmail } from "@/services/auth";

const ForgetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log(email);
      // await sendVerificationEmail(email);
      toast.success("Check your email to verify your account");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSubmitting(false);
    }
    
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-items-center px-6 md:px-16">
      {/* Login Form */}
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
              Reset your password!
            </CardTitle>
            <CardDescription className="text-start text-xl font-semi-bold">
              Sign Up to Dream Neighbourhood
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
              </div>
              <CardFooter className="flex flex-col mt-10 px-0 w-full">
                <Button
                  type="submit"
                  className="bg-light-blue text-white hover:bg-blue-300 w-full"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Send verification email"}
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

export default ForgetPasswordPage;
