import React from "react";
import { calculateGrade, calculateCumulativeData } from "../../utils/resultUtils";

export default function PrintableResult({
  student,
  results,
  termAverage,
  session,
  term,
  comments,
  attendance,
  classTeacher,
  principal,
  classSize,
  allTermResults,
  isThirdTerm,
  feeInfo,
}) {
  const cumulative = isThirdTerm
    ? calculateCumulativeData(allTermResults)
    : null;

  const displayAverage = isThirdTerm
    ? cumulative.overallCumulativeAverage
    : termAverage;

  const currentMarkObtained = results.reduce(
    (sum, result) => sum + (Number(result.total) || 0),
    0
  );

  const currentMaxMark = results.length * 100;

  const displayMarkObtained = isThirdTerm
    ? cumulative.cumulativeMarkObtained
    : currentMarkObtained;

  const displayMaxMark = isThirdTerm
    ? cumulative.cumulativeMaxMarkObtainable
    : currentMaxMark;

  const attendanceRecord = attendance?.[0] || {};
  const timesPresent = attendanceRecord.timesPresent || 0;
  const timesOpened = attendanceRecord.timesOpened || 0;
  const timesAbsent = Math.max(timesOpened - timesPresent, 0);

  const studentData = student?.studentId || {};

  return (
    <div className="bg-white text-black print:p-0">
      <div className="mx-auto w-[210mm] min-h-[297mm] p-6 text-[10px] print:w-full print:min-h-0">
        {/* <div className="mb-3 flex items-center gap-4 rounded bg-blue-600 p-3 text-white">
          <img
            src="/logo.jpg"
            alt="School Logo"
            className="h-16 w-16 rounded-full border object-cover"
          />

          <div>
            <h1 className="text-lg font-bold uppercase">Moonlight College</h1>
            <p>7, Wowo Street, Off Tolu Road, Olodi Apapa Lagos.</p>
            <p>Phone: 08175967507, 08062961916</p>
            <h2 className="mt-1 font-bold">
              Term Report Sheet {isThirdTerm ? "- Cumulative Results" : ""}
            </h2>
          </div>
        </div> */}

        <div className="relative mb-3 rounded bg-blue-600 p-3 text-white">
  <img
    src="/logo.jpg"
    alt="School Logo"
    className="absolute left-3 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full border object-cover"
  />

  <div className="text-center">
    <h1 className="text-lg font-bold uppercase">
      Moonlight College
    </h1>

    <p>7, Wowo Street, Off Tolu Road, Olodi Apapa Lagos.</p>

    <p>Phone: 08175967507, 08062961916</p>

    <h2 className="mt-1 font-bold">
      Term Report Sheet
      {isThirdTerm ? " - Cumulative Results" : ""}
    </h2>
  </div>
</div>

        <div className="mb-3 grid grid-cols-3 gap-3 rounded bg-blue-50 p-3">
          <div>
            <p><b>Portal ID:</b> {studentData.admissionNumber || "N/A"}</p>
            <p><b>Name:</b> {studentData.name || "N/A"}</p>
            <p><b>Class:</b> {student?.classId?.name} - {student?.armId?.name}</p>
            <p><b>Gender:</b> {studentData.gender || "N/A"}</p>
            <p><b>Term:</b> {term}</p>
            <p><b>Session:</b> {session}</p>
          </div>

          <div className="flex justify-center">
            <img
              src={studentData.image || "/default-avatar.png"}
              alt="Student"
              className="h-28 w-28 rounded-full border-2 border-blue-600 object-cover"
            />
          </div>

          <div>
            <p><b>No. in class:</b> {classSize}</p>
            <p><b>Attendance:</b> Present {timesPresent} / Absent {timesAbsent}</p>
            <p><b>Average:</b> {Number(displayAverage || 0).toFixed(1)}%</p>
            <p><b>GPA:</b> {((displayAverage / 100) * 5).toFixed(1)}</p>
            <p><b>Grade:</b> {calculateGrade(displayAverage)}</p>
            <p><b>Marks:</b> {displayMarkObtained} / {displayMaxMark}</p>
          </div>
        </div>

        <table className="mb-3 w-full border-collapse text-center text-[9px]">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border p-1 text-left">Subject</th>
              <th className="border p-1">CA1</th>
              <th className="border p-1">CA2</th>
              <th className="border p-1">CA3</th>
              <th className="border p-1">CA4</th>
              <th className="border p-1">Exam</th>
              <th className="border p-1">Total</th>

              {isThirdTerm && (
                <>
                  <th className="border p-1">1st</th>
                  <th className="border p-1">2nd</th>
                  <th className="border p-1">3rd</th>
                  <th className="border p-1">Cum. Avg</th>
                </>
              )}

              <th className="border p-1">Grade</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => {
              const subject = result.subject;

              const first =
                cumulative?.termScores?.["First Term"]?.[subject] ||
                cumulative?.termScores?.["1st Term"]?.[subject] ||
                "-";

              const second =
                cumulative?.termScores?.["Second Term"]?.[subject] ||
                cumulative?.termScores?.["2nd Term"]?.[subject] ||
                "-";

              const third =
                cumulative?.termScores?.["Third Term"]?.[subject] ||
                cumulative?.termScores?.["3rd Term"]?.[subject] ||
                "-";

              const grade = isThirdTerm
                ? cumulative?.cumulativeGrades?.[subject] || calculateGrade(result.total)
                : result.grade || calculateGrade(result.total);

              return (
                <tr key={subject} className="odd:bg-gray-50">
                  <td className="border p-1 text-left">{subject}</td>
                  <td className="border p-1">{result.ca1 || 0}</td>
                  <td className="border p-1">{result.ca2 || 0}</td>
                  <td className="border p-1">{result.ca3 || 0}</td>
                  <td className="border p-1">{result.ca4 || 0}</td>
                  <td className="border p-1">{result.exam || 0}</td>
                  <td className="border p-1 font-bold">{result.total || 0}</td>

                  {isThirdTerm && (
                    <>
                      <td className="border p-1">{first}</td>
                      <td className="border p-1">{second}</td>
                      <td className="border p-1">{third}</td>
                      <td className="border p-1">
                        {cumulative?.cumulativeAverages?.[subject] || "-"}%
                      </td>
                    </>
                  )}

                  <td className="border p-1 font-bold">{grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mb-6 rounded bg-blue-50 p-3">
          <p><b>Class Teacher's Comment:</b> {comments?.classTeacher || "N/A"}</p>
          <p><b>Principal's Remark:</b> {comments?.principal || "N/A"}</p>
        </div>

          <div className="mb-4 overflow-hidden rounded border border-blue-300">
  <div className="bg-blue-600 py-1 text-center text-[9px] font-bold text-white">
    FEE STATUS
  </div>

  <div className="grid grid-cols-2 text-center">
    <div className="border-r px-2 py-1">
      <p className="text-[8px] text-gray-600">Outstanding</p>
      <p className="text-sm font-bold text-red-600">
        ₦{Number(feeInfo?.currentBalance || 0).toLocaleString()}
      </p>
    </div>

    <div className="px-2 py-1">
      <p className="text-[8px] text-gray-600">Next Term Fee</p>
      <p className="text-sm font-bold text-green-600">
        ₦{Number(feeInfo?.nextTermFee || 0).toLocaleString()}
      </p>
    </div>
  </div>
</div>

        <div className="flex justify-between pt-4">
          <div className="text-center">
            {classTeacher?.signature && (
              <img
                src={classTeacher.signature}
                alt="Class Teacher Signature"
                className="mx-auto h-10 w-32 object-contain"
              />
            )}
            <div className="mx-auto mt-2 w-40 border-t border-black" />
            <p className="font-bold">{classTeacher?.name || "Class Teacher"}</p>
            <p>Class Teacher</p>
          </div>

          <div className="text-center">
            {principal?.signature && (
              <img
                src={principal.signature}
                alt="Principal Signature"
                className="mx-auto h-10 w-32 object-contain"
              />
            )}
            <div className="mx-auto mt-2 w-40 border-t border-black" />
            <p className="font-bold">{principal?.name || "Principal"}</p>
            <p>Principal</p>
          </div>
        </div>
      </div>
    </div>
  );
}