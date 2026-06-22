import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);      // mobile menu
  const [loginOpen, setLoginOpen] = useState(false); // desktop login
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false); // mobile login
  const dropdownRef = useRef(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLoginOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-green-700 text-white fixed w-full top-0 left-0 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src="./logo.jpg" alt="School Logo" className="h-8 w-8" />
          <span className="text-xl font-bold">Moonlight College</span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#about" className="hover:text-gray-200">
            About Us
          </a>
          <a href="#facilities" className="hover:text-gray-200">
            Facilities
          </a>
          <a href="#contact" className="hover:text-gray-200">
            Contact
          </a>

          {/* Desktop Login Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLoginOpen(!loginOpen)}
              className="hover:text-gray-200 flex items-center gap-1"
            >
              Login ▾
            </button>
            {loginOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-lg shadow-lg z-20">
                <Link
                  to="/login"
                  className="block px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                  onClick={() => setLoginOpen(false)}
                >
                  Staff Login
                </Link>
                <Link
                  to="/student-login"
                  className="block px-4 py-2 hover:bg-gray-100 rounded-b-lg"
                  onClick={() => setLoginOpen(false)}
                >
                  Student Login
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            {isOpen ? (
              <span className="text-2xl">&times;</span>
            ) : (
              <span className="text-2xl">&#9776;</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-green-800 text-white px-4 py-3 space-y-2">
          <a
            href="#about"
            onClick={() => setIsOpen(false)}
            className="block hover:text-gray-200"
          >
            About Us
          </a>
          <a
            href="#facilities"
            onClick={() => setIsOpen(false)}
            className="block hover:text-gray-200"
          >
            Facilities
          </a>
          <a
            href="#contact"
            onClick={() => setIsOpen(false)}
            className="block hover:text-gray-200"
          >
            Contact
          </a>

          {/* Mobile Login Dropdown */}
          <div>
            <button
              onClick={() => setMobileLoginOpen(!mobileLoginOpen)}
              className="w-full text-left block hover:text-gray-200"
            >
              Login ▾
            </button>
            {mobileLoginOpen && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/login"
                  onClick={() => {
                    setIsOpen(false);
                    setMobileLoginOpen(false);
                  }}
                  className="block hover:text-gray-200"
                >
                  Admin Login
                </Link>
                <Link
                  to="/student-login"
                  onClick={() => {
                    setIsOpen(false);
                    setMobileLoginOpen(false);
                  }}
                  className="block hover:text-gray-200"
                >
                  Student Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
