import { format } from "date-fns";
import toast from "react-hot-toast";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateTaskStatus, deleteTask, updateTask } from "../services/taskService";
import { getAllUsers } from "../services/userService";
import { CalendarIcon, Trash, XIcon, Pencil } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

const PAGE_SIZE = 6;

const priorityTexts = {
    LOW: { background: "bg-red-100 dark:bg-red-950", prioritycolor: "text-red-600 dark:text-red-400" },
    MEDIUM: { background: "bg-blue-100 dark:bg-blue-950", prioritycolor: "text-blue-600 dark:text-blue-400" },
    HIGH: { background: "bg-emerald-100 dark:bg-emerald-950", prioritycolor: "text-emerald-600 dark:text-emerald-400" },
};

// ── Pagination UI ────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-1 mt-5 pt-5">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                Previous
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1.5 text-sm rounded border transition ${
                        page === currentPage
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                Next
            </button>
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

const ProjectTasks = ({ tasks, onTaskUpdated }) => {
    const navigate = useNavigate();
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [editTask, setEditTask] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [filters, setFilters] = useState({ status: "", priority: "", assignee: "" });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, taskId: null, isBulk: false });

    // ── Pagination state ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    // ─────────────────────────────────────────────────────────────────────────

    // ── CHANGED: read current user from localStorage ──
    const currentUserId = Number(localStorage.getItem("userId"));
    const currentUserRole = localStorage.getItem("userRole");
    const canModifyTask = (task) =>
        currentUserRole === "ROLE_ADMIN" || task.createdById === currentUserId;
    // ─────────────────────────────────────────────────

    useEffect(() => {
        getAllUsers(0, 100).then((res) => setUsers(res.data)).catch(console.error);
    }, []);

    const userMap = useMemo(() => {
        const map = {};
        users.forEach((u) => { map[u.id] = u.name; });
        return map;
    }, [users]);

    const assigneeList = useMemo(() => {
        const names = tasks.map((t) => t.assignedToId ? { id: t.assignedToId, name: userMap[t.assignedToId] } : null).filter(Boolean);
        return Array.from(new Map(names.map((n) => [n.id, n])).values());
    }, [tasks, userMap]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status, priority, assignee } = filters;
            return (!status || task.status === status) && (!priority || task.priority === priority) && (!assignee || String(task.assignedToId) === assignee);
        });
    }, [filters, tasks]);

    // Reset to page 1 whenever filters or tasks change
    useEffect(() => { setCurrentPage(1); }, [filters, tasks]);

    // ── Derived pagination values ─────────────────────────────────────────────
    const totalPages = Math.ceil(filteredTasks.length / PAGE_SIZE);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );
    // ─────────────────────────────────────────────────────────────────────────

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            toast.loading("Updating status...");
            await updateTaskStatus(taskId, newStatus);
            toast.dismiss();
            toast.success("Status updated!");
            if (onTaskUpdated) onTaskUpdated();
        } catch {
            toast.dismiss();
            toast.error("Failed to update status");
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (confirmDialog.isBulk) {
                toast.loading("Deleting tasks...");
                await Promise.all(selectedTasks.map((id) => deleteTask(id)));
                toast.dismiss();
                toast.success("Tasks deleted!");
                setSelectedTasks([]);
            } else {
                await deleteTask(confirmDialog.taskId);
                toast.success("Task deleted!");
            }
            setConfirmDialog({ isOpen: false, taskId: null, isBulk: false });
            if (onTaskUpdated) onTaskUpdated();
        } catch {
            toast.dismiss();
            toast.error("Failed to delete.");
            setConfirmDialog({ isOpen: false, taskId: null, isBulk: false });
        }
    };

    const openEdit = (task) => {
        setEditTask(task);
        setEditForm({
            title: task.title,
            description: task.description || "",
            status: task.status,
            priority: task.priority,
            deadline: task.deadline || "",
            assignedToId: task.assignedToId || "",
            projectId: task.projectId,
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            await updateTask(editTask.id, {
                ...editForm,
                assignedToId: editForm.assignedToId ? Number(editForm.assignedToId) : null,
                projectId: Number(editForm.projectId),
            });
            toast.success("Task updated!");
            setEditTask(null);
            if (onTaskUpdated) onTaskUpdated();
        } catch {
            toast.error("Failed to update task");
        } finally {
            setIsUpdating(false);
        }
    };

    const inputClass = "w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm";

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
                {["status", "priority", "assignee"].map((name) => {
                    const options = {
                        status: [{ label: "All Statuses", value: "" }, { label: "To Do", value: "TO_DO" }, { label: "In Progress", value: "IN_PROGRESS" }, { label: "Completed", value: "COMPLETED" }],
                        priority: [{ label: "All Priorities", value: "" }, { label: "Low", value: "LOW" }, { label: "Medium", value: "MEDIUM" }, { label: "High", value: "HIGH" }],
                        assignee: [{ label: "All Assignees", value: "" }, ...assigneeList.map((u) => ({ label: u.name, value: String(u.id) }))],
                    };
                    return (
                        <select key={name} name={name} onChange={handleFilterChange}
                            className="border not-dark:bg-white border-zinc-300 dark:border-zinc-800 outline-none px-3 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200">
                            {options[name].map((opt, idx) => <option key={idx} value={opt.value}>{opt.label}</option>)}
                        </select>
                    );
                })}
                {(filters.status || filters.priority || filters.assignee) && (
                    <button type="button" onClick={() => setFilters({ status: "", priority: "", assignee: "" })}
                        className="px-3 py-1 flex items-center gap-2 rounded bg-gradient-to-br from-purple-400 to-purple-500 text-zinc-100 text-sm">
                        <XIcon className="size-3" /> Reset
                    </button>
                )}
                {/* ── CHANGED: bulk delete only for admin ── */}
                {selectedTasks.length > 0 && currentUserRole === "ROLE_ADMIN" && (
                    <button type="button" onClick={() => setConfirmDialog({ isOpen: true, taskId: null, isBulk: true })}
                        className="px-3 py-1 flex items-center gap-2 rounded bg-gradient-to-br from-red-400 to-red-500 text-zinc-100 text-sm">
                        <Trash className="size-3" /> Delete ({selectedTasks.length})
                    </button>
                )}
                {/* ──────────────────────────────────────── */}
            </div>

            {/* Desktop Table */}
            <div className="overflow-auto rounded-lg lg:border border-zinc-300 dark:border-zinc-800">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full text-sm text-left not-dark:bg-white text-zinc-900 dark:text-zinc-300">
                        <thead className="text-xs uppercase dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="pl-2 pr-1">
                                    <input type="checkbox" className="size-3 accent-zinc-600"
                                        onChange={() => selectedTasks.length === tasks.length ? setSelectedTasks([]) : setSelectedTasks(tasks.map((t) => t.id))}
                                        checked={selectedTasks.length === tasks.length && tasks.length > 0} />
                                </th>
                                <th className="px-4 pl-0 py-3">#</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Assignee</th>
                                <th className="px-4 py-3">Deadline</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTasks.length > 0 ? paginatedTasks.map((task, idx) => {
                                const { background, prioritycolor } = priorityTexts[task.priority] || {};
                                return (
                                    <tr key={task.id} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)}
                                        className="border-t border-zinc-300 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer">
                                        <td onClick={e => e.stopPropagation()} className="pl-2 pr-1">
                                            <input type="checkbox" className="size-3 accent-zinc-600"
                                                onChange={() => selectedTasks.includes(task.id) ? setSelectedTasks(selectedTasks.filter((i) => i !== task.id)) : setSelectedTasks((prev) => [...prev, task.id])}
                                                checked={selectedTasks.includes(task.id)} />
                                        </td>
                                        <td className="px-4 pl-0 py-2 text-zinc-400 dark:text-zinc-500">
                                            {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                        </td>
                                        <td className="px-4 py-2 font-medium">{task.title}</td>
                                        <td className="px-4 py-2">
                                            <span className={`text-xs px-2 py-1 rounded ${background} ${prioritycolor}`}>{task.priority}</span>
                                        </td>
                                        <td onClick={e => e.stopPropagation()} className="px-4 py-2">
                                            <select onChange={(e) => handleStatusChange(task.id, e.target.value)} value={task.status}
                                                className="outline-none px-2 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200 cursor-pointer dark:bg-zinc-800">
                                                <option value="TO_DO">To Do</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            {task.assignedToId ? (
                                                <div className="flex items-center gap-2">
                                                    <img src={`http://localhost:8080/users/${task.assignedToId}/image`} className="size-5 rounded-full bg-gray-200"
                                                        onError={(e) => { e.target.style.display = 'none' }} />
                                                    {userMap[task.assignedToId] || "-"}
                                                </div>
                                            ) : "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                                <CalendarIcon className="size-4" />
                                                {task.deadline ? format(new Date(task.deadline), "dd MMMM") : "No deadline"}
                                            </div>
                                        </td>
                                        {/* ── CHANGED: only show edit/delete if canModifyTask ── */}
                                        <td onClick={e => e.stopPropagation()} className="px-4 py-2">
                                            <div className="flex gap-2">
                                                {canModifyTask(task) && (
                                                    <>
                                                        <button onClick={() => openEdit(task)}
                                                            className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                                            <Pencil className="size-3.5" />
                                                        </button>
                                                        <button onClick={() => setConfirmDialog({ isOpen: true, taskId: task.id, isBulk: false })}
                                                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400">
                                                            <Trash className="size-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        {/* ─────────────────────────────────────────────────── */}
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="8" className="text-center text-zinc-500 py-6">No tasks found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden flex flex-col gap-4">
                    {paginatedTasks.map((task) => {
                        const { background, prioritycolor } = priorityTexts[task.priority] || {};
                        return (
                            <div key={task.id} className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-zinc-900 dark:text-zinc-200 text-sm font-semibold">{task.title}</h3>
                                    {/* ── CHANGED: only show edit/delete if canModifyTask ── */}
                                    <div className="flex gap-2">
                                        {canModifyTask(task) && (
                                            <>
                                                <button onClick={() => openEdit(task)} className="p-1 text-blue-600"><Pencil className="size-3.5" /></button>
                                                <button onClick={() => setConfirmDialog({ isOpen: true, taskId: task.id, isBulk: false })} className="p-1 text-red-600"><Trash className="size-3.5" /></button>
                                            </>
                                        )}
                                    </div>
                                    {/* ─────────────────────────────────────────────────── */}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded w-fit ${background} ${prioritycolor}`}>{task.priority}</span>
                                <select onChange={(e) => handleStatusChange(task.id, e.target.value)} value={task.status}
                                    className="w-full bg-zinc-100 dark:bg-zinc-800 outline-none px-2 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200">
                                    <option value="TO_DO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                                <div className="text-sm">👤 {task.assignedToId ? userMap[task.assignedToId] || "-" : "-"}</div>
                                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <CalendarIcon className="size-4" />
                                    {task.deadline ? format(new Date(task.deadline), "dd MMMM") : "No deadline"}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Pagination ── */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                message={confirmDialog.isBulk
                    ? `Are you sure you want to delete ${selectedTasks.length} selected tasks?`
                    : "Are you sure you want to delete this task?"}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, taskId: null, isBulk: false })}
            />

            {/* Edit Task Modal */}
            {editTask && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                        <h2 className="text-lg font-bold mb-4">Edit Task</h2>
                        <form onSubmit={handleUpdate} className="space-y-3">
                            <div><label className="text-sm">Title</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} required /></div>
                            <div><label className="text-sm">Description</label><textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputClass + " h-20"} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm">Status</label>
                                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={inputClass}>
                                        <option value="TO_DO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm">Priority</label>
                                    <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} className={inputClass}>
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm">Assignee</label>
                                <select value={editForm.assignedToId} onChange={(e) => setEditForm({ ...editForm, assignedToId: e.target.value })} className={inputClass}>
                                    <option value="">Unassigned</option>
                                    {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                </select>
                            </div>
                            <div><label className="text-sm">Deadline</label><input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className={inputClass} /></div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditTask(null)} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                                <button type="submit" disabled={isUpdating} className="px-4 py-2 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">{isUpdating ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectTasks;