import { Head } from '@inertiajs/react';
import CourtBooking from '@/components/Bookings/CourtBooking';

interface Court {
    id: number;
    name: string;
    type: string;
    price_per_hour: number;
    venue: {
        id: number;
        name: string;
        address: string;
    };
}

interface Props {
    court: Court;
}

export default function BookingsCreate({ court }: Props) {
    return (
        <>
            <Head title={`Pesan ${court.name}`} />
            <div className="py-6">
                <CourtBooking court={court} />
            </div>
        </>
    );
}

// Layout configuration
// BookingsCreate.layout = {
//     breadcrumbs: [
//         { label: 'Dashboard', href: route('dashboard') },
//         { label: 'Lapangan', href: route('venues.index') },
//         { label: 'Pesan Lapangan', href: '#' },
//     ],
// };
