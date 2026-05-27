import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteProject } from "../services/projectService";
import ConfirmDialog from "./ConfirmDialog";
import toast from "react-hot-toast";

const statusColors = {
    NOT_STARTED: "bg-gray-200 dark:bg-zinc-600 text-gray-900 dark:text-zinc-200",
    ACTIVE: "bg-emerald-200 dark:bg-emerald-500 text-emerald-900",
    COMPLETED: "bg-blue-200 dark:bg-blue-500 text-blue-900",
};

const ProjectCard = ({ project, onProjectUpdated, onEditClick }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    // ── CHANGED: read current user from localStorage ──
    const currentUserId = Number(localStorage.getItem("userId"));
    const currentUserRole = localStorage.getItem("userRole");
    const canModify = currentUserRole === "ROLE_ADMIN" || project.createdById === currentUserId;
    // ─────────────────────────────────────────────────

    const handleDelete = async () => {
        try {
            await deleteProject(project.id);
            toast.success("Project deleted!");
            if (onProjectUpdated) onProjectUpdated();
        } catch (err) {
            toast.error("Failed to delete project.");
        } finally {
            setShowConfirm(false);
        }
    };

    return (
        <>
            <div className="relative bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg overflow-hidden transition-all duration-200 group">
                <img
                    src={`http://localhost:8080/projects/${project.id}/image`}
                    alt={project.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                />

                <Link to={`/projectsDetail?id=${project.id}&tab=tasks`} className="block p-5">
                    <div className="flex-1 min-w-0 mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-zinc-200 mb-1 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            {project.title}
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm line-clamp-2">
                            {project.description || "No description"}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[project.status] || "bg-gray-200 text-gray-700"}`}>
                            {project.status?.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-zinc-500">
                            {project.deadline ? `Due: ${project.deadline}` : "No deadline"}
                        </span>
                    </div>
                </Link>

                {/* ── CHANGED: only show action buttons if canModify ── */}
                {canModify && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditClick(project); }}
                            className="p-1.5 rounded bg-white/90 dark:bg-zinc-800/90 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 shadow"
                        >
                            <Pencil className="size-3.5" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(true); }}
                            className="p-1.5 rounded bg-white/90 dark:bg-zinc-800/90 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 shadow"
                        >
                            <Trash2 className="size-3.5" />
                        </button>
                    </div>
                )}
                {/* ─────────────────────────────────────────────────── */}
            </div>

            <ConfirmDialog
                isOpen={showConfirm}
                message="Are you sure you want to delete this project and all its tasks?"
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    );
};

export default ProjectCard;