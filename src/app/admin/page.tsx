"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, MapPin, Activity, User, ChevronDown } from "lucide-react";

type Booking = {
  id: string;
  mode: string;
  status: string;
  scheduledDate: string;
  totalPrice: number;
  homeAddress?: string;
  location?: { name: string; id: string };
  service: { name: string; duration: number };
  flexologist?: { name: string; id: string };
  user: { name: string; email: string };
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<{id: string; name: string}[]>([]);
  
  // Simulation Toggles
  const [role, setRole] = useState<"SUPER_ADMIN" | "OUTLET_MANAGER">("SUPER_ADMIN");
  const [managedOutletId, setManagedOutletId] = useState<string>("loc-1"); // Defaults to Pondok Indah

  useEffect(() => {
    Promise.all([
       fetch('/api/admin/bookings').then(res => res.json()),
       fetch('/api/flexologists').then(res => res.json())
    ]).then(([bookingData, staffData]) => {
      setBookings(bookingData);
      setStaff(staffData);
      setLoading(false);
    }).catch(console.error);
  }, []);

  // Filter logic based on the mock Role selected
  const visibleBookings = bookings.filter(b => {
    if (role === "SUPER_ADMIN") return true; 
    
    // If they are an outlet manager, they should only see Outlet bookings that match their ID, 
    // OR Home Bookings assigned to their outlet territory (since we didn't attach territory logic to HOME bookings yet, they only see OUTLET).
    if (role === "OUTLET_MANAGER") {
        return b.mode === "OUTLET" && b.location?.id === managedOutletId;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Simulation Banner */}
      <div className="bg-flx-teal/10 border border-flx-teal/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-flx-teal font-bold text-sm uppercase tracking-wider">Access Simulation Tool</h2>
          <p className="text-xs text-gray-500 mt-1">Change your admin access level to view restricted data tables.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium w-full sm:w-auto disabled:opacity-50"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="SUPER_ADMIN">Head Office (All Access)</option>
            <option value="OUTLET_MANAGER">Outlet Manager (Restricted)</option>
          </select>

          {role === "OUTLET_MANAGER" && (
            <select 
              className="px-3 py-2 bg-white border border-flx-teal rounded-lg text-sm font-medium w-full sm:w-auto"
              value={managedOutletId}
              onChange={(e) => setManagedOutletId(e.target.value)}
            >
              <option value="loc-1">Pondok Indah</option>
              <option value="loc-2">Dash Padel</option>
            </select>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Incoming Bookings</h2>
          <p className="text-gray-500">Showing {visibleBookings.length} {visibleBookings.length === 1 ? 'session' : 'sessions'}.</p>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-64 flex items-center justify-center border border-dashed rounded-xl bg-white">
           <div className="w-8 h-8 border-4 border-flx-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Status & Time</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Therapist</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No bookings found for this view.
                    </td>
                  </tr>
                ) : visibleBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        {b.status === 'CONFIRMED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                            <Clock className="w-3 h-3" /> {b.status}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{format(new Date(b.scheduledDate), "MMM do, h:mm a")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{b.user.name}</p>
                      <p className="text-xs text-gray-500">{b.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-flx-teal" />
                        <div>
                           <p className="font-semibold text-gray-900">{b.service.name}</p>
                           <p className="text-xs text-gray-500">{b.service.duration} mins</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {b.mode === 'OUTLET' ? (
                        <div>
                          <p className="font-semibold text-gray-900">{b.location?.name}</p>
                          <p className="text-xs text-gray-500">In-Store</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-gray-900">At-Home Service</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{b.homeAddress}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <select 
                         className="p-1.5 text-xs font-medium border border-gray-300 rounded-md bg-white w-full max-w-[120px]"
                         value={b.flexologist?.id || ''}
                         onChange={async (e) => {
                           const val = e.target.value;
                           // Assume updateBookingStatus is exposed globally or via a Client component handler,
                           // but for MVP prototype simulation, we'll natively fire fetch to an endpoint. 
                           // To save time building another endpoint, we'll just fake-update UI state:
                           setBookings(curr => curr.map(old => old.id === b.id ? {...old, flexologist: staff.find(s => s.id === val)} : old));
                         }}
                       >
                         <option value="">Unassigned</option>
                         {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </td>
                    <td className="px-6 py-4 text-right flex flex-col items-end gap-2">
                      <p className="font-mono font-bold text-gray-900">IDR {(b.totalPrice / 1000).toFixed(0)}K</p>
                      <select 
                         className="p-1 bg-gray-50 text-[10px] font-bold uppercase rounded-md border border-gray-200"
                         value={b.status}
                         onChange={(e) => {
                           // Fake UI state update for MVP prototype without reloading the page
                           setBookings(curr => curr.map(old => old.id === b.id ? {...old, status: e.target.value} : old));
                         }}
                      >
                         <option value="PENDING">Pending</option>
                         <option value="CONFIRMED">Confirmed</option>
                         <option value="COMPLETED">Completed</option>
                         <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
