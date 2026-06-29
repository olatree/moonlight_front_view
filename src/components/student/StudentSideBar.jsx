import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  Settings,
  ChevronDown,
  Settings2,
  HomeIcon,
  NotebookTabs,
} from "lucide-react";
import { FaClipboardList, FaBook } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { FaBookOpen } from "react-icons/fa";
import { useState } from "react";

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const [teacherOpen, setTeacherOpen] = useState(false); // collapse state
  const [studentOpen, setStudentOpen] = useState(false); // collapse state

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
  className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col z-50 transform transition-transform
    ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none`}
>
  {/* Header */}
  <div className="p-4 border-b flex items-center justify-between md:justify-center flex-shrink-0">
    <h1 className="text-xl font-bold text-green-600">School Admin</h1>
    <button className="md:hidden text-gray-600" onClick={onClose}>
      ✕
    </button>
  </div>

  {/* Nav container with scroll */}
  <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
    {/* TEACHERS COLLAPSIBLE */}
      <div>
        <NavLink
              to="/student/"
              onClick={onClose}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg ${
                  isActive
                    ? "bg-white text-green-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <span className="flex items-center gap-2">
                <HomeIcon size={18} />
                Dashboard
              </span>
        </NavLink>

        <NavLink
              to="/student/result"
              onClick={onClose}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg ${
                  isActive
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <span className="flex items-center gap-2">
                <Settings size={18} />
                View Results
              </span>
        </NavLink>

        <NavLink
            to="/student/fees"
            onClick={onClose}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg ${
                isActive
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2">
              <FaBook size={16} />
              My Fees
            </span>
        </NavLink>

        <NavLink
            to="/student/lessons"
            onClick={onClose}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg ${
                isActive
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2">
              {/* <FaBook size={16} /> */}
             <NotebookTabs size={16} />
              E-Learning
            </span>
        </NavLink>

          <NavLink
            to="/student/exams"
            onClick={onClose}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg ${
                isActive
                  ? "bg-green-100 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="flex items-center gap-2">
              <FaBook size={16} />
              CBT Exams
            </span>
        </NavLink>
        
      </div>
  </nav>
</aside>

    </>
  );
}


