import React, { useState, useEffect } from "react";
import axios from "../../axios";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AppointmentBooking = ({ closeModal }) => {
  const { docId } = useParams();
  const { user } = useAuthStore();
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [bookForOthers, setBookForOthers] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientMobile, setPatientMobile] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSlots([
      "09:00 AM - 10:00 AM",
      "11:00 AM - 12:00 AM",
      "02:00 PM - 03:00 PM",
      "04:00 PM - 05:00 PM",
      "07:00 PM - 08:00 PM",
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!docId) {
        toast.error("Doctor not found!");
        return;
      }

      const appointmentData = { doctorId: docId, date, timeSlot };

      if (bookForOthers) {
        appointmentData.patientName = patientName;
        appointmentData.patientEmail = patientEmail;
        appointmentData.patientMobile = patientMobile;
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `book/appointments/book/${user._id}`,
        appointmentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response?.data?.message);

      // Reset form fields after successful submission
      setDate("");
      setTimeSlot("");
      setBookForOthers(false);
      setPatientName("");
      setPatientEmail("");
      setPatientMobile("");

      closeModal();
    } catch (error) {
      toast.error(response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 flex justify-center items-center">
      <div className="p-6 dark:bg-slate-800 bg-white shadow-xl rounded-lg w-96 md:w-1/2 ">
        <h2 className="text-xl font-bold mb-4 dark:text-white ">
          Book Appointment
        </h2>
        <label className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={bookForOthers}
            onChange={() => setBookForOthers(!bookForOthers)}
            className="mr-2"
          />
          <span className="dark:text-gray-300 ">Book for Someone Else</span>
        </label>

        {bookForOthers && (
          <>
            <div className="flex-col m-2">
              <label htmlFor="" className="dark:text-white p-1">
                Patient Name
              </label>
              <input
                type="text"
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2 border rounded mb-2 dark:text-white dark:bg-slate-700 "
              />
            </div>
            <div className="flex-col m-2">
              <label htmlFor="" className="dark:text-white p-1">
                Patient Email
              </label>
              <input
                type="email"
                placeholder="Patient Email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full p-2 border rounded mb-2 dark:text-white dark:bg-slate-700"
              />
            </div>
            <div className="flex-col m-2">
              <label htmlFor="" className="dark:text-white p-1">
                Patient Mobile
              </label>

              <input
                type="text"
                placeholder="Patient Mobile"
                value={patientMobile}
                onChange={(e) => setPatientMobile(e.target.value)}
                className="w-full p-2 border rounded mb-2 dark:text-white dark:bg-slate-700"
              />
            </div>
          </>
        )}
        <div className="flex-col m-2">
          <label htmlFor="" className="dark:text-white p-1">
            Appointment Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full p-2 border rounded mb-2 dark:text-white dark:bg-slate-700"
          />
        </div>
        <div className="flex-col m-2">
          <label htmlFor="" className="dark:text-white p-1">
            Appointment Time
          </label>

          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full p-2 border rounded mb-4 dark:text-white dark:bg-slate-700"
          >
            <option value="">Select Time Slot</option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full p-2 text-white font-bold rounded bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Booking Appointment..." : "Book Appointment"}
        </button>
      </div>
    </div>
  );
};

export default AppointmentBooking;
