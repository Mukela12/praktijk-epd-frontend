# Praktijk EPD Frontend

A modern healthcare Electronic Patient Dossier (EPD) frontend application built with React, TypeScript, and Vite. This application provides a secure, multilingual interface for healthcare professionals and patients to manage medical records and appointments.

## Features

- **Secure Authentication**: JWT-based authentication with role-based access control
- **Multilingual Support**: Support for Dutch (NL) and English (EN)
- **Role-Based Access**: Different interfaces for clients, doctors, and staff
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI/UX**: Clean, accessible interface with Headless UI components
- **Form Validation**: Robust client-side validation with Zod schemas
- **State Management**: Zustand for efficient state management
- **API Integration**: Axios-based API client with React Query for data fetching

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.x with PostCSS
- **UI Components**: Headless UI + Heroicons + Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast + Sonner
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js (18.x or higher)
- npm or yarn
- Backend API running (praktijk-epd-backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd praktijk-epd-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── appointments/   # Appointment management
├── services/           # API services
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── utils/              # Utility functions
└── styles/             # Global styles
```

## Authentication

The application supports secure user authentication with:

- **Registration**: New user registration with email verification
- **Login**: Secure login with JWT tokens
- **Password Reset**: Secure password reset functionality
- **Role-Based Access**: Different access levels for clients, doctors, and staff

### Password Requirements

Passwords must meet the following criteria:
- At least 8 characters long
- Contains uppercase and lowercase letters
- Contains at least one number
- Contains at least one special character
- Does not contain common or forbidden words

#### Forbidden Passwords

The following passwords and patterns are not allowed for security reasons:
- `password`
- `password123`
- `123456`
- `12345678`
- `qwerty`
- `abc123`
- `admin`
- `user`
- `test`
- `praktijk`
- `epd`

**Note**: The system checks for these forbidden words within the password (case-insensitive), so passwords containing any of these words will be rejected.

## API Integration

The frontend communicates with the backend API through:

- **Base URL**: Configurable API endpoint
- **Authentication**: JWT token-based authentication
- **Error Handling**: Comprehensive error handling and user feedback
- **Request Interceptors**: Automatic token attachment and request logging
- **Response Interceptors**: Automatic error handling and token refresh

## Recent Improvements

### Security Enhancements
- ✅ Enhanced password validation with forbidden words detection
- ✅ Synchronized frontend and backend password validation rules
- ✅ Improved error handling for authentication flows

### Bug Fixes
- ✅ Fixed registration validation alignment between frontend and backend
- ✅ Resolved password validation regex issues
- ✅ Improved API error handling and user feedback

### Code Quality
- ✅ Removed debug logging from production code
- ✅ Enhanced type safety with TypeScript
- ✅ Improved form validation with Zod schemas

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Praktijk EPD
```

### API Configuration

The API client is configured in `src/services/api.ts` with:
- Base URL configuration
- Request/response interceptors
- Error handling
- Authentication token management

## Testing

The application includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Build

```bash
npm run build
```

This creates a `dist/` folder with the production build.

### Environment-Specific Builds

The application supports different environment configurations:

- **Development**: `npm run dev`
- **Staging**: `npm run build:staging`
- **Production**: `npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.