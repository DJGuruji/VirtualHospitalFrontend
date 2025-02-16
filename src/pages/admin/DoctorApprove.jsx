import { useEffect, useState } from "react";
import axios from "../../axios";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";

const DoctorApprove = () => {

  const {user} = useAuthStore();
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const[users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchDoctors(filter);
  }, [filter]);

  const fetchDoctors = async (status) => {
    try {
      const res = await axios.get(`/admin/doctorapprove?status=${status}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (Array.isArray(res.data)) {
        setDoctors(res.data);
      } else {
        toast.error("Some error occurred");
        setDoctors([]);
      }
    } catch (err) {
      toast.error("Error fetching doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(
        `/doctor/verify-doctor/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchDoctors(filter);
      toast.success(`Doctor status updated to ${status}`);
    } catch (error) {
      toast.error("Error updating doctor status");
    }
  };

  const filteredDoctors = doctors.filter((doc) =>
    [
      doc.name,
      doc.email,
      doc.officePlace,
      doc.office,
      doc.doctorInfo.status,
      doc.doctorInfo.specialization,
      doc.doctorInfo.registerNumber,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`admin/deleteuser/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("User Deleted");

        console.log("Response from backend:", response.data);
        setUsers(users.filter((user) => user._id !== userId));
      } catch (error) {
        toast.error("User Deleting Failed");
        console.error("Error deleting user:", error);
      }
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div className="dark:bg-slate-900 w-full min-h-screen flex justify-center p-5">
      <div className="  dark:bg-slate-900 w-full ">
      <h1 className="text-2xl font-bold mb-4 text-center  dark:text-white">
        Doctor Administration
      </h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="w-full dark:bg-slate-800 dark:text-white border p-2 rounded mb-4"
      />
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border p-2 rounded mb-4 dark:bg-slate-900 dark:text-white "
      >
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="block">Blocked</option>
      </select>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200 dark:bg-slate-800 dark:text-white">
            <th className="border p-2">Doctor Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Mobile</th>
            <th className="border p-2">Office</th>
            <th className="border p-2">Office Place</th>
            <th className="border p-2">Specialization</th>
            <th className="border p-2">Register Number</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
            {user.role === "admin" && (     <th className="border p-2">Delete User</th>
            )}
          </tr>
        </thead>
        <tbody>
          {currentDoctors.map((doc) => (
            <tr key={doc._id} className="text-center dark:bg-slate-800 dark:text-white">
              <td className="border p-2">Dr.{doc.name}</td>
              <td className="border p-2">{doc.email}</td>
              <td className="border p-2">{doc.mobile}</td>
              <td className="border p-2">{doc.office}</td>
              <td className="border p-2">{doc.officePlace}</td>
              <td className="border p-2">{doc.doctorInfo.specialization}</td>
              <td className="border p-2">{doc.doctorInfo.registerNumber}</td>
              <td
                className={`border p-2 font-semibold ${
                  doc.doctorInfo.status === "active"
                    ? "text-green-600"
                    : doc.doctorInfo.status === "pending"
                    ? "text-yellow-600 dark:text-yellow-400 "
                    : doc.doctorInfo.status === "block"
                    ? "text-red-600"
                    : ""
                }`}
              >
                {doc.doctorInfo.status}
              </td>
              <td className="border p-2">
                {doc.doctorInfo.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(doc._id, "active")}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(doc._id, "block")}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Block
                    </button>
                  </>
                )}
                {doc.doctorInfo.status === "active" && (
                  <button
                    onClick={() => handleUpdateStatus(doc._id, "block")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Block
                  </button>
                )}
                {doc.doctorInfo.status === "block" && (
                  <button
                    onClick={() => handleUpdateStatus(doc._id, "active")}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Activate
                  </button>
                )}
              </td>
              {(user.role === "admin" && (doc.doctorInfo.status === "pending" || doc.doctorInfo.status === "block"))?(
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteUser(doc._id)}
                    className="border-2 border-red-800 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md hover:rounded-xl"
                  >
                    Delete
                  </button>
                </td>
              ):(
                <p className="text-red-500 text-center font-semibold">Only Blocked users can be deleted</p>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        {Array.from(
          { length: Math.ceil(filteredDoctors.length / itemsPerPage) },
          (_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          )
        )}
      </div>
    </div>
    </div>
  );
};

export default DoctorApprove;
