import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | { email: string } | "passwordCheck" | "setPassword">("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for password gate
  const [shouldContinue, setShouldContinue] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Load current user's security state after auth
  const security = useQuery(api.userSecurity.getMySecurity, isAuthenticated ? {} : "skip" as any);

  // Only navigate after password gate passes
  useEffect(() => {
    if (!authLoading && isAuthenticated && shouldContinue) {
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, shouldContinue, navigate, redirectAfterAuth]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      // After OTP success, move to password gate
      setStep("passwordCheck");
      setIsLoading(false);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      // Require password even for guest users after auth
      setStep("passwordCheck");
      setIsLoading(false);
    } catch (error) {
      console.error("Guest login error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsLoading(false);
    }
  };

  // Helper: hex encoding/decoding and hashing via Web Crypto
  const toHex = (buf: ArrayBuffer) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const fromHex = (hex: string) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  };

  async function sha256Hex(data: Uint8Array) {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
  }

  async function hashPasswordWithSalt(pw: string, saltHex: string) {
    const enc = new TextEncoder();
    const saltBytes = fromHex(saltHex);
    const pwBytes = enc.encode(pw);
    // Simple concatenation: salt || password
    const combined = new Uint8Array(saltBytes.length + pwBytes.length);
    combined.set(saltBytes, 0);
    combined.set(pwBytes, saltBytes.length);
    return await sha256Hex(combined);
  }

  function generateSaltHex(len = 16) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    return toHex(bytes.buffer);
  }

  const setPasswordMut = useMutation(api.userSecurity.setPassword);

  // When in passwordCheck, decide which UI to show (enter vs set)
  useEffect(() => {
    if (isAuthenticated && security && step === "passwordCheck") {
      if (security.hasPassword) {
        // Prompt to enter existing password
        // step remains "passwordCheck"
      } else {
        // Prompt to set a new password
        setStep("setPassword");
      }
    }
  }, [isAuthenticated, security, step]);

  // Verify existing password
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      if (!security?.salt) {
        setError("Security data not ready. Please try again.");
        setIsLoading(false);
        return;
      }
      const passwordHash = await hashPasswordWithSalt(password, security.salt);
      const res = await fetch("/api/convex/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "userSecurity:verifyPassword",
          args: { passwordHash },
        }),
      });
      if (!res.ok) throw new Error("Verification failed");
      const json = await res.json();
      if (json.ok) {
        setShouldContinue(true);
      } else {
        setError("Incorrect password. Try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to verify password");
    } finally {
      setIsLoading(false);
    }
  };

  // Create/set password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setIsLoading(false);
        return;
      }
      if (password !== passwordConfirm) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      const salt = generateSaltHex(16);
      const passwordHash = await hashPasswordWithSalt(password, salt);
      await setPasswordMut({ passwordHash, salt });
      setShouldContinue(true);
    } catch (err: any) {
      setError(err?.message || "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      
      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
        <Card className="min-w-[350px] pb-0 border shadow-md">
          {step === "signIn" ? (
            <>
              <CardHeader className="text-center">
              <div className="flex justify-center">
                    <img
                      src="./logo.svg"
                      alt="Lock Icon"
                      width={64}
                      height={64}
                      className="rounded-lg mb-4 mt-4 cursor-pointer"
                      onClick={() => navigate("/")}
                    />
                  </div>
                <CardTitle className="text-xl">Get Started</CardTitle>
                <CardDescription>
                  Enter your email to log in or sign up
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent>
                  
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-9"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                  
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4"
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Continue as Guest
                    </Button>
                  </div>
                </CardContent>
              </form>
            </>
          ) : typeof step === "object" ? (
            <>
              <CardHeader className="text-center mt-4">
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                  We've sent a code to {step.email}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          // Find the closest form and submit it
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) {
                            form.requestSubmit();
                          }
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Didn't receive a code?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setStep("signIn")}
                    >
                      Try again
                    </Button>
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Use different email
                  </Button>
                </CardFooter>
              </form>
            </>
          ) : step === "passwordCheck" ? (
            <>
              <CardHeader className="text-center mt-4">
                <CardTitle>Enter your password</CardTitle>
                <CardDescription>
                  Your account requires a password to continue.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleVerifyPassword}>
                <CardContent className="pb-4">
                  <div className="grid gap-2">
                    <label className="text-sm text-muted-foreground">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || password.length === 0}
                  >
                    {isLoading ? "Verifying..." : "Continue"}
                  </Button>
                </CardFooter>
              </form>
            </>
          ) : (
            // setPassword
            <>
              <CardHeader className="text-center mt-4">
                <CardTitle>Set your password</CardTitle>
                <CardDescription>
                  Create a password to secure your account.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSetPassword}>
                <CardContent className="pb-4">
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <label className="text-sm text-muted-foreground">New Password</label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm text-muted-foreground">Confirm Password</label>
                      <Input
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || password.length < 8 || password !== passwordConfirm}
                  >
                    {isLoading ? "Saving..." : "Save and Continue"}
                  </Button>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}