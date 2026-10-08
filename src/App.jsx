import React, { useState, useEffect } from 'react';
import styles from './TaskManager.module.css';

const API_BASE = "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  
  // 🌟 View Modes: "login" | "register" | "verify" | "forgot" | "reset" | "dashboard" | "changePassword"
  const [viewMode, setViewMode] = useState("login");

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Change Password State
  const [oldPassword, setOldPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Tasks & Upload States
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // 1. Register & Login Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    const endpoint = viewMode === "login" ? "/auth/login" : "/auth/register";
    const payload = viewMode === "login" ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "Authentication failed");

      if (viewMode === "login") {
        const authToken = data.User?.accessToken || data.accessToken || data.token;
        if (authToken) {
          localStorage.setItem("token", authToken);
          setToken(authToken);
        } else {
          alert("Login successful, but token not found!");
        }
      } else {
        // Register ke baad OTP verify karne ke liye bhej do
        setAuthSuccess("Registration successful! Please enter the OTP sent to your email.");
        setViewMode("verify");
      }
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
    }
  };

  // 2. Verify Email OTP Handler
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verifiEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      alert(data.message || "Email verified successfully!");
      const authToken = data.User?.accessToken || data.accessToken;
      if (authToken) {
        localStorage.setItem("token", authToken);
        setToken(authToken);
      } else {
        setViewMode("login");
      }
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
    }
  };

  // 3. Forgot Password (Sends OTP)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setAuthSuccess("Password reset OTP sent to your email!");
      setViewMode("reset");
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
    }
  };

  // 4. Reset Password (OTP + New Password)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/resetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "Password reset failed");

      alert("Password reset successfully! You are now logged in.");
      const authToken = data.User?.accessToken || data.accessToken;
      if (authToken) {
        localStorage.setItem("token", authToken);
        setToken(authToken);
      } else {
        setViewMode("login");
      }
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
    }
  };

  // 5. Change Password (Protected Route)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/change-Pssword`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword: changeNewPassword })
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "Password change failed");

      alert("Password changed successfully!");
      setOldPassword("");
      setChangeNewPassword("");
      setViewMode("dashboard");
    } catch (err) {
      setLoading(false);
      setAuthError(err.message);
    }
  };

  // 6. Logout Handler
  const handleLogout = async () => {
    try {
      // Optional: Backend logout endpoint hit karna agar refresh token storage me ho
      await fetch(`${API_BASE}/auth/logOut`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") })
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setToken("");
      setTasks([]);
      setViewMode("login");
    }
  };

  // Cloudinary Image Upload
  const handleImageUpload = async () => {
    if (!imageFile) return alert("Please select an image first!");
    const formData = new FormData();
    formData.append("image", imageFile);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setUploadedImageUrl(data.url);
        alert("Image uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  // Task Handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setTaskLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, completed: false })
      });

      if (res.ok) {
        setTitle("");
        fetchTasks();
      }
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setTaskLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await fetch(`${API_BASE}/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: task.title, completed: !task.completed })
      });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleUpdateTaskTitle = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle })
      });
      setEditingId(null);
      setEditTitle("");
      fetchTasks();
    } catch (err) {
      console.error("Error editing task:", err);
    }
  };

  // --- AUTH VIEWS CONTAINER ---
  if (!token) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.card}>
          <h2 className={styles.title}>
            {viewMode === "login" && "Welcome Back 👋"}
            {viewMode === "register" && "Create Account 🚀"}
            {viewMode === "verify" && "Verify Email ✉️"}
            {viewMode === "forgot" && "Forgot Password 🔑"}
            {viewMode === "reset" && "Reset Password 🔒"}
          </h2>

          {authError && <div className={styles.error}>{authError}</div>}
          {authSuccess && <div className={styles.success} style={{ color: "green", marginBottom: "10px" }}>{authSuccess}</div>}

          {/* 1. LOGIN */}
          {viewMode === "login" && (
            <form onSubmit={handleAuth}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} placeholder="you@example.com" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} placeholder="••••••••" />
              </div>
              <div style={{ textAlign: "right", marginBottom: "15px" }}>
                <button type="button" onClick={() => { setViewMode("forgot"); setAuthError(""); setAuthSuccess(""); }} className={styles.linkButton} style={{ fontSize: "13px" }}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {/* 2. REGISTER */}
          {viewMode === "register" && (
            <form onSubmit={handleAuth}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={styles.input} placeholder="Daud Khan" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} placeholder="you@example.com" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}

          {/* 3. VERIFY EMAIL OTP */}
          {viewMode === "verify" && (
            <form onSubmit={handleVerifyEmail}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" disabled value={email} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>6-Digit OTP</label>
                <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className={styles.input} placeholder="123456" />
              </div>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {/* 4. FORGOT PASSWORD */}
          {viewMode === "forgot" && (
            <form onSubmit={handleForgotPassword}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Registered Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? "Sending OTP..." : "Send Reset OTP"}
              </button>
            </form>
          )}

          {/* 5. RESET PASSWORD */}
          {viewMode === "reset" && (
            <form onSubmit={handleResetPassword}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" disabled value={email} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>6-Digit OTP</label>
                <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className={styles.input} placeholder="123456" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={styles.input} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* Switchers */}
          <p className={styles.switchText} style={{ marginTop: "20px", textAlign: "center" }}>
            {viewMode === "login" && (
              <>Don't have an account? <button onClick={() => { setViewMode("register"); setAuthError(""); setAuthSuccess(""); }} className={styles.linkButton}>Register</button></>
            )}
            {viewMode === "register" && (
              <>Already have an account? <button onClick={() => { setViewMode("login"); setAuthError(""); setAuthSuccess(""); }} className={styles.linkButton}>Login</button></>
            )}
            {(viewMode === "verify" || viewMode === "forgot" || viewMode === "reset") && (
              <>Back to <button onClick={() => { setViewMode("login"); setAuthError(""); setAuthSuccess(""); }} className={styles.linkButton}>Login</button></>
            )}
          </p>
        </div>
      </div>
    );
  }

  // --- DASHBOARD / CHANGE PASSWORD VIEW ---
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>📝 Task Manager Dashboard</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            {viewMode === "dashboard" ? (
              <button onClick={() => setViewMode("changePassword")} className={styles.btnSuccess} style={{ fontSize: "13px" }}>
                Change Password
              </button>
            ) : (
              <button onClick={() => setViewMode("dashboard")} className={styles.btnSuccess} style={{ fontSize: "13px" }}>
                Back to Tasks
              </button>
            )}
            <button onClick={handleLogout} className={styles.btnDanger}>
              Logout
            </button>
          </div>
        </div>

        {authError && <div className={styles.error}>{authError}</div>}
        {authSuccess && <div className={styles.success} style={{ color: "green", marginBottom: "10px" }}>{authSuccess}</div>}

        {/* CHANGE PASSWORD SECTION */}
        {viewMode === "changePassword" && (
          <div className={styles.card} style={{ maxWidth: "100%", margin: "20px 0" }}>
            <h3 style={{ marginBottom: "15px" }}>🔒 Change Your Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Old Password</label>
                <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={styles.input} placeholder="••••••••" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input type="password" required value={changeNewPassword} onChange={(e) => setChangeNewPassword(e.target.value)} className={styles.input} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {/* MAIN TASK & UPLOAD DASHBOARD */}
        {viewMode === "dashboard" && (
          <>
            {/* Image Upload Section */}
            <div className={styles.uploadSection}>
              <h2 className={styles.uploadTitle}>☁️ Cloudinary Image Upload</h2>
              <div className={styles.uploadRow}>
                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} className={styles.fileInput} />
                <button onClick={handleImageUpload} disabled={loading} className={styles.btnSuccess}>
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
              {uploadedImageUrl && (
                <div className={styles.previewContainer}>
                  <p className={styles.previewLabel}>Uploaded Preview:</p>
                  <img src={uploadedImageUrl} alt="Uploaded" className={styles.previewImage} />
                </div>
              )}
            </div>

            {/* Create Task Form */}
            <form onSubmit={handleCreateTask} className={styles.taskForm}>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a new task..." className={styles.input} />
              <button type="submit" disabled={taskLoading} className={styles.addTaskBtn}>
                {taskLoading ? "Adding..." : "Add Task"}
              </button>
            </form>

            {/* Task List */}
            <div>
              {tasks.length === 0 ? (
                <p className={styles.noTasks}>No tasks found. Create one above!</p>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className={styles.taskItem}>
                    <div className={styles.taskLeft}>
                      <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task)} className={styles.checkbox} />

                      {editingId === task._id ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={styles.input} style={{ padding: "4px 8px", fontSize: "14px" }} />
                          <button onClick={() => handleUpdateTaskTitle(task._id)} className={styles.btnSuccess} style={{ padding: "4px 10px", fontSize: "12px" }}>Save</button>
                          <button onClick={() => setEditingId(null)} className={styles.btnDanger} style={{ padding: "4px 10px", fontSize: "12px" }}>Cancel</button>
                        </div>
                      ) : (
                        <span className={task.completed ? styles.completedTask : styles.pendingTask} onDoubleClick={() => { setEditingId(task._id); setEditTitle(task.title); }} title="Double click to edit">
                          {task.title}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {editingId !== task._id && (
                        <button onClick={() => { setEditingId(task._id); setEditTitle(task.title); }} className={styles.btnSuccess} style={{ padding: "6px 12px", fontSize: "12px" }}>
                          Edit
                        </button>
                      )}
                      <button onClick={() => handleDeleteTask(task._id)} className={styles.btnDanger}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}