import React, { useEffect } from 'react';
import './css/Modal.css';
import Button from './Button';


const Modal = ({ onClose, size = 'large', children, version = 'bottom' }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'; 
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className={`modal-background ${version}`}>
      <div
        className={`modal-content ${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <Button text="확인" bgColor="#FFF076" onClick={onClose} />
      </div>
    </div>
  );
};

export default Modal;
