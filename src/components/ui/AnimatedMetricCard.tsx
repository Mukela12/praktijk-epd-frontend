import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedMetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const AnimatedMetricCard: React.FC<AnimatedMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut" as const
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: {
        delay: 0.3,
        type: "spring" as const,
        stiffness: 200,
        damping: 15
      }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        delay: 0.4,
        duration: 0.5
      }
    }
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-pink-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600'
  };

  const iconBgClasses = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    purple: 'bg-purple-500/10',
    indigo: 'bg-indigo-500/10',
    pink: 'bg-pink-500/10',
    yellow: 'bg-yellow-500/10',
    red: 'bg-red-500/10'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600',
    pink: 'text-pink-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="relative overflow-hidden"
    >
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group h-full min-h-[160px] relative">
        {/* Background decoration */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4 flex-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
              <motion.div
                variants={valueVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                className="flex items-baseline space-x-1 flex-wrap"
              >
                <span className="text-2xl font-bold text-gray-900 break-all">{value}</span>
                {trend && (
                  <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                )}
              </motion.div>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{subtitle}</p>
              )}
            </div>
            
            <motion.div
              variants={iconVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              className={`p-3 rounded-xl ${iconBgClasses[color as keyof typeof iconBgClasses]} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
            >
              <Icon className={`w-6 h-6 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
            </motion.div>
          </div>
          
          {/* Progress bar */}
          {typeof value === 'number' && (
            <div className="mt-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isVisible ? `${Math.min(value, 100)}%` : 0 }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-full`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedMetricCard;