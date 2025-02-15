import React, { useState } from 'react';
import { createVideoPost } from '../services/VideoPostService';
import { toast } from 'sonner';

const CreateVideoPost = () => {
  const [postName, setPostName] = useState('');
  const [video, setVideo] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    const formData = new FormData();
    formData.append('postName', postName);
    formData.append('video', video);
    formData.append('description', description);

    try {
      await createVideoPost(formData);
      toast.success('Video posted successfully');
      
      setPostName('');
      setVideo(null);
      setDescription('');
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  return (
    <div className="w-full min-h-screen dark:bg-slate-900 bg-white flex justify-center items-center">

  
    <form onSubmit={handleSubmit} className="dark:bg-slate-800 w-full md:w-3/4 mx-auto p-10 shadow-md  bg-white rounded-lg">
      <div className="mb-4 ">
        <label className="block dark:text-white text-gray-700 text-sm font-bold mb-2">Heading:</label>
        <input
          type="text"
          value={postName}
          onChange={(e) => setPostName(e.target.value)}
          required
          className="shadow dark:text-white dark:bg-slate-700 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">Video:</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
          required
          className="shadow dark:bg-slate-700 dark:text-white appearance-none border rounded w-full py-2 px-3  text-gray-700  leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-white text-sm font-bold mb-2">Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="shadow dark:bg-slate-700 dark:text-white appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="5"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={loading} // Disable button when loading
      >
        {loading ? 'Uploading...' : 'Create Video Post'}
      </button>
      {loading && <p className="text-blue-500 mt-2">Uploading video, please wait...</p>} {/* Loading message */}
    </form>
    </div>
  );
};

export default CreateVideoPost;
