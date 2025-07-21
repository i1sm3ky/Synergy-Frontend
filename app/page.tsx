"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService, User } from "@/lib/auth";
import EmployeeHomePage from "./EmployeePage";

export default function page() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getUser();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [router]);

  if (loading) return <div className="h-screen w-screen flex justify-center items-center text-2xl">Loading dashboard...</div>;

  switch (user?.role) {
    case "employee":
      return <EmployeeHomePage />;
    case "employer":
      return <EmployerDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <div>Unauthorized access</div>;
  }
}

// Stub components, replace with real ones
function EmployerDashboard() {
  return <div>Welcome Employer! 🧑‍💼</div>;
}

function AdminDashboard() {
  return <div>Welcome Admin! 🛠️</div>;
}
