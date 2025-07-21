"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { AuthService } from "@/lib/auth";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&]/.test(pwd),
    };
    return Object.values(checks).filter(Boolean).length;
  };

  const getStrength = (score: number) => {
    if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (score === 3 || score === 4) return { label: "Medium", color: "bg-yellow-500", width: "w-2/3" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strengthScore = validatePassword(password);
  const strength = getStrength(strengthScore);

  useEffect(() => {
    (async () => {
      try {
        const res = await AuthService.verifyResetToken(token as string);
        setEmail(res.email);
        setVerified(true);
      } catch {
        setError("Invalid or expired reset link.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleReset = async () => {
    setError("");

    if (strengthScore < 3) {
      setError("Password too weak. Must be at least 8 characters, with uppercase, lowercase, number, and special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(token as string, password);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Verifying link...
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-md shadow space-y-4">
        <h2 className="text-2xl font-semibold text-center">Reset Password</h2>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!success && (
          <>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>

              {/* Strength Bar */}
              <div className="h-2 w-full bg-gray-200 rounded">
                <div className={`h-full rounded ${strength.color} ${strength.width} transition-all duration-300`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Strength: <span className="font-medium">{strength.label}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirm ? "text" : "password"} className="pl-10 pr-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirm((prev) => !prev)}>
                  {showConfirm ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password must include:</p>
              <ul className="list-disc list-inside">
                <li>At least 8 characters</li>
                <li>Uppercase & lowercase letters</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </div>

            <Button onClick={handleReset} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
