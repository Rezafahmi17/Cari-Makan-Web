import { useContext, useEffect, useMemo, useState } from 'react';
import { OrderContext } from '../context/OrderContext';
import { authApi, menuApi, transactionApi } from '../api/api';

const emptyMenuForm = {
  name: '',
  category: 'Indonesian',
  price: '',
  description: '',
  image_url: '',
  available: true,
};

const emptyTransactionForm = {
  type: 'pemasukan',
  category: 'Penjualan',
  title: '',
  amount: '',
  transaction_date: new Date().toISOString().slice(0, 10),
  description: '',
};

const statusOptions = ['Pending', 'Diproses', 'Completed', 'Dibatalkan'];

function formatRupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function safeExcelCell(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function exportTransactionsToExcel(transactions) {
  const rows = transactions.map((trx, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${safeExcelCell(formatDate(trx.transaction_date))}</td>
      <td>${safeExcelCell(trx.type)}</td>
      <td>${safeExcelCell(trx.category)}</td>
      <td>${safeExcelCell(trx.title)}</td>
      <td>${Number(trx.amount || 0)}</td>
      <td>${safeExcelCell(trx.ref_order_id || '-')}</td>
      <td>${safeExcelCell(trx.description || '-')}</td>
    </tr>
  `).join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Kategori</th>
              <th>Judul</th>
              <th>Nominal</th>
              <th>Ref Order</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transaksi-carimakan-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const [isLogged, setIsLogged] = useState(() => Boolean(localStorage.getItem('admin_token')));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [notice, setNotice] = useState('');
  const [statusError, setStatusError] = useState('');
  const [updatingOrderIds, setUpdatingOrderIds] = useState(() => new Set());

  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [menuForm, setMenuForm] = useState(emptyMenuForm);
  const [editingMenuId, setEditingMenuId] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({
    total_pemasukan: 0,
    total_pengeluaran: 0,
    saldo: 0,
  });
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('');

  const { orders, updateOrderStatus, loadOrders, loadingOrders } = useContext(OrderContext);
  const pendingCount = orders.filter((order) => order.status === 'Pending').length;

  const completedTotal = useMemo(() => orders
    .filter((order) => order.status === 'Completed')
    .reduce((sum, order) => sum + Number(order.total || 0), 0), [orders]);

  const isUpdatingOrder = (orderId) => updatingOrderIds.has(orderId);

  const setOrderUpdating = (orderId, value) => {
    setUpdatingOrderIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  };

  const loadMenus = async () => {
    setLoadingMenus(true);
    try {
      const data = await menuApi.getAll('', { includeInactive: true });
      setMenus(data.data || []);
    } catch (err) {
      setNotice(err.message || 'Gagal memuat menu');
    } finally {
      setLoadingMenus(false);
    }
  };

  const loadTransactions = async (options = {}) => {
    const { silent = false } = options;

    if (!silent) setLoadingTransactions(true);
    try {
      const [list, summary] = await Promise.all([
        transactionApi.getAll({ search: transactionSearch, type: transactionTypeFilter }),
        transactionApi.summary(),
      ]);
      setTransactions(list.data || []);
      setTransactionSummary(summary.data || { total_pemasukan: 0, total_pengeluaran: 0, saldo: 0 });
    } catch (err) {
      if (!silent) setNotice(err.message || 'Gagal memuat transaksi');
    } finally {
      if (!silent) setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (isLogged) {
      loadOrders();
      loadMenus();
      loadTransactions();
    }
  }, [isLogged]);

  useEffect(() => {
    if (!notice && !statusError) return undefined;

    const timer = setTimeout(() => {
      setNotice('');
      setStatusError('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [notice, statusError]);

  useEffect(() => {
    if (!isLogged) return undefined;

    const intervalId = setInterval(() => {
      loadOrders({ silent: true });
      loadTransactions({ silent: true });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isLogged, activeTab, transactionSearch, transactionTypeFilter, loadOrders]);

  useEffect(() => {
    if (isLogged && activeTab === 'transactions') {
      const delay = setTimeout(() => loadTransactions(), 350);
      return () => clearTimeout(delay);
    }
    return undefined;
  }, [transactionSearch, transactionTypeFilter, activeTab, isLogged]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginError('');

    try {
      const data = await authApi.login({ username, password });
      localStorage.setItem('admin_token', data.token);
      setIsLogged(true);
    } catch (err) {
      setLoginError(err.message || 'Username atau password salah');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLogged(false);
  };

  const handleOrderStatus = async (orderId, status, currentStatus) => {
    if (!status || status === currentStatus || isUpdatingOrder(orderId)) return;

    setStatusError('');
    setOrderUpdating(orderId, true);

    try {
      await updateOrderStatus(orderId, status);
      await Promise.all([
        loadOrders({ silent: true }),
        loadTransactions({ silent: true }),
      ]);
      setNotice(status === 'Completed'
        ? 'Status pesanan diubah menjadi Completed. Pemasukan otomatis dicatat di transaksi.'
        : `Status pesanan berhasil diubah menjadi ${status}.`);
    } catch (err) {
      const message = err.message || 'Gagal mengubah status pesanan';
      setStatusError(message);
      setNotice(message);
    } finally {
      setOrderUpdating(orderId, false);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...menuForm,
      price: Number(menuForm.price),
      available: menuForm.available === true || menuForm.available === 'true',
    };

    try {
      if (editingMenuId) {
        await menuApi.update(editingMenuId, payload);
        setNotice('Menu berhasil diupdate.');
      } else {
        await menuApi.create(payload);
        setNotice('Menu baru berhasil ditambahkan.');
      }
      setMenuForm(emptyMenuForm);
      setEditingMenuId(null);
      await loadMenus();
    } catch (err) {
      setNotice(err.message || 'Gagal menyimpan menu');
    }
  };

  const startEditMenu = (menu) => {
    setEditingMenuId(menu.id);
    setMenuForm({
      name: menu.name || menu.strMeal || '',
      category: menu.category || menu.strArea || '',
      price: menu.price || '',
      description: menu.description || menu.strInstructions || '',
      image_url: menu.image_url || menu.strMealThumb || '',
      available: Boolean(menu.available),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm('Yakin ingin menonaktifkan menu ini?')) return;

    try {
      await menuApi.remove(id);
      setNotice('Menu berhasil dinonaktifkan.');
      await loadMenus();
    } catch (err) {
      setNotice(err.message || 'Gagal menghapus menu');
    }
  };

  const handleToggleMenu = async (menu) => {
    try {
      await menuApi.update(menu.id, { available: !menu.available });
      await loadMenus();
      setNotice(menu.available ? 'Menu dinonaktifkan.' : 'Menu diaktifkan kembali.');
    } catch (err) {
      setNotice(err.message || 'Gagal mengubah status menu');
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...transactionForm,
      amount: Number(transactionForm.amount),
    };

    try {
      if (editingTransactionId) {
        await transactionApi.update(editingTransactionId, payload);
        setNotice('Transaksi berhasil diupdate.');
      } else {
        await transactionApi.create(payload);
        setNotice('Transaksi berhasil ditambahkan.');
      }
      setTransactionForm(emptyTransactionForm);
      setEditingTransactionId(null);
      await loadTransactions();
    } catch (err) {
      setNotice(err.message || 'Gagal menyimpan transaksi');
    }
  };

  const startEditTransaction = (trx) => {
    setEditingTransactionId(trx.id);
    setTransactionForm({
      type: trx.type,
      category: trx.category,
      title: trx.title,
      amount: trx.amount,
      transaction_date: String(trx.transaction_date || '').slice(0, 10),
      description: trx.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    try {
      await transactionApi.remove(id);
      setNotice('Transaksi berhasil dihapus.');
      await loadTransactions();
    } catch (err) {
      setNotice(err.message || 'Gagal menghapus transaksi');
    }
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fa]">
        <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2 text-center">Admin Portal</h2>
          <p className="text-center text-sm text-gray-400 mb-6">Login default: admin / admin123</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginError && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{loginError}</p>}
            <input type="text" placeholder="Username" className="p-3 bg-gray-50 rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="p-3 bg-gray-50 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button disabled={loadingLogin} type="submit" className="w-full bg-[#ff5722] text-white py-3 rounded-full font-bold disabled:opacity-60">
              {loadingLogin ? 'Login...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white min-h-screen px-4 sm:px-6 py-5 sm:py-6 pb-28 sm:pb-6">
      <header className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-sm text-gray-400">Kelola pesanan, CRUD makanan, serta transaksi pemasukan dan pengeluaran.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center w-full sm:w-auto">
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              {pendingCount} Pesanan Baru!
            </span>
          )}
          <span className="bg-green-50 text-green-700 px-3 py-2 rounded-full text-xs font-bold">Auto refresh aktif</span>
          <button onClick={handleLogout} className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold ml-auto sm:ml-0">Logout</button>
        </div>
      </header>

      {notice && (
        <div className="mb-5 bg-orange-50 text-orange-700 px-4 py-3 rounded-2xl text-sm">
          <span>{notice}</span>
          <span className="block text-xs text-orange-400 mt-1">Pesan ini akan hilang otomatis.</span>
        </div>
      )}

      {statusError && (
        <div className="mb-5 bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {statusError}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-50 p-5 rounded-3xl">
          <p className="text-xs text-gray-400">Total Pesanan</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-green-50 p-5 rounded-3xl">
          <p className="text-xs text-green-600">Pemasukan</p>
          <p className="text-2xl font-bold text-green-700">{formatRupiah(transactionSummary.total_pemasukan || completedTotal)}</p>
        </div>
        <div className="bg-red-50 p-5 rounded-3xl">
          <p className="text-xs text-red-600">Pengeluaran</p>
          <p className="text-2xl font-bold text-red-700">{formatRupiah(transactionSummary.total_pengeluaran)}</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-3xl">
          <p className="text-xs text-blue-600">Saldo</p>
          <p className="text-2xl font-bold text-blue-700">{formatRupiah(transactionSummary.saldo)}</p>
        </div>
      </section>

      <nav className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          ['orders', 'Pesanan'],
          ['menus', 'CRUD Makanan'],
          ['transactions', 'Transaksi Admin'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 sm:px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === key ? 'bg-[#ff5722] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'orders' && (
        <section>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-4">
            <h2 className="text-xl font-bold">Data Pesanan</h2>
            {loadingOrders && <p className="text-sm text-gray-400">Memuat pesanan...</p>}
          </div>

          <div className="flex flex-col gap-4">
            {orders.length === 0 && <p className="text-gray-400">Belum ada pesanan.</p>}
            {orders.map((order) => (
              <div key={order.id} className="p-4 sm:p-5 border rounded-[24px] flex flex-col lg:flex-row gap-4 lg:justify-between lg:items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-bold break-words">{order.id} - {order.customer.name}</p>
                  <p className="text-sm text-gray-500">{formatRupiah(order.total)} • {order.status}</p>
                  <p className="text-xs text-gray-400">{order.customer.phone} • {order.customer.address}</p>
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    {(order.items || []).map((item) => (
                      <p key={item.id}>{item.strMeal} x{item.qty} = {formatRupiah(item.subtotal)}</p>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full lg:w-[340px]">
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((status) => {
                      const active = order.status === status;
                      const updating = isUpdatingOrder(order.id);
                      return (
                        <button
                          key={status}
                          type="button"
                          disabled={updating || active}
                          onClick={() => handleOrderStatus(order.id, status, order.status)}
                          className={`px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition disabled:cursor-not-allowed ${active
                            ? 'bg-[#ff5722] text-white border-[#ff5722] shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#ff5722] hover:text-[#ff5722]'}`}
                        >
                          {updating && !active ? 'Menyimpan...' : status}
                        </button>
                      );
                    })}
                  </div>
                  <select
                    value={order.status}
                    disabled={isUpdatingOrder(order.id)}
                    onChange={(e) => handleOrderStatus(order.id, e.target.value, order.status)}
                    className="w-full bg-gray-50 border px-4 py-2 rounded-full text-sm font-semibold lg:hidden"
                  >
                    {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <p className="text-[11px] text-gray-400">Klik salah satu status. Jika Completed, transaksi pemasukan otomatis dicatat.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'menus' && (
        <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 sm:gap-6">
          <form onSubmit={handleMenuSubmit} className="bg-gray-50 p-4 sm:p-5 rounded-3xl h-fit flex flex-col gap-3">
            <h2 className="text-xl font-bold">{editingMenuId ? 'Update Menu' : 'Tambah Menu'}</h2>
            <input required className="p-3 rounded-xl border" placeholder="Nama makanan" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} />
            <input required className="p-3 rounded-xl border" placeholder="Kategori" value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} />
            <input required type="number" min="1" className="p-3 rounded-xl border" placeholder="Harga" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} />
            <input className="p-3 rounded-xl border" placeholder="URL gambar" value={menuForm.image_url} onChange={(e) => setMenuForm({ ...menuForm, image_url: e.target.value })} />
            <textarea className="p-3 rounded-xl border min-h-[110px]" placeholder="Deskripsi" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} />
            <select className="p-3 rounded-xl border" value={String(menuForm.available)} onChange={(e) => setMenuForm({ ...menuForm, available: e.target.value === 'true' })}>
              <option value="true">Tersedia</option>
              <option value="false">Tidak tersedia</option>
            </select>
            <button type="submit" className="bg-[#ff5722] text-white py-3 rounded-full font-bold">{editingMenuId ? 'Simpan Update' : 'Tambah Menu'}</button>
            {editingMenuId && (
              <button type="button" onClick={() => { setEditingMenuId(null); setMenuForm(emptyMenuForm); }} className="bg-white border py-3 rounded-full font-bold">Batal Edit</button>
            )}
          </form>

          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-4">
              <h2 className="text-xl font-bold">Data Menu Makanan</h2>
              {loadingMenus && <p className="text-sm text-gray-400">Memuat menu...</p>}
            </div>
            <div className="overflow-x-auto border rounded-3xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3">Menu</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu.id} className="border-t">
                      <td className="p-3 font-semibold">{menu.name || menu.strMeal}</td>
                      <td className="p-3">{menu.category || menu.strArea}</td>
                      <td className="p-3">{formatRupiah(menu.price)}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${menu.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {menu.available ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => startEditMenu(menu)} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">Edit</button>
                          <button onClick={() => handleToggleMenu(menu)} className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">{menu.available ? 'Nonaktifkan' : 'Aktifkan'}</button>
                          <button onClick={() => handleDeleteMenu(menu.id)} className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'transactions' && (
        <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 sm:gap-6">
          <form onSubmit={handleTransactionSubmit} className="bg-gray-50 p-4 sm:p-5 rounded-3xl h-fit flex flex-col gap-3">
            <h2 className="text-xl font-bold">{editingTransactionId ? 'Update Transaksi' : 'Tambah Transaksi'}</h2>
            <select className="p-3 rounded-xl border" value={transactionForm.type} onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
            <input required className="p-3 rounded-xl border" placeholder="Kategori, contoh: Penjualan / Belanja Bahan" value={transactionForm.category} onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })} />
            <input required className="p-3 rounded-xl border" placeholder="Judul transaksi" value={transactionForm.title} onChange={(e) => setTransactionForm({ ...transactionForm, title: e.target.value })} />
            <input required type="number" min="1" className="p-3 rounded-xl border" placeholder="Nominal" value={transactionForm.amount} onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })} />
            <input required type="date" className="p-3 rounded-xl border" value={transactionForm.transaction_date} onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })} />
            <textarea className="p-3 rounded-xl border min-h-[110px]" placeholder="Keterangan" value={transactionForm.description} onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })} />
            <button type="submit" className="bg-[#ff5722] text-white py-3 rounded-full font-bold">{editingTransactionId ? 'Simpan Update' : 'Tambah Transaksi'}</button>
            {editingTransactionId && (
              <button type="button" onClick={() => { setEditingTransactionId(null); setTransactionForm(emptyTransactionForm); }} className="bg-white border py-3 rounded-full font-bold">Batal Edit</button>
            )}
          </form>

          <div>
            <div className="flex flex-wrap justify-between gap-3 items-center mb-4">
              <h2 className="text-xl font-bold">Data Transaksi Admin</h2>
              <button onClick={() => exportTransactionsToExcel(transactions)} className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold">Export Excel</button>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <input className="p-3 rounded-xl border flex-1 min-w-full sm:min-w-[220px]" placeholder="Cari transaksi..." value={transactionSearch} onChange={(e) => setTransactionSearch(e.target.value)} />
              <select className="p-3 rounded-xl border w-full sm:w-auto" value={transactionTypeFilter} onChange={(e) => setTransactionTypeFilter(e.target.value)}>
                <option value="">Semua Tipe</option>
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
            </div>
            {loadingTransactions && <p className="text-sm text-gray-400 mb-3">Memuat transaksi...</p>}
            <div className="overflow-x-auto border rounded-3xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Judul</th>
                    <th className="p-3">Nominal</th>
                    <th className="p-3">Ref</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 && (
                    <tr><td className="p-4 text-gray-400" colSpan="7">Belum ada transaksi.</td></tr>
                  )}
                  {transactions.map((trx) => (
                    <tr key={trx.id} className="border-t">
                      <td className="p-3">{formatDate(trx.transaction_date)}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${trx.type === 'pemasukan' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {trx.type}
                        </span>
                      </td>
                      <td className="p-3">{trx.category}</td>
                      <td className="p-3 font-semibold">{trx.title}</td>
                      <td className="p-3">{formatRupiah(trx.amount)}</td>
                      <td className="p-3 text-xs text-gray-400">{trx.ref_order_id || '-'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => startEditTransaction(trx)} className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">Edit</button>
                          <button onClick={() => handleDeleteTransaction(trx.id)} className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
