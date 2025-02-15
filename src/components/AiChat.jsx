import React, { useState } from "react";
import axios from "../axios";
import { toast } from "sonner";
import { Clipboard, Check, } from "lucide-react";
import { IoMdSend } from "react-icons/io";
import { FaCaretSquareUp } from "react-icons/fa";

function AIChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [height, setHeight] = useState("auto");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setMessages((prev) => [...prev, { sender: "You", text: prompt }]);
    setPrompt("");
    setLoading(true);

    const isImageRequest = false; // Change this logic as needed based on the user's request for images

    try {
      const result = await axios.post("/users/generate-response", {
        prompt,
        isImageRequest,
      });
      if (isImageRequest) {
        setMessages((prev) => [
          ...prev,
          { sender: "AI", text: `Image: ${result.data.imageUrl}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "AI", text: result.data.message },
        ]);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        error.response?.data?.error || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPrompt(e.target.value);
    setHeight("auto");
    const scrollHeight = e.target.scrollHeight;
    if (scrollHeight <= 100) {
      setHeight(scrollHeight);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");

    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div
      className={`md:flex flex-col items-center justify-center min-h-screen dark:bg-gray-900 dark:text-white bg-gray-100 text-gray-900"
      } `}
    >
      <div
        className={`p-6 h-screen md:h-auto lg:h-auto xl:h-auto border rounded-lg shadow-md w-full max-w-xl md:max-w-3/4 lg:max-w-3/4 xl:max-w-3/4 
          dark:bg-gray-800"
        }`}
      >
        <div className="flex justify-between">
          <span className="">
            <h1 className="text-2xl font-semibold mb-2 text-blue-500 ">
               AI Chat
            </h1>
            <h5 className="text-sm text-blue-300 ">With Google Gemini</h5>
          </span>
        
        </div>

        <div
          className={`h-96 overflow-y-auto border p-3 rounded-md mt-4  dark:bg-gray-700 dark:border-gray-600 bg-gray-50 border-gray-300 "
          }`}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`relative p-2 my-2 rounded-md max-w-xs ${
                msg.sender === "You"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.sender === "AI" && (
                <button
                  onClick={() => handleCopy(msg.text, index)}
                  className="absolute top-1 right-1 p-1 text-gray-600 dark:text-gray-600 hover:text-blue-500 transition"
                >
                  {copiedIndex === index ? (
                    <Check size={16} />
                  ) : (
                    <Clipboard size={16} />
                  )}
                </button>
              )}

              <div className="whitespace-pre-line">
                <strong>{msg.sender}:</strong>
                {msg.text.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="animate-pulse p-2 my-2 rounded-md bg-gray-200 dark:bg-slate-700 text-gray-800 max-w-xs">
              ...
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="relative mt-4">
          <textarea
            type="text"
            value={prompt}
            onChange={handleChange}
            placeholder="Type a message..."
            className={`w-full p-3 pr-14 border rounded-md focus:outline-none focus:ring-2 "bark:order-gray-600 dark:bg-gray-700 text-white focus:ring-blue-400 border-gray-300 focus:ring-blue-500"
            }`}
            style={{ height }}
          />
          <button
            type="submit"
            className={`absolute right-3 bottom-2 p-3 rounded-full transition dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={loading}
          >
            {loading ? <FaCaretSquareUp /> : <IoMdSend />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIChat;
