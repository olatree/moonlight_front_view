

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  role: "admin",
  isBlocked: false,
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
};

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [view, setView] = useState("list");
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admins");

      setAdmins(res.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const goToList = () => {
    resetForm();
    setView("list");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await api.post("/admins", formData);

      toast.success("Admin created successfully");
      resetForm();
      await fetchAdmins();
      setView("list");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (admin) => {
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      role: admin.role || "admin",
      isBlocked: Boolean(admin.isBlocked),
    });

    setEditingId(admin._id);
    setView("edit");
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = { ...formData };

      if (!payload.password.trim()) {
        delete payload.password;
      }

      await api.put(`/admins/${editingId}`, payload);

      toast.success("Admin updated successfully");
      resetForm();
      await fetchAdmins();
      setView("list");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name}?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admins/${admin._id}`);

      toast.success("Admin deleted successfully");
      await fetchAdmins();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-sm text-gray-500">
            Create, update, block, and delete admin accounts.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={goToList}
            className={`rounded px-4 py-2 text-sm ${
              view === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            View Admins
          </button>

          <button
            onClick={() => {
              resetForm();
              setView("add");
            }}
            className={`rounded px-4 py-2 text-sm ${
              view === "add"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Add Admin
          </button>
        </div>
      </div>

      {view === "list" && (
        <>
          {loading ? (
            <p className="text-gray-500">Loading admins...</p>
          ) : admins.length === 0 ? (
            <div className="rounded border bg-white p-6 text-center text-gray-500">
              No admins found.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded border bg-white sm:block">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-3 text-left">ID</th>
                      <th className="border p-3 text-left">Name</th>
                      <th className="border p-3 text-left">Email</th>
                      <th className="border p-3 text-left">Role</th>
                      <th className="border p-3 text-left">Status</th>
                      <th className="border p-3 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin._id}>
                        <td className="border p-3 whitespace-nowrap">
                          {admin.userId || "N/A"}
                        </td>
                        <td className="border p-3">{admin.name}</td>
                        <td className="border p-3">{admin.email}</td>
                        <td className="border p-3 capitalize">
                          {admin.role?.replace("_", " ")}
                        </td>
                        <td className="border p-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              admin.isBlocked
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {admin.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="border p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(admin)}
                              className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin)}
                              className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 sm:hidden">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="rounded-lg border bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">{admin.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          admin.isBlocked
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {admin.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      ID: {admin.userId || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Email: {admin.email}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      Role: {admin.role?.replace("_", " ")}
                    </p>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(admin)}
                        className="rounded bg-yellow-500 px-3 py-1 text-xs text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {(view === "add" || view === "edit") && (
        <form
          onSubmit={view === "add" ? handleAddAdmin : handleUpdateAdmin}
          className="max-w-md rounded bg-white p-6 shadow-md"
        >
          <h2 className="mb-4 text-xl font-semibold">
            {view === "add" ? "Add Admin" : "Edit Admin"}
          </h2>

          <div className="mb-4">
            <label className="mb-1 block font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-medium">
              Password{" "}
              {view === "edit" && (
                <span className="text-sm text-gray-500">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
              required={view === "add"}
              minLength={6}
              placeholder={
                view === "edit" ? "Enter new password" : "Enter password"
              }
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block font-medium">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {view === "edit" && (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                name="isBlocked"
                checked={formData.isBlocked}
                onChange={handleInputChange}
              />
              <label className="font-medium">Block this admin</label>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className={`rounded px-4 py-2 text-white ${
                view === "add"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {submitting
                ? "Please wait..."
                : view === "add"
                ? "Add Admin"
                : "Update Admin"}
            </button>

            <button
              type="button"
              onClick={goToList}
              className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminManagement;