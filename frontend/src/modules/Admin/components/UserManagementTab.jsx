import React, { useState, useEffect } from 'react';
import {
  Users, Shield, Sliders, Target, Calendar, Bell, Sparkles,
  Cpu, FileText, Settings, Plus, Trash2, Edit3, Key, Lock, Unlock,
  UserCheck, UserX, Save, Play, Check, Database, RefreshCw, Download, Info,
  Brain, Box, Clock, Thermometer, Folder, CheckCircle, FileSpreadsheet, FileJson,
  Network, Copy, Hash, CreditCard, BarChart2, LineChart, Mail,
  AlertCircle, Minus, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { confirmToast, promptToast } from '../../../components/ConfirmToast';
import { api } from '../../../services/api';

const UserManagementTab = ({ crud }) => {
  const availableRoles = ['System Admin', 'Super Admin', 'Admin', 'CEO', 'CFO', 'CTO', 'COO', 'Product Manager', 'Sales Manager', 'Marketing Manager', 'SEO Manager', 'Operations Manager', 'Finance Manager', 'Data Engineer', 'Developer', 'Support Lead', 'HR Manager', 'Analyst', 'Viewer', 'Guest'];
  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString();
  };

  // 1. STATE - USER MANAGEMENT
  // ----------------------------------------------------
  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ empId: '', name: '', email: '', password: '', phone: '', department: 'Analytics', designation: '', role: 'Analyst' });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('All Departments');
  const [userRoleFilter, setUserRoleFilter] = useState('All Roles');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 5;

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (crud.create === false) {
      toast.error('Access Denied: Your role does not have Create permissions.');
      return;
    }
    if (!newUser.name || !newUser.email) return;
    try {
      const added = {
        ...newUser,
        empId: newUser.empId || `EMP${String(users.length + 1).padStart(3, '0')}`,
        password: newUser.password || 'astroved123',
        status: 'Active',
        createdDate: new Date().toISOString().split('T')[0],
        lastLogin: 'Never'
      };
      await api.createUser(added);
      toast.success('User added successfully');
      loadUsers();

      // Log audit
      await api.createAuditLog({
        user: 'Super Admin',
        action: `Added user ${added.name}`,
        module: 'User Management',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });

      setNewUser({ empId: '', name: '', email: '', password: '', phone: '', department: 'Analytics', designation: '', role: 'Analyst' });
      setShowAddUserModal(false);
    } catch (err) {
      toast.error('Failed to add user');
    }
  };

  const toggleUserStatus = async (empId) => {
    if (crud.edit === false) {
      toast.error('Access Denied: Your role does not have Edit permissions.');
      return;
    }
    const user = users.find(u => u.empId === empId);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.updateUser(empId, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      loadUsers();

      // Log audit
      await api.createAuditLog({
        user: 'Super Admin',
        action: `Toggled user status of ${user.name} to ${newStatus}`,
        module: 'User Management',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteUser = async (empId, name) => {
    if (crud.delete === false) {
      toast.error('Access Denied: Your role does not have Delete permissions.');
      return;
    }
    confirmToast(`Are you sure you want to permanently delete user ${name}? This action cannot be undone.`, {
      title: 'Delete User Confirmation',
      confirmText: 'Yes, Delete User',
      onConfirm: async () => {
        try {
          await api.deleteUser(empId);
          toast.success(`User ${name} deleted successfully`);
          loadUsers();

          // Log audit
          await api.createAuditLog({
            user: 'Super Admin',
            action: `Permanently deleted user: ${name} (ID: ${empId})`,
            module: 'User Management',
            ip: '127.0.0.1',
            browser: navigator.userAgent
          });
        } catch (err) {
          toast.error('Failed to delete user');
        }
      }
    });
  };

  // ----------------------------------------------------

  // Auto-load data on mount
  useEffect(() => {
    // Only call load functions if they exist in this component's scope
    const loadFuncs = ['loadUsers', 'loadRolePermissions', 'loadKPIs', 'loadTargets', 'loadNotifications', 'loadIntegrations', 'loadAuditLogs', 'loadSystemConfig'];
    loadFuncs.forEach(func => {
      try {
        if (typeof eval(func) === 'function') {
          eval(func)();
        }
      } catch (e) { /* Ignore ReferenceErrors */ }
    });
  }, []);

  const filteredUsers = users.filter(u => {
              const matchesSearch = (u.name?.toLowerCase() || '').includes(userSearchTerm.toLowerCase()) ||
                (u.email?.toLowerCase() || '').includes(userSearchTerm.toLowerCase()) ||
                (u.empId?.toLowerCase() || '').includes(userSearchTerm.toLowerCase());
              const matchesDept = userDeptFilter === 'All Departments' || u.department === userDeptFilter;
              const matchesRole = userRoleFilter === 'All Roles' || u.role === userRoleFilter;
              return matchesSearch && matchesDept && matchesRole;
            });
            const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
            const paginatedUsers = filteredUsers.slice((userCurrentPage - 1) * usersPerPage, userCurrentPage * usersPerPage);

  return (
    <>
      <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-cosmic-border/50">
                  <div>
                    <h3 className="text-sm font-extrabold text-cosmic-text">User Directory Management</h3>
                    <p className="text-[10px] text-cosmic-muted mt-0.5">Control employee access permissions, accounts states, and logins audits.</p>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center space-x-2 shadow-md shadow-indigo-600/10 active:scale-95 transition-transform"
                  >
                    <Plus size={14} />
                    <span>Add User</span>
                  </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
                  <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-cosmic-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, email or emp ID..."
                      value={userSearchTerm}
                      onChange={(e) => { setUserSearchTerm(e.target.value); setUserCurrentPage(1); }}
                      className="w-full pl-9 pr-3 py-2 bg-transparent border border-cosmic-border rounded-lg text-xs text-cosmic-text focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="relative w-full sm:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-cosmic-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <select
                      value={userDeptFilter}
                      onChange={(e) => { setUserDeptFilter(e.target.value); setUserCurrentPage(1); }}
                      className="w-full pl-9 pr-3 py-2 bg-transparent border border-cosmic-border rounded-lg text-xs text-cosmic-text focus:outline-none focus:border-indigo-500 appearance-none"
                    >
                      <option value="All Departments">All Departments</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Developer">Developer</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-cosmic-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-cosmic-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => { setUserRoleFilter(e.target.value); setUserCurrentPage(1); }}
                      className="w-full pl-9 pr-3 py-2 bg-transparent border border-cosmic-border rounded-lg text-xs text-cosmic-text focus:outline-none focus:border-indigo-500 appearance-none"
                    >
                      <option value="All Roles">All Roles</option>
                      {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-cosmic-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Users table */}
                <div className="overflow-x-auto">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-cosmic-border text-cosmic-muted font-bold text-[10px] uppercase">
                          <th className="py-2.5 px-2">Emp ID</th>
                          <th className="py-2.5 px-2">Name / Email</th>
                          <th className="py-2.5 px-2">Department</th>
                          <th className="py-2.5 px-2">Role</th>
                          <th className="py-2.5 px-2">Last Login</th>
                          <th className="py-2.5 px-2">Status</th>
                          <th className="py-2.5 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cosmic-border/30 text-[11px] text-cosmic-text font-medium">
                        {paginatedUsers.map((u) => (
                          <tr key={u.empId} className="hover:bg-cosmic-card-hover/40 transition-colors">
                            <td className="py-3 px-2 flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${u.role === 'Super Admin' ? 'bg-[#5b52f6]' :
                                u.role === 'Support Lead' ? 'bg-[#ffb020]' :
                                  u.role === 'Admin' ? 'bg-[#2970ff]' : 'bg-[#10b981]'
                                }`}>
                                {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-mono text-cosmic-muted">{u.empId}</span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-bold text-[12px]">{u.name}</div>
                              <div className="text-[10px] text-cosmic-muted">{u.email}</div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                  {u.department === 'Analytics' ?
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6" /></svg> :
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></svg>
                                  }
                                </div>
                                <span className="text-cosmic-text">{u.department}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${u.role === 'Admin' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-indigo-500/10 text-indigo-500'
                                }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-mono text-cosmic-muted flex items-center space-x-1.5">
                              <Calendar size={12} className="text-cosmic-muted" />
                              <span>{formatLastLogin(u.lastLogin)}</span>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-max space-x-1.5 ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                <span>{u.status}</span>
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => toggleUserStatus(u.empId)}
                                  title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                                  className={`p-1.5 rounded-lg border border-cosmic-border bg-transparent hover:bg-cosmic-card-hover transition-colors ${u.status === 'Active' ? 'text-indigo-400' : 'text-emerald-500'}`}
                                >
                                  {u.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                                </button>
                                <button
                                  onClick={() => {
                                    promptToast(`Enter new password for ${u.name}:`, {
                                      title: 'Reset User Password',
                                      confirmText: 'Reset Password',
                                      defaultValue: 'astroved123',
                                      onConfirm: async (newPass) => {
                                        if (newPass && newPass.trim() !== '') {
                                          try {
                                            await api.updateUser(u.empId, { password: newPass });
                                            toast.success(`Password updated for ${u.name}!`);
                                            api.createAuditLog({
                                              user: 'Super Admin',
                                              action: `Updated password for user ${u.name}`,
                                              module: 'User Management',
                                              ip: '127.0.0.1',
                                              browser: navigator.userAgent
                                            }).catch(err => console.error("Audit log logging failed:", err));
                                          } catch (err) {
                                            toast.error('Failed to update password');
                                          }
                                        }
                                      }
                                    });
                                  }}
                                  title="Reset Password"
                                  className="p-1.5 rounded-lg border border-cosmic-border bg-transparent hover:bg-cosmic-card-hover text-amber-500 transition-colors"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.empId, u.name)}
                                  title="Delete User"
                                  className="p-1.5 rounded-lg border border-cosmic-border bg-transparent hover:bg-cosmic-card-hover text-rose-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-cosmic-border/50 text-[11px] text-cosmic-muted">
                  <div>
                    Showing {filteredUsers.length === 0 ? 0 : (userCurrentPage - 1) * usersPerPage + 1} to {Math.min(userCurrentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={userCurrentPage === 1}
                      className="p-1.5 border border-cosmic-border rounded-lg bg-transparent hover:bg-cosmic-card-hover disabled:opacity-50 disabled:cursor-not-allowed text-cosmic-text"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button className="px-3.5 py-1.5 border border-indigo-600 bg-indigo-600 text-white rounded-lg font-bold shadow-sm shadow-indigo-600/20">
                      {userCurrentPage}
                    </button>
                    <button
                      onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalUserPages))}
                      disabled={userCurrentPage === totalUserPages || totalUserPages === 0}
                      className="p-1.5 border border-cosmic-border rounded-lg bg-transparent hover:bg-cosmic-card-hover disabled:opacity-50 disabled:cursor-not-allowed text-cosmic-text"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

              </div>

              {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-cosmic-card border border-cosmic-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="p-4 border-b border-cosmic-border/50 flex justify-between items-center bg-cosmic-card-hover">
                      <h3 className="font-bold text-cosmic-text flex items-center"><UserCheck className="mr-2 text-indigo-400" size={18} /> Add New User</h3>
                      <button onClick={() => setShowAddUserModal(false)} className="text-cosmic-muted hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <form onSubmit={handleAddUser} className="p-5 space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-cosmic-muted mb-1">Full Name *</label>
                          <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-cosmic-bg border border-cosmic-border rounded-lg px-3 py-2 text-sm text-cosmic-text focus:border-indigo-500 focus:outline-none" placeholder="John Doe" />
                        </div>
                        <div>
                          <label className="block text-xs text-cosmic-muted mb-1">Email Address *</label>
                          <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-cosmic-bg border border-cosmic-border rounded-lg px-3 py-2 text-sm text-cosmic-text focus:border-indigo-500 focus:outline-none" placeholder="john@astroved.com" />
                        </div>
                        <div>
                          <label className="block text-xs text-cosmic-muted mb-1">Employee ID</label>
                          <input type="text" value={newUser.empId} onChange={e => setNewUser({...newUser, empId: e.target.value})} className="w-full bg-cosmic-bg border border-cosmic-border rounded-lg px-3 py-2 text-sm text-cosmic-text focus:border-indigo-500 focus:outline-none" placeholder="Auto-generated if empty" />
                        </div>
                        <div>
                          <label className="block text-xs text-cosmic-muted mb-1">Phone</label>
                          <input type="tel" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full bg-cosmic-bg border border-cosmic-border rounded-lg px-3 py-2 text-sm text-cosmic-text focus:border-indigo-500 focus:outline-none" placeholder="+1..." />
                        </div>
                        <div>
                          <label className="block text-xs text-cosmic-muted mb-1">Department</label>
                          <select value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} className="w-full bg-cosmic-bg border border-cosmic-border rounded-lg px-3 py-2 text-sm text-cosmic-text focus:border-indigo-500 focus:outline-none">
                            <option value="Analytics">Analytics</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Management">Management</option>
                            <option value="Support">Support</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-cosmic-muted mb-1">Role/Permissions</label>
                          <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-cosmic-bg border border-cosmic-border rounded-lg px-3 py-2 text-sm text-cosmic-text focus:border-indigo-500 focus:outline-none">
                            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-cosmic-muted mb-1">Temporary Password</label>
                          <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-cosmic-bg border border-cosmic-border rounded-lg px-3 py-2 text-sm text-cosmic-text focus:border-indigo-500 focus:outline-none" placeholder="Default: astroved123" />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4 border-t border-cosmic-border/50 mt-4">
                        <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 bg-transparent hover:bg-cosmic-card-hover border border-cosmic-border text-cosmic-text rounded-lg text-sm font-medium transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-md transition-colors flex items-center"><Save size={16} className="mr-2"/> Create User</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
    </>
  );
};

export default UserManagementTab;
