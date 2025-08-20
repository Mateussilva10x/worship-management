import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import ChangePasswordPage from "./ChangePasswordPage";
import type { User, UserRole } from "../types";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../hooks/useUsers", () => ({
  useUpdateUserPassword: vi.fn(),
}));

import { useUpdateUserPassword } from "../hooks/useUsers";

const mockUserNeedingPasswordChange: User = {
  id: "user-new",
  name: "Novo Usuário",
  email: "novo@email.com",
  role: "member" as UserRole,
  must_change_password: true,
};

const mockUpdateUserPassword = vi.fn();

describe("Página de Alteração de Senha (ChangePasswordPage)", () => {
  let refreshAuthUserMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    refreshAuthUserMock = vi.fn();

    (useUpdateUserPassword as vi.Mock).mockReturnValue({
      mutateAsync: mockUpdateUserPassword,
      isPending: false,
    });
  });

  it("deve chamar a mutação de atualização e navegar para o dashboard em caso de sucesso", async () => {
    const user = userEvent.setup();

    mockUpdateUserPassword.mockImplementation(async (_variables, options) => {
      const updatedUser = {
        ...mockUserNeedingPasswordChange,
        must_change_password: false,
      };

      await options?.onSuccess?.(updatedUser);
      return updatedUser;
    });

    render(<ChangePasswordPage />, {
      authValue: {
        user: mockUserNeedingPasswordChange,
        refreshAuthUser: refreshAuthUserMock,
      },
    });

    const newPassword = "novasenha123";
    await user.type(screen.getByLabelText(/newPassword/i), newPassword);
    await user.type(screen.getByLabelText(/confirmPassword/i), newPassword);
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateUserPassword).toHaveBeenCalled();
      expect(vi.mocked(mockUpdateUserPassword).mock.calls[0][0]).toEqual({
        userId: "user-new",
        password: newPassword,
      });

      expect(refreshAuthUserMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
