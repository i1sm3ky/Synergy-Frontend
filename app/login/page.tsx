"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Mail, Lock, UserPlus, KeyRound, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface AuthState {
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
  resetToken: string;
  loading: boolean;
  error: string;
  success: string;
  step: "email" | "otp" | "password" | "complete";
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Login State
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
    loading: false,
    error: "",
  });

  // Registration State
  const [registerState, setRegisterState] = useState<AuthState>({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    resetToken: "",
    loading: false,
    error: "",
    success: "",
    step: "email",
  });

  // Forgot Password State
  const [forgotState, setForgotState] = useState<AuthState>({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    resetToken: "",
    loading: false,
    error: "",
    success: "",
    step: "email",
  });

  // Password Reset Dialog State
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await AuthService.login(loginState.email, loginState.password);

      if (!["employee", "employer", "admin"].includes(response.user.role)) {
        setLoginState((prev) => ({ ...prev, error: "Invalid role." }));
        AuthService.logout();
        return;
      }

      router.push("/");
    } catch (err) {
      setLoginState((prev) => ({ ...prev, error: "Invalid email or password" }));
    } finally {
      setLoginState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Registration Handlers
  const handleSendOTP = async () => {
    if (!registerState.email || !isValidEmail(registerState.email)) {
      setRegisterState((prev) => ({ ...prev, error: "Please enter a valid email address" }));
      return;
    }

    setRegisterState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      await AuthService.sendRegistrationOTP(registerState.email);

      setRegisterState((prev) => ({
        ...prev,
        loading: false,
        success: "OTP sent to your email address",
        step: "otp",
      }));
    } catch (error: any) {
      console.error("Error sending OTP:", error);

      setRegisterState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || "Failed to send OTP. Please try again.",
      }));
    }
  };

  const handleVerifyOTP = async () => {
    if (!registerState.otp || registerState.otp.length !== 6) {
      setRegisterState((prev) => ({ ...prev, error: "Please enter a valid 6-digit OTP" }));
      return;
    }

    setRegisterState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      const result = await AuthService.verifyRegistrationOTP(registerState.email, registerState.otp);

      setRegisterState((prev) => ({
        ...prev,
        loading: false,
        success: "OTP verified successfully",
        step: "password",
      }));
    } catch (error: any) {
      let errorMsg = "Invalid OTP. Please try again.";
      if (error?.response?.status === 410) errorMsg = "OTP expired. Please request a new one.";
      if (error?.response?.status === 400) errorMsg = "Email and OTP are required.";

      setRegisterState((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));
    }
  };

  const handleCompleteRegistration = async () => {
    const { password, confirmPassword, email, otp } = registerState;

    if (!password || password.length < 8) {
      setRegisterState((prev) => ({ ...prev, error: "Password must be at least 8 characters long" }));
      return;
    }

    if (password !== confirmPassword) {
      setRegisterState((prev) => ({ ...prev, error: "Passwords do not match" }));
      return;
    }

    if (!isStrongPassword(password)) {
      setRegisterState((prev) => ({
        ...prev,
        error: "Password must contain uppercase, lowercase, number, and special character",
      }));
      return;
    }

    setRegisterState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    try {
      await AuthService.completeRegistration(email, password, otp); // pass the OTP as token

      setRegisterState((prev) => ({
        ...prev,
        loading: false,
        success: "Registration completed successfully! Please login.",
        step: "complete",
      }));

      setTimeout(() => {
        setActiveTab("login");
        setRegisterState({
          email: "",
          password: "",
          confirmPassword: "",
          otp: "",
          resetToken: "",
          loading: false,
          error: "",
          success: "",
          step: "email",
        });
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);

      setRegisterState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || "Registration failed. Please try again.",
      }));
    }
  };

  // Forgot Password Handlers
  const handleSendResetLink = async () => {
    if (!isValidEmail(forgotState.email)) {
      setForgotState((prev) => ({ ...prev, error: "Please enter a valid email address" }));
      return;
    }
    setForgotState((prev) => ({ ...prev, loading: true, error: "", success: "" }));
    try {
      await AuthService.sendPasswordResetLink(forgotState.email);
      setForgotState((prev) => ({
        ...prev,
        loading: false,
        success: "If the email exists, a reset link has been sent.",
        step: "complete",
      }));
    } catch (error: any) {
      setForgotState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || "Failed to send reset link. Please try again.",
      }));
    }
  };

  // Validation Functions
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password: string) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return strongPasswordRegex.test(password);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { level: "weak", color: "bg-red-500", text: "Weak" };
    if (strength <= 3) return { level: "medium", color: "bg-yellow-500", text: "Medium" };
    return { level: "strong", color: "bg-green-500", text: "Strong" };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">SO</span>
          </div>
          <CardTitle className="text-2xl">Space Optimizer</CardTitle>
          <CardDescription>Employee/Employer Portal Access</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Register
              </TabsTrigger>
              <TabsTrigger value="forgot" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Reset
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginState.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginState.error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="Enter your email" className="pl-10" value={loginState.email} onChange={(e) => setLoginState((prev) => ({ ...prev, email: e.target.value }))} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-10" value={loginState.password} onChange={(e) => setLoginState((prev) => ({ ...prev, password: e.target.value }))} required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loginState.loading}>
                  {loginState.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="register" className="space-y-4">
              {registerState.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{registerState.error}</AlertDescription>
                </Alert>
              )}

              {registerState.success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{registerState.success}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Email */}
              {registerState.step === "email" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="register-email" type="email" placeholder="Enter your email" className="pl-10" value={registerState.email} onChange={(e) => setRegisterState((prev) => ({ ...prev, email: e.target.value }))} required />
                    </div>
                  </div>

                  <Button onClick={handleSendOTP} className="w-full" disabled={registerState.loading}>
                    {registerState.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
              )}

              {/* Step 2: OTP Verification */}
              {registerState.step === "otp" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">
                      Step 2 of 3
                    </Badge>
                    <p className="text-sm text-muted-foreground">Enter the 6-digit OTP sent to {registerState.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-otp">OTP Code</Label>
                    <Input id="register-otp" type="text" placeholder="Enter 6-digit OTP" maxLength={6} className="text-center text-lg tracking-widest" value={registerState.otp} onChange={(e) => setRegisterState((prev) => ({ ...prev, otp: e.target.value.replace(/\D/g, "") }))} required />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setRegisterState((prev) => ({ ...prev, step: "email" }))} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleVerifyOTP} className="flex-1" disabled={registerState.loading}>
                      {registerState.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Set Password */}
              {registerState.step === "password" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">
                      Step 3 of 3
                    </Badge>
                    <p className="text-sm text-muted-foreground">Create a secure password for your account</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="register-password" type={showPassword ? "text" : "password"} placeholder="Enter new password" className="pl-10 pr-10" value={registerState.password} onChange={(e) => setRegisterState((prev) => ({ ...prev, password: e.target.value }))} required />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {registerState.password && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded">
                            <div
                              className={`h-full rounded transition-all ${getPasswordStrength(registerState.password).color}`}
                              style={{
                                width: `${getPasswordStrength(registerState.password).level === "weak" ? 33 : getPasswordStrength(registerState.password).level === "medium" ? 66 : 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">{getPasswordStrength(registerState.password).text}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="register-confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" className="pl-10 pr-10" value={registerState.confirmPassword} onChange={(e) => setRegisterState((prev) => ({ ...prev, confirmPassword: e.target.value }))} required />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>At least 8 characters long</li>
                      <li>Contains uppercase and lowercase letters</li>
                      <li>Contains at least one number</li>
                      <li>Contains at least one special character</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setRegisterState((prev) => ({ ...prev, step: "otp" }))} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleCompleteRegistration} className="flex-1" disabled={registerState.loading}>
                      {registerState.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Complete */}
              {registerState.step === "complete" && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Registration Complete!</h3>
                    <p className="text-sm text-muted-foreground">Your account has been created successfully. You can now login.</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Forgot Password Tab */}
            <TabsContent value="forgot">
              {forgotState.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{forgotState.error}</AlertDescription>
                </Alert>
              )}
              {forgotState.success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{forgotState.success}</AlertDescription>
                </Alert>
              )}
              {forgotState.step === "email" && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="Enter your email" className="pl-10" value={forgotState.email} onChange={(e) => setForgotState((prev) => ({ ...prev, email: e.target.value }))} required />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleSendResetLink} disabled={forgotState.loading}>
                      {forgotState.loading ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" />
                          Sending Link...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
