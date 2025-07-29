import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { AuthProvider, useAuth } from "./auth-context";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
};
(useRouter as jest.Mock).mockReturnValue(mockRouter);

global.fetch = jest.fn();

describe("AuthContext", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockRouter.push.mockClear();
    localStorage.clear();
  });

  it("should login a user and store token", async () => {
    const user = { id: "1", name: "Test User", email: "test@example.com" };
    const token = "test-token";
    const expiresIn = 3600;

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user, token, expiresIn }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login("test@example.com", "password");
    });

    expect(fetch).toHaveBeenCalledWith("undefined/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("codefusion_token")).toBe(token);
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });
});
