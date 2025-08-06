import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';


const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "songs": "Songs",
      "groups": "Groups",
      "users": "Users",
      "hello": "Hello",
      "upcomingSchedules": "Upcoming Schedules",
      "newSchedule": "New Schedule",
      "team": "Team",
      "teamStatus": "Team Status",
      "confirmed": "Confirmed",
      "declined": "Declined",
      "pending": "Pending",
      "noSchedulesFound": "No schedules found.",
    }
  },
  pt: {
    translation: {
      "dashboard": "Painel",
      "songs": "Músicas",
      "groups": "Grupos",
      "users": "Usuários",
      "hello": "Olá",
      "upcomingSchedules": "Próximas Escalas",
      "newSchedule": "Nova Escala",
      "team": "Equipe",
      "teamStatus": "Status da Equipe",
      "confirmed": "Confirmados",
      "declined": "Recusaram",
      "pending": "Pendentes",
      "noSchedulesFound": "Nenhuma escala encontrada.",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt', 
    interpolation: {
      escapeValue: false, 
    },
    
    detection: {
      order: ['localStorage', 'navigator'], 
      caches: ['localStorage'], 
    },
  });

export default i18n;