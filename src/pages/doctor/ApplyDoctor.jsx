import { useState } from "react";
import axios from "../../axios";
import { toast } from "sonner";

const ApplyDoctor = () => {
  const [specialization, setSpecialization] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [consultingCenter, setConsultingCenter] = useState("");
  const [consultingPlace, setConsultingPlace] = useState("");
  const [degree, setDegree] = useState(""); // Main degree
  const [additionalDegrees, setAdditionalDegrees] = useState([""]); // Array for additional degrees
  const [certificate, setCertificate] = useState(null);
  const [registrationCertificate, setRegistrationCertificate] = useState(null);
  const [additionalCertificates, setAdditionalCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  const addDegreeField = () => setAdditionalDegrees([...additionalDegrees, ""]);
  const removeDegreeField = (index) => {
    if (additionalDegrees.length > 1) {
      setAdditionalDegrees(additionalDegrees.filter((_, i) => i !== index));
    }
  };
  const handleDegreeChange = (index, value) => {
    const updatedDegrees = [...additionalDegrees];
    updatedDegrees[index] = value;
    setAdditionalDegrees(updatedDegrees);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "certificate") setCertificate(file);
    if (type === "registrationCertificate") setRegistrationCertificate(file);
    if (type === "additionalCertificates") setAdditionalCertificates([...e.target.files]);
  };

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
    formData.append("degree", degree);
    additionalDegrees.forEach(degree => formData.append("additionalDegree", degree));


    if (certificate) formData.append("certificate", certificate);
    if (registrationCertificate) formData.append("registrationCertificate", registrationCertificate);
    additionalCertificates.forEach((file) => formData.append("additionalDegreeCertificate", file));


    try {
      setLoading(true);
      const res = await axios.post("doctor/apply-doctor", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark:bg-slate-900 min-h-screen w-full flex justify-center items-center">
      <div className="w-full md:w-3/4 dark:bg-slate-800 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Register as Doctor</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block dark:text-white text-sm font-medium">Specialization:</label>
          <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white" />

          <label className="block dark:text-white text-sm font-medium">Register Number:</label>
          <input type="text" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} required className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white" />

          <label className="block dark:text-white text-sm font-medium">Consulting Center:</label>
          <input type="text" value={consultingCenter} onChange={(e) => setConsultingCenter(e.target.value)} required className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white" />

          <label className="block dark:text-white text-sm font-medium">Consulting Place:</label>
          <input type="text" value={consultingPlace} onChange={(e) => setConsultingPlace(e.target.value)} required className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white" />

          <label className="block dark:text-white text-sm font-medium">Degree:</label>
          <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} required className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white" />

          <label className="block dark:text-white text-sm font-medium">Additional Degrees( Optional ):</label>
          {additionalDegrees.map((deg, index) => (
            <div key={index} className="flex gap-2">
              <input type="text" value={deg} onChange={(e) => handleDegreeChange(index, e.target.value)} required className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white flex-1" />
              {index > 0 && (
                <button type="button" onClick={() => removeDegreeField(index)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addDegreeField} className="bg-blue-500 text-white px-4 py-2 rounded">Add More</button>

          <label className="block dark:text-white text-sm font-medium">Upload Degree Certificate:</label>
          <input type="file" onChange={(e) => handleFileChange(e, "certificate")} className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white" />

          <label className="block dark:text-white text-sm font-medium">Upload Registration Certificate:</label>
          <input type="file" onChange={(e) => handleFileChange(e, "registrationCertificate")} className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white" />

          <label className="block dark:text-white text-sm font-medium">Upload Additional Degree Certificates if any ( Up to 5 ):</label>
          <input type="file" multiple onChange={(e) => handleFileChange(e, "additionalDegreeCertificate")} className="p-2 border dark:bg-slate-700 border-gray-300 rounded dark:text-white" />

          <button type="submit" className="bg-blue-500 w-full text-white px-4 py-2 rounded">{loading ? "Registering ..." : "Register as Doctor"}</button>
        </form>
      </div>
    </div>
  );
};

export default ApplyDoctor;
