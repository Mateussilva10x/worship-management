import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../test/test-utils";
import NewScheduleForm from "./NewScheduleForm";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockGroups = [
  { id: "group-01", name: "Equipe de Domingo", members: ["user-01"] },
  { id: "group-02", name: "Equipe Jovem", members: ["user-02"] },
];
const mockSongs = [
  { id: "song-01", title: "Quão Grande É o Meu Deus", key: "G", link: "" },
  { id: "song-02", title: "Senhor, Te Quero", key: "A", link: "" },
];

describe("Formulário de Nova Escala (NewScheduleForm)", () => {
  it("deve renderizar todos os campos e o botão de salvar desabilitado", () => {
    render(
      <NewScheduleForm
        groups={mockGroups}
        songs={mockSongs}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("createNewSchedule")).toBeInTheDocument();
    expect(screen.getByLabelText("worshipTeam")).toBeInTheDocument();
    expect(screen.getByLabelText("songs")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "saveSchedule" })).toBeDisabled();
  });

  it("deve habilitar o botão de salvar após selecionar um grupo", async () => {
    const user = userEvent.setup();
    render(
      <NewScheduleForm
        groups={mockGroups}
        songs={mockSongs}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByLabelText("worshipTeam"));

    await user.click(await screen.findByText("Equipe de Domingo"));

    expect(screen.getByRole("button", { name: "saveSchedule" })).toBeEnabled();
  });

  it("deve chamar onSubmit com os dados corretos ao submeter o formulário", async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();
    render(
      <NewScheduleForm
        groups={mockGroups}
        songs={mockSongs}
        onSubmit={onSubmitMock}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByLabelText("worshipTeam"));
    await user.click(await screen.findByText("Equipe de Domingo"));

    await user.click(screen.getByLabelText("songs"));
    await user.click(await screen.findByText("Quão Grande É o Meu Deus"));
    await user.click(await screen.findByText("Senhor, Te Quero"));

    await user.click(
      screen.getByRole("button", { name: "saveSchedule", hidden: true })
    );

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        worshipGroupId: "group-01",
        songs: ["song-01", "song-02"],
      })
    );
  });

  it("deve chamar onCancel ao clicar no botão de cancelar", async () => {
    const user = userEvent.setup();
    const onCancelMock = vi.fn();
    render(
      <NewScheduleForm
        groups={mockGroups}
        songs={mockSongs}
        onSubmit={vi.fn()}
        onCancel={onCancelMock}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});
