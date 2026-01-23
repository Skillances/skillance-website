import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  data = [],
  prefix = "",
  index = 0,
}) => {
  const isPositive = change?.startsWith("+");
  const isNegative = change?.startsWith("-");
  const isNeutral = !isPositive && !isNegative;

  // Generate mock data if none provided, based on the trend
  const chartData =
    data.length > 0
      ? data
      : Array.from({ length: 10 }, (_, i) => ({
          value: isPositive
            ? 100 + i * 5 + Math.random() * 10
            : isNegative
              ? 100 - i * 5 + Math.random() * 10
              : 100 + Math.random() * 20,
        }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm group relative">
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150"
          style={{ backgroundColor: color }}
        />

        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                boxShadow: `0 8px 16px -4px ${color}66`,
              }}
            >
              <Icon size={24} />
            </div>

            {change && (
              <div
                className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  isPositive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : isNegative
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : "bg-slate-50 text-slate-600 border-slate-100"
                }`}
              >
                {isPositive && <ArrowUpRight size={14} className="mr-1" />}
                {isNegative && <ArrowDownRight size={14} className="mr-1" />}
                {isNeutral && <Minus size={14} className="mr-1" />}
                {change}
              </div>
            )}
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-sm font-medium text-slate-500 tracking-wide uppercase">
              {title}
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {prefix}
                {value}
              </span>
            </div>
          </div>

          <div className="h-16 mt-4 -mx-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id={`gradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={`url(#gradient-${index})`}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
