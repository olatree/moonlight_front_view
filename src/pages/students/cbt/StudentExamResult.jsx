


import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const StudentExamResult = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border max-w-md w-full p-8 text-center">

        <FaCheckCircle
          size={60}
          className="mx-auto text-green-600 mb-4"
        />

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Exam Submitted Successfully
        </h1>

        <p className="text-gray-500 mb-6">
          Your answers have been submitted and recorded.
          Results will be available when released by your teacher.
        </p>

        <button
          onClick={() => navigate("/student/exams")}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          <FaArrowLeft size={14} />
          Return to Exams
        </button>
      </div>
    </div>
  );
};

export default StudentExamResult;