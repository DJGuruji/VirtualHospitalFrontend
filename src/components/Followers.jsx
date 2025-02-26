import React, { useState, useEffect } from "react";
import axios from "../axios";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";


const Followers = () => {
  const { userId } = useParams();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await axios.get(`users/followers/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setFollowers(response.data);
      } catch (error) {
        toast.error(`Error fetching followers: ${error.message}`);
      }
    };

    fetchFollowers();
  }, [userId]);

  const toggleFollow = async (followerId) => {
    try {
      const response = await axios.post(
        `users/${followerId}/toggleFollow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        // Optionally update state or show a success message
        toast.success("Follow status updated successfully");
      }
    } catch (error) {
      toast.error(`Error toggling follow: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-800">
      <h2 className="text-xl font-semibold mb-2 dark:text-white  ">Followers</h2>
      {followers.map((follower) => (
         <Link to={`/profile/${follower._id}`}>
        <div key={follower._id} className="hover:bg-zinc-200 dark:hover:bg-slate-900 follower-item flex items-center justify-between py-2 px-4 border-b">
          <div className="flex items-center">
            {follower.photo && (
              <img
                src={follower.photo}
                alt="Follower"
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <span>
           
              <p className="dark:text-white">
              {follower.name}
              </p>
              
              </span>
            
          </div>
          {/* <button
            onClick={() => toggleFollow(follower._id)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md"
          >
            {follower.isFollowing ? "Following" : "Follow"}
          </button> */}

        </div>
        </Link>
      ))}
    </div>
  );
};

export default Followers;
