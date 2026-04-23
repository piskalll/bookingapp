import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { index as venuesIndex } from '@/routes/venues';
import { create as bookingsCreate } from '@/routes/bookings';

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

export default function VenuesIndex({ venues }: Props) {
    return (
        <>
            <Head title="Daftar Lapangan" />
            <div className="flex flex-col gap-6 rounded-lg p-6">
                <div>
                    <h1 className="text-3xl font-bold">Daftar Lapangan Olahraga</h1>
                    <p className="text-gray-600">Pilih lapangan dan pesan sekarang</p>
                </div>

                {/* Venues List - Grouped by Venue */}
                <div className="grid gap-6">
                    {venues.map((venue) => (
                        <div
                            key={venue.id}
                            className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Venue Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                                {venue.image && (
                                    <img
                                        src={venue.image}
                                        alt={venue.name}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                )}
                                <h2 className="text-2xl font-bold mb-2">{venue.name}</h2>
                                <p className="text-blue-100">{venue.address}</p>
                            </div>

                            {/* Courts Grid */}
                            <div className="p-6">
                                {venue.courts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {venue.courts.map((court) => (
                                            <div
                                                key={court.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                                            >
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">
                                                            {court.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 capitalize">
                                                            {court.type}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-2xl font-bold text-blue-600">
                                                            Rp {(court.price_per_hour / 1000).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                            k
                                                        </span>
                                                        <span className="text-xs text-gray-500">/jam</span>
                                                    </div>

                                                    <Link
                                                        href={bookingsCreate(court.id)}
                                                        className="w-full"
                                                    >
                                                        <Button className="w-full">
                                                            Pesan Sekarang
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        Belum ada lapangan tersedia di venue ini.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {venues.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Belum ada venue tersedia.</p>
                    </div>
                )}
            </div>
        </>
    );
}

// Layout configuration
// VenuesIndex.layout = {
//     breadcrumbs: [
//         { label: 'Dashboard', href: route('dashboard') },
//         { label: 'Lapangan', href: route('venues.index') },
//     ],
// };
