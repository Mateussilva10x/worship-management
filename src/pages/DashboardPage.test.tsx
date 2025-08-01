/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./DashboardPage";

import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

vi.mock("../contexts/AuthContext");
vi.mock("../contexts/DataContext");

const mockAdminUser = {
  id: "user-01",
  name: "Admin Teste",
  email: "admin@test.com",
  role: "admin",
};
const mockMemberUser = {
  id: "user-02",
  name: "Membro Teste",
  email: "member@test.com",
  role: "member",
};
const mockGroups = [
  {
    id: "group-01",
    name: "Grupo de Teste",
    members: ["user-02"],
    leaderId: "user-02",
  },
];
const mockSchedules = [
  {
    id: "sched-01",
    date: "2025-09-01T10:00:00.000Z",
    group: mockGroups[0],
    songs: [],
    membersStatus: [],
    created_at: "",
  },
  {
    id: "sched-02",
    date: "2025-09-08T10:00:00.000Z",
    group: mockGroups[0],
    songs: [],
    membersStatus: [],
    created_at: "",
  },
];

describe("Página do Painel (DashboardPage)", () => {
  it("deve renderizar o painel do Administrador se o usuário for admin", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: mockAdminUser,
    } as any);

    vi.mocked(useData).mockReturnValue({
      schedules: mockSchedules,
      groups: mockGroups,
      users: [mockAdminUser, mockMemberUser],
      songs: [],
      loading: false,
    } as any);

    render(<DashboardPage />);

    expect(screen.getByText("Próximas Escalas")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /nova escala/i })
    ).toBeInTheDocument();

    const scheduleCards = screen.getAllByText(/equipe: grupo de teste/i);
    expect(scheduleCards).toHaveLength(2);
  });

  it("deve renderizar o painel do Membro se o usuário for membro", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: mockMemberUser,
    } as any);

    vi.mocked(useData).mockReturnValue({
      schedules: mockSchedules,
      groups: mockGroups,
      loading: false,
    } as any);

    render(<DashboardPage />);

    expect(screen.getByText("Minhas Próximas Escalas")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /nova escala/i })
    ).not.toBeInTheDocument();
  });

  it("deve mostrar um indicador de carregamento se os dados estiverem carregando", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: mockAdminUser,
    } as any);

    vi.mocked(useData).mockReturnValue({
      loading: true,
      schedules: [],
      groups: [],
      users: [],
      songs: [],
    } as any);

    render(<DashboardPage />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
