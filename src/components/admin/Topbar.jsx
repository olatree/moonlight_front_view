
import { Menu, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CurrentSessionTermBadge from "./CurrentSessionTermBadge";

export default function Topbar({ onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // { user: { username, role }, logout }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="h-14 bg-white shadow flex items-center justify-between px-4">
      {/* Hamburger menu for mobile */}
      <button className="md:hidden text-gray-600" onClick={onToggleSidebar}>
        <Menu size={24} />
      </button>

      {/* Username + Role */}
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-green-600">
          {user?.name || "Admin"}
        </span>
        <span className="text-xs text-gray-500 capitalize">
          {user?.role || "admin"}
        </span>
      </div>

      {/* Profile dropdown */}
      <div className="flex item-center gap-4">
        <CurrentSessionTermBadge />
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${
                user?.name || "Admin"
              }&background=4ade80&color=fff`}
              alt="profile"
              className="w-8 h-8 rounded-full"
            />
            <ChevronDown
              size={16}
              className={`transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
              <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                <User size={16} /> Profile
              </button>
              <button className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                <User size={16} /> Settings
              </button>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
