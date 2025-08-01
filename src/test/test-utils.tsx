/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { AuthContext } from "../contexts/AuthContext";
import { DataContext } from "../contexts/DataContext";

type AuthContextType = React.ComponentProps<
  typeof AuthContext.Provider
>["value"];
type DataContextType = React.ComponentProps<
  typeof DataContext.Provider
>["value"];

const AllTheProviders: React.FC<{
  children: React.ReactNode;
  authValue: AuthContextType;
  dataValue: DataContextType;
}> = ({ children, authValue, dataValue }) => {
  return (
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <DataContext.Provider value={dataValue}>
          {children}
        </DataContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  authValue?: Partial<AuthContextType>;
  dataValue?: Partial<DataContextType>;
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

  const defaultDataValue: DataContextType = {
    loading: false,
    users: [],
    groups: [],
    songs: [],
    schedules: [],
    createUser: vi.fn(),
    updateUserPassword: vi.fn(),
    createSong: vi.fn(),
    createGroup: vi.fn(),
    updateGroupDetails: vi.fn(),
    createSchedule: vi.fn(),
    updateMemberStatus: vi.fn(),
    updateScheduleSongs: vi.fn(),
    ...options.dataValue,
  };

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders
        {...props}
        authValue={defaultAuthValue}
        dataValue={defaultDataValue}
      />
    ),
    ...options,
  });
};

export * from "@testing-library/react";
export { customRender as render };
