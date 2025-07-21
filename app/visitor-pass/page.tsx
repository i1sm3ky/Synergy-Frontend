"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Upload, X } from "lucide-react";
import Link from "next/link";
import { AuthService } from "@/lib/auth";

const timeSlots = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function VisitorPassPage() {
  const [numVisitors, setNumVisitors] = useState("1");
  const [inTime, setInTime] = useState("12:00");
  const [outTime, setOutTime] = useState("14:00");
  const [visitors, setVisitors] = useState([
    { name: "", phone: "", address: "", photo: null as File | null, photoPreview: "" },
    { name: "", phone: "", address: "", photo: null as File | null, photoPreview: "" },
  ]);

  const [passLink, setPassLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVisitorChange = (index: number, field: string, value: string) => {
    const updated = [...visitors];
    updated[index] = { ...updated[index], [field]: value };
    setVisitors(updated);
  };

  const handlePhotoUpload = (index: number, file: File) => {
    const updated = [...visitors];
    updated[index] = {
      ...updated[index],
      photo: file,
      photoPreview: URL.createObjectURL(file),
    };
    setVisitors(updated);
  };

  const removePhoto = (index: number) => {
    const updated = [...visitors];
    updated[index] = { ...updated[index], photo: null, photoPreview: "" };
    setVisitors(updated);
  };

  const canSubmit = () => {
    const req = visitors.slice(0, parseInt(numVisitors));
    return req.every((v) => v.name && v.phone && v.address && v.photo);
  };

  const handleGetPass = async () => {
    try {
      const visitor = visitors[0]; // Since backend accepts one visitor per request

      if (!visitor.name || !visitor.phone || !visitor.address || !visitor.photo) {
        alert("Please complete all visitor details including photo.");
        return;
      }

      const formData = new FormData();
      formData.append("visitor_name", visitor.name);
      formData.append("visitor_email", visitor.phone); // Assuming phone is used as email – adjust if needed
      formData.append("purpose", visitor.address); // Adjust if your form has a separate purpose field

      const res = await AuthService.fetchWithAuth("/employee/get_visitor_pass", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text(); // Prevent .json() crash
        console.error("Server error:", errorText);
        alert(`Failed to create visitor pass: ${res.status}`);
        return;
      }

      const json = await res.json();
      console.log("Visitor pass created:", json);

      alert(`Visitor pass created! Access link: ${json.visitor_pass_link}`);

      // Optional: Fetch visitor data using the returned link
      const dataRes = await AuthService.fetchWithAuth(`/employee/get_visitor_data/${json.visitor_pass_link.split("/").pop()}`);

      if (!dataRes.ok) {
        const raw = await dataRes.text();
        console.error("Failed to fetch visitor data:", raw);
        return;
      }

      const visitorData = await dataRes.json();
      console.log("Fetched visitor data:", visitorData);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Check the console for details.");
    }
  };
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Get a Visitor Pass</h1>
          </div>
        </div>

        <Card className="max-w-4xl">
          <CardContent className="p-6 space-y-6">
            {/* Time selection */}
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Number of visitors:</Label>
                <Input type="number" min="1" max="10" value={numVisitors} onChange={(e) => setNumVisitors(e.target.value)} className="bg-gray-200" />
              </div>
              <div className="space-y-2">
                <Label>In-Time:</Label>
                <Select value={inTime} onValueChange={setInTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.slice(0, -1).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Out-Time:</Label>
                <Select value={outTime} onValueChange={setOutTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots
                      .filter((t) => parseInt(t) > parseInt(inTime))
                      .map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label>Visitor Duration (9 AM–6 PM)</Label>
              <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute top-0 h-full bg-yellow-300 flex items-center justify-center text-sm font-medium transition-all duration-300"
                  style={{
                    left: `${((parseInt(inTime) - 9) / 9) * 100}%`,
                    width: `${((parseInt(outTime) - parseInt(inTime)) / 9) * 100}%`,
                  }}
                >
                  Visitors
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
                  <span>9 AM</span>
                  <span>12 PM</span>
                  <span>3 PM</span>
                  <span>6 PM</span>
                </div>
              </div>
            </div>

            {/* Visitor details */}
            <div className="space-y-6">
              {Array.from({ length: parseInt(numVisitors) }).map((_, i) => (
                <div key={i} className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-medium">Visitor {i + 1} details:</h3>
                  <div className="space-y-2">
                    <Label className="text-red-600">Photo (Required) *</Label>
                    {visitors[i].photoPreview ? (
                      <div className="relative inline-block">
                        <img src={visitors[i].photoPreview} alt="" className="w-24 h-24 object-cover border-2 rounded-lg" />
                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2" onClick={() => removePhoto(i)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center">
                        <input type="file" accept="image/*" id={`photo-${i}`} hidden onChange={(e) => e.target.files?.[0] && handlePhotoUpload(i, e.target.files[0])} />
                        <label htmlFor={`photo-${i}`} className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-red-400" />
                          <p>Upload visitor photo</p>
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Name *</Label>
                      <Input className="bg-gray-200" value={visitors[i].name} onChange={(e) => handleVisitorChange(i, "name", e.target.value)} />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input className="bg-gray-200" value={visitors[i].phone} onChange={(e) => handleVisitorChange(i, "phone", e.target.value)} />
                    </div>
                    <div>
                      <Label>Address *</Label>
                      <Input className="bg-gray-200" value={visitors[i].address} onChange={(e) => handleVisitorChange(i, "address", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="text-center">
              <Button disabled={!canSubmit() || loading} onClick={handleGetPass} className="bg-blue-500 hover:bg-blue-600 px-8 py-3 text-lg">
                {loading ? "Submitting…" : "Get Pass"}
              </Button>
              {error && <p className="text-red-600 mt-2">{error}</p>}
              {passLink && (
                <p className="mt-4 text-green-600">
                  Visitor pass created!{" "}
                  <Link href={passLink}>
                    <a className="underline">View Pass</a>
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
