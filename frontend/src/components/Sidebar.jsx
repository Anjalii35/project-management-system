import { useRef, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import { FolderOpenIcon, LayoutDashboardIcon, UsersIcon, KeyRound, UserCircle, LogOut, X } from 'lucide-react'
import { updateUser } from '../services/userService'
import { logout } from '../services/authService'
import api from '../api'
import toast from 'react-hot-toast'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "User";
    const userRole = localStorage.getItem("userRole");

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const [profileForm, setProfileForm] = useState({ name: userName, email: "" });
    const [profileImage, setProfileImage] = useState(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
    ]

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    // Load current user email
    useEffect(() => {
        if (userId) {
            api.get(`/users/${userId}`)
                .then(res => setProfileForm({ name: res.data.name, email: res.data.email }))
                .catch(() => {});
        }
    }, [userId]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setIsUpdatingProfile(true);
            await updateUser(Number(userId), {
                name: profileForm.name,
                email: profileForm.email,
                password: "",
            }, profileImage);
            localStorage.setItem("userName", profileForm.name);
            toast.success("Profile updated!");
            setShowEditProfile(false);
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters!");
            return;
        }
        try {
            setIsUpdatingPassword(true);
            await updateUser(Number(userId), {
                name: profileForm.name,
                email: profileForm.email,
                password: passwordForm.newPassword,
            }, null);
            toast.success("Password changed successfully!");
            setShowChangePassword(false);
            setPasswordForm({ newPassword: "", confirmPassword: "" });
        } catch {
            toast.error("Failed to change password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const inputClass = "w-full mt-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:border-blue-500";

    return (
        <>
            <div
                ref={sidebarRef}
                className={`z-10 bg-white dark:bg-zinc-900 min-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:absolute transition-all ${isSidebarOpen ? 'left-0' : '-left-full'}`}
            >
                {/* User Profile Header — clickable */}
                <div
                    className="px-4 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition relative"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                    <img
                        src={`http://localhost:8080/users/${userId}/image`}
                        alt={userName}
                        className="w-9 h-9 rounded-full object-cover bg-gray-200 dark:bg-zinc-700 flex-shrink-0"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff`;
                        }}
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {userRole === "ROLE_ADMIN" ? "Admin" : "Member"}
                        </p>
                    </div>
                    <span className="text-gray-400 text-xs">▾</span>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-lg rounded-b-lg z-20">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); setShowEditProfile(true); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                            >
                                <UserCircle className="size-4" /> Edit Profile
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); setShowChangePassword(true); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                            >
                                <KeyRound className="size-4" /> Change Password
                            </button>
                            <hr className="border-gray-200 dark:border-zinc-700" />
                            <button
                                onClick={(e) => { e.stopPropagation(); logout(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                                <LogOut className="size-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>

                <div className='flex-1 overflow-y-scroll no-scrollbar flex flex-col'>
                    <div>
                        <div className='p-4'>
                            {menuItems.map((item) => (
                                <NavLink
                                    to={item.href}
                                    key={item.name}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${isActive
                                            ? 'bg-gray-100 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50'
                                            : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                                        }`
                                    }
                                >
                                    <item.icon size={16} />
                                    <p className='text-sm truncate'>{item.name}</p>
                                </NavLink>
                            ))}
                        </div>
                        <MyTasksSidebar />
                        <ProjectSidebar />
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditProfile && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Edit Profile</h2>
                            <button onClick={() => setShowEditProfile(false)} className="text-zinc-500 hover:text-zinc-700">
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Profile image preview */}
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <img
                                    src={profileImage ? URL.createObjectURL(profileImage) : `http://localhost:8080/users/${userId}/image`}
                                    alt={userName}
                                    className="w-20 h-20 rounded-full object-cover bg-gray-200"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff`; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('sidebar-profile-img').click()}
                                    className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 text-xs"
                                >
                                    ✎
                                </button>
                                <input id="sidebar-profile-img" type="file" accept="image/*" className="hidden"
                                    onChange={(e) => setProfileImage(e.target.files[0])} />
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="text-sm">Name</label>
                                <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className={inputClass} required />
                            </div>
                            <div>
                                <label className="text-sm">Email</label>
                                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className={inputClass} required />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowEditProfile(false)} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                                <button type="submit" disabled={isUpdatingProfile} className="px-4 py-2 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Change Password</h2>
                            <button onClick={() => setShowChangePassword(false)} className="text-zinc-500 hover:text-zinc-700">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="text-sm">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className={inputClass}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm">Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className={inputClass}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                                <p className="text-xs text-red-500">Passwords do not match</p>
                            )}
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowChangePassword(false)} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                                <button type="submit" disabled={isUpdatingPassword} className="px-4 py-2 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                                    {isUpdatingPassword ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Sidebar