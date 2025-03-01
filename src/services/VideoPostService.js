import axios from '../axios';

export const createVideoPost = async (videoPostData) => {
  const response = await axios.post('/videoposts', videoPostData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getVideoPosts = async (userId, page = 0) => {
  const validPage = Number.isInteger(page) ? page : 0; // Ensure valid page number

  const response = await axios.get('/videoposts', {
    params: { userId: userId || undefined, limit: 5, skip: validPage * 5 },
  });

  return response.data;
};

export const getVideoPostById = async (videoPostId) => {
  const response = await axios.get(`/videoposts/${videoPostId}`);
  return response.data;
};

export const updateVideoPost = async (videoPostId, videoPostData) => {
  const response = await axios.put(`/videoposts/${videoPostId}`, videoPostData);
  return response.data;
};

export const deleteVideoPost = async (videoPostId) => {
  const response = await axios.delete(`/videoposts/${videoPostId}`);
  return response.data;
};



export const likevideo = async (postId) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`/videoposts/like/${postId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addComment = async (postId, text) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`/videoposts/comment/${postId}`, { text }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export const getComments = async (postId) => {
  try {
    const response = await axios.get(`/videoposts/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const deleteComment = async (commentId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/videoposts/comment/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error deleting comment:", error.response?.data || error.message);
    throw error;
  }
};