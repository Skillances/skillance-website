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
import { Briefcase, ShieldCheck, Star, Calendar, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

const FreelancersPage = () => {
  const navigate = useNavigate()
  const [freelancers, setFreelancers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })

  // Filters
  const [city, setCity] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('all')
  const [isVerified, setIsVerified] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Debounced city search
  const [debouncedCity, setDebouncedCity] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(city)
      setPagination(prev => ({ ...prev, offset: 0 })) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [city])

  // Fetch freelancers
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
          limit: pagination.limit.toString(),
          offset: pagination.offset.toString(),
          sortBy,
          sortOrder,
        })

        if (debouncedCity) params.append('city', debouncedCity)
        if (verificationStatus !== 'all') params.append('idVerificationStatus', verificationStatus)
        if (isVerified !== '') params.append('isVerified', isVerified)
        if (minRating) params.append('minRating', minRating)

        const response = await get(`/admin/freelancers?${params.toString()}`)

        if (response.success && response.data) {
          setFreelancers(response.data.freelancers || [])
          setPagination(prev => ({
            ...prev,
            total: response.data.total || 0,
            hasMore: response.data.hasMore || false,
          }))
        } else {
          setError('Failed to load freelancers')
        }
      } catch (err) {
        console.error('Error fetching freelancers:', err)
        setError(err.message || 'Failed to load freelancers')
      } finally {
        setIsLoading(false)
      }
    }

      fetchFreelancers()
  }, [pagination.offset, pagination.limit, debouncedCity, verificationStatus, isVerified, minRating, sortBy, sortOrder])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getVerificationStatusBadge = (status) => {
    const statusConfig = {
      verified: { icon: CheckCircle, color: '#10B981', label: 'Verified' },
      pending: { icon: Clock, color: '#F59E0B', label: 'Pending' },
      rejected: { icon: XCircle, color: '#EF4444', label: 'Rejected' },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge style={{ backgroundColor: config.color, color: 'white' }}>
        <span className="flex items-center gap-1">
          <Icon size={14} />
          {config.label}
        </span>
      </Badge>
    )
  }

  const handlePageChange = (newPage) => {
    const newOffset = (newPage - 1) * pagination.limit
    setPagination(prev => ({ ...prev, offset: newOffset }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    setCity('')
    setVerificationStatus('all')
    setIsVerified('')
    setMinRating('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  const hasActiveFilters = city || verificationStatus !== 'all' || isVerified !== '' || minRating || sortBy !== 'createdAt' || sortOrder !== 'desc'
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 
          style={{ fontFamily: 'var(--font-family-poppins)' }} 
          className="text-3xl font-bold mb-2"
        >
          Freelancers Management
        </h1>
        <p className="text-lg text-text-secondary">
          Manage all freelancers and their verifications
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
              value={city}
              onChange={setCity}
              placeholder="Filter by city..."
              className="lg:col-span-2"
            />
            <FilterDropdown
              label="Verification Status"
              value={verificationStatus}
              onChange={setVerificationStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'verified', label: 'Verified' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            <FilterDropdown
              label="Is Verified"
              value={isVerified}
              onChange={setIsVerified}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Verified' },
                { value: 'false', label: 'Not Verified' },
              ]}
            />
            <FilterDropdown
              label="Min Rating"
              value={minRating}
              onChange={setMinRating}
              options={[
                { value: '', label: 'Any Rating' },
                { value: '4', label: '4+ Stars' },
                { value: '3', label: '3+ Stars' },
                { value: '2', label: '2+ Stars' },
                { value: '1', label: '1+ Stars' },
              ]}
            />
            <FilterDropdown
              label="Sort By"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'createdAt', label: 'Created Date' },
                { value: 'rating', label: 'Rating' },
                { value: 'totalBookingsCompleted', label: 'Bookings' },
                { value: 'hourlyRate', label: 'Hourly Rate' },
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

      {/* Freelancers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
              Freelancers ({pagination.total})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner message="Loading freelancers..." />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : freelancers.length === 0 ? (
            <EmptyState
              title="No freelancers found"
              message={hasActiveFilters ? "Try adjusting your filters to see more results." : "No freelancers have been registered yet."}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Freelancer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Rating
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        Bookings
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
                    {freelancers.map((freelancer) => (
                      <tr key={freelancer.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {freelancer.user?.profilePhotoUrl ? (
                              <img
                                src={freelancer.user.profilePhotoUrl}
                                alt={freelancer.user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary-teal flex items-center justify-center text-white font-semibold">
                                {freelancer.user?.fullName?.charAt(0) || 'F'}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-text-primary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                                {freelancer.user?.fullName || 'Unknown'}
                              </p>
                              <p className="text-sm text-text-tertiary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                                {freelancer.user?.tag || 'No tag'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-text-primary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                            {freelancer.user?.email || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-text-primary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                              {freelancer.rating?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-text-tertiary text-sm">
                              ({freelancer.totalReviews || 0})
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-text-primary" style={{ fontFamily: 'var(--font-family-inter)' }}>
                            {freelancer.totalBookingsCompleted || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {getVerificationStatusBadge(freelancer.idVerificationStatus)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-text-tertiary">
                            <Calendar size={14} />
                            <span style={{ fontFamily: 'var(--font-family-inter)' }}>
                              {formatDate(freelancer.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/freelancers/${freelancer.id}`)}
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
                currentPage={currentPage}
                totalPages={totalPages}
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

export default FreelancersPage

