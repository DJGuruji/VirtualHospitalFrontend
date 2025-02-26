import { useEffect, useState } from "react";
import axios from "../../axios";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import Modal from "react-modal";
import { Link } from "react-router-dom";

Modal.setAppElement("#root");

const DoctorApprove = () => {
  const { user } = useAuthStore();
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // State for modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

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

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedImage("");
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200 dark:bg-slate-800 dark:text-white">
                <th className="border p-2">Doctor Name</th>
                <th className="border p-2">Specialization</th>
                <th className="border p-2">Register.No</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Mobile</th>
                <th className="border p-2">Degree</th>
                <th className="border p-2">Additional Degrees</th>
                <th className="border p-2">Certificate</th>
                <th className="border p-2">Additional Certificate</th>
                <th className="border p-2">registration Certificate</th>
                <th className="border p-2">Office</th>
                <th className="border p-2">Office Place</th>

                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
                {user.role === "admin" && (
                  <th className="border p-2">Delete User</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentDoctors.map((doc) => (
                <tr
                  key={doc._id}
                  className="text-center dark:bg-slate-800 dark:text-white"
                >
                  <td className="border p-2">
                    <Link
                      to={`/profile/${doc._id}`}
                      className="flex flex-col items-center"
                    >
                      {doc.photo ? (
                        <img
                          src={doc.photo}
                          alt="Doctor"
                          className="mx-auto w-12 h-12 rounded-full object-cover mb-2 cursor-pointer"
                          onClick={() => openModal(doc.photo)}
                        />
                      ) : null}
                      <span>Dr. {doc.name}</span>
                    </Link>
                  </td>

                  <td className="border p-2">
                    {doc.doctorInfo.specialization}
                  </td>
                  <td className="border p-2">
                    {doc.doctorInfo.registerNumber}
                  </td>
                  <td className="border p-2">{doc.email}</td>
                  <td className="border p-2">{doc.mobile}</td>
                  <td className="border p-2">{doc.doctorInfo.degree}</td>
                  {/* Additional Degrees (Array) */}
                  <td className="border p-2">
                    <ul>
                      {doc.doctorInfo.additionalDegree.map((deg, index) => (
                        <li key={index}>{deg}</li>
                      ))}
                    </ul>
                  </td>
                  {/* Main Certificate */}
                  <td className="border p-2">
                    <img
                      src={doc.doctorInfo.certificate}
                      alt="certificate"
                      className="mx-auto w-24 h-16  object-cover cursor-pointer"
                      onClick={() => openModal(doc.doctorInfo.certificate)}
                    />
                  </td>
                  {/* Additional Certificates (Array) */}
                  <td className="border p-2">
                    {doc.doctorInfo.additionalDegreeCertificate.map(
                      (cert, index) => (
                        <img
                          key={index}
                          src={cert}
                          alt={`Additional Certificate ${index + 1}`}
                          className="mx-auto w-24 h-16  object-cover cursor-pointer mb-2"
                          onClick={() => openModal(cert)}
                        />
                      )
                    )}
                  </td>
                  {/* Registration Certificate */}
                  <td className="border p-2">
                    <img
                      src={doc.doctorInfo.registrationCertificate}
                      alt="registrationCertificate"
                      className="mx-auto w-24 h-16  object-cover cursor-pointer"
                      onClick={() =>
                        openModal(doc.doctorInfo.registrationCertificate)
                      }
                    />
                  </td>
                  <td className="border p-2">{doc.office}</td>
                  <td className="border p-2">{doc.officePlace}</td>

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
                      <span className="flex ">
                        <button
                          onClick={() => handleUpdateStatus(doc._id, "active")}
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(doc._id, "block")}
                          className="bg-red-500 text-white px-5 py-1 rounded"
                        >
                          Block
                        </button>
                      </span>
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
                  {user.role === "admin" &&
                  (doc.doctorInfo.status === "pending" ||
                    doc.doctorInfo.status === "block") ? (
                    <td className="px-4 py-2">
                      <button
                        onClick={() => deleteUser(doc._id)}
                        className="border-2 border-red-800 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md hover:rounded-xl"
                      >
                        Delete
                      </button>
                    </td>
                  ) : (
                    <p className="text-red-500 text-center font-semibold">
                      Only Blocked users can be deleted
                    </p>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Image Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          shouldCloseOnOverlayClick={true}
          className="fixed inset-0 flex items-center justify-center p-4"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75"
        >
          <div className="relative bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg max-w-2xl">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              ✕
            </button>

            {/* Enlarged Image */}
            <img
              src={selectedImage}
              alt="Enlarged View"
              className="max-w-full h-full md:max-h-[90vh] rounded-lg"
            />
          </div>
        </Modal>

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
