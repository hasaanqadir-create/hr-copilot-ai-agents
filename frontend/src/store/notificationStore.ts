import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warn' | 'agent';
  time: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    { id: '1', title: 'Resume Intake Agent', message: 'Akhilesh Kumar resume parsed successfully', type: 'agent', time: new Date(Date.now() - 120000), read: false },
    { id: '2', title: 'ATS Score Generated', message: 'Score: 74/100 — 3 suggestions available', type: 'success', time: new Date(Date.now() - 90000), read: false },
    { id: '3', title: 'Job Match Complete', message: 'Senior Dev role: 82% match detected', type: 'info', time: new Date(Date.now() - 60000), read: true },
  ],
  addNotification: (n) => set((state) => ({
    notifications: [
      { ...n, id: Date.now().toString(), time: new Date(), read: false },
      ...state.notifications,
    ],
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),
  clearAll: () => set({ notifications: [] }),
}));
