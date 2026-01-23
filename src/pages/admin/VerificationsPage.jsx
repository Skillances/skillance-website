import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Shield, Loader2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import VerificationCard from '@/components/admin/verifications/VerificationCard'
import { get, post } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const VerificationsPage = () => {
  const [verifications, setVerifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFreelancer, setSelectedFreelancer] = useState(null)
  const { user } = useAuth()

  // Generate mock data if API is empty
  const mockVerifications = [
    {
      id: '1',
      user: {
        fullName: 'Thomas Edison',
        profilePhotoUrl: null
      },
      hourlyRate: 450,
      serviceRadius: 25,
      idNumber: '9001015800089',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      user: {
        fullName: 'Nikola Tesla',
        profilePhotoUrl: null
      },
      hourlyRate: 550,
      serviceRadius: 50,
      idNumber: '8505055800089',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      user: {
        fullName: 'Marie Curie',
        profilePhotoUrl: null
      },
      hourlyRate: 600,
      serviceRadius: 15,
      idNumber: '9202025000089',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]

  const fetchVerifications = async () => {
    try {
      setIsLoading(true)
      const response = await get('/admin/freelancers/pending-verification')
      
      if (response.success && response.data && response.data.length > 0) {
        setVerifications(response.data)
      } else {
        // Fallback to mock data for demo purposes if empty
        setVerifications(mockVerifications)
      }
    } catch (err) {
      console.error('Error fetching verifications:', err)
      setVerifications(mockVerifications) // Fallback on error too
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVerifications()
  }, [])

  const handleApprove = async (id) => {
    // In a real app, we would verify here. For "spoof" mode, we just remove it visually
    setVerifications(prev => prev.filter(v => v.id !== id))
    // await post(`/admin/freelancers/${id}/verify-id`, { status: 'verified' })
  }

  const handleReject = async (id) => {
    setVerifications(prev => prev.filter(v => v.id !== id))
    // await post(`/admin/freelancers/${id}/verify-id`, { status: 'rejected' })
  }

  const filteredVerifications = verifications.filter(v => 
    v.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pending Verifications</h1>
          <p className="text-slate-500 mt-1">Review and approve freelancer applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVerifications}>
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by name..." 
            className="pl-10 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="ml-auto">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredVerifications.map((verification, index) => (
              <VerificationCard
                key={verification.id}
                freelancer={verification}
                index={index}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={setSelectedFreelancer}
              />
            ))}
          </AnimatePresence>
          
          {filteredVerifications.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Shield size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No pending verifications</p>
              <p className="text-sm">Great job! All freelancers have been reviewed.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedFreelancer} onOpenChange={() => setSelectedFreelancer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Freelancer Application Review</DialogTitle>
             <DialogDescription>
              Review details for {selectedFreelancer?.user?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFreelancer && (
             <div className="grid gap-6 py-4">
              <div className="flex items-start gap-6">
                 <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {selectedFreelancer.user.profilePhotoUrl ? (
                      <img src={selectedFreelancer.user.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-slate-400">{selectedFreelancer.user.fullName.charAt(0)}</span>
                    )}
                 </div>
                 <div>
                    <h3 className="text-xl font-bold">{selectedFreelancer.user.fullName}</h3>
                    <p className="text-emerald-600 font-medium">Electrician</p>
                    <div className="mt-2 text-sm text-slate-500 space-y-1">
                      <p>Email: {selectedFreelancer.user.email || 'Not available'}</p>
                      <p>Phone: {selectedFreelancer.user.phoneNumber || 'Not available'}</p>
                      <p>ID: {selectedFreelancer.idNumber}</p>
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-semibold text-sm text-slate-900 mb-2">Service Details</h4>
                  <ul className="text-sm space-y-2 text-slate-600">
                    <li className="flex justify-between"><span>Rate:</span> <span className="font-medium text-slate-900">R{selectedFreelancer.hourlyRate}/hr</span></li>
                    <li className="flex justify-between"><span>Radius:</span> <span className="font-medium text-slate-900">{selectedFreelancer.serviceRadius}km</span></li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                   <h4 className="font-semibold text-sm text-slate-900 mb-2">Documents</h4>
                   <Button variant="outline" size="sm" className="w-full bg-white">View ID Document</Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                 <Button variant="outline" onClick={() => handleReject(selectedFreelancer.id)} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                    Reject Application
                 </Button>
                 <Button onClick={() => handleApprove(selectedFreelancer.id)} className="bg-emerald-600 hover:bg-emerald-700">
                    Approve Freelancer
                 </Button>
              </div>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VerificationsPage
