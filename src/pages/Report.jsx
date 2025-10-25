import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE = "https://tcg.dsrt321.online/api/v1/core-utils/grant-report";

export default function Report() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("report");

  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noReport, setNoReport] = useState(false);

  const storedEmail =
    typeof window !== "undefined" ? localStorage.getItem("email") : null;

  const fetchReportData = async (userEmail) => {
    if (!reportId) {
      setNoReport(true);
      return;
    }

    try {
      setLoading(true);
      setNoReport(false);
      const url = `${API_BASE}?report_id=${encodeURIComponent(reportId)}`;
      const headers = {};
      if (userEmail) headers["X-User-Email"] = userEmail;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        setReportData(null);
        setNoReport(true);
        return;
      }
      const data = await res.json();
      if (data && data.data) {
        setReportData(data.data);
        setNoReport(false);
      } else {
        setReportData(null);
        setNoReport(true);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setReportData(null);
      setNoReport(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!reportId) {
      setNoReport(true);
      setShowModal(false);
      return;
    }

    if (storedEmail) {
      setShowModal(false);
      fetchReportData(storedEmail);
    } else {
      setShowModal(true);
    }
  }, [reportId]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setShowModal(false);
    fetchReportData(trimmed);
  };

  const formatAmount = (amount) => {
    const n = Number(amount);
    if (!isFinite(n)) return amount || "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-700 text-center">
              Enter Your Email
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              You must provide a valid email address to view the report.
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#305496] text-white py-2 rounded hover:bg-[#25406f] transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No Report */}
      {noReport && !loading && (
        <div className="container mx-auto p-6 pt-10">
          <h1 className="text-3xl text-center font-bold text-gray-700 mb-8">
            The Grant Portal Report
          </h1>
          <p className="text-lg text-center text-gray-600 mb-4">
            No report found.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center pt-10 text-gray-600 text-lg">
          Loading report...
        </div>
      )}

      {/* Report Table */}
      {reportData && !noReport && !loading && (
        <div className="mx-[10px] lg:mx-[120px] p-6 pt-10">
          <h1 className="text-3xl text-center font-bold text-gray-700 mb-8">
            The Grant Portal Report
          </h1>

          <div className="text-lg mb-4">
            <p>
              <strong>Customer Email:</strong>{" "}
              <span>{reportData.customer_email || "N/A"}</span>
            </p>
            <p>
              <strong>Report Date:</strong>{" "}
              <span>
                {reportData.created_at
                  ? new Date(reportData.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      }
                    )
                  : "N/A"}
              </span>
            </p>
          </div>

          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#305496] text-white">
                <th className="py-4 w-[75px]">Grant ID</th>
                <th className="py-4">Grant URL</th>
                <th className="py-4">Title</th>
                <th className="py-4">Interests</th>
                <th className="py-4">Eligibility</th>
                <th className="py-4 w-[100px]">Deadline</th>
                <th className="py-4 w-[100px]">Amount Low</th>
                <th className="py-4">Amount High</th>
              </tr>
            </thead>
            <tbody>
              {reportData.report && reportData.report.length > 0 ? (
                reportData.report.map((grant) => (
                  <tr key={grant.id} className="border-b border-gray-200">
                    <td className="text-center p-2 font-semibold">
                      {grant.id}
                    </td>
                    <td className="text-center p-2 w-[200px]">
                      <a
                        href={grant.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500"
                      >
                        {grant.url || ""}
                      </a>
                    </td>
                    <td className="text-center p-2">
                      {grant.opportunity_title || ""}
                    </td>
                    <td className="text-center p-2">
                      {(grant.interests || []).join(", ")}
                    </td>
                    <td className="text-center p-2">
                      {(grant.eligibilities || []).join(", ")}
                    </td>
                    <td className="text-center p-2 w-[90px]">
                      {grant.deadline || ""}
                    </td>
                    <td className="text-center p-2">
                      {formatAmount(grant.amount_low)}
                    </td>
                    <td className="text-center p-2 w-[120px]">
                      {formatAmount(grant.amount_high)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-2 text-center">
                    No grants available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
