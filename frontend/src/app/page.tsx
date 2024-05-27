'use client';

import React, { useState, CSSProperties } from 'react';
import AvatarScene from '../components/AvatarScene';
import ChatWindow from '../components/ChatWindow';
import HamburgerMenu from '../components/HamburgerMenu';
import BookListPopup from '../components/BookListPopup';

const Home = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isBookListOpen, setIsBookListOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [isDrawerEnabled, setIsDrawerEnabled] = useState(false); // New state for drawer

  const toggleAudio = () => {
    setIsAudioEnabled(prevState => !prevState);
  };

  const handleBookListClick = () => {
    setIsBookListOpen(true);
  };

  const handleCloseBookList = () => {
    setIsBookListOpen(false);
  };

  const handleBookSelect = (book: any) => {
    console.log('Book selected:', book); // Log the book object
    setSelectedBook(book.filename || book); // Handle different structures of the book object
    setIsBookListOpen(false);
  };

  const handleStartClick = () => {
    setIsDrawerEnabled(true); // Enable drawer when the "Starten!" button is clicked
  };

  return (
    <div style={containerStyle}>
      <div style={hamburgerMenuStyle}>
        {isDrawerEnabled && (
          <HamburgerMenu isAudioEnabled={isAudioEnabled} toggleAudio={toggleAudio} onBookListClick={handleBookListClick} />
        )}
      </div>

      <div style={avatarContainerStyle}>
        <AvatarScene />
      </div>

      <div style={chatContainerStyle}>
        <ChatWindow isAudioEnabled={isAudioEnabled} selectedBook={selectedBook} onStartClick={handleStartClick} />
      </div>

      <BookListPopup open={isBookListOpen} handleClose={handleCloseBookList} onBookSelect={handleBookSelect} />
    </div>
  );
};

const containerStyle : CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  position: 'relative',
};

const avatarContainerStyle : CSSProperties = {
  flex: 6, // 60% of the screen
  borderBottom: '1px solid #ddd',
  overflow: 'hidden',
  position: 'relative',
};

const chatContainerStyle : CSSProperties = {
  flex: 4, // 40% of the screen
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // Ensure the chat window takes available space
};

const hamburgerMenuStyle : CSSProperties = {
  zIndex: 1000,
  position: 'absolute',
  top: 0,
  left: 0,
};

export default Home;
