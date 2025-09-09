import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../test/test-utils";
import MusicLibraryPage from "./MusicLibraryPage";
import type { UserRole, Song } from "../types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../hooks/useSongs", () => ({
  useInfiniteSongs: vi.fn(),
  useCreateSong: vi.fn(),
  useDeleteSong: vi.fn(),
  useUpdateSongStatus: vi.fn(),
  useUpdateSong: vi.fn(),
  useAllThemes: vi.fn(),
}));

import {
  useInfiniteSongs,
  useCreateSong,
  useDeleteSong,
  useUpdateSong,
  useUpdateSongStatus,
  useAllThemes,
} from "../hooks/useSongs";

const mockDirectorUser = {
  id: "user-01",
  name: "Diretor",
  email: "director@email.com",
  role: "worship_director" as UserRole,
};
const mockSongs: Song[] = [
  {
    id: "song-01",
    title: "Quão Grande É o Meu Deus",
    artist: "Soraya Moraes",
    version: "Live",
    key: "G",
    link: "http://example.com/1",
    status: "approved",
    themes: ["Adoração"],
  },
  {
    id: "song-02",
    title: "Senhor, Te Quero",
    artist: "Vineyard",
    version: "",
    key: "A",
    link: "http://example.com/2",
    status: "pending",
    themes: [],
  },
];

const mockCreateSong = vi.fn();
const mockDeleteSong = vi.fn();
const mockUpdateSong = vi.fn();
const mockUpdateStatus = vi.fn();
const fetchNextPageMock = vi.fn();

describe("Página da Biblioteca de Músicas (MusicLibraryPage)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useInfiniteSongs as vi.Mock).mockReturnValue({
      data: {
        pages: [{ songs: mockSongs, count: mockSongs.length }],
        pageParams: [1],
      },
      isLoading: false,
      fetchNextPage: fetchNextPageMock,
      hasNextPage: true,
      isFetchingNextPage: false,
    });
    (useAllThemes as vi.Mock).mockReturnValue({
      data: ["Adoração", "Louvor"],
      isLoading: false,
    });
    (useCreateSong as vi.Mock).mockReturnValue({ mutateAsync: mockCreateSong });
    (useDeleteSong as vi.Mock).mockReturnValue({ mutateAsync: mockDeleteSong });
    (useUpdateSong as vi.Mock).mockReturnValue({ mutateAsync: mockUpdateSong });
    (useUpdateSongStatus as vi.Mock).mockReturnValue({
      mutate: mockUpdateStatus,
    });
  });

  it("deve renderizar a lista de músicas na tabela de desktop", () => {
    render(<MusicLibraryPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    const table = screen.getByRole("table");

    expect(
      within(table).getByText("Quão Grande É o Meu Deus")
    ).toBeInTheDocument();
    expect(within(table).getByText("Senhor, Te Quero")).toBeInTheDocument();
  });

  it("deve filtrar as músicas ao clicar em pesquisar", async () => {
    const user = userEvent.setup();
    render(<MusicLibraryPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    await user.click(screen.getByText(/searchFilters/i));

    const artistInput = await screen.findByLabelText(/artist/i);
    await user.type(artistInput, "Vineyard");

    const searchButton = screen.getByTestId("search-filters-search-button");
    await user.click(searchButton);

    expect(useInfiniteSongs).toHaveBeenCalledWith(
      { artist: "Vineyard" },
      "worship_director"
    );
  });

  it("deve abrir o modal para criar uma nova música e chamar a mutação createSong", async () => {
    const user = userEvent.setup();
    mockCreateSong.mockResolvedValue({});
    render(<MusicLibraryPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    await user.click(screen.getByRole("button", { name: /newSong/i }));

    const modal = await screen.findByTestId("song-form-modal");

    const titleInput = within(modal).getByLabelText(/songTitle/i);
    await user.type(titleInput, "Nova Canção");
    await user.type(within(modal).getByLabelText(/artist/i), "Artista Teste");
    await user.type(within(modal).getByLabelText(/version/i), "Acústico");
    await user.type(within(modal).getByLabelText(/songKey/i), "D");
    await user.type(
      within(modal).getByLabelText(/songLink/i),
      "http://teste.com"
    );

    await user.click(within(modal).getByRole("button", { name: /save/i }));

    expect(mockCreateSong).toHaveBeenCalledTimes(1);
  });

  it("deve abrir o modal para editar uma música e chamar a mutação updateSong", async () => {
    const user = userEvent.setup();
    mockUpdateSong.mockResolvedValue({});
    render(<MusicLibraryPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    const editButtons = screen.getAllByLabelText(/Editar/i);
    await user.click(editButtons[0]);

    const titleInput = await screen.findByLabelText(/songTitle/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Título Editado");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockUpdateSong).toHaveBeenCalledTimes(1);
    expect(vi.mocked(mockUpdateSong).mock.calls[0][0]).toMatchObject({
      id: "song-01",
      title: "Título Editado",
    });
  });

  it("deve abrir o diálogo de confirmação e chamar a mutação deleteSong", async () => {
    const user = userEvent.setup();
    mockDeleteSong.mockResolvedValue({});
    render(<MusicLibraryPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    const deleteButtons = screen.getAllByLabelText(/Excluir/i);
    await user.click(deleteButtons[0]);

    expect(
      await screen.findByText(/confirmDeleteSongMessage/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirmDeleteBtn/i }));

    expect(mockDeleteSong).toHaveBeenCalledTimes(1);
    expect(mockDeleteSong).toHaveBeenCalledWith("song-01");
  });

  it("[WORSHIP_DIRECTOR] deve mostrar e usar os botões de aprovar/rejeitar", async () => {
    const user = userEvent.setup();
    render(<MusicLibraryPage />, {
      authValue: { user: mockDirectorUser, isAuthenticated: true },
    });

    const pendingSongRow = screen.getByText("Senhor, Te Quero").closest("tr");

    const approveButton = within(pendingSongRow!).getByRole("button", {
      name: /approve/i,
    });
    await user.click(approveButton);

    expect(mockUpdateStatus).toHaveBeenCalledWith({
      songId: "song-02",
      status: "approved",
    });

    const rejectButton = within(pendingSongRow!).getByRole("button", {
      name: /reject/i,
    });
    await user.click(rejectButton);

    expect(mockUpdateStatus).toHaveBeenCalledWith({
      songId: "song-02",
      status: "rejected",
    });
  });
});
