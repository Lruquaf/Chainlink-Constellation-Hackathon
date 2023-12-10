import React from "react";
import styles from "../styles/Modal.module.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: JSX.Element;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {content}
            </div>
        </div>
    );
};

export default Modal;
