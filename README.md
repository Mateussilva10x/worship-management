# 🎵 Praise Schedule (v1.0)

**A Worship Schedule Management System for Churches**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5-blue?logo=mui)](https://mui.com/)
[![Status](https://img.shields.io/badge/status-V1.0%20Completed-green)](https://shields.io/)

---

## 📖 Project Description

**Praise Schedule** is a modern web application designed to streamline the organization and communication of church worship team schedules. Inspired by systems like Planning Center, the goal is to provide an intuitive and centralized tool for administrators, leaders, and team members, optimizing the process of creating schedules, managing RSVPs, and setting song lists.

This application was built from the ground up with a focus on a robust architecture, mobile-first responsiveness, and a clean, pleasant user experience, using dark mode by default.

## ✨ Features (v1.0)

The system features 3 access levels with specific functionalities for each role:

### 👤 **Administrator**

- **Centralized Dashboard:** A complete overview of all upcoming schedules.
- **User Management:**
  - Register new members in the system.
  - The system generates a temporary password and requires a password change on the first login.
- **Group Management:**
  - Create multiple worship groups (e.g., "Sunday Team," "Youth Team").
  - Edit groups to add or remove members.
  - Assign a **Leader** for each group.
- **Schedule Creation:**
  - Create schedules by assigning a group to a specific date and time.
  - Adding songs to the setlist at the time of creation is optional for flexibility.
- **Song Library:**
  - View and search all registered songs.
  - Add new songs with a title, key, and a link to a chord chart or video.
- **Detailed View:** Access the details of any schedule, including the song list and the participation status (RSVP) of each member.

### 🎸 **Group Leader**

- Inherits all the functionalities of a standard Member.
- **Special Permissions:** Has access to an "Edit Songs" button on their dashboard for the schedules of the group they lead.
- **Setlist Management:** Can add or remove songs from their team's schedules at any time.
- Can view the confirmation status of their team members.

### 🎤 **Member**

- **Personalized Dashboard:** Views a list containing only the schedules they have been assigned to.
- **Schedule Interaction:**
  - Buttons to **Confirm** or **Decline** participation in a schedule.
  - The status is updated in real-time.
- **Secure First Login:** Is required to create a new personal password on their first login.

---

## 🚀 Tech Stack

- **Frontend:**
  - **React 18:** The core library for building the UI.
  - **Vite:** A modern and fast build tool for the development environment.
  - **TypeScript:** For safer, scalable, and more maintainable code.
- **UI & Styling:**
  - **Material-UI (MUI) v5:** A robust component library for a consistent and professional UI.
  - **Dark Mode** by default, configured via MUI's `ThemeProvider`.
- **Routing:**
  - **React Router DOM v6:** For client-side navigation between application pages.
- **Global State Management:**
  - **React Context API:** Used to create a centralized `DataContext` (a single source of truth for the app's data) and an `AuthContext` for authentication management.
- **PDF Generation:**
  - **jsPDF** & **jspdf-autotable:** For the feature of exporting schedule details to a PDF file.

---

## 📂 Project Structure

The project follows a modular architecture to facilitate maintainability and scalability:
