import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { createUser } from "../services/userService";
import { FolderOpen, Users, CheckSquare, BarChart3, X, Mail, Lock, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Landing() {
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" });
    const [signupImage, setSignupImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(loginForm.email, loginForm.password);
            navigate("/");
        } catch {
            toast.error("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!signupImage) { toast.error("Please upload a profile photo"); return; }
        try {
            setLoading(true);
            await createUser({ name: signupForm.name, email: signupForm.email, password: signupForm.password }, signupImage);
            toast.success("Account created! Please login.");
            setShowSignup(false);
            setShowLogin(true);
            setLoginForm({ email: signupForm.email, password: "" });
        } catch {
            toast.error("Signup failed. Email may already exist.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: FolderOpen, title: "Project Management", desc: "Create and manage projects with deadlines and status tracking" },
        { icon: CheckSquare, title: "Task Tracking", desc: "Assign tasks to team members with priority and progress tracking" },
        { icon: Users, title: "Team Collaboration", desc: "Manage your team, assign roles and collaborate efficiently" },
        { icon: BarChart3, title: "Analytics", desc: "Get insights on project progress and team performance" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Navbar */}
            <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FolderOpen className="size-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-lg">Project Manager</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setShowLogin(true); setShowSignup(false); }}
                            className="px-4.5 py-2 text-base text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => { setShowSignup(true); setShowLogin(false); }}
                            className="px-4.5 py-2 text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    Manage Projects<br />
                    <span className="text-blue-500">Like a Pro</span>
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                    A complete project management solution for teams. Track tasks, manage members, and deliver projects on time.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <button
                        onClick={() => setShowSignup(true)}
                        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                    >
                        Get Started Free
                    </button>
                    <button
                        onClick={() => setShowLogin(true)}
                        className="px-8 py-3 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition"
                    >
                        Login
                    </button>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">Everything you need</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                                <f.icon className="size-5 text-blue-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 w-full max-w-md mx-4 relative">
                        <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="size-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">Login to your account</p>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                    placeholder="Email address"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required />
                            </div>
                            
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <><Loader2 className="size-4 animate-spin" /> Logging in...</> : "Login"}
                            </button>
                        </form>
                        <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mt-4">
                            Don't have an account?{" "}
                            <button onClick={() => { setShowLogin(false); setShowSignup(true); }} className="text-blue-500 hover:underline">
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* Signup Modal */}
            {showSignup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 w-full max-w-md mx-4 relative">
                        <button onClick={() => setShowSignup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="size-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h2>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">Start managing projects today</p>
                        <form onSubmit={handleSignup} className="space-y-4">
                            {/* Profile photo */}
                            <div className="flex justify-center">
                                <div className="relative cursor-pointer" onClick={() => document.getElementById('signup-img').click()}>
                                    {signupImage ? (
                                        <img src={URL.createObjectURL(signupImage)} className="w-16 h-16 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-600 flex flex-col items-center justify-center">
                                            <User className="size-5 text-gray-400" />
                                            <span className="text-xs text-gray-400 mt-1">Photo</span>
                                        </div>
                                    )}
                                    <input id="signup-img" type="file" accept="image/*" className="hidden"
                                        onChange={(e) => setSignupImage(e.target.files[0])} />
                                </div>
                            </div>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <input type="text" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                                    placeholder="Full name"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <input type="email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                    placeholder="Email address"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <input type="password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <><Loader2 className="size-4 animate-spin" /> Creating account...</> : "Create Account"}
                            </button>
                        </form>
                        <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mt-4">
                            Already have an account?{" "}
                            <button onClick={() => { setShowSignup(false); setShowLogin(true); }} className="text-blue-500 hover:underline">
                                Login
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}