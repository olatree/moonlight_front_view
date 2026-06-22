// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/admin/Sidebar";
// import Topbar from "../components/admin/Topbar";

// export default function AdminLayout() {
//   return (
//     <div className="flex min-h-screen">
//       {/* Sidebar */}
//       <Sidebar />

//       <div className="flex-1 flex flex-col">
//         {/* Topbar */}
//         <Topbar />

//         {/* Main Content */}
//         <main className="p-6 bg-gray-50 flex-1">
//           <Outlet /> {/* ✅ nested children render here */}
//         </main>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
