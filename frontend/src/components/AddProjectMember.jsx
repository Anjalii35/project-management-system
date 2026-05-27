import { UserPlus } from "lucide-react";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {
    if (!isDialogOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <UserPlus className="size-5" /> Add Member
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    This feature requires a backend API for project membership. Please add a member assignment endpoint to your Spring Boot backend.
                </p>
                <div className="flex justify-end mt-6">
                    <button
                        onClick={() => setIsDialogOpen(false)}
                        className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProjectMember;