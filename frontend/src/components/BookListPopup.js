import React, { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const BookListPopup = ({ open, handleClose, onBookSelect }) => {
  const [books, setBooks] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [bookName, setBookName] = useState('');

  useEffect(() => {
    if (open) {
      fetchBooks();
    }
  }, [open]);

  const fetchBooks = () => {
    fetch('http://localhost:8000/receive-books')
      .then(response => response.json())
      .then(data => {
        setBooks(data.books);
      })
      .catch(error => console.error('Error fetching books:', error));
  };

  const handleSelect = (book) => {
    console.log('Selected book:', book); // Log the book object
    onBookSelect(book);
  };

  const handleScanBook = () => {
    setScanning(true);
  };

  const handleFinish = () => {
    fetch('http://localhost:8000/scan-book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: bookName }),
    })
    .then(response => {
      if (response.ok) {
        // handle success
        console.log('Book scanned successfully');
        setScanning(false);
        setBookName('');
        fetchBooks(); // Update book list after adding a new book
      } else {
        // handle error
        console.error('Error scanning book');
      }
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box style={modalStyle}>
        <h1 style={headingStyle}><u>Bilbiothek</u></h1>
        {books.length === 0 ? (
          <p>Loading...</p>
        ) : (
          <ul style={listStyle}>
            {books.map((book, index) => (
              <li key={index} style={listItemStyle} onClick={() => handleSelect(book)}>
                {book.replace('.pdf', '')}
              </li>
            ))}
          </ul>
        )}
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: 'white',
  padding: '20px',
  boxShadow: 24,
  borderRadius: '8px',
};

const headingStyle = {
  textAlign: 'center',
  marginBottom: '20px',
};

const listStyle = {
  padding: 0,
  listStyleType: 'none',
  marginBottom: '20px',
  maxHeight: '200px',
  overflowY: 'auto',
  border: '1px solid #ddd',
  borderRadius: '4px',
};

const listItemStyle = {
  color: 'grey',
  cursor: 'pointer',
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const buttonStyle = {
  display: 'block',
  margin: '0 auto 20px auto',
};

const scanSectionStyle = {
  textAlign: 'center',
};

const textFieldStyle = {
  marginBottom: '20px',
  width: '100%',
};

export default BookListPopup;
