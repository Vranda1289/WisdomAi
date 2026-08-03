import { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('login'); // 'login' or 'register'

  const openModal = (initialView = 'login') => {
    setView(initialView);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const switchView = (newView) => setView(newView);

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openModal, closeModal, switchView }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
