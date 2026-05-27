import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllProjects } from "../services/projectService";
import { getAllTasks } from "../services/taskService";

export default function StatsGrid() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        overdueTasks: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [projectsRes, tasksRes] = await Promise.all([
                    getAllProjects(0, 100),
                    getAllTasks(0, 100),
                ]);
                const projects = projectsRes.data;
                const tasks = tasksRes.data;
                const now = new Date();
                setStats({
                    totalProjects: projects.length,
                    completedProjects: projects.filter((p) => p.status === "COMPLETED").length,
                    totalTasks: tasks.length,
                    overdueTasks: tasks.filter(
                        (t) => t.deadline && new Date(t.deadline) < now && t.status !== "COMPLETED"
                    ).length,
                });
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: "all projects",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-500",
        },
        {
            icon: CheckCircle,
            title: "Completed Projects",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} total`,
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-500",
        },
        {
            icon: Users,
            title: "Total Tasks",
            value: stats.totalTasks,
            subtitle: "across all projects",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-500",
        },
        {
            icon: AlertTriangle,
            title: "Overdue Tasks",
            value: stats.overdueTasks,
            subtitle: "need attention",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(({ icon: Icon, title, value, subtitle, bgColor, textColor }, i) => (
                <div key={i} className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 rounded-md">
                    <div className="p-6 py-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
                                <p className="text-3xl font-bold text-zinc-800 dark:text-white">{value}</p>
                                {subtitle && (
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{subtitle}</p>
                                )}
                            </div>
                            <div className={`p-3 rounded-xl ${bgColor} bg-opacity-20`}>
                                <Icon size={20} className={textColor} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}