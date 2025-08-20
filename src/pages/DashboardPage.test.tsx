import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import DashboardPage from "./DashboardPage";
import type { Schedule, UserRole } from "../types";

vi.mock("../hooks/useSchedule", () => ({
  useSchedules: vi.fn(),
  useUpdateMemberStatus: vi.fn(),
  useUpdateScheduleSongs: vi.fn(),
  useDeleteSchedule: vi.fn(),
  useCreateSchedule: vi.fn(),
}));

vi.mock("../hooks/useGroups", () => ({
  useGroups: vi.fn(),
}));

vi.mock("../hooks/useSongs", () => ({
  useSongs: vi.fn(),
}));

vi.mock("../hooks/useUsers", () => ({
  useUsers: vi.fn(),
}));

import {
  useSchedules,
  useUpdateMemberStatus,
  useUpdateScheduleSongs,
  useDeleteSchedule,
  useCreateSchedule,
} from "../hooks/useSchedule";
import { useGroups } from "../hooks/useGroups";
import { useSongs } from "../hooks/useSongs";
import { useUsers } from "../hooks/useUsers";

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
    leader_id: "user-03",
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

const mockUpdateMemberStatus = vi.fn();
const mockUpdateScheduleSongs = vi.fn();
const mockDeleteSchedule = vi.fn();
const mockCreateSchedule = vi.fn();

describe("Página do Painel (DashboardPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useSchedules as vi.Mock).mockReturnValue({
      data: mockSchedules,
      isLoading: false,
    });
    (useGroups as vi.Mock).mockReturnValue({
      data: mockGroups,
      isLoading: false,
    });
    (useSongs as vi.Mock).mockReturnValue({ data: [], isLoading: false });
    (useUsers as vi.Mock).mockReturnValue({
      data: [mockAdminUser, mockMemberUser, mockLeaderUser],
      isLoading: false,
    });

    (useUpdateMemberStatus as vi.Mock).mockReturnValue({
      mutateAsync: mockUpdateMemberStatus,
      isPending: false,
    });
    (useUpdateScheduleSongs as vi.Mock).mockReturnValue({
      mutateAsync: mockUpdateScheduleSongs,
      isPending: false,
    });
    (useDeleteSchedule as vi.Mock).mockReturnValue({
      mutateAsync: mockDeleteSchedule,
      isPending: false,
    });
    (useCreateSchedule as vi.Mock).mockReturnValue({
      mutateAsync: mockCreateSchedule,
      isPending: false,
    });
  });

  it("deve renderizar o painel do Administrador se o usuário for admin", () => {
    render(<DashboardPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(screen.getByText("upcomingSchedules")).toBeInTheDocument();
    expect(screen.getByTestId("schedule-card-sched-01")).toBeInTheDocument();
  });

  it("[ADMIN] deve abrir e fechar a modal de criação de escala", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    await user.click(screen.getByRole("button", { name: /newSchedule/i }));
    expect(await screen.findByText("createNewSchedule")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText("createNewSchedule")).not.toBeInTheDocument();
    });
  });

  it("[ADMIN] deve abrir a modal de detalhes ao clicar em um card de escala", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    const card = screen.getByTestId("schedule-card-sched-01");
    await user.click(card);

    expect(await screen.findByText("scheduleDetails")).toBeInTheDocument();
  });

  it("[MEMBRO] deve chamar a mutação updateMemberStatus ao clicar em Confirmar", async () => {
    const user = userEvent.setup();
    mockUpdateMemberStatus.mockResolvedValue({});

    render(<DashboardPage />, {
      authValue: { user: mockMemberUser, isAuthenticated: true },
    });

    const confirmButton = await screen.findByRole("button", {
      name: /confirm/i,
    });
    await user.click(confirmButton);

    expect(mockUpdateMemberStatus).toHaveBeenCalled();

    expect(vi.mocked(mockUpdateMemberStatus).mock.calls[0][0]).toEqual({
      scheduleId: "sched-01",
      memberId: "user-02",
      newStatus: "confirmed",
    });
  });

  it("[LÍDER] deve abrir a modal de edição de músicas ao clicar no botão de edição", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, {
      authValue: { user: mockLeaderUser, isAuthenticated: true },
    });

    const editSongsButton = await screen.findByRole("button", {
      name: /songs/i,
    });
    await user.click(editSongsButton);

    expect(await screen.findByText("editScheduleSongs")).toBeInTheDocument();
  });

  it("deve mostrar um indicador de loading geral enquanto os dados são carregados", () => {
    (useSchedules as vi.Mock).mockReturnValue({ data: [], isLoading: true });

    render(<DashboardPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
