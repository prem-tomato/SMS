import { SocietyBreakdown } from "./typesOfDash";

interface SocietyBreakdownTableProps {
  societies: SocietyBreakdown[];
}

export const SocietyBreakdownTable = ({
  societies,
}: SocietyBreakdownTableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="p-4 text-gray-700 font-semibold">Society</th>
          <th className="p-4 text-gray-700 font-semibold">Buildings</th>
          <th className="p-4 text-gray-700 font-semibold">Flats</th>
          <th className="p-4 text-gray-700 font-semibold">Members</th>
        </tr>
      </thead>
      <tbody>
        {societies.length ? (
          societies.map((s) => (
            <tr
              key={s.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="p-4 font-medium text-gray-800">{s.name}</td>
              <td className="p-4 text-gray-600">{s.total_buildings}</td>
              <td className="p-4 text-gray-600">{s.total_units}</td>
              <td className="p-4 text-gray-600">{s.total_members}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="p-8 text-center text-gray-500">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p>No societies data found.</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
