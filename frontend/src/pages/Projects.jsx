import { useState, useEffect } from "react";
import { Plus, Search, FolderOpen } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import CreateProjectDialog from "../components/CreateProjectDialog";
import { getAllProjects, updateProject } from "../services/projectService";
import toast from "react-hot-toast";
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 6;

// ── Pagination UI ────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-1 mt-6 pt-5">
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

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "ALL" });
    const [editProject, setEditProject] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editImage, setEditImage] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [urlParams] = useSearchParams();

    // ── Pagination state ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    // ─────────────────────────────────────────────────────────────────────────

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await getAllProjects(0, 200); // fetch all; paginate client-side
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    useEffect(() => {
        const urlSearch = urlParams.get('search');
        if (urlSearch) setSearchTerm(urlSearch);
    }, []);

    useEffect(() => {
        let filtered = projects;
        if (searchTerm) {
            filtered = filtered.filter(
                (p) => p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filters.status !== "ALL") {
            filtered = filtered.filter((p) => p.status === filters.status);
        }
        setFilteredProjects(filtered);
        setCurrentPage(1); // reset to page 1 on filter/search change
    }, [projects, searchTerm, filters]);

    // ── Derived pagination values ─────────────────────────────────────────────
    const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );
    // ─────────────────────────────────────────────────────────────────────────

    const openEdit = (project) => {
        setEditProject(project);
        setEditForm({
            title: project.title,
            description: project.description || "",
            status: project.status,
            deadline: project.deadline || "",
        });
        setEditImage(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            await updateProject(editProject.id, editForm, editImage);
            toast.success("Project updated!");
            setEditProject(null);
            fetchProjects();
        } catch (err) {
            toast.error("Failed to update project.");
        } finally {
            setIsUpdating(false);
        }
    };

    const inputClass = "w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm";

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Projects</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">Manage and track your projects</p>
                </div>
                <button onClick={() => setIsDialogOpen(true)}
                    className="flex items-center px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition">
                    <Plus className="size-4 mr-2" /> New Project
                </button>
                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} onProjectCreated={fetchProjects} />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm}
                        className="w-full pl-10 text-sm pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:border-blue-500 outline-none"
                        placeholder="Search projects..." />
                </div>
                <select value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm">
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="NOT_STARTED">Not Started</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-500">Loading projects...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedProjects.length === 0 ? (
                            <div className="col-span-full text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                                    <FolderOpen className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No projects found</h3>
                                <p className="text-gray-500 dark:text-zinc-400 mb-6 text-sm">Create your first project to get started</p>
                                <button onClick={() => setIsDialogOpen(true)}
                                    className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mx-auto text-sm">
                                    <Plus className="size-4" /> Create Project
                                </button>
                            </div>
                        ) : (
                            paginatedProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onProjectUpdated={fetchProjects}
                                    onEditClick={openEdit}
                                />
                            ))
                        )}
                    </div>

                    {/* ── Pagination ── */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {/* Edit Project Modal */}
            {editProject && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                        <h2 className="text-lg font-bold mb-4">Edit Project</h2>
                        <form onSubmit={handleUpdate} className="space-y-3">
                            <div>
                                <label className="text-sm">Title</label>
                                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} required />
                            </div>
                            <div>
                                <label className="text-sm">Description</label>
                                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputClass + " h-20"} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm">Status</label>
                                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={inputClass}>
                                        <option value="NOT_STARTED">Not Started</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm">Deadline</label>
                                    <input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm">Update Image (optional)</label>
                                <input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files[0])} className={inputClass} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditProject(null)} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
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
}