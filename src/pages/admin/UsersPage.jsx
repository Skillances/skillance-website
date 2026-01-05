import { useState, useEffect, useMemo } from 'react'
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
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  })

  // Filters
  const [search, setSearch] = useState('')
  const [userType, setUserType] = useState('')
  const [isAdmin, setIsAdmin] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1 on search
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          sortBy,
          sortOrder,
        })

        if (debouncedSearch) params.append('search', debouncedSearch)
        if (userType) params.append('userType', userType)
        if (isAdmin !== '') params.append('isAdmin', isAdmin)

        const response = await get(`/admin/users?${params.toString()}`)

        if (response.success && response.data) {
          const usersData = response.data.users || []
          setUsers(usersData)
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination?.total || 0,
            totalPages: response.data.pagination?.totalPages || 0,
            hasMore: response.data.pagination?.hasMore || false,
          }))
        } else {
          setError('Failed to load users')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err.message || 'Failed to load users')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [pagination.page, pagination.limit, debouncedSearch, userType, isAdmin, sortBy, sortOrder])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    setSearch('')
    setUserType('')
    setIsAdmin('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = search || userType || isAdmin !== '' || sortBy !== 'createdAt' || sortOrder !== 'desc'

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 
          style={{ fontFamily: 'var(--font-family-poppins)' }} 
          className="text-3xl font-bold mb-2"
        >
          Users Management
        </h1>
        <p className="text-lg text-text-secondary">
          Manage all users on the platform
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by email, name, or tag..."
              className="lg:col-span-2"
            />
            <FilterDropdown
              label="User Type"
              value={userType}
              onChange={setUserType}
              options={[
                { value: '', label: 'All Types' },
                { value: 'customer', label: 'Customer' },
                { value: 'freelancer', label: 'Freelancer' },
              ]}
            />
            <FilterDropdown
              label="Admin Status"
              value={isAdmin}
              onChange={setIsAdmin}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Admin' },
                { value: 'false', label: 'Not Admin' },
              ]}
            />
            <FilterDropdown
              label="Sort By"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'createdAt', label: 'Created Date' },
                { value: 'email', label: 'Email' },
                { value: 'fullName', label: 'Name' },
              ]}
            />
            <FilterDropdown
              label="Order"
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: 'desc', label: 'Descending' },
                { value: 'asc', label: 'Ascending' },
              ]}
            />
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
              Users ({pagination.total})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner message="Loading users..." />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              message={hasActiveFilters ? "Try adjusting your filters to see more results." : "No users have been registered yet."}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Tag
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Created
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {user.profilePhotoUrl ? (
                              <img
                                src={user.profilePhotoUrl}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary-teal flex items-center justify-center text-white font-semibold">
                                {user.fullName?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-text-primary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                                {user.fullName}
                              </p>
                              <p className="text-sm text-text-tertiary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                                {user.phoneNumber || 'No phone'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-text-tertiary" />
                            <span className="text-text-primary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" style={{ fontFamily: 'var(--font-family-inter)' }}>
                            {user.tag}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {(() => {
                            const isFreelancer = user.freelancer !== null && user.freelancer !== undefined && user.freelancer.id
                            return (
                              <Badge
                                style={{
                                  backgroundColor: isFreelancer ? '#14B8A6' : '#3B82F6',
                                  color: 'white',
                                }}
                              >
                                {isFreelancer ? (
                                  <span className="flex items-center gap-1">
                                    <Briefcase size={14} />
                                    Freelancer
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <UserCheck size={14} />
                                    Customer
                                  </span>
                                )}
                              </Badge>
                            )
                          })()}
                        </td>
                        <td className="py-4 px-4">
                          {user.isAdmin ? (
                            <Badge style={{ backgroundColor: '#F59E0B', color: 'white' }}>
                              <span className="flex items-center gap-1">
                                <Shield size={14} />
                                Admin
                              </span>
                            </Badge>
                          ) : (
                            <span className="text-text-tertiary">User</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-text-tertiary">
                            <Calendar size={14} />
                            <span style={{ fontFamily: 'var(--font-family-inter)' }}>
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                              <Eye size={16} className="mr-1" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersPage

