import type { User } from "../types";

export const mockUsers: User[] = [
  {
    id: "user-01",
    name: "Admin Principal",
    email: "admin@email.com",
    role: "admin",
  },
  {
    id: "user-02",
    name: "João Silva (Vocal)",
    email: "membro@email.com",
    role: "member",
  },
  {
    id: "user-03",
    name: "Maria Clara (Teclado)",
    email: "maria@email.com",
    role: "member",
  },
  {
    id: "user-04",
    name: "Pedro Lima (Bateria)",
    email: "pedro@email.com",
    role: "member",
  },
];
