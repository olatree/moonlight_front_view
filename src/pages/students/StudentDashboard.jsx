// src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ComputerIcon, CreditCard, FileText, NotebookTabs, User } from "lucide-react";
import api from "../../api/axios";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/students/me/profile");
      setProfile(res.data.data);
    } catch (err) {
      console.error("Student profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading dashboard...</div>;
  }

  const student = profile?.student || {};
  const enrollment = profile?.enrollment || {};

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <img
            src={student.image || "/default-avatar.png"}
            alt={student.name}
            className="h-24 w-24 rounded-full border-4 border-white object-cover"
          />

          <div className="flex-1">
            <p className="text-sm opacity-80">Welcome back,</p>
            <h1 className="text-2xl font-bold">{student.name || "Student"}</h1>

            <p className="mt-1 text-sm opacity-90">
              Admission No: {student.admissionNumber || "N/A"}
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                Class: {enrollment.classId?.name || "N/A"}
              </span>

              <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                Arm: {enrollment.armId?.name || "N/A"}
              </span>

              <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                Session: {enrollment.sessionId?.name || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          icon={<FileText />}
          title="My Results"
          text="View and print your term results"
          to="/student/result"
        />

        <DashboardCard
          icon={<CreditCard />}
          title="My Fees"
          text="Check your fee balance and payments"
          to="/student/fees"
        />

        <DashboardCard
          icon={<NotebookTabs size={16} />}
          title="E-Learning"
          text="Access available learning materials"
          to="/student/lessons"
        />

        <DashboardCard
          icon={<ComputerIcon />}
          title="CBT Exams"
          text="Access available exams"
          to="/student/exams"
        />

        <DashboardCard
          icon={<User />}
          title="My Profile"
          text="View your student information"
          to="/student/profile"
        />
      </div>
    </div>
  );
}

const DashboardCard = ({ icon, title, text, to }) => (
  <Link
    to={to}
    className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
  >
    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
      {icon}
    </div>

    <h3 className="font-bold text-gray-800">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{text}</p>
  </Link>
);