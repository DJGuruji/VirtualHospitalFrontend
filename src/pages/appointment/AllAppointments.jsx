import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { toast } from "sonner";

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust this value as needed

  // Fetch all appointments from the backend
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("book/all-appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error(
        error.response?.data.message || "Error fetching appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Delete an appointment
  const handleDelete = async (appointmentId) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`book/appointment/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Appointment deleted successfully");
        // Remove the deleted appointment from state
        setAppointments((prev) =>
          prev.filter((appt) => appt._id !== appointmentId)
        );
      } catch (error) {
        toast.error(
          error.response?.data.message || "Error deleting appointment"
        );
      }
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Filter appointments by patient or doctor name
  const filteredAppointments = appointments.filter((appointment) => {
    const patientName =
      appointment.patientName ||
      (appointment.user && appointment.user.name) ||
      "";
    const doctorName = (appointment.doctor && appointment.doctor.name) || "";
    const date = (appointment.doctor && formatDate(appointment.date)) || "";
    const timeSlot = (appointment.doctor && appointment.timeSlot) || "";
    const status = (appointment.doctor && appointment.status) || "";
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

  // When searchTerm changes, reset current page to 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

 

  return (
    <div className="dark:bg-slate-900 w-full min-h-screen flex justify-center">
      <div className="w-full dark:bg-slate-900">
        <h2 className="text-2xl font-bold dark:text-white m-5 pl-5">
          All Appointments
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

        {loading ? (
          <p className="text-center dark:text-white">Loading appointments...</p>
        ) : filteredAppointments.length === 0 ? (
          <p className="text-center dark:text-white">No appointments found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 text-white">
                    <th className="px-4 py-2 border">Patient Name</th>
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
                      className="dark:bg-slate-800 text-center text-gray-100"
                    >
                      <td className="px-4 py-2 border">
                        {appointment.patientName ||
                          (appointment.user && appointment.user.name)}
                      </td>
                      <td className="px-4 py-2 border">
                        {appointment.doctor && appointment.doctor.name}
                      </td>
                      <td className="px-4 py-2 border">{formatDate(appointment.date)}</td>
                      <td className="px-4 py-2 border">{appointment.timeSlot}</td>
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
                        <button
                          onClick={() => handleDelete(appointment._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
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

export default AllAppointments;
