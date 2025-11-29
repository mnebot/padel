import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import {
  LoginPage,
  DashboardPage,
  BookingsPage,
  NewBookingPage,
  HistoryPage,
  NotFoundPage,
} from './pages';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'bookings',
        element: <BookingsPage />,
      },
      {
        path: 'bookings/new',
        element: <NewBookingPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
], {
  basename: '/usuaris',
});
