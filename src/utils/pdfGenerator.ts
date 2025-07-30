import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Schedule, WorshipGroup, Song, User } from "../types";

interface jsPDFWithPlugin extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

const statusTextMap = {
  confirmed: "Confirmado",
  declined: "Recusado",
  pending: "Pendente",
};

export const generateSchedulePdf = (
  schedule: Schedule,
  group: WorshipGroup,
  songs: Song[],
  users: User[]
) => {
  const doc = new jsPDF() as jsPDFWithPlugin;

  const eventDate = new Date(schedule.date);
  const formattedDate = eventDate.toLocaleString("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const groupName = `Equipe: ${group.name}`;

  doc.setFontSize(20);
  doc.text("Escala de Louvor", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(formattedDate, 105, 30, { align: "center" });
  doc.setFontSize(14);
  doc.text(groupName, 105, 40, { align: "center" });

  autoTable(doc, {
    startY: 50,
    head: [["Título", "Tom"]],
    body: songs.map((song) => [song.title, song.key]),
    theme: "striped",
    headStyles: { fillColor: [0, 100, 0] },
  });

  const lastTableY = doc.lastAutoTable.finalY;
  const membersBody = schedule.membersStatus.map((memberStatus) => {
    const userName =
      users.find((u) => u.id === memberStatus.memberId)?.name || "N/A";
    const statusText = statusTextMap[memberStatus.status];
    return [userName, statusText];
  });

  autoTable(doc, {
    startY: lastTableY + 10,
    head: [["Membro", "Status"]],
    body: membersBody,
    theme: "grid",
    headStyles: { fillColor: [0, 100, 0] },
  });

  const fileNameDate = eventDate.toISOString().split("T")[0];
  doc.save(`escala-louvor-${fileNameDate}.pdf`);
};
