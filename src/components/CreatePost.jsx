import React, { useState } from "react";
import { createPost } from "../services/PostService";
import { toast } from "sonner";

const CreatePost = () => {
  const [formData, setFormData] = useState({
    postName: "",
    postImage: null,
    postDescription: "",
  });

  const { postName, postDescription } = formData;
  const [loading, setLoading] = useState(false); 

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    setFormData({ ...formData, postImage: e.target.files[0] });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 

    const postData = new FormData();
    postData.append("postName", formData.postName);
    postData.append("postImage", formData.postImage);
    postData.append("postDescription", formData.postDescription);

    try {
      await createPost(postData);
      toast.success("Post created successfully!");
      setFormData({
        postName: "",
        postImage: null,
        postDescription: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen p-10 min-w-lg  flex justify-center items-center dark:bg-slate-900">
      <form
        onSubmit={onSubmit}
        className="mx-auto p-8 w-full md:w-3/4 bg-white rounded-lg shadow-lg dark:bg-slate-800 "
      >
        <h1 className="text-blue-700 dark:text-blue-400 font-bold text-xl p-6 text-center">
          Add Your Posts
        </h1>
        <div className="mb-6">
          <label
            className="block dark:text-white text-gray-700 text-sm font-bold mb-2"
            htmlFor="postName"
          >
            Heading
          </label>
          <input
            type="text"
            name="postName"
            value={postName}
            onChange={onChange}
            required
            placeholder="Post name"
            className="shadow appearance-none dark:text-white dark:bg-slate-700 border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label
            className="block dark:text-white text-gray-700 text-sm font-bold mb-2"
            htmlFor="postImage"
          >
            Post Image
          </label>
          <input
            type="file"
            name="postImage"
            onChange={onFileChange}
            required
            className="shadow dark:bg-slate-700 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label
            className="block dark:text-white text-gray-700 text-sm font-bold mb-2"
            htmlFor="postDescription"
          >
            Post Description
          </label>
          <textarea
            name="postDescription"
            value={postDescription}
            onChange={onChange}
            required
            placeholder="Give description about post"
            className="shadow dark:text-white dark:bg-slate-700 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          ></textarea>
        </div>
        <button
          type="submit"
          className="border-2 border-blue-800 bg-blue-200 hover:bg-blue-300 text-blue-800 hover:rounded-xl font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading} // Disable button while loading
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
