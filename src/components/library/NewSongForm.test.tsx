import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NewSongForm from "./NewSongForm";

describe("Componente NewSongForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("deve renderizar os campos do formulário e os botões", () => {
    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/título da música/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tom/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/link para cifra ou vídeo/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /salvar música/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument();
  });

  it("deve chamar onSubmit com os dados corretos ao submeter", async () => {
    const user = userEvent.setup();
    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const songData = {
      title: "Grande é o Senhor",
      key: "A",
      link: "https://cifraclub.com.br/grande-e-o-senhor",
    };

    await user.type(screen.getByLabelText(/título da música/i), songData.title);
    await user.type(screen.getByLabelText(/tom/i), songData.key);
    await user.type(
      screen.getByLabelText(/link para cifra ou vídeo/i),
      songData.link
    );

    await user.click(screen.getByRole("button", { name: /salvar música/i }));

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(songData);
  });

  it("deve chamar onCancel ao clicar no botão de cancelar", async () => {
    const user = userEvent.setup();
    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("deve desabilitar os botões e mostrar 'Salvando...' durante a submissão", async () => {
    const user = userEvent.setup();
    (mockOnSubmit as Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const saveButton = screen.getByRole("button", { name: /salvar música/i });
    const cancelButton = screen.getByRole("button", { name: /cancelar/i });

    await user.type(screen.getByLabelText(/título da música/i), "Título Teste");
    await user.type(screen.getByLabelText(/tom/i), "C");
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(saveButton).toHaveTextContent(/salvando.../i);

    await waitFor(() => expect(saveButton).toBeEnabled());

    expect(cancelButton).toBeEnabled();
    expect(saveButton).toHaveTextContent(/salvar música/i);
  });

  it("não deve chamar onSubmit e deve mostrar um alerta se os campos obrigatórios não forem preenchidos", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await user.click(screen.getByRole("button", { name: /salvar música/i }));
    expect(alertSpy).toHaveBeenCalledWith(
      "Por favor, preencha pelo menos o título e o tom."
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
