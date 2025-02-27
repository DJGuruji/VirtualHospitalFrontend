
import axios from '../axios';


export const createPost = async (postData) => {
  const response = await axios.post('/posts', postData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};



export const getPosts = async (userId, page = 0) => {
  const validPage = Number.isInteger(page) ? page : 0; // Ensure it's a valid number
  const response = await axios.get(`/posts`, {
    params: { userId: userId || undefined, limit: 7, skip: validPage * 7 },
  });
  return response.data;
};



// Get a single post by ID
export const getPostById = async (postId) => {
  const response = await axios.get(`/posts/${postId}`);
  return response.data;
};

// Update a post
export const updatePost = async (postId, postData) => {
  const response = await axios.put(`/posts/${postId}`, postData);
  return response.data;
};

// Delete a post
export const deletePost = async (postId) => {
  const response = await axios.delete(`/posts/${postId}`);
  return response.data;
};


export const likePost = async (postId) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`/posts/like/${postId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addComment = async (postId, text) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`/posts/comment/${postId}`, { text }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


export const getComments = async (postId) => {
  try {
    const response = await axios.get(`/posts/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const deleteComment = async (commentId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/posts/comment/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error deleting comment:", error.response?.data || error.message);
    throw error;
  }
};