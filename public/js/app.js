/**
 * REDGOLD LAUNDRY PRO - Frontend Client Script (app.js)
 * Mengelola interaksi UI, state POS, dan komunikasi REST API ke backend Express.
 */

const API_BASE_URL = '/api';

// State Aplikasi Global
const AppState = {
    token: localStorage.getItem('redgold_token') || null,
    currentBranch: 'Cabang Pusat',
    activeTab: 'dashboard',
    cart: []
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('REDGOLD LAUNDRY PRO Client initialized.');
    initEventListeners();
    checkAuthSession();
});

// Inisialisasi Event Listener Tombol & Navigasi
function initEventListeners() {
    // Tombol Transaksi Baru (POS)
    const posButton = document.querySelector('button');
    if (posButton) {
        posButton.addEventListener('click', () => {
            openPosModal();
        });
    }
}

// Cek Sesi Autentikasi Pengguna
function checkAuthSession() {
    if (!AppState.token) {
        console.warn('Pengguna belum login. Menggunakan mode simulasi / demo.');
    } else {
        fetchDashboardData();
    }
}

// Ambil Data Dashboard dari Backend API
async function fetchDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            headers: {
                'Authorization': `Bearer ${AppState.token}`
            }
        });
        if (response.ok) {
            const transactions = await response.json();
            console.log('Data transaksi berhasil dimuat:', transactions);
            updateDashboardUI(transactions);
        }
    } catch (error) {
        console.error('Gagal mengambil data dari server:', error);
    }
}

// Perbarui Tampilan Dashboard secara Dinamis
function updateDashboardUI(transactions) {
    // Implementasi pembaruan tabel riwayat transaksi secara dinamis
    console.log(`Menampilkan ${transactions.length} transaksi ke antarmuka.`);
}

// Buka Modal POS (Point of Sales) untuk Transaksi Baru
function openPosModal() {
    const customerName = prompt('Masukkan Nama Pelanggan:');
    if (!customerName) return;

    const serviceType = prompt('Pilih Layanan (1: Cuci Kiloan, 2: Dry Cleaning, 3: Setrika Saja):');
    if (!serviceType) return;

    const quantity = parseFloat(prompt('Masukkan Berat (kg) atau Jumlah Item (pcs):', '1')) || 1;

    // Simulasi payload transaksi baru ke backend
    const newTransaction = {
        customer_id: 1,
        branch_id: 1,
        order_source: 'walk-in',
        items: [
            { service_id: parseInt(serviceType), quantity: quantity }
        ],
        discount: 0,
        express_fee: 0,
        delivery_fee: 0,
        notes: `Pesanan atas nama ${customerName}`
    };

    submitTransaction(newTransaction);
}

// Kirim Transaksi ke Backend API
async function submitTransaction(txData) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AppState.token}`
            },
            body: JSON.stringify(txData)
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Transaksi Berhasil! Nomor Invoice: ${result.transaction.invoice_number}`);
            location.reload();
        } else {
            alert(`Gagal membuat transaksi: ${result.error}`);
        }
    } catch (error) {
        console.error('Error saat mengirim transaksi:', error);
        alert('Terjadi kesalahan koneksi ke server.');
    }
}

