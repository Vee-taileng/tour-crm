"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useEffect, useState } from "react";

const COLOR_THEMES = [
  { id: "orange",  label: "Orange",  swatch: "#f97316" },
  { id: "sky",     label: "Sky",     swatch: "#0ea5e9" },
  { id: "emerald", label: "Emerald", swatch: "#10b981" },
  { id: "violet",  label: "Violet",  swatch: "#8b5cf6" },
  { id: "rose",    label: "Rose",    swatch: "#f43f5e" },
] as const;

type ColorThemeId = typeof COLOR_THEMES[number]["id"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colorTheme, setColorTheme] = useState<ColorThemeId>("orange");

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("color-theme") ?? "orange") as ColorThemeId;
    setColorTheme(saved);
  }, []);

  function applyColorTheme(id: ColorThemeId) {
    setColorTheme(id);
    localStorage.setItem("color-theme", id);
    if (id === "orange") {
      document.documentElement.removeAttribute("data-color");
    } else {
      document.documentElement.setAttribute("data-color", id);
    }
  }

  if (!mounted) return <div className="h-16" />;

  const modeOptions = [
    { value: "light",  icon: Sun,     label: "Light"  },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark",   icon: Moon,    label: "Dark"   },
  ] as const;

  return (
    <div className="space-y-2">
      {/* Light / System / Dark */}
      <div className="flex items-center bg-gray-800 rounded-lg p-0.5 gap-0.5">
        {modeOptions.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            className={
              theme === value
                ? "flex-1 flex items-center justify-center py-1.5 rounded-md bg-gray-600 text-white transition-colors"
                : "flex-1 flex items-center justify-center py-1.5 rounded-md text-gray-400 hover:text-gray-200 transition-colors"
            }
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Colour swatches */}
      <div className="flex items-center justify-between px-0.5">
        {COLOR_THEMES.map(({ id, label, swatch }) => (
          <button
            key={id}
            onClick={() => applyColorTheme(id)}
            title={label}
            className="relative w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
            style={{ backgroundColor: swatch }}
          >
            {colorTheme === id && (
              <Check
                className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow"
                strokeWidth={3}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
