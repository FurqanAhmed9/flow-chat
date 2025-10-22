"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center space-x-3">
      {/* Custom toggle */}
      <div
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300
          ${isDark ? "bg-blue-500" : "bg-gray-300"}
        `}
      >
        <div
          className={`w-5 h-5 bg-gray-600 rounded-full shadow-md transform transition-transform duration-300
            ${isDark ? "translate-x-5" : "translate-x-0"}
          `}
        ></div>
      </div>

      {/* Label */}
      <span className="text-sm font-medium text-foreground select-none">
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>
    </div>
  );
}
