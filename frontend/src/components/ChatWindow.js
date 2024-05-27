'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ClipLoader } from 'react-spinners';

const ChatWindow = ({ isAudioEnabled, selectedBook, onStartClick }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState('');
  const [showPlayButton, setShowPlayButton] = useState(true); // Correctly handle the play button state
  const chatContentRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (selectedBook) {
      setMessages((prevMessages) => [...prevMessages, { text: `Gewähltes Buch: ${selectedBook}`, sender: 'system' }]);
    }
  }, [selectedBook]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendQueryRequest = async (question, filename) => {
    const response = await fetch('http://127.0.0.1:8000/query-book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        filename: filename,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const apiMessage = { text: data.answer, sender: 'api' };
      setMessages((prevMessages) => [...prevMessages, apiMessage]);

      if (isAudioEnabled) {
        const audioResponse = await fetch('http://127.0.0.1:8000/generate-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: data.answer,
          }),
        });

        if (audioResponse.ok) {
          const audioData = await audioResponse.json();
          setAudioSrc(`http://127.0.0.1:8000${audioData.audio_file}`);
          setShowPlayButton(false); // Hide play button after clicking

          if (audioRef.current) {
            console.log("I am here")
            audioRef.current.src = `http://127.0.0.1:8000${audioData.audio_file}`;
            audioRef.current.load();
            audioRef.current.play().catch(error => console.error('Autoplay prevented:', error));
          }
        }
      }
      if (chatContentRef.current) {
        chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
      }
    } else if (response.status === 400) {
      console.error('400 error: Book not found, creating book');
      const createResponse = await fetch('http://127.0.0.1:8000/create-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filename,
        }),
      });

      if (createResponse.ok) {
        console.log('Book created, retrying query');
        await sendQueryRequest(question, filename);
      } else {
        console.error('Error creating book:', createResponse.statusText);
      }
    } else {
      console.error('Error sending message to the API:', response.statusText);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputValue.trim()) {
      const newMessage = { text: inputValue, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputValue('');

      setLoading(true);

      try {
        await sendQueryRequest(inputValue, selectedBook);
      } catch (error) {
        console.error('Error sending message to the API', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePlayButtonClick = async () => {
    onStartClick(); // Call the provided callback to enable the drawer

    const initialMessage = "Hallo, ich bin die Büchereule, es freut mich dass du da bist! Du kannst im Menü auf der linken Seite Bücher aus meiner Bibliothek auswählen oder neue Bücher einscannen. Danach können wir uns gerne über diese Bücher unterhalten.";
    const newMessage = { text: initialMessage, sender: 'api' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      const audioResponse = await fetch('http://127.0.0.1:8000/receive-intro-audio', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        setAudioSrc(`http://127.0.0.1:8000${audioData.audio_file}`);
        setShowPlayButton(false);

        if (audioRef.current) {
          audioRef.current.src = `http://127.0.0.1:8000${audioData.audio_file}`;
          audioRef.current.load();
          audioRef.current.play().catch(error => console.error('Autoplay prevented:', error));
        }
      }
    } catch (error) {
      console.error('Error fetching intro audio:', error);
    }
  };

  return (
    <div style={chatWindowStyle}>
      <h1>Chat</h1>
      <div id="chat-content" style={chatContentStyle} ref={chatContentRef}>
        {messages.map((message, index) => (
          <div key={index} style={message.sender === 'user' ? userMessageStyle : apiMessageStyle}>
            {message.text}
          </div>
        ))}
        {loading && <div style={loadingStyle}><ClipLoader color="#333" /></div>}
      </div>
      {!selectedBook ? (
        <div style={noteStyle}>Bitte wähle zuerst ein Buch aus, um den Chat zu aktivieren.</div>
      ) : (
        <form onSubmit={handleSubmit} style={chatFormStyle}>
          <input
            type="text"
            placeholder="Gib deine Frage ein ..."
            value={inputValue}
            onChange={handleInputChange}
            style={chatInputStyle}
          />
          <button type="submit" style={chatButtonStyle}>Send</button>
        </form>
      )}
      {showPlayButton && (
        <button onClick={handlePlayButtonClick} style={playButtonStyle}>
          Starten!
        </button>
      )}
      <audio ref={audioRef} /* controls */  /> {/* Hide the audio player */}
    </div>
  );
};

const chatWindowStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderLeft: '1px solid #ddd',
  padding: '10px',
  boxSizing: 'border-box',
  overflow: 'hidden',
  background: "#edf6f9",
};

const chatContentStyle = {
  flex: 1,
  overflowY: 'auto',
  marginBottom: '10px',
};

const chatFormStyle = {
  display: 'flex',
};

const chatInputStyle = {
  flex: 1,
  padding: '10px',
  boxSizing: 'border-box',
};

const chatButtonStyle = {
  padding: '10px',
};

const userMessageStyle = {
  textAlign: 'right',
  background: '#ffddd2',
  padding: '10px',
  borderRadius: '10px',
  marginBottom: '10px',
};

const apiMessageStyle = {
  textAlign: 'left',
  background: '#83c5be',
  padding: '10px',
  borderRadius: '10px',
  marginBottom: '10px',
};

const loadingStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
};

const noteStyle = {
  color: 'red',
  fontSize: '16px',
  textAlign: 'center',
  marginTop: '10px',
};

const playButtonStyle = { // Style for the play button
  padding: '10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
};

export default ChatWindow;
