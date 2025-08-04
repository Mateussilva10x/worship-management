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
    whatsapp: string;
  }) => Promise<any>;
  updateUserPassword: (userId: string, password: string) => Promise<any>;
  createSong: (songData: {
    title: string;
    key: string;
    link: string;
  }) => Promise<Song>;
  createGroup: (groupData: { name: string }) => Promise<WorshipGroup>;
  updateGroupDetails: (
    groupId: string,
    details: { memberIds: string[]; leader_id: string }
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
  deleteSong: (songId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
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
    whatsapp: string;
  }) => {
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: {
        name: userData.name,
        email: userData.email,
        whatsapp: userData.whatsapp,
      },
    });
    if (error) throw error;

    if (data.user) {
      const newProfile: User = {
        id: data.user.id,
        name: data.user.user_metadata.name,
        email: data.user.email!,
        whatsapp: data.user.user_metadata.whatsapp,
        role: "member",
        must_change_password: true,
      };
      setUsers((prev) => [...prev, newProfile]);
    }
    return data.user;
  };

  const updateUserPassword = async (userId: string, password: string) => {
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) throw authError;

    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", userId)
      .select()
      .single();

    if (profileError) throw profileError;

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedProfile : u)));

    return updatedProfile;
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
    details: { memberIds: string[]; leader_id: string }
  ) => {
    const { memberIds, leader_id } = details;
    if (leader_id && !memberIds.includes(leader_id)) {
      throw new Error("O líder selecionado deve ser um membro do grupo.");
    }

    const { data: updatedGroupData, error: groupError } = await supabase
      .from("groups")
      .update({ leader_id: leader_id || null })
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

    const finalUpdatedGroup: WorshipGroup = {
      ...updatedGroupData,
      members: memberIds,
    };

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? finalUpdatedGroup : g))
    );

    return finalUpdatedGroup;
  };

  const createSchedule = async (scheduleData: {
    date: string;
    worshipGroupId: string;
    songs: string[];
  }) => {
    const group = groups.find((g) => g.id === scheduleData.worshipGroupId);
    if (!group) throw new Error("Grupo selecionado não foi encontrado.");

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
      group: group,
      songs: scheduleData.songs,
      membersStatus: participantsToInsert.map((p) => ({
        memberId: p.user_id,
        status: p.status,
      })),
    };

    setSchedules((prev) => [finalScheduleObject, ...prev]);
    return finalScheduleObject;
  };

  const deleteSchedule = async (scheduleId: string): Promise<void> => {
    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", scheduleId);
    if (error) throw error;

    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
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

  const deleteSong = async (songId: string): Promise<void> => {
    const { error } = await supabase.from("songs").delete().eq("id", songId);
    if (error) throw error;

    setSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const deleteGroup = async (groupId: string): Promise<void> => {
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) throw error;

    setGroups((prev) => prev.filter((g) => g.id !== groupId));

    setSchedules((prev) => prev.filter((s) => s.group.id !== groupId));
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
    deleteSong,
    deleteGroup,
    deleteSchedule,
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
