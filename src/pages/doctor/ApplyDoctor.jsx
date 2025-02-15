import { useState } from "react";
import axios from "../../axios";
import { toast } from "sonner";

const ApplyDoctor = () => {
  const [specialization, setSpecialization] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [consultingCenter, setConsultingCenter] = useState("");
  const [consultingPlace, setConsultingPlace] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [loading , setLoading]= useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (registerNumber.length !== 6) {
      toast.error("Register number must be exactly 6 digits.");
      return;
    }

    const formData = new FormData();
    formData.append("specialization", specialization);
    formData.append("registerNumber", registerNumber);
    formData.append("consultingCenter", consultingCenter);
    formData.append("consultingPlace", consultingPlace);
    formData.append("certificate", certificate);

    try {
      setLoading(true);
      const res = await axios.post("doctor/apply-doctor", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(res.data.message);
    } catch (err) {

      toast.error( "An error occurred");
    }  finally {
      setLoading(false); // Step 4: Reset loading state after signup attempt (whether success or error)
    }
  };

  return (
    <div className="dark:bg-slate-900  min-h-screen w-full flex justify-center items-center">

   
    <div className=" w-full md:w-3/4 dark:bg-slate-800  p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 dark:text-white">  Register as Doctor</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="specialization"
          placeholder="Specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          required
          className="p-2  dark:text-white border dark:bg-slate-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="registerNumber"
          placeholder="Register Number"
          value={registerNumber}
          onChange={(e) => setRegisterNumber(e.target.value)}
          required
          className="p-2  dark:text-white dark:bg-slate-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
          <input
          type="text"
          name="consultingCenter"
          placeholder="Consulting Center"
          value={consultingCenter}
          onChange={(e) => setConsultingCenter(e.target.value)}
          required
          className="p-2 dark:text-white border dark:bg-slate-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="consultingPlace"
          placeholder="Consulting Place"
          value={consultingPlace}
          onChange={(e) => setConsultingPlace(e.target.value)}
          required
          className="p-2  dark:text-white border dark:bg-slate-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          name="certificate"
          onChange={(e) => setCertificate(e.target.files[0])}
          required
          className="p-2 dark:text-white dark:bg-slate-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-center items-center">
        <button
          type="submit"
          className="bg-blue-500 w-full  text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
           {loading ? 'Registering ...' : 'Register as Doctor'}
        </button>
        </div>
      
      </form>
    </div>
    </div>
  );
};

export default ApplyDoctor;
