import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewUserForm from "./NewUserForm";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        createNewUser: "Create New User",
        userName: "User Name",
        email: "Email",
        cancel: "Cancel",
        save: "Save",
        saving: "Saving...",
      };
      return translations[key] || key;
    },
  }),
}));

describe("Componente NewUserForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("deve renderizar os campos de formulário e os botões corretamente", () => {
    render(<NewUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(
      screen.getByRole("heading", { name: "Create New User" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/user name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("deve habilitar o botão de salvar apenas quando todos os campos estiverem preenchidos", async () => {
    const user = userEvent.setup();
    render(<NewUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByLabelText(/user name/i), "John Doe");
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByLabelText(/email/i), "john.doe@example.com");
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByLabelText(/whatsapp/i), "5583999998888");

    expect(saveButton).toBeEnabled();
  });

  it("deve chamar onCancel ao clicar no botão de cancelar", async () => {
    const user = userEvent.setup();
    render(<NewUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("deve chamar onSubmit com os dados corretos quando o formulário for submetido", async () => {
    const user = userEvent.setup();

    mockOnSubmit.mockResolvedValue(undefined);

    render(<NewUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const userData = {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      whatsapp: "5583988887777",
    };

    await user.type(screen.getByLabelText(/user name/i), userData.name);
    await user.type(screen.getByLabelText(/email/i), userData.email);
    await user.type(screen.getByLabelText(/whatsapp/i), userData.whatsapp);

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(userData);
  });

  it('deve desabilitar os botões e mostrar "Saving..." durante a submissão', async () => {
    const user = userEvent.setup();

    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<NewUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    await user.type(screen.getByLabelText(/user name/i), "Submitting User");
    await user.type(screen.getByLabelText(/email/i), "submit@test.com");
    await user.type(screen.getByLabelText(/whatsapp/i), "123456789");

    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /saving\.\.\./i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
    });

    expect(cancelButton).toBeEnabled();
  });
});
