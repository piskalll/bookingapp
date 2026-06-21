<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Keuangan Langganan Mitra</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.5; font-size: 12px; }
        .container { max-width: 960px; margin: 0 auto; padding: 24px 28px; }

        /* ── KOP SURAT ── */
        .header { border-bottom: 3px solid #059669; padding-bottom: 18px; margin-bottom: 24px; display: flex; align-items: flex-start; justify-content: space-between; }
        .header-left h1 { font-size: 20px; font-weight: bold; color: #064e3b; letter-spacing: .5px; }
        .header-left .sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .header-right { text-align: right; }
        .badge-type { display: inline-block; background: #d1fae5; color: #065f46; font-size: 10px; font-weight: bold; letter-spacing: .1em; text-transform: uppercase; padding: 3px 10px; border-radius: 99px; border: 1px solid #6ee7b7; margin-bottom: 4px; }
        .doc-no { font-size: 10px; color: #9ca3af; }

        /* ── INFO BOX ── */
        .info-grid { display: table; width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-cell { display: table-cell; width: 50%; vertical-align: top; }
        .info-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; margin-right: 8px; }
        .info-block.right { margin-right: 0; margin-left: 8px; }
        .info-block p { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
        .info-block p strong { color: #111827; }
        .info-label { font-size: 9px; font-weight: bold; letter-spacing: .12em; text-transform: uppercase; color: #9ca3af; margin-bottom: 2px; }

        /* ── STAT CARDS ── */
        .stats-row { display: table; width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .stat-card { display: table-cell; width: 25%; padding: 10px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; text-align: center; }
        .stat-card + .stat-card { margin-left: 0; border-left: none; }
        .stat-card .s-val { font-size: 18px; font-weight: bold; color: #059669; }
        .stat-card .s-lbl { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: .1em; margin-top: 2px; }
        .stat-card.accent { background: #ecfdf5; }

        /* ── TABEL ── */
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        thead tr { background: #064e3b; color: white; }
        thead th { padding: 9px 10px; text-align: left; font-size: 11px; font-weight: bold; letter-spacing: .04em; }
        thead th.right { text-align: right; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        tbody tr { border-bottom: 1px solid #f3f4f6; }
        tbody td { padding: 8px 10px; font-size: 11px; vertical-align: top; }
        tbody td.right { text-align: right; }
        tbody td.center { text-align: center; }

        .badge-active { display: inline-block; background: #d1fae5; color: #065f46; font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 99px; }
        .badge-inactive { display: inline-block; background: #fee2e2; color: #991b1b; font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 99px; }
        .badge-pending { display: inline-block; background: #fef3c7; color: #92400e; font-size: 9px; font-weight: bold; padding: 2px 8px; border-radius: 99px; }

        /* ── TOTAL ROW ── */
        .total-row td { background: #064e3b; color: white; font-weight: bold; padding: 10px; font-size: 12px; }
        .total-row td.right { text-align: right; font-size: 13px; }

        /* ── SECTION TITLE ── */
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: .1em; color: #059669; margin: 18px 0 8px; border-left: 3px solid #059669; padding-left: 8px; }

        /* ── MONTHLY BREAKDOWN TABLE ── */
        .monthly-table thead tr { background: #1e3a5f; }

        /* ── FOOTER ── */
        .footer { margin-top: 36px; border-top: 1px solid #e5e7eb; padding-top: 14px; display: table; width: 100%; }
        .footer-left { display: table-cell; font-size: 10px; color: #9ca3af; }
        .footer-right { display: table-cell; text-align: right; font-size: 10px; color: #9ca3af; }
        .footer-sign { margin-top: 40px; text-align: right; font-size: 11px; }
        .footer-sign .sign-line { border-top: 1px solid #333; width: 180px; margin-left: auto; margin-top: 48px; padding-top: 4px; text-align: center; }

        @media print {
            body { margin: 0; }
            .container { max-width: 100%; padding: 12px; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
<div class="container">

    <!-- KOP SURAT -->
    <div class="header">
        <div class="header-left">
            <h1>&#127967; LapanganPro &mdash; Laporan Keuangan</h1>
            <div class="sub">Laporan Pendapatan Langganan Mitra Owner &bull; Dicetak oleh Sistem</div>
        </div>
        <div class="header-right">
            <div class="badge-type">Subscription Revenue</div>
            <div class="doc-no">No. Dok: SUB-{{ date('Ymd') }}-{{ rand(1000,9999) }}</div>
        </div>
    </div>

    <!-- INFO LAPORAN -->
    <div class="info-grid">
        <div class="info-cell">
            <div class="info-block">
                <div class="info-label">Periode Laporan</div>
                <p><strong>{{ \Carbon\Carbon::parse($startDate)->format('d F Y') }}</strong> s/d <strong>{{ \Carbon\Carbon::parse($endDate)->format('d F Y') }}</strong></p>
                <div class="info-label" style="margin-top:8px">Tanggal Cetak</div>
                <p><strong>{{ $printDate }}</strong></p>
            </div>
        </div>
        <div class="info-cell">
            <div class="info-block right">
                <div class="info-label">Ringkasan</div>
                <p>Total Mitra: <strong>{{ $totalPartners }}</strong> owner</p>
                <p>Transaksi Berhasil: <strong>{{ $totalTransactions }}</strong> transaksi</p>
                <p>Status Filter: <strong>{{ $statusLabel }}</strong></p>
            </div>
        </div>
    </div>

    <!-- STAT CARDS -->
    <table style="margin-bottom:20px; border:none;">
        <tr>
            <td style="width:25%; padding:6px; border:none;">
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:10px; text-align:center;">
                    <div style="font-size:18px; font-weight:bold; color:#059669;">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</div>
                    <div style="font-size:9px; color:#6b7280; text-transform:uppercase; margin-top:3px;">Total Pendapatan</div>
                </div>
            </td>
            <td style="width:25%; padding:6px; border:none;">
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:10px; text-align:center;">
                    <div style="font-size:18px; font-weight:bold; color:#1d4ed8;">{{ $totalTransactions }}</div>
                    <div style="font-size:9px; color:#6b7280; text-transform:uppercase; margin-top:3px;">Transaksi</div>
                </div>
            </td>
            <td style="width:25%; padding:6px; border:none;">
                <div style="background:#fdf4ff; border:1px solid #e9d5ff; border-radius:6px; padding:10px; text-align:center;">
                    <div style="font-size:18px; font-weight:bold; color:#7c3aed;">{{ $totalPartners }}</div>
                    <div style="font-size:9px; color:#6b7280; text-transform:uppercase; margin-top:3px;">Mitra Owner</div>
                </div>
            </td>
            <td style="width:25%; padding:6px; border:none;">
                <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:6px; padding:10px; text-align:center;">
                    <div style="font-size:18px; font-weight:bold; color:#ea580c;">Rp {{ $totalTransactions > 0 ? number_format($totalRevenue / $totalTransactions, 0, ',', '.') : '0' }}</div>
                    <div style="font-size:9px; color:#6b7280; text-transform:uppercase; margin-top:3px;">Rata-rata / Transaksi</div>
                </div>
            </td>
        </tr>
    </table>

    <!-- TABEL DETAIL TRANSAKSI -->
    <div class="section-title">Detail Transaksi Langganan</div>
    <table>
        <thead>
            <tr>
                <th style="width:30px;">No</th>
                <th style="width:90px;">Tanggal</th>
                <th>Owner / Mitra</th>
                <th style="width:80px;">Order ID</th>
                <th style="width:70px;">Durasi</th>
                <th class="right" style="width:110px;">Nominal</th>
                <th style="width:70px; text-align:center;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $index => $pay)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($pay['created_at'])->format('d-m-Y') }}</td>
                    <td>
                        <strong>{{ $pay['owner_name'] }}</strong><br>
                        <span style="color:#6b7280; font-size:10px;">{{ $pay['owner_email'] }}</span>
                    </td>
                    <td style="font-size:10px; color:#374151;">{{ $pay['order_id'] }}</td>
                    <td>{{ $pay['months'] ?? '-' }} bln</td>
                    <td class="right"><strong>Rp {{ number_format($pay['amount'], 0, ',', '.') }}</strong></td>
                    <td class="center">
                        @if($pay['status'] === 'success')
                            <span class="badge-active">Berhasil</span>
                        @elseif($pay['status'] === 'pending')
                            <span class="badge-pending">Pending</span>
                        @else
                            <span class="badge-inactive">Gagal</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align:center; color:#9ca3af; padding:24px;">Tidak ada data transaksi untuk periode dan filter yang dipilih.</td>
                </tr>
            @endforelse

            @if(count($payments) > 0)
                <tr class="total-row">
                    <td colspan="5" style="text-align:right; letter-spacing:.05em;">TOTAL PENDAPATAN LANGGANAN</td>
                    <td class="right">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</td>
                    <td></td>
                </tr>
            @endif
        </tbody>
    </table>

    <!-- REKAPITULASI PER MITRA -->
    @if(count($partnerSummary) > 0)
    <div class="section-title">Rekapitulasi per Mitra</div>
    <table class="monthly-table">
        <thead>
            <tr style="background:#1e3a5f;">
                <th style="width:30px;">No</th>
                <th>Owner / Mitra</th>
                <th style="width:80px; text-align:center;">Jml Transaksi</th>
                <th style="width:110px; text-align:right;">Total Dibayar</th>
                <th style="width:110px;">Aktif Hingga</th>
                <th style="width:70px; text-align:center;">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($partnerSummary as $i => $ps)
                <tr>
                    <td class="center">{{ $i + 1 }}</td>
                    <td>
                        <strong>{{ $ps['name'] }}</strong><br>
                        <span style="color:#6b7280; font-size:10px;">{{ $ps['email'] }}</span>
                    </td>
                    <td class="center">{{ $ps['transaction_count'] }}</td>
                    <td class="right"><strong>Rp {{ number_format($ps['total_paid'], 0, ',', '.') }}</strong></td>
                    <td>{{ $ps['subscription_ends_at'] ? \Carbon\Carbon::parse($ps['subscription_ends_at'])->format('d M Y') : '—' }}</td>
                    <td class="center">
                        @if($ps['subscription_status'] === 'active')
                            <span class="badge-active">Aktif</span>
                        @else
                            <span class="badge-inactive">Nonaktif</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- FOOTER -->
    <div class="footer">
        <div class="footer-left">
            <p>Dokumen ini dicetak otomatis oleh sistem LapanganPro.</p>
            <p>Laporan Keuangan Langganan &copy; {{ date('Y') }} LapanganPro &mdash; Semua hak dilindungi.</p>
        </div>
        <div class="footer-right">
            <p>Dicetak: {{ $printDate }}</p>
            <p>Sistem: LapanganPro v1.0</p>
        </div>
    </div>

    <div class="footer-sign">
        <div class="sign-line">Mengetahui, Admin</div>
    </div>

</div>
</body>
</html>
