export default function StudentInfoCard({ studentInfo, classTeacher }) {
  return (
    <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
      <p>
        <strong>Name:</strong> {studentInfo?.studentId?.name || "N/A"}
      </p>
      <p>
        <strong>Class:</strong> {studentInfo?.classId?.name || "N/A"} -{" "}
        {studentInfo?.armId?.name || ""}
      </p>
      <p>
        <strong>Admission Number:</strong>{" "}
        {studentInfo?.studentId?.admissionNumber || "N/A"}
      </p>
      {classTeacher && (
        <p>
          <strong>Class Teacher:</strong> {classTeacher.name || "N/A"}
        </p>
      )}
    </div>
  );
}