import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import GroupsPage from "./GroupsPage";
import type { UserRole } from "../types";
import "@testing-library/jest-dom";

vi.mock("../hooks/useGroups", () => ({
  useAllGroups: vi.fn(),
  useMyGroups: vi.fn(),
  useCreateGroup: vi.fn(),
  useDeleteGroup: vi.fn(),
}));

import {
  useAllGroups,
  useMyGroups,
  useCreateGroup,
  useDeleteGroup,
} from "../hooks/useGroups";

const mockDirectorUser = {
  id: "user-01",
  email: "email@email.com",
  name: "Diretor Teste",
  role: "worship_director" as UserRole,
};
const mockGroupsData = [
  {
    id: "group-01",
    name: "Equipe de Domingo",
    members: ["user-02"],
    leader_id: "user-02",
  },
  { id: "group-02", name: "Equipe Jovem", members: [], leader_id: "" },
];

const mockCreateGroup = vi.fn();
const mockDeleteGroup = vi.fn();

describe("Página de Gestão de Grupos (GroupsPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useAllGroups as vi.Mock).mockReturnValue({
      data: mockGroupsData,
      isLoading: false,
    });
    (useMyGroups as vi.Mock).mockReturnValue({ data: [], isLoading: false });
    (useCreateGroup as vi.Mock).mockReturnValue({
      mutateAsync: mockCreateGroup,
    });
    (useDeleteGroup as vi.Mock).mockReturnValue({
      mutateAsync: mockDeleteGroup,
    });
  });

  it("deve renderizar a lista de grupos corretamente", () => {
    (useAllGroups as vi.Mock).mockReturnValue({
      data: mockGroupsData,
      isLoading: false,
    });
    render(<GroupsPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    const domingoListItem = screen.getByText("Equipe de Domingo").closest("li");
    expect(domingoListItem).toBeInTheDocument();

    expect(
      within(domingoListItem!).getByText(/member_count/i)
    ).toBeInTheDocument();

    const jovemListItem = screen.getByText("Equipe Jovem").closest("li");
    expect(jovemListItem).toBeInTheDocument();

    expect(
      within(jovemListItem!).getByText(/member_count/i)
    ).toBeInTheDocument();
  });

  it('deve mostrar o botão "Novo Grupo" apenas para o Diretor de Louvor', () => {
    render(<GroupsPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });
    expect(
      screen.getByRole("button", { name: /newGroup/i })
    ).toBeInTheDocument();
  });

  it('NÃO deve mostrar o botão "Novo Grupo" para um líder', () => {
    const mockLeaderUser = {
      id: "user-02",
      name: "Líder Teste",
      email: "emaillider@email.com",
      role: "leader" as UserRole,
    };
    render(<GroupsPage />, {
      authValue: { user: mockLeaderUser, isAuthenticated: true },
    });
    expect(
      screen.queryByRole("button", { name: /newGroup/i })
    ).not.toBeInTheDocument();
  });

  it("deve abrir a modal, preencher o formulário e chamar a mutação createGroup ao salvar", async () => {
    const user = userEvent.setup();
    mockCreateGroup.mockResolvedValue({});

    render(<GroupsPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    await user.click(screen.getByRole("button", { name: /newGroup/i }));

    const inputNome = await screen.findByLabelText(/groupName/i);
    await user.type(inputNome, "Nova Equipe de Teste");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockCreateGroup).toHaveBeenCalled();
    expect(vi.mocked(mockCreateGroup).mock.calls[0][0]).toEqual({
      name: "Nova Equipe de Teste",
    });
  });
});
