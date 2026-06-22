import React, { useState, useEffect, useRef } from 'react';
import api from "../../api/axios";

export default function DeleteResultsByStudent() {
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [results, setResults] = useState([]); // flat list of individual result records
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch Classes
  useEffect(() => {
    api.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
  }, []);

  // Fetch Sessions
  useEffect(() => {
    api.get("/sessions").then(res => setSessions(res.data || [])).catch(console.error);
  }, []);

  // Fetch All Students (with class reference for filtering)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students");
        let data = res.data || [];

        // If API returns enrollments instead of plain students
        if (data.length > 0 && data[0].studentId) {
          const unique = [];
          const seen = new Set();
          data.forEach(en => {
            const sid = en.studentId;
            if (!seen.has(sid._id)) {
              seen.add(sid._id);
              unique.push({
                _id: sid._id,
                name: sid.name,
                admissionNumber: sid.admissionNumber || 'N/A',
                classId: en.classId?._id || en.classId,
              });
            }
          });
          unique.sort((a, b) => a.name.localeCompare(b.name));
          data = unique;
        }

        setStudents(data);
        setFilteredStudents(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  // Filter students when class changes
  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(s => s.classId === selectedClass._id);
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
    // Reset downstream selections
    setSelectedStudent(null);
    setResults([]);
  }, [selectedClass, students]);

  // Fetch results when student or filters change
  const fetchResults = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const params = {
        studentId: selectedStudent._id,
        ...(selectedSession && { sessionId: selectedSession._id }),
        ...(selectedTerm && { termId: selectedTerm._id }),
      };

      const res = await api.get('/results/by-student', { params });

      if (!res.data.results || res.data.results.length === 0) {
        setResults([]);
        setError('No results found for the selected filters.');
        return;
      }

      // Flatten the grouped structure into individual result rows
      const flatResults = [];
      res.data.results.forEach(termGroup => {
        termGroup.subjects.forEach(sub => {
          flatResults.push({
            ...sub,
            session: termGroup.session,
            term: termGroup.term,
            class: termGroup.class,
            arm: termGroup.arm,
            average: termGroup.average,
          });
        });
      });

      setResults(flatResults);
    } catch (err) {
      setError('Failed to load results: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete a single result (we need the result _id – add it to the model or use the existing delete endpoints)
  // NOTE: Your current backend has `deleteSingleResult` that takes resultId in params
  const deleteSingleResult = async (resultId) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;

    try {
      await api.delete(`/results/${resultId}`); // assuming route is DELETE /results/:resultId
      setSuccess('Result deleted successfully.');
      // Refresh list
      fetchResults();
    } catch (err) {
      setError('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete ALL displayed results (safer than bulk class delete)
  const deleteAllDisplayed = async () => {
    if (!window.confirm(`Delete ALL ${results.length} results shown? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const deletePromises = results
        .filter(r => r._id) // only if you have _id (see note below)
        .map(r => api.delete(`/results/${r._id}`));

      await Promise.all(deletePromises);
      setSuccess('All displayed results deleted.');
      setResults([]);
    } catch (err) {
      setError('Some deletions failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold text-red-700 mb-6 text-center">
        🗑️ Delete Results by Student
      </h2>

      {/* Filter Bar */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 border border-red-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

          <select
            value={selectedClass?._id || ""}
            onChange={(e) => {
              const cls = classes.find(c => c._id === e.target.value);
              setSelectedClass(cls || null);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select
            value={selectedStudent?._id || ""}
            onChange={(e) => {
              const stu = filteredStudents.find(s => s._id === e.target.value);
              setSelectedStudent(stu || null);
              setResults([]);
            }}
            disabled={filteredStudents.length === 0}
            className="border rounded px-3 py-2"
          >
            <option value="">Select Student</option>
            {filteredStudents.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.admissionNumber})
              </option>
            ))}
          </select>

          <select
            value={selectedSession?._id || ""}
            onChange={(e) => {
              const ses = sessions.find(s => s._id === e.target.value);
              setSelectedSession(ses || null);
              setSelectedTerm(null);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="">All Sessions</option>
            {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <select
            value={selectedTerm?._id || ""}
            onChange={(e) => {
              const term = selectedSession?.terms?.find(t => t._id === e.target.value);
              setSelectedTerm(term || null);
            }}
            disabled={!selectedSession}
            className="border rounded px-3 py-2"
          >
            <option value="">All Terms</option>
            {selectedSession?.terms?.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>

          <button
            onClick={fetchResults}
            disabled={loading || !selectedStudent}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Load Results"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 border border-green-200">{success}</div>}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">
              Results for {selectedStudent?.name} ({results.length} records)
            </h3>
            <button
              onClick={deleteAllDisplayed}
              className="bg-red-700 text-white px-4 py-2 rounded text-sm hover:bg-red-800"
            >
              Delete All Shown
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Session</th>
                  <th className="px-4 py-2 text-left">Term</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-2 py-2">CA1</th>
                  <th className="px-2 py-2">CA2</th>
                  <th className="px-2 py-2">Exam</th>
                  <th className="px-2 py-2">Total</th>
                  <th className="px-2 py-2">Grade</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{r.session}</td>
                    <td className="px-4 py-2">{r.term}</td>
                    <td className="px-4 py-2 font-medium">{r.subject}</td>
                    <td className="px-2 py-2 text-center">{r.ca1 ?? '-'}</td>
                    <td className="px-2 py-2 text-center">{r.ca2 ?? '-'}</td>
                    <td className="px-2 py-2 text-center">{r.exam ?? '-'}</td>
                    <td className="px-2 py-2 font-bold text-center">{r.total ?? '-'}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        r.grade === 'A' ? 'bg-green-100 text-green-800' :
                        r.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        r.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        r.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                        r.grade === 'F' ? 'bg-red-200 text-red-900' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {r.grade ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => {
                          // You need the actual Result document _id here.
                          // If your /results/by-student returns the _id on each subject row, use r._id
                          // Otherwise you may need to adjust the backend to return it.
                          if (r._id) deleteSingleResult(r._id);
                          else alert("Result ID missing – cannot delete.");
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && selectedStudent && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No results found for the selected filters.</p>
        </div>
      )}

      {!selectedStudent && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-400">Select a class and student to load results for deletion.</p>
        </div>
      )}
    </div>
  );
}