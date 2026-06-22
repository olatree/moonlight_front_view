

// // src/pages/StudentLogin.jsx
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AlertCircle, Eye, EyeOff, Lock, User } from "lucide-react";
// import api from "../api/axios";

// export default function StudentLogin() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     admissionNumber: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const getErrorMessage = (err) => {
//     return (
//       err?.response?.data?.message ||
//       err?.message ||
//       "Login failed. Please try again."
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.admissionNumber.trim() || !formData.password.trim()) {
//       setError("Admission number and password are required.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const res = await api.post("/students/login", {
//         admissionNumber: formData.admissionNumber.trim(),
//         password: formData.password,
//       });

//       // const student = res.data.data || res.data.student;

//       // if (!student) {
//       //   setError("Invalid login response from server.");
//       //   return;
//       // }

//       // localStorage.setItem("studentData", JSON.stringify(student));

//       // navigate("/student", { replace: true });

//       const student = res.data.data || res.data.student;
// const token = res.data.token || res.data.studentToken || res.data.data?.token;

// if (!student || !token) {
//   console.log("Login response:", res.data);
//   setError("Invalid login response from server. Token missing.");
//   return;
// }

// localStorage.setItem("studentToken", token);
// localStorage.setItem("studentData", JSON.stringify(student));

// navigate("/student", { replace: true });
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
//       <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
//         <div className="mb-8 text-center">
//           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600">
//             <User className="h-8 w-8 text-white" />
//           </div>

//           <h1 className="text-3xl font-bold text-gray-900">
//             Student Login
//           </h1>

//           <p className="mt-2 text-sm text-gray-600">
//             Access your student portal
//           </p>
//         </div>

//         {error && (
//           <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
//             <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label
//               htmlFor="admissionNumber"
//               className="mb-2 block text-sm font-medium text-gray-700"
//             >
//               Admission Number
//             </label>

//             <div className="relative">
//               <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

//               <input
//                 id="admissionNumber"
//                 name="admissionNumber"
//                 type="text"
//                 value={formData.admissionNumber}
//                 onChange={handleChange}
//                 autoComplete="username"
//                 placeholder="Enter admission number"
//                 className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
//               />
//             </div>
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="mb-2 block text-sm font-medium text-gray-700"
//             >
//               Password
//             </label>

//             <div className="relative">
//               <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

//               <input
//                 id="password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 value={formData.password}
//                 onChange={handleChange}
//                 autoComplete="current-password"
//                 placeholder="Enter password"
//                 className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword((prev) => !prev)}
//                 className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-5 w-5" />
//                 ) : (
//                   <Eye className="h-5 w-5" />
//                 )}
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center justify-between text-sm">
//             <label className="flex items-center gap-2 text-gray-600">
//               <input
//                 type="checkbox"
//                 className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
//               />
//               Remember me
//             </label>

//             <Link
//               to="/forgot-password"
//               className="font-medium text-indigo-600 hover:text-indigo-500"
//             >
//               Forgot password?
//             </Link>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-600">
//           Need help?{" "}
//           <Link
//             to="/contact"
//             className="font-medium text-indigo-600 hover:text-indigo-500"
//           >
//             Contact support
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


// // src/pages/StudentLogin.jsx
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AlertCircle, Eye, EyeOff, Lock, User } from "lucide-react";
// import api from "../api/axios";

// export default function StudentLogin() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     admissionNumber: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(true);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const getErrorMessage = (err) => {
//     return (
//       err?.response?.data?.message ||
//       err?.message ||
//       "Login failed. Please try again."
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const admissionNumber = formData.admissionNumber.trim();
//     const password = formData.password.trim();

//     if (!admissionNumber || !password) {
//       setError("Admission number and password are required.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const res = await api.post("/students/login", {
//         admissionNumber,
//         password,
//       });

//       const student = res.data.data || res.data.student;
//       const token = res.data.token || res.data.studentToken;

//       if (!student || !token) {
//         console.log("Student login response:", res.data);
//         setError("Invalid login response from server. Student token missing.");
//         return;
//       }

//       if (rememberMe) {
//         localStorage.setItem("studentToken", token);
//         localStorage.setItem("studentData", JSON.stringify(student));
//       } else {
//         sessionStorage.setItem("studentToken", token);
//         sessionStorage.setItem("studentData", JSON.stringify(student));
//       }

//       navigate("/student", { replace: true });
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
//       <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
//         <div className="mb-8 text-center">
//           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600">
//             <User className="h-8 w-8 text-white" />
//           </div>

//           <h1 className="text-3xl font-bold text-gray-900">Student Login</h1>

//           <p className="mt-2 text-sm text-gray-600">
//             Access your student portal
//           </p>
//         </div>

//         {error && (
//           <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
//             <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label
//               htmlFor="admissionNumber"
//               className="mb-2 block text-sm font-medium text-gray-700"
//             >
//               Admission Number
//             </label>

//             <div className="relative">
//               <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

//               <input
//                 id="admissionNumber"
//                 name="admissionNumber"
//                 type="text"
//                 value={formData.admissionNumber}
//                 onChange={handleChange}
//                 autoComplete="username"
//                 placeholder="Enter admission number"
//                 className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
//               />
//             </div>
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="mb-2 block text-sm font-medium text-gray-700"
//             >
//               Password
//             </label>

//             <div className="relative">
//               <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

//               <input
//                 id="password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 value={formData.password}
//                 onChange={handleChange}
//                 autoComplete="current-password"
//                 placeholder="Enter password"
//                 className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword((prev) => !prev)}
//                 className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-5 w-5" />
//                 ) : (
//                   <Eye className="h-5 w-5" />
//                 )}
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center justify-between text-sm">
//             <label className="flex items-center gap-2 text-gray-600">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
//               />
//               Remember me
//             </label>

//             <Link
//               to="/forgot-password"
//               className="font-medium text-indigo-600 hover:text-indigo-500"
//             >
//               Forgot password?
//             </Link>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-600">
//           Need help?{" "}
//           <Link
//             to="/contact"
//             className="font-medium text-indigo-600 hover:text-indigo-500"
//           >
//             Contact support
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// src/pages/StudentLogin.jsx
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Lock, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function StudentLogin() {
  const navigate = useNavigate();
  const { studentLogin } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    admissionNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const admissionNumber = formData.admissionNumber.trim();
    const password = formData.password.trim();

    if (!admissionNumber || !password) {
      setError("Admission number and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await studentLogin(admissionNumber, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate("/student", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600">
            <User className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Student Login</h1>

          <p className="mt-2 text-sm text-gray-600">
            Access your student portal
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admissionNumber"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Admission Number
            </label>

            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

              <input
                id="admissionNumber"
                name="admissionNumber"
                type="text"
                value={formData.admissionNumber}
                onChange={handleChange}
                autoComplete="username"
                placeholder="Enter admission number"
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Need help?{" "}
          <Link
            to="/contact"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}