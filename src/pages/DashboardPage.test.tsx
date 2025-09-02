import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../test/test-utils";
import DashboardPage from "./DashboardPage";
import type { UserRole, Schedule } from "../types";

vi.mock("../hooks/useSchedule", () => ({
  useSchedules: vi.fn(),
  useCreateSchedule: vi.fn(),
  useDeleteSchedule: vi.fn(),
  useUpdateScheduleSongs: vi.fn(),
  useUpdateMemberStatus: vi.fn(),
}));
vi.mock("../hooks/useGroups", () => ({
  useAllGroups: vi.fn(),
}));
vi.mock("../hooks/useSongs", () => ({
  useApprovedSongs: vi.fn(),
}));
vi.mock("../hooks/useUsers", () => ({
  useUsers: vi.fn(),
}));

import { useSchedules } from "../hooks/useSchedule";
import { useAllGroups } from "../hooks/useGroups";
import { useApprovedSongs } from "../hooks/useSongs";
import { useUsers } from "../hooks/useUsers";

const mockDirectorUser = {
  id: "user-01",
  name: "Diretor Teste",
  email: "email@email.com",
  role: "worship_director" as UserRole,
};
const mockMemberUser = {
  id: "user-02",
  name: "Membro Teste",
  email: "novoEmail@email.com",
  role: "member" as UserRole,
};
const mockSchedules: Schedule[] = [
  {
    id: "sched-01",
    date: "2025-12-25T10:00:00.000Z",
    group: {
      id: "group-01",
      name: "Grupo Teste",
      members: ["user-02"],
      leader_id: "user-02",
    },
    songs: [],
    membersStatus: [{ memberId: "user-02", status: "pending" }],
  },
];

describe("Página do Painel (DashboardPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSchedules as vi.Mock).mockReturnValue({
      data: mockSchedules,
      isLoading: false,
    });
    (useAllGroups as vi.Mock).mockReturnValue({ data: [], isLoading: false });
    (useApprovedSongs as vi.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useUsers as vi.Mock).mockReturnValue({
      data: [mockDirectorUser, mockMemberUser],
      isLoading: false,
    });
  });

  it("deve renderizar o painel de gerenciamento para o Worship Director", () => {
    render(<DashboardPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    expect(screen.getByText("upcomingSchedules")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /newSchedule/i })
    ).toBeInTheDocument();
  });

  it("deve renderizar o painel do membro/líder corretamente", () => {
    render(<DashboardPage />, {
      authValue: { user: mockMemberUser, isAuthenticated: true },
    });

    expect(screen.getByText("mySchedules")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /newSchedule/i })
    ).not.toBeInTheDocument();
  });

  it("deve mostrar um indicador de loading enquanto os dados são carregados", () => {
    (useSchedules as vi.Mock).mockReturnValue({ data: [], isLoading: true });

    render(<DashboardPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
