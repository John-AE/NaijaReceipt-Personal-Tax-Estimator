import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DisclaimerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="modal-container"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className="modal-header">
                            <div className="icon-wrapper warning">
                                <AlertTriangle size={24} />
                            </div>
                            <h3>Disclaimer</h3>
                        </div>

                        <div className="modal-content">
                            <p>
                                <strong>Note:</strong> This app provides a preliminary tax estimate under the 2025 Finance Act for informational purposes only. It serves as tool to help Nigerians learn how to reduce their tax liabilities in this new tax era. 
                            </p>
                            <p>
                                Results are not official advice. For accurate tax liability assessments, please consult a certified tax professional or the relevant tax authority.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary full-width" onClick={onClose}>
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
