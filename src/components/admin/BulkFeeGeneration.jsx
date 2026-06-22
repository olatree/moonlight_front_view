import React, { useState, useEffect } from 'react';
import api from "../../api/axios";

const BulkFeeGeneration = ({ sessions, classes, terms, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedArm, setSelectedArm] = useState('');
  const [arms, setArms] = useState([]);
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    if (selectedClass) {
      const selectedClassObj = classes.find(c => c._id === selectedClass);
      if (selectedClassObj) {
        setArms(selectedClassObj.arms || selectedClassObj.armsList || []);
      }
    }
  }, [selectedClass, classes]);
  
  const handleGenerateForClass = async () => {
    if (!selectedClass || !selectedSession || !selectedTerm) {
      alert('Please select class, session, and term');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/fees/generate-bulk/class', {
        classId: selectedClass,
        sessionId: selectedSession,
        termId: selectedTerm
      });
      
      setResult(response.data.data);
      if (onComplete) onComplete();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate fee accounts');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateForArm = async () => {
    if (!selectedClass || !selectedArm || !selectedSession || !selectedTerm) {
      alert('Please select class, arm, session, and term');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/fees/generate-bulk/arm', {
        classId: selectedClass,
        armId: selectedArm,
        sessionId: selectedSession,
        termId: selectedTerm
      });
      
      setResult(response.data.data);
      if (onComplete) onComplete();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate fee accounts');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Bulk Fee Account Generation</h3>
      <p className="text-gray-600 mb-4">
        Generate fee accounts for all students in a class or arm based on existing fee structures.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Session</option>
            {sessions.map(session => (
              <option key={session._id} value={session._id}>{session.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedSession}
          >
            <option value="">Select Term</option>
            {terms.map(term => (
              <option key={term._id} value={term._id}>{term.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Arm (Optional)</label>
          <select
            value={selectedArm}
            onChange={(e) => setSelectedArm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedClass}
          >
            <option value="">All Arms</option>
            {arms.map(arm => (
              <option key={arm._id} value={arm._id}>{arm.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={handleGenerateForClass}
          disabled={loading || !selectedClass || !selectedSession || !selectedTerm}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate for Entire Class'}
        </button>
        
        <button
          onClick={handleGenerateForArm}
          disabled={loading || !selectedClass || !selectedArm || !selectedSession || !selectedTerm}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate for Specific Arm'}
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Generation Results</h4>
          <p className="text-sm text-green-600">Successful: {result.successful?.length || 0}</p>
          <p className="text-sm text-red-600">Failed: {result.failed?.length || 0}</p>
          {result.successful?.length > 0 && (
            <details className="mt-2">
              <summary className="text-sm cursor-pointer text-blue-600">View Successful</summary>
              <ul className="mt-2 text-sm list-disc list-inside">
                {result.successful.slice(0, 10).map((s, i) => (
                  <li key={i}>{s.studentName || s} - ₦{s.totalAmount?.toLocaleString()}</li>
                ))}
                {result.successful.length > 10 && <li>...and {result.successful.length - 10} more</li>}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkFeeGeneration;