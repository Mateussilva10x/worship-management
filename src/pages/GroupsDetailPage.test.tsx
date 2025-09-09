import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
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

vi.mock("../hooks/useGroups", () => ({
  useGroup: vi.fn(),
  useUsers: vi.fn(),
  useUpdateGroupDetails: vi.fn(),
}));

import { useGroup, useUsers, useUpdateGroupDetails } from "../hooks/useGroups";

const mockDirectorUser: User = {
  id: "user-01",
  name: "Diretor Teste",
  email: "admin@email.com",
  role: "worship_director",
};
const mockUsers: User[] = [
  {
    id: "user-02",
    name: "João Silva",
    email: "joao@email.com",
    role: "member",
  },
  {
    id: "user-03",
    name: "Maria Clara",
    email: "maria@email.com",
    role: "member",
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
    render(<GroupDetailPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    expect(
      await screen.findByRole("heading", {
        name: /editGroup: Equipe de Domingo/i,
      })
    ).toBeInTheDocument();

    const memberList = screen.getByRole("list");
    expect(within(memberList).getByText("João Silva")).toBeInTheDocument();
  });

  it("deve chamar a mutação updateGroupDetails com os novos dados ao salvar", async () => {
    const user = userEvent.setup();
    mockUpdateGroupDetails.mockResolvedValue({});

    render(<GroupDetailPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    const membersAutocomplete = screen.getByRole("combobox", {
      name: /addMembers/i,
    });
    await user.click(membersAutocomplete);
    await user.click(await screen.findByText("Maria Clara"));

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockUpdateGroupDetails).toHaveBeenCalled();
    expect(vi.mocked(mockUpdateGroupDetails).mock.calls[0][0]).toEqual({
      groupId: "group-01",
      details: {
        memberIds: ["user-02", "user-03"],
        leader_id: "user-02",
      },
    });
  });

  it("deve chamar o navigate para /groups ao clicar no botão Voltar", async () => {
    const user = userEvent.setup();
    render(<GroupDetailPage />, { authValue: { user: mockDirectorUser } });

    const backButton = await screen.findByRole("button", { name: /cancel/i });
    await user.click(backButton);

    expect(navigateMock).toHaveBeenCalledWith("/groups");
  });
});
