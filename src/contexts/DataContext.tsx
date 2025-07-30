/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from "react";
import type {
  User,
  WorshipGroup,
  Song,
  Schedule,
  ParticipationStatus,
} from "../types";

import { mockUsers } from "../data/users";
import { mockGroups } from "../data/groups";
import { mockSongs } from "../data/songs";
import { mockSchedules } from "../data/schedules";

/**
 * @description Define a "forma" do nosso contexto. Lista todos os dados e
 * funções que os componentes poderão acessar.
 */
interface DataContextType {
  users: User[];
  groups: WorshipGroup[];
  songs: Song[];
  schedules: Schedule[];
  createUser: (userData: { name: string; email: string }) => Promise<User>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<User>;
  createSong: (songData: {
    title: string;
    key: string;
    link: string;
  }) => Promise<Song>;
  createGroup: (groupData: { name: string }) => Promise<WorshipGroup>;
  createSchedule: (scheduleData: {
    date: string;
    worshipGroupId: string;
    songs: string[];
  }) => Promise<Schedule>;
  updateMemberStatus: (
    scheduleId: string,
    memberId: string,
    newStatus: ParticipationStatus
  ) => Promise<Schedule>;
  updateGroupDetails: (
    groupId: string,
    details: { memberIds: string[]; leaderId: string }
  ) => Promise<WorshipGroup>;

  updateScheduleSongs: (
    scheduleId: string,
    songIds: string[]
  ) => Promise<Schedule>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const networkDelay = 500;

/**
 * @description O DataProvider é o componente que vai "segurar" todo o estado
 * da nossa aplicação e fornecer as funções para modificá-lo.
 */
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [groups, setGroups] = useState<WorshipGroup[]>(mockGroups);
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);

  const createUser = (userData: {
    name: string;
    email: string;
  }): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (users.some((u) => u.email === userData.email)) {
          return reject(new Error("Este e-mail já está em uso."));
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          role: "member",
          mustChangePassword: true,
          ...userData,
        };
        setUsers((prev) => [...prev, newUser]);
        resolve(newUser);
      }, networkDelay);
    });
  };

  const updateUserPassword = (
    userId: string,
    _newPassword: string
  ): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedUser: User | undefined;
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === userId) {
              updatedUser = { ...u, mustChangePassword: false };
              return updatedUser;
            }
            return u;
          })
        );
        if (updatedUser) resolve(updatedUser);
        else reject(new Error("Usuário não encontrado."));
      }, networkDelay);
    });
  };

  const createSong = (songData: {
    title: string;
    key: string;
    link: string;
  }): Promise<Song> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSong: Song = { id: `song-${Date.now()}`, ...songData };
        setSongs((prev) => [newSong, ...prev]);
        resolve(newSong);
      }, networkDelay);
    });
  };

  const createGroup = (groupData: { name: string }): Promise<WorshipGroup> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newGroup: WorshipGroup = {
          id: `group-${Date.now()}`,
          members: [],
          ...groupData,
        };
        setGroups((prev) => [newGroup, ...prev]);
        resolve(newGroup);
      }, networkDelay);
    });
  };

  const updateGroupDetails = (
    groupId: string,
    details: { memberIds: string[]; leaderId: string }
  ): Promise<WorshipGroup> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { memberIds, leaderId } = details;

        if (leaderId && !memberIds.includes(leaderId)) {
          return reject(
            new Error("O líder selecionado deve ser um membro do grupo.")
          );
        }

        let updatedGroup: WorshipGroup | undefined;

        setGroups((prevGroups) => {
          const newGroups = prevGroups.map((g) => {
            if (g.id === groupId) {
              updatedGroup = {
                ...g,
                members: memberIds,
                leaderId: leaderId || undefined,
              };
              return updatedGroup;
            }
            return g;
          });
          return newGroups;
        });

        if (updatedGroup) {
          resolve(updatedGroup);
        } else {
          reject(new Error("Grupo não encontrado para atualização."));
        }
      }, networkDelay);
    });
  };

  const updateScheduleSongs = (
    scheduleId: string,
    songIds: string[]
  ): Promise<Schedule> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedSchedule: Schedule | undefined;
        setSchedules((prev) =>
          prev.map((s) => {
            if (s.id === scheduleId) {
              updatedSchedule = { ...s, songs: songIds };
              return updatedSchedule;
            }
            return s;
          })
        );
        if (updatedSchedule) resolve(updatedSchedule);
        else reject(new Error("Escala não encontrada."));
      }, networkDelay);
    });
  };

  const createSchedule = (scheduleData: {
    date: string;
    worshipGroupId: string;
    songs: string[];
  }): Promise<Schedule> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const group = groups.find((g) => g.id === scheduleData.worshipGroupId);
        if (!group) return reject(new Error("Grupo da escala não encontrado."));

        const newSchedule: Schedule = {
          id: `sched-${Date.now()}`,
          ...scheduleData,
          membersStatus: group.members.map((memberId) => ({
            memberId,
            status: "pending",
          })),
        };
        setSchedules((prev) => [newSchedule, ...prev]);
        resolve(newSchedule);
      }, networkDelay);
    });
  };

  const updateMemberStatus = (
    scheduleId: string,
    memberId: string,
    newStatus: ParticipationStatus
  ): Promise<Schedule> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedSchedule: Schedule | undefined;
        setSchedules((prev) =>
          prev.map((s) => {
            if (s.id === scheduleId) {
              const newMembersStatus = s.membersStatus.map((ms) =>
                ms.memberId === memberId ? { ...ms, status: newStatus } : ms
              );
              updatedSchedule = { ...s, membersStatus: newMembersStatus };
              return updatedSchedule;
            }
            return s;
          })
        );
        if (updatedSchedule) resolve(updatedSchedule);
        else reject(new Error("Escala não encontrada."));
      }, networkDelay);
    });
  };

  const value = {
    users,
    groups,
    songs,
    schedules,
    createUser,
    updateUserPassword,
    createSong,
    createGroup,
    createSchedule,
    updateMemberStatus,
    updateScheduleSongs,
    updateGroupDetails,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

/**
 * @description Hook customizado para facilitar o acesso ao DataContext,
 * evitando a necessidade de importar useContext e DataContext em cada arquivo.
 */
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData deve ser usado dentro de um DataProvider");
  }
  return context;
};
