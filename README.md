# VisionHub - Frontend (Vue + TypeScript)

## Project Overview

Vue 3 + TypeScript frontend for VisionHub, built with Vite. Includes:
- **Admin Portal**: User/Group management, order oversight, revenue reports
- **Sales Team Portal**: Order creation, tracking, proof uploads

## Technology Stack

- Vue 3 with Composition API
- TypeScript
- Vite (build tool)
- Vue Router (routing)
- Pinia (state management)
- Axios (HTTP client)

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn**

## Installation

```bash
cd C:\Users\walee\Documents\VisionHub\frontend
npm install
```

## Configuration

Create `.env` file in the frontend root:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** `VITE_SUPABASE_ANON_KEY` is the **public** anon key (safe to expose in frontend).

## Running the Application

### Development Mode

```bash
npm run dev
```

Application will be available at: `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable Vue components
│   ├── views/               # Page components
│   │   ├── admin/           # Admin portal pages
│   │   └── sales/           # Sales team portal pages
│   ├── router/              # Vue Router configuration
│   ├── stores/              # Pinia stores (state management)
│   ├── services/            # API service layer
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Helper functions
│   ├── App.vue              # Root component
│   └── main.ts              # App entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Features to Implement

### Admin Portal
- [ ] User Management (CRUD + password reset)
- [ ] Group Management (CRUD)
- [ ] Order List (filter by status, salesperson, date range, name)
- [ ] Add Cancellation Fee (with optional proof upload)
- [ ] Revenue Dashboard (monthly, 3/6/12 month views)
- [ ] Revenue by Salesperson

### Sales Team Portal
- [ ] Create Order (SuperDispatch validation)
- [ ] Order List (current + previous month, filter/sort)
- [ ] Upload Proof (PDF/Image)
- [ ] Change Password

### Shared
- [ ] Login Page
- [ ] JWT token management (store in localStorage, auto-refresh)
- [ ] Protected routes (role-based)
- [ ] API error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Confirmation dialogs (delete/update)

## API Integration Example

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Routing Structure

```typescript
const routes = [
  { path: '/login', component: Login },
  { 
    path: '/admin', 
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'Admin' },
    children: [
      { path: 'users', component: UserManagement },
      { path: 'groups', component: GroupManagement },
      { path: 'orders', component: AdminOrderList },
      { path: 'revenue', component: RevenueDashboard },
    ]
  },
  { 
    path: '/sales', 
    component: SalesLayout,
    meta: { requiresAuth: true, role: 'SalesPerson' },
    children: [
      { path: 'orders', component: SalesOrderList },
      { path: 'orders/create', component: CreateOrder },
      { path: 'profile', component: ChangePassword },
    ]
  },
];
```

## State Management (Pinia)

Create stores for:
- `useAuthStore`: User authentication, JWT management
- `useUserStore`: User data (Admin)
- `useGroupStore`: Group data (Admin)
- `useOrderStore`: Order data (both portals)
- `useRevenueStore`: Revenue data (Admin)

## File Upload Pattern

```typescript
async function uploadProof(orderId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  await api.post(`/api/orders/${orderId}/upload-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
```

## Deployment

### Deploy to Vercel (Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repository
4. Set environment variables:
   - `VITE_API_BASE_URL` = Your deployed API URL
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
5. Deploy

### Deploy to Netlify (Alternative)

Similar process to Vercel.

## TODO: Implementation Priority

1. **Phase 1: Core Auth & Layout**
   - Login page
   - JWT token management
   - Admin/Sales layouts with navigation
   - Protected routes

2. **Phase 2: Sales Portal**
   - Order list (current + previous month)
   - Create order (with SuperDispatch validation)
   - Upload proof
   - Change password

3. **Phase 3: Admin Portal**
   - User management (CRUD)
   - Group management (CRUD)
   - Order list (advanced filtering)
   - Add cancellation fee

4. **Phase 4: Revenue Dashboard**
   - Monthly revenue charts
   - Revenue by salesperson

## UI/UX Guidelines

- Use a modern CSS framework (Tailwind CSS, Bootstrap, or Vuetify)
- Responsive design (mobile-friendly)
- Loading spinners for async operations
- Toast notifications for success/error messages
- Confirmation dialogs before delete/destructive actions
- Form validation (client-side + server-side)
- Debounce search inputs (300-500ms)
- Disable buttons during API calls

## Development Tips

- Use TypeScript interfaces for type safety
- Create reusable components (buttons, modals, forms)
- Use Vue 3 Composition API with `<script setup>`
- Keep components small and focused
- Use Pinia for complex state management
- Test API integration with Postman/Swagger first

## Support

For issues or questions, contact the development team.
