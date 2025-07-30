/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from "react";
import type {
  User,
  WorshipGroup,
  Song,
  Schedule,
  ParticipationStatus,
} from "../types";
import { supabase } from "../supabaseClient";

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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<WorshipGroup[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [
          { data: profilesData, error: profilesError },
          { data: groupsData, error: groupsError },
          { data: songsData, error: songsError },
          { data: schedulesData, error: schedulesError },

          { data: groupMembersData, error: groupMembersError },
        ] = await Promise.all([
          supabase.from("profiles").select("*"),
          supabase.from("groups").select("*"),
          supabase.from("songs").select("*"),
          supabase.from("schedules").select("*"),
          supabase.from("group_members").select("group_id, user_id"),
        ]);

        if (profilesError) throw profilesError;
        if (groupsError) throw groupsError;
        if (songsError) throw songsError;
        if (schedulesError) throw schedulesError;
        if (groupMembersError) throw groupMembersError;

        const groupsWithMembers = (groupsData || []).map((group) => ({
          ...group,
          members: (groupMembersData || [])
            .filter((member) => member.group_id === group.id)
            .map((member) => member.user_id),
        }));

        setUsers(profilesData || []);
        setGroups(groupsWithMembers);
        setSongs(songsData || []);
        setSchedules(schedulesData || []);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

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
    setSongs((prev) => [data, ...prev]);
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

    if (leaderId && !memberIds.includes(leaderId)) {
      throw new Error("O líder selecionado deve ser um membro do grupo.");
    }

    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .update({ leader_id: leaderId || null })
      .eq("id", groupId)
      .select()
      .single();
    if (groupError) throw groupError;

    await supabase.from("group_members").delete().eq("group_id", groupId);
    const membersToInsert = memberIds.map((userId) => ({
      group_id: groupId,
      user_id: userId,
    }));
    if (membersToInsert.length > 0) {
      const { error: membersError } = await supabase
        .from("group_members")
        .insert(membersToInsert);
      if (membersError) throw membersError;
    }

    setGroups((prev) => prev.map((g) => (g.id === groupId ? groupData : g)));
    return groupData;
  };

  const createSchedule = async (scheduleData: {
    date: string;
    worshipGroupId: string;
    songs: string[];
  }) => {
    const { data, error } = await supabase
      .from("schedules")
      .insert({
        date: scheduleData.date,
        group_id: scheduleData.worshipGroupId,
      })
      .select()
      .single();
    if (error) throw error;
    setSchedules((prev) => [data, ...prev]);

    return data;
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

    return data;
  };

  const updateScheduleSongs = async (scheduleId: string, songIds: string[]) => {
    await supabase
      .from("schedule_songs")
      .delete()
      .eq("schedule_id", scheduleId);
    const songsToInsert = songIds.map((songId) => ({
      schedule_id: scheduleId,
      song_id: songId,
    }));
    if (songsToInsert.length > 0) {
      const { data, error } = await supabase
        .from("schedule_songs")
        .insert(songsToInsert);
      if (error) throw error;
      return data;
    }
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
