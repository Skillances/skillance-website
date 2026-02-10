import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { get } from '@/utils/api'
import SearchInput from '@/components/admin/shared/SearchInput'
import FilterDropdown from '@/components/admin/shared/FilterDropdown'
import Pagination from '@/components/admin/shared/Pagination'
import LoadingSpinner from '@/components/admin/shared/LoadingSpinner'
import EmptyState from '@/components/admin/shared/EmptyState'
import { Users, UserCheck, Shield, Eye, Mail, Calendar, Briefcase } from 'lucide-react'

const UsersPage = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  // Filters
  const [search, setSearch] = useState('')
  const [userType, setUserType] = useState('all')
  const [isAdmin, setIsAdmin] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to page 1 on search change
      fetchUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch on filter changes
  useEffect(() => {
    fetchUsers()
  }, [currentPage, userType, isAdmin, sortBy, sortOrder])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Construct query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
      })

      if (search) params.append('search', search)
      if (userType !== 'all') params.append('userType', userType)
      if (isAdmin !== 'all') params.append('isAdmin', isAdmin === 'true')

      // In a real scenario, this endpoint would accept these params
      // For now, we fetch all and filter client side if backend doesn't support it fully
      // But based on API specs, /admin/users likely supports some, or we just fetch list
      const response = await get(`/admin/users?${params.toString()}`)
      
      let filteredUsers = []
      
      if (response.success && response.data) {
        // Handle varying response structures (array or paginated object)
        const rawUsers = Array.isArray(response.data) ? response.data : (response.data.users || [])
        
        // Client-side filtering simulation if backend is basic
        filteredUsers = rawUsers.filter(user => {
            const matchesSearch = search === '' || 
                user.fullName.toLowerCase().includes(search.toLowerCase()) || 
                user.email.toLowerCase().includes(search.toLowerCase())
            
            const matchesType = userType === 'all' || 
                (userType === 'freelancer' && user.userType === 'freelancer') ||
                (userType === 'customer' && user.userType === 'customer')

            const matchesAdmin = isAdmin === 'all' || 
                (isAdmin === 'true' && user.isAdmin) ||
                (isAdmin === 'false' && !user.isAdmin)

            return matchesSearch && matchesType && matchesAdmin
        })

        // Sort
        filteredUsers.sort((a, b) => {
            const dateA = new Date(a[sortBy] || 0)
            const dateB = new Date(b[sortBy] || 0)
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
        })

        setTotalItems(filteredUsers.length)
        setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage))
        
        // Paginate client-side for now
        const startIndex = (currentPage - 1) * itemsPerPage
        setUsers(filteredUsers.slice(startIndex, startIndex + itemsPerPage))

      } else {
        // Fallback or empty
         setUsers([])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setUserType('all')
    setIsAdmin('all')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const hasActiveFilters = search || userType !== 'all' || isAdmin !== 'all'

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Users Management</h1>
        <p className="text-slate-500 mt-1">Manage all users on the platform</p>
      </div>

      {/* Filters & Search Block */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
               <SearchInput 
                 value={search} 
                 onChange={setSearch} 
                 placeholder="Search by email, name, or tag..." 
                 className="w-full"
               />
            </div>
            <div className="md:col-span-2">
               <FilterDropdown 
                 label="User Type"
                 value={userType}
                 onChange={setUserType}
                 options={[
                   { value: 'all', label: 'All Types' },
                   { value: 'customer', label: 'Customer' },
                   { value: 'freelancer', label: 'Freelancer' }
                 ]}
               />
            </div>
            <div className="md:col-span-2">
               <FilterDropdown 
                 label="Admin Status"
                 value={isAdmin}
                 onChange={setIsAdmin}
                 options={[
                   { value: 'all', label: 'All' },
                   { value: 'true', label: 'Admin' },
                   { value: 'false', label: 'Standard' }
                 ]}
               />
            </div>
             <div className="md:col-span-2">
               <FilterDropdown 
                 label="Sort By"
                 value={sortBy}
                 onChange={setSortBy}
                 options={[
                   { value: 'createdAt', label: 'Joined Date' },
                   { value: 'fullName', label: 'Name' }
                 ]}
               />
            </div>
             <div className="md:col-span-2">
               {hasActiveFilters && (
                  <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="flex justify-between items-center">
             <h3 className="font-semibold text-slate-900">Users <span className="text-slate-400 font-normal ml-1">({totalItems})</span></h3>
          </div>
        </CardHeader>
        
        {isLoading ? (
           <LoadingSpinner />
        ) : error ? (
           <div className="p-12 text-center text-red-500 bg-red-50 mx-4 my-4 rounded-lg">{error}</div>
        ) : users.length === 0 ? (
           <EmptyState message="No users match your criteria." />
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                 <tr>
                   <th className="px-6 py-4">User</th>
                   <th className="px-6 py-4">Email</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Type</th>
                   <th className="px-6 py-4">Joined</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {users.map((user) => (
                   <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm
                             ${user.isAdmin ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}
                           `}>
                              {user.profilePhotoUrl ? (
                                <img src={user.profilePhotoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                              ) : (
                                user.fullName.charAt(0)
                              )}
                           </div>
                           <div>
                              <p className="font-semibold text-slate-900">{user.fullName}</p>
                              <p className="text-xs text-slate-400">{user.phoneNumber || 'No phone'}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                           <Mail size={14} className="text-slate-300" />
                           {user.email}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                         {user.isAdmin ? (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-2 shadow-none">Admin</Badge>
                         ) : (
                            <Badge variant="outline" className="text-slate-500 border-slate-200 font-normal">User</Badge>
                         )}
                     </td>
                     <td className="px-6 py-4">
                        <Badge 
                          className={`border-none shadow-none px-2.5 py-0.5
                            ${user.userType === 'freelancer' 
                              ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                          `}
                        >
                           {user.userType === 'freelancer' ? 'Freelancer' : 'Customer'}
                        </Badge>
                     </td>
                     <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-2">
                           <Calendar size={14} className="text-slate-300" />
                           {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                           <Eye size={14} className="mr-1.5" />
                           View
                        </Button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
        
        {users.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/30">
             <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
             />
          </div>
        )}
      </Card>
    </div>
  )
}

export default UsersPage

