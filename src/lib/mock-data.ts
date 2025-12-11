// 1. FIX: Import from the correct location
import { Service, Staff } from "@/types"; 
import { addMinutes, subDays, addDays, setHours, setMinutes } from 'date-fns';

// Mock Services
export const mockServices: Service[] = [
  { id: '1', name: 'Precision Haircut', description: 'A tailored haircut to suit your style.', price: 50, duration: 45, category: 'Hair', active: true },
  { id: '2', name: 'Balayage Highlighting', description: 'Natural-looking, sun-kissed highlights.', price: 150, duration: 120, category: 'Hair', active: true },
  { id: '3', name: 'Manicure & Pedicure', description: 'Full nail care for hands and feet.', price: 75, duration: 60, category: 'Nails', active: true },
  { id: '4', name: 'Deep Tissue Massage', description: 'Relieve muscle tension and stress.', price: 100, duration: 60, category: 'Massage', active: true },
  { id: '5', name: 'Signature Facial', description: 'A rejuvenating facial for glowing skin.', price: 85, duration: 50, category: 'Skin', active: true },
];

// Mock Staff
export const mockStaff: Staff[] = [
  { id: '1', name: 'Jessica', email: 'jessica@glamops.com', role: 'owner', avatarUrl: '', phone: '123-456-7890', active: true },
  { id: '2', name: 'Sarah', email: 'sarah@glamops.com', role: 'staff', avatarUrl: '', phone: '123-456-7890', active: true },
  { id: '3', name: 'Mike', email: 'mike@glamops.com', role: 'staff', avatarUrl: '', phone: '123-456-7890', active: true },
];

// 2. FIX: Generate Appointments with the structure the DASHBOARD expects
// (clientName, serviceName, price, date)
export const generateMockAppointments = () => {
  const today = new Date();
  
  return [
    {
      id: "1",
      clientName: "Guest Client 24",
      clientEmail: "guest24@example.com",
      serviceName: "Gel Manicure w/ Jessica",
      staffName: "Jessica",
      price: 50,
      status: "confirmed",
      // Today at 2:00 PM
      date: setMinutes(setHours(today, 14), 0),
      duration: 45
    },
    {
      id: "2",
      clientName: "Guest Client 16",
      clientEmail: "guest16@example.com",
      serviceName: "Silk Press w/ Sarah",
      staffName: "Sarah",
      price: 150,
      status: "confirmed",
      // Today at 11:30 AM
      date: setMinutes(setHours(today, 11), 30),
      duration: 120
    },
    {
      id: "3",
      clientName: "Guest Client 09",
      clientEmail: "guest09@example.com",
      serviceName: "Haircut",
      staffName: "Mike",
      price: 50,
      status: "completed",
      // Yesterday
      date: subDays(setHours(today, 10), 1),
      duration: 45
    },
    {
      id: "4",
      clientName: "Alice Wonderland",
      clientEmail: "alice@example.com",
      serviceName: "Signature Facial",
      staffName: "Jessica",
      price: 85,
      status: "confirmed",
      // Tomorrow
      date: addDays(setHours(today, 9), 1),
      duration: 50
    },
    {
      id: "5",
      clientName: "Bob Builder",
      clientEmail: "bob@example.com",
      serviceName: "Deep Tissue Massage",
      staffName: "Mike",
      price: 100,
      status: "cancelled",
      // Today at 4:00 PM
      date: setMinutes(setHours(today, 16), 0),
      duration: 60
    }
  ];
};

export const mockAppointments = generateMockAppointments();