import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";
const AppointmentHistory = () => {
  const { user } = useAuthStore();
  const userId = user?._id;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch user's appointment history
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("book/my-appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data); // Assuming API returns an array of appointments
    } catch (error) {
      toast.error(
        error.response?.data.message || "Error fetching appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId]);

  // Cancel appointment function
  const handleCancel = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `book/appointments/${appointmentId}`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment cancelled successfully");

      // Update the UI without refetching
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: "cancelled" }
            : appointment
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data.message || "Error cancelling appointment"
      );
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Corrected filtering logic
  const filteredAppointments = appointments.filter((appointment) => {
    const patientName =
      appointment.patientName ||
      (appointment.user && appointment.user.name) ||
      "";
    const doctorName = (appointment.doctor && appointment.doctor.name) || "";
    const date = formatDate(appointment.date) || "";
    const timeSlot = appointment.timeSlot || "";
    const status = appointment.status || "";
    const searchLower = searchTerm.toLowerCase();
    return (
      patientName.toLowerCase().includes(searchLower) ||
      doctorName.toLowerCase().includes(searchLower) ||
      timeSlot.toLowerCase().includes(searchLower) ||
      status.toLowerCase().includes(searchLower) ||
      date.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Reset current page when searchTerm changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="dark:bg-slate-900 w-full min-h-screen flex justify-center">
      <div className="w-full dark:bg-slate-900">
        <h2 className="text-2xl font-bold dark:text-white mt-5 pl-5">
          My Appointments
        </h2>
        {/* Search Input */}
        <div className="m-5">
          <input
            type="text"
            placeholder="Search appointments..."
            className="px-4 py-2 w-full max-w-md border rounded dark:bg-slate-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="font-semibold text-red-600 p-5">
          Appointment Can't be Cancelled When it is Confirmed
        </p>
        {loading ? (
          <p className="dark:text-gray-200">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="dark:text-gray-200">No appointments found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:bg-slate-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 dark:text-white">
                    <th className="px-4 py-2 border">Doctor</th>
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">Time Slot</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="dark:text-gray-100 text-center"
                    >
                      {" "}
                      <Link
                        to={`/profile/${appointment.doctor._id}`}
                        className="text-blue-600 dark:text-blue-300 hover:underline"
                      >
                        {" "}
                        <span className="flex justify-center items-center mx-auto mt-3">
                          {appointment.doctor.photo ? (
                            <img
                              src={appointment.doctor.photo}
                              alt=""
                              className=" w-12 h-12 rounded-full object-cover mb-4 cursor-pointer"
                            />
                          ) : (
                            ""
                          )}
                          <td className="">
                            Dr.{appointment.doctor?.name || "Unknown"}
                          </td>
                        </span>
                      </Link>
                      <td className="px-4 py-2 border">
                        {formatDate(appointment.date)}
                      </td>
                      <td className="px-4 py-2 border">
                        {appointment.timeSlot}
                      </td>
                      <td
                        className={`px-4 py-2 border capitalize ${
                          appointment.status === "pending"
                            ? "text-yellow-500"
                            : appointment.status === "confirmed"
                            ? "text-green-500"
                            : appointment.status === "cancelled"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {appointment.status}
                      </td>
                      <td className="px-4 py-2 border">
                        {appointment.status === "pending" ? (
                          <button
                            onClick={() => handleCancel(appointment._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        ) : appointment.status === "confirmed" ? (
                          <h1 className="text-green-500">
                            Appointment Confirmed
                          </h1>
                        ) : (
                          <h1 className="text-red-500">
                            Appointment Cancelled
                          </h1>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === pageNumber
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-600 dark:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;
