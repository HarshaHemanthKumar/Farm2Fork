import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusSquare, ClipboardList, User, Package, Plus, Leaf } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ProfilePage } from '../consumer/ConsumerApp';

const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

export default function FarmerApp({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-[#fdfbf9] font-sans">
      <div className="flex-1 overflow-y-auto pb-20 relative hide-scrollbar">
        <Routes>
          <Route path="/" element={<FarmerHome />} />
          <Route path="/add" element={<AddListing />} />
          <Route path="/orders" element={<FarmerOrders />} />
          <Route path="/profile" element={<ProfilePage user={getUser()} onLogout={onLogout} />} />
        </Routes>
      </div>

      <div className="bg-white border-t border-gray-100 flex justify-around p-2 pb-5 absolute bottom-0 w-full rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
        <NavItem to="/farmer" current={location.pathname} icon={<Home size={24} color={location.pathname === '/farmer' ? '#388e3c' : '#9ca3af'} className={location.pathname === '/farmer' ? 'fill-[#e8f5e9]' : ''} />} label="Dashboard" onClick={() => navigate('/farmer')} />
        <NavItem to="/farmer/add" current={location.pathname} icon={<Plus size={24} color={location.pathname === '/farmer/add' ? '#388e3c' : '#9ca3af'} className={location.pathname === '/farmer/add' ? '' : ''} />} label="Add" onClick={() => navigate('/farmer/add')} />
        <NavItem to="/farmer/orders" current={location.pathname} icon={<Package size={24} color={location.pathname.startsWith('/farmer/orders') ? '#388e3c' : '#9ca3af'} className={location.pathname.startsWith('/farmer/orders') ? 'fill-[#e8f5e9]' : ''}/>} label="Orders" onClick={() => navigate('/farmer/orders')} />
        <NavItem to="/farmer/profile" current={location.pathname} icon={<User size={24} color={location.pathname === '/farmer/profile' ? '#388e3c' : '#9ca3af'} className={location.pathname === '/farmer/profile' ? 'fill-[#e8f5e9]' : ''}/>} label="Profile" onClick={() => navigate('/farmer/profile')} />
      </div>
    </div>
  );
}

function NavItem({ icon, label, onClick, current, to }: any) {
  const active = current === to || (to !== '/farmer' && current.startsWith(to));
  return (
    <button onClick={onClick} className={`flex flex-col items-center p-2 pt-3 px-4 transition-colors ${active ? 'text-[#388e3c]' : 'text-gray-400'}`}>
      <div className={`mb-1 ${active ? 'text-[#388e3c]' : 'text-gray-400'}`}>{icon}</div>
      <span className="text-[11px] font-bold tracking-wide mt-0.5">{label}</span>
      {active && <div className="w-1.5 h-1.5 bg-[#388e3c] rounded-full mt-1.5 absolute bottom-2"></div>}
    </button>
  );
}

export function FarmerHome() {
  const [listings, setListings] = useState([]);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.getListings();
      setListings(res.filter((l: any) => l.farmerId === getUser().id));

      const orders = await api.getFarmerOrders(getUser().id);
      const deliveredOrders = orders.filter((o: any) => o.status === 'delivered');
      const total = deliveredOrders.reduce((sum: number, o: any) => sum + (o.quantity_kg * (o.price_at_order || o.listing?.price_per_kg || 0)), 0);
      setEarnings(total);
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 pb-24 min-h-full bg-[#fbfbf9]">
      <div className="flex items-center gap-2 mb-6 pt-2">
        <Leaf className="w-8 h-8 text-[#4caf50] fill-[#4caf50]" />
        <h1 className="text-[28px] font-bold text-[#2e7d32] tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#e8f5e9] rounded-3xl p-6 flex flex-col justify-center border border-[#c8e6c9] shadow-sm">
          <span className="text-[40px] font-extrabold text-[#2e7d32] leading-none mb-2">{listings.length}</span>
          <span className="text-sm font-bold text-[#388e3c]">Active Listings</span>
        </div>
        <div className="bg-white rounded-3xl p-6 flex flex-col justify-center border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden text-ellipsis">
          <span className="text-[32px] font-extrabold text-gray-800 leading-none mb-2 truncate">₹{earnings.toLocaleString()}</span>
          <span className="text-sm font-bold text-gray-400">Total Earnings</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">My Produce</h2>
      </div>
      
      <div className="space-y-4">
        {listings.map((l: any) => (
          <div key={l.id} className="bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex justify-between items-start gap-4 active:scale-[0.98] transition-transform">
            <div className="flex gap-4">
              {l.image_url ? (
                <img src={l.image_url} alt={l.crop_name} className="w-[72px] h-[72px] rounded-2xl object-cover shadow-sm bg-gray-50" />
              ) : (
                <div className="w-[72px] h-[72px] rounded-2xl bg-[#f1f8f2] flex items-center justify-center text-3xl shadow-sm border border-[#e8f5e9]">
                  🌱
                </div>
              )}
              <div className="py-1">
                <div className="font-bold text-xl text-gray-800 mb-0.5">{l.crop_name}</div>
                <div className="text-sm font-bold text-[#388e3c] tracking-wide mb-1.5">{l.quantity_kg} kg <span className="text-gray-400 mx-1">@</span> ₹{l.price_per_kg}/kg</div>
              </div>
            </div>
            <div className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg shadow-sm ${l.quantity_kg <= 0 ? 'bg-red-50 text-red-600' : 'bg-[#e8f5e9] text-[#2e7d32]'}`}>
              {l.quantity_kg <= 0 ? 'Sold Out' : (l.status || 'Active')}
            </div>
          </div>
        ))}
        {listings.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <Leaf className="w-16 h-16 text-[#c8e6c9] mb-4 fill-[#c8e6c9]" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">No active listings</h2>
            <p className="text-gray-400 font-medium text-sm">Post a new crop to start selling.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AddListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ crop_name: '', quantity_kg: '', price_per_kg: '', harvest_date: new Date().toISOString().split('T')[0] });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: any) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');
    try {
      let image_url = '';
      if (imageFile) {
        image_url = await api.uploadImage(imageFile);
      }

      await api.createListing({
        farmerId: getUser().id,
        "farmerName": getUser().name,
        ...form,
        quantity_kg: Number(form.quantity_kg),
        price_per_kg: Number(form.price_per_kg),
        image_url
      });
      navigate('/farmer');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 pb-24 min-h-full bg-[#fbfbf9]">
      <h1 className="text-[32px] font-bold text-[#1b5e20] tracking-tight mb-8 mt-4">Add Listing</h1>
      
      <form onSubmit={submit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
          <label className="block text-xs uppercase tracking-widest text-[#81c784] mb-4 font-bold">Crop Image</label>
          <div className="border-2 border-dashed border-[#81c784] rounded-2xl p-6 text-center hover:bg-[#e8f5e9] transition-colors relative cursor-pointer">
            <span className="text-4xl mb-2 block">📷</span>
            <span className="text-[#388e3c] font-bold text-sm block">Select Image</span>
            {imageFile && <p className="text-xs mt-2 text-gray-500 font-bold bg-white px-3 py-1 rounded-full absolute -bottom-3 left-1/2 -translate-x-1/2 border border-gray-200">{imageFile.name}</p>}
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          </div>
        </div>
        
        {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-bold">{errorMsg}</div>}
        
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold ml-1">Crop Name</label>
            <input required type="text" className="w-full pb-3 border-b-2 border-gray-100 bg-transparent text-xl font-bold focus:outline-none focus:border-[#4caf50] text-gray-800 placeholder:text-gray-300" value={form.crop_name} onChange={e => setForm({...form, crop_name: e.target.value})} placeholder="e.g. Tomato" />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold ml-1">Quantity (kg)</label>
              <input required type="number" className="w-full pb-3 border-b-2 border-gray-100 bg-transparent text-xl font-bold focus:outline-none focus:border-[#4caf50] text-gray-800 placeholder:text-gray-300" value={form.quantity_kg} onChange={e => setForm({...form, quantity_kg: e.target.value})} placeholder="50" />
            </div>
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold ml-1">Price (₹/kg)</label>
              <input required type="number" className="w-full pb-3 border-b-2 border-gray-100 bg-transparent text-xl font-bold focus:outline-none focus:border-[#4caf50] text-gray-800 placeholder:text-gray-300" value={form.price_per_kg} onChange={e => setForm({...form, price_per_kg: e.target.value})} placeholder="15" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold ml-1">Harvest Date</label>
            <input required type="date" className="w-full pb-3 border-b-2 border-gray-100 bg-transparent text-lg font-bold focus:outline-none focus:border-[#4caf50] text-gray-800" value={form.harvest_date} onChange={e => setForm({...form, harvest_date: e.target.value})} />
          </div>
        </div>
        
        <button type="submit" disabled={isUploading} className="w-full bg-[#388e3c] text-white py-4 mt-8 mb-20 font-bold text-xl rounded-2xl shadow-[0_8px_20px_rgba(56,142,60,0.3)] hover:bg-[#2e7d32] transition-colors flex justify-center items-center disabled:opacity-70 disabled:shadow-none">
          {isUploading ? 'Uploading...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
}

export function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  
  const loadOrders = () => {
    api.getFarmerOrders(getUser().id).then(setOrders);
  };
  
  useEffect(() => { 
    loadOrders(); 
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const accept = async (id: string) => {
    await api.updateOrderStatus(id, 'farmer_confirmed');
    loadOrders();
  };

  return (
    <div className="p-6 pb-24 min-h-full bg-[#fbfbf9]">
      <h1 className="text-[36px] font-bold text-[#1b5e20] tracking-tight mb-8 mt-4">Orders</h1>
      
      <div className="space-y-4">
        {orders.map((o: any) => (
          <div key={o.id} className="bg-white p-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-xl text-gray-800">Order #{o.id.slice(-4)}</span>
              <span className="text-xs font-bold bg-[#e8f5e9] text-[#2e7d32] px-3 py-1.5 rounded-lg capitalize">{o.status.replace('_', ' ')}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <p className="text-base font-extrabold text-gray-700 tracking-wide">{o.quantity_kg} kg <span className="text-gray-400">@</span> <span className="text-[#388e3c]">₹{(o.quantity_kg * (o.price_at_order || o.listing?.price_per_kg || 0)).toLocaleString()}</span></p>
            </div>
            
            {o.status === 'placed' && (
              <div className="flex gap-3 mt-2 pt-4 border-t border-gray-50">
                <button onClick={() => accept(o.id)} className="flex-1 bg-[#e8f5e9] text-[#2e7d32] py-3 rounded-xl font-bold text-base shadow-sm hover:bg-[#c8e6c9] transition-colors border border-[#c8e6c9]">Accept</button>
                <button className="flex-1 bg-white border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors">Decline</button>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center mt-24">
            <Package className="w-20 h-20 text-[#e0e0e0] mb-6" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No orders right now</h2>
            <p className="text-gray-400 font-medium text-lg">We'll notify you when someone orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
