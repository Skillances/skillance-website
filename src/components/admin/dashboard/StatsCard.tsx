import React from "react";
import { cn } from "@/lib/utils";
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
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="overflow-hidden border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 group relative rounded-2xl hover:shadow-soft dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-500">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center justify-center text-neutral-500 dark:text-neutral-400">
              <Icon size={20} strokeWidth={1.5} />
            </div>

            {change && (
              <div
                className={cn(
                  "flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase",
                  isPositive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                    : isNegative
                      ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                      : "bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                )}
              >
                {isPositive && <ArrowUpRight size={11} className="mr-0.5" />}
                {isNegative && <ArrowDownRight size={11} className="mr-0.5" />}
                {isNeutral && <Minus size={11} className="mr-0.5" />}
                {change}
              </div>
            )}
          </div>

          <div className="space-y-0.5 relative z-10">
            <p className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 tracking-[0.2em] uppercase">
              {title}
            </p>
            <span className="text-2xl font-semibold text-black dark:text-white tracking-tight tabular-nums block">
              {prefix}{value}
            </span>
          </div>

          <div className="h-12 mt-4 -mx-5 opacity-40 group-hover:opacity-70 transition-opacity duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={`url(#gradient-${title}-${index})`}
                  strokeWidth={1.5}
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
