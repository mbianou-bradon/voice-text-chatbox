import Chat from "@/components/chat/Chat";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center max-w-[800px] mx-auto overflow-hidden">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <header>
          <p>Welcome on Voice-Text Chatbox</p>
        </header>
        <Chat />
      </main>
    </div>
  );
}
