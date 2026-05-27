import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, message = "Are you sure you want to delete this?" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 font-bold"
                >
                    ✕
                </button>
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-zinc-600 flex items-center justify-center">
                        <AlertTriangle className="size-6 text-gray-500 dark:text-zinc-400" />
                    </div>
                </div>
                <p className="text-center text-gray-800 dark:text-zinc-200 font-medium text-base mb-6">
                    {message}
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition"
                    >
                        Yes, I'm sure
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium text-sm transition"
                    >
                        No, cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;