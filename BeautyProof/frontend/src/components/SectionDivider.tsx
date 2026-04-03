import { motion } from "framer-motion";

const SectionDivider = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center gap-3 py-2"
    >
      <div className="h-px flex-1 max-w-[4rem] bg-gradient-to-r from-transparent to-border" />
      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
      <div className="h-px flex-1 max-w-[4rem] bg-gradient-to-l from-transparent to-border" />
    </motion.div>
  );
};

export default SectionDivider;
