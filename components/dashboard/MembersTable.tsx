import { Member } from "./typesOfDash";

interface MembersTableProps {
  members: Member[];
}

export const MembersTable = ({ members }: MembersTableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="p-4 text-gray-700 font-semibold">Name</th>
          <th className="p-4 text-gray-700 font-semibold">Phone</th>
        </tr>
      </thead>
      <tbody>
        {members.length ? (
          members.map((m) => (
            <tr
              key={m.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="p-4 font-medium text-gray-800">
                {m.first_name} {m.last_name}
              </td>
              <td className="p-4 text-gray-600">{m.phone}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={2} className="p-8 text-center text-gray-500">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <p>No members found.</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
