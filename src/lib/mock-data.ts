import { Service, Staff, Customer, Appointment } from '@/lib/types';
import { addMinutes, set, subDays } from 'date-fns';
import { memoize } from 'lodash';

// Mock Services
export const mockServices: Service[] = [
  { id: '1', name: 'Precision Haircut', description: 'A tailored haircut to suit your style.', price: 50, duration: 45 },
  { id: '2', name: 'Balayage Highlighting', description: 'Natural-looking, sun-kissed highlights.', price: 150, duration: 120 },
  { id: '3', name: 'Manicure & Pedicure', description: 'Full nail care for hands and feet.', price: 75, duration: 60 },
  { id: '4', name: 'Deep Tissue Massage', description: 'Relieve muscle tension and stress.', price: 100, duration: 60 },
  { id: '5', name: 'Signature Facial', description: 'A rejuvenating facial for glowing skin.', price: 85, duration: 50 },
  { id: '6', name: 'Classic Lash Extensions', description: 'Enhance your eyes with beautiful lashes.', price: 120, duration: 90 },
];

// Mock Staff
export const mockStaff: Staff[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@glamflow.com', role: 'owner', avatarUrl: 'https://picsum.photos/seed/staff1/100/100', workingHours: { start: '09:00', end: '17:00' } },
  { id: '2', name: 'Maria Garcia', email: 'maria@glamflow.com', role: 'staff', avatarUrl: 'https://picsum.photos/seed/staff2/100/100', workingHours: { start: '09:00', end: '17:00' } },
  { id: '3', name: 'James Smith', email: 'james@glamflow.com', role: 'staff', avatarUrl: 'https://picsum.photos/seed/staff3/100/100', workingHours: { start: '10:00', end: '18:00' } },
  { id: '4', name: 'Chloe Williams', email: 'chloe@glamflow.com', role: 'staff', avatarUrl: 'https://picsum.photos/seed/staff4/100/100', workingHours: { start: '11:00', end: '19:00' } },
];

// Mock Customers
export const mockCustomers: Customer[] = [
  { id: '1', name: 'Emily White', email: 'emily@example.com', phone: '555-0101', totalAppointments: 5, lastVisit: subDays(new Date(), 10) },
  { id: '2', name: 'Daniel Green', email: 'daniel@example.com', phone: '555-0102', totalAppointments: 2, lastVisit: subDays(new Date(), 30) },
  { id: '3', name: 'Sophia Black', email: 'sophia@example.com', phone: '555-0103', totalAppointments: 8, lastVisit: subDays(new Date(), 5) },
  { id: '4', name: 'Liam Brown', email: 'liam@example.com', phone: '555-0104', totalAppointments: 1, lastVisit: subDays(new Date(), 90) },
  { id: '5', name: 'Olivia Gray', email: 'olivia@example.com', phone: '555-0105', totalAppointments: 12, lastVisit: subDays(new Date(), 2) },
];

const generateMockAppointments = memoize((): Appointment[] => {
  // Use a fixed date to ensure server and client renders are the same.
  const today = new Date('2024-07-29T12:00:00.000Z');
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  return Array.from({ length: 25 }, (_, i) => {
    const customer = mockCustomers[i % mockCustomers.length];
    const service = mockServices[i % mockServices.length];
    const staff = mockStaff[i % mockStaff.length];
    const dayOffset = (i % 5) - 2; // Appointments from 2 days ago to 2 days in the future
    const hour = 9 + (i % 8); // Appointments between 9 AM and 4 PM
    const minute = (i % 4) * 15;
    const startTime = set(addDays(today, dayOffset), { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });

    return {
      id: `${i + 1}`,
      customerName: customer.name,
      serviceId: service.id,
      staffId: staff.id,
      startTime,
      endTime: addMinutes(startTime, service.duration),
      status: i % 4 === 0 ? 'Cancelled' : (startTime < today ? 'Completed' : 'Confirmed'),
    };
  });
});


export const mockAppointments = generateMockAppointments();
