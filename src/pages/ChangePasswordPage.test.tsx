import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import ChangePasswordPage from "./ChangePasswordPage";
import { supabase } from "../supabaseClient";
import type { User, UserRole } from "../types";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

const mockUserNeedingPasswordChange: User = {
  id: "user-new",
  name: "Novo Usuário",
  email: "novo@email.com",
  role: "member" as UserRole,
  must_change_password: true,
};

describe("Página de Alteração de Senha (ChangePasswordPage)", () => {
  let refreshAuthUserMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    refreshAuthUserMock = vi.fn();
  });

  it("deve chamar a função de atualização, o refresh e navegar em caso de sucesso", async () => {
    const user = userEvent.setup();
    const newPassword = "novasenha123";
    const updatedProfile = {
      ...mockUserNeedingPasswordChange,
      must_change_password: false,
    };

    vi.mocked(supabase.auth.updateUser).mockResolvedValue({
      data: { user: updatedProfile as any },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
    } as any);

    render(<ChangePasswordPage />, {
      authValue: {
        user: mockUserNeedingPasswordChange,
        isAuthenticated: true,
        refreshAuthUser: refreshAuthUserMock,
      },
    });

    await user.type(screen.getByLabelText(/newPassword/i), newPassword);
    await user.type(screen.getByLabelText(/confirmPassword/i), newPassword);
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(supabase.from("profiles").update).toHaveBeenCalledWith({
        must_change_password: false,
      });
    });

    await waitFor(() => {
      expect(refreshAuthUserMock).toHaveBeenCalledWith(updatedProfile);
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });
});
