import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Eye, MapPin, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const VerificationCard = ({ freelancer, onApprove, onReject, onView, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white group">
        <div className="relative h-32 bg-slate-100">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-100" />
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-white overflow-hidden">
               {freelancer.user.profilePhotoUrl ? (
                <img 
                  src={freelancer.user.profilePhotoUrl} 
                  alt={freelancer.user.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">
                  {freelancer.user.fullName.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
            {freelancer.hourlyRate ? `R${freelancer.hourlyRate}/hr` : 'Rate Not Set'}
          </div>
        </div>

        <CardContent className="pt-12 px-6 pb-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
              {freelancer.user.fullName}
            </h3>
            <p className="text-sm text-emerald-600 font-medium bg-emerald-50 inline-block px-2 py-0.5 rounded-md">
              {/* This would be categories joined, simplifying for now */}
              Electrician
            </p>
          </div>

          <div className="space-y-2 mb-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-400" />
              <span>{freelancer.serviceRadius || 0}km Radius</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span>Applied {format(new Date(freelancer.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-600">ID</span>
              <span>{freelancer.idNumber || 'Not provided'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
              onClick={() => onView(freelancer)}
            >
              <Eye size={16} className="mr-2" />
              Review
            </Button>
            <Button 
              className="px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
              onClick={() => onApprove(freelancer.id)}
            >
              <Check size={18} />
            </Button>
             <Button 
              className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
              onClick={() => onReject(freelancer.id)}
            >
              <X size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default VerificationCard
