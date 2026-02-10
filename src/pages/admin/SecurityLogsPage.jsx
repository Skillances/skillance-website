import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { get } from '@/utils/api'
import SearchInput from '@/components/admin/shared/SearchInput'
import FilterDropdown from '@/components/admin/shared/FilterDropdown'
import Pagination from '@/components/admin/shared/Pagination'
import LoadingSpinner from '@/components/admin/shared/LoadingSpinner'
import EmptyState from '@/components/admin/shared/EmptyState'
import { Shield, AlertTriangle, Ban, Clock, Eye, Search, Filter, RefreshCw, Download } from 'lucide-react'

const SecurityLogsPage = () => {
  const [events, setEvents] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })

  // Filters (use 'all' for Event Type so Select.Item never has value="")
  const [ipAddress, setIpAddress] = useState('')
  const [eventType, setEventType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [orderBy, setOrderBy] = useState('createdAt')
  const [orderDirection, setOrderDirection] = useState('desc')

  // Debounced IP search
  const [debouncedIpAddress, setDebouncedIpAddress] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIpAddress(ipAddress)
      setPagination(prev => ({ ...prev, offset: 0 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [ipAddress])

  // Fetch security events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
          limit: pagination.limit.toString(),
          offset: pagination.offset.toString(),
          orderBy,
          orderDirection,
        })

        if (debouncedIpAddress) params.append('ipAddress', debouncedIpAddress)
        if (eventType && eventType !== 'all') params.append('eventType', eventType)
        if (startDate) params.append('startDate', new Date(startDate).toISOString())
        if (endDate) params.append('endDate', new Date(endDate).toISOString())

        const response = await get(`/admin/security/events?${params.toString()}`)

        if (response.success && response.data) {
          setEvents(response.data.events || [])
          setPagination(prev => ({
            ...prev,
            total: response.data.total || 0,
            hasMore: response.data.hasMore || false,
          }))
        } else {
          setError('Failed to load security events')
        }
      } catch (err) {
        console.error('Error fetching security events:', err)
        setError(err.message || 'Failed to load security events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [pagination.offset, pagination.limit, debouncedIpAddress, eventType, startDate, endDate, orderBy, orderDirection])

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoadingStats(true)
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', new Date(startDate).toISOString())
        if (endDate) params.append('endDate', new Date(endDate).toISOString())
        if (debouncedIpAddress) params.append('ipAddress', debouncedIpAddress)

        const response = await get(`/admin/security/statistics?${params.toString()}`)
        if (response.success && response.data) {
          setStatistics(response.data)
        }
      } catch (err) {
        console.error('Error fetching security statistics:', err)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchStatistics()
  }, [startDate, endDate, debouncedIpAddress])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getEventTypeBadge = (type) => {
    const variants = {
      blocked: { variant: 'default', label: 'Blocked', icon: Ban, className: 'bg-red-600 text-white' },
      rate_limited: { variant: 'default', label: 'Rate Limited', icon: Clock, className: 'bg-orange-500 text-white' },
      suspicious: { variant: 'secondary', label: 'Suspicious', icon: Eye, className: '' },
      exploit_attempt: { variant: 'default', label: 'Exploit', icon: AlertTriangle, className: 'bg-red-700 text-white' },
      honeypot: { variant: 'default', label: 'Honeypot', icon: Shield, className: 'bg-purple-600 text-white' },
      scanning_pattern: { variant: 'default', label: 'Scanning', icon: Search, className: 'bg-yellow-600 text-white' },
    }

    const config = variants[type] || { variant: 'secondary', label: type, icon: Shield, className: '' }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    )
  }

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleResetFilters = () => {
    setIpAddress('')
    setEventType('all')
    setStartDate('')
    setEndDate('')
    setOrderBy('createdAt')
    setOrderDirection('desc')
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  const hasActiveFilters = ipAddress || (eventType && eventType !== 'all') || startDate || endDate || orderBy !== 'createdAt' || orderDirection !== 'desc'

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
          Security Audit Logs
        </h1>
        <p className="text-lg text-text-secondary">
          Monitor and analyze security events, blocked IPs, and attack patterns
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Total Events</p>
                  <p className="text-2xl font-bold">{statistics.totalEvents?.toLocaleString() || 0}</p>
                </div>
                <Shield className="w-8 h-8 text-text-tertiary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Blocked</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.blockedCount?.toLocaleString() || 0}</p>
                </div>
                <Ban className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Exploit Attempts</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.exploitAttempts?.toLocaleString() || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Unique IPs</p>
                  <p className="text-2xl font-bold">{statistics.uniqueIPs?.toLocaleString() || 0}</p>
                </div>
                <Eye className="w-8 h-8 text-text-tertiary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              value={ipAddress}
              onChange={setIpAddress}
              placeholder="Search by IP address..."
              className="lg:col-span-2"
            />
            <FilterDropdown
              label="Event Type"
              value={eventType}
              onChange={setEventType}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'blocked', label: 'Blocked' },
                { value: 'rate_limited', label: 'Rate Limited' },
                { value: 'suspicious', label: 'Suspicious' },
                { value: 'exploit_attempt', label: 'Exploit Attempt' },
                { value: 'honeypot', label: 'Honeypot' },
                { value: 'scanning_pattern', label: 'Scanning Pattern' },
              ]}
            />
            <FilterDropdown
              label="Sort By"
              value={orderBy}
              onChange={setOrderBy}
              options={[
                { value: 'createdAt', label: 'Date' },
                { value: 'ipAddress', label: 'IP Address' },
                { value: 'eventType', label: 'Event Type' },
              ]}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <FilterDropdown
              label="Order"
              value={orderDirection}
              onChange={setOrderDirection}
              options={[
                { value: 'desc', label: 'Newest First' },
                { value: 'asc', label: 'Oldest First' },
              ]}
            />
            <div className="flex items-end gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
              Security Events
            </CardTitle>
            <div className="text-sm text-text-secondary">
              Showing {events.length} of {pagination.total.toLocaleString()} events
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No security events found"
              description="No security events match your current filters."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">IP Address</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Event Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Path</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Method</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Reason</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm">
                          {formatDate(event.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">
                          <button
                            onClick={() => {
                              setIpAddress(event.ipAddress)
                              setPagination(prev => ({ ...prev, offset: 0 }))
                            }}
                            className="text-primary hover:underline"
                          >
                            {event.ipAddress}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          {getEventTypeBadge(event.eventType)}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-text-secondary">
                          {event.path}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline">{event.method}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">
                          {event.reason}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {event.action && (
                            <Badge variant="secondary">{event.action}</Badge>
                          )}
                          {event.blockDuration && (
                            <span className="text-xs text-text-tertiary ml-2">
                              ({Math.round(event.blockDuration / 60)}m)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => handlePageChange((page - 1) * pagination.limit)}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SecurityLogsPage
