import React, { useEffect, useState } from "react";

function isMobileUA() {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

export function ResponsiveGuard({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const tooBig = width > 768 && !isMobileUA();

  if (tooBig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm">
          <h1 className="text-2xl font-bold mb-4">🚫 גודל מסך לא נתמך</h1>
          <p className="text-gray-600">
            האפליקציה זמינה כרגע רק לשימוש במובייל.<br />
            פתחו אותה מטלפון או הקטינו את החלון.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
