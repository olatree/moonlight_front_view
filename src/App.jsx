import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";


import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
// import UsersPage from "./pages/admin/Users";
import HomePage from "./pages/HomePage";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import SessionsPage from "./pages/admin/SessionPage";
import ClassesPage from "./pages/admin/ClassesPage";
import AdminManagement from "./pages/admin/AdminManagement";
import PrincipalManagement from "./pages/admin/PrincipalManagement";
import TeacherManagement from "./pages/admin/TeacherManagement";
import SubjectManagement from "./pages/admin/SubjectManagement";
import SubjectAssignment from "./pages/admin/SubjectAssignment";
import TeacherAssignment from "./pages/admin/TeacherAssignment";
import ClassTeacherAssignment from "./pages/admin/ClassTeacherAssignment";
import ViewClassTeachers from "./pages/admin/ViewClassTeachers";
import RegisterStudent from "./pages/admin/RegisterStudent";
import ViewStudents from "./pages/admin/ViewStudents";
import StudentManagement from "./pages/admin/StudentManagement";
import ResultEnteryPage from "./pages/admin/ResultEnteryPage";
import AttendanceManagement from "./pages/admin/ManageAttendance";
import ViewResultPage from "./pages/admin/ViewResultPage";
import ViewResultByClass from "./pages/admin/ViewResultByClass";
import ViewResultByStudent from "./pages/admin/ViewResultByStudent";
import DeleteStudentResult from "./pages/admin/DeleteStudentResult";
import StudentLogin from "./pages/StudentLogin";
import StudentLayout from "./layouts/StudentLayout";
import StudentViewResult from "./pages/students/StudentViewResult"
import PrincipalComments from "./pages/admin/PrincipalComments";
import TeacherComments from "./pages/admin/TeacherComments";
import PromoteRepeatStudent from "./pages/admin/PromoteRepeatStudents";
import DeleteResult from "./pages/admin/DeleterResult";
// import ManageFees from "./pages/admin/ManageFees";
import QuestionBanks from "./pages/admin/cbt/QuestionBanks";
import QuestionBankDetail from "./pages/admin/cbt/QuestionBankDetail";
import ExamCreate from "./pages/admin/cbt/ExamCreate";
import ExamList from "./pages/admin/cbt/ExamList";
import ExamDetail from "./pages/admin/cbt/ExamDetail";
import ExamLobby from "./pages/students/cbt/ExamLobby";
import ExamRunner from "./pages/students/cbt/ExamRunner";
import StudentExamResult from "./pages/students/cbt/StudentExamResult";
import StudentExams from "./pages/students/cbt/StudentExams";
import CbtResults from "./pages/admin/cbt/CbtResults";
import ExamEdit from "./pages/admin/cbt/ExamEdit";
import FeeTypesPage from "./pages/admin/fees/FeeTypesPage";
import FeeStructurePage from "./pages/admin/fees/FeeStructurePage";
import GenerateFeeAccountsPage from "./pages/admin/fees/GenerateFeeAccountsPage";
import FeeAccountsPage from "./pages/admin/fees/FeeAccountsPage";
import FeeAccountDetailsPage from "./pages/admin/fees/FeeAccountDetailsPage"; 
import FeeReceiptPage from "./pages/admin/fees/FeeReceiptPage";
import DebtorsListPage from "./pages/admin/fees/DebtorsListPage";
import PaymentAnalysisPage from "./pages/admin/fees/PaymentAnalysisPage";


export default function App() {
  return (
    <>
        <Toaster position="top-right" />
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* Dashboard: accessible to all logged-in roles */}
          <Route index element={<Dashboard />} />

          {/* Users page: only admin + super_admin */}
          <Route
            element={<RoleProtectedRoute allowedRoles={['admin','super_admin', 'master_admin']} />}
          >
            {/* <Route path="users" element={<UsersPage />} /> */}
          </Route>

          {/* Example: Sessions page: only super_admin */}
          <Route
            element={<RoleProtectedRoute allowedRoles={['master_admin', 'super_admin', 'admin', 'principal', 'teacher']} />}
          >
            <Route path="sessions" element={ <SessionsPage /> }/>
            <Route path="classes" element={ <ClassesPage /> }/>
            <Route path="admins" element={ <AdminManagement /> }/>
            <Route path="principals" element={< PrincipalManagement />}/>
            <Route path="cbt/banks" element={< QuestionBanks />}/>
            <Route path="cbt/banks/:bankId" element={<QuestionBankDetail />} />
            <Route path="teachers" element={ <TeacherManagement /> }/>
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="assign-subject-class" element={<SubjectAssignment />} />
            <Route path="assign-teacher-subjects" element={<TeacherAssignment />} />
            <Route path="assign-class-teachers" element={<ClassTeacherAssignment />} />
            <Route path="view-class-teachers" element={<ViewClassTeachers />} />
            <Route path="add-student" element={<RegisterStudent />} />
            <Route path="view-students" element={<ViewStudents /> } />
            <Route path="manage-students" element={<StudentManagement /> } />
            <Route path="enter-results" element={<ResultEnteryPage /> } />
            <Route path="attendance" element={<AttendanceManagement /> } />
            <Route path="enter-comments" element={<PrincipalComments />} />
            <Route path="teacher-comments" element={<TeacherComments />} />
            <Route path="view-results" element={<ViewResultPage /> } />
            <Route path="view-results-by-class" element={<ViewResultByClass /> } />
            <Route path="view-student-results" element={<ViewResultByStudent /> } />
            <Route path="delete-student-results" element={<DeleteStudentResult /> } />
            <Route path="promote-repeat" element={<PromoteRepeatStudent />} />
            <Route path="delete-results" element={<DeleteResult />} />
            {/* <Route path="manage-fees" element={<ManageFees />} /> */}
            <Route path="/admin/fees/types" element={<FeeTypesPage />} />
            <Route path="/admin/fees/structures" element={<FeeStructurePage/>} />
            <Route path="/admin/fees/generate-accounts" element={<GenerateFeeAccountsPage />} />
            <Route path="/admin/fees/accounts" element={<FeeAccountsPage />} />
            <Route path="/admin/fees/accounts/:id" element={<FeeAccountDetailsPage />} />
            <Route path="/admin/fees/receipts/:paymentId" element={<FeeReceiptPage />} />
            <Route path="/admin/fees/debtors" element={<DebtorsListPage />} />
            <Route path="cbt/exams/create" element={<ExamCreate />} />
            <Route path="cbt/exams"          element={<ExamList />} />
            <Route path="cbt/exams/:examId"  element={<ExamDetail />} />
            <Route path="cbt/exams/:examId/results" element={<CbtResults />} />
            <Route path="cbt/exams/results" element={<CbtResults />} />
            <Route path="cbt/exams/:examId/edit" element={<ExamEdit />} />
            <Route path="/admin/fees/payment-analysis" element={<PaymentAnalysisPage />} />
          </Route>
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="result" element={<StudentViewResult />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="exams/:examId/lobby" element={<ExamLobby />} />
          <Route path="exams/:examId/run/:sessionId" element={<ExamRunner />} />
          <Route path="exams/:examId/result/:sessionId" element={<StudentExamResult />} />
        </Route>
      </Route>

    </Routes>
    </>
  );
}
