import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color: string;
  data?: { value: number }[];
  prefix?: string;
  index?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
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

  const chartData =
    data.length > 0
      ? data
      : Array.from({ length: 15 }, (_, i) => ({
          value: isPositive
            ? 100 + i * 2 + Math.random() * 5
            : isNegative
              ? 100 - i * 2 + Math.random() * 5
              : 100 + Math.random() * 10,
        }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-neutral-800 bg-neutral-900/50 backdrop-blur-xl group relative">
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150"
          style={{ backgroundColor: color }}
        />

        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:rotate-6 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                boxShadow: `0 8px 16px -4px ${color}33`,
              }}
            >
              <Icon size={24} />
            </div>

            {change && (
              <div
                className={cn(
                  "flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-colors",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : isNegative
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                )}
              >
                {isPositive && <ArrowUpRight size={12} className="mr-1" />}
                {isNegative && <ArrowDownRight size={12} className="mr-1" />}
                {isNeutral && <Minus size={12} className="mr-1" />}
                {change}
              </div>
            )}
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-xs font-medium text-neutral-500 tracking-widest uppercase">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white tracking-tight">
                {prefix}{value}
              </span>
            </div>
          </div>

          <div className="h-14 mt-6 -mx-6 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.5} />
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

import { cn } from "@/lib/utils";
