# Frontend Architecture

<cite>
**Referenced Files in This Document**
- [App.jsx](file://App.jsx)
- [AuthContext.jsx](file://AuthContext.jsx)
- [UI.jsx](file://UI.jsx)
- [Admin.jsx](file://Admin.jsx)
- [DoctorPanel.jsx](file://DoctorPanel.jsx)
- [BookAppointment.jsx](file://BookAppointment.jsx)
- [Profile.jsx](file://Profile.jsx)
- [Payment.jsx](file://Payment.jsx)
- [api.js](file://api.js)
- [style.css](file://style.css)
- [README.md](file://README.md)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the frontend architecture of a React-based Doctor appointment booking system. It focuses on the component hierarchy, routing with React Router, centralized authentication state management via a Context Provider, reusable UI components, role-based page components, state management patterns, component communication strategies, API integration, responsive design, and performance considerations.

## Project Structure
The frontend is organized around a single-page application with:
- A root component that configures routing and wraps the app with authentication context
- A dedicated UI module exporting shared components (navigation, toasts, spinners)
- Role-specific page components for patients, doctors, and administrators
- An API module encapsulating HTTP client configuration and endpoint definitions
- A global stylesheet supporting light/dark themes and responsive design

```mermaid
graph TB
subgraph "Routing Layer"
App["App.jsx<br/>BrowserRouter + Routes"]
end
subgraph "State Management"
AuthCtx["AuthContext.jsx<br/>AuthProvider + useAuth"]
end
subgraph "Shared UI"
UI["UI.jsx<br/>Navbar + BottomNav + ToastContainer + Utilities"]
end
subgraph "Pages"
Home["Home (implicit)"]
Auth["Auth pages"]
Doctors["Doctors"]
Book["BookAppointment"]
Appts["Appointments"]
Profile["Profile"]
DocPanel["DoctorPanel"]
Admin["Admin"]
Payment["Payment"]
end
subgraph "API Layer"
API["api.js<br/>Axios client + endpoints"]
end
App --> AuthCtx
App --> UI
App --> Home
App --> Auth
App --> Doctors
App --> Book
App --> Appts
App --> Profile
App --> DocPanel
App --> Admin
App --> Payment
UI --> API
Book --> API
Profile --> API
DocPanel --> API
Admin --> API
Payment --> API
```

**Diagram sources**
- [App.jsx](file://App.jsx#L15-L42)
- [AuthContext.jsx](file://AuthContext.jsx#L6-L38)
- [UI.jsx](file://UI.jsx#L97-L176)
- [api.js](file://api.js#L1-L44)

**Section sources**
- [README.md](file://README.md#L7-L33)
- [App.jsx](file://App.jsx#L1-L44)
- [AuthContext.jsx](file://AuthContext.jsx#L1-L41)
- [UI.jsx](file://UI.jsx#L1-L182)
- [api.js](file://api.js#L1-L44)

## Core Components
- App.jsx: Root component configuring React Router, wrapping children with AuthProvider, rendering Navbar, ToastContainer, and BottomNav, and defining all application routes.
- AuthContext.jsx: Provides centralized authentication state (user, token, theme preference) and exposes login/logout functions and a dark mode toggle. Persists state to localStorage and applies theme to the document element.
- UI.jsx: Reusable UI primitives including Navbar, BottomNav, ToastContainer, Spinner, Stars, ProbBar, Countdown, StatusBadge, and a toast hook. Implements a toast system with message queuing and automatic dismissal.
- api.js: Axios-based HTTP client configured with base URL and a set of exported functions for authentication, doctor listings, appointments, doctor panel actions, admin operations, and payment endpoints.

Key patterns:
- Context API for global state (authentication and theme)
- React Router for declarative navigation
- Encapsulated API module for clean service boundaries
- Utility components for cross-cutting concerns (toasts, spinners)

**Section sources**
- [App.jsx](file://App.jsx#L15-L42)
- [AuthContext.jsx](file://AuthContext.jsx#L6-L40)
- [UI.jsx](file://UI.jsx#L1-L182)
- [api.js](file://api.js#L1-L44)

## Architecture Overview
The frontend follows a layered architecture:
- Presentation layer: Pages and shared UI components
- State management layer: AuthProvider and local storage persistence
- API integration layer: Centralized axios client with typed endpoints
- Styling layer: CSS variables, theme switching, and responsive breakpoints

```mermaid
graph TB
Client["Browser"]
Router["React Router<br/>App.jsx"]
Ctx["AuthContext<br/>AuthProvider"]
UIComp["UI Components<br/>UI.jsx"]
Pages["Page Components<br/>Admin.jsx / DoctorPanel.jsx / BookAppointment.jsx / Profile.jsx / Payment.jsx"]
API["API Module<br/>api.js"]
HTTP["HTTP Client<br/>Axios"]
Storage["localStorage<br/>Persistence"]
Client --> Router
Router --> Ctx
Router --> UIComp
Router --> Pages
UIComp --> API
Pages --> API
API --> HTTP
Ctx --> Storage
Ctx --> HTTP
```

**Diagram sources**
- [App.jsx](file://App.jsx#L15-L42)
- [AuthContext.jsx](file://AuthContext.jsx#L6-L38)
- [UI.jsx](file://UI.jsx#L1-L182)
- [Admin.jsx](file://Admin.jsx#L1-L194)
- [DoctorPanel.jsx](file://DoctorPanel.jsx#L1-L96)
- [BookAppointment.jsx](file://BookAppointment.jsx#L1-L171)
- [Profile.jsx](file://Profile.jsx#L1-L97)
- [Payment.jsx](file://Payment.jsx#L1-L350)
- [api.js](file://api.js#L1-L44)

## Detailed Component Analysis

### Authentication and State Management
The AuthProvider pattern centralizes authentication state and theme preferences:
- State initialization from localStorage
- Authorization header propagation via axios defaults
- Theme persistence and DOM attribute updates
- Public API: login, logout, dark mode toggle

```mermaid
sequenceDiagram
participant Comp as "Any Component"
participant Ctx as "AuthProvider"
participant AX as "Axios Defaults"
participant LS as "localStorage"
Comp->>Ctx : useAuth()
Ctx-->>Comp : { user, token, login, logout, dark, toggleDark }
Comp->>Ctx : login(userData, jwt)
Ctx->>LS : persist user + token
Ctx->>AX : set Authorization header
Comp->>Ctx : logout()
Ctx->>LS : remove user + token
Ctx->>AX : clear Authorization header
Comp->>Ctx : toggleDark()
Ctx->>LS : persist theme preference
Ctx->>Ctx : set data-theme attribute
```

**Diagram sources**
- [AuthContext.jsx](file://AuthContext.jsx#L6-L38)

**Section sources**
- [AuthContext.jsx](file://AuthContext.jsx#L1-L41)

### Routing and Navigation
App.jsx defines all application routes and renders shared UI:
- Top-level routes for home, auth, doctors, booking, appointments, profile, doctor panel, admin, and payment
- Navbar and BottomNav provide cross-role navigation
- ToastContainer displays transient messages

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Router as "BrowserRouter"
participant Routes as "Routes"
participant AppShell as "App.jsx"
participant Nav as "Navbar/BottomNav"
participant Page as "Selected Page"
Browser->>Router : Navigate to path
Router->>Routes : Match route
Routes->>AppShell : Render shell
AppShell->>Nav : Render navigation
AppShell->>Page : Render matched page
```

**Diagram sources**
- [App.jsx](file://App.jsx#L15-L42)
- [UI.jsx](file://UI.jsx#L97-L176)

**Section sources**
- [App.jsx](file://App.jsx#L1-L44)
- [UI.jsx](file://UI.jsx#L97-L176)

### Shared UI Components
UI.jsx exports:
- Navbar: Role-aware links and actions, dark mode toggle, logout
- BottomNav: Mobile-first navigation with role-specific items
- ToastContainer: Queued toast notifications with auto-dismiss
- Utilities: Spinner, Stars, ProbBar, Countdown, StatusBadge

```mermaid
classDiagram
class UI {
+Navbar()
+BottomNav()
+ToastContainer()
+Spinner()
+Stars(rating)
+ProbBar(pct)
+Countdown(dateStr,timeStr)
+StatusBadge(status)
+useToast()
}
```

**Diagram sources**
- [UI.jsx](file://UI.jsx#L1-L182)

**Section sources**
- [UI.jsx](file://UI.jsx#L1-L182)

### Patient Role Pages
- BookAppointment: Doctor details, time slot selection, confirmation probability, review submission
- Profile: Personal details editing, password change, optimistic updates
- Appointments: List of bookings, status badges, cancellation flow
- Payment: Multi-step secure payment with method selection and simulated processing

```mermaid
sequenceDiagram
participant Patient as "Patient"
participant Book as "BookAppointment"
participant API as "api.js"
participant Pay as "Payment"
Patient->>Book : Select date/time
Book->>API : bookAppointment()
API-->>Book : { appointment_id }
Book->>Pay : navigate with state
Pay->>API : simulatePayment()
API-->>Pay : { transaction_ref }
Pay-->>Patient : success screen
```

**Diagram sources**
- [BookAppointment.jsx](file://BookAppointment.jsx#L39-L60)
- [Payment.jsx](file://Payment.jsx#L62-L98)
- [api.js](file://api.js#L17-L43)

**Section sources**
- [BookAppointment.jsx](file://BookAppointment.jsx#L1-L171)
- [Profile.jsx](file://Profile.jsx#L1-L97)
- [Payment.jsx](file://Payment.jsx#L1-L350)
- [api.js](file://api.js#L1-L44)

### Doctor Role Page
- DoctorPanel: Incoming appointment requests, status filtering, approve/reject actions

```mermaid
flowchart TD
Start(["DoctorPanel"]) --> Load["Load doctor's appointments"]
Load --> Filter["Filter by status"]
Filter --> Actions{"Pending?"}
Actions --> |Yes| Approve["Approve"]
Actions --> |Yes| Reject["Reject"]
Actions --> |No| End(["Idle"])
Approve --> Update["PATCH /doctor/appointments/:id"]
Reject --> Update
Update --> Toast["Show success toast"]
Toast --> End
```

**Diagram sources**
- [DoctorPanel.jsx](file://DoctorPanel.jsx#L15-L28)
- [api.js](file://api.js#L22-L23)

**Section sources**
- [DoctorPanel.jsx](file://DoctorPanel.jsx#L1-L96)
- [api.js](file://api.js#L22-L23)

### Admin Role Page
- Admin: Dashboard with stats, tabbed views for appointments, patients, doctors, payments; bulk actions and deletions

```mermaid
flowchart TD
AdminStart(["Admin Dashboard"]) --> Tabs["Switch tabs"]
Tabs --> Overview["Overview cards"]
Tabs --> Appts["Manage appointments"]
Tabs --> Patients["View patients"]
Tabs --> Doctors["View/remove doctors"]
Tabs --> Payments["View payments"]
Appts --> Update["PATCH /admin/appointments/:id"]
Doctors --> Remove["DELETE /admin/doctors/:id"]
Update --> Toast["Show toast"]
Remove --> Toast
Toast --> AdminEnd(["Done"])
```

**Diagram sources**
- [Admin.jsx](file://Admin.jsx#L19-L41)
- [api.js](file://api.js#L30-L35)

**Section sources**
- [Admin.jsx](file://Admin.jsx#L1-L194)
- [api.js](file://api.js#L29-L35)

### API Integration Patterns
- Centralized axios client with base URL pointing to backend routes
- Typed endpoints for auth, doctors, appointments, doctor panel, admin, and payments
- Token propagation via Authorization header managed by AuthProvider

```mermaid
sequenceDiagram
participant Page as "Page Component"
participant API as "api.js"
participant AX as "Axios"
participant Auth as "AuthProvider"
participant BE as "Backend API"
Page->>API : Call endpoint
API->>AX : POST /api/...
AX->>Auth : Read token from context
Auth-->>AX : Inject Authorization header
AX->>BE : Forward request
BE-->>AX : Response
AX-->>API : Response
API-->>Page : Data
```

**Diagram sources**
- [api.js](file://api.js#L1-L44)
- [AuthContext.jsx](file://AuthContext.jsx#L11-L14)

**Section sources**
- [api.js](file://api.js#L1-L44)
- [AuthContext.jsx](file://AuthContext.jsx#L1-L41)

## Dependency Analysis
- App.jsx depends on AuthProvider, UI components, and page components
- UI.jsx depends on AuthContext and React Router hooks
- Page components depend on API module and UI utilities
- AuthContext depends on axios and localStorage
- Styles rely on CSS variables and media queries

```mermaid
graph LR
App["App.jsx"] --> Auth["AuthContext.jsx"]
App --> UI["UI.jsx"]
App --> Pages["Pages"]
UI --> Auth
Pages --> API["api.js"]
Auth --> AX["axios"]
UI --> Styles["style.css"]
Pages --> Styles
```

**Diagram sources**
- [App.jsx](file://App.jsx#L1-L44)
- [AuthContext.jsx](file://AuthContext.jsx#L1-L41)
- [UI.jsx](file://UI.jsx#L1-L182)
- [api.js](file://api.js#L1-L44)
- [style.css](file://style.css#L1-L800)

**Section sources**
- [App.jsx](file://App.jsx#L1-L44)
- [AuthContext.jsx](file://AuthContext.jsx#L1-L41)
- [UI.jsx](file://UI.jsx#L1-L182)
- [api.js](file://api.js#L1-L44)
- [style.css](file://style.css#L1-L800)

## Performance Considerations
- Context granularity: AuthProvider holds user, token, and theme; consider splitting if other global state grows
- Rendering: UI.jsx components are lightweight; avoid unnecessary re-renders by memoizing props and using stable references
- Network: API module centralizes axios configuration; ensure minimal requests and batch operations where possible
- Styling: CSS variables enable fast theme switching; avoid layout thrashing by batching DOM writes
- Routing: Keep page components lazy-loaded if bundle size increases; current structure loads synchronously
- Toasts: Automatic dismissal prevents memory leaks; ensure message queues are bounded

## Troubleshooting Guide
Common issues and resolutions:
- Authentication failures: Verify token presence and Authorization header propagation; check localStorage persistence
- Navigation loops: Ensure role checks guard protected routes (e.g., admin, doctor panels)
- Toast not appearing: Confirm ToastContainer is rendered and useToast is called from a child of AuthProvider
- Styling inconsistencies: Confirm data-theme attribute is applied and CSS variables are defined
- API errors: Inspect response handling in page components and show user-friendly messages

**Section sources**
- [AuthContext.jsx](file://AuthContext.jsx#L11-L19)
- [Admin.jsx](file://Admin.jsx#L19-L24)
- [UI.jsx](file://UI.jsx#L11-L25)
- [style.css](file://style.css#L35-L58)

## Conclusion
The frontend employs a clean separation of concerns with React Router for navigation, a focused AuthProvider for state, and a cohesive UI module for shared components. The API module provides a single source of truth for HTTP interactions. The design emphasizes responsiveness, accessibility, and maintainability through CSS variables, mobile-first navigation, and modular components. Future enhancements could include code-splitting, improved error boundaries, and expanded testing coverage.