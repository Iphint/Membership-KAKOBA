import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  User,
  Shield,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import { User as UserType } from "../types";
import { createUser, deleteUser, getUsers, updateUser } from "@/api/user";

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    no_telp: "",
    password: "",
    roles: "USER" as "ADMIN" | "USER",
  });

  const fetchUsers = async () => {
    try {
      const list = await getUsers();
      setUsers(list);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      (filterRole === "ALL" || u.roles.includes(filterRole)) &&
      (u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditUser(null);
    resetForm()
    setShowModal(true);
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setForm({
      username: user.username,
      email: user.email,
      no_telp: user.no_telp,
      password: "",
      roles: user.roles?.[0] ?? "USER",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      no_telp: "",
      password: "",
      roles: "USER",
    });
    setEditUser(null);
  };

  const handleSave = async () => {
    try {
      const payload = {
        username: form.username,
        email: form.email,
        no_telp: form.no_telp,
        password: form.password,
        roles: [form.roles],
      };
      if (editUser) {
        await updateUser(editUser.id, payload);
      } else {
        await createUser(payload);
      }
      await fetchUsers();
      setShowModal(false);
      resetForm()
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
            />
          </div>
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-orange-500/20 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Users",
            value: users.length,
            color: "text-slate-800",
          },
          {
            label: "Admins",
            value: users.filter((u) => u.roles.includes("ADMIN")).length,
            color: "text-blue-600",
          },
          {
            label: "Members",
            value: users.filter((u) => u.roles.includes("USER")).length,
            color: "text-orange-600",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  User
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                  Phone
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  Joined
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                          user.roles.includes("ADMIN")
                            ? "bg-linear-to-br from-blue-500 to-blue-600"
                            : "bg-linear-to-br from-orange-400 to-orange-600"
                        }`}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {user.username}
                        </p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">
                      {user.no_telp}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        user.roles.includes("ADMIN")
                          ? "bg-blue-50 text-blue-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {user.roles.includes("ADMIN") ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {user.roles}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-400">
                      {user.created_at}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">
            Showing {filtered.length} of {users.length} users
          </p>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">
                {editUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  label: "Username",
                  key: "username",
                  type: "text",
                  placeholder: "Enter username",
                },
                {
                  label: "Email",
                  key: "email",
                  type: "email",
                  placeholder: "Enter email",
                },
                {
                  label: "Phone",
                  key: "no_telp",
                  type: "text",
                  placeholder: "Enter phone number",
                },
                {
                  label: "Password",
                  key: "password",
                  type: "password",
                  placeholder: "••••••••",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Role
                </label>
                <select
                  value={form.roles}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      roles: e.target.value as "ADMIN" | "USER",
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 rounded-xl text-sm font-medium text-white hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {editUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. The user will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-medium text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
