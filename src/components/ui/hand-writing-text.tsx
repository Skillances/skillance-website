"use client";

import { motion } from "framer-motion";

interface HandWrittenTitleProps {
    title?: string;
    subtitle?: string;
}

function HandWrittenTitle({
    subtitle = "Excellence in every skill",
}: HandWrittenTitleProps) {
    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] as const },
                opacity: { duration: 0.5 },
            },
        },
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto py-24 flex items-center justify-center min-h-[500px]">
            <div className="absolute inset-0">
                <motion.svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1200 600"
                    initial="hidden"
                    animate="visible"
                    className="w-full h-full"
                >
                    <motion.path
                        d="M 950 90 
                           C 1250 300, 1050 480, 600 520
                           C 250 520, 150 480, 150 300
                           C 150 120, 350 80, 600 80
                           C 850 80, 950 180, 950 180"
                        fill="none"
                        strokeWidth="2"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={draw}
                        className="opacity-20"
                    />
                    <motion.path
                        d="M 200 300 Q 600 350 1000 300"
                        fill="none"
                        strokeWidth="1"
                        stroke="black"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={draw}
                        className="opacity-30"
                    />
                </motion.svg>
            </div>
            <div className="relative text-center z-10 flex flex-col items-center justify-center">
                <motion.h1
                    className="text-8xl md:text-[9rem] text-black tracking-tight font-serif"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    Skillance
                </motion.h1>
                <motion.p
                    className="text-xs uppercase tracking-[0.4em] text-neutral-400 font-medium mt-2"
                    initial={{ opacity: 0, letterSpacing: "0.1em" }}
                    animate={{ opacity: 1, letterSpacing: "0.4em" }}
                    transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                >
                    {subtitle}
                </motion.p>
            </div>
        </div>
    );
}

export { HandWrittenTitle }