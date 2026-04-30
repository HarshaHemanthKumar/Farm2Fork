import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ShoppingBag, Search, Home, MapPin, Users, ArrowLeft, User, Package, Leaf, CheckCircle, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

export default function ConsumerApp({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-[#fdfbf9] font-sans">
      <div className="flex-1 overflow-y-auto pb-20 relative hide-scrollbar">
        <Routes>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/track/:id" element={<TrackOrder />} />
          <Route path="/basket-detail/:id" element={<BasketDetail />} />
          <Route path="/profile" element={<ProfilePage user={getUser()} onLogout={onLogout} />} />
        </Routes>
      </div>

      <div className="bg-white border-t border-gray-100 flex justify-around p-2 pb-5 absolute bottom-0 w-full rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
        <NavItem to="/" current={location.pathname} icon={<Home size={24} color={location.pathname === '/' ? '#388e3c' : '#9ca3af'} className={location.pathname === '/' ? 'fill-[#e8f5e9]' : ''} />} label="Browse" onClick={() => navigate('/')} />
        <NavItem to="/orders" current={location.pathname} icon={<Package size={24} color={location.pathname.startsWith('/orders') ? '#388e3c' : '#9ca3af'} className={location.pathname.startsWith('/orders') ? 'fill-[#e8f5e9]' : ''}/>} label="Orders" onClick={() => navigate('/orders')} />
        <NavItem to="/profile" current={location.pathname} icon={<User size={24} color={location.pathname === '/profile' ? '#388e3c' : '#9ca3af'} className={location.pathname === '/profile' ? 'fill-[#e8f5e9]' : ''}/>} label="Profile" onClick={() => navigate('/profile')} />
      </div>
    </div>
  );
}

function NavItem({ icon, label, onClick, current, to }: any) {
  const active = current === to || (to !== '/' && current.startsWith(to));
  return (
    <button onClick={onClick} className={`flex flex-col items-center p-2 pt-3 px-4 transition-colors ${active ? 'text-[#388e3c]' : 'text-gray-400'}`}>
      <div className={`mb-1 ${active ? 'text-[#388e3c]' : 'text-gray-400'}`}>{icon}</div>
      <span className="text-[11px] font-bold tracking-wide mt-0.5">{label}</span>
      {active && <div className="w-1.5 h-1.5 bg-[#388e3c] rounded-full mt-1.5 absolute bottom-2"></div>}
    </button>
  );
}

export function HomeFeed() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchListings = () => api.getListings().then(setListings);
    fetchListings();
    const interval = setInterval(fetchListings, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center gap-2 mb-6 pt-2">
        <Leaf className="w-8 h-8 text-[#4caf50] fill-[#4caf50]" />
        <h1 className="text-[28px] font-bold text-[#2e7d32] tracking-tight">Farm2Fork</h1>
      </div>

      {/* Search Input */}
      <div className="relative mb-8 shadow-sm rounded-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fresh produce..." 
          className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#4caf50] text-gray-700 font-medium text-lg placeholder:text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 hide-scrollbar -mx-2 px-2">
        <button className="min-w-[85px] h-[100px] border-2 border-[#4caf50] bg-[#e8f5e9] rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
          <span className="text-3xl">🏷️</span>
          <span className="text-sm font-bold text-[#2e7d32]">All</span>
        </button>
        <button className="min-w-[85px] h-[100px] border border-gray-200 bg-white rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-sm text-gray-600 transition-transform active:scale-95">
          <span className="text-3xl">🍅</span>
          <span className="text-sm font-bold">Tomato</span>
        </button>
        <button className="min-w-[85px] h-[100px] border border-gray-200 bg-white rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-sm text-gray-600 transition-transform active:scale-95">
          <span className="text-3xl">🥔</span>
          <span className="text-sm font-bold">Potato</span>
        </button>
        <button className="min-w-[85px] h-[100px] border border-gray-200 bg-white rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-sm text-gray-600 transition-transform active:scale-95">
          <span className="text-3xl">🧅</span>
          <span className="text-sm font-bold">Onion</span>
        </button>
      </div>

      {/* Filters & Results count */}
      <div className="flex justify-between items-center mb-10 text-[15px] text-gray-400 font-bold px-1">
        <span>{listings.length} items found</span>
        <div className="flex gap-3">
          <button className="flex items-center gap-1.5 bg-[#e8f5e9] text-[#2e7d32] px-3 py-1.5 rounded-xl shadow-sm"><span className="text-xs bg-[#81c784] text-white px-1.5 py-0.5 rounded-[4px]">NEW</span> New</button>
          <button className="flex items-center gap-1.5 px-2 text-gray-500 hover:text-gray-700 transition-colors"><span className="text-sm">💰</span> Low</button>
          <button className="flex items-center gap-1.5 px-2 text-gray-500 hover:text-gray-700 transition-colors"><span className="text-sm">💎</span> High</button>
        </div>
      </div>

      {/* List / Empty state */}
      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-24">
          <Leaf className="w-20 h-20 text-[#c8e6c9] mb-4 fill-[#c8e6c9]" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No produce found</h2>
          <p className="text-gray-400 font-medium text-lg">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {listings.map((l: any) => (
            <div key={l.id} className="bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex gap-5 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/listing/${l.id}`)}>
              {l.image_url ? (
                <img src={l.image_url} alt={l.crop_name} className="w-[84px] h-[84px] rounded-2xl object-cover shadow-sm bg-gray-50" />
              ) : (
                <div className="w-[84px] h-[84px] rounded-2xl bg-[#f1f8f2] flex items-center justify-center text-3xl shadow-sm border border-[#e8f5e9]">
                  🌱
                </div>
              )}
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-xl text-gray-800">{l.crop_name}</h3>
                  <span className="font-bold text-lg text-[#2e7d32]">₹{l.price_per_kg}/kg</span>
                </div>
                <div className="text-sm text-gray-400 font-bold tracking-wide">{l.farmerName}</div>
                <div className="text-sm text-gray-400 font-bold mt-1.5 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#81c784]" /> {l.distance} km away
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [quantity, setQuantity] = useState(5);
  const [address, setAddress] = useState('Home');
  const [orderType, setOrderType] = useState<'individual' | 'community'>('individual');
  const [communityName, setCommunityName] = useState('');
  const [communityAddress, setCommunityAddress] = useState('');

  useEffect(() => {
    const fetchListing = () => api.getListings().then(res => setListing(res.find((l: any) => l.id === id)));
    fetchListing();
    const interval = setInterval(fetchListing, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const orderNow = async () => {
    await api.createOrder({ listingId: id, consumerId: getUser().id, quantity_kg: quantity, delivery_address: address });
    navigate('/orders');
  };

  const startBasket = async () => {
    const basket = await api.createBasket({ 
      listingId: id, 
      organiserId: getUser().id, 
      min_quantity_kg: 20,
      community_name: communityName,
      community_address: communityAddress
    });
    navigate(`/basket-detail/${basket.id}`);
  };

  if (!listing) return <div className="p-8 text-center font-bold text-gray-400">Loading...</div>;

  const getDeliveryFee = (q: number) => {
    if (q <= 5) return 10;
    if (q <= 15) return 25;
    return 35;
  };
  const deliveryMode = quantity <= 5 ? 'Bike' : quantity <= 15 ? 'Auto' : 'Minivan';
  const deliveryFee = getDeliveryFee(quantity);
  const productsTotal = quantity * listing.price_per_kg;
  const totalPrice = productsTotal + deliveryFee;

  return (
    <div className="flex flex-col min-h-full bg-white relative pb-20">
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-md shadow-sm text-gray-700">
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="h-72 bg-[#f1f8f2] flex items-center justify-center relative overflow-hidden">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.crop_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[120px]">🌱</span>
        )}
      </div>
      
      <div className="p-8 bg-white relative flex-1 -mt-8 rounded-t-[32px] border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-end mb-4">
          <h1 className="text-[36px] font-bold text-gray-800 leading-none">{listing.crop_name}</h1>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-[#2e7d32]">₹{listing.price_per_kg}</span>
            <span className="text-base text-gray-400 font-bold">/kg</span>
            {listing.quantity_kg <= 0 && <span className="block bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg uppercase tracking-widest text-[10px] mt-2">Sold Out</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm tracking-wide text-gray-500 font-bold mb-8 pb-6 border-b border-gray-100">
          <span className="bg-[#f3f4f6] px-3 py-1.5 rounded-lg flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {listing.distance} km away</span>
          <span className="bg-[#f3f4f6] px-3 py-1.5 rounded-lg flex items-center gap-1.5"><User size={14} className="text-gray-400" /> {listing.farmerName}</span>
        </div>
        
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-widest font-extrabold text-gray-400 mb-3 ml-1">About Produce</h3>
          <p className="text-base text-gray-600 font-medium leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100">
            Freshly harvested on <span className="font-bold text-gray-800">{listing.harvest_date}</span>. Hand-picked directly from farm. High quality local produce. 
            Currently <span className="font-bold text-[#2e7d32]">{listing.quantity_kg} kg</span> available.
          </p>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
          <button onClick={() => setOrderType('individual')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${orderType === 'individual' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>Individual</button>
          <button onClick={() => setOrderType('community')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${orderType === 'community' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>Community</button>
        </div>

        {listing.quantity_kg <= 0 ? (
          <div className="py-6 text-center bg-gray-50 border border-gray-100 rounded-2xl mb-8">
            <span className="text-2xl mb-2 block">😢</span>
            <h3 className="font-bold text-gray-800 text-xl tracking-tight">This deal is sold out!</h3>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Check back later for fresh stock</p>
          </div>
        ) : orderType === 'individual' ? (
          <>
            <div className="space-y-6 mb-8 mt-4 bg-white border border-gray-200 p-5 rounded-3xl shadow-sm">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold ml-1">Delivery Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pb-3 border-b-2 border-gray-100 bg-transparent text-lg font-bold focus:outline-none focus:border-[#4caf50] text-gray-800 placeholder:text-gray-300" placeholder="e.g. Home" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold ml-1">Quantity (kg)</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold text-2xl flex justify-center items-center active:scale-95">-</button>
                  <input type="number" min="1" max={listing.quantity_kg} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="flex-1 text-center font-bold text-3xl focus:outline-none focus:text-[#2e7d32] text-gray-800" />
                  <button onClick={() => setQuantity(Math.min(listing.quantity_kg, quantity + 1))} className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold text-2xl flex justify-center items-center active:scale-95">+</button>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Billing Summary</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 font-bold">Produce ({quantity} kg)</span>
                <span className="text-gray-800 font-bold">₹{productsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 font-bold">Delivery ({deliveryMode})</span>
                <span className="text-gray-800 font-bold">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3.5">
                <span className="text-gray-800 font-extrabold text-lg">Total Amount</span>
                <span className="text-[#2e7d32] font-extrabold text-2xl">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={orderNow} className="w-full bg-[#388e3c] text-white py-4 font-bold text-xl rounded-2xl shadow-[0_8px_20px_rgba(56,142,60,0.3)] hover:bg-[#2e7d32] transition-colors flex justify-center gap-2 items-center">
              Place Order • ₹{totalPrice.toLocaleString()}
            </button>
          </>
        ) : (
          <>
            <div className="space-y-6 mb-8 mt-4 bg-[#f8faf8] border border-[#dceddd] p-5 rounded-3xl shadow-sm">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#2e7d32] mb-2 font-bold ml-1">Community Name</label>
                <input type="text" value={communityName} onChange={(e) => setCommunityName(e.target.value)} className="w-full pb-3 border-b-2 border-[#dceddd] bg-transparent text-lg font-bold focus:outline-none focus:border-[#4caf50] text-[#2e7d32] placeholder:text-green-200" placeholder="e.g. Palm Grove Society" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#2e7d32] mb-2 font-bold ml-1">Community Address</label>
                <input type="text" value={communityAddress} onChange={(e) => setCommunityAddress(e.target.value)} className="w-full pb-3 border-b-2 border-[#dceddd] bg-transparent text-lg font-bold focus:outline-none focus:border-[#4caf50] text-[#2e7d32] placeholder:text-green-200" placeholder="e.g. 1st Main Rd, Whitefield" />
              </div>
            </div>

            <button onClick={startBasket} className="w-full bg-white border-2 border-[#388e3c] text-[#388e3c] py-4 font-bold text-xl rounded-2xl hover:bg-[#f1f8f2] transition-colors flex justify-center items-center gap-2">
              <Users size={20} />
              Place Community Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function BasketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [basket, setBasket] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [qty, setQty] = useState(5);

  const loadData = () => {
    api.getBaskets().then(res => {
      const b = res.find((b: any) => b.id === id);
      setBasket(b);
      if (b) {
        api.getListings().then(listings => setListing(listings.find((l: any) => l.id === b.listingId)));
      }
    });
  }
  useEffect(() => { 
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const joinBasket = async () => {
    await api.joinBasket(id!, { consumerId: getUser().id, quantity_kg: qty });
    loadData();
  }

  if (!basket || !listing) return <div className="p-8 text-center font-bold text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-[#fdfbf9] relative">
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm">
        <ArrowLeft className="w-6 h-6 text-gray-600" />
      </button>
      
      <div className="p-6 pt-28">
        <div className="mb-10 text-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-[32px] font-bold text-gray-800 tracking-tight leading-none mb-2">
            {basket.community_name || 'Community Basket'}
          </h1>
          <p className="text-sm font-bold text-gray-400 mb-2">{listing.crop_name} from {listing.farmerName}</p>
          {basket.community_address && (
            <p className="text-xs font-bold text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded-lg">📍 {basket.community_address}</p>
          )}
          
          <div className="my-8 text-[64px] font-extrabold leading-none tracking-tight text-[#2e7d32]">
            {basket.current_quantity_kg}<span className="text-gray-300 text-[32px]">/{basket.min_quantity_kg}kg</span>
          </div>
          
          <div className="w-full bg-gray-100 h-3 rounded-full mb-6 overflow-hidden">
             <div className="bg-[#4caf50] h-full transition-all duration-1000 ease-out rounded-full" style={{width: `${Math.min(100, (basket.current_quantity_kg / basket.min_quantity_kg) * 100)}%`}}></div>
          </div>
          <span className="text-sm font-bold bg-[#e8f5e9] text-[#2e7d32] px-4 py-2 rounded-xl mb-2 inline-block capitalize">{basket.status.replace('_', ' ')}</span>
        </div>

        {basket.status === 'open' ? (
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-6">
               <h3 className="text-sm uppercase tracking-widest font-extrabold text-gray-400 mb-6 text-center">Join Basket</h3>
               <div className="flex items-center gap-6 mb-8 justify-center">
                 <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-3xl text-gray-600 hover:bg-gray-200 transition-colors">-</button>
                 <span className="font-bold text-[40px] w-28 text-center text-gray-800">{qty} kg</span>
                 <button onClick={() => setQty(qty + 1)} className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-3xl text-gray-600 hover:bg-gray-200 transition-colors">+</button>
               </div>
               
               <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-gray-500 font-bold text-sm text-[12px] uppercase">Produce</span>
                   <span className="text-gray-800 font-bold">₹{qty * listing.price_per_kg}</span>
                 </div>
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-gray-500 font-bold text-sm text-[12px] uppercase">Delivery</span>
                   <span className="text-gray-800 font-bold">₹{(qty <= 5) ? 10 : (qty <= 15) ? 25 : 35}</span>
                 </div>
               </div>

               <button onClick={joinBasket} className="w-full bg-[#388e3c] text-white py-4 font-bold text-xl rounded-2xl shadow-[0_8px_20px_rgba(56,142,60,0.3)]">
                 Pledge {qty} kg • ₹{(qty * listing.price_per_kg) + ((qty <= 5) ? 10 : (qty <= 15) ? 25 : 35)}
               </button>
             </div>
        ) : (
           <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded-3xl p-8 text-center mt-6 shadow-sm">
             <h3 className="font-bold text-2xl text-[#2e7d32] mb-3">Target Reached! 🎉</h3>
             <p className="text-[#388e3c] font-medium text-lg">Your order has been placed and assigned to a delivery partner.</p>
           </div>
        )}
      </div>
    </div>
  );
}

export function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  
  useEffect(() => {
    const fetchOrders = () => api.getConsumerOrders(getUser().id).then(setOrders);
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((o: any) => {
    if (filter === 'All') return true;
    if (filter === 'Confirmed') return o.status === 'farmer_confirmed' || o.status === 'placed';
    if (filter === 'Out for Delivery') return o.status === 'out_for_delivery' || o.status === 'en_route_pickup' || o.status === 'picked_up';
    if (filter === 'Delivered') return o.status === 'delivered';
    return true;
  });

  return (
    <div className="p-6 pb-32 min-h-full bg-[#fbfbf9]">
      <h1 className="text-[36px] font-bold text-[#1b5e20] mb-6 mt-6 tracking-tight">My Orders</h1>
      
      <div className="flex gap-3 overflow-x-auto pb-4 mb-4 hide-scrollbar -mx-2 px-2">
        {['All', 'Confirmed', 'Out for Delivery', 'Delivered'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 font-bold rounded-full whitespace-nowrap shadow-sm text-[15px] transition-colors ${filter === f ? 'border-2 border-[#4caf50] bg-[#f1f8f2] text-[#2e7d32]' : 'border border-gray-200 bg-white text-gray-400'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-28">
          <Package className="w-20 h-20 text-[#e0e0e0] mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No orders yet</h2>
          <p className="text-gray-400 font-medium text-lg">Start browsing fresh produce!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o: any) => (
            <div key={o.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-xl text-gray-800">Order #{o.id.slice(-4)}</span>
                  <div className="text-sm font-bold text-gray-400 mt-1">{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <span className="text-xs font-bold bg-[#e8f5e9] text-[#2e7d32] px-3 py-1.5 rounded-lg capitalize">{o.status.replace('_', ' ')}</span>
              </div>
              
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="font-bold text-xl text-gray-700">{o.quantity_kg} kg produce</p>
                  <p className="text-sm font-bold text-gray-500 mt-1">₹{(((o.price_at_order || o.listing?.price_per_kg || 0) * o.quantity_kg) + ((o.quantity_kg <= 5) ? 10 : (o.quantity_kg <= 15) ? 25 : 35)).toLocaleString()}</p>
                  {o.basket_id && <p className="text-xs font-bold text-[#f59e0b] bg-[#fef3c7] px-2 py-1 rounded-lg mt-2 inline-block">Community Basket</p>}
                </div>
                
                {(o.status === 'out_for_delivery' || o.status === 'farmer_confirmed' || o.status === 'en_route_pickup' || o.status === 'picked_up') && (
                  <button onClick={() => navigate('/track/' + o.id)} className="bg-gray-100 text-gray-700 px-5 py-2.5 font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
                    Track delivery
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfilePage({ user, onLogout }: any) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const roleEmoji: any = {
    consumer: '🛒 Consumer',
    farmer: '🧑‍🌾 Farmer',
    driver: '🚚 Driver'
  };

  const renderModalContent = () => {
    switch(activeModal) {
      case 'Saved Addresses':
        return (
          <div className="space-y-4">
            <div className="p-4 border border-green-200 bg-green-50 rounded-2xl">
              <p className="font-bold text-gray-800">Home</p>
              <p className="text-sm text-gray-600 mt-1">123 Farm Road, Green Valley</p>
            </div>
            <button className="w-full bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] font-bold py-3 rounded-xl hover:bg-[#c8e6c9] transition-colors">+ Add New Address</button>
          </div>
        );
      case 'Payment Methods':
        return (
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">UPI</p>
                <p className="text-sm text-gray-500 mt-1">{user?.phone}@okicici</p>
              </div>
              <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">Primary</span>
            </div>
            <button className="w-full bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] font-bold py-3 rounded-xl hover:bg-[#c8e6c9] transition-colors">+ Add Payment Method</button>
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-4 divide-y divide-gray-100">
            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-gray-700">Order Updates</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#4caf50]" />
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-gray-700">Promotions</span>
              <input type="checkbox" className="w-5 h-5 accent-[#4caf50]" />
            </div>
          </div>
        );
      case 'Language':
        return (
          <div className="space-y-2">
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex justify-between font-bold text-green-800 cursor-pointer">
              English <span className="text-xl leading-none">✓</span>
            </div>
            <div className="p-3 border border-gray-100 rounded-xl font-bold text-gray-600 cursor-pointer hover:bg-gray-50">
              Hindi
            </div>
            <div className="p-3 border border-gray-100 rounded-xl font-bold text-gray-600 cursor-pointer hover:bg-gray-50">
              Telugu
            </div>
          </div>
        );
      case 'Order History':
        return (
          <div className="text-center py-8 text-gray-500 font-bold">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-lg">No previous orders found.</p>
          </div>
        );
      case 'Help & FAQ':
      case 'Contact Support':
        return (
          <div className="space-y-4 text-center py-6">
            <div className="text-5xl mb-4 text-[#4caf50]">📞</div>
            <p className="font-bold text-gray-800 text-xl">Support Team</p>
            <p className="text-gray-500 font-medium">Call us at 1800-FARM-TO-FORK</p>
            <button className="mt-4 bg-[#388e3c] hover:bg-[#2e7d32] text-white font-bold py-3 px-8 rounded-full shadow-md transition-colors">Call Now</button>
          </div>
        );
      case 'Terms & Conditions':
      case 'Privacy Policy':
        return (
          <div className="text-sm text-gray-600 space-y-4 leading-relaxed font-medium">
            <p>Welcome to Farm2Fork. By using our application, you agree to these terms.</p>
            <p>We respect your privacy and protect your data using industry standards.</p>
            <p className="font-bold mt-4 text-[#2e7d32]">Last updated: Today</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-[#fbfbf9] min-h-full pb-32">
      <div className="flex flex-col items-center pt-14 pb-10 bg-white border-b border-gray-100 rounded-b-[40px] shadow-sm">
        <div className="w-28 h-28 bg-[#e8f5e9] text-[#2e7d32] rounded-full flex items-center justify-center text-5xl font-bold mb-5 shadow-sm border-[4px] border-white ring-2 ring-[#e8f5e9]">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <h1 className="text-[28px] font-bold text-gray-800 mb-1">{user?.name}</h1>
        <p className="text-gray-500 font-bold tracking-wide mb-4 text-lg">{user?.phone}</p>
        <div className="bg-[#e8f5e9] text-[#2e7d32] px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm border border-[#c8e6c9]">
          {roleEmoji[user?.role] || '👤 User'}
        </div>
      </div>

      <div className="p-6 space-y-8 mt-2">
        <div>
          <h3 className="text-sm font-extrabold text-gray-400 tracking-widest uppercase mb-4 ml-2">Settings</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-2">
            <ProfileItem icon="📍" title="Saved Addresses" subtitle="Manage delivery addresses" onClick={() => setActiveModal('Saved Addresses')} />
            <ProfileItem icon="💳" title="Payment Methods" subtitle="Cards & UPI" onClick={() => setActiveModal('Payment Methods')} />
            <ProfileItem icon="🔔" title="Notifications" subtitle="Alert preferences" onClick={() => setActiveModal('Notifications')} />
            <ProfileItem icon="🌐" title="Language" subtitle="English" onClick={() => setActiveModal('Language')} />
            <ProfileItem icon="📋" title="Order History" subtitle="View all past orders" noBorder={true} onClick={() => setActiveModal('Order History')} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-gray-400 tracking-widest uppercase mb-4 ml-2">Support</h3>
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-2 mb-8">
            <ProfileItem icon="❓" title="Help & FAQ" onClick={() => setActiveModal('Help & FAQ')} />
            <ProfileItem icon="📞" title="Contact Support" onClick={() => setActiveModal('Contact Support')} />
            <ProfileItem icon="📜" title="Terms & Conditions" onClick={() => setActiveModal('Terms & Conditions')} />
            <ProfileItem icon="🔒" title="Privacy Policy" noBorder={true} onClick={() => setActiveModal('Privacy Policy')} />
          </div>
        </div>

        <button onClick={onLogout} className="w-full bg-[#faebeb] text-[#d32f2f] font-bold text-xl py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors hover:bg-[#f2d7d7]">
          🚪 Logout
        </button>
        
        <p className="text-center text-sm text-gray-300 font-bold mt-8 mb-2">Farm2Fork v1.0.0</p>
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex justify-center items-end" onClick={() => setActiveModal(null)}>
          <div className="bg-white w-full max-w-md rounded-t-[32px] p-6 pb-12 shadow-2xl relative animate-[slideUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">{activeModal}</h2>
               <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-bold hover:bg-gray-200 transition-colors">✕</button>
             </div>
             <div className="max-h-[60vh] overflow-y-auto hide-scrollbar">
               {renderModalContent()}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileItem({ icon, title, subtitle, noBorder, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-4 px-5 ${!noBorder ? 'border-b border-gray-50' : ''} cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors`}>
      <div className="flex items-center gap-5">
        <div className="text-2xl pt-1">{icon}</div>
        <div>
          <h4 className="font-bold text-gray-800 text-lg leading-tight">{title}</h4>
          {subtitle && <p className="text-sm text-gray-400 font-bold mt-1.5">{subtitle}</p>}
        </div>
      </div>
      <div className="text-gray-300 text-3xl font-light mb-1">›</div>
    </div>
  );
}

export function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = () => api.getConsumerOrders(getUser().id).then(orders => {
      const o = orders.find((o: any) => o.id === id);
      setOrder(o);
    });
    fetchOrder();
    const interval = setInterval(fetchOrder, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (!order) return <div className="p-8 text-center text-gray-400 font-bold mt-20">Loading order tracking...</div>;

  return (
    <div className="flex flex-col min-h-full bg-[#fdfbf9] relative">
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white/80 backdrop-blur shadow-sm">
        <ArrowLeft className="w-6 h-6 text-gray-600" />
      </button>

      <div className="h-48 bg-[#e8f5e9] relative overflow-hidden flex items-center justify-center rounded-b-[40px] shadow-sm z-10 border-b border-[#c8e6c9]">
        <div className="absolute inset-0 opacity-40 text-[#4caf50]" style={{backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)', backgroundSize: '24px 24px'}}></div>
        <div className="bg-white p-5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-10 animate-bounce border-2 border-[#4caf50]">
          <Package className="w-8 h-8 text-[#388e3c] fill-[#4caf50]" />
        </div>
      </div>
      
      <div className="flex-1 bg-[#fbfbf9] relative pt-12 p-8 flex flex-col -mt-8 pb-32">
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Delivery Status</h2>
          
          <div className="space-y-8 relative border-l-2 border-gray-100 ml-3 pl-8 py-2">
            <div className="relative">
              <div className={`absolute -left-[45px] w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${['en_route_pickup', 'placed', 'farmer_confirmed'].includes(order.status) ? 'border-[#4caf50] shadow-[0_0_0_4px_rgba(76,175,80,0.1)]' : 'border-[#4caf50]'}`}>
                {['placed', 'farmer_confirmed'].includes(order.status) ? <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50]"></div> : <CheckCircle className="w-6 h-6 text-[#4caf50] bg-white rounded-full"/>}
              </div>
              <h3 className={`font-bold text-xl leading-none mb-1 ${['placed', 'farmer_confirmed'].includes(order.status) ? 'text-gray-800' : 'text-[#81c784]'}`}>Order Confirmed</h3>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mt-1">Farm preparing produce</p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[45px] w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${order.status === 'en_route_pickup' || order.status === 'picked_up' ? 'border-[#4caf50] shadow-[0_0_0_4px_rgba(76,175,80,0.1)]' : (order.status === 'out_for_delivery' || order.status === 'delivered') ? 'border-[#4caf50]' : 'border-gray-200'}`}>
                {order.status === 'en_route_pickup' || order.status === 'picked_up' ? <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50]"></div> : ((order.status === 'out_for_delivery' || order.status === 'delivered') ? <CheckCircle className="w-6 h-6 text-[#4caf50] bg-white rounded-full"/> : null)}
              </div>
              <h3 className={`font-bold text-xl leading-none mb-1 ${order.status === 'en_route_pickup' || order.status === 'picked_up' ? 'text-gray-800' : (order.status === 'out_for_delivery' || order.status === 'delivered') ? 'text-[#81c784]' : 'text-gray-300'}`}>Picked Up</h3>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mt-1">Driver picked up order</p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[45px] w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${order.status === 'out_for_delivery' ? 'border-[#4caf50] shadow-[0_0_0_4px_rgba(76,175,80,0.1)]' : order.status === 'delivered' ? 'border-[#4caf50]' : 'border-gray-200'}`}>
                {order.status === 'out_for_delivery' ? <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50]"></div> : (order.status === 'delivered' ? <CheckCircle className="w-6 h-6 text-[#4caf50] bg-white rounded-full"/> : null)}
              </div>
              <h3 className={`font-bold text-xl leading-none mb-1 ${order.status === 'out_for_delivery' ? 'text-gray-800' : order.status === 'delivered' ? 'text-[#81c784]' : 'text-gray-300'}`}>Out for Delivery</h3>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mt-1">Driver is heading to you</p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[45px] w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${order.status === 'delivered' ? 'border-[#4caf50] shadow-[0_0_0_4px_rgba(76,175,80,0.1)]' : 'border-gray-200'}`}>
                {order.status === 'delivered' ? <CheckCircle className="w-6 h-6 text-[#4caf50] bg-white rounded-full"/> : <div className={`w-2.5 h-2.5 rounded-full bg-transparent`}></div>}
              </div>
              <h3 className={`font-bold text-xl leading-none mb-1 ${order.status === 'delivered' ? 'text-gray-800' : 'text-gray-300'}`}>Delivered</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#e0e0e0]">
           <h3 className="text-xs uppercase tracking-widest text-[#81c784] font-bold mb-4">Order Summary</h3>
           <div className="flex justify-between items-center mb-3">
             <span className="text-gray-500 font-bold">Product</span>
             <span className="text-gray-800 font-bold">{order.listing?.crop_name}</span>
           </div>
           <div className="flex justify-between items-center mb-3">
             <span className="text-gray-500 font-bold">Quantity</span>
             <span className="text-gray-800 font-bold">{order.quantity_kg} kg</span>
           </div>
           
           <div className="flex justify-between items-center mb-3">
             <span className="text-gray-500 font-bold">Price per kg</span>
             <span className="text-gray-800 font-bold">₹{order.price_at_order || order.listing?.price_per_kg || 0}</span>
           </div>

           <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
             <span className="text-gray-500 font-bold">Delivery Fee</span>
             <span className="text-gray-800 font-bold">₹{(order.quantity_kg <= 5) ? 10 : (order.quantity_kg <= 15) ? 25 : 35}</span>
           </div>

           <div className="flex justify-between items-center">
             <span className="text-gray-800 font-extrabold text-lg">Total Amount Paid</span>
             <span className="text-[#2e7d32] font-extrabold text-2xl">₹{(((order.price_at_order || order.listing?.price_per_kg || 0) * order.quantity_kg) + ((order.quantity_kg <= 5) ? 10 : (order.quantity_kg <= 15) ? 25 : 35)).toLocaleString()}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
