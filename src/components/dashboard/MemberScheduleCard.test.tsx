import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MemberScheduleCard from "./MemberScheduleCard";
import type { Schedule } from "../../types";

const baseSchedule: Schedule = {
  id: "sched-01",
  date: "2025-08-10T10:00:00.000Z",
  group: { id: "group-01", name: "Equipe de Domingo", members: ["user-02"] },
  songs: ["song-01"],
  membersStatus: [{ memberId: "user-02", status: "pending" }],
};

describe("Componente MemberScheduleCard", () => {
  it('deve renderizar corretamente no estado "Pendente"', () => {
    render(
      <MemberScheduleCard
        schedule={baseSchedule}
        groupName="Equipe de Domingo"
        myStatus="pending"
        onStatusUpdate={() => {}}
        isUpdating={false}
        isLeader={false}
        onEditSongs={() => {}}
      />
    );

    expect(screen.getByText(/domingo, 10 de agosto/i)).toBeInTheDocument();
    expect(screen.getByText("Equipe: Equipe de Domingo")).toBeInTheDocument();
    expect(screen.getByText("Pendente")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /recusar/i })).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: /músicas/i })
    ).not.toBeInTheDocument();
  });

  it('deve desabilitar o botão "Confirmar" se o status for "confirmed"', () => {
    render(
      <MemberScheduleCard
        schedule={baseSchedule}
        groupName="Equipe de Domingo"
        myStatus="confirmed"
        onStatusUpdate={() => {}}
        isUpdating={false}
        isLeader={false}
        onEditSongs={() => {}}
      />
    );

    expect(screen.getByText("Confirmado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /recusar/i })).toBeEnabled();
  });

  it('deve chamar a função onStatusUpdate com "confirmed" ao clicar em Confirmar', async () => {
    const user = userEvent.setup();
    const onStatusUpdateMock = vi.fn();

    render(
      <MemberScheduleCard
        schedule={baseSchedule}
        groupName="Equipe de Domingo"
        myStatus="pending"
        onStatusUpdate={onStatusUpdateMock}
        isUpdating={false}
        isLeader={false}
        onEditSongs={() => {}}
      />
    );

    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    expect(onStatusUpdateMock).toHaveBeenCalledTimes(1);
    expect(onStatusUpdateMock).toHaveBeenCalledWith("confirmed");
  });

  it('deve chamar a função onStatusUpdate com "declined" ao clicar em Recusar', async () => {
    const user = userEvent.setup();
    const onStatusUpdateMock = vi.fn();

    render(
      <MemberScheduleCard
        schedule={baseSchedule}
        groupName="Equipe de Domingo"
        myStatus="pending"
        onStatusUpdate={onStatusUpdateMock}
        isUpdating={false}
        isLeader={false}
        onEditSongs={() => {}}
      />
    );

    await user.click(screen.getByRole("button", { name: /recusar/i }));

    expect(onStatusUpdateMock).toHaveBeenCalledWith("declined");
  });

  it("deve mostrar o botão de editar músicas se o usuário for líder", async () => {
    const user = userEvent.setup();
    const onEditSongsMock = vi.fn();

    render(
      <MemberScheduleCard
        schedule={baseSchedule}
        groupName="Equipe de Domingo"
        myStatus="pending"
        onStatusUpdate={() => {}}
        isUpdating={false}
        isLeader={true}
        onEditSongs={onEditSongsMock}
      />
    );

    const editButton = screen.getByRole("button", { name: /músicas/i });
    expect(editButton).toBeInTheDocument();

    await user.click(editButton);

    expect(onEditSongsMock).toHaveBeenCalledTimes(1);
  });

  it("deve desabilitar todos os botões de ação se isUpdating for true", () => {
    render(
      <MemberScheduleCard
        schedule={baseSchedule}
        groupName="Equipe de Domingo"
        myStatus="pending"
        onStatusUpdate={() => {}}
        isUpdating={true}
        isLeader={true}
        onEditSongs={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /recusar/i })).toBeDisabled();

    expect(screen.getByRole("button", { name: /músicas/i })).toBeDisabled();
  });
});
