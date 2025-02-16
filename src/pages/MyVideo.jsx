// components/MyVideo.jsx
import React, { useEffect, useState } from 'react';
import { getVideoPosts, deleteVideoPost } from '../services/VideoPostService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const MyVideo = () => {
  const [videoPosts, setVideoPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState({});
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchVideoPosts = async () => {
      try {
        const data = await getVideoPosts(user._id); // Fetch video posts of the logged-in user
        setVideoPosts(data);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching videos:", error);
        setLoading(false);
      }
    };

    fetchVideoPosts();
  }, [user]);

  // Pause all videos except the one that is playing
  const handlePlay = (e) => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (video !== e.target) {
        video.pause();
      }
    });
  };

  const handleToggle = (id) => {
    setShowMore((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const deletePostHandler = async (postId) => {
    if (window.confirm("Are you sure you want to delete this Post?")) {
      try {
        const token = localStorage.getItem('token');
        await deleteVideoPost(postId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVideoPosts(videoPosts.filter((post) => post._id !== postId));
        toast.success("Post Deleted");
      } catch (error) {
        toast.error("Post Deletion Failed");
        console.error("Error deleting post:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-slate-900">
        <div
          className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-4 dark:bg-slate-900 dark:text-white min-h-screen" >
      <h1 className="text-2xl font-bold mb-4">My Video Posts</h1>
      {loading ? (
        <p className="text-center">Loading Videos...</p>
      ) : videoPosts.length === 0 ? (
        <p className="text-center">You have no videos.</p>
      ) : (
        videoPosts.map((videoPost) => {
          const { _id, user: videoPostUser, postName, video, description } = videoPost;
          const showMoreText = showMore[_id] ? "Read Less" : "Read More";
          const shortDescription =
            description.length > 100 ? `${description.substring(0, 100)}...` : description;

          return (
            <div
              key={_id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md md:flex md:flex-row mb-6 border border-gray-700"
            >
              <div className="w-full md:w-1/2 md:h-auto md:flex-shrink-0">
                <p className="text-gray-600 p-2 ml-5">
                  <Link
                    to={`/profile/${videoPostUser._id}`}
                    className="text-blue-600 hover:underline text-lg"
                  >
                    {videoPostUser.name}
                  </Link>
                </p>
                <h2 className="text-xl font-bold mb-2 text-center dark:text-white">
                  {postName}
                </h2>
                <video
                  className="w-full md:h-96 object-contain"
                  controls
                  src={video}
                  onPlay={handlePlay}
                />
              </div>
              <div className="p-4 md:w-1/2">
                <p className="text-gray-700 mb-2 text-justify dark:text-gray-100">
                  {showMore[_id] ? description : shortDescription}
                </p>
                <button
                  className="text-blue-600 underline p-3"
                  onClick={() => handleToggle(_id)}
                >
                  {showMoreText}
                </button>
                <button
                  onClick={() => deletePostHandler(_id)}
                  className="hover:bg-red-600 text-white bg-red-500 px-3 py-1 rounded-md border-2 border-red-700"
                >
                  Delete Video
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyVideo;
