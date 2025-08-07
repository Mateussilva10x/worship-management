/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GroupsPage from "./GroupsPage";

import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { render } from "../test/test-utils";

vi.mock("../contexts/AuthContext");
vi.mock("../contexts/DataContext");

const mockAdminUser = {
  id: "user-01",
  name: "Admin Teste",
  email: "admin@test.com",
  role: "admin",
};
const mockGroups = [
  {
    id: "group-01",
    name: "Equipe de Domingo",
    members: ["user-02"],
    leader_id: "user-02",
  },
  { id: "group-02", name: "Equipe Jovem", members: [], leader_id: "" },
];

describe("Página de Gestão de Grupos (GroupsPage)", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: mockAdminUser,
    } as any);
  });

  it("deve mostrar um indicador de carregamento enquanto os dados são buscados", () => {
    vi.mocked(useData).mockReturnValue({
      loading: true,
      groups: [],
    } as any);

    render(<GroupsPage />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("deve renderizar a lista de grupos corretamente", () => {
    vi.mocked(useData).mockReturnValue({
      loading: false,
      groups: mockGroups,
    } as any);

    render(<GroupsPage />);

    expect(screen.getByText("Equipe de Domingo")).toBeInTheDocument();
    expect(screen.getByText("1 member(s)")).toBeInTheDocument();
    expect(screen.getByText("Equipe Jovem")).toBeInTheDocument();
    expect(screen.getByText("0 member(s)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /newGroup/i })
    ).toBeInTheDocument();
  });

  it('deve mostrar uma mensagem de "nenhum grupo encontrado" se a lista estiver vazia', () => {
    vi.mocked(useData).mockReturnValue({
      loading: false,
      groups: [],
    } as any);

    render(<GroupsPage />);

    expect(screen.getByText("noGroupsFound")).toBeInTheDocument();
  });

  it("deve abrir a modal, preencher o formulário e chamar createGroup ao salvar", async () => {
    const user = userEvent.setup();
    const createGroupMock = vi.fn();

    vi.mocked(useData).mockReturnValue({
      loading: false,
      groups: [],
      createGroup: createGroupMock,
    } as any);

    createGroupMock.mockResolvedValue({
      id: "group-03",
      name: "Nova Equipe",
      members: [],
    });

    render(<GroupsPage />);

    await user.click(screen.getByRole("button", { name: /newGroup/i }));

    const inputNome = await screen.findByLabelText(/groupName/i);
    expect(inputNome).toBeInTheDocument();
    await user.type(inputNome, "Nova Equipe de Teste");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(createGroupMock).toHaveBeenCalledTimes(1);
    expect(createGroupMock).toHaveBeenCalledWith({
      name: "Nova Equipe de Teste",
    });

    await waitFor(() => {
      expect(screen.queryByText("creteNewGroup")).not.toBeInTheDocument();
    });
  });
});
