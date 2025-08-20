import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import GroupsDetailPage from "./GroupsDetailPage";
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

vi.mock("../hooks/useGroups", () => ({
  useGroup: vi.fn(),
  useUsers: vi.fn(),
  useUpdateGroupDetails: vi.fn(),
}));

import { useGroup, useUsers, useUpdateGroupDetails } from "../hooks/useGroups";

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

const mockUpdateGroupDetails = vi.fn();

describe("Página de Detalhes do Grupo (GroupDetailPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useGroup as vi.Mock).mockReturnValue({
      data: mockGroup,
      isLoading: false,
    });
    (useUsers as vi.Mock).mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });
    (useUpdateGroupDetails as vi.Mock).mockReturnValue({
      mutateAsync: mockUpdateGroupDetails,
      isPending: false,
    });
  });

  it("deve renderizar os detalhes do grupo e os membros corretamente", async () => {
    render(<GroupsDetailPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(
      await screen.findByRole("heading", {
        name: /editGroup: Equipe de Domingo/i,
      })
    ).toBeInTheDocument();

    const memberChip = screen.getByRole("button", { name: /João Silva/i });
    expect(memberChip).toBeInTheDocument();

    const leaderSelect = screen.getByRole("combobox", { name: /teamLeader/i });
    expect(leaderSelect).toHaveTextContent("João Silva");
  });

  it("deve chamar a mutação updateGroupDetails com os novos dados ao salvar", async () => {
    const user = userEvent.setup();
    mockUpdateGroupDetails.mockResolvedValue({});

    render(<GroupsDetailPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    const membersAutocomplete = screen.getByRole("combobox", {
      name: /selectMembers/i,
    });
    await user.click(membersAutocomplete);
    await user.click(await screen.findByText("Maria Clara"));

    const leaderSelect = screen.getByRole("combobox", { name: /teamLeader/i });
    await user.click(leaderSelect);
    await user.click(
      await screen.findByRole("option", { name: "Maria Clara" })
    );

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockUpdateGroupDetails).toHaveBeenCalled();
    expect(vi.mocked(mockUpdateGroupDetails).mock.calls[0][0]).toEqual({
      groupId: "group-01",
      details: {
        memberIds: ["user-02", "user-03"],
        leader_id: "user-03",
      },
    });
  });

  it("deve navegar para /groups ao clicar no botão Voltar", async () => {
    const user = userEvent.setup();
    render(<GroupsDetailPage />, { authValue: { user: mockAdminUser } });

    const backButton = await screen.findByRole("button", { name: /cancel/i });
    await user.click(backButton);

    expect(navigateMock).toHaveBeenCalledWith("/groups");
  });
});
