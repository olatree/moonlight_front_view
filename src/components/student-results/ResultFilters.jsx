// export default function ResultFilters({
//   sessions,
//   sessionId,
//   termId,
//   selectedSession,
//   onSessionChange,
//   onTermChange,
//   onFetch,
//   fetchingResult,
// }) {
//   return (
//     <>
//       <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
//         <div>
//           <label className="mb-1 block text-sm font-medium">Session</label>
//           <select
//             onChange={onSessionChange}
//             value={sessionId}
//             className="w-full rounded-lg border p-2"
//           >
//             <option value="">Select Session</option>
//             {sessions.map((session) => (
//               <option key={session._id} value={session._id}>
//                 {session.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="mb-1 block text-sm font-medium">Term</label>
//           <select
//             onChange={onTermChange}
//             value={termId}
//             disabled={!selectedSession}
//             className="w-full rounded-lg border p-2"
//           >
//             <option value="">Select Term</option>
//             {(selectedSession?.terms || []).map((term) => (
//               <option key={term._id} value={term._id}>
//                 {term.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <button
//         onClick={onFetch}
//         disabled={fetchingResult || !sessionId || !termId}
//         className="w-full rounded bg-green-600 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
//       >
//         {fetchingResult ? "Loading..." : "Fetch Result"}
//       </button>
//     </>
//   );
// }


import { Check } from "lucide-react";

const steps = ["Session", "Term", "Fetch"];

export default function ResultFilters({
  sessions,
  sessionId,
  termId,
  selectedSession,
  onSessionChange,
  onTermChange,
  onFetch,
  fetchingResult,
}) {
  const step = !sessionId ? 1 : !termId ? 2 : 3;

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-5 flex items-center gap-2">
        {steps.map((label, i) => {
          const num = i + 1;
          const done = num < step;
          const active = num === step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-medium transition-colors
                    ${done ? "border-green-600 bg-green-600 text-white" : ""}
                    ${active ? "border-green-600 text-green-600" : ""}
                    ${!done && !active ? "border-gray-300 text-gray-400" : ""}
                  `}
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : num}
                </div>
                <span
                  className={`text-xs transition-colors ${
                    active
                      ? "text-gray-700"
                      : done
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div
                  className={`h-px w-8 flex-1 transition-colors ${
                    num < step ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Selects */}
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Session
          </label>
          <select
            onChange={onSessionChange}
            value={sessionId}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-100
              ${sessionId ? "border-gray-400" : "border-gray-300"}`}
          >
            <option value="">Select session</option>
            {sessions.map((session) => (
              <option key={session._id} value={session._id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Term
          </label>
          <select
            onChange={onTermChange}
            value={termId}
            disabled={!selectedSession}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400
              ${termId ? "border-gray-400" : "border-gray-300"}`}
          >
            <option value="">Select term</option>
            {(selectedSession?.terms || []).map((term) => (
              <option key={term._id} value={term._id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fetch button + progress */}
      <button
        onClick={onFetch}
        disabled={fetchingResult || !sessionId || !termId}
        className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {fetchingResult ? "Loading..." : "Fetch result"}
      </button>

      <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full bg-green-600 transition-all duration-500 ${
            fetchingResult ? "w-4/5 animate-pulse" : "w-0"
          }`}
        />
      </div>
    </div>
  );
}