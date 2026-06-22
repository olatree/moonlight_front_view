
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  Settings,
  ChevronDown,
  HomeIcon,
} from "lucide-react";
import { FaBookOpen } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

// Reusable NavItem component
const NavItem = ({ to, label, icon, onClick, end = false }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-green-100 text-green-700 font-medium"
          : "text-gray-700 hover:bg-gray-100"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

// Reusable CollapsibleSection component
const CollapsibleSection = ({ title, icon, isOpen, onToggle, children }) => (
  <div>
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span className="flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </span>
      <ChevronDown
        size={16}
        className={`transform transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    {isOpen && <div className="ml-6 mt-1 space-y-1">{children}</div>}
  </div>
);

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  
  
  // Separate state for each role's collapsible menus
  const [adminMenus, setAdminMenus] = useState({
    teacher: false,
    student: false,
    result: false,
    cbt: false,
  });
  
  const [principalMenus, setPrincipalMenus] = useState({
    teacher: false,
    result: false,
  });
  
  const [teacherMenus, setTeacherMenus] = useState({
    result: false,
  });

  // Toggle functions for each role
  const toggleAdminMenu = (menu) => {
    setAdminMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };
  
  const togglePrincipalMenu = (menu) => {
    setPrincipalMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };
  
  const toggleTeacherMenu = (menu) => {
    setTeacherMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Admin Sidebar Content
  const AdminSidebar = () => (
    <>
      <NavItem to="/admin/" label="Dashboard" icon={<HomeIcon size={18} />} onClick={onClose} end />
      <NavItem to="/admin/sessions" label="Manage Session" icon={<Settings size={18} />} onClick={onClose} />
      <NavItem to="/admin/classes" label="Manage Classes" icon={<ClipboardList size={18} />} onClick={onClose} />
      <NavItem to="/admin/subjects" label="Manage Subjects" icon={<BookOpen size={18} />} onClick={onClose} />
      <NavItem to="/admin/assign-subject-class" label="Assign Subject To Class" icon={<FaBookOpen size={18} />} onClick={onClose} />
      <NavItem to="/admin/admins" label="Manage Admins" icon={<Users size={18} />} onClick={onClose} />
      <NavItem to="/admin/principals" label="Manage Principals" icon={<ClipboardList size={18} />} onClick={onClose} />
      {/* <NavItem to="/admin/cbt" label="Manage Tests" icon={<ClipboardList size={18} />} onClick={onClose} /> */}
      {/* <NavItem to="/admin/fees/types" label="Manage Fees" icon={<Settings size={18} />} onClick={onClose} /> */}


     {/* Fee Management */}
      <CollapsibleSection
        title="Fee Management"
        icon={<Users size={18} />}
        isOpen={adminMenus.fee}
        onToggle={() => toggleAdminMenu("fee")}
      >
        <NavItem to="/admin/fees/payment-analysis" label="Analysis" icon={<Settings size={18} />} onClick={onClose} />
        <NavItem to="/admin/fees/types" label="Fee Types" icon={<Settings size={18} />} onClick={onClose} />
        <NavItem to="/admin/fees/structures" label="Fee Structure" onClick={onClose} />
        <NavItem to="/admin/fees/generate-accounts" label="Generate Fee Accounts" onClick={onClose} />
        <NavItem to="/admin/fees/accounts" label="View Fee Accounts" onClick={onClose} />
        <NavItem to="/admin/fees/debtors" label="Debtors List" onClick={onClose} />
      </CollapsibleSection>

      {/* CBT Management */} 
      <CollapsibleSection
        title="Manage CBT"
        icon={<Users size={18} />}
        isOpen={adminMenus.cbt}
        onToggle={() => toggleAdminMenu("cbt")}
      >
        <NavItem to="/admin/cbt/banks" label="Question Banks" onClick={onClose} />
        <NavItem to="/admin/cbt/exams/create" label="Create Exam" onClick={onClose} />
        <NavItem to="/admin/cbt/exams" label="View Exams" onClick={onClose} />
        <NavItem to="/admin/cbt/exams/results" label="CBT Results" onClick={onClose} />
      </CollapsibleSection>

      {/* Student Management */}
      <CollapsibleSection
        title="Student Management"
        icon={<Users size={18} />}
        isOpen={adminMenus.student}
        onToggle={() => toggleAdminMenu("student")}
      >
        <NavItem to="/admin/add-student" label="Register New Student" onClick={onClose} />
        <NavItem to="/admin/view-students" label="View Students" onClick={onClose} />
        <NavItem to="/admin/manage-students" label="Manage Students" onClick={onClose} />
      </CollapsibleSection>

      {/* Teacher Management */}
      <CollapsibleSection
        title="Teacher Management"
        icon={<Users size={18} />}
        isOpen={adminMenus.teacher}
        onToggle={() => toggleAdminMenu("teacher")}
      >
        <NavItem to="/admin/teachers" label="Manage Teachers" onClick={onClose} />
        <NavItem to="/admin/assign-teacher-subjects" label="Assign Subjects" onClick={onClose} />
        <NavItem to="/admin/assign-class-teachers" label="Assign Class Teachers" onClick={onClose} />
        <NavItem to="/admin/view-class-teachers" label="View Class Teachers" onClick={onClose} />
      </CollapsibleSection>

      {/* Result Management */}
      <CollapsibleSection
        title="Result Management"
        icon={<Users size={18} />}
        isOpen={adminMenus.result}
        onToggle={() => toggleAdminMenu("result")}
      >
        <NavItem to="/admin/enter-results" label="Enter Result" onClick={onClose} />
        <NavItem to="/admin/attendance" label="Attendance Management" onClick={onClose} />
        <NavItem to="/admin/enter-comments" label="Principal Comments" onClick={onClose} />
        <NavItem to="/admin/teacher-comments" label="Teacher Comments" onClick={onClose} />
        <NavItem to="/admin/view-results" label="View Results By Subject" onClick={onClose} />
        <NavItem to="/admin/view-Student-results" label="View Student Result" onClick={onClose} />
        <NavItem to="/admin/delete-student-results" label="Delete Student Result" onClick={onClose} />
        <NavItem to="/admin/view-results-by-class" label="View Result By Class" onClick={onClose} />
        <NavItem to="/admin/delete-results" label="Delete Results" onClick={onClose} />
        <NavItem to="/admin/promote-repeat" label="Promote or Repeat Student" onClick={onClose} />
      </CollapsibleSection>
    </>
  );

  // Principal Sidebar Content
  const PrincipalSidebar = () => (
    <>
      <NavItem to="/admin/" label="Dashboard" icon={<HomeIcon size={18} />} onClick={onClose} end />
      <NavItem to="/admin/subjects" label="Manage Subjects" icon={<BookOpen size={18} />} onClick={onClose} />
      <NavItem to="/admin/assign-subject-class" label="Assign Subject To Class" icon={<FaBookOpen size={18} />} onClick={onClose} />

      {/* Teacher Management */}
      <CollapsibleSection
        title="Teacher Management"
        icon={<Users size={18} />}
        isOpen={principalMenus.teacher}
        onToggle={() => togglePrincipalMenu("teacher")}
      >
        <NavItem to="/admin/assign-teacher-subjects" label="Assign Subjects" onClick={onClose} />
        <NavItem to="/admin/assign-class-teachers" label="Assign Class Teachers" onClick={onClose} />
        <NavItem to="/admin/view-class-teachers" label="View Class Teachers" onClick={onClose} />
      </CollapsibleSection>

      {/* Result Management */}
      <CollapsibleSection
        title="Result Management"
        icon={<Users size={18} />}
        isOpen={principalMenus.result}
        onToggle={() => togglePrincipalMenu("result")}
      >
        <NavItem to="/admin/enter-results" label="Enter Result" onClick={onClose} />
        <NavItem to="/admin/attendance" label="Attendance Management" onClick={onClose} />
        <NavItem to="/admin/enter-comments" label="Principal Comments" onClick={onClose} />
        <NavItem to="/admin/teacher-comments" label="Teacher Comments" onClick={onClose} />
        <NavItem to="/admin/view-results" label="View Results By Subject" onClick={onClose} />
        <NavItem to="/admin/view-results-by-class" label="View Result By Class" onClick={onClose} />
      </CollapsibleSection>
    </>
  );

  // Teacher Sidebar Content
  const TeacherSidebar = () => (
    <>
      <NavItem to="/admin/" label="Dashboard" icon={<HomeIcon size={18} />} onClick={onClose} end />

      {/* Result Management */}
      <CollapsibleSection
        title="Result Management"
        icon={<Users size={18} />}
        isOpen={teacherMenus.result}
        onToggle={() => toggleTeacherMenu("result")}
      >
        <NavItem to="/admin/enter-results" label="Enter Result" onClick={onClose} />
        
        {/* Only show for class teachers */}
        {user?.isClassTeacher && (
          <>
            <NavItem to="/admin/attendance" label="Attendance Management" onClick={onClose} />
            <NavItem to="/admin/teacher-comments" label="Teacher Comments" onClick={onClose} />
          </>
        )}
        
        <NavItem to="/admin/view-results" label="View Results By Subject" onClick={onClose} />
        <NavItem to="/admin/view-results-by-class" label="View Result By Class" onClick={onClose} />
      </CollapsibleSection>
    </>
  );

  // Class Teacher Sidebar Content (extends Teacher)
  const ClassTeacherSidebar = () => (
    <>
      <NavItem to="/admin/" label="Dashboard" icon={<HomeIcon size={18} />} onClick={onClose} end />
      <NavItem to="/admin/scores" label="Record Scores" icon={<BookOpen size={18} />} onClick={onClose} />
      <NavItem to="/admin/attendance" label="Attendance" icon={<Calendar size={18} />} onClick={onClose} />
    </>
  );

  // Determine which sidebar to show based on role
  const renderSidebarContent = () => {
    switch (user?.role) {
      case "admin":
      case "super_admin":
      case "master_admin":
        return <AdminSidebar />;
      case "principal":
        return <PrincipalSidebar />;
      case "class_teacher":
        return <ClassTeacherSidebar />;
      case "teacher":
        return <TeacherSidebar />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
        aria-label="Close menu overlay"
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col z-50 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:shadow-none`}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between md:justify-center flex-shrink-0">
          <h1 className="text-xl font-bold text-green-600">School Admin</h1>
          <button 
            className="md:hidden text-gray-600 hover:text-gray-900" 
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav container with scroll */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {renderSidebarContent()}
        </nav>
      </aside>
    </>
  );
}