import React from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineHome } from "react-icons/ai";
import { MdOutlineVideoLibrary, MdWorkspacePremium } from "react-icons/md";
import { BsChatSquareDots } from "react-icons/bs";

const Footer = () => {
  return (
    <div className="sticky bottom-0 md:hidden dark:bg-gray-900 p-2 backdrop-blur-lg">
      <ul className="flex justify-between items-center dark:text-white flex-wrap gap-4">
        <li className="p-2">
          <NavLink to="/" className="flex items-center p-2 rounded-xl">
            {({ isActive }) => (
              <AiOutlineHome className={`text-xl ${isActive ? "text-blue-500" : ""}`} />
            )}
          </NavLink>
        </li>

        <li className="p-2">
          <NavLink to="/videoposts" className="flex items-center p-2 rounded-xl">
            {({ isActive }) => (
              <MdOutlineVideoLibrary className={`text-xl ${isActive ? "text-blue-500" : ""}`} />
            )}
          </NavLink>
        </li>

        <li className="p-2">
          <NavLink to="/addwork" className="flex items-center p-2 rounded-xl">
            {({ isActive }) => (
              <MdWorkspacePremium className={`text-xl ${isActive ? "text-blue-500" : ""}`} />
            )}
          </NavLink>
        </li>

        <li className="p-2">
          <NavLink to="/ai" className="flex items-center p-2 rounded-xl">
            {({ isActive }) => (
              <BsChatSquareDots className={`text-xl ${isActive ? "text-blue-500" : ""}`} />
            )}
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Footer;
