import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.overlay} onClick={onClose}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            style={styles.modal}
          >
            <button style={styles.closeButton} onClick={onClose}>X</button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    // minWidth: 300,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: 10, right: 10,
    background: 'transparent',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer'
  }
};

export default Modal;
