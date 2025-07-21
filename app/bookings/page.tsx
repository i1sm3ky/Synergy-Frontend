"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Trash2 } from "lucide-react";
import { AuthService } from "@/lib/auth";

type Booking = {
  id: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  team?: string;
  agenda?: string;
  purpose?: string;
  status: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await AuthService.fetchWithAuth("/employee/my_bookings");

        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();

        const mapped = data.map((b: any) => {
          // Parse ISO-formatted timestamp string
          let date = "Unknown";
          try {
            date = new Date(b.timestamp).toISOString().split("T")[0];
          } catch (err) {
            console.warn("Invalid timestamp:", b.timestamp);
          }

          return {
            id: b.booking_id,
            type: b.workspace_ID || "Workspace",
            date: date,
            startTime: b.start_time || "N/A",
            endTime: b.end_time || "N/A",
            team: b.team,
            agenda: b.agenda,
            purpose: b.purpose,
            status: "confirmed", // Update if you have actual status
          };
        });

        setBookings(mapped);
      } catch (err) {
        console.error("Failed to load bookings", err);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await AuthService.fetchWithAuth("/employee/delete_my_booking", {
        method: "POST",
        body: JSON.stringify({ booking_id: bookingId }),
      });

      if (!res.ok) throw new Error("Failed to delete booking");

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      alert("Booking cancelled successfully!");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">Manage your workspace reservations</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {bookings.length} Active Bookings
          </Badge>
        </div>

        {bookings.length > 0 ? (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{booking.type}</h3>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(booking.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>

                        {booking.team && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{booking.team}</span>
                          </div>
                        )}

                        {booking.agenda && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Agenda:</span>
                            <span>{booking.agenda}</span>
                          </div>
                        )}

                        {booking.purpose && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Purpose:</span>
                            <span>{booking.purpose}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancelBooking(booking.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">You haven't made any workspace reservations yet.</p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <a href="/hot-seat">Book Hot Seat</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/scheduling">Schedule Room</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  );
}
