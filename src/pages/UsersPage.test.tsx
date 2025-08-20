import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import UsersPage from "./UsersPage";
import { NotificationProvider } from "../contexts/NotificationContext";
import type { User, UserRole } from "../types";

vi.mock("../hooks/useUsers", () => ({
  useUsers: vi.fn(),
  useCreateUser: vi.fn(),
}));

import { useUsers, useCreateUser } from "../hooks/useUsers";

const mockAdminUser: User = {
  id: "user-01",
  name: "Admin Teste",
  email: "admin@test.com",
  role: "admin" as UserRole,
};
const mockUsersList: User[] = [
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

const mockCreateUser = vi.fn();

describe("Página de Gestão de Usuários (UsersPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useUsers as vi.Mock).mockReturnValue({
      data: mockUsersList,
      isLoading: false,
    });
    (useCreateUser as vi.Mock).mockReturnValue({ mutateAsync: mockCreateUser });
  });

  const renderComponent = () =>
    render(
      <NotificationProvider>
        <UsersPage />
      </NotificationProvider>,
      { authValue: { user: mockAdminUser, isAuthenticated: true } }
    );

  it("deve mostrar um indicador de carregamento enquanto os dados são buscados", () => {
    (useUsers as vi.Mock).mockReturnValue({ data: [], isLoading: true });
    renderComponent();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("deve renderizar a tabela com a lista de usuários", () => {
    renderComponent();
    expect(screen.getByText("Admin Principal")).toBeInTheDocument();
    expect(screen.getByText("admin@email.com")).toBeInTheDocument();
    expect(screen.getByText("Membro Comum")).toBeInTheDocument();
    expect(screen.getByText("membro@email.com")).toBeInTheDocument();
  });

  it("deve abrir a modal de criação e chamar a mutação createUser ao submeter", async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue({});

    (useUsers as vi.Mock).mockReturnValue({ data: [], isLoading: false });
    renderComponent();

    await user.click(screen.getByRole("button", { name: /newUser/i }));

    const nameInput = await screen.findByLabelText(/userName/i);
    await user.type(nameInput, "Novo Membro");
    await user.type(screen.getByLabelText(/email/i), "novo@email.com");
    await user.type(screen.getByLabelText(/whatsapp/i), "11999999999");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockCreateUser).toHaveBeenCalled();
    expect(vi.mocked(mockCreateUser).mock.calls[0][0]).toEqual({
      name: "Novo Membro",
      email: "novo@email.com",
      whatsapp: "11999999999",
    });
  });
});
