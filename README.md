# Capstone_FSEJAVA_Team44_EventZone_UI
At EventZone, we connect people with the events they love. This Foundation version delivers a clean event-browsing and ticket-booking experience - no payment gateway, no QR code generation, just a complete registration and booking flow
# EventZone UI

EventZone UI is an Angular single-page application for discovering events, viewing event details, booking tickets, and managing event-related workflows based on the signed-in user's role.

## Features

- Browse the event catalogue and view event details.
- View event dates, venues, descriptions, ticket categories, prices, and available seats.
- See a live countdown to an upcoming event.
- Register and sign in with client-side form validation.
- Browse personal bookings through the **My Bookings** view.
- Create, edit, and manage events from the organiser dashboard.
- Add and update ticket categories, prices, and seat capacity for organiser events.
- Require all event fields and at least one complete ticket category before an event can be saved.
- Populate description and cover image URL when editing an existing event.
- Disable organiser edit and delete actions after an event becomes inactive.
- Cancel all confirmed bookings before an organiser event is deleted.
- Show persistent refund status messages for organiser and admin cancellation actions.
- Use organiser-only and admin-only screens when the signed-in user has the required role.
- Activate and deactivate events from the admin panel.
- Use the profile menu to view the current user and sign out.
- Receive loading and toast feedback during common actions.
- Use responsive layouts for desktop and mobile screens.

## Technology

- Angular 22
- TypeScript 6
- Angular Reactive Forms
- Angular Router with lazy-loaded feature components
- RxJS
- SCSS
- Jasmine, Karma, and ChromeHeadless for tests

## Prerequisites

- Node.js compatible with the Angular 22 toolchain
- npm 11 or a compatible npm version
- A browser with JavaScript enabled

## Getting Started

Install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The application is then available at `http://localhost:4200/`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Angular development server. |
| `npm run build` | Create a production build. |
| `npm run watch` | Rebuild continuously using the development configuration. |
| `npm test` | Run the unit test suite. |
| `npm run ng -- <command>` | Run an Angular CLI command. |

For a one-time headless test run:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## UI Configuration

The application uses Angular environment files for frontend configuration:

- `src/environments/environment.development.ts` is used during development.
- `src/environments/environment.ts` contains the production environment values.

The `apiBaseUrl` value tells the UI where its configured application API is located. Change the value in the appropriate environment file when the UI is used in a different environment. No server-side code or server setup is part of this project.

## Event Cancellation and Refunds

When an organiser deletes an active event, the UI first calls the event-wide booking cancellation endpoint:

```text
PUT /bookings/event/{eventId}/cancel
```

The event deletion request is sent only after the booking cancellation succeeds. The organiser receives the permanent status message:

> Refund process has been initiated for all confirmed bookings.

Attendees see cancelled bookings as `CANCELLED`, cannot cancel them again, and receive the refund notice that the refund will arrive in the original payment source within 5 to 7 business days. Inactive events also show a cancellation notice on the event details page and no longer display the booking form.

The backend must support the event-wide cancellation endpoint and mark the event inactive so the attendee booking view can identify cancelled events.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Event listing. |
| `/events/:id` | Public | Event details, countdown, and ticket booking. |
| `/login` | Public | Sign in. |
| `/register` | Public | Create an account. |
| `/my-bookings` | Signed-in users | View the current user's bookings. |
| `/organiser` | Organiser role | Organiser dashboard. |
| `/admin` | Admin role | Admin panel. |

Unknown routes redirect to the event listing.

## Project Structure

```text
src/
	app/
		core/
			guards/          Route authentication and role checks
			interceptors/    Request authentication and error handling
			models/          UI data models
			services/        Auth, event, booking, category, and role workflows
		features/
			auth/            Login and registration
			events/           Event list and event details
			bookings/         Personal bookings
			organiser/        Organiser dashboard
			admin/            Admin panel
		shared/
			components/      Navbar, loading spinner, and toast UI
			services/        Shared UI services
			validators/      Reusable form validators
	environments/        Development and production UI configuration
```

## Validation and Testing

Client-side validation covers login, registration, event creation/editing, and ticket categories. Event forms require a title, description, date, venue, cover image URL, event category, and at least one ticket category. Ticket categories require a name, non-negative price, and at least one seat.

Email validation is shared by the login and registration forms. The test suite includes coverage for malformed addresses such as numeric domain suffixes and punctuation-only local parts.

Before submitting UI changes, run:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

## Development Notes

- Keep reusable business-facing data types in `src/app/core/models`.
- Keep API access in core services rather than directly in feature templates.
- Use route guards for authenticated and role-specific screens.
- Keep shared visual elements in `src/app/shared/components`.
- Use UUID string event IDs consistently in event and booking workflows.
- Keep cancellation and refund status visible to attendees after an event becomes inactive.
- Preserve the standalone component and lazy-loading patterns used by the application.

## Test Coverage summary:
Statements: 87.86%
Branches: 78.4%
Functions: 84.14%
Lines: 87.91%
