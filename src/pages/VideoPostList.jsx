import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getVideoPosts, deleteVideoPost } from '../services/VideoPostService';
import { useAuthStore } from '../store/authStore';

const VideoPostList = () => {
  const { user } = useAuthStore();
  const [videoPosts, setVideoPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState({});

  useEffect(() => {
    const fetchVideoPosts = async () => {
      try {
        const data = await getVideoPosts();
        setVideoPosts(data);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching videos:", error);
        setLoading(false);
      }
    };

    fetchVideoPosts();
  }, []);

  // Pause all videos except the one that is currently playing
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

  const deletePostHandler = async (videoPostId) => {
    if (window.confirm("Are you sure you want to delete this Post?")) {
      try {
        const token = localStorage.getItem("token");
        await deleteVideoPost(videoPostId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVideoPosts(videoPosts.filter((post) => post._id !== videoPostId));
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
    <div className="dark:bg-slate-900 p-4 min-h-screen ">
      {loading ? (
        <p className="text-center">Loading Videos...</p>
      ) : (
        videoPosts.map((post) => {
          const { _id, user: videoPostUser, postName, video, description } = post;
          const postLink = videoPostUser ? `/profile/${videoPostUser._id}` : "#";
          const showMoreText = showMore[_id] ? "Read Less" : "Read More";
          const shortDescription =
            description.length > 100 ? `${description.substring(0, 100)}...` : description;

          return (
            <div
              key={_id}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-md md:flex md:flex-row mb-6 border border-gray-700"
            >
              <div className="w-full md:w-1/2 md:h-1/2 md:flex-shrink-0">
                {videoPostUser ? (
                  <p className="text-gray-600 p-2 ml-5">
                    <Link to={postLink} className="text-blue-600 hover:underline text-lg">
                      {videoPostUser.name}
                    </Link>
                  </p>
                ) : (
                  <p className="text-gray-600 p-2 ml-5">Unknown User</p>
                )}
                <h2 className="text-xl font-bold mb-2 text-center dark:text-white">{postName}</h2>
                <video
                  className="w-full md:h-96 object-contain"
                  controls
                  src={video}
                  onPlay={handlePlay}
                />
              </div>
              <div className="md:w-1/2">
                <p className="text-gray-700 mb-2 md:mt-24 lg:mt-24 xl:mt-24 text-justify dark:text-gray-100">
                  {showMore[_id] ? description : shortDescription}
                </p>
                <button className="text-blue-600 underline p-3" onClick={() => handleToggle(_id)}>
                  {showMoreText}
                </button>
                {user &&
                  (user.role === 'admin' ||
                    (videoPostUser && user._id === videoPostUser._id)) && (
                    <button
                      onClick={() => deletePostHandler(_id)}
                      className="hover:bg-red-600 text-white bg-red-500 dark:bg-red-600 px-3 py-1 rounded-md border-2 border-red-700"
                    >
                      Delete Post
                    </button>
                  )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default VideoPostList;
