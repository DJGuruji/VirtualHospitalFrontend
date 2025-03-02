import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  getVideoPosts,
  deleteVideoPost,
  likevideo,
  addComment,
  getComments,
  deleteComment,
} from "../services/VideoPostService";
import { useAuthStore } from "../store/authStore";

import { MdDelete } from "react-icons/md";
import { FaHeart, FaRegHeart, FaComment, FaTimes } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

const VideoPostList = () => {
  const { user } = useAuthStore();
  const [videoPosts, setVideoPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showMore, setShowMore] = useState({});
  const activeVideoRef = useRef(null);

  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showCommentPopup, setShowCommentPopup] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!hasMore) return; // Stop fetching if no more videos

      try {
        setLoading(true);
        const data = await getVideoPosts(user?.id, page);

        if (data.length === 0) {
          setHasMore(false);
        } else {
          setVideoPosts((prevVideos) => {
            const existingIds = new Set(prevVideos.map((vid) => vid._id));
            const newUniqueVideos = data.filter(
              (vid) => !existingIds.has(vid._id)
            );
            return [...prevVideos, ...newUniqueVideos];
          });
        }

        setLoading(false);
      } catch (error) {
        toast.error("Error fetching videos");
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        if (!loading) setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const handleToggle = (id) => {
    setShowMore((prevState) => ({ ...prevState, [id]: !prevState[id] }));
  };

  const handlePlay = (event) => {
    if (activeVideoRef.current && activeVideoRef.current !== event.target) {
      activeVideoRef.current.pause(); // Pause the currently playing video
    }
    activeVideoRef.current = event.target; // Set the new active video
  };

  const deletePostHandler = async (videoPostId) => {
    if (window.confirm("Are you sure you want to delete this Post?")) {
      try {
        const token = localStorage.getItem("token");
        await deleteVideoPost(videoPostId, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideoPosts(videoPosts.filter((post) => post._id !== videoPostId));
        toast.success("Post Deleted");
      } catch (error) {
        toast.error("Post Deletion Failed");
      }
    }
  };

  const handleLike = async (videoId) => {
    try {
      const response = await likevideo(videoId);
      setVideoPosts((prevVideos) =>
        prevVideos.map((video) =>
          video._id === videoId
            ? {
                ...video,
                likesCount: response.likesCount,
                likedBy: response.likedBy.includes(user._id)
                ? response.likedBy
                : [...response.likedBy, user._id], // Update likedBy list properly
            }
            : video
        )
      );
    } catch (error) {
      toast.error("Error liking post");
    }
  };

  const handleComment = async (videoId) => {
    if (!newComment[videoId]?.trim()) return;

    try {
      const updatedComments = await addComment(videoId, newComment[videoId]);
      setComments((prevComments) => ({
        ...prevComments,
        [videoId]: updatedComments,
      }));
      setNewComment((prev) => ({ ...prev, [videoId]: "" }));
    } catch (error) {
      toast.error("Error adding comment");
    }
  };

  const handleDeleteComment = async (videoId, commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prevComments) => ({
        ...prevComments,
        [videoId]: prevComments[videoId].filter(
          (comment) => comment._id !== commentId
        ),
      }));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  const fetchComments = async (videoId) => {
    setLoadingComments(true);
    try {
      const data = await getComments(videoId);
      setComments((prev) => ({ ...prev, [videoId]: data }));
    } catch (error) {
      toast.error("Error fetching comments");
    } finally {
      setLoadingComments(false);
    }
  };

  return (
    <div className="dark:bg-slate-900 p-4 min-h-screen">
      {videoPosts.map((post) => {
        const {
          _id,
          user: videoPostUser,
          postName,
          video,
          description,
          likesCount,
          likedBy,
        } = post;
        const postLink = videoPostUser ? `/profile/${videoPostUser._id}` : "#";
        const shortDescription =
          description.length > 100
            ? `${description.substring(0, 100)}...`
            : description;
            const isLiked = post.likes.some((like) => like._id === user.id);

        const isAdmin = user && user.role === "admin";

        return (
          <div
            key={_id}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-md md:flex md:flex-row mb-6 "
          >
            <div className="w-full md:w-1/2 md:h-1/2 md:flex-shrink-0">
              <p className="text-gray-600 p-2 ml-5">
                {videoPostUser ? (
                  <Link
                    to={postLink}
                    className="text-blue-600 dark:text-blue-400  hover:underline text-lg flex items-center gap-2"
                  >
                    {videoPostUser.photo ? (
                      <img
                        src={videoPostUser.photo}
                        alt="photo"
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <CgProfile className="m-1 w-10 h-10 rounded-full bg-gray-700 text-gray-400 dark:text-gray-100 " />
                    )}
                    <p>{videoPostUser.name}</p>
                  </Link>
                ) : (
                  "Unknown User"
                )}
              </p>
              <h2 className="text-xl font-bold mb-2 text-center dark:text-white">
                {postName}
              </h2>
              <div className="relative w-full h-96 pb-10 md:pl-10 z-10">
                <video
                  className="w-full h-full object-cover"
                  controls
                  controlsList="nodownload"
                  src={video}
                  onPlay={handlePlay}
                />
                {/* Like & Comment Buttons at Bottom of Image */}
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => handleLike(_id)}
                    className="flex items-center gap-1 ext-xl "
                  >
                    {isLiked ? (
                      <FaHeart className="text-red-500 text-2xl " />
                    ) : (
                      <FaRegHeart className="dark:text-white text-2xl" />
                    )}
                    <span className="dark:text-white text-2xl">{likesCount || 0}</span>
                  </button>
                  <button
                    onClick={() => {
                      fetchComments(_id);
                      setShowCommentPopup(_id);
                    }}
                    className="flex items-center gap-1"
                  >
                    <FaComment className="text-gray-500 dark:text-white text-2xl" />
                  </button>
                  {isAdmin && (
                    <button onClick={() => deletePostHandler(_id)} className="">
                      <MdDelete className="hover:text-red-600 text-2xl  text-red-500 "></MdDelete>
                    </button>
                  )}
                </div>
              </div>
              {/* Comment Pop-up */}
              {showCommentPopup === _id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-500 p-4 rounded-lg w-full md:w-3/4 shadow-lg">

                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold dark:text-white">
                        Comments
                      </h3>
                      <button
                        onClick={() => setShowCommentPopup(null)}
                        className="text-white bg-red-500 rounded-full p-1 hover:text-gray-700"
                      >
                        <FaTimes size={20} />
                      </button>
                    </div>
                    {loadingComments ? (
                      <div className="flex justify-center items-center ">
                        <div
                          className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-3 max-h-60 overflow-y-auto">
                          {comments[_id]?.map((comment) => {
                            const commentLink = comment.user
                              ? `/profile/${comment.user._id}`
                              : "#";
                            return (
                              <div
                                key={comment._id}
                                className="bg-gray-200 p-2 rounded-md mt-2"
                              >
                                {/* Displaying the commenter's profile picture */}
                                <div className="flex items-center gap-2">
                                  {comment.user?.photo ? (
                                    <img
                                      src={comment.user.photo}
                                      alt={comment.user?.name}
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <CgProfile className="w-8 h-8 text-gray-500" />
                                  )}

                                  {/* Displaying the commenter's name */}
                                  <Link
                                    to={commentLink}
                                    className="text-blue-600 dark:text-blue-400 hover:underline text-lg"
                                  >
                                    
                                    <p>{comment.user.role === "doctor" ? `Dr. ${comment.user.name}` : comment.user.name || "VMA User"}</p>
                                  </Link>
                                </div>

                                {/* Comment text */}
                                <div className="flex justify-between items-center">
                                  <p className="mt-1 text-black">
                                    {comment.text}
                                  </p>

                                  {/* Delete button (only for the comment owner) */}
                                  {comment.user?._id === user._id && (
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(_id, comment._id)
                                      }
                                      className="text-red-500 z-50 hover:text-red-700 text-2xl mt-1"
                                    >
                                      <MdDelete></MdDelete>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment[_id] || ""}
                            onChange={(e) =>
                              setNewComment((prev) => ({
                                ...prev,
                                [_id]: e.target.value,
                              }))
                            }
                            className="border p-2 rounded-md w-full"
                          />
                          <button
                            onClick={() => handleComment(_id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-md"
                          >
                            Comment
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 md:w-1/2">
              <p className="text-gray-700 mb-2 md:mt-24 lg:mt-24 xl:mt-24 text-justify dark:text-gray-100">
                {showMore[_id] ? description : shortDescription}
              </p>
              <button
                className="text-blue-600 underline p-3"
                onClick={() => handleToggle(_id)}
              >
                {showMore[_id] ? "Read Less" : "Read More"}
              </button>
              {user &&
                (user.role === "admin" ||
                  (videoPostUser && user._id === videoPostUser._id)) && (
                  <button onClick={() => deletePostHandler(_id)} className="">
                    <MdDelete className="hover:text-red-600 text-2xl  text-red-500 "></MdDelete>
                  </button>
                )}
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="min-h-screen flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && (
        <p className="text-center text-gray-500 mt-4">No more videos</p>
      )}
    </div>
  );
};

export default VideoPostList;
