import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Court {
    id: number;
    name: string;
    type: string;
    price_per_hour: number;
}

interface Venue {
    id: number;
    name: string;
    courts: Court[];
}

export default function OwnerCourtsIndex({ venue }: { venue: Venue }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Kelola Tempat', href: '/owner/venues' },
        { label: `Lapangan ${venue.name}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lapangan di ${venue.name}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Lapangan</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Kelola lapangan yang ada di <strong>{venue.name}</strong>
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            href={`/owner/venues/${venue.id}/courts/create`}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Tambah Lapangan
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nama Lapangan</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Jenis</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Harga/Jam</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {venue.courts.length > 0 ? (
                                            venue.courts.map((court) => (
                                                <tr key={court.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{court.name}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{court.type}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        Rp {court.price_per_hour.toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-8 text-center text-sm text-gray-500">
                                                    Belum ada lapangan di tempat ini.
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
        </AppLayout>
    );
}