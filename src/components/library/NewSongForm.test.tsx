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

    expect(screen.getByLabelText(/songTitle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/songKey/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/songLink/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("deve chamar onSubmit com os dados corretos ao submeter", async () => {
    const user = userEvent.setup();
    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const songData = {
      title: "Grande é o Senhor",
      key: "A",
      link: "https://cifraclub.com.br/grande-e-o-senhor",
    };

    await user.type(screen.getByLabelText(/songTitle/i), songData.title);
    await user.type(screen.getByLabelText(/songKey/i), songData.key);
    await user.type(screen.getByLabelText(/songLink/i), songData.link);

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(songData);
  });

  it("deve chamar onCancel ao clicar no botão de cancel", async () => {
    const user = userEvent.setup();
    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("deve desabilitar os botões e mostrar 'Salvando...' durante a submissão", async () => {
    const user = userEvent.setup();
    (mockOnSubmit as Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    await user.type(screen.getByLabelText(/songTitle/i), "Título Teste");
    await user.type(screen.getByLabelText(/songKey/i), "C");
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(saveButton).toHaveTextContent(/saving/i);

    await waitFor(() => expect(saveButton).toBeEnabled());

    expect(cancelButton).toBeEnabled();
    expect(saveButton).toHaveTextContent(/save/i);
  });

  it("não deve chamar onSubmit e deve mostrar um alerta se os campos obrigatórios não forem preenchidos", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<NewSongForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(alertSpy).toHaveBeenCalledWith(
      "Por favor, preencha pelo menos o título e o tom."
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
