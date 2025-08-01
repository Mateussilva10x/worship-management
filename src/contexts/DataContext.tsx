/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import type {
  User,
  WorshipGroup,
  Song,
  Schedule,
  ParticipationStatus,
} from "../types";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

interface DataContextType {
  users: User[];
  groups: WorshipGroup[];
  songs: Song[];
  schedules: Schedule[];
  loading: boolean;
  createUser: (userData: {
    name: string;
    email: string;
    password?: string;
  }) => Promise<any>;
  updateUserPassword: (password: string) => Promise<any>;
  createSong: (songData: {
    title: string;
    key: string;
    link: string;
  }) => Promise<Song>;
  createGroup: (groupData: { name: string }) => Promise<WorshipGroup>;
  updateGroupDetails: (
    groupId: string,
    details: { memberIds: string[]; leaderId: string }
  ) => Promise<WorshipGroup>;
  createSchedule: (scheduleData: {
    date: string;
    worshipGroupId: string;
    songs: string[];
  }) => Promise<Schedule>;
  updateMemberStatus: (
    scheduleId: string,
    memberId: string,
    newStatus: ParticipationStatus
  ) => Promise<any>;
  updateScheduleSongs: (scheduleId: string, songIds: string[]) => Promise<any>;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<WorshipGroup[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const dataFetched = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !dataFetched.current) {
      dataFetched.current = true;

      const fetchInitialData = async () => {
        try {
          setLoading(true);

          // A query mais poderosa de todas: busca tudo e suas relações diretas!
          const { data: schedulesData, error: schedulesError } =
            await supabase.from("schedules").select(`
              id, date, created_at,
              group:groups (*),
              schedule_songs ( song_id ),
              schedule_participants ( user_id, status )
            `);

          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("*");
          const { data: songsData, error: songsError } = await supabase
            .from("songs")
            .select("*");
          const { data: groupsData, error: groupsError } = await supabase
            .from("groups")
            .select("*, members:group_members(user_id)");

          if (schedulesError) throw schedulesError;
          if (profilesError) throw profilesError;
          if (songsError) throw songsError;
          if (groupsError) throw groupsError;

          const transformedSchedules = (schedulesData || []).map((s) => ({
            id: s.id,
            date: s.date,
            created_at: s.created_at,
            group: s.group,
            songs: s.schedule_songs.map((song: any) => song.song_id),
            membersStatus: s.schedule_participants.map((p: any) => ({
              memberId: p.user_id,
              status: p.status,
            })),
          }));

          const transformedGroups = (groupsData || []).map((g) => ({
            ...g,
            members: g.members.map((m: any) => m.user_id),
          }));

          setUsers(profilesData || []);
          setSongs(songsData || []);
          setSchedules(transformedSchedules as unknown as Schedule[]);
          setGroups(transformedGroups as unknown as WorshipGroup[]);
        } catch (error) {
          console.error("Erro ao carregar dados iniciais:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchInitialData();
    } else if (!isAuthenticated) {
      dataFetched.current = false;
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createUser = async (userData: {
    name: string;
    email: string;
    password?: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password || "senha123",
      options: { data: { name: userData.name } },
    });
    if (error) throw error;
    if (data.user) {
      const newProfile: User = {
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        role: "member",
      };
      setUsers((prev) => [...prev, newProfile]);
    }
    return data;
  };

  const updateUserPassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  };

  const createSong = async (songData: {
    title: string;
    key: string;
    link: string;
  }) => {
    const { data, error } = await supabase
      .from("songs")
      .insert(songData)
      .select()
      .single();
    if (error) throw error;
    setSongs((prev) =>
      [data, ...prev].sort((a, b) => a.title.localeCompare(b.title))
    );
    return data;
  };

  const createGroup = async (groupData: { name: string }) => {
    const { data, error } = await supabase
      .from("groups")
      .insert(groupData)
      .select()
      .single();
    if (error) throw error;
    const newGroupWithMembers: WorshipGroup = { ...data, members: [] };
    setGroups((prev) => [newGroupWithMembers, ...prev]);
    return newGroupWithMembers;
  };

  const updateGroupDetails = async (
    groupId: string,
    details: { memberIds: string[]; leaderId: string }
  ) => {
    const { memberIds, leaderId } = details;
    if (leaderId && !memberIds.includes(leaderId))
      throw new Error("O líder selecionado deve ser um membro do grupo.");

    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .update({ leader_id: leaderId || null })
      .eq("id", groupId)
      .select()
      .single();
    if (groupError) throw groupError;

    await supabase.from("group_members").delete().eq("group_id", groupId);
    if (memberIds.length > 0) {
      const membersToInsert = memberIds.map((userId) => ({
        group_id: groupId,
        user_id: userId,
      }));
      const { error: membersError } = await supabase
        .from("group_members")
        .insert(membersToInsert);
      if (membersError) throw membersError;
    }

    const updatedGroupWithMembers = { ...groupData, members: memberIds };
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? updatedGroupWithMembers : g))
    );
    return updatedGroupWithMembers;
  };

  const createSchedule = async (scheduleData: {
    date: string;
    worshipGroupId: string;
    songs: string[];
  }) => {
    const group = groups.find((g) => g.id === scheduleData.worshipGroupId);
    if (!group) throw new Error("Grupo não encontrado.");

    const { data: newScheduleData, error: scheduleError } = await supabase
      .from("schedules")
      .insert({
        date: scheduleData.date,
        group_id: scheduleData.worshipGroupId,
      })
      .select()
      .single();
    if (scheduleError) throw scheduleError;

    const participantsToInsert = group.members.map((memberId) => ({
      schedule_id: newScheduleData.id,
      user_id: memberId,
      status: "pending" as ParticipationStatus,
    }));
    if (participantsToInsert.length > 0) {
      const { error } = await supabase
        .from("schedule_participants")
        .insert(participantsToInsert);
      if (error) throw error;
    }

    if (scheduleData.songs.length > 0) {
      const songsToInsert = scheduleData.songs.map((songId) => ({
        schedule_id: newScheduleData.id,
        song_id: songId,
      }));
      const { error } = await supabase
        .from("schedule_songs")
        .insert(songsToInsert);
      if (error) throw error;
    }

    const finalScheduleObject: Schedule = {
      ...newScheduleData,
      songs: scheduleData.songs,
      membersStatus: participantsToInsert.map((p) => ({
        memberId: p.user_id,
        status: p.status,
      })),
    };
    setSchedules((prev) => [finalScheduleObject, ...prev]);
    return finalScheduleObject;
  };

  const updateMemberStatus = async (
    scheduleId: string,
    memberId: string,
    newStatus: ParticipationStatus
  ) => {
    const { data, error } = await supabase
      .from("schedule_participants")
      .update({ status: newStatus })
      .match({ schedule_id: scheduleId, user_id: memberId })
      .select()
      .single();
    if (error) throw error;
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              membersStatus: s.membersStatus.map((ms) =>
                ms.memberId === memberId ? { ...ms, status: newStatus } : ms
              ),
            }
          : s
      )
    );
    return data;
  };

  const updateScheduleSongs = async (scheduleId: string, songIds: string[]) => {
    await supabase
      .from("schedule_songs")
      .delete()
      .eq("schedule_id", scheduleId);
    if (songIds.length > 0) {
      const songsToInsert = songIds.map((songId) => ({
        schedule_id: scheduleId,
        song_id: songId,
      }));
      const { data, error } = await supabase
        .from("schedule_songs")
        .insert(songsToInsert)
        .select();
      if (error) throw error;
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, songs: songIds } : s))
      );
      return data;
    }
    setSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, songs: [] } : s))
    );
    return [];
  };

  const value = {
    users,
    groups,
    songs,
    schedules,
    loading,
    createUser,
    updateUserPassword,
    createSong,
    createGroup,
    updateGroupDetails,
    createSchedule,
    updateMemberStatus,
    updateScheduleSongs,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData deve ser usado dentro de um DataProvider");
  }
  return context;
};
