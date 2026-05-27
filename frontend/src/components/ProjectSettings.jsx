import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { updateProject } from "../services/projectService";
import toast from "react-hot-toast";

export default function ProjectSettings({ project, onProjectUpdated }) {

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "ACTIVE",
        deadline: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || "",
                description: project.description || "",
                status: project.status || "ACTIVE",
                deadline: project.deadline || "",
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const projectRequest = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                deadline: formData.deadline || null,
            };
            await updateProject(project.id, projectRequest, imageFile);
            toast.success("Project updated successfully!");
            if (onProjectUpdated) onProjectUpdated();
        } catch (err) {
            console.error("Failed to update project", err);
            toast.error("Failed to update project.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300";
    const cardClasses = "rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800";
    const labelClasses = "text-sm text-zinc-600 dark:text-zinc-400";

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Project Title</label>
                        <input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={inputClasses}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={inputClasses + " h-24"}
                        />
                    </div>

                    {/* Status & Deadline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={labelClasses}>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className={inputClasses}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="NOT_STARTED">Not Started</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className={labelClasses}>Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    {/* Image Upload (optional for update) */}
                    <div className="space-y-2">
                        <label className={labelClasses}>Update Image (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className={inputClasses}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-auto flex items-center text-sm justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        <Save className="size-4" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Project Info (read only) */}
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Info</h2>
                <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-400">
                    <div className="flex justify-between">
                        <span>Title</span>
                        <span className="text-zinc-900 dark:text-zinc-200">{project?.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Description</span>
                        <span className="text-zinc-900 dark:text-zinc-200">{project?.description}</span>
                    </div>                
                    <div className="flex justify-between">
                        <span>Status</span>
                        <span className="text-zinc-900 dark:text-zinc-200">{project?.status}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Deadline</span>
                        <span className="text-zinc-900 dark:text-zinc-200">{project?.deadline || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Project ID</span>
                        <span className="text-zinc-900 dark:text-zinc-200">{project?.id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}