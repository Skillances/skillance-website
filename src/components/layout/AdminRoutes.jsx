import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UsersPage from '@/pages/admin/UsersPage'
import FreelancersPage from '@/pages/admin/FreelancersPage'
import CustomersPage from '@/pages/admin/CustomersPage'

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="freelancers" element={<FreelancersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="verifications" element={<div className="p-8"><h1>Verifications</h1><p>Coming soon...</p></div>} />
        <Route path="analytics" element={<div className="p-8"><h1>Analytics</h1><p>Coming soon...</p></div>} />
        <Route path="reports" element={<div className="p-8"><h1>Reports</h1><p>Coming soon...</p></div>} />
        <Route path="settings" element={<div className="p-8"><h1>Settings</h1><p>Coming soon...</p></div>} />
        <Route path="*" element={<div className="p-8"><h1>Not Found</h1><p>Admin page not found</p></div>} />
      </Routes>
    </AdminLayout>
  )
}

export default AdminRoutes

