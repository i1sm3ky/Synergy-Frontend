"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AuthService } from "@/lib/auth";

const statusColors = {
  "in-use": "bg-blue-500",
  booked: "bg-yellow-500",
  available: "bg-orange-500",
};

const statusLabels = {
  "in-use": "In-Use",
  booked: "Booked",
  available: "Available",
};

const hotSeatGuidelines = ["Hot seats are for temporary use only (max 8 hours)", "Clean the workspace before leaving", "Report any issues immediately", "No personal items should be left overnight", "Respect noise levels in open areas"];

export default function HotSeatPage() {
  const [selectedSeat, setSelectedSeat] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [hotSeats, setHotSeats] = useState<any[]>([]);

  useEffect(() => {
    const fetchSeats = async () => {
      const res = await AuthService.fetchWithAuth("/employee/get_workstation?type=hot_seat");
      const json = await res.json();
      setHotSeats(
        json.map((x: any) => ({
          id: x.workspace_id,
          status: x.status,
          booked_by: x.occupant
            ? {
                name: x.occupant,
                department: "N/A",
                employee_id: x.occupant,
                booking_time: x.time_slot?.[0] + " - " + x.time_slot?.[1],
              }
            : undefined,
        }))
      );
    };
    fetchSeats();
  }, []);

  const handleBookSeat = async () => {
    if (!selectedSeat || !startTime || !endTime) {
      return alert("Please select seat and both times");
    }
    try {
      const res = await AuthService.fetchWithAuth("/employee/book_workspace", {
        method: "POST",
        body: JSON.stringify({
          workspace_ID: selectedSeat,
          start_time: startTime,
          end_time: endTime,
          purpose,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.msg);
      alert("✅ Hot seat booked!");
      setIsBookingOpen(false);
      // re-fetch:
      // await fetchSeats();
    } catch (err: any) {
      alert("Error: " + err.message);
      console.error(err);
    }
  };

  return (
    <ProtectedLayout>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔥</span>
              </div>
              <h1 className="text-2xl font-bold">Get a Hot-Seat</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Hot Seats Grid */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Hot-Seats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {hotSeats.map((seat) => (
                      <Tooltip key={seat.id}>
                        <TooltipTrigger asChild>
                          <Button variant="outline" className={`h-16 ${statusColors[seat.status as keyof typeof statusColors]} text-white border-0 font-bold hover:scale-105 transition-transform`} disabled={seat.status !== "available"} onClick={() => setSelectedSeat(seat.id)}>
                            {seat.id}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="p-3 max-w-xs">
                          {seat.status === "available" ? (
                            <div>
                              <p className="font-semibold text-green-600">Available</p>
                              <p className="text-sm">Click to select this hot seat</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="font-semibold capitalize">{seat.status.replace("_", " ")}</p>
                              {seat.booked_by && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">{seat.booked_by.name}</p>
                                    <p className="text-xs text-muted-foreground">{seat.booked_by.department}</p>
                                    <p className="text-xs text-muted-foreground">ID: {seat.booked_by.employee_id}</p>
                                  </div>
                                  <p className="text-xs">⏰ {seat.booked_by.booking_time}</p>
                                </>
                              )}
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seat Selection and Booking */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Seat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedSeat} onValueChange={setSelectedSeat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seat ID: WS1" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotSeats
                        .filter((seat) => seat.status === "available")
                        .map((seat) => (
                          <SelectItem key={seat.id} value={seat.id}>
                            {seat.id}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* Status Legend */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>In-Use</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Available</span>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-fit border-dashed border-orange-300 text-orange-600 bg-transparent">
                        Read Hot-Seat Guidelines
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="p-4 max-w-xs">
                      <div className="space-y-2">
                        <p className="font-semibold">Hot-Seat Guidelines:</p>
                        <ul className="text-sm space-y-1">
                          {hotSeatGuidelines.map((rule, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-orange-500">•</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-500 hover:bg-blue-600" disabled={!selectedSeat}>
                        Book Selected Seat
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book Hot Seat {selectedSeat}</DialogTitle>
                        <DialogDescription>Fill in the details to book your hot seat</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="start-time">Start Time (9 AM minimum)</Label>
                            <select className="w-full p-2 border rounded" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                              <option value="">Select start time</option>
                              {Array.from({ length: 10 }, (_, i) => i + 9).map((hour) => (
                                <option key={hour} value={`${hour}:00`}>
                                  {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 ${hour === 12 ? "PM" : "AM"}`}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="end-time">End Time (6 PM maximum)</Label>
                            <select className="w-full p-2 border rounded" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                              <option value="">Select end time</option>
                              {Array.from({ length: 10 }, (_, i) => i + 9).map((hour) => (
                                <option key={hour} value={`${hour}:00`}>
                                  {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 ${hour === 12 ? "PM" : "AM"}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="purpose">Purpose</Label>
                          <Textarea id="purpose" placeholder="What will you be using this seat for?" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
                        </div>
                        <Button onClick={handleBookSeat} className="w-full">
                          Confirm Booking
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Workspace Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Insights</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Optimal Booking Times</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Quietest Hours: 8-10 AM, 4-6 PM</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>8 AM</span>
                      <span>12 PM</span>
                      <span>6 PM</span>
                    </div>
                    <div className="w-full h-2 bg-blue-200 rounded mt-1">
                      <div className="h-full bg-blue-500 rounded" style={{ width: "60%" }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">Team Proximity</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Your team is mostly on Level 1 today</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-6 h-2 bg-blue-500 rounded"></div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">5 teammates nearby</p>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Prompt */}
              <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">Schedule a Workstation / Discussion room for a week / month / everyday ?</h3>
                  <Link href="/scheduling">
                    <Button className="bg-blue-500 hover:bg-blue-600">Set Now</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedLayout>
  );
}
