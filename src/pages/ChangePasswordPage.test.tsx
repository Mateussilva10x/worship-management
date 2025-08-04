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

const mockUserNeedingPasswordChange: User = {
  id: "user-new",
  name: "Novo Usuário",
  email: "novo@email.com",
  role: "member" as UserRole,
  must_change_password: true,
};

describe("Página de Alteração de Senha (ChangePasswordPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o título, os campos de senha e o botão de salvar", () => {
    render(<ChangePasswordPage />, {
      authValue: { user: mockUserNeedingPasswordChange },
    });

    expect(
      screen.getByRole("heading", { name: /primeiro acesso/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nova Senha *")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Confirme a Nova Senha *")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /salvar nova senha/i })
    ).toBeInTheDocument();
  });

  it("deve mostrar um erro de validação se as senhas não coincidirem", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordPage />, {
      authValue: { user: mockUserNeedingPasswordChange },
    });

    await user.type(screen.getByLabelText("Nova Senha *"), "senha123");
    await user.type(
      screen.getByLabelText("Confirme a Nova Senha *"),
      "senhadiferente"
    );
    await user.click(
      screen.getByRole("button", { name: /salvar nova senha/i })
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/as senhas não coincidem/i);
  });

  it("deve chamar as funções de atualização e navegar para o dashboard em caso de sucesso", async () => {
    const user = userEvent.setup();
    const updateUserPasswordMock = vi
      .fn()
      .mockResolvedValue(mockUserNeedingPasswordChange);
    const refreshAuthUserMock = vi.fn();

    render(<ChangePasswordPage />, {
      authValue: {
        user: mockUserNeedingPasswordChange,
        refreshAuthUser: refreshAuthUserMock,
      },
      dataValue: {
        updateUserPassword: updateUserPasswordMock,
      },
    });

    const newPassword = "novasenha123";

    await user.type(screen.getByLabelText("Nova Senha *"), newPassword);
    await user.type(
      screen.getByLabelText("Confirme a Nova Senha *"),
      newPassword
    );
    await user.click(
      screen.getByRole("button", { name: /salvar nova senha/i })
    );

    await waitFor(() => {
      expect(updateUserPasswordMock).toHaveBeenCalledWith(newPassword);
    });
    expect(refreshAuthUserMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });
});
