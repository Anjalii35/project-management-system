import { format } from "date-fns";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon } from "lucide-react";
import { getTaskById } from "../services/taskService";
import { getProjectById } from "../services/projectService";
import { getUserById } from "../services/userService";

const TaskDetails = () => {

    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [assignee, setAssignee] = useState(null); // 👈 separate state for assignee
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchTaskDetails = async () => {
        if (!taskId) return;
        try {
            setLoading(true);
            const taskRes = await getTaskById(taskId);
            const taskData = taskRes.data;
            setTask(taskData);

            // Fetch assignee if exists
            if (taskData.assignedToId) {
                const userRes = await getUserById(taskData.assignedToId);
                setAssignee(userRes.data);
            }

            if (projectId) {
                const projectRes = await getProjectById(projectId);
                setProject(projectRes.data);
            }
        } catch (err) {
            console.error("Failed to fetch task details", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        const dummyComment = {
            id: Date.now(),
            user: { id: 1, name: "You" },
            content: newComment,
            createdAt: new Date()
        };
        setComments((prev) => [...prev, dummyComment]);
        setNewComment("");
        toast.success("Comment added.");
    };

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    if (loading) return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task details...</div>;
    if (!task) return <div className="text-red-500 px-4 py-6">Task not found.</div>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
            {/* Left: Comments */}
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800 flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Task Discussion ({comments.length})
                    </h2>

                    <div className="flex-1 md:overflow-y-scroll no-scrollbar">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md mr-auto">
                                        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400">
                                            <span className="font-medium text-gray-900 dark:text-white">{comment.user.name}</span>
                                            <span className="text-xs text-gray-400 dark:text-zinc-600">
                                                • {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-zinc-200">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-zinc-500 mb-4 text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                            rows={3}
                        />
                        <button onClick={handleAddComment} className="bg-gradient-to-l from-blue-500 to-blue-600 text-white text-sm px-5 py-2 rounded">
                            Post
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Task + Project Info */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                {/* Task Info */}
                <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
                    <div className="mb-3">
                        <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 text-xs">
                                {task.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-green-200 dark:bg-emerald-900 text-green-900 dark:text-emerald-300 text-xs">
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>
                    )}

                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
                        {/* Assignee with image */}
                        <div className="flex items-center gap-2">
                            {assignee ? (
                                <>
                                    <img
                                        src={`http://localhost:8080/users/${assignee.id}/image`}
                                        alt={assignee.name}
                                        className="size-6 rounded-full object-cover bg-gray-200"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=3b82f6&color=fff`;
                                        }}
                                    />
                                    <span>{assignee.name}</span>
                                </>
                            ) : (
                                <>👤 Unassigned</>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500" />
                            Due: {task.deadline ? format(new Date(task.deadline), "dd MMM yyyy") : "No deadline"}
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                {project && (
                    <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800">
                        <p className="text-xl font-medium mb-4">Project Details</p>
                        <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                            <PenIcon className="size-4" /> {project.title}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
                            <span>Status: {project.status}</span>
                            <span>Deadline: {project.deadline || "N/A"}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;