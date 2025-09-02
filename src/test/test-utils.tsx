/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthContext } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";

type AuthContextType = React.ComponentProps<
  typeof AuthContext.Provider
>["value"];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  authValue: AuthContextType;
}> = ({ children, authValue }) => {
  const [queryClient] = React.useState(() => createTestQueryClient());

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <AuthContext.Provider value={authValue}>
            {children}
          </AuthContext.Provider>
        </NotificationProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  authValue?: Partial<AuthContextType>;
}

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const defaultAuthValue: AuthContextType = {
    isAuthenticated: false,
    user: null,
    loading: false,
    logout: vi.fn(),
    refreshAuthUser: vi.fn(),
    ...options.authValue,
  };

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders {...props} authValue={defaultAuthValue} />
    ),
    ...options,
  });
};

export * from "@testing-library/react";
export { customRender as render };
