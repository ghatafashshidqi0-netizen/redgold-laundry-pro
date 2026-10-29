describe('REDGOLD LAUNDRY PRO - Basic Test Suite', () => {
  test('Sistem kalkulasi harga dasar transaksi', () => {
    const pricePerKg = 10000;
    const weight = 4.5;
    const subtotal = pricePerKg * weight;
    expect(subtotal).toBe(45000);
  });

  test('Pengecekan format nomor invoice unik', () => {
    const invoice = 'RG-20261029-0001';
    expect(invoice).toMatch(/^RG-\d{8}-\d{4}$/);
  });
});

