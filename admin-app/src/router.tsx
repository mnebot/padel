import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import {
  AdminLoginPage,
  AdminDashboardPage,
  CourtsPage,
  TimeSlotsPage,
  UsersPage,
  BookingsPage,
  LotteryPage,
  StatsPage,
  NotFoundPage,
} from './pages';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'courts',
        element: <CourtsPage />,
      },
      {
        path: 'timeslots',
        element: <TimeSlotsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'bookings',
        element: <BookingsPage />,
      },
      {
        path: 'lottery',
        element: <LotteryPage />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
], {
  basename: '/admin',
});
