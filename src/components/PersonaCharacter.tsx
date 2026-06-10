import { motion } from 'motion/react';

interface PersonaCharacterProps {
  persona: string;
}

export const PersonaCharacter = ({ persona }: PersonaCharacterProps) => {
  // We use a mock persona image generated previously.
  // In a full implementation, we'd map `persona` to different image paths.
  const imageSrc = '/persona.png';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-8"
    >
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="w-full h-full relative z-10 drop-shadow-2xl"
      >
        <img 
          src={imageSrc} 
          alt={persona} 
          className="w-full h-full object-contain rounded-full shadow-lg border-4 border-white/10"
        />
      </motion.div>
      
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 z-0 animate-pulse"></div>
    </motion.div>
  );
};
