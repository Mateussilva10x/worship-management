import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import DashboardPage from "./DashboardPage";
import type { Schedule, UserRole } from "../types";

const mockAdminUser = {
  id: "user-01",
  name: "Admin Teste",
  email: "admin@email",
  role: "admin" as UserRole,
};
const mockMemberUser = {
  id: "user-02",
  name: "Membro Teste",
  email: "member@test.com",
  role: "member" as UserRole,
};
const mockLeaderUser = {
  id: "user-03",
  name: "Líder Teste",
  email: "leader@test.com",
  role: "member" as UserRole,
};

const mockGroups = [
  {
    id: "group-01",
    name: "Grupo de Teste",
    members: ["user-02", "user-03"],
    leaderId: "user-03",
  },
];

const mockSchedules: Schedule[] = [
  {
    id: "sched-01",
    date: "2025-09-01T10:00:00.000Z",
    group: mockGroups[0],
    songs: [],
    membersStatus: [
      { memberId: "user-02", status: "pending" },
      { memberId: "user-03", status: "confirmed" },
    ],
  },
];

describe("Página do Painel (DashboardPage)", () => {
  it("deve renderizar o painel do Administrador se o usuário for admin", () => {
    render(<DashboardPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
      dataValue: {
        schedules: mockSchedules,
        groups: mockGroups,
        users: [mockAdminUser, mockMemberUser],
      },
    });
    expect(screen.getByText("Próximas Escalas")).toBeInTheDocument();
  });

  it("[ADMIN] deve abrir e fechar a modal de criação de escala", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
      dataValue: { schedules: mockSchedules, groups: mockGroups },
    });

    await user.click(screen.getByRole("button", { name: /nova escala/i }));
    expect(await screen.findByText("Criar Nova Escala")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    await waitFor(() => {
      expect(screen.queryByText("Criar Nova Escala")).not.toBeInTheDocument();
    });
  });

  it("[ADMIN] deve abrir a modal de detalhes ao clicar em um card de escala", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
      dataValue: {
        schedules: mockSchedules,
        groups: mockGroups,
        users: [mockMemberUser],
      },
    });

    const card = screen.getByTestId("schedule-card-sched-01");
    await user.click(card);

    expect(await screen.findByText("Detalhes da Escala")).toBeInTheDocument();
  });

  it("[MEMBRO] deve chamar updateMemberStatus ao clicar em Confirmar", async () => {
    const user = userEvent.setup();
    const updateMemberStatusMock = vi.fn();

    render(<DashboardPage />, {
      authValue: { user: mockMemberUser, isAuthenticated: true },
      dataValue: {
        schedules: mockSchedules,
        groups: mockGroups,
        updateMemberStatus: updateMemberStatusMock,
      },
    });

    const confirmButton = await screen.findByRole("button", {
      name: /confirmar/i,
    });
    await user.click(confirmButton);

    expect(updateMemberStatusMock).toHaveBeenCalledWith(
      "sched-01",
      "user-02",
      "confirmed"
    );
  });

  it("[LÍDER] deve abrir a modal de edição de músicas ao clicar no botão de edição", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, {
      authValue: { user: mockLeaderUser, isAuthenticated: true },
      dataValue: {
        schedules: mockSchedules,
        groups: mockGroups,
        users: [mockLeaderUser],
      },
    });

    const editSongsButton = await screen.findByRole("button", {
      name: /músicas/i,
    });
    await user.click(editSongsButton);

    expect(
      await screen.findByText("Editar Músicas da Escala")
    ).toBeInTheDocument();
  });
});
