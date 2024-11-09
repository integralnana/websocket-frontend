import React, { useState, useEffect, useCallback } from "react";

const WebSocketClient = () => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState(null);

  const connectWebSocket = useCallback(() => {
    try {
      const websocket = new WebSocket("wss://websocket-backend-vi0h.onrender.com");

      websocket.onopen = () => {
        console.log("WebSocket Connected");
        setStatus("connected");
        setError(null);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, data]);
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setStatus("error");
        setError("Connection failed. Retrying...");
      };

      websocket.onclose = () => {
        console.log("WebSocket Disconnected");
        setStatus("disconnected");
        setTimeout(connectWebSocket, 5000);
      };

      setWs(websocket);

      return () => {
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.close();
        }
      };
    } catch (err) {
      console.error("Connection Error:", err);
      setStatus("error");
      setError("Failed to create WebSocket connection");
      setTimeout(connectWebSocket, 5000);
    }
  }, []);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return () => {
      cleanup?.();
    };
  }, [connectWebSocket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (ws?.readyState === WebSocket.OPEN && inputMessage.trim()) {
      try {
        ws.send(
          JSON.stringify({
            message: inputMessage,
          })
        );
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "sent",
            message: inputMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
        setInputMessage("");
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
      }
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className={`mb-4 p-2 rounded ${
        status === 'connected' ? 'bg-green-100' :
        status === 'connecting' ? 'bg-yellow-100' :
        'bg-red-100'
      }`}>
        <div className="font-semibold">Status: {status}</div>
        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      </div>

      <div className="border rounded p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-2 p-2 rounded shadow ${
              msg.type === 'sent' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-white max-w-[80%]'
            }`}
          >
            <div className="text-gray-600 text-sm">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div>{msg.message}</div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={status !== 'connected' || !inputMessage.trim()}
        >
          ส่ง
        </button>
      </form>
    </div>
  );
};

export default WebSocketClient;