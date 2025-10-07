# Admin Panel Setup Guide

## 📦 Install Dependencies

Untuk menjalankan Admin Panel, install library berikut:

```bash
npm install recharts
```

Recharts digunakan untuk membuat bar chart pada dashboard.

## 🗂️ Files Created

### 1. Components
- `frontend/src/components/AdminLayout.jsx` - Layout wrapper dengan sidebar dan header

### 2. Pages
- `frontend/src/pages/AdminDashboard.jsx` - Dashboard dengan statistik dan grafik
- `frontend/src/pages/AdminEvents.jsx` - CRUD Event Management

### 3. Routes Added
```jsx
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/events" element={<AdminEvents />} />
```

## 🚀 Usage

### Access Admin Panel
Navigate ke:
- **Dashboard**: `http://localhost:5173/admin/dashboard`
- **Event Management**: `http://localhost:5173/admin/events`

### Features

#### 📊 Dashboard
✅ **Statistics Cards**
- Total Events
- Total Participants
- Active Events
- Revenue

✅ **Bar Charts**
- Jumlah kegiatan per bulan (Januari - Desember)
- Jumlah peserta per bulan
- Top 10 event dengan peserta terbanyak

✅ **Export Data**
- Export statistik bulanan ke CSV
- Export top events ke CSV
- Recent activity log

#### 📝 Event Management
✅ **CRUD Operations**
- ➕ Create new event
- ✏️ Edit existing event
- 🗑️ Delete event
- 📊 View event list table

✅ **Event Fields**
- Event Name
- Date
- Location
- Category (Edukasi, Hiburan, Teknologi, Olahraga, Seni Budaya)
- Participants count
- Status (Active, Upcoming, Completed)

✅ **Export**
- Export event list to CSV

## 🎨 Design Features

### Sidebar Navigation
- Dashboard
- Event Management
- Participants (placeholder)
- Collapsible sidebar
- Logout button

### Color Scheme
- Primary: Purple (#8b5cf6)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)

## 📈 Chart Library - Recharts

### Example Usage:
```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={monthlyEvents}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="events" fill="#8b5cf6" name="Jumlah Event" />
  </BarChart>
</ResponsiveContainer>
```

## 🔧 API Integration (Future)

Replace mock data dengan API calls:

```jsx
// Dashboard
useEffect(() => {
  fetch('/api/admin/statistics')
    .then(res => res.json())
    .then(data => setMonthlyEvents(data.monthly));
}, []);

// Events
useEffect(() => {
  fetch('/api/admin/events')
    .then(res => res.json())
    .then(data => setEvents(data));
}, []);
```

## 🔒 Authentication (Recommended)

Tambahkan middleware untuk protect admin routes:

```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('adminToken');
  return isAdmin ? children : <Navigate to="/admin/login" />;
};

// App.jsx
<Route path="/admin/dashboard" element={
  <ProtectedRoute>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## 📱 Responsive Design
✅ Desktop optimized
✅ Tablet compatible
✅ Mobile sidebar collapse

## ⚡ Performance
- Smooth animations (300ms transitions)
- Optimized chart rendering
- Lazy loading ready

## 🎯 Next Steps

1. Connect to backend API
2. Add authentication
3. Add more chart types
4. Implement real-time updates
5. Add participants management page
6. Add report generation
7. Add email notifications

---

**Admin Panel siap digunakan! 🎉**
