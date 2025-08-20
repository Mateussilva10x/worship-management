import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import GroupsPage from "./GroupsPage";
import type { UserRole } from "../types";

vi.mock("../hooks/useGroups", () => ({
  useGroups: vi.fn(),
  useCreateGroup: vi.fn(),
  useDeleteGroup: vi.fn(),
}));

import { useGroups, useCreateGroup, useDeleteGroup } from "../hooks/useGroups";

const mockAdminUser = {
  id: "user-01",
  name: "Admin Teste",
  role: "admin" as UserRole,
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

    (useGroups as vi.Mock).mockReturnValue({
      data: mockGroupsData,
      isLoading: false,
    });
    (useCreateGroup as vi.Mock).mockReturnValue({
      mutateAsync: mockCreateGroup,
    });
    (useDeleteGroup as vi.Mock).mockReturnValue({
      mutateAsync: mockDeleteGroup,
    });
  });

  it("deve mostrar um indicador de carregamento enquanto os dados são buscados", () => {
    (useGroups as vi.Mock).mockReturnValue({ data: [], isLoading: true });
    render(<GroupsPage />, { authValue: { user: mockAdminUser } });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("deve renderizar a lista de grupos corretamente", () => {
    render(<GroupsPage />, { authValue: { user: mockAdminUser } });

    expect(screen.getByText("Equipe de Domingo")).toBeInTheDocument();
    expect(screen.getByText(/1 member\(s\)/i)).toBeInTheDocument();
    expect(screen.getByText("Equipe Jovem")).toBeInTheDocument();
    expect(screen.getByText(/0 member\(s\)/i)).toBeInTheDocument();
  });

  it('deve mostrar uma mensagem de "nenhum grupo encontrado" se a lista estiver vazia', () => {
    (useGroups as vi.Mock).mockReturnValue({ data: [], isLoading: false });
    render(<GroupsPage />, { authValue: { user: mockAdminUser } });
    expect(screen.getByText("noGroupsFound")).toBeInTheDocument();
  });

  it("deve abrir a modal, preencher o formulário e chamar a mutação createGroup ao salvar", async () => {
    const user = userEvent.setup();
    mockCreateGroup.mockResolvedValue({});

    (useGroups as vi.Mock).mockReturnValue({ data: [], isLoading: false });

    render(<GroupsPage />, { authValue: { user: mockAdminUser } });

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
