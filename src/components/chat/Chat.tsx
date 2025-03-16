"use client";

import { useState, useRef } from "react";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [recording, setRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        setAudioBase64(reader.result as string);
      };
      audioChunksRef.current = [];
    };

    mediaRecorder.start();
  };

  // Stop recording
  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
    console.log(audioBase64);
    sendMessage();
  };

  // Send text and/or audio to API
  const sendMessage = async () => {
    if (!textInput && !audioBase64) return;

    const userMessage = textInput || "🎤 Voice message";
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textInput, audio: audioBase64, messages }),
    });

    setTextInput("");
    setAudioBase64(null);

    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiResponse += decoder.decode(value);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: aiResponse },
        ]);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full max-w-[500px] bg-gray-900 text-white">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.role === "user" ? "bg-blue-500" : "bg-gray-700"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 flex items-center gap-3 border-t border-gray-700 w-full">
        <input
          type="text"
          placeholder="Type your answer..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-800 text-white focus:outline-none w-full"
        />

        {textInput.length === 0 ? (
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`p-3 rounded-full cursor-pointer ${
              recording ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <FaMicrophone />
          </button>
        ) : (
          <button
            onClick={sendMessage}
            className="p-3 bg-blue-600 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!textInput && !audioBase64}
          >
            <FaPaperPlane />
          </button>
        )}
      </div>
    </div>
  );
}
