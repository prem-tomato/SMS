import { Notice } from "./typesOfDash";
import { useTranslations } from "next-intl";

interface NoticesTableProps {
  notices: Notice[];
}

export const NoticesTable = ({ notices }: NoticesTableProps) => {
  const t = useTranslations("NoticesTable");

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-4 text-gray-700 font-semibold">{t("title")}</th>
            <th className="p-4 text-gray-700 font-semibold">{t("date")}</th>
            <th className="p-4 text-gray-700 font-semibold">{t("status")}</th>
          </tr>
        </thead>
        <tbody>
          {notices.length ? (
            notices.map((n) => (
              <tr
                key={n.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="p-4 font-medium text-gray-800">{n.title}</td>
                <td className="p-4 text-gray-600">
                  {new Date(n.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      n.status === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(n.status)} {/* Assuming you want to translate status text */}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="p-8 text-center text-gray-500">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p>{t("noNoticesAvailable")}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
