"use client";
import React, { useEffect, useRef } from "react";
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
  });

  const chatContainer = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    const { offsetHeight, scrollHeight, scrollTop } =
      chatContainer.current as HTMLDivElement;
    if (scrollHeight >= offsetHeight + scrollTop) {
      chatContainer.current?.scrollTo({
        top: scrollHeight - offsetHeight,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    scrollToTop();
  }, [messages]);

  const renderResponse = () => {
    return (
      <div ref={chatContainer}>
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages.map((message: any, index: number) => {
            return (
              <div key={message.id}>
                <p>{message.content}</p>
                {index < messages.length - 1 && <hr />}
              </div>
            );
          })
        }
      </div>
    );
  };
  return (
    <div>
      {renderResponse()}
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask a question"
            onChange={handleInputChange}
            value={input}
            disabled={status !== "ready"}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
