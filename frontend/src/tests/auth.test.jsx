import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";

import OtpInput from "../components/Auth/OtpInput";
import SendOtpForm from "../pages/SendOtpPage/SendOtpForm";
import LoginForm from "../pages/LoginPage/LoginForm";
import ProtectedRoute from "../routes/ProtectedRoute";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

vi.mock("../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Phase 3 — Frontend Foundation & Auth UI Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("OtpInput supports numeric input, auto-focus advance, and paste", () => {
    function Wrapper() {
      const [otp, setOtp] = useState(Array(6).fill(""));
      return <OtpInput value={otp} onChange={setOtp} />;
    }

    render(<Wrapper />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(6);
    expect(inputs[0]).toHaveAttribute("inputmode", "numeric");

    fireEvent.change(inputs[0], { target: { value: "1" } });
    expect(inputs[0]).toHaveValue("1");
    expect(document.activeElement).toBe(inputs[1]);

    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => "654321" },
    });
    expect(inputs.map((i) => i.value).join("")).toBe("654321");
  });

  it("SendOtpForm blocks invalid email without submitting and navigates with email state on success", async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={["/send-otp"]}>
        <Routes>
          <Route path="/send-otp" element={<SendOtpForm />} />
          <Route path="/register" element={<div>Register Route</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/send-code", {
        email: "alice@example.com",
      });
      expect(screen.getByText("Register Route")).toBeInTheDocument();
    });
  });

  it("LoginForm renders Sign In and Forgot Password link, and submits credentials", async () => {
    const mockLogin = vi.fn();
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: mockLogin,
    });
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        accessToken: "token-123",
        user: { id: "u1", name: "Alice" },
      },
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<div>Dashboard Route</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /forgot password\?/i })).toHaveAttribute(
      "href",
      "/forgot-password"
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "alice@example.com",
        password: "secret123",
      });
      expect(mockLogin).toHaveBeenCalledWith("token-123", {
        id: "u1",
        name: "Alice",
      });
      expect(screen.getByText("Dashboard Route")).toBeInTheDocument();
    });
  });

  it("ProtectedRoute redirects guests to /login and allows authenticated users", () => {
    useAuth.mockReturnValueOnce({ isAuthenticated: false, loading: false });

    const { unmount } = render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Private Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    unmount();

    useAuth.mockReturnValueOnce({ isAuthenticated: true, loading: false });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Private Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Private Dashboard")).toBeInTheDocument();
  });
});
