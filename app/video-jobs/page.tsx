"use client";

import { useState, useEffect } from "react";
import { Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface VideoJob {
  id: number;
  user_id: string;
  mobile_number: string | null;
  gender: string | null;
  attribute_love: string | null;
  relationship_status: string | null;
  vibe: string | null;
  status: string | null;
  retry_count: number | null;
  failed_stage: string | null;
  last_error_code: string | null;
  created_at: string;
  updated_at: string;
}

interface FilterParams {
  status: string;
  failed_stage: string;
  user_id: string;
  start_date: string;
  end_date: string;
  page: number;
  page_size: number;
}

export default function VideoJobsPage() {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState<FilterParams>({
    status: "",
    failed_stage: "",
    user_id: "",
    start_date: "",
    end_date: "",
    page: 1,
    page_size: 20,
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page.toString());
      params.append("page_size", filters.page_size.toString());

      if (filters.status) params.append("status", filters.status);
      if (filters.failed_stage) params.append("failed_stage", filters.failed_stage);
      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const response = await fetch(
        `http://localhost:8000/api/v1/video-jobs/list?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setJobs(data.items);
        setTotalJobs(data.total);
        setTotalPages(data.total_pages);
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setMessage("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters.page]);

  const handleFilterChange = (key: keyof FilterParams, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleApplyFilters = () => {
    fetchJobs();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      failed_stage: "",
      user_id: "",
      start_date: "",
      end_date: "",
      page: 1,
      page_size: 20,
    });
    setTimeout(() => fetchJobs(), 100);
  };

  const getStatusBadgeColor = (status: string | null) => {
    if (!status) return "bg-gray-200 text-gray-700";

    const colors: Record<string, string> = {
      queued: "bg-blue-100 text-blue-700",
      photo_processing: "bg-yellow-100 text-yellow-700",
      photo_done: "bg-green-100 text-green-700",
      lipsync_processing: "bg-yellow-100 text-yellow-700",
      lipsync_done: "bg-green-100 text-green-700",
      stitching: "bg-purple-100 text-purple-700",
      uploaded: "bg-green-100 text-green-700",
      sent: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
    };

    return colors[status] || "bg-gray-200 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Video Jobs</h1>
              <p className="text-gray-600 mt-1">{message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-300 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <button
                onClick={fetchJobs}
                className="px-4 py-2 bg-primary text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="queued">Queued</option>
                    <option value="photo_processing">Photo Processing</option>
                    <option value="photo_done">Photo Done</option>
                    <option value="lipsync_processing">Lipsync Processing</option>
                    <option value="lipsync_done">Lipsync Done</option>
                    <option value="stitching">Stitching</option>
                    <option value="uploaded">Uploaded</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Failed Stage
                  </label>
                  <select
                    value={filters.failed_stage}
                    onChange={(e) => handleFilterChange("failed_stage", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">All Stages</option>
                    <option value="photo">Photo</option>
                    <option value="lipsync">Lipsync</option>
                    <option value="stitch">Stitch</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={filters.user_id}
                    onChange={(e) => handleFilterChange("user_id", e.target.value)}
                    placeholder="Enter user ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange("start_date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange("end_date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Size
                  </label>
                  <select
                    value={filters.page_size}
                    onChange={(e) => handleFilterChange("page_size", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No jobs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relationship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retry Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failed Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.mobile_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            job.status
                          )}`}
                        >
                          {job.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.gender || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.relationship_status || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.retry_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.failed_stage || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.updated_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page {filters.page} of {totalPages} ({totalJobs} total jobs)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange("page", filters.page - 1)}
                disabled={filters.page === 1}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                  filters.page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => handleFilterChange("page", filters.page + 1)}
                disabled={filters.page === totalPages}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                  filters.page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
