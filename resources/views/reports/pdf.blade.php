<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Pendapatan</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* Kop Surat */
        .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 12px;
            color: #666;
        }
        
        /* Info Laporan */
        .report-info {
            margin-bottom: 30px;
            font-size: 13px;
        }
        
        .report-info p {
            margin-bottom: 8px;
        }
        
        .report-info strong {
            display: inline-block;
            width: 150px;
        }
        
        /* Tabel */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        table thead {
            background-color: #f0f0f0;
        }
        
        table th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #ddd;
            font-size: 13px;
            color: #333;
        }
        
        table td {
            padding: 10px 12px;
            border: 1px solid #ddd;
            font-size: 12px;
        }
        
        table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        table tbody tr:hover {
            background-color: #f5f5f5;
        }
        
        /* Kolom Nomor */
        .col-no {
            width: 40px;
            text-align: center;
        }
        
        /* Kolom Tanggal */
        .col-date {
            width: 90px;
        }
        
        /* Kolom Pemesan */
        .col-name {
            width: 120px;
        }
        
        /* Kolom Lapangan */
        .col-place {
            flex: 1;
        }
        
        /* Kolom Harga */
        .col-price {
            width: 110px;
            text-align: right;
        }
        
        /* Footer Total */
        .total-row {
            background-color: #e8e8e8;
            font-weight: bold;
        }
        
        .total-row td {
            padding: 12px;
            border: 1px solid #999;
        }
        
        .total-label {
            text-align: right;
            padding-right: 20px !important;
        }
        
        .total-amount {
            text-align: right;
            font-size: 14px;
            color: #1a7d1a;
        }
        
        /* Catatan Footer */
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        
        /* Utility */
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-bold {
            font-weight: bold;
        }
        
        /* Print Styles */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .container {
                max-width: 100%;
            }
            
            table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header / Kop Surat -->
        <div class="header">
            <h1>🏟️ SISTEM PENYEWAAN LAPANGAN OLAHRAGA</h1>
            <p>Laporan Pendapatan Pesanan Terkonfirmasi</p>
        </div>
        
        <!-- Info Laporan -->
        <div class="report-info">
            <p>
                <strong>Periode Laporan:</strong>
                {{ \Carbon\Carbon::parse($startDate)->format('d-m-Y') }} 
                s/d 
                {{ \Carbon\Carbon::parse($endDate)->format('d-m-Y') }}
            </p>
            <p>
                <strong>Tanggal Cetak:</strong>
                {{ $printDate }}
            </p>
            <p>
                <strong>Total Pesanan:</strong>
                {{ $bookings->count() }} pesanan
            </p>
        </div>
        
        <!-- Tabel Laporan -->
        <table>
            <thead>
                <tr>
                    <th class="col-no">No</th>
                    <th class="col-date">Tanggal Main</th>
                    <th class="col-name">Pemesan</th>
                    <th class="col-place">Tempat & Lapangan</th>
                    <th class="col-price">Nominal</th>
                </tr>
            </thead>
            <tbody>
                @forelse($bookings as $index => $booking)
                    <tr>
                        <td class="col-no text-center">{{ $index + 1 }}</td>
                        <td class="col-date">
                            {{ \Carbon\Carbon::parse($booking['booking_date'])->format('d-m-Y') }}
                        </td>
                        <td class="col-name">{{ $booking['user_name'] }}</td>
                        <td class="col-place">
                            <strong>{{ $booking['court_name'] }}</strong><br>
                            <small>{{ $booking['venue_name'] }}</small>
                        </td>
                        <td class="col-price text-right">
                            Rp {{ number_format($booking['total_price'], 0, ',', '.') }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="text-center">
                            Tidak ada data pesanan untuk periode ini
                        </td>
                    </tr>
                @endforelse
                
                <!-- Total Row -->
                @if($bookings->count() > 0)
                    <tr class="total-row">
                        <td colspan="4" class="total-label">TOTAL PENDAPATAN</td>
                        <td class="col-price total-amount">
                            Rp {{ number_format($totalRevenue, 0, ',', '.') }}
                        </td>
                    </tr>
                @endif
            </tbody>
        </table>
        
        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini dicetak secara otomatis oleh sistem</p>
            <p>Laporan Pendapatan © {{ date('Y') }} Sistem Penyewaan Lapangan Olahraga</p>
        </div>
    </div>
</body>
</html>
