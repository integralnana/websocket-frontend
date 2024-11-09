import React, { useState, useEffect, useCallback } from "react";

const WebSocketClient = () => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [status, setStatus] = useState("connecting");

  const connectWebSocket = useCallback(() => {
    const websocket = new WebSocket(
      "https://websocket-backend-vi0h.onrender.com"
    );

    websocket.onopen = () => {
      setStatus("connected");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (ws && inputMessage.trim()) {
      ws.send(
        JSON.stringify({
          message: inputMessage,
        })
      );
      setInputMessage("");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4 p-2 bg-blue-100 rounded">status: {status}</div>

      <div className="border rounded p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 p-2 bg-white rounded shadow">
            {msg.type === "welcome" ? (
              <div className="text-green-600">{msg.message}</div>
            ) : (
              <div>
                <div className="text-gray-600 text-sm">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <div>{msg.message}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!ws || !inputMessage.trim()}
        >
          ส่ง
        </button>
      </form>
    </div>
  );
};

export default WebSocketClient;
