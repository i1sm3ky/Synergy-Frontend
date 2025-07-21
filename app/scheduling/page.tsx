"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { AuthService } from "@/lib/auth";

const schedulingGuidelines = ["Discussion rooms: Minimum 1 hour, Maximum 1 day booking", "Workstations: Full day booking only (9 AM - 6 PM)", "Cancel bookings at least 2 hours in advance", "Respect booking times and clean up after use", "Report technical issues immediately"];

const statusColors = {
  available: "bg-gray-600",
  booked: "bg-yellow-500",
  "partially-booked": "bg-green-500",
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getWeekDays = () => [
  { day: "S", name: "Sunday", active: false },
  { day: "M", name: "Monday", active: true },
  { day: "T", name: "Tuesday", active: true },
  { day: "W", name: "Wednesday", active: true },
  { day: "T", name: "Thursday", active: false },
  { day: "F", name: "Friday", active: true },
  { day: "S", name: "Saturday", active: false },
];

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export default function SchedulingPage() {
  const [selectedType, setSelectedType] = useState("Discussion Room");
  const [selectedRoom, setSelectedRoom] = useState("DR1");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00");
  const [existingBookings, setExistingBookings] = useState<{ occupant: string; time_slot: [string, string] }[]>([]);
  const [hasConflict, setHasConflict] = useState(false);
  const [schedule, setSchedule] = useState("Custom");
  const [weekDays, setWeekDays] = useState(getWeekDays());
  const [monthlyDays, setMonthlyDays] = useState<boolean[]>(Array(31).fill(false));
  const [workstationsData, setWorkstationsData] = useState<any[]>([]);
  const [discussionRoomsData, setDiscussionRoomsData] = useState<any[]>([]);

  const currentData = selectedType === "Discussion Room" ? discussionRoomsData : workstationsData;
  const availableOptions = selectedType === "Discussion Room" ? discussionRoomsData.filter((room) => room.status === "available" || room.status === "partially-booked") : workstationsData.filter((ws) => ws.status === "available");

  const timeSlots =
    selectedType === "Discussion Room"
      ? Array.from({ length: 10 }, (_, i) => `${i + 9}:00`) // 9 AM to 6 PM for discussion rooms
      : ["9:00"]; // Full day only for workstations

  useEffect(() => {
    const fetchData = async () => {
      const typeMap = {
        "Discussion Room": "discussion_room",
        Workstation: "work_station",
      };

      try {
        const [wsRes, drRes] = await Promise.all([AuthService.fetchWithAuth(`/employee/get_workstation?type=${typeMap.Workstation}`), AuthService.fetchWithAuth(`/employee/get_workstation?type=${typeMap["Discussion Room"]}`)]);

        const wsJson = await wsRes.json();
        const drJson = await drRes.json();

        setWorkstationsData(
          wsJson.map((x: any) => ({
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

        setDiscussionRoomsData(
          drJson.map((x: any) => ({
            id: x.workspace_id,
            capacity: 4, // or x.capacity if available from backend
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
      } catch (err) {
        console.error("Failed to fetch workspaces", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedRoom) return;

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      try {
        const res = await AuthService.fetchWithAuth(`/employee/check_workspace_availability?workspace_ID=${selectedRoom}&date=${today}`);
        const data = await res.json();

        if (data.bookings) {
          const formatted = data.bookings.map((b: any) => ({
            occupant: b.required_id,
            time_slot: [b.start_time, b.end_time] as [string, string],
          }));
          setExistingBookings(formatted);
        } else {
          setExistingBookings([]);
        }
      } catch (error) {
        console.error("Error fetching existing bookings:", error);
        setExistingBookings([]);
      }
    };

    fetchBookings();
  }, [selectedRoom]);

  useEffect(() => {
    const newConflict = existingBookings.some((booking) => {
      const [startA, endA] = booking.time_slot.map(timeToMinutes);
      const startB = timeToMinutes(startTime);
      const endB = timeToMinutes(endTime);

      // console.log("Checking overlap:", { startA, endA, startB, endB });

      return startA < endB && startB < endA; // classic overlap condition
    });

    setHasConflict(newConflict);
  }, [existingBookings, startTime, endTime]);

  const getTimePosition = (time: string) => {
    const hour = Number.parseInt(time.split(":")[0]);
    return ((hour - 9) / 9) * 100;
  };

  const getDuration = () => {
    if (selectedType === "Workstation") return 100; // Full day
    const startHour = Number.parseInt(startTime.split(":")[0]);
    const endHour = Number.parseInt(endTime.split(":")[0]);
    return ((endHour - startHour) / 9) * 100;
  };

  const toggleWeekDay = (index: number) => {
    const updated = [...weekDays];
    updated[index].active = !updated[index].active;
    setWeekDays(updated);
  };

  const toggleMonthDay = (day: number) => {
    const updated = [...monthlyDays];
    updated[day] = !updated[day];
    setMonthlyDays(updated);
  };

  const handleScheduleWorkspace = async () => {
    if (!selectedRoom || !startTime || !endTime) {
      alert("Please select all fields");
      return;
    }

    const pattern =
      schedule === "Weekly"
        ? weekDays
            .filter((day) => day.active)
            .map((day) => day.name.slice(0, 2).toLowerCase()) // e.g., "Monday" → "mo"
            .join(",")
        : "";

    const requestBody = {
      workspace_ID: selectedRoom,
      required_id: undefined, // will be inferred by backend as current user
      start_time: startTime,
      end_time: endTime,
      purpose: "", // optional
      schedule: pattern || undefined,
    };

    try {
      const response = await AuthService.fetchWithAuth("/employee/book_workspace", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert("✅ Workspace booked successfully!");
      } else {
        const error = await response.json();
        alert("❌ Booking failed: " + error.msg);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("❌ Something went wrong while booking.");
    }
  };

  const SeatTooltip = ({ seat, children }: { seat: any; children: React.ReactNode }) => (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="p-3 max-w-xs">
        {seat.status === "available" ? (
          <div>
            <p className="font-semibold text-green-600">Available</p>
            <p className="text-sm">Click to select this {selectedType.toLowerCase()}</p>
            {seat.capacity && <p className="text-xs">👥 Capacity: {seat.capacity}</p>}
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
                {seat.capacity && <p className="text-xs">👥 Capacity: {seat.capacity}</p>}
              </>
            )}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );

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
              <Calendar className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold">Schedule a seat / slot</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Guidelines */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-fit border-dashed border-blue-300 text-blue-600 bg-transparent">
                    Read Scheduling Guidelines
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="p-4 max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">Scheduling Guidelines:</p>
                    <ul className="text-sm space-y-1">
                      {schedulingGuidelines.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Status Legend */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Partially Booked</span>
                </div>
              </div>

              {/* Available Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Available {selectedType}s</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  {selectedType === "Discussion Room" ? (
                    <div className="space-y-2">
                      <p className="font-medium">Discussion Rooms:</p>
                      {availableOptions.map((room: any) => (
                        <div key={room.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {room.id}
                            </Badge>
                            <span>Cap: {room.capacity}</span>
                          </div>
                          {room.status === "partially-booked" && room.booked_by && <div className="text-xs text-muted-foreground ml-2">Busy: {room.booked_by.booking_time}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium">Workstations:</p>
                      {availableOptions.map((ws: any) => (
                        <div key={ws.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {ws.id}
                            </Badge>
                            <span>Full Day Only</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Workspace Grids */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Workstations */}
                <div>
                  <h3 className="font-semibold mb-3">Workstations</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {workstationsData.map((ws) => (
                      <SeatTooltip key={ws.id} seat={ws}>
                        <Button
                          variant="outline"
                          className={`h-12 ${statusColors[ws.status as keyof typeof statusColors]} text-white border-0 text-xs font-bold hover:scale-105 transition-transform`}
                          onClick={() => {
                            setSelectedType("Workstation");
                            setSelectedRoom(ws.id);
                          }}
                        >
                          {ws.id}
                        </Button>
                      </SeatTooltip>
                    ))}
                  </div>
                </div>

                {/* Discussion Rooms */}
                <div>
                  <h3 className="font-semibold mb-3">Discussion Rooms</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {discussionRoomsData.map((room) => (
                      <SeatTooltip key={room.id} seat={room}>
                        <Button
                          variant="outline"
                          className={`h-16 ${statusColors[room.status as keyof typeof statusColors]} text-white border-0 font-bold hover:scale-105 transition-transform flex flex-col`}
                          onClick={() => {
                            setSelectedType("Discussion Room");
                            setSelectedRoom(room.id);
                          }}
                        >
                          <span>{room.id}</span>
                          <span className="text-[10px]">Cap: {room.capacity}</span>
                        </Button>
                      </SeatTooltip>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose Type</label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => {
                      setSelectedType(value);
                      if (value === "Workstation") {
                        setStartTime("9:00");
                        setEndTime("18:00");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Discussion Room">Discussion Room</SelectItem>
                      <SelectItem value="Workstation">Workstation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose seat / discussion area</label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentData.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.id} {item.capacity && `(Cap: ${item.capacity})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose start time</label>
                  <Select value={startTime} onValueChange={setStartTime} disabled={selectedType === "Workstation"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {Number.parseInt(time) > 12 ? `${Number.parseInt(time) - 12}:00 PM` : `${time.split(":")[0]}:00 ${Number.parseInt(time) === 12 ? "PM" : "AM"}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedType === "Workstation" && <p className="text-xs text-muted-foreground">Fixed: 9:00 AM</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose end time</label>
                  <Select value={endTime} onValueChange={setEndTime} disabled={selectedType === "Workstation"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedType === "Discussion Room" ? (
                        timeSlots
                          .filter((time) => Number.parseInt(time) > Number.parseInt(startTime))
                          .map((time) => (
                            <SelectItem key={time} value={time}>
                              {Number.parseInt(time) > 12 ? `${Number.parseInt(time) - 12}:00 PM` : `${time.split(":")[0]}:00 ${Number.parseInt(time) === 12 ? "PM" : "AM"}`}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedType === "Workstation" && <p className="text-xs text-muted-foreground">Fixed: 6:00 PM</p>}
                </div>
              </div>

              {/* Schedule Pattern */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose Schedule</label>
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Custom">Custom</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Today">Today</SelectItem>
                      <SelectItem value="Tomorrow">Tomorrow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {schedule === "Weekly" && (
                  <div className="flex gap-2">
                    {weekDays.map((day, index) => (
                      <Button key={index} variant="outline" className={`w-12 h-12 rounded-lg ${day.active ? "bg-green-500 text-white border-green-500" : "bg-gray-200 text-gray-600"}`} onClick={() => toggleWeekDay(index)}>
                        {day.day}
                      </Button>
                    ))}
                  </div>
                )}

                {schedule === "Monthly" && (
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: getDaysInMonth(new Date().getFullYear(), new Date().getMonth()) }, (_, i) => i + 1).map((day) => (
                      <Button key={day} variant="outline" className={`w-10 h-10 rounded-lg text-xs ${monthlyDays[day - 1] ? "bg-green-500 text-white border-green-500" : "bg-gray-200 text-gray-600"}`} onClick={() => toggleMonthDay(day - 1)}>
                        {day}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedType} {selectedRoom} Schedule on Monday, January 7, 2025
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {selectedType === "Discussion Room" ? (
                      <>
                        {existingBookings.map((booking, idx) => {
                          const start = getTimePosition(booking.time_slot[0]);
                          const width = ((parseInt(booking.time_slot[1]) - parseInt(booking.time_slot[0])) / 9) * 100;

                          return (
                            <div
                              key={idx}
                              className="absolute top-0 h-full bg-red-300 flex items-center justify-center text-xs font-medium z-2"
                              style={{
                                left: `${start}%`,
                                width: `${width}%`,
                              }}
                            >
                              {booking.occupant}
                            </div>
                          );
                        })}

                        <div
                          className="absolute top-0 h-full bg-yellow-300 flex items-center justify-center text-sm font-medium -z-1 transition-all duration-300"
                          style={{
                            left: `${getTimePosition(startTime)}%`,
                            width: `${getDuration()}%`,
                          }}
                        >
                          Your Booking
                        </div>
                      </>
                    ) : (
                      <div className="absolute left-0 top-0 h-full w-full bg-blue-300 flex items-center justify-center text-sm font-medium">Your Workstation (Full Day)</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
                      <span>9 AM</span>
                      <span>12 PM</span>
                      <span>3 PM</span>
                      <span>6 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {hasConflict && <div className="text-red-500">⚠️ Time conflict with another booking</div>}

              <Button onClick={handleScheduleWorkspace} disabled={hasConflict} className="w-full mt-4">
                Schedule Workspace
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedLayout>
  );
}
