import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed top-14 left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-primary to-accent"
    />
  );
};

export default ScrollProgress;
