"use client";

import { motion } from "motion/react";

/** Re-mounts on every navigation: fades the page in and staggers its cards. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial="hidden" animate="show"
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, staggerChildren: 0.05 } } }}>
      {children}
    </motion.div>
  );
}
