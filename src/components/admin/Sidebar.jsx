import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  Users,
  BookOpen,
  ClipboardList,
  Settings,
  ChevronDown,
  GraduationCap,
  UserPlus,
  UserCog,
  FileText,
  Calendar,
  MessageSquare,
  BarChart3,
  CreditCard,
  Wallet,
  Receipt,
  AlertTriangle,
  Landmark,
  NotebookTabs,
  PlusCircle,
  LibraryBig,
  ClipboardCheck,
  School,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const NavItem = ({ to, label, icon, onClick, end = false }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-green-100 font-medium text-green-700"
          : "text-gray-700 hover:bg-gray-100"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const CollapsibleSection = ({ title, icon, isOpen, onToggle, children }) => (
  <div>
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
    >
      <span className="flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </span>

      <ChevronDown
        size={16}
        className={`transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>

    {isOpen && <div className="ml-6 mt-1 space-y-1">{children}</div>}
  </div>
);

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const [adminMenus, setAdminMenus] = useState({
    fee: false,
    cbt: false,
    lessons: false,
    student: false,
    teacher: false,
    result: false,
  });

  const [principalMenus, setPrincipalMenus] = useState({
    cbt: false,
    teacher: false,
    result: false,
    lessons: false,
  });

  const [teacherMenus, setTeacherMenus] = useState({
    result: false,
    lessons: false,
  });

  const toggleAdminMenu = (menu) => {
    setAdminMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const togglePrincipalMenu = (menu) => {
    setPrincipalMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const toggleTeacherMenu = (menu) => {
    setTeacherMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const AdminSidebar = () => (
    <>
      <NavItem
        to="/admin/"
        label="Dashboard"
        icon={<HomeIcon size={18} />}
        onClick={onClose}
        end
      />

      <NavItem
        to="/admin/sessions"
        label="Manage Session"
        icon={<Calendar size={18} />}
        onClick={onClose}
      />

      <NavItem
        to="/admin/classes"
        label="Manage Classes"
        icon={<School size={18} />}
        onClick={onClose}
      />

      <NavItem
        to="/admin/subjects"
        label="Manage Subjects"
        icon={<BookOpen size={18} />}
        onClick={onClose}
      />

      <NavItem
        to="/admin/assign-subject-class"
        label="Assign Subject To Class"
        icon={<LibraryBig size={18} />}
        onClick={onClose}
      />

      <NavItem
        to="/admin/admins"
        label="Manage Admins"
        icon={<ShieldCheck size={18} />}
        onClick={onClose}
      />

      <NavItem
        to="/admin/principals"
        label="Manage Principals"
        icon={<UserCog size={18} />}
        onClick={onClose}
      />

      <CollapsibleSection
        title="Fee Management"
        icon={<Wallet size={18} />}
        isOpen={adminMenus.fee}
        onToggle={() => toggleAdminMenu("fee")}
      >
        <NavItem
          to="/admin/fees/payment-analysis"
          label="Analysis"
          icon={<BarChart3 size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/fees/types"
          label="Fee Types"
          icon={<Settings size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/fees/structures"
          label="Fee Structure"
          icon={<Landmark size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/fees/generate-accounts"
          label="Generate Accounts"
          icon={<PlusCircle size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/fees/accounts"
          label="Fee Accounts"
          icon={<CreditCard size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/fees/debtors"
          label="Debtors List"
          icon={<AlertTriangle size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/fees/receipts"
          label="Receipts"
          icon={<Receipt size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Manage CBT"
        icon={<ClipboardCheck size={18} />}
        isOpen={adminMenus.cbt}
        onToggle={() => toggleAdminMenu("cbt")}
      >
        <NavItem
          to="/admin/cbt/banks"
          label="Question Banks"
          icon={<LibraryBig size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/cbt/exams/create"
          label="Create Exam"
          icon={<PlusCircle size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/cbt/exams"
          label="View Exams"
          icon={<ClipboardList size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/cbt/exams/results"
          label="CBT Results"
          icon={<BarChart3 size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Lesson Management"
        icon={<NotebookTabs size={18} />}
        isOpen={adminMenus.lessons}
        onToggle={() => toggleAdminMenu("lessons")}
      >
        <NavItem
          to="/admin/lessons/create"
          label="Create Lesson"
          icon={<PlusCircle size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/lessons"
          label="Manage Lessons"
          icon={<NotebookTabs size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/lessons/drafts"
          label="Draft Lessons"
          icon={<FileText size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Student Management"
        icon={<GraduationCap size={18} />}
        isOpen={adminMenus.student}
        onToggle={() => toggleAdminMenu("student")}
      >
        <NavItem
          to="/admin/add-student"
          label="Register New Student"
          icon={<UserPlus size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-students"
          label="View Students"
          icon={<Users size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/manage-students"
          label="Manage Students"
          icon={<UserCog size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Teacher Management"
        icon={<Users size={18} />}
        isOpen={adminMenus.teacher}
        onToggle={() => toggleAdminMenu("teacher")}
      >
        <NavItem
          to="/admin/teachers"
          label="Manage Teachers"
          icon={<Users size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/assign-teacher-subjects"
          label="Assign Subjects"
          icon={<BookOpen size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/assign-class-teachers"
          label="Assign Class Teachers"
          icon={<UserCog size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-class-teachers"
          label="View Class Teachers"
          icon={<ClipboardList size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Result Management"
        icon={<FileText size={18} />}
        isOpen={adminMenus.result}
        onToggle={() => toggleAdminMenu("result")}
      >
        <NavItem
          to="/admin/enter-results"
          label="Enter Result"
          icon={<FileText size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/attendance"
          label="Attendance"
          icon={<Calendar size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/enter-comments"
          label="Principal Comments"
          icon={<MessageSquare size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/teacher-comments"
          label="Teacher Comments"
          icon={<MessageSquare size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-results"
          label="View Results By Subject"
          icon={<ClipboardList size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-Student-results"
          label="View Student Result"
          icon={<FileText size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-results-by-class"
          label="View Result By Class"
          icon={<BarChart3 size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/delete-results"
          label="Delete Results"
          icon={<AlertTriangle size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/promote-repeat"
          label="Promote or Repeat"
          icon={<GraduationCap size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/publish-results"
          label="Publish Results"
          icon={<ClipboardCheck size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>
    </>
  );

  const PrincipalSidebar = () => (
    <>
      <NavItem
        to="/admin/"
        label="Dashboard"
        icon={<HomeIcon size={18} />}
        onClick={onClose}
        end
      />

      <NavItem
        to="/admin/subjects"
        label="Manage Subjects"
        icon={<BookOpen size={18} />}
        onClick={onClose}
      />

      <NavItem
        to="/admin/assign-subject-class"
        label="Assign Subject To Class"
        icon={<LibraryBig size={18} />}
        onClick={onClose}
      />

      {/* <CollapsibleSection
        title="Lesson Management"
        icon={<NotebookTabs size={18} />}
        isOpen={principalMenus.lessons}
        onToggle={() => togglePrincipalMenu("lessons")}
      >
        <NavItem
          to="/admin/lessons"
          label="View Lessons"
          icon={<NotebookTabs size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection> */}

            <CollapsibleSection
        title="Lesson Management"
        icon={<NotebookTabs size={18} />}
        isOpen={principalMenus.lessons}
        onToggle={() => togglePrincipalMenu("lessons")}
      >
        <NavItem
          to="/admin/lessons/create"
          label="Create Lesson"
          icon={<PlusCircle size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/lessons"
          label="Manage Lessons"
          icon={<NotebookTabs size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/lessons/drafts"
          label="Draft Lessons"
          icon={<FileText size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Manage CBT"
        icon={<ClipboardCheck size={18} />}
        isOpen={principalMenus.cbt}
        onToggle={() => togglePrincipalMenu("cbt")}
      >
        <NavItem
          to="/admin/cbt/banks"
          label="Question Banks"
          icon={<LibraryBig size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/cbt/exams/create"
          label="Create Exam"
          icon={<PlusCircle size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/cbt/exams"
          label="View Exams"
          icon={<ClipboardList size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/cbt/exams/results"
          label="CBT Results"
          icon={<BarChart3 size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Teacher Management"
        icon={<Users size={18} />}
        isOpen={principalMenus.teacher}
        onToggle={() => togglePrincipalMenu("teacher")}
      >

         <NavItem
          to="/admin/teachers"
          label="Manage Teachers"
          icon={<Users size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/assign-teacher-subjects"
          label="Assign Subjects"
          icon={<BookOpen size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/assign-class-teachers"
          label="Assign Class Teachers"
          icon={<UserCog size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-class-teachers"
          label="View Class Teachers"
          icon={<ClipboardList size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Result Management"
        icon={<FileText size={18} />}
        isOpen={principalMenus.result}
        onToggle={() => togglePrincipalMenu("result")}
      >
        <NavItem
          to="/admin/enter-results"
          label="Enter Result"
          icon={<FileText size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/attendance"
          label="Attendance"
          icon={<Calendar size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/enter-comments"
          label="Principal Comments"
          icon={<MessageSquare size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/teacher-comments"
          label="Teacher Comments"
          icon={<MessageSquare size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-results"
          label="View Results By Subject"
          icon={<ClipboardList size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-results-by-class"
          label="View Result By Class"
          icon={<BarChart3 size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>
    </>
  );

  const TeacherSidebar = () => (
    <>
      <NavItem
        to="/admin/"
        label="Dashboard"
        icon={<HomeIcon size={18} />}
        onClick={onClose}
        end
      />

      <CollapsibleSection
        title="Lesson Management"
        icon={<NotebookTabs size={18} />}
        isOpen={teacherMenus.lessons}
        onToggle={() => toggleTeacherMenu("lessons")}
      >
        <NavItem
          to="/admin/lessons/create"
          label="Create Lesson"
          icon={<PlusCircle size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/lessons"
          label="My Lessons"
          icon={<NotebookTabs size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Result Management"
        icon={<FileText size={18} />}
        isOpen={teacherMenus.result}
        onToggle={() => toggleTeacherMenu("result")}
      >
        <NavItem
          to="/admin/enter-results"
          label="Enter Result"
          icon={<FileText size={16} />}
          onClick={onClose}
        />

        {user?.isClassTeacher && (
          <>
            <NavItem
              to="/admin/attendance"
              label="Attendance"
              icon={<Calendar size={16} />}
              onClick={onClose}
            />

            <NavItem
              to="/admin/teacher-comments"
              label="Teacher Comments"
              icon={<MessageSquare size={16} />}
              onClick={onClose}
            />
          </>
        )}

        <NavItem
          to="/admin/view-results"
          label="View Results By Subject"
          icon={<ClipboardList size={16} />}
          onClick={onClose}
        />

        <NavItem
          to="/admin/view-results-by-class"
          label="View Result By Class"
          icon={<BarChart3 size={16} />}
          onClick={onClose}
        />
      </CollapsibleSection>
    </>
  );

  const renderSidebarContent = () => {
    switch (user?.role) {
      case "admin":
      case "super_admin":
      case "master_admin":
        return <AdminSidebar />;

      case "principal":
        return <PrincipalSidebar />;

      case "teacher":
      case "class_teacher":
        return <TeacherSidebar />;

      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 transform flex-col bg-white shadow-lg transition-transform duration-300 md:static md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b p-4 md:justify-center">
          <h1 className="text-xl font-bold text-green-600">School Admin</h1>

          <button
            type="button"
            className="text-gray-600 hover:text-gray-900 md:hidden"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {renderSidebarContent()}
        </nav>
      </aside>
    </>
  );
}