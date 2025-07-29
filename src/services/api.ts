import { mockUsers } from "../data/users";
import { mockSongs } from "../data/songs";
import { mockGroups } from "../data/groups";
import { mockSchedules } from "../data/schedules";
import type { Schedule, Song, User, WorshipGroup } from "../types";

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
