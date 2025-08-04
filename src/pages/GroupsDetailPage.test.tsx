import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import GroupDetailPage from "./GroupsDetailPage";
import type { User, UserRole } from "../types";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ groupId: "group-01" }),
  };
});

const mockAdminUser: User = {
  id: "user-01",
  name: "Admin Teste",
  email: "admin@email.com",
  role: "admin" as UserRole,
};
const mockUsers: User[] = [
  {
    id: "user-02",
    name: "João Silva",
    email: "joao@email.com",
    role: "member" as UserRole,
  },
  {
    id: "user-03",
    name: "Maria Clara",
    email: "maria@email.com",
    role: "member" as UserRole,
  },
];
const mockGroup = {
  id: "group-01",
  name: "Equipe de Domingo",
  members: ["user-02"],
  leader_id: "user-02",
};

describe("Página de Detalhes do Grupo (GroupDetailPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar os detalhes do grupo e os membros corretamente", async () => {
    render(<GroupDetailPage />, {
      dataValue: { groups: [mockGroup], users: mockUsers, loading: false },
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /Editando Grupo: Equipe de Domingo/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /joão silva/i })
      ).toBeInTheDocument();

      const leaderSelect = screen.getByRole("combobox", {
        name: /líder da equipe/i,
      });
      expect(leaderSelect).toHaveTextContent(/joão silva/i);
    });
  });

  it("deve chamar updateGroupDetails com os novos dados ao salvar", async () => {
    const user = userEvent.setup();
    const updateGroupDetailsMock = vi.fn().mockResolvedValue({});

    render(<GroupDetailPage />, {
      dataValue: {
        groups: [mockGroup],
        users: mockUsers,
        loading: false,
        updateGroupDetails: updateGroupDetailsMock,
      },
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    const leaderSelect = await screen.findByRole("combobox", {
      name: /líder da equipe/i,
    });

    await user.click(leaderSelect);

    const noLeaderOption = await screen.findByRole("option", {
      name: /nenhum/i,
    });
    await user.click(noLeaderOption);

    await user.click(
      screen.getByRole("button", { name: /salvar alterações/i })
    );

    expect(updateGroupDetailsMock).toHaveBeenCalledWith("group-01", {
      memberIds: ["user-02"],
      leader_id: "",
    });

    expect(
      await screen.findByText(/grupo atualizado com sucesso/i)
    ).toBeInTheDocument();
  });

  it("deve chamar o navigate para /groups ao clicar no botão Voltar", async () => {
    const user = userEvent.setup();
    render(<GroupDetailPage />, {
      dataValue: { groups: [mockGroup], users: mockUsers },
    });

    const backButton = await screen.findByRole("button", { name: /voltar/i });
    await user.click(backButton);

    expect(navigateMock).toHaveBeenCalledWith("/groups");
  });
});
