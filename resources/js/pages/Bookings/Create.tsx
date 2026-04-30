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
        image?: string | null;
    };
}

interface Props {
    court: Court;
}

export default function BookingsCreate({ court }: Props) {
    return (
        <>
            <Head title={`Pesan ${court.name}`} />
            <CourtBooking court={court} />
        </>
    );
}
