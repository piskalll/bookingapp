import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Plus, Edit3, Trash2, ShieldCheck, User as UserIcon, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'owner' | 'customer';
    created_at: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: User[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: Pagination;
    filters: {
        search?: string;
        role?: string;
    };
    flash?: { success?: string; error?: string };
}

export default function UsersIndex({ users, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search, role }, { preserveState: true, preserveScroll: true });
    };

    const handleFilterRole = (selectedRole: string) => {
        setRole(selectedRole);
        router.get('/admin/users', { search, role: selectedRole }, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(`/admin/users/${id}`);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getRoleBadge = (r: string) => {
        switch (r) {
            case 'admin':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"><ShieldCheck size={12}/> Admin</span>;
            case 'owner':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"><Building2 size={12}/> Owner</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"><UserIcon size={12}/> Customer</span>;
        }
    };

    return (
        <>
            <Head title="Kelola Pengguna" />

            <div className="p-6 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm">
                        <CheckCircle2 size={16} className="shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
                        <AlertCircle size={16} className="shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Pengguna</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manajemen semua akun pengguna di sistem (Admin, Owner, Customer).
                        </p>
                    </div>
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition shadow-lg shadow-violet-600/20"
                    >
                        <Plus size={16} /> Tambah Pengguna
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:text-white transition"
                        />
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </form>
                    
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
                        {['all', 'admin', 'owner', 'customer'].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleFilterRole(r)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                                    role === r 
                                        ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                {r === 'all' ? 'Semua Role' : r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama & Email</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bergabung</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-gray-400">
                                            Tidak ada pengguna yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/users/${user.id}/edit`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Edit Pengguna"
                                                    >
                                                        <Edit3 size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Hapus Pengguna"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 pt-4">
                        {users.links.map((link, i) => {
                            if (!link.url) {
                                return <span key={i} className="px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />;
                            }
                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                        link.active 
                                            ? 'bg-violet-600 text-white font-semibold' 
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
