import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";
const Appointments = () => {
  const { user } = useAuthStore(); // Assumes the logged-in user is the doctor
  const doctorId = user?._id;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust this value as needed
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [healthRecord, setHealthRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [formData, setFormData] = useState({
    disease: [],
    drugs: [],
  });

  // Fetch appointments assigned to the doctor
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`book/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming the API returns the appointments as an array in response.data
      setAppointments(response.data);
    } catch (error) {
      toast.error(
        error.response?.data.message || "Error fetching appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchAppointments();
    }
  }, [doctorId]);

  // Update appointment status (Accept/Reject)
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      // Adjust the endpoint as per your backend API design
      await axios.put(
        `book/appointments/${appointmentId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(
        `Appointment ${
          newStatus === "confirmed" ? "accepted" : "rejected"
        } successfully`
      );
      // Update the state locally
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data.message || "Error updating appointment status"
      );
    }
  };

  const handleAccept = (appointmentId) => {
    updateAppointmentStatus(appointmentId, "confirmed");
  };

  const handleReject = (appointmentId) => {
    updateAppointmentStatus(appointmentId, "rejected");
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
    const date = formatDate(appointment.date) || "";
    const timeSlot = appointment.timeSlot || "";
    const status = appointment.status || "";
    const searchLower = searchTerm.toLowerCase();
    return (
      patientName.toLowerCase().includes(searchLower) ||
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

  const fetchHealthRecord = async (appointmentId) => {
    try {
      const response = await axios.get(`book/record/${appointmentId}`);
      setHealthRecord(response.data);
      setFormData({
        disease: response.data.disease,
        drugs: response.data.drugs,
      });
    } catch (error) {
      setHealthRecord(null); // No record exists
    }
  };

  const isPastDate = selectedAppointment?.date
  ? new Date(selectedAppointment.date) < new Date()
  : false;  

  return (
    <div className="dark:bg-slate-900 w-full min-h-screen flex justify-center ">
      <div className="  dark:bg-slate-900 w-full ">
        <h2 className="text-2xl font-bold dark:text-white m-5 pl-5">
          Your Appointments
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
          <p className="dark:text-gray-200">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="dark:text-gray-200">No appointments found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-800 dark:text-white">
                    <th className="px-4 py-2 border">Patient Name</th>
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">Time Slot</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Actions</th>
                    <th className="px-4 py-2 border">Medical Record</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className=" dark:bg-slate-800 dark:text-gray-100 text-center"
                    >
                      <td className="px-4 py-2 border">
                        {appointment.patientName ||
                          (appointment.user && appointment.user.name)}
                      </td>
                      <td className="px-4 py-2 border">
                        {formatDate(appointment.date)}
                      </td>

                      <td className="px-4 py-2 border">
                        {appointment.timeSlot}
                      </td>
                      <td
                        className={`px-4 py-2 border capitalize ${
                          appointment.status === "pending"
                            ? "text-yellow-500 dark:text-yellow-300"
                            : appointment.status === "confirmed"
                            ? "text-green-500"
                            : appointment.status === "cancelled"
                            ? " text-red-500"
                            : appointment.status === "rejected"
                            ? " text-red-800"
                            : ""
                        }`}
                      >
                        {appointment.status}
                      </td>
                      <td className="px-4 py-2 border">
                        {appointment.status === "pending" &&
                        appointment.status != "cancelled" ? (
                          <>
                            <button
                              onClick={() => handleAccept(appointment._id)}
                              className="bg-green-500 text-white px-3 py-1 hover:rounded-xl rounded hover:bg-green-600 mr-2"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(appointment._id)}
                              className="bg-red-500 text-white px-3 py-1 hover:rounded-xl rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <>
                            {appointment.status !== "confirmed" &&
                              appointment.status != "cancelled" && (
                                <button
                                  onClick={() => handleAccept(appointment._id)}
                                  className="bg-green-500 text-white px-3 py-1 hover:rounded-xl rounded hover:bg-green-600 mr-2"
                                >
                                  Accept
                                </button>
                              )}
                            {appointment.status !== "rejected" &&
                            appointment.status != "cancelled" ? (
                              <button
                                onClick={() => handleReject(appointment._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 hover:rounded-xl"
                              >
                                Reject
                              </button>
                            ) : (
                              <p className="text-red-800 dark:text-red-600 ">
                                Cancelled by patient
                              </p>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        {appointment.status === "confirmed" && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              fetchHealthRecord(appointment._id);
                              setShowRecordModal(true);
                            }}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Record
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {showRecordModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/2 m-2 dark:bg-slate-800  ">
                    <h2 className="text-2xl font-semibold text-black-800 mb-4 dark:text-white underline">
                      Health Record
                    </h2>
                    <div className="space-y-2 text-gray-700">
                      <p className="dark:text-gray-200 ">
                        <strong>Patient:</strong>{" "}
                        {selectedAppointment?.patientName}
                      </p>
                      <p className="dark:text-gray-200 ">
                        <strong>Doctor:</strong> Dr.{user?.name}
                      </p>

                      <p className="dark:text-gray-200">
                        <strong>Date:</strong>{" "}
                        {selectedAppointment?.date
                          ? new Date(
                              selectedAppointment.date
                            ).toLocaleDateString("en-GB")
                          : "N/A"}
                      </p>
                    </div>

                    {/* Disease Input */}
                    <label className="block mt-4 font-medium text-gray-700 dark:text-gray-200 ">
                      Disease
                    </label>
                    <input
                      type="text"
                      value={formData.disease.join(", ")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          disease: e.target.value.split(", "),
                        })
                      }
                      className="border dark:text-white dark:bg-slate-700 border-gray-300 px-3 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    />

                    {/* Drugs Input */}
                    <label className="block mt-4 font-medium text-gray-700 dark:text-gray-200 ">
                      Drugs Priscribed
                    </label>
                    <input
                      type="text"
                      value={formData.drugs.join(", ")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          drugs: e.target.value.split(", "),
                        })
                      }
                      className="border dark:text-white dark:bg-slate-700 border-gray-300 px-3 py-2 w-full rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    />

                    {/* Buttons */}
         {/* Calculate if the booking date is past today */}
             
 
                 
{/* Buttons */}
<div className="flex justify-end gap-2 mt-6">
  <button
    className="bg-red-500 hover:bg-red-600 hover:rounded-xl text-white px-4 py-2 rounded-md transition"
    onClick={() => setShowRecordModal(false)}
  >
    Close
  </button>
  <button
    className={`px-4 py-2 rounded-md transition text-white ${
      isPastDate
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600 hover:rounded-xl"
    }`}
    onClick={async () => {
      if (isPastDate) return; // Prevent execution if past date
      await axios.post("book/record", {
        appointment: selectedAppointment._id,
        patientName: selectedAppointment.patientName,
        doctorName: user.name,
        date: selectedAppointment.date,
        time: selectedAppointment.timeSlot,
        disease: formData.disease,
        drugs: formData.drugs,
      });
      toast.success("Record saved!");
      setShowRecordModal(false);
    }}
    disabled={isPastDate}
  >
    Save
  </button>
</div>

                  </div>
                </div>
              )}
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

export default Appointments;
