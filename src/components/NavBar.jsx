import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import config from "../config";
import logo from "/vma.jpeg"
import {
  AiOutlineUser,
  AiOutlineLogin,
  AiOutlineLogout,
  AiOutlineHome,
  AiOutlineFileText,
} from "react-icons/ai";
import { HiOutlineUsers } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { BsChatSquareDots } from "react-icons/bs";
import {
  MdOutlineOndemandVideo,
  MdOutlineVideoLibrary,
  MdWorkspacePremium,
} from "react-icons/md";
import UserSearch from "./UserSearch";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Toggle functions
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);
  const toggleSubmenu = () => setSubmenuOpen(!submenuOpen);

  const handleLogoutAndToggle = () => {
    logout();
    toggleSubmenu();
    navigate("/login");
  };

  // Apply dark mode class to html element and store the preference
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Fetch user profile (for photo, etc.)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPhoto(response.data.photo || "");
      } catch (error) {
        console.log("Error fetching user profile:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 dark:text-white p-3 backdrop-blur-md border-b-2 border-blue-600 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center">
          {user && (
            <div className="relative">
              <div className="flex">
                <span className="rounded-full">
                  {photo ? (
                    <img
                      src={photo}
                      alt="User profile"
                      className="mx-auto w-11 h-11 md:w-16 md:h-16 rounded-full object-cover cursor-pointer"
                      onClick={toggleSubmenu}
                    />
                  ) : (
                    // <CgProfile
                    //   className="bg-zinc-300 dark:bg-gray-700 text-zinc-600 dark:text-white w-11 h-11 rounded-full cursor-pointer"
                    //   onClick={toggleSubmenu}
                    // />
                    <img
                    src={logo}
                      className="bg-zinc-300 text-zinc-600  w-11 h-11 rounded-full cursor-pointer"
                      onClick={toggleSubmenu}
                    />
                  )}
                </span>
                <span className="flex items-center ml-6">
                  <UserSearch />
                </span>
              </div>
              {submenuOpen && (
                <ul className="absolute mt-2 rounded-md shadow-lg bg-white dark:bg-gray-800 dark:text-white border-2 border-blue-500 left-0">
                  <li className="p-2">
                    <NavLink
                      to={`/profile/${user._id}`}
                      onClick={toggleSubmenu}
                      className="flex items-center hover:bg-zinc-200 dark:hover:bg-gray-700 p-2 rounded-xl"
                    >
                      <CgProfile className="mr-1" />
                      View Profile
                    </NavLink>
                  </li>
                  <li className="p-2">
                    <NavLink
                      to="/history"
                      onClick={toggleSubmenu}
                      className="flex items-center hover:bg-zinc-200 dark:hover:bg-gray-700 p-2 rounded-xl"
                    >
                      <CgProfile className="mr-1" />
                      Appointment History
                    </NavLink>
                  </li>
                  {user.role !== "doctor" && (
                    <li className="p-2">
                      <NavLink
                        to="/applydoc"
                        onClick={toggleSubmenu}
                        className="flex items-center hover:bg-zinc-200 dark:hover:bg-gray-700 p-2 rounded-xl"
                      >
                        <CgProfile className="mr-1" />
                        Register as doctor
                      </NavLink>
                    </li>
                  )}
                  {user.role === "doctor" && (
                    <li className="p-2">
                      <NavLink
                        to="/appointments"
                        onClick={toggleSubmenu}
                        className="flex items-center hover:bg-zinc-200 dark:hover:bg-gray-700 p-2 rounded-xl"
                      >
                        <CgProfile className="mr-1" />
                        Appointments
                      </NavLink>
                    </li>
                  )}
                  {(user.role === "admin" || user.role === "staff") && (
                    <>
                      <li className="p-2">
                        <NavLink
                          to="/allappointments"
                          onClick={toggleSubmenu}
                          className="flex items-center hover:bg-zinc-200 dark:hover:bg-gray-700 p-2 rounded-xl"
                        >
                          <CgProfile className="mr-1" />
                          All Appointments
                        </NavLink>
                      </li>
                      <li className="p-2">
                        <NavLink
                          to="/docapprove"
                          onClick={toggleSubmenu}
                          className="flex items-center hover:bg-zinc-200 dark:hover:bg-gray-700 p-2 rounded-xl"
                        >
                          <CgProfile className="mr-1" />
                          Doctors Administration
                        </NavLink>
                      </li>
                    </>
                  )}
                  <li className="p-2">
                    <NavLink
                      to="/settings"
                      onClick={toggleSubmenu}
                      className="flex items-center hover:bg-zinc-200 dark:hover:bg-gray-700 p-2 rounded-xl"
                    >
                      <IoSettingsOutline className="mr-1" />
                      Settings
                    </NavLink>
                  </li>
                  <li className="p-4">
                    <button
                      onClick={handleLogoutAndToggle}
                      className="flex items-center bg-red-500 hover:bg-red-600 text-white rounded-md p-1"
                    >
                      <AiOutlineLogout className="mr-2" /> Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Center Section */}
        <div className="hidden md:flex space-x-4">
          {!user ? (
            <>
              <li className="list-none  text-lg">
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                      : "flex items-center hover:bg-zinc-600 rounded-xl"
                  }
                >
                  <AiOutlineUser className="mr-2" /> Signup
                </NavLink>
              </li>
              <li className="list-none  text-lg">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                      : "flex items-center hover:bg-zinc-600 rounded-xl"
                  }
                >
                  <AiOutlineLogin className="mr-2" /> Login
                </NavLink>
              </li>
            </>
          ) : (
            <>
              {(user.role === "user" ||
                user.role === "admin" ||
                user.role === "staff" ||
                user.role === "doctor") && (
                <>
                  <li className="list-none text-zinc-700 dark:text-gray-200 self-center font-sans">
                    Welcome {user.role === "doctor" ? "Dr. " : ""}
                    {user.name}
                  </li>
                  <li className="list-none  self-center">
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center p-1 font-bold rounded-xl underline"
                          : "flex items-center rounded-xl"
                      }
                    >
                      <AiOutlineHome className="mr-1" /> Home
                    </NavLink>
                  </li>
                  <li className="list-none self-center">
                    <NavLink
                      to="/posts"
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center p-1 font-bold rounded-xl underline"
                          : "flex items-center rounded-xl"
                      }
                    >
                      <AiOutlineFileText className="mr-1" /> My Posts
                    </NavLink>
                  </li>
                  <li className="list-none  self-center">
                    <NavLink
                      to="/myvideo"
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center p-1 font-bold rounded-xl underline"
                          : "flex items-center rounded-xl"
                      }
                    >
                      <MdOutlineOndemandVideo className="mr-1" /> My Videos
                    </NavLink>
                  </li>
                  <li className="list-none  self-center">
                    <NavLink
                      to="/videoposts"
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center p-1 font-bold rounded-xl underline"
                          : "flex items-center rounded-xl"
                      }
                    >
                      <MdOutlineVideoLibrary className="mr-1" /> Videos
                    </NavLink>
                  </li>
                  <li className="list-none  self-center">
                    <NavLink
                      to="/addwork"
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center p-1 font-bold rounded-xl underline"
                          : "flex items-center rounded-xl"
                      }
                    >
                      <MdWorkspacePremium className="mr-1" /> Add Work
                    </NavLink>
                  </li>
                </>
              )}
              {(user.role === "admin" || user.role === "staff") && (
                <>
                  <li className="list-none  self-center">
                    <NavLink
                      to="/users"
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center p-1 font-bold rounded-xl underline"
                          : "flex items-center rounded-xl"
                      }
                    >
                      <HiOutlineUsers className="mr-1" /> Users
                    </NavLink>
                  </li>
                </>
              )}
              <li className="list-none  self-center">
                <NavLink
                  to="/ai"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center p-1 font-bold rounded-xl underline"
                      : "flex items-center rounded-xl"
                  }
                >
                  <BsChatSquareDots className="mr-1" /> AI Chat
                </NavLink>
              </li>
            </>
          )}
        </div>

        {/* Right Section: Dark Mode Toggle & Mobile Menu Button */}
        <div className="flex items-center">
          <button
            className=" p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
          <button className="md:hidden text-black mr-2" onClick={toggleDropdown}>
            <div className="w-8 h-1 bg-black dark:bg-white m-1 rounded-lg"></div>
            <div className="w-6 h-1 bg-black dark:bg-white ml-3 rounded-lg"></div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {dropdownOpen && (
        <div className="md:hidden">
          <div className="w-32 bg-white dark:bg-gray-900  absolute mt-2 rounded-md shadow-lg text-black dark:text-white right-0 border-2 border-blue-500">
            <ul className="flex flex-col space-y-2 mt-2 flex-wrap">
              {!user ? (
                <>
                  <li className="p-2">
                    <NavLink
                      to="/signup"
                      onClick={closeDropdown}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                          : "flex items-center hover:bg-zinc-600 rounded-xl"
                      }
                    >
                      <AiOutlineUser className="m-1" /> Signup
                    </NavLink>
                  </li>
                  <li className="p-2">
                    <NavLink
                      to="/login"
                      onClick={closeDropdown}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                          : "flex items-center hover:bg-zinc-600 rounded-xl"
                      }
                    >
                      <AiOutlineLogin /> Login
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  {(user.role === "user" ||
                    user.role === "admin" ||
                    user.role === "doctor" ||
                    user.role === "staff") && (
                    <>
                      <li className="p-2">
                        <NavLink
                          to="/"
                          onClick={closeDropdown}
                          className={({ isActive }) =>
                            isActive
                              ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                              : "flex items-center hover:bg-zinc-600 rounded-xl"
                          }
                        >
                          <AiOutlineHome className="m-1" /> Home
                        </NavLink>
                      </li>
                      <li className="p-2">
                        <NavLink
                          to="/posts"
                          onClick={closeDropdown}
                          className={({ isActive }) =>
                            isActive
                              ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                              : "flex items-center hover:bg-zinc-600 rounded-xl"
                          }
                        >
                          <AiOutlineFileText className="m-1" /> My Posts
                        </NavLink>
                      </li>
                      <li className="p-2">
                        <NavLink
                          to="/myvideo"
                          onClick={closeDropdown}
                          className={({ isActive }) =>
                            isActive
                              ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                              : "flex items-center hover:bg-zinc-600 rounded-xl"
                          }
                        >
                          <MdOutlineOndemandVideo className="m-1" /> My Videos
                        </NavLink>
                      </li>
                      <li className="p-2">
                        <NavLink
                          to="/videoposts"
                          onClick={closeDropdown}
                          className={({ isActive }) =>
                            isActive
                              ? "flex items-center bg-zinc-300 p-2 rounded-xl underline"
                              : "flex items-center hover:bg-zinc-600 rounded-xl"
                          }
                        >
                          <MdOutlineVideoLibrary className="m-1" /> Videos
                        </NavLink>
                      </li>
                      <li className="p-2">
                        <NavLink
                          to="/addwork"
                          onClick={closeDropdown}
                          className={({ isActive }) =>
                            isActive
                              ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                              : "flex items-center hover:bg-zinc-600 rounded-xl"
                          }
                        >
                          <MdWorkspacePremium className="m-1" /> Add Work
                        </NavLink>
                      </li>
                    </>
                  )}
                  {(user.role === "admin" || user.role === "staff") && (
                    <>
                      <li className="p-2">
                        <NavLink
                          to="/users"
                          onClick={closeDropdown}
                          className={({ isActive }) =>
                            isActive
                              ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                              : "flex items-center hover:bg-zinc-600 rounded-xl"
                          }
                        >
                          <HiOutlineUsers className="m-1" /> Users
                        </NavLink>
                      </li>
                    </>
                  )}
                  <li className="p-2">
                    <NavLink
                      to="/ai"
                      onClick={closeDropdown}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center hover:bg-zinc-600 rounded-xl underline"
                          : "flex items-center hover:bg-zinc-600 rounded-xl"
                      }
                    >
                      <BsChatSquareDots className="m-1" /> AI Chat
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
