# Synergy AI – Frontend

Welcome to the **Synergy AI for Space Optimization** Employee Portal frontend repository. This project is a sophisticated, scalable, and modular React-based application designed to deliver a seamless user experience for workplace space management in hybrid work environments.

## 🚀 Project Overview

**Synergy AI** is a comprehensive workplace optimization platform comprising three integrated portals:

- **Employee Portal (this repository):** A React (Next.js) frontend application providing employees with self-service capabilities to book hot seats, discussion rooms, manage visitor passes, and access workspace analytics.
- **Employer Portal:** An AI-powered analytics dashboard leveraging advanced machine learning models (Space Optimizer and Energy Predictor) for strategic space utilization and energy consumption forecasting.
- **Admin Portal:** A centralized management console for client onboarding, governance, and platform configuration.

This frontend repository implements the Employee Portal using modern web technologies, emphasizing performance, accessibility, and maintainability.

## 🌟 Key Features & Capabilities

- **Modern React Framework:** Built with Next.js leveraging server-side rendering (SSR) and static site generation (SSG) for optimal performance and SEO.
- **TypeScript:** Fully typed codebase ensuring type safety, maintainability, and developer productivity.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development with a consistent design system aligned to Figma prototypes.
- **Modular Component Architecture:** Reusable, composable UI components organized under `/components/ui` following atomic design principles.
- **Robust Booking System:** Hot seat and discussion room booking with advanced scheduling, real-time availability, and booking management (view, modify, cancel).
- **Visitor Pass Management:** Create and manage visitor passes with secure workflows.
- **Responsive Design:** Fully responsive layouts and navigation (sidebar, menus) optimized for desktop, tablet, and mobile devices.
- **Mock Data Mode:** UI exploration mode with mock data to facilitate frontend development and testing independent of backend availability.
- **Authentication & Authorization:** Middleware and protected layouts to enforce route protection and role-based access control (RBAC).
- **API Integration:** Designed to integrate seamlessly with backend services via RESTful APIs; environment-driven backend URL configuration.
- **State Management:** Local and global state handled via React hooks and context providers for efficient data flow.
- **Error Handling & Loading States:** Comprehensive UI feedback for asynchronous operations ensuring smooth user experience.

## 🏗️ Technology Stack

- **Frontend Framework:** Next.js (React 18+)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom theming and responsive utilities
- **State Management:** React Context API and custom hooks
- **API Layer:** Custom API service utilities under `/lib/api-service.ts`
- **Authentication:** Middleware (`middleware.ts`) and protected layout components (`components/protected-layout.tsx`)
- **Build & Tooling:** Next.js build system, ESLint, Prettier, TypeScript compiler
- **Version Control:** Git with GitHub repository management

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/i1sm3ky/Synergy-Frontend.git
cd Synergy-Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally (UI Exploration Mode)

```bash
npm run dev
```

- Access the app at [http://localhost:3000](http://localhost:3000) to explore the fully functional mock UI with simulated data.

### 4. Backend Integration Setup

- Create a `.env.local` file at the project root with the following environment variable:

```
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url.com
```

- Enable backend integration by uncommenting relevant code sections in:
  - `middleware.ts` (for route protection and authentication)
  - `components/protected-layout.tsx` (for auth checks)
  - `components/app-sidebar.tsx` (to display real user data)

- Implement backend API endpoints as per the backend checklist and update "TODO" comments in the codebase.

- Test authentication flows via the `/login` page.

## 📦 Project Structure

- `/app` – Main application code including pages, views, and routing logic.
- `/components` – Reusable UI components, including sidebar, protected layouts, and atomic UI elements.
- `/lib` – Utility libraries for API services, authentication helpers, responsive utilities, and socket connections.
- `/hooks` – Custom React hooks for mobile detection, toast notifications, and other reusable logic.
- `/public` – Static assets such as images and icons.
- `/styles` – Global CSS styles and Tailwind configuration.
- `/types` – TypeScript interfaces and type definitions for API contracts and application data.

## 🛠 Development Workflow

- **Code Quality:** ESLint and Prettier enforce consistent code style and formatting.
- **Type Safety:** TypeScript ensures robust typing across the codebase.
- **Component-Driven Development:** UI components are developed in isolation and composed to build complex views.
- **Mock Data Mode:** Enables frontend development without backend dependencies.
- **API Integration:** API calls are abstracted via `/lib/api-service.ts` for maintainability.
- **Authentication:** Middleware and protected routes ensure secure access control.
- **Responsive Design:** Tailwind CSS utilities and custom hooks provide adaptive layouts.

## 🚀 Deployment

- The frontend is deployed on AWS EC2 instances for the Employee Portal.
- Continuous integration and deployment pipelines can be configured using GitHub Actions or other CI/CD tools.
- Environment variables control backend API endpoints and feature toggles.

## 📚 Additional Documentation

- See `/docs/enhanced-auth-api.md` for detailed authentication API specifications.
- Figma design files (link to be added) provide UI/UX guidelines and prototypes.

## 💡 Contribution Guidelines

Contributions are welcome! Please follow these guidelines:

- Fork the repository and create feature branches.
- Write clear, concise commit messages.
- Ensure code passes linting and type checks.
- Add or update tests as needed.
- Submit pull requests with detailed descriptions.

## 📋 License

This project is licensed under the MIT License.

## 🔗 Useful Links

- [Frontend Repository](https://github.com/i1sm3ky/Synergy-Frontend)
- [Figma Designs (UI)](https://www.figma.com/design/WHmI7llLPskPpJhvIpmkhg/Deloitte-Synergy-AI?node-id=0-1&t=18b3wthUYUvexqVD-1)
- [FigJam (Architecture \& DB)](https://www.figma.com/board/qqHRhxLyaL9NvPzvuYcgAm/Deloitte-System-Architecture?node-id=0-1&t=S5dgXEG3HDPZMFZB-1)

## 🧭 System Architecture Overview

![Deloitte System Flow](/deloitte-flow.png)

## 🗄️ Database Schema

![Database Schema](/db-schema.png)

*For technical support or queries, please open an issue on GitHub.*

---
