import { useEffect, useState } from "react";
import { UsersIcon, Search, Activity, Shield, Pencil, Trash2, Plus, X, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { getAllUsers, deleteUser, updateUser, createUser } from "../services/userService";
import { getAllProjects } from "../services/projectService";
import { getAllTasks, updateTask } from "../services/taskService";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";

const PAGE_SIZE = 6;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className="flex items-center justify-center gap-1 mt-6 pt-2">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                Previous
            </button>
            {pages.map((page) => (
                <button key={page} onClick={() => onPageChange(page)}
                    className={`px-3 py-1.5 text-sm rounded border transition ${page === currentPage
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}>
                    {page}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                Next
            </button>
        </div>
    );
};

const Team = () => {
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUserId = Number(localStorage.getItem("userId"));
    const isAdmin = localStorage.getItem("userRole") === "ROLE_ADMIN";

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });
    const [addImage, setAddImage] = useState(null);
    const [addImagePreview, setAddImagePreview] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });
    const [editImage, setEditImage] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const [reassignDialog, setReassignDialog] = useState({ isOpen: false, user: null });
    const [reassignToId, setReassignToId] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, userId: null });

    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, projectsRes, tasksRes] = await Promise.all([
                getAllUsers(0, 200),
                getAllProjects(0, 200),
                getAllTasks(0, 200),
            ]);
            setUsers(usersRes.data);
            setProjects(projectsRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error("Failed to fetch team data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const filteredUsers = users.filter(
        (user) =>
            user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return 0;
    });

    const totalPages = Math.ceil(sortedUsers.length / PAGE_SIZE);
    const paginatedUsers = sortedUsers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // counts both assigned tasks AND created projects
    const getUserStats = (userId) => {
        const userTasks = tasks.filter((t) => t.assignedToId === userId);
        const userProjects = projects.filter((p) => p.createdById === userId);
        return { tasks: userTasks.length, projects: userProjects.length };
    };

    const openDeleteFlow = (user) => {
        const stats = getUserStats(user.id);
        if (stats.tasks > 0 || stats.projects > 0) {
            setReassignDialog({ isOpen: true, user });
            setReassignToId("");
        } else {
            setConfirmDialog({ isOpen: true, userId: user.id });
        }
    };

    const handleSimpleDelete = async () => {
        try {
            await deleteUser(confirmDialog.userId);
            toast.success("User deleted successfully!");
            setConfirmDialog({ isOpen: false, userId: null });
            fetchData();
        } catch (err) {
            toast.error("Failed to delete user.");
            setConfirmDialog({ isOpen: false, userId: null });
        }
    };

    const handleReassignAndDelete = async () => {
        const { user } = reassignDialog;
        const stats = getUserStats(user.id);

        if (stats.tasks > 0 && !reassignToId) {
            toast.error("Please select a user to reassign tasks to.");
            return;
        }

        try {
            setIsDeleting(true);

            if (reassignToId) {
                const newAssigneeId = Number(reassignToId);
                const userTasks = tasks.filter((t) => t.assignedToId === user.id);

                if (userTasks.length > 0) {
                    toast.loading(`Reassigning ${userTasks.length} task(s)...`);
                    await Promise.all(
                        userTasks.map((t) =>
                            updateTask(t.id, {
                                title: t.title,
                                description: t.description,
                                status: t.status,
                                priority: t.priority,
                                deadline: t.deadline,
                                projectId: t.projectId,
                                assignedToId: newAssigneeId,
                            })
                        )
                    );
                    toast.dismiss();
                }
            }

            toast.loading("Deleting user...");
            await deleteUser(user.id);
            toast.dismiss();
            toast.success(`${user.name} deleted successfully!`);
            setReassignDialog({ isOpen: false, user: null });
            setReassignToId("");
            fetchData();
        } catch (err) {
            toast.dismiss();
            toast.error("Failed. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const closeAddDialog = () => {
        setIsAddDialogOpen(false);
        setAddForm({ name: "", email: "", password: "" });
        setAddImage(null);
        setAddImagePreview(null);
    };

    const handleAddImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAddImage(file);
        setAddImagePreview(URL.createObjectURL(file));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!addImage) { toast.error("Please select a profile image."); return; }
        try {
            setIsCreating(true);
            await createUser(addForm, addImage);
            toast.success("User created successfully!");
            closeAddDialog();
            fetchData();
        } catch (err) {
            toast.error("Failed to create user.");
        } finally {
            setIsCreating(false);
        }
    };

    const openEdit = (user) => {
        setEditUser(user);
        setEditForm({ name: user.name, email: user.email, password: "" });
        setEditImage(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            await updateUser(editUser.id, {
                name: editForm.name,
                email: editForm.email,
                password: editForm.password,
            }, editImage);
            toast.success("User updated successfully!");
            setEditUser(null);
            fetchData();
        } catch (err) {
            toast.error("Failed to update user.");
        } finally {
            setIsUpdating(false);
        }
    };

    const getRoleBadge = (role) => {
        if (!role) return "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300";
        return role === "ROLE_ADMIN"
            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
            : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400";
    };

    const inputClass = "w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:border-blue-500";

    if (loading) return <div className="text-center py-16 text-gray-500">Loading team...</div>;

    const deletingUserStats = reassignDialog.user ? getUserStats(reassignDialog.user.id) : null;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Team</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">Manage team members and their contributions</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsAddDialogOpen(true)}
                        className="flex items-center px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition">
                        <Plus className="size-4 mr-2" /> New User
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-4">
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Total Users</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10">
                            <UsersIcon className="size-4 text-blue-500 dark:text-blue-200" />
                        </div>
                    </div>
                </div>
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Active Projects</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {projects.filter((p) => p.status === "ACTIVE").length}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                            <Activity className="size-4 text-emerald-500 dark:text-emerald-200" />
                        </div>
                    </div>
                </div>
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Total Tasks</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/10">
                            <Shield className="size-4 text-purple-500 dark:text-purple-200" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-3" />
                <input placeholder="Search team members..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full text-sm rounded-md border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white py-2 focus:outline-none focus:border-blue-500" />
            </div>

            <div className="max-w-4xl w-full">
                <div className="hidden sm:block overflow-x-auto rounded-md border border-gray-200 dark:border-zinc-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                        <thead className="bg-gray-50 dark:bg-zinc-900/50">
                            <tr>
                                <th className="px-6 py-2.5 text-left font-medium text-sm">#</th>
                                <th className="px-6 py-2.5 text-left font-medium text-sm">Name</th>
                                <th className="px-6 py-2.5 text-left font-medium text-sm">Email</th>
                                <th className="px-6 py-2.5 text-left font-medium text-sm">Role</th>
                                <th className="px-6 py-2.5 text-left font-medium text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {paginatedUsers.map((user, idx) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-3 text-sm text-gray-400 dark:text-zinc-500">
                                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <img src={`http://localhost:8080/users/${user.id}/image`} alt={user.name}
                                                className="size-8 rounded-full object-cover bg-gray-200 dark:bg-zinc-700"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`; }} />
                                            <span className="text-sm text-zinc-800 dark:text-white">
                                                {user.name}
                                                {user.id === currentUserId && (
                                                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">You</span>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-zinc-400">{user.email}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-md ${getRoleBadge(user.role)}`}>
                                            {user.role || "USER"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            {(isAdmin || user.id === currentUserId) && (
                                                <button onClick={() => openEdit(user)}
                                                    className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400" title="Edit">
                                                    <Pencil className="size-4" />
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button onClick={() => openDeleteFlow(user)}
                                                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400" title="Delete">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            )}
                                            {!isAdmin && user.id !== currentUserId && (
                                                <span className="text-xs text-gray-400 dark:text-zinc-600">—</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="sm:hidden space-y-3">
                    {paginatedUsers.map((user) => (
                        <div key={user.id} className="p-4 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900">
                            <div className="flex items-center gap-3 mb-3">
                                <img src={`http://localhost:8080/users/${user.id}/image`} alt={user.name}
                                    className="size-10 rounded-full object-cover bg-gray-200"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`; }} />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {user.name}
                                        {user.id === currentUserId && (
                                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">You</span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 text-xs rounded-md ${getRoleBadge(user.role)}`}>{user.role || "USER"}</span>
                                <div className="flex gap-2">
                                    {(isAdmin || user.id === currentUserId) && (
                                        <button onClick={() => openEdit(user)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600">
                                            <Pencil className="size-4" />
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => openDeleteFlow(user)} className="p-1.5 rounded hover:bg-red-100 text-red-600">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                    {!isAdmin && user.id !== currentUserId && (
                                        <span className="text-xs text-gray-400 dark:text-zinc-600">—</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                message="Are you sure you want to delete this user?"
                onConfirm={handleSimpleDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, userId: null })}
            />

            {reassignDialog.isOpen && reassignDialog.user && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-500/20">
                                    <AlertTriangle className="size-4 text-red-500" />
                                </div>
                                <h2 className="text-lg font-bold">Delete Member</h2>
                            </div>
                            <button onClick={() => setReassignDialog({ isOpen: false, user: null })}
                                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-4">
                            <img src={`http://localhost:8080/users/${reassignDialog.user.id}/image`}
                                alt={reassignDialog.user.name}
                                className="size-10 rounded-full object-cover bg-gray-200"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reassignDialog.user.name)}&background=ef4444&color=fff`; }} />
                            <div>
                                <p className="font-medium text-sm">{reassignDialog.user.name}</p>
                                <p className="text-xs text-zinc-500">{reassignDialog.user.email}</p>
                            </div>
                        </div>

                        {/* Warning showing both tasks and projects */}
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 mb-4">
                            <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                            <div className="text-sm text-amber-700 dark:text-amber-400">
                                <p className="font-medium mb-1">This user has linked data:</p>
                                <ul className="space-y-0.5 text-xs">
                                    {deletingUserStats?.tasks > 0 && (
                                        <li>• <span className="font-medium">{deletingUserStats.tasks}</span> task{deletingUserStats.tasks > 1 ? "s" : ""} assigned — <span className="italic">will be reassigned</span></li>
                                    )}
                                    {deletingUserStats?.projects > 0 && (
                                        <li>• <span className="font-medium">{deletingUserStats.projects}</span> project{deletingUserStats.projects > 1 ? "s" : ""} created (with all their tasks) — <span className="italic text-red-500 dark:text-red-400">will be permanently deleted</span></li>
                                    )}
                                </ul>
                                {deletingUserStats?.tasks > 0 && (
                                    <p className="mt-1.5">Select a member to reassign tasks to before deleting.</p>
                                )}
                                {deletingUserStats?.projects > 0 && deletingUserStats?.tasks === 0 && (
                                    <p className="mt-1.5">Projects and their tasks will be permanently deleted on confirm.</p>
                                )}
                            </div>
                        </div>

                        {/* Reassign selector — only if user has tasks */}
                        {deletingUserStats?.tasks > 0 && (
                            <div className="mb-4">
                                <label className="text-sm font-medium flex items-center gap-1.5 mb-1">
                                    <ArrowRightLeft className="size-3.5 text-blue-500" />
                                    Reassign tasks to
                                </label>
                                <select value={reassignToId} onChange={(e) => setReassignToId(e.target.value)}
                                    className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:border-blue-500">
                                    <option value="">— Select a team member —</option>
                                    {users
                                        .filter((u) => u.id !== reassignDialog.user.id)
                                        .map((u) => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setReassignDialog({ isOpen: false, user: null })}
                                className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                Cancel
                            </button>
                            <button
                                onClick={handleReassignAndDelete}
                                disabled={isDeleting || (deletingUserStats?.tasks > 0 && !reassignToId)}
                                className="px-4 py-2 text-sm rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                {isDeleting ? "Processing..." : "Reassign & Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddDialogOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Add New User</h2>
                            <button onClick={closeAddDialog} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                                <X className="size-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative size-20 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition"
                                    onClick={() => document.getElementById('add-member-image').click()}>
                                    {addImagePreview ? (
                                        <img src={addImagePreview} alt="Preview" className="size-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-400 text-xs text-center px-2">
                                            <UsersIcon className="size-6 mb-1" />
                                            <span>Upload photo</span>
                                        </div>
                                    )}
                                </div>
                                <input id="add-member-image" type="file" accept="image/*" className="hidden" onChange={handleAddImageChange} required />
                                {!addImagePreview && <p className="text-xs text-zinc-400">Click to upload profile photo <span className="text-red-400">*</span></p>}
                                {addImagePreview && (
                                    <button type="button" onClick={() => { setAddImage(null); setAddImagePreview(null); }} className="text-xs text-red-400 hover:underline">
                                        Remove photo
                                    </button>
                                )}
                            </div>
                            <div>
                                <label className="text-sm">Name</label>
                                <input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={inputClass} placeholder="Enter full name" required />
                            </div>
                            <div>
                                <label className="text-sm">Email</label>
                                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className={inputClass} placeholder="Enter email address" required />
                            </div>
                            <div>
                                <label className="text-sm">Password</label>
                                <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className={inputClass} placeholder="Enter password" required />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeAddDialog} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                                <button type="submit" disabled={isCreating} className="px-4 py-2 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                                    {isCreating ? "Creating..." : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editUser && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">
                                {editUser.id === currentUserId ? "Edit My Profile" : "Edit User"}
                            </h2>
                            <button onClick={() => setEditUser(null)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                                <X className="size-4" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="text-sm">Name</label>
                                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} required />
                            </div>
                            <div>
                                <label className="text-sm">Email</label>
                                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputClass} required />
                            </div>
                            <div>
                                <label className="text-sm">New Password <span className="text-zinc-400 font-normal">(leave blank to keep same)</span></label>
                                <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className={inputClass} placeholder="Leave blank to keep current" />
                            </div>
                            <div>
                                <label className="text-sm">Profile Image <span className="text-zinc-400 font-normal">(optional)</span></label>
                                <input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files[0])} className="w-full mt-1 text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                                <button type="submit" disabled={isUpdating} className="px-4 py-2 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Team;