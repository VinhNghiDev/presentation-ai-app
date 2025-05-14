# Presentation AI App Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Documentation](#api-documentation)
3. [User Guide](#user-guide)
4. [Developer Guide](#developer-guide)
5. [Architecture](#architecture)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/presentation-ai-app.git

# Navigate to project directory
cd presentation-ai-app

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Setup
Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=your_api_url
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

## API Documentation

### Authentication
All API requests require authentication using JWT tokens.

### Endpoints

#### Presentations
- `GET /api/presentations` - Get all presentations
- `GET /api/presentations/:id` - Get presentation by ID
- `POST /api/presentations` - Create new presentation
- `PUT /api/presentations/:id` - Update presentation
- `DELETE /api/presentations/:id` - Delete presentation
- `POST /api/presentations/:id/export` - Export presentation

#### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

## User Guide

### Creating a Presentation
1. Click "New Presentation" button
2. Select a template or start from scratch
3. Add slides using the editor
4. Customize content and styling
5. Save and export

### Using Templates
1. Browse available templates
2. Preview template
3. Select and customize
4. Save as new presentation

### Exporting
1. Click "Export" button
2. Select format (PDF, PPTX, HTML)
3. Choose export options
4. Download file

## Developer Guide

### Project Structure
```
src/
  ├── components/     # React components
  ├── hooks/         # Custom hooks
  ├── utils/         # Utility functions
  ├── api/           # API integration
  ├── store/         # State management
  ├── styles/        # CSS/SCSS files
  └── tests/         # Test files
```

### Key Components
- `PresentationEditor`: Main editor component
- `SlideManager`: Slide management
- `TemplateManager`: Template handling
- `ExportManager`: Export functionality

### State Management
Using Zustand for state management:
```javascript
import { create } from 'zustand';

const useStore = create((set) => ({
  presentations: [],
  currentPresentation: null,
  setPresentations: (presentations) => set({ presentations }),
  setCurrentPresentation: (presentation) => set({ currentPresentation: presentation }),
}));
```

## Architecture

### Frontend
- React 18
- Zustand for state management
- React Router for routing
- Tailwind CSS for styling

### Backend
- Node.js
- Express
- MongoDB
- Socket.IO for real-time features

### AI Integration
- OpenAI API for content generation
- Custom ML models for content analysis

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in CI environment
npm run test:ci
```

### Test Structure
- Unit tests for components
- Integration tests for features
- E2E tests for critical paths
- API tests for endpoints

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Steps
1. Build the application
2. Configure environment variables
3. Set up CI/CD pipeline
4. Deploy to hosting platform

### Monitoring
- Error tracking
- Performance monitoring
- User analytics
- Server health checks 