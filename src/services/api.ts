import { mockUsers } from "../data/users";
import { mockSongs } from "../data/songs";
import { mockGroups } from "../data/groups";
import { mockSchedules } from "../data/schedules";
import type {
  ParticipationStatus,
  Schedule,
  Song,
  User,
  WorshipGroup,
} from "../types";

const networkDelay = 500;

/**
 * @description Busca todas as escalas. Simula uma chamada de API.
 * @returns {Promise<Schedule[]>} Uma promessa que resolve para a lista de escalas.
 */
export const fetchSchedules = (): Promise<Schedule[]> => {
  console.log("Buscando escalas...");
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Escalas recebidas:", mockSchedules);
      resolve(mockSchedules);
    }, networkDelay);
  });
};

/**
 * @description Busca todas as músicas.
 * @returns {Promise<Song[]>} Uma promessa que resolve para a lista de músicas.
 */
export const fetchSongs = (): Promise<Song[]> => {
  console.log("Buscando músicas...");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSongs);
    }, networkDelay);
  });
};

/**
 * @description Busca todos os grupos.
 * @returns {Promise<WorshipGroup[]>} Uma promessa que resolve para a lista de grupos.
 */
export const fetchGroups = (): Promise<WorshipGroup[]> => {
  console.log("Buscando grupos...");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockGroups);
    }, networkDelay);
  });
};

/**
 * @description Busca todos os usuários (membros).
 * @returns {Promise<User[]>} Uma promessa que resolve para a lista de usuários.
 */
export const fetchUsers = (): Promise<User[]> => {
  console.log("Buscando usuários...");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers);
    }, networkDelay);
  });
};

/**
 * @description Salva uma nova escala. Simula uma chamada de API.
 * @param data Os dados da nova escala (data, grupo, músicas).
 * @returns {Promise<Schedule>} A promessa resolve com o objeto da escala completa.
 */
export const createSchedule = (data: {
  date: string;
  worshipGroupId: string;
  songIds: string[];
}): Promise<Schedule> => {
  console.log("Salvando nova escala...", data);
  return new Promise((resolve) => {
    setTimeout(() => {
      const group = mockGroups.find((g) => g.id === data.worshipGroupId);
      const memberIds = group ? group.members : [];

      const newSchedule: Schedule = {
        id: `sched-${Date.now()}`,
        date: data.date,
        worshipGroupId: data.worshipGroupId,
        songs: data.songIds,
        membersStatus: memberIds.map((memberId) => ({
          memberId,
          status: "pending",
        })),
      };

      mockSchedules.unshift(newSchedule);
      console.log("Escala salva:", newSchedule);
      resolve(newSchedule);
    }, networkDelay);
  });
};

/**
 * @description Atualiza o status de um membro em uma escala específica.
 * @param scheduleId O ID da escala a ser atualizada.
 * @param memberId O ID do membro cujo status será alterado.
 * @param newStatus O novo status de participação ('confirmed' ou 'declined').
 * @returns {Promise<Schedule>} A promessa resolve com a escala atualizada.
 */
export const updateMemberStatus = (
  scheduleId: string,
  memberId: string,
  newStatus: ParticipationStatus
): Promise<Schedule> => {
  console.log(
    `Atualizando status para ${newStatus} na escala ${scheduleId} para o membro ${memberId}`
  );
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const scheduleIndex = mockSchedules.findIndex((s) => s.id === scheduleId);

      if (scheduleIndex === -1) {
        return reject(new Error("Escala não encontrada."));
      }

      const memberStatusIndex = mockSchedules[
        scheduleIndex
      ].membersStatus.findIndex((ms) => ms.memberId === memberId);

      if (memberStatusIndex === -1) {
        return reject(new Error("Membro não encontrado nesta escala."));
      }

      // Atualiza o status
      mockSchedules[scheduleIndex].membersStatus[memberStatusIndex].status =
        newStatus;

      console.log("Status atualizado:", mockSchedules[scheduleIndex]);
      resolve(mockSchedules[scheduleIndex]);
    }, networkDelay);
  });
};

/**
 * @description Salva uma nova música na biblioteca.
 * @param songData Os dados da nova música (título, tom, link).
 * @returns {Promise<Song>} A promessa resolve com o objeto da música criada.
 */
export const createSong = (songData: Omit<Song, "id">): Promise<Song> => {
  console.log("Salvando nova música...", songData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSong: Song = {
        id: `song-${Date.now()}`,
        ...songData,
      };
      resolve(newSong);
    }, networkDelay);
  });
};

/**
 * @description Cria um novo grupo de louvor.
 * @param groupData Os dados do novo grupo (apenas o nome).
 * @returns {Promise<WorshipGroup>} A promessa resolve com o objeto do grupo criado.
 */
export const createGroup = (groupData: {
  name: string;
}): Promise<WorshipGroup> => {
  console.log("Criando objeto de grupo...", groupData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGroup: WorshipGroup = {
        id: `group-${Date.now()}`,
        name: groupData.name,
        members: [], // O grupo começa sem membros.
      };
      // Esta função não modifica o array original (mockGroups).
      // Ela apenas retorna o novo objeto para o componente gerenciar.
      resolve(newGroup);
    }, networkDelay);
  });
};
