export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  avatarUrl: string;
  workingHours: {
    start: string;
    end: string;
  };
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  lastVisit: Date;
};

export type Appointment = {
  id: string;
  customerName: string;
  serviceId: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
};
