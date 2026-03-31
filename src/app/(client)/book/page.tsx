"use client";

import { useBookingStore, Location, Service, Flexologist } from "@/store/useBookingStore";
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ChevronLeft, MapPin, Clock, Star, Activity, CheckCircle2, ChevronRight, User, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  const { 
    mode,
    selectedLocation, setLocation, 
    selectedService, setService,
    selectedDate, setDate,
    selectedTime, setTime,
    selectedFlexologist, setFlexologist,
    homeAddress, homeMapLink, setHomeAddress,
    resetBooking
  } = useBookingStore();

  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [flexologists, setFlexologists] = useState<Flexologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/locations').then(res => res.json()),
      fetch('/api/services').then(res => res.json()),
      fetch('/api/flexologists').then(res => res.json())
    ]).then(([locData, srvData, flexData]) => {
      setLocations(locData);
      setServices(srvData);
      setFlexologists(flexData);
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/");
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && mode === 'outlet' && !selectedLocation) return true;
    if (step === 1 && mode === 'home' && !homeAddress) return true;
    if (step === 2 && !selectedService) return true;
    if (step === 3 && (!selectedDate || !selectedTime)) return true;
    if (step === 4 && !selectedFlexologist) return true;
    return false;
  };

  // Generate mock dates for next 7 days
  const upcomingDates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
  const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {mode === 'outlet' ? (
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Select Outlet</h2>
                <p className="text-flx-text-muted text-sm mb-6">Where would you like to recover today?</p>
                <div className="flex flex-col gap-4">
                  {isLoading && <p className="text-sm text-flx-text-muted animate-pulse">Loading outlets...</p>}
                  {locations.map(loc => (
                    <div 
                      key={loc.id} 
                      onClick={() => setLocation(loc)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        selectedLocation?.id === loc.id 
                        ? 'border-flx-teal bg-flx-teal/5 shadow-[0_0_15px_rgba(12,242,212,0.15)]' 
                        : 'border-flx-border bg-flx-card hover:border-flx-teal/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full border border-flx-border ${selectedLocation?.id === loc.id ? 'bg-black text-white' : 'bg-white text-flx-text'}`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight mb-1 text-flx-text">{loc.name}</h3>
                            <p className="text-xs text-flx-text-muted leading-relaxed line-clamp-2 pr-6">{loc.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Service Address</h2>
                <p className="text-flx-text-muted text-sm mb-6">Where should we send your therapist?</p>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-flx-text mb-2">Full Address</label>
                    <textarea 
                      value={homeAddress || ''}
                      onChange={(e) => setHomeAddress(e.target.value, homeMapLink || undefined)}
                      placeholder="Street name, apartment number, etc."
                      className="w-full p-4 rounded-xl border border-flx-border bg-flx-card text-flx-text focus:outline-none focus:border-black focus:ring-1 focus:ring-black min-h-[100px] resize-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-flx-text mb-2">Google Maps Link <span className="text-flx-text-muted font-normal">(Optional)</span></label>
                    <input 
                      type="url"
                      value={homeMapLink || ''}
                      onChange={(e) => setHomeAddress(homeAddress || '', e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full p-4 rounded-xl border border-flx-border bg-flx-card text-flx-text focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    />
                    <p className="text-xs text-flx-text-muted mt-2">Providing a pin helps your therapist find you faster.</p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Choose Service</h2>
            <p className="text-flx-text-muted text-sm mb-6">Select a targeted recovery technique.</p>
            <div className="flex flex-col gap-4">
              {isLoading && <p className="text-sm text-flx-text-muted animate-pulse">Loading services...</p>}
              {services.map(srv => (
                <div 
                  key={srv.id} 
                  onClick={() => setService(srv)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedService?.id === srv.id 
                    ? 'border-flx-teal bg-flx-teal/5' 
                    : 'border-flx-border bg-flx-card hover:border-flx-teal/50'
                  }`}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                           <Activity className={`w-5 h-5 ${selectedService?.id === srv.id ? 'text-flx-teal' : 'text-flx-text-muted'}`} />
                           <h3 className="font-bold text-lg text-flx-text">{srv.name}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-flx-text-muted mb-4">{srv.description}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="flex items-center gap-1.5 bg-flx-card border border-flx-border px-3 py-1.5 rounded-full"><Clock className="w-3.5 h-3.5 text-flx-teal" /> {srv.duration} min</span>
                      <span className="text-flx-text">IDR {(srv.price / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Book Time</h2>
            <p className="text-flx-text-muted text-sm mb-6">Select when you'd like your session.</p>
            
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3 text-flx-text">Date Selection</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                {upcomingDates.map(date => {
                  const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  return (
                    <div 
                      key={date.toISOString()}
                      onClick={() => setDate(date)}
                      className={`min-w-[70px] flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-flx-teal border-flx-teal text-white' : 'bg-flx-card border-flx-border text-flx-text hover:border-flx-teal/50'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-80">{format(date, 'EEE')}</span>
                      <span className="text-xl font-bold mt-1">{format(date, 'd')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-flx-text">Time Slots</h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map(time => (
                  <div 
                    key={time}
                    onClick={() => setTime(time)}
                    className={`py-3 rounded-xl border text-center font-medium cursor-pointer transition-colors ${
                      selectedTime === time ? 'bg-flx-teal border-flx-teal text-white' : 'bg-flx-card border-flx-border text-flx-text hover:border-flx-teal/50'
                    }`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Select Flexologist</h2>
            <p className="text-flx-text-muted text-sm mb-6">Choose an expert for your session.</p>
            
            <div className="flex flex-col gap-4">
              <div 
                  onClick={() => setFlexologist({ id: "any", name: "Any Available", rating: 4.9, reviews: 0, specialty: [], imageUrl: "" })}
                  className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-colors ${
                    selectedFlexologist?.id === "any" ? 'border-flx-teal bg-flx-teal/5' : 'border-flx-border bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-flx-card border border-dashed border-flx-border flex items-center justify-center text-flx-text-muted">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-flx-text">First Available</h3>
                    <p className="text-xs text-flx-text-muted">Match with the quickest expert</p>
                  </div>
              </div>

              {isLoading && <p className="text-sm text-flx-text-muted animate-pulse">Loading staff...</p>}
              {flexologists.map(flex => (
                <div 
                  key={flex.id}
                  onClick={() => setFlexologist(flex)}
                  className={`p-4 rounded-2xl border flex gap-4 cursor-pointer transition-colors ${
                    selectedFlexologist?.id === flex.id ? 'border-flx-teal bg-flx-teal/5' : 'border-flx-border bg-white hover:border-flx-teal/50'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={flex.imageUrl} alt={flex.name} className="w-16 h-16 rounded-full object-cover border-2 border-transparent ui-selected:border-flx-teal" />
                  <div className="flex flex-col justify-center flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-flx-text">{flex.name}</h3>
                      <div className="flex items-center gap-1 bg-flx-dark border border-flx-border px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 text-black fill-black" />
                        <span className="text-xs font-bold text-black">{flex.rating}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-flx-text-muted">{flex.specialty.join(" • ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex flex-col items-center justify-center py-6 mb-4">
               <div className="w-16 h-16 bg-flx-card border-2 border-flx-border rounded-full flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 rounded-full border border-flx-teal animate-ping opacity-20"></div>
                  <CheckCircle2 className="w-8 h-8 text-flx-teal drop-shadow-[0_0_8px_rgba(12,242,212,0.8)]" />
               </div>
               <h2 className="text-2xl font-bold tracking-tight text-center">Summary</h2>
               <p className="text-flx-text-muted text-sm text-center">Review your session details</p>
            </div>

            <div className="bg-white border border-flx-border rounded-2xl p-6 mb-8 text-sm space-y-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-flx-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Service</p>
                  <p className="font-semibold text-base text-flx-text">{selectedService?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base tracking-tight text-flx-text mb-0.5">IDR {(selectedService?.price! / 1000).toFixed(0)}K</p>
                  <p className="text-[10px] bg-flx-card border border-flx-border px-2 py-0.5 rounded-md inline-block text-flx-text">{selectedService?.duration} min</p>
                </div>
              </div>

              <hr className="border-flx-border/60" />

              <div>
                <p className="text-flx-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">When</p>
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-black" />
                  <p className="font-semibold text-flx-text">
                    {selectedDate && format(selectedDate, "EEE, MMM do")} at {selectedTime}
                  </p>
                </div>
              </div>

              <hr className="border-flx-border/60" />

              <div>
                <p className="text-flx-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Where</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    {mode === 'outlet' ? (
                      <>
                        <p className="font-semibold text-flx-text">{selectedLocation?.name}</p>
                        <p className="text-xs text-flx-text-muted mt-0.5">{selectedLocation?.address}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-flx-text">At-Home Service</p>
                        <p className="text-xs text-flx-text-muted mt-0.5 whitespace-pre-line">{homeAddress}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
            </div>

            <div className="flex justify-between items-center bg-black p-5 rounded-2xl mb-6">
               <span className="font-bold text-white">Total Due</span>
               <span className="text-xl font-mono text-white font-bold">IDR {(selectedService?.price! / 1000).toFixed(0)}K</span>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Dynamic Header */}
      <header className="px-6 py-4 pt-10 flex items-center justify-between sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-flx-border">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-flx-card transition-colors">
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <div className="flex gap-1.5 items-center">
           {[1,2,3,4,5].map(i => (
             <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-black' : i < step ? 'w-2 bg-black/40' : 'w-2 bg-black/10'}`} />
           ))}
        </div>
        <div className="w-10"></div> {/* Spacer to center dots */}
      </header>

      {/* Main Checkout Area */}
      <main className="flex-1 overflow-y-auto px-6 py-4 pb-32 scrollbar-hide">
         <AnimatePresence mode="wait">
            {renderStepContent()}
         </AnimatePresence>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="absolute bottom-0 left-0 w-full p-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
         {step < 5 ? (
           <button 
             onClick={handleNext}
             disabled={isNextDisabled()}
             className="w-full bg-black text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
           >
             Continue <ChevronRight className="w-5 h-5 -mr-1" />
           </button>
         ) : (
           <button 
             onClick={async () => {
                setIsSubmitting(true);
                try {
                  await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      mode: mode === 'home' ? 'HOME' : 'OUTLET',
                      locationId: selectedLocation?.id,
                      serviceId: selectedService?.id,
                      flexologistId: selectedFlexologist?.id,
                      homeAddress,
                      homeMapLink,
                      scheduledDate: selectedDate?.toISOString()
                    })
                  });
                  resetBooking();
                  router.push('/');
                } catch(e) {
                  console.error(e);
                  setIsSubmitting(false);
                }
             }}
             disabled={isSubmitting}
             className="w-full bg-black text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-black/90 disabled:opacity-50 transition-all active:scale-[0.98]"
           >
             {isSubmitting ? 'Processing...' : 'Confirm Booking'}
           </button>
         )}
      </div>
    </div>
  );
}
