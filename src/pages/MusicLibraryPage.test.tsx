import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import MusicLibraryPage from "./MusicLibraryPage";
import type { UserRole } from "../types";

const mockSongs = [
  {
    id: "song-01",
    title: "Quão Grande É o Meu Deus",
    key: "G",
    link: "http://example.com/1",
  },
  {
    id: "song-02",
    title: "Senhor, Te Quero",
    key: "A",
    link: "http://example.com/2",
  },
  {
    id: "song-03",
    title: "Vem, Esta É a Hora",
    key: "D",
    link: "http://example.com/3",
  },
];

const mockAdminUser = {
  id: "user-01",
  name: "Admin Teste",
  email: "admin@test.com",
  role: "admin" as UserRole,
};

describe("Página da Biblioteca de Músicas (MusicLibraryPage)", () => {
  it("deve mostrar um indicador de carregamento enquanto os dados são buscados", () => {
    render(<MusicLibraryPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
      dataValue: { loading: true },
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("deve renderizar a tabela com a lista de músicas", () => {
    render(<MusicLibraryPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
      dataValue: { songs: mockSongs, loading: false },
    });

    expect(screen.getByText("Quão Grande É o Meu Deus")).toBeInTheDocument();
    expect(screen.getByText("Senhor, Te Quero")).toBeInTheDocument();
    expect(screen.getByText("Vem, Esta É a Hora")).toBeInTheDocument();

    expect(screen.getByText("G")).toBeInTheDocument();
  });

  it("deve filtrar a lista de músicas ao digitar na busca", async () => {
    const user = userEvent.setup();
    render(<MusicLibraryPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
      dataValue: { songs: mockSongs, loading: false },
    });

    const searchInput = screen.getByLabelText(/searchSongs/i);

    await user.type(searchInput, "Deus");

    expect(screen.getByText("Quão Grande É o Meu Deus")).toBeInTheDocument();

    expect(screen.queryByText("Senhor, Te Quero")).not.toBeInTheDocument();
    expect(screen.queryByText("Vem, Esta É a Hora")).not.toBeInTheDocument();
  });

  it("deve abrir a modal para criar uma nova música e chamar a função createSong", async () => {
    const user = userEvent.setup();
    const createSongMock = vi.fn().mockResolvedValue({});

    render(<MusicLibraryPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
      dataValue: {
        songs: mockSongs,
        loading: false,
        createSong: createSongMock,
      },
    });

    await user.click(screen.getByRole("button", { name: /newSong/i }));

    const titleInput = await screen.findByLabelText(/songTitle/i);
    const keyInput = screen.getByLabelText(/songKey/i);
    const linkInput = screen.getByLabelText(/songLink/i);

    await user.type(titleInput, "Nova Canção");
    await user.type(keyInput, "C");
    await user.type(linkInput, "http://novacancao.com");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(createSongMock).toHaveBeenCalledTimes(1);
    expect(createSongMock).toHaveBeenCalledWith({
      title: "Nova Canção",
      key: "C",
      link: "http://novacancao.com",
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Adicionar Nova Música")
      ).not.toBeInTheDocument();
    });
  });
});
