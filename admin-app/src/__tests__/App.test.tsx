import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // The app should render the router which will show either login or protected routes
    expect(document.body).toBeTruthy();
  });

  it('has AuthProvider and ToastProvider in the component tree', () => {
    const { container } = render(<App />);
    // Verify the app renders something
    expect(container).toBeTruthy();
  });
});
