import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// Mendefinisikan tipe data sesuai dengan relasi yang dikirim dari Controller
interface Court {
    id: number;
    name: string;
    type: string;
    price_per_hour: number;
}

interface Venue {
    id: number;
    name: string;
    address: string;
    image: string | null;
    courts: Court[];
}

interface Props {
    venues: Venue[];
}

// Breadcrumbs untuk navigasi atas
const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Kelola Tempat', href: '#' },
];

export default function OwnerVenuesIndex({ venues }: Props) {
    return (
        <div breadcrumbs={breadcrumbs}>
            <Head title="Kelola Tempat (Owner)" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tempat Olahraga Anda</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Daftar semua tempat olahraga yang Anda kelola, termasuk informasi alamat dan jumlah lapangan.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        {/* Tombol Tambah Venue */}
                        <Link
                            href="/owner/venues/create" // Sesuaikan dengan route Anda
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                        >
                            Tambah Tempat Baru
                        </Link>
                    </div>
                </div>

                {/* Table Section */}
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Info Tempat
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Alamat
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                                                Jumlah Lapangan
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                                                <span className="sr-only">Aksi</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {venues.length > 0 ? (
                                            venues.map((venue) => (
                                                <tr key={venue.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                {venue.image ? (
                                                                    <img className="h-10 w-10 rounded-full object-cover border" src={`/uploads/venues/${venue.image}`} alt="" />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                                        {venue.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="font-medium text-gray-900">{venue.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <div className="truncate max-w-xs">{venue.address}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                            {venue.courts.length} Lapangan
                                                        </span>
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <Link href={`/owner/venues/${venue.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                                                            Edit<span className="sr-only">, {venue.name}</span>
                                                        </Link>
                                                        {/* Tombol ke halaman kelola court spesifik venue ini */}
                                                        <Link href={`/owner/venues/${venue.id}/courts`} className="text-indigo-600 hover:text-indigo-900">
                                                            Kelola Lapangan
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                                                    Anda belum memiliki tempat olahraga yang terdaftar. <br />
                                                    Silakan klik "Tambah Tempat Baru" untuk mulai.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

OwnerVenuesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);