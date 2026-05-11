import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Search, Trophy, ArrowRight, User } from 'lucide-react';

export default function Dashboard() {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    return (
        <>
            <Head title="Dashboard - Customer" />

            <div className="min-h-screen bg-slate-50 font-sans">
                {/* Header / Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-16 sm:py-24">
                    {/* Decorative blobs */}
                    <div className="pointer-events-none absolute -right-40 -top-40 h-[400px] w-[400px] rounded-full bg-white/10 blur-[80px]" />
                    <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-teal-400/20 blur-[80px]" />
                    
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <span className="mb-3 inline-block rounded-full border border-emerald-400/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-md">
                                    🌟 Member Area
                                </span>
                                <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl tracking-tight">
                                    Selamat datang, <br className="hidden md:block" />
                                    <span className="text-emerald-200">{user?.name}</span>
                                </h1>
                                <p className="mt-4 max-w-xl text-lg text-emerald-50">
                                    Siap untuk berolahraga hari ini? Temukan dan sewa lapangan favorit Anda dalam hitungan detik.
                                </p>
                            </div>
                            
                            <div className="hidden md:block">
                                <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
                                    <Trophy size={48} className="text-emerald-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1: Cari Lapangan */}
                        <Link 
                            href="/venues"
                            className="group relative flex flex-col items-start justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden"
                        >
                            <div className="absolute -right-6 -top-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 p-12 transition-transform group-hover:scale-110">
                                <Search size={32} className="text-emerald-500" />
                            </div>
                            
                            <div className="relative z-10 mb-12">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <MapPin size={24} />
                                </div>
                            </div>
                            
                            <div className="relative z-10 w-full">
                                <h3 className="mb-2 text-xl font-bold text-gray-900">Cari Lapangan</h3>
                                <p className="text-sm text-gray-500 mb-6">Jelajahi berbagai pilihan lapangan olahraga terbaik di sekitar Anda.</p>
                                
                                <div className="flex items-center text-sm font-bold text-emerald-600 group-hover:text-emerald-700">
                                    Mulai Mencari
                                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>

                        {/* Card 2: Riwayat Pesanan */}
                        <Link 
                            href="/bookings"
                            className="group relative flex flex-col items-start justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
                        >
                            <div className="absolute -right-6 -top-6 rounded-full bg-gradient-to-br from-blue-100 to-cyan-50 p-12 transition-transform group-hover:scale-110">
                                <Calendar size={32} className="text-blue-500" />
                            </div>
                            
                            <div className="relative z-10 mb-12">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Clock size={24} />
                                </div>
                            </div>
                            
                            <div className="relative z-10 w-full">
                                <h3 className="mb-2 text-xl font-bold text-gray-900">Riwayat Pesanan</h3>
                                <p className="text-sm text-gray-500 mb-6">Pantau status pesanan, jadwal main, dan riwayat transaksi Anda.</p>
                                
                                <div className="flex items-center text-sm font-bold text-blue-600 group-hover:text-blue-700">
                                    Lihat Riwayat
                                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>

                        {/* Card 3: Pengaturan Profil */}
                        <Link 
                            href="/profile"
                            className="group relative flex flex-col items-start justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden"
                        >
                            <div className="absolute -right-6 -top-6 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-50 p-12 transition-transform group-hover:scale-110">
                                <User size={32} className="text-purple-500" />
                            </div>
                            
                            <div className="relative z-10 mb-12">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <User size={24} />
                                </div>
                            </div>
                            
                            <div className="relative z-10 w-full">
                                <h3 className="mb-2 text-xl font-bold text-gray-900">Profil Saya</h3>
                                <p className="text-sm text-gray-500 mb-6">Kelola informasi akun, kata sandi, dan preferensi profil Anda.</p>
                                
                                <div className="flex items-center text-sm font-bold text-purple-600 group-hover:text-purple-700">
                                    Atur Profil
                                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Information Banner */}
                    <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-100/50 to-transparent pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-xs">💡</span>
                                    Tips Bertransaksi
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                                        <span>Pesanan yang sudah dibuat memiliki batas waktu pembayaran <strong className="text-emerald-700">15 menit</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                                        <span>Pastikan Anda mengunggah bukti pembayaran yang valid agar pesanan segera dikonfirmasi oleh mitra kami.</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="shrink-0">
                                <Link 
                                    href="/venues"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                                >
                                    Eksplor Sekarang
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
