# Developer Guide

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git
- MongoDB
- Redis (for caching)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/your-username/presentation-ai-app.git
cd presentation-ai-app
```

2. **Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. **Environment Setup**
Create `.env` files in both root and server directories:

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

Backend (server/.env):
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/presentation-app
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

4. **Start Development Servers**
```bash
# Start frontend (from root directory)
npm start

# Start backend (from server directory)
npm run dev
```

## Project Structure

### Frontend

```
src/
  ├── components/          # React components
  │   ├── common/         # Reusable components
  │   ├── editor/         # Editor components
  │   ├── templates/      # Template components
  │   └── layout/         # Layout components
  ├── hooks/              # Custom React hooks
  ├── utils/              # Utility functions
  ├── api/                # API integration
  ├── store/              # State management
  ├── styles/             # CSS/SCSS files
  └── tests/              # Test files
```

### Backend

```
server/
  ├── src/
  │   ├── controllers/    # Route controllers
  │   ├── models/         # Database models
  │   ├── routes/         # API routes
  │   ├── services/       # Business logic
  │   ├── utils/          # Utility functions
  │   └── middleware/     # Custom middleware
  ├── tests/              # Test files
  └── config/             # Configuration files
```

## Development Guidelines

### Code Style

1. **JavaScript/TypeScript**
   - Use ESLint for linting
   - Follow Airbnb style guide
   - Use Prettier for formatting
   - Write meaningful comments

2. **React Components**
   - Use functional components
   - Implement proper prop types
   - Follow component structure
   - Use custom hooks for logic

3. **CSS/Styling**
   - Use Tailwind CSS
   - Follow BEM naming
   - Keep styles modular
   - Use CSS variables

### State Management

1. **Zustand Store**
```javascript
import { create } from 'zustand';

const useStore = create((set) => ({
  // State
  presentations: [],
  currentPresentation: null,
  loading: false,
  error: null,

  // Actions
  setPresentations: (presentations) => set({ presentations }),
  setCurrentPresentation: (presentation) => set({ currentPresentation: presentation }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
```

2. **API Integration**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPresentations = async () => {
  const response = await api.get('/presentations');
  return response.data;
};
```

### Testing

1. **Component Testing**
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component', () => {
  test('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  test('handles user interaction', async () => {
    render(<Component />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

2. **API Testing**
```javascript
import { renderHook } from '@testing-library/react-hooks';
import { useApi } from './useApi';

describe('useApi', () => {
  test('fetches data successfully', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useApi());
    await waitForNextUpdate();
    expect(result.current.data).toBeDefined();
  });
});
```

### Error Handling

1. **Frontend**
```javascript
try {
  await api.post('/presentations', data);
} catch (error) {
  if (error.response) {
    // Handle API error
    console.error(error.response.data);
  } else {
    // Handle network error
    console.error('Network error');
  }
}
```

2. **Backend**
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      code: err.code,
    },
  });
});
```

### Performance Optimization

1. **Code Splitting**
```javascript
const Component = React.lazy(() => import('./Component'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}
```

2. **Memoization**
```javascript
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### Security

1. **Authentication**
```javascript
// Frontend
const token = localStorage.getItem('token');
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Backend
const auth = require('../middleware/auth');
app.use('/api', auth);
```

2. **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/presentations', [
  body('title').trim().notEmpty(),
  body('slides').isArray(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
```

## Deployment

### Frontend Deployment

1. **Build**
```bash
npm run build
```

2. **Deploy to Hosting**
```bash
# Example for Netlify
netlify deploy --prod
```

### Backend Deployment

1. **Build**
```bash
cd server
npm run build
```

2. **Deploy to Server**
```bash
# Example for PM2
pm2 start dist/index.js
```

### CI/CD Pipeline

1. **GitHub Actions**
```yaml
name: CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy
        run: npm run deploy
```

## Contributing

1. **Fork Repository**
2. **Create Branch**
3. **Make Changes**
4. **Write Tests**
5. **Submit Pull Request**

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-username/presentation-ai-app/issues)
- Email: support@presentation-ai-app.com 