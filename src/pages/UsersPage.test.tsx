import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import UsersPage from "./UsersPage";
import { NotificationProvider } from "../contexts/NotificationContext";
import type { User, UserRole } from "../types";

const mockAdminUser: User = {
  id: "user-01",
  name: "Admin Teste",
  email: "admin@test.com",
  role: "admin" as UserRole,
};
const mockUsers: User[] = [
  {
    id: "user-01",
    name: "Admin Principal",
    email: "admin@email.com",
    role: "admin" as UserRole,
  },
  {
    id: "user-02",
    name: "Membro Comum",
    email: "membro@email.com",
    role: "member" as UserRole,
  },
];

describe("Página de Gestão de Usuários (UsersPage)", () => {
  it("deve mostrar um indicador de carregamento enquanto os dados são buscados", () => {
    render(
      <NotificationProvider>
        <UsersPage />
      </NotificationProvider>,
      {
        authValue: { user: mockAdminUser, isAuthenticated: true },
        dataValue: { loading: true },
      }
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("deve renderizar a tabela com a lista de usuários", () => {
    render(
      <NotificationProvider>
        <UsersPage />
      </NotificationProvider>,
      {
        authValue: { user: mockAdminUser, isAuthenticated: true },
        dataValue: { users: mockUsers, loading: false },
      }
    );
    expect(screen.getByText("Admin Principal")).toBeInTheDocument();
    expect(screen.getByText("admin@email.com")).toBeInTheDocument();
    expect(screen.getByText("Membro Comum")).toBeInTheDocument();
    expect(screen.getByText("membro@email.com")).toBeInTheDocument();
  });

  it('deve mostrar uma mensagem de "nenhum usuário encontrado" se a lista estiver vazia', () => {
    render(
      <NotificationProvider>
        <UsersPage />
      </NotificationProvider>,
      {
        authValue: { user: mockAdminUser, isAuthenticated: true },
        dataValue: { users: [], loading: false },
      }
    );
    expect(screen.getByText(/Nenhum usuário encontrado/i)).toBeInTheDocument();
  });

  it("deve abrir a modal de criação e chamar a função createUser ao submeter", async () => {
    const user = userEvent.setup();
    const createUserMock = vi.fn().mockResolvedValue({});

    render(
      <NotificationProvider>
        <UsersPage />
      </NotificationProvider>,
      {
        authValue: { user: mockAdminUser, isAuthenticated: true },
        dataValue: { users: [], loading: false, createUser: createUserMock },
      }
    );

    await user.click(screen.getByRole("button", { name: /novo membro/i }));

    const nameInput = await screen.findByLabelText(/nome completo/i);
    await user.type(nameInput, "Novo Membro");
    await user.type(screen.getByLabelText(/e-mail/i), "novo@email.com");
    await user.type(screen.getByLabelText(/whatsapp/i), "11999999999");

    await user.click(screen.getByRole("button", { name: /criar membro/i }));

    expect(createUserMock).toHaveBeenCalledTimes(1);
    expect(createUserMock).toHaveBeenCalledWith({
      name: "Novo Membro",
      email: "novo@email.com",
      whatsapp: "11999999999",
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Cadastrar Novo Membro")
      ).not.toBeInTheDocument();
    });
  });
});
