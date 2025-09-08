import { useEffect, useState } from "react";

const ANNOUNCE_KEY = "announce.hidden";

export default function AnnouncementBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHidden(localStorage.getItem(ANNOUNCE_KEY) === "1");
    }
  }, []);

  if (hidden) return null;

  return (
    <div className="bg-gray-900 text-gray-100 text-xs py-2 px-4 flex items-center justify-center relative">
      <span>Free shipping on $300+ • U.S. support • Built for labs</span>
      <button
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg px-2"
        onClick={() => {
          setHidden(true);
          if (typeof window !== "undefined") {
            localStorage.setItem(ANNOUNCE_KEY, "1");
          }
        }}
      >
        &times;
      </button>
    </div>
  );
}
