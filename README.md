# 🎵 Louvor na Escala (v1.0)

**Sistema de Gestão de Escalas de Louvor para Igrejas**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5-blue?logo=mui)](https://mui.com/)
[![Status](https://img.shields.io/badge/status-V1.0%20Concluída-green)](https://shields.io/)

---

## 📖 Descrição do Projeto

O **Louvor na Escala** é uma aplicação web moderna projetada para simplificar a organização e comunicação das escalas de ministérios de louvor em igrejas. Inspirado em sistemas como o Planning Center, o objetivo é fornecer uma ferramenta intuitiva e centralizada para administradores, líderes e membros das equipes, otimizando o processo de escalação, confirmação de participação e definição de repertórios.

Esta aplicação foi construída do zero, com foco em uma arquitetura robusta, responsividade para dispositivos móveis e uma experiência de usuário limpa e agradável, utilizando o modo escuro como padrão.

## ✨ Funcionalidades (v1.0)

O sistema possui 3 níveis de acesso com funcionalidades específicas para cada papel:

### 👤 **Administrador**

- **Dashboard Central:** Visualização completa de todas as escalas futuras.
- **Gestão de Usuários:**
  - Cadastro de novos membros no sistema.
  - O sistema gera uma senha temporária e força a alteração no primeiro login.
- **Gestão de Grupos:**
  - Criação de múltiplos grupos de louvor (ex: "Equipe de Domingo", "Equipe Jovem").
  - Edição de grupos para adicionar ou remover membros.
  - Designação de um **Líder** para cada grupo.
- **Criação de Escalas:**
  - Criação de escalas associando um grupo a uma data e hora específicas.
  - A adição de músicas ao repertório no momento da criação é opcional.
- **Biblioteca de Músicas:**
  - Visualização e busca de todas as músicas cadastradas.
  - Cadastro de novas músicas com título, tom e link para cifra/vídeo.
- **Visualização Detalhada:** Acesso aos detalhes de qualquer escala, incluindo a lista de músicas e o status de participação de cada membro.

### 🎸 **Líder de Grupo**

- Herda todas as funcionalidades de um Membro comum.
- **Permissões Especiais:** Possui um botão "Editar Músicas" em seu painel para as escalas do grupo que lidera.
- **Gestão de Repertório:** Pode adicionar ou remover músicas das escalas de sua equipe a qualquer momento.
- Visualiza o status de confirmação dos membros de sua equipe.

### 🎤 **Membro**

- **Painel Personalizado:** Visualiza uma lista contendo apenas as escalas em que foi convocado.
- **Interação com a Escala:**
  - Botões para **Confirmar** ou **Recusar** a participação em uma escala.
  - O status é atualizado em tempo real.
- **Primeiro Acesso Seguro:** É forçado a criar uma senha pessoal no primeiro login.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:**
  - **React 18:** Biblioteca principal para a construção da interface.
  - **Vite:** Ferramenta de build extremamente rápida para o ambiente de desenvolvimento.
  - **TypeScript:** Para um código mais seguro, escalável e fácil de manter.
- **UI & Estilização:**
  - **Material-UI (MUI) v5:** Biblioteca de componentes robusta para uma UI consistente e profissional.
  - **Modo Escuro** como padrão, configurado via `ThemeProvider` do MUI.
- **Roteamento:**
  - **React Router DOM v6:** Para navegação entre as páginas da aplicação.
- **Estado Global:**
  - **React Context API:** Utilizado para criar um `DataContext` centralizado (fonte única da verdade para os dados da aplicação) e um `AuthContext` para o gerenciamento de autenticação.
- **Geração de PDF:**
  - **jsPDF** & **jspdf-autotable:** Para a funcionalidade de exportar os detalhes da escala para um arquivo PDF.

---

## 📂 Estrutura do Projeto

O projeto segue uma arquitetura modular para facilitar a manutenção e escalabilidade:
