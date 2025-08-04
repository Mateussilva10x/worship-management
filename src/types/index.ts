/**
 * @description Define o papel do usuário no sistema.
 * 'admin': Possui todas as permissões.
 * 'member': Possui permissões limitadas de membro de equipe.
 */
export type UserRole = "admin" | "member";

/**
 * @description Representa um usuário no sistema.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  must_change_password?: boolean;
  whatsapp?: string;
}

/**
 * @description Representa uma música na biblioteca.
 */
export interface Song {
  id: string;
  title: string;
  key: string;
  link: string;
}

/**
 * @description Representa um grupo de louvor.
 */
export interface WorshipGroup {
  id: string;
  name: string;
  members: User["id"][];
  leader_id?: User["id"];
}

/**
 * @description Define o status de participação de um membro na escala.
 */
export type ParticipationStatus = "pending" | "confirmed" | "declined";

/**
 * @description Representa o status de um membro específico em uma escala.
 */
export interface MemberStatus {
  memberId: User["id"];
  status: ParticipationStatus;
}

/**
 * @description Representa uma escala de culto.
 */
export interface Schedule {
  id: string;
  date: string;
  group: WorshipGroup;
  songs: Song["id"][];
  membersStatus: MemberStatus[];
}
