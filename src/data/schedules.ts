import type { Schedule } from "../types";

export const mockSchedules: Schedule[] = [
  {
    id: "sched-01",
    date: "2025-08-10T10:00:00.000Z",
    worshipGroupId: "group-01",
    songs: ["song-01", "song-02"],
    membersStatus: [
      { memberId: "user-02", status: "pending" },
      { memberId: "user-03", status: "confirmed" },
      { memberId: "user-04", status: "pending" },
    ],
  },
  {
    id: "sched-02",
    date: "2025-08-17T19:00:00.000Z",
    worshipGroupId: "group-01",
    songs: ["song-03", "song-04", "song-01"],
    membersStatus: [
      { memberId: "user-02", status: "confirmed" },
      { memberId: "user-03", status: "confirmed" },
      { memberId: "user-04", status: "declined" },
    ],
  },
];
