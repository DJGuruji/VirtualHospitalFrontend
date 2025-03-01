import React, { useState, useEffect } from "react";
import axios from "../axios";
import { toast } from "sonner";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getPosts } from "../services/PostService";
import config from "../config";
import Modal from "react-modal";
import { CgProfile } from "react-icons/cg";
import { FaStar } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

Modal.setAppElement("#root");

const UserProfileShow = () => {
  const { userId } = useParams();
  const { user } = useAuthStore();
  // State variables
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState(null);
  const [state, setState] = useState("");
  const [job, setJob] = useState("");
  const [role, setRole] = useState("");
  const [district, setDistrict] = useState("");
  const [office, setOffice] = useState("");
  const [officePlace, setOfficePlace] = useState("");
  const [posts, setPosts] = useState([]);
  const [showPosts, setShowPosts] = useState(false);
  const [showMore, setShowMore] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  // Review popup state and review form states
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`admin/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const userData = response.data;
        console.log(userData);
        setName(userData.name);
        setEmail(userData.email);
        setMobile(userData.mobile || "");
        setRole(userData.role);
        setState(userData.state || "");
        setJob(userData.job || "");
        setDistrict(userData.district || "");
        setOffice(userData.office || "");
        setOfficePlace(userData.officePlace || "");
        setPhoto(userData.photo || null);
        setIsFollowing(userData.followers.includes(user._id)); // Check if the logged-in user is following this profile user
        setFollowersCount(userData.followers.length);
        setFollowingCount(userData.following.length);
      } catch (error) {
        toast.error(`Error fetching user profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, user._id]);

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const postsData = await getPosts(userId);
      setPosts(postsData);
      setShowPosts(true);
    } catch (error) {
      toast.error(`Error fetching user posts: ${error.message}`);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleToggle = (id) => {
    setShowMore((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const deleteProfilePhoto = async () => {
    try {
      const response = await axios.delete("users/profilephoto/delete", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        console.log("Profile photo deleted successfully");
        toast.success("profile photo deleted");
      }
    } catch (error) {
      console.error("Error deleting profile photo", error);
      toast.error("error deleting profile photo");
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await axios.post(
        `users/follow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("followed successfully");
        console.log("User followed successfully");
        setIsFollowing(true); // Update the following status
        setFollowersCount((prevCount) => prevCount + 1); // Increment followers count
      }
    } catch (error) {
      toast.error("Error following user");
      console.error("Error following user", error);
    }
  };

  const unfollowUser = async (userId) => {
    try {
      const response = await axios.post(
        `users/unfollow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Unfollowed");
        console.log("User unfollowed successfully");
        setIsFollowing(false); // Update the following status
        setFollowersCount((prevCount) => prevCount - 1); // Decrement followers count
      }
    } catch (error) {
      console.error("Error unfollowing user", error);
      toast.error("Error Unfollowing");
    }
  };

  const openReviewPopup = async () => {
    setIsReviewPopupOpen(true);
    try {
      const res = await axios.get(`review/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReviews(res.data.reviews);
    } catch (error) {
      toast.error("Error fetching reviews");
    }
  };

  const closeReviewPopup = () => {
    setIsReviewPopupOpen(false);
    setRating(0);
    setReviewText("");
  };

  const submitReview = async () => {
    if (rating === 0 || reviewText.trim() === "") {
      toast.error("Please provide a rating and review text");
      return;
    }
    try {
      const payload = { user: userId, rating, comment: reviewText };
      const res = await axios.post(`review/`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setReviews([res.data.review, ...reviews]);
      toast.success("Review submitted successfully");
      closeReviewPopup();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`review/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== reviewId)
      );

      toast.success("Review deleted successfully");
    } catch (error) {
      toast.error("Error deleting review");
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

  if (loadingPosts) {
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
    <div className="flex justify-center items-center dark:bg-slate-900 min-h-screen">
      <div className="md:w-3/4 dark:bg-slate-800 mx-auto p-6 bg-white rounded-lg ">
        <div className="text-center">
          {photo ? (
            <>
              <img
                src={photo}
                alt="Profile"
                className="mx-auto w-24 h-24 rounded-full object-cover mb-4 cursor-pointer"
                onClick={openModal}
              />
              <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                shouldCloseOnOverlayClick={true}
                contentLabel="Enlarged Photo"
                className="flex justify-center items-center  rounded-full "
                overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
              >
                <img
                  src={photo}
                  alt="Enlarged Profile"
                  className="rounded-full"
                />
              </Modal>
            </>
          ) : (
            <CgProfile className="bg-zinc-300 text-zinc-600 w-11 h-11 mx-auto rounded-full cursor-pointer" />
          )}

          <h2 className="text-3xl font-semibold mb-2 dark:text-white">
            {role === "doctor" ? `Dr. ${name}` : name}
          </h2>

          <p className="text-gray-600 dark:text-gray-300">{job}</p>
          <div className="flex justify-center p-3">
            <Link
              to={`/following/${userId}`}
              className="cursor-pointer text-blue-500 dark:text-blue-300"
            >
              {followingCount} Following
            </Link>
            <Link
              to={`/followers/${userId}`}
              className="ml-5 cursor-pointer text-blue-500 dark:text-blue-300"
            >
              {followersCount} Followers
            </Link>
          </div>

          {user &&
            user.email !== email &&
            (!isFollowing ? (
              <button
                onClick={() => followUser(userId)}
                className="bg-blue-600 hover:bg-blue-700 p-1 rounded-md text-white m-2"
              >
                Follow
              </button>
            ) : (
              <button
                onClick={() => unfollowUser(userId)}
                className="bg-blue-600 hover:bg-blue-700 p-1 rounded-md text-white m-2"
              >
                Following
              </button>
            ))}
        </div>
        {/* grid grid-cols-1 md:grid-cols-2 gap-4 */}
        <div className=" md:flex lg:flex xl:flex  justify-center ">
          <div className="m-2">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
              Contact
            </h3>
            <p className="text-gray-600 mt-5 dark:text-gray-200">
              <strong>Email:</strong> {email}
            </p>
            {mobile && (
              <p className="text-gray-600 mt-2 dark:text-gray-200">
                <strong>Mobile:</strong> {mobile}
              </p>
            )}
          </div>
          <div className="m-2">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
              Location
            </h3>
            <p className="text-gray-600 mt-5 dark:text-gray-200">
              <strong>State:</strong> {state}
            </p>
            <p className="text-gray-600 mt-2 dark:text-gray-200">
              <strong>District:</strong> {district}
            </p>
          </div>
          <div className="m-2">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
              Office
            </h3>
            <p className="text-gray-600 mt-5 dark:text-gray-200">
              <strong>Office Name:</strong> {office}
            </p>
            <p className="text-gray-600 mt-2 dark:text-gray-200">
              <strong>Office Place:</strong> {officePlace}
            </p>
          </div>
        </div>
        <div className="flex justify-center flex-wrap">
          {user && user.email === email && (
            <>
              <button className="hover:shadow-xl bg-blue-700 hover:bg-blue-800 text-white py-1 px-2 rounded-md hover:rounded-xl mt-5">
                <Link to="/profile">Update profile</Link>
              </button>
              <button
                className="hover:shadow-xl ml-3 bg-blue-700 hover:bg-blue-800 text-white py-1 px-2 rounded-md hover:rounded-xl mt-5"
                onClick={deleteProfilePhoto}
              >
                Remove Profile Picture
              </button>
            </>
          )}
          {user && role === "doctor" && user.email !== email && (
            <button className="hover:shadow-xl bg-blue-700 hover:bg-blue-800 text-white py-1 px-2 rounded-md hover:rounded-xl mt-5">
              <Link to={`/book/${userId}`}>Book an Appointment</Link>
            </button>
          )}

          <button
            onClick={openReviewPopup}
            className="hover:shadow-xl ml-2 bg-blue-700 hover:bg-blue-800 text-white py-1 px-2 rounded-md hover:rounded-xl mt-5"
          >
            Profile Review
          </button>
          {user && user.email !== email && (
            <button
              onClick={fetchUserPosts}
              className="hover:shadow-xl py-1 px-6 rounded-md hover:rounded-xl mt-5 ml-3 bg-blue-700 hover:bg-blue-800 text-white"
            >
              Posts
            </button>
          )}
        </div>
        {loadingPosts ? (
          <p className="text-center mt-4 dark:text-gray-300">
            Loading posts...
          </p>
        ) : showPosts && posts.length === 0 ? (
          <p className="text-center mt-4 dark:text-gray-200">No posts found.</p>
        ) : showPosts ? (
          <div className="container mx-auto p-4">
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="md:p-4 lg:p-4 xl:p-4 rounded-md">
                  <h4 className="text-xl font-semibold ml-16 p-5 dark:text-white">
                    {post.postName}
                  </h4>
                  <div className="md:flex lg:flex xl:flex">
                    <img
                      className="w-full h-full object-contain md:object-cover md:px-16 lg:px-16 xl:px-16"
                      src={post.postImage}
                      alt={post.postName}
                    />
                    <div className="p-4">
                      <p className="text-gray-700 mb-2 text-justify dark:text-gray-200">
                        {showMore[post._id]
                          ? post.postDescription
                          : `${post.postDescription.substring(0, 100)}...`}
                      </p>
                      <button
                        className="text-blue-600 underline p-3"
                        onClick={() => handleToggle(post._id)}
                      >
                        {showMore[post._id] ? "Read Less" : "Read More"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}{" "}
        {/* Review Popup */}
        {isReviewPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-600 p-6 rounded-lg w-full md:w-1/2 lg:w-1/3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Reviews
                </h3>
                <button
                  onClick={closeReviewPopup}
                  className="text-red-500 text-2xl hover:bg-white hover:rounded-full"
                >
                  &times;
                </button>
              </div>
              {/* List of reviews */}
              <div className="max-h-60 overflow-y-auto mb-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    No reviews yet.
                  </p>
                ) : (
                  reviews.map((rev) => {
                    console.log(rev);
                    const commentLink = rev.reviewer
                      ? `/profile/${rev.reviewer._id}`
                      : "#";
                    return (
                      <div
                        key={rev._id || rev.id}
                        className="mb-3 p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          {rev.reviewer?.photo ? (
                            <img
                              src={rev.reviewer.photo}
                              alt={rev.reviewer?.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <CgProfile className="w-8 h-8 text-gray-500" />
                          )}
                          <Link
                            to={commentLink}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-lg"
                          >
                            <p className="text-sm font-semibold text-blue-700">
                              {rev.reviewer.name || "Unknown User"}
                            </p>
                          </Link>
                        </div>
                        <br />

                        <div className="flex items-center mb-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < rev.rating
                                  ? "text-yellow-500"
                                  : "text-gray-400"
                              }
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-700 dark:text-gray-200">
                            {rev.comment}
                          </p>
                          {rev.reviewer?._id === user._id && (
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <MdDelete size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {/* Add review form */}

              {user && user.email != email && (
                <>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Add Your Review
                    </h4>
                    <div className="flex space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        return (
                          <FaStar
                            key={i}
                            className={`cursor-pointer ${
                              starValue <= (hover || rating)
                                ? "text-yellow-500"
                                : "text-gray-400"
                            }`}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => setRating(starValue)}
                          />
                        );
                      })}
                    </div>

                    <textarea
                      className="w-full p-2 border mt-2 rounded"
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2\">
                    <button
                      onClick={closeReviewPopup}
                      className="px-4 py-2 bg-red-400 text-white rounded-lg hover:rounded-xl m-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitReview}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:rounded-xl m-2"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserProfileShow;
