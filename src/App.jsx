import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

import DashboardPage from './pages/DashboardPage'
import SearchRidePage from './pages/SearchRidePage'
import CreateRidePage from './pages/CreateRidePage'
import MyRidesPage from './pages/MyRidesPage'
import RideDetailsPage from './pages/RideDetailsPage'
import AlertsPage from './pages/AlertsPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import AddVehiclePage from './pages/AddVehiclePage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes (no layout) */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes (with AppShell layout) */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/search" element={<SearchRidePage />} />
            <Route path="/create-ride" element={<CreateRidePage />} />
            <Route path="/my-rides" element={<MyRidesPage />} />
            <Route path="/ride/:id" element={<RideDetailsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/add-vehicle" element={<AddVehiclePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App