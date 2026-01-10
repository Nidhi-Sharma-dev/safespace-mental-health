import React, { useState } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalation, setEscalation] = useState(null);
  const [lastRisk, setLastRisk] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setEscalation(null);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data.reply,
        riskLevel: data.riskLevel,
      };

      setMessages((prev) => [...prev, botMessage]);
      setLastRisk(data.riskLevel);

      if (data.escalation) {
        setEscalation(data.escalation);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleEscalate = async () => {
    await fetch("http://localhost:5000/escalate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lastMessage: messages[messages.length - 1]?.text,
        riskLevel: lastRisk,
      }),
    });

    alert("A professional will review your case. You’re not alone.");
    setEscalation(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>SafeSpace</h2>

      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#DCF8C6" : "#FFFFFF",
            }}
          >
            {msg.text}
            {msg.riskLevel && (
              <div style={styles.risk}>Risk: {msg.riskLevel}</div>
            )}
          </div>
        ))}

        {loading && <div style={styles.typing}>Bot is typing…</div>}
      </div>

      {escalation && (
        <div style={styles.escalationBox}>
          <p>
            <b>{escalation.notice}</b>
          </p>

          <div style={styles.escalationButtons}>
            <button
              style={styles.secondaryButton}
              onClick={() => setEscalation(null)}
            >
              Continue Chatting
            </button>

            <button style={styles.primaryButton} onClick={handleEscalate}>
              Talk to a Professional
            </button>
          </div>
        </div>
      )}

      <div style={styles.inputBox}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type how you’re feeling…"
        />
        <button style={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ==================== STYLES ==================== */

const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "15px",
    textAlign: "center",
    borderBottom: "1px solid #ddd",
  },
  chatBox: {
    padding: "10px",
    height: "350px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  message: {
    padding: "10px",
    margin: "5px 0",
    borderRadius: "6px",
    maxWidth: "80%",
  },
  risk: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
  },
  typing: {
    fontSize: "12px",
    fontStyle: "italic",
    color: "#777",
  },
  escalationBox: {
    background: "#FFF3CD",
    padding: "15px",
    borderTop: "1px solid #ddd",
  },
  escalationButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  primaryButton: {
    background: "#D9534F",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#6C757D",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },
  inputBox: {
    display: "flex",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    outline: "none",
  },
  sendButton: {
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
  },
};

export default Chat;
