import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import MusicLibraryPage from "./MusicLibraryPage";
import type { UserRole } from "../types";

vi.mock("../hooks/useSongs", () => ({
  useSongs: vi.fn(),
  useCreateSong: vi.fn(),
  useDeleteSong: vi.fn(),
}));

import { useSongs, useCreateSong, useDeleteSong } from "../hooks/useSongs";

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
  { id: "song-03", title: "Vem, Esta É a Hora", key: "D", link: "" },
];
const mockAdminUser = {
  id: "user-01",
  name: "Admin Teste",
  email: "admin@test.com",
  role: "admin" as UserRole,
};

const mockCreateSong = vi.fn();
const mockDeleteSong = vi.fn();

describe("Página da Biblioteca de Músicas (MusicLibraryPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useSongs as vi.Mock).mockReturnValue({
      data: mockSongs,
      isLoading: false,
    });
    (useCreateSong as vi.Mock).mockReturnValue({ mutateAsync: mockCreateSong });
    (useDeleteSong as vi.Mock).mockReturnValue({ mutateAsync: mockDeleteSong });
  });

  it("deve mostrar um indicador de carregamento enquanto os dados são buscados", () => {
    (useSongs as vi.Mock).mockReturnValue({ data: [], isLoading: true });

    render(<MusicLibraryPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("deve renderizar a tabela com a lista de músicas", () => {
    render(<MusicLibraryPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
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
    });

    const searchInput = screen.getByLabelText(/searchSongs/i);
    await user.type(searchInput, "Deus");

    expect(screen.getByText("Quão Grande É o Meu Deus")).toBeInTheDocument();
    expect(screen.queryByText("Senhor, Te Quero")).not.toBeInTheDocument();
    expect(screen.queryByText("Vem, Esta É a Hora")).not.toBeInTheDocument();
  });

  it("deve abrir a modal para criar uma nova música e chamar a mutação createSong", async () => {
    const user = userEvent.setup();
    mockCreateSong.mockResolvedValue({});

    render(<MusicLibraryPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    await user.click(screen.getByRole("button", { name: /newSong/i }));

    const titleInput = await screen.findByLabelText(/songTitle/i);
    await user.type(titleInput, "Nova Canção");
    await user.type(screen.getByLabelText(/songKey/i), "C");
    await user.type(
      screen.getByLabelText(/songLink/i),
      "http://novacancao.com"
    );

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockCreateSong).toHaveBeenCalled();
    expect(vi.mocked(mockCreateSong).mock.calls[0][0]).toEqual({
      title: "Nova Canção",
      key: "C",
      link: "http://novacancao.com",
    });
  });

  it("deve abrir a modal de confirmação e chamar a função deleteSong", async () => {
    const user = userEvent.setup();
    mockDeleteSong.mockResolvedValue({});

    render(<MusicLibraryPage />, {
      authValue: { user: mockAdminUser, isAuthenticated: true },
    });

    const deleteButtons = screen.getAllByRole("button", {
      name: /excluir música/i,
    });
    await user.click(deleteButtons[0]);

    expect(
      await screen.findByText(/confirmDeleteSongMessage/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirmDeleteBtn/i }));

    expect(mockDeleteSong).toHaveBeenCalled();
    expect(vi.mocked(mockDeleteSong).mock.calls[0][0]).toBe("song-01");
  });
});
