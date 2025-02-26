import React, { useState, useEffect, useCallback } from "react";
import axios from "../axios";
import { AiOutlineSearch } from "react-icons/ai";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";
import { toast } from "sonner";

const DoctorSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const fetchResults = async (searchQuery) => {
    if (searchQuery.length === 0) {
      setResults([]);
      return;
    }

    // Remove "dr", "Dr", "doctor" from the query
    const cleanedQuery = searchQuery
      .replace(/\b(dr|Dr|doctor)\b/gi, "") // Remove exact matches of "dr", "Dr", "doctor"
      .trim(); // Remove extra spaces

    if (cleanedQuery.length === 0) {
      setResults([]); // Don't search if the query is empty after cleaning
      return;
    }

    try {
      const response = await axios.get(`users/search?query=${cleanedQuery}`);
      setResults(response.data);
    } catch (error) {
      toast.error("Error searching for users:", error);
    }
  };

  const debounceFetchResults = useCallback(debounce(fetchResults, 300), []);

  useEffect(() => {
    debounceFetchResults(query);
  }, [query, debounceFetchResults]);

  const handleResultClick = () => {
    setResults([]);
  };

  return (
    <div className="relative">
      <form onSubmit={(e) => e.preventDefault()} className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for doctors or users"
          className="border dark:bg-black border-gray-300 rounded-l-md py-1 md:px-2 lg:px-2 xl:px-2 w-3/4 md:w-ful lg:w-full xl:w-full  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-blue-500 dark:bg-blue-800 py-1 px-2 text-white rounded-r-md"
        >
          <AiOutlineSearch />
        </button>
      </form>

      {results.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-300 shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((user) => (
            <li
              key={user._id}
              className="p-2  cursor-pointer text-blue-500 dark:text-gray-200 hover:underline"
            >
              <Link
                to={`/profile/${user._id}`}
                className="block"
                onClick={handleResultClick}
              >
                {user.role === "doctor"
                  ? `Dr. ${user.name} - ${user.doctorInfo.specialization}`
                  : user.name // ✅ Corrected
                }
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorSearch;
