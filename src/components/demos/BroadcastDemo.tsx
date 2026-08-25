import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  text: string;
  at: number;
};

const CHANNEL = "playground-demo";

export default function BroadcastDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const channelRef = useRef<BroadcastChannel | null>(null);

  // 이 탭을 구분할 짧은 이름
  const [tabId] = useState(() => Math.random().toString(36).slice(2, 6));

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<Message>) => {
      setMessages((prev) => [...prev, event.data].slice(-20));
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  function send() {
    if (!text.trim()) return;

    const message: Message = {
      id: tabId,
      text: text.trim(),
      at: Date.now(),
    };

    // 다른 탭들에게 보낸다. 보낸 탭 자신은 못 받으므로 직접 넣어준다.
    channelRef.current?.postMessage(message);
    setMessages((prev) => [...prev, message].slice(-20));
    setText("");
  }

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm text-gray-500">
        이 탭의 이름: <strong>{tabId}</strong> - 같은 페이지를 새 탭에서 열고
        메시지를 보내보세요.
      </p>

      <div className="mb-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="메시지"
          className="flex-1 rounded border px-2 py-1"
        />
        <button
          onClick={send}
          className="rounded bg-black px-3 py-1 text-white"
        >
          보내기
        </button>
      </div>

      <ul className="space-y-1 text-sm">
        {messages.map((m, i) => (
          <li key={i}>
            <span
              className={
                m.id === tabId ? "font-bold text-blue-600" : "text-gray-600"
              }
            >
              [{m.id}]
            </span>{" "}
            {m.text}
          </li>
        ))}
        {messages.length === 0 && (
          <li className="text-gray-400">아직 메시지가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
