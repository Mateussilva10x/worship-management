import { describe, it, expect, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { supabase } from "../supabaseClient";
import LoginPage from "./Login";

describe("Página de Login", () => {
  it("deve renderizar os campos de formulário e o botão de login", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/endereço de e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("deve chamar a função de login do Supabase com os dados corretos ao submeter", async () => {
    render(<LoginPage />);
    const user = userEvent.setup();
    (supabase.auth.signInWithPassword as Mock).mockResolvedValueOnce({
      data: {},
      error: null,
    });

    await user.type(
      screen.getByLabelText(/endereço de e-mail/i),
      "teste@email.com"
    );
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "teste@email.com",
      password: "senha123",
    });
  });

  it("deve exibir uma mensagem de erro se o Supabase retornar um erro", async () => {
    render(<LoginPage />);
    const user = userEvent.setup();
    const errorMessage = "Invalid login credentials";

    (supabase.auth.signInWithPassword as Mock).mockResolvedValueOnce({
      data: {},
      error: { message: errorMessage },
    });

    // Act
    await user.type(
      screen.getByLabelText(/endereço de e-mail/i),
      "teste@email.com"
    );
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    // Assert
    const alert = await screen.findByRole("alert");

    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(errorMessage);
  });

  it("deve mostrar um spinner no botão durante a submissão", async () => {
    render(<LoginPage />);
    const user = userEvent.setup();
    const loginButton = screen.getByRole("button", { name: /entrar/i });

    (supabase.auth.signInWithPassword as Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 100)
        )
    );

    await user.type(
      screen.getByLabelText(/endereço de e-mail/i),
      "teste@email.com"
    );
    await user.type(screen.getByLabelText(/senha/i), "senha123");
    await user.click(loginButton);

    expect(await screen.findByRole("progressbar")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });
});
