import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getPosts,
  deletePost,
  likePost,
  addComment,
  getComments,
  deleteComment,
} from "../services/PostService";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

import { FaHeart, FaRegHeart, FaComment, FaTimes } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
const Home = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showMore, setShowMore] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showCommentPopup, setShowCommentPopup] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);

  const observer = useRef();

  const lastPostRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts(user?.id, page || 0);
        if (data.length === 0) setHasMore(false);

        setPosts((prevPosts) => {
          const existingIds = new Set(prevPosts.map((post) => post._id));
          const newUniquePosts = data.filter(
            (post) => !existingIds.has(post._id)
          );
          return [...prevPosts, ...newUniquePosts];
        });

        setLoading(false);
      } catch (error) {
        toast.error("Error fetching posts");
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const handleLike = async (postId) => {
    try {
      const response = await likePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likesCount: response.likesCount, // Ensure this is correct
                likedBy: response.likedBy.includes(user._id)
                  ? response.likedBy
                  : [...response.likedBy, user._id], // Update likedBy list properly
              }
            : post
        )
      );
    } catch (error) {
      toast.error("Error liking post");
    }
  };

  const handleComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;

    try {
      const updatedComments = await addComment(postId, newComment[postId]);
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: updatedComments,
      }));
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      toast.error("Error adding comment");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: prevComments[postId].filter(
          (comment) => comment._id !== commentId
        ),
      }));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  const fetchComments = async (postId) => {
    setLoadingComments(true);
    try {
      const data = await getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch (error) {
      toast.error("Error fetching comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const deletePostHandler = async (postId) => {
    if (window.confirm("Are you sure you want to delete this Post?")) {
      try {
        const token = localStorage.getItem("token");
        await deletePost(postId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );

        toast.success("Post Deleted");
      } catch (error) {
        toast.error("Post Deletion Failed");
      }
    }
  };

  const handleToggle = (id) => {
    setShowMore((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <div className="min-h-screen mx-auto p-4 dark:bg-slate-900">
      {posts.map((post, index) => {
        const {
          _id,
          user: postUser,
          postName,
          postImage,
          postDescription,
          likesCount,
          likedBy,
        } = post;
        const postLink = postUser ? `/profile/${postUser._id}` : "#";

        const showMoreText = showMore[_id] ? "Read Less" : "Read More";
        const description = showMore[_id]
          ? postDescription
          : `${postDescription.substring(0, 100)}...`;
     
          const isLiked = post.likes.some((like) => like._id === user.id);


        const isAdmin = user && user.role === "admin";

        return (
          <div
            ref={index === posts.length - 1 ? lastPostRef : null}
            className="bg-white dark:bg-slate-800 rounded-lg  mb-6 p-4 pb-10"
            key={_id}
          >
            {postUser ? (
              <p className="text-gray-600">
                <Link
                  to={postLink}
                  className="text-blue-600 dark:text-blue-400  hover:underline text-lg flex items-center gap-2"
                >
                  {postUser.photo ? (
                    <img
                      src={postUser.photo}
                      alt="photo"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <CgProfile className="m-1 w-10 h-10 rounded-full bg-gray-700 text-gray-400 dark:text-gray-100 " />
                  )}
                  <p>
                    {postUser.role === "doctor"
                      ? `Dr. ${postUser.name}`
                      : postUser.name}
                  </p>
                </Link>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-200 ">VMAS User</p>
            )}

            {/* Image and Description Layout */}
            <div className="md:flex md:gap-6">
              {/* Image Section */}
              <div className="md:w-1/2">
                <img
                  className="w-full h-full object-cover rounded-md"
                  src={postImage}
                  alt={postName}
                  onDoubleClick={() => handleLike(_id)} 
                />
                {/* Like & Comment Buttons at Bottom of Image */}
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => handleLike(_id)}
                    className="flex items-center gap-1 text-xl"
                  >
                    {isLiked ? (
                      <FaHeart className="text-red-500 text-2xl" />
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

              {/* Description Section */}
              <div className="md:w-1/2">
                <h2 className="text-xl font-bold mb-2 dark:text-white ">
                  {postName}
                </h2>
                <p className="text-gray-700 mt-2 dark:text-gray-100 ">
                  {description}
                </p>
                <button
                  className="text-blue-600 underline p-3"
                  onClick={() => handleToggle(_id)}
                >
                  {showMoreText}
                </button>

                {/* Comment Pop-up */}
                {showCommentPopup === _id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                                      <p className="text-sm font-semibold text-blue-700">
                                        {comment.user?.name || "Unknown User"}
                                      </p>
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
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
