import { useState, useEffect } from "react";
import { Sidebar } from "./common/sidebar/Sidebar";
import { Topbar } from "./common/topbar/Topbar";
import api from "../config/axiosInstance";
import toast from "react-hot-toast";
import "./FlashCard.css";

export default function FlashCard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState("All");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/user/flashcards/get?sort=${filter === "Oldest" ? "asc" : "desc"}`);
        if (response.data.success) {
          const formattedCards = response.data.data.map(card => ({
            _id: card._id,
            category: card.topic?.title || "Study Zone",
            question: card.questionText,
            answer: card.answerText,
            rationale: card.rationale || "No rationale provided."
          }));
          setCards(formattedCards);
        }
      } catch (error) {
        console.error("Failed to fetch flashcards", error);
        toast.error("Error loading flashcards!");
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [filter]);

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent flipping the card
    try {
      const response = await api.delete(`/user/flashcards/delete/${id}`);
      if (response.data.success) {
        toast.success("Flashcard deleted!");
        setCards(prev => {
          const newCards = prev.filter(c => c._id !== id);
          if (currentCard >= newCards.length && currentCard > 0) {
            setCurrentCard(newCards.length - 1);
          } else if (newCards.length === 0) {
            setCurrentCard(0);
          }
          return newCards;
        });
        setFlipped(false); // Make sure the card resets to 'front' on delete
      }
    } catch (error) {
      toast.error("Failed to delete flashcard.");
    }
  };

  const handleNext = () => {
    setCurrentCard((p) => (p + 1) % cards.length);
    setFlipped(false);
  };

  const handlePrev = () => {
    setCurrentCard((p) => (p - 1 + cards.length) % cards.length);
    setFlipped(false);
  };

  const card = cards[currentCard] || {};

  return (
    <div className="fc-page">
      {/* ── Shared Sidebar ── */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* ── Main ── */}
      <div className="fc-main">
        {/* ── Shared Topbar ── */}
        <Topbar
          pageTitle="Flash Cards"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* ── Page Content ── */}
        <div className="fc-content">

          {/* Stats header card */}
          <div className="fc-header-card">
            <div className="fc-header-left">
              <h3 className="fc-header-title">Flash Cards</h3>
              <p className="fc-header-sub">
                Your Saved Cards: <strong>{cards.length}</strong> Total
              </p>
            </div>
            <div className="fc-header-stats">
              <div className="fc-stat">
                <span className="fc-stat-num">{cards.length}</span>
                <span className="fc-stat-label">Cards</span>
              </div>
              <div className="fc-stat-divider" />
              <div className="fc-stat">
                <span className="fc-stat-num">{currentCard + 1}</span>
                <span className="fc-stat-label">Current</span>
              </div>
              <div className="fc-stat-divider" />
              <div className="fc-stat">
                <span className="fc-stat-num">{cards.length - currentCard - 1}</span>
                <span className="fc-stat-label">Left</span>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="fc-filters">
            {["All", "Newest", "Oldest"].map((f) => (
              <button
                key={f}
                className={`fc-filter-btn${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#00A5B7' }}>Loading flashcards...</div>
          ) : cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#6d839c' }}>
              <h3 style={{ marginBottom: '1rem', color: '#072445' }}>No flashcards found.</h3>
              <p>Create some by taking a quiz in the Study Zone and clicking "Add to flash card"!</p>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="fc-progress-outer">
                <div className="fc-progress-track">
                  <div
                    className="fc-progress-fill"
                    style={{ width: `${((currentCard + 1) / cards.length) * 100}%` }}
                  />
                </div>
                <span className="fc-progress-label">
                  Card {currentCard + 1} of {cards.length}
                </span>
              </div>

              {/* ── 3-D Flip Card ── */}
              <div
                className="fc-scene"
                onClick={() => setFlipped((v) => !v)}
                title="Click to flip"
              >
                <div className={`fc-inner${flipped ? " flipped" : ""}`}>

                  {/* FRONT */}
                  <div className="fc-face fc-front">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
                      <span className="fc-badge">{card.category}</span>
                      <button
                        onClick={(e) => handleDelete(e, card._id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
                        title="Delete Flashcard"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D9534F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <p className="fc-question">{card.question}</p>
                    <p className="fc-hint">↻ Tap to reveal answer</p>
                  </div>

                  {/* BACK */}
                  <div className="fc-face fc-back">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
                      <span className="fc-badge fc-badge-back">{card.category}</span>
                      <button
                        onClick={(e) => handleDelete(e, card._id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
                        title="Delete Flashcard"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D9534F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="fc-answer-section">
                      <p className="fc-ans-label">Answer</p>
                      <p className="fc-ans-text">{card.answer}</p>
                    </div>
                    <div className="fc-rationale-section">
                      <p className="fc-rat-label">Rationale</p>
                      <p className="fc-rat-text">{card.rationale}</p>
                    </div>
                    <p className="fc-hint fc-hint-back">↻ Tap to see question</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="fc-nav">
                <button className="fc-nav-btn" onClick={handlePrev}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Prev
                </button>

                <div className="fc-dots">
                  {cards.map((_, i) => (
                    <span
                      key={i}
                      className={`fc-dot${i === currentCard ? " active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentCard(i);
                        setFlipped(false);
                      }}
                    />
                  ))}
                </div>

                <button className="fc-nav-btn" onClick={handleNext}>
                  Next
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
