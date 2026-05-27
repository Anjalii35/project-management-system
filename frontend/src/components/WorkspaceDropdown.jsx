import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { logout } from "../services/authService";

function WorkspaceDropdown() {
    // Decode username from JWT
    const getUserName = () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return "User";
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.name || payload.sub || payload.email || "User";
        } catch { return "User"; }
    };

    return (
        <div className="m-4 p-3 flex items-center justify-between rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    PM
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                        Project Manager
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {getUserName()}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default WorkspaceDropdown;