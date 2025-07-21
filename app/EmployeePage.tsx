"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Users, Calendar, Clock, User, Home, AlertTriangle, Building } from "lucide-react";
import Link from "next/link";
import { AuthService } from "@/lib/auth";

// BACKEND DATA STRUCTURE SPECIFICATIONS
// =====================================

// GET /api/dashboard-data
// Expected Response Format:
// {
//   user: {
//     id: string,
//     name: string,
//     email: string,
//     department: string,
//     employee_id: string
//   },
//   current_level: number,
//   available_levels: number[],
//   bookings: [
//     {
//       id: string,
//       type: "conference_room" | "hot_seat" | "workstation" | "discussion_room",
//       resource_name: string,
//       date: "YYYY-MM-DD",
//       start_time: "HH:MM",
//       end_time: "HH:MM",
//       team: string,
//       agenda?: string,
//       purpose?: string,
//       status: "confirmed" | "pending" | "cancelled"
//     }
//   ],
//   level_occupancy: [
//     {
//       level: number,
//       occupancy_percentage: number,
//       total_seats: number,
//       occupied_seats: number
//     }
//   ],
//   workspace_insights: {
//     optimal_times: {
//       quiet_hours: string,
//       peak_hours: string
//     },
//     team_proximity: {
//       level: number,
//       teammates_count: number,
//       teammates: [
//         {
//           name: string,
//           seat_id: string,
//           department: string
//         }
//       ]
//     }
//   },
//   seats_layout: {
//     workstations: [
//       {
//         id: string,
//         position: { x: number, y: number },
//         status: "available" | "booked" | "in_use",
//         booked_by?: {
//           name: string,
//           department: string,
//           employee_id: string,
//           booking_time: "HH:MM - HH:MM"
//         }
//       }
//     ],
//     hot_seats: [
//       {
//         id: string,
//         position: { x: number, y: number },
//         status: "available" | "booked" | "in_use",
//         booked_by?: {
//           name: string,
//           department: string,
//           employee_id: string,
//           booking_time: "HH:MM - HH:MM"
//         }
//       }
//     ],
//     discussion_rooms: [
//       {
//         id: string,
//         position: { x: number, y: number },
//         capacity: number,
//         status: "available" | "booked" | "partially_booked",
//         current_booking?: {
//           team: string,
//           department: string,
//           booked_by: string,
//           booking_time: "HH:MM - HH:MM"
//         }
//       }
//     ]
//   }
// }

// POST /api/mark-wfh
// Request: { date: "YYYY-MM-DD", is_wfh: boolean }
// Response: { success: boolean, message: string }

// POST /api/raise-conflict
// Request: {
//   conflict_type: "immediate_seat" | "immediate_discussion_room",
//   on_behalf_of: "self" | "team",
//   team_name?: string,
//   severity: "low" | "medium" | "high" | "critical",
//   description: string,
//   required_time: "HH:MM - HH:MM"
// }
// Response: {
//   conflict_id: string,
//   status: "pending" | "resolved" | "rejected",
//   resolution?: string,
//   assigned_resource?: string
// }

// Mock enhanced data
// const mockSeatsData = {
//   workstations: [
//     {
//       id: "WS1",
//       position: { x: 1, y: 1 },
//       status: "booked",
//       booked_by: {
//         name: "Alice Johnson",
//         department: "Engineering",
//         employee_id: "ENG001",
//         booking_time: "9:00 - 18:00",
//       },
//     },
//     { id: "WS2", position: { x: 2, y: 1 }, status: "available" },
//     {
//       id: "WS3",
//       position: { x: 3, y: 1 },
//       status: "in_use",
//       booked_by: { name: "Bob Smith", department: "Marketing", employee_id: "MKT002", booking_time: "9:00 - 18:00" },
//     },
//     { id: "WS4", position: { x: 4, y: 1 }, status: "available" },
//     {
//       id: "WS5",
//       position: { x: 1, y: 2 },
//       status: "booked",
//       booked_by: { name: "Carol Davis", department: "HR", employee_id: "HR003", booking_time: "9:00 - 18:00" },
//     },
//     { id: "WS6", position: { x: 2, y: 2 }, status: "available" },
//   ],
//   hot_seats: [
//     {
//       id: "HS1",
//       position: { x: 1, y: 3 },
//       status: "booked",
//       booked_by: { name: "David Wilson", department: "Sales", employee_id: "SAL004", booking_time: "14:00 - 17:00" },
//     },
//     {
//       id: "HS2",
//       position: { x: 2, y: 3 },
//       status: "in_use",
//       booked_by: { name: "Eve Brown", department: "Finance", employee_id: "FIN005", booking_time: "10:00 - 15:00" },
//     },
//     { id: "HS3", position: { x: 3, y: 3 }, status: "available" },
//     { id: "HS4", position: { x: 4, y: 3 }, status: "available" },
//   ],
//   discussion_rooms: [
//     {
//       id: "DR1",
//       position: { x: 1, y: 4 },
//       capacity: 8,
//       status: "booked",
//       current_booking: {
//         team: "Engineering Team",
//         department: "Engineering",
//         booked_by: "Alice Johnson",
//         booking_time: "10:00 - 12:00",
//       },
//     },
//     {
//       id: "DR2",
//       position: { x: 2, y: 4 },
//       capacity: 6,
//       status: "partially_booked",
//       current_booking: {
//         team: "Marketing Team",
//         department: "Marketing",
//         booked_by: "Bob Smith",
//         booking_time: "14:00 - 15:00",
//       },
//     },
//     { id: "DR3", position: { x: 3, y: 4 }, capacity: 4, status: "available" },
//   ],
// };

const mockConflictResults = [
  { id: "1", type: "Seat assigned", resource: "WS7", time: "2 minutes ago" },
  { id: "2", type: "Pending review", resource: "DR4", time: "5 minutes ago" },
];

interface Seat {
  id: string;
  status: string;
  occupant?: string;
  capacity?: number;
}

interface Booking {
  id: string;
  type: string;
  date: string;
  start_time: string;
  end_time: string;
  team?: string;
  agenda?: string;
  purpose?: string;
  status: string;
}

export default function EmployeeHomePage() {
  const [user, setUser] = useState(AuthService.getUser());

  const [currentLevel, setCurrentLevel] = useState(1);
  const [isWFHDialogOpen, setIsWFHDialogOpen] = useState(false);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflictType, setConflictType] = useState("");
  const [conflictOnBehalf, setConflictOnBehalf] = useState("");
  const [conflictSeverity, setConflictSeverity] = useState("");
  const [conflictDescription, setConflictDescription] = useState("");
  const [teamName, setTeamName] = useState("");
  const [conflictResults, setConflictResults] = useState(mockConflictResults);

  const [workstations, setWorkstations] = useState<Seat[]>([]);
  const [hotSeats, setHotSeats] = useState<Seat[]>([]);
  const [discussionRooms, setDiscussionRooms] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchSeatsByType = async (type: string, setter: React.Dispatch<React.SetStateAction<Seat[]>>) => {
      try {
        const res = await AuthService.fetchWithAuth(`/employee/get_workstation?type=${type}`);
        if (!res.ok) throw new Error(`Failed to fetch ${type}`);

        const data = await res.json();

        const mapped: Seat[] = data.map((ws: any) => ({
          id: ws.workspace_id,
          status: ws.status,
          occupant: ws.occupant,
          capacity: ws.capacity || (type === "discussion_room" ? 6 : undefined), // Fallback capacity for discussion rooms if needed
        }));

        setter(mapped);
      } catch (err) {
        console.error(err);
        setter([]);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await AuthService.fetchWithAuth("/employee/my_bookings");
        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();

        const mapped: Booking[] = data.map((b: any) => {
          let date = "Unknown";
          try {
            date = new Date(b.timestamp._seconds * 1000).toISOString().split("T")[0]; // Firestore timestamp handling
          } catch {
            console.warn("Invalid timestamp:", b.timestamp);
          }

          return {
            id: b.booking_id,
            type: b.workspace_ID || "Workspace",
            date,
            start_time: b.start_time || "N/A",
            end_time: b.end_time || "N/A",
            team: b.team,
            agenda: b.agenda,
            purpose: b.purpose,
            status: "confirmed", // or use actual status if available
          };
        });

        setBookings(mapped);
      } catch (err) {
        console.error("Failed to load bookings", err);
        setBookings([]);
      }
    };

    fetchSeatsByType("work_station", setWorkstations);
    fetchSeatsByType("hot_seat", setHotSeats);
    fetchSeatsByType("discussion_room", setDiscussionRooms);
    fetchBookings();
  }, []);

  useEffect(() => {
    // TODO: Uncomment when backend auth is ready
    const currentUser = AuthService.getUser();
    if (!user) {
      window.location.href = "/login";
    } else {
      setUser(currentUser);
    }
    // TODO: Replace with actual API call when backend is ready
    // Backend URL: GET {BACKEND_URL}/api/my-bookings
    // AuthService.fetchWithAuth('/api/my-bookings')
    //   .then(res => res.json())
    //   .then(data => setBookings(data))
    //   .catch(err => console.error('Failed to fetch bookings:', err))
  }, []);

  const handleMarkWFH = async () => {
    // TODO: API call to mark WFH
    alert("Marked as Work From Home for tomorrow!");
    setIsWFHDialogOpen(false);
  };

  const handleRaiseConflict = async () => {
    // TODO: API call to raise conflict
    const newConflict = {
      id: Date.now().toString(),
      type: "Conflict raised",
      resource: conflictType === "immediate_seat" ? "Workstation" : "Discussion Room",
      time: "Just now",
    };
    setConflictResults([newConflict, ...conflictResults]);
    alert("Conflict raised successfully!");
    setIsConflictDialogOpen(false);
  };

  const getSeatStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "booked":
        return "bg-yellow-500";
      case "in_use":
        return "bg-red-500";
      case "partially_booked":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const SeatTooltip = ({ seat, children }: { seat: any; children: React.ReactNode }) => (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="p-3 max-w-xs">
        {seat.status === "available" ? (
          <div>
            <p className="font-semibold text-green-600">Available</p>
            <p className="text-sm">Click to book this {seat.id.startsWith("WS") ? "workstation" : seat.id.startsWith("HS") ? "hot seat" : "discussion room"}</p>
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
            {seat.current_booking && (
              <>
                <div>
                  <p className="text-sm font-medium">{seat.current_booking.team}</p>
                  <p className="text-xs text-muted-foreground">{seat.current_booking.department}</p>
                  <p className="text-xs text-muted-foreground">By: {seat.current_booking.booked_by}</p>
                </div>
                <p className="text-xs">⏰ {seat.current_booking.booking_time}</p>
                {seat.capacity && <p className="text-xs">👥 Capacity: {seat.capacity}</p>}
              </>
            )}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );

  const quickActions = [
    {
      title: "Get Hot-Seat",
      icon: MapPin,
      href: "/hot-seat",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Get Visitor Pass",
      icon: Users,
      href: "/visitor-pass",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Available Slots",
      icon: Calendar,
      href: "/scheduling",
      color: "bg-red-500 hover:bg-red-600",
    },
  ];

  return (
    <ProtectedLayout>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Welcome Section with Level Selector */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
              <p className="text-muted-foreground">Manage your workspace and bookings</p>
            </div>
            <div className="flex gap-3">
              <Select value={currentLevel.toString()} onValueChange={(value) => setCurrentLevel(Number.parseInt(value))}>
                <SelectTrigger className="w-32">
                  <Building className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* WFH and Conflict Buttons */}
          <div className="flex gap-4">
            <Dialog open={isWFHDialogOpen} onOpenChange={setIsWFHDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Home className="w-4 h-4" />
                  Mark WFH Tomorrow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Work From Home</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Mark tomorrow as a Work From Home day?</p>
                  <div className="flex gap-2">
                    <Button onClick={handleMarkWFH} className="flex-1">
                      Confirm WFH
                    </Button>
                    <Button variant="outline" onClick={() => setIsWFHDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isConflictDialogOpen} onOpenChange={setIsConflictDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 text-red-600 border-red-200 bg-transparent">
                  <AlertTriangle className="w-4 h-4" />
                  Raise Conflict
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Raise Immediate Conflict</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Conflict Type</Label>
                    <Select value={conflictType} onValueChange={setConflictType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select conflict type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate_seat">Immediate Seat Need</SelectItem>
                        <SelectItem value="immediate_discussion_room">Immediate Discussion Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>On Behalf Of</Label>
                    <Select value={conflictOnBehalf} onValueChange={setConflictOnBehalf}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Myself</SelectItem>
                        <SelectItem value="team">My Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {conflictOnBehalf === "team" && (
                    <div className="space-y-2">
                      <Label>Team Name</Label>
                      <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={conflictSeverity} onValueChange={setConflictSeverity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={conflictDescription} onChange={(e) => setConflictDescription(e.target.value)} placeholder="Describe the immediate need..." />
                  </div>

                  <Button onClick={handleRaiseConflict} className="w-full">
                    Raise Conflict
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Conflict Results Panel */}
          {conflictResults.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Conflict Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conflictResults.map((result) => (
                    <div key={result.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm">
                        {result.type}: {result.resource}
                      </span>
                      <span className="text-xs text-muted-foreground">{result.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seats Grid Layout */}
          <Card>
            <CardHeader>
              <CardTitle>Level {currentLevel} Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Workstations */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    Workstations
                  </h3>
                  <div className="grid grid-cols-6 gap-2 max-w-md">
                    {workstations.map((seat) => (
                      <SeatTooltip key={seat.id} seat={seat}>
                        <Button variant="outline" className={`h-12 ${getSeatStatusColor(seat.status)} text-white border-0 text-xs font-bold hover:scale-105 transition-transform`}>
                          {seat.id}
                        </Button>
                      </SeatTooltip>
                    ))}
                  </div>
                </div>

                {/* Hot Seats */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    Hot Seats
                  </h3>
                  <div className="grid grid-cols-4 gap-2 max-w-md">
                    {hotSeats.map((seat) => (
                      <SeatTooltip key={seat.id} seat={seat}>
                        <Button variant="outline" className={`h-12 ${getSeatStatusColor(seat.status)} text-white border-0 text-xs font-bold hover:scale-105 transition-transform`}>
                          {seat.id}
                        </Button>
                      </SeatTooltip>
                    ))}
                  </div>
                </div>

                {/* Discussion Rooms */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    Discussion Rooms
                  </h3>
                  <div className="grid grid-cols-3 gap-2 max-w-md">
                    {discussionRooms.map((room) => (
                      <SeatTooltip key={room.id} seat={room}>
                        <Button variant="outline" className={`h-16 ${getSeatStatusColor(room.status)} text-white border-0 text-xs font-bold hover:scale-105 transition-transform flex flex-col`}>
                          <span>{room.id}</span>
                          <span className="text-[10px]">Cap: {room.capacity}</span>
                        </Button>
                      </SeatTooltip>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Button variant="outline" className={`h-20 w-full flex-col gap-2 ${action.color} text-white border-0`}>
                  <action.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{action.title}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Level Occupancy */}
          <Card>
            <CardHeader>
              <CardTitle>Level Occupancy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { level: "Level 1", occupancy: 60, color: "bg-yellow-500" },
                { level: "Level 2", occupancy: 35, color: "bg-purple-500" },
                { level: "Level 3", occupancy: 70, color: "bg-green-500" },
              ].map((level) => (
                <div key={level.level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{level.level}:</span>
                    <span className="text-sm text-muted-foreground">{level.occupancy}%</span>
                  </div>
                  <Progress value={level.occupancy} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* My Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-3 bg-gray-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">{booking.type}</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {booking.start_time} - {booking.end_time}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            {booking.team}
                          </div>
                          <div>Agenda: {booking.agenda}</div>
                          <div>Purpose: {booking.purpose}</div>
                          <div>
                            Status: <Badge>{booking.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming bookings</p>
                )}
              </CardContent>
            </Card>

            {/* Workspace Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Workspace Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Optimal Booking Times</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Quietest Hours: 8-10 AM, 4-6 PM</p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Team Proximity</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Your team is mostly on Level 1 today</p>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-4 h-2 bg-blue-500 rounded"></div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">5 teammates nearby</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedLayout>
  );
}
