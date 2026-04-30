import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Map, ListTodo, Wallet, User, CheckCircle, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ProfilePage } from '../consumer/ConsumerApp';

const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

export default function DriverApp({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-[#fdfbf9] font-sans">
      <div className="flex-1 overflow-y-auto pb-20 relative hide-scrollbar">
        <Routes>
          <Route path="/" element={<DriverHome />} />
          <Route path="/active-job/:id" element={<ActiveJob />} />
          <Route path="/earnings" element={<DriverEarnings />} />
          <Route path="/profile" element={<ProfilePage user={getUser()} onLogout={onLogout} />} />
        </Routes>
      </div>

      <div className="bg-white border-t border-gray-100 flex justify-around p-2 pb-5 absolute bottom-0 w-full rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
        <NavItem to="/driver" current={location.pathname} icon={<ListTodo size={24} color={location.pathname === '/driver' ? '#388e3c' : '#9ca3af'} className={location.pathname === '/driver' ? 'fill-[#e8f5e9]' : ''} />} label="Jobs" onClick={() => navigate('/driver')} />
        <NavItem to="/driver/earnings" current={location.pathname} icon={<Wallet size={24} color={location.pathname.startsWith('/driver/earnings') ? '#388e3c' : '#9ca3af'} className={location.pathname.startsWith('/driver/earnings') ? 'fill-[#e8f5e9]' : ''} />} label="Earnings" onClick={() => navigate('/driver/earnings')} />
        <NavItem to="/driver/profile" current={location.pathname} icon={<User size={24} color={location.pathname === '/driver/profile' ? '#388e3c' : '#9ca3af'} className={location.pathname === '/driver/profile' ? 'fill-[#e8f5e9]' : ''}/>} label="Profile" onClick={() => navigate('/driver/profile')} />
      </div>
    </div>
  );
}

function NavItem({ icon, label, onClick, current, to }: any) {
  const active = current === to || (to !== '/driver' && current.startsWith(to));
  return (
    <button onClick={onClick} className={`flex flex-col items-center p-2 pt-3 px-4 transition-colors ${active ? 'text-[#388e3c]' : 'text-gray-400'}`}>
      <div className={`mb-1 ${active ? 'text-[#388e3c]' : 'text-gray-400'}`}>{icon}</div>
      <span className="text-[11px] font-bold tracking-wide mt-0.5">{label}</span>
      {active && <div className="w-1.5 h-1.5 bg-[#388e3c] rounded-full mt-1.5 absolute bottom-2"></div>}
    </button>
  );
}

export function DriverHome() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  
  const loadJobs = () => {
    api.getJobs().then(setJobs);
  };
  
  useEffect(() => { 
    loadJobs(); 
    const interval = setInterval(loadJobs, 2000);
    return () => clearInterval(interval);
  }, []);

  const getTodayEarnings = () => {
    const history = JSON.parse(localStorage.getItem('driver_earnings_' + getUser().id) || '[]');
    const today = new Date().toISOString().split('T')[0];
    return history.filter((h: any) => h.date.startsWith(today)).reduce((sum: number, h: any) => sum + h.amount, 0);
  };

  return (
    <div className="flex flex-col h-full bg-[#fbfbf9]">
      <div className="p-6 pb-6 bg-[#fbfbf9] z-10 sticky top-0 flex justify-between items-center border-b border-gray-100">
        <div>
           <h1 className="text-[28px] font-bold text-[#2e7d32] tracking-tight leading-none mb-1">Courier</h1>
           <p className="text-xs uppercase tracking-widest text-[#81c784] font-bold">₹{getTodayEarnings()} earned today</p>
        </div>
      </div>

      <div className="p-6 flex-1 pb-24">
        <div>
          <h2 className="text-xs uppercase tracking-widest font-bold text-[#81c784] mb-4">{jobs.length} Nearby Jobs</h2>
          <div className="space-y-4">
            {jobs.map((j: any) => (
                <div key={j.id} className="bg-white rounded-3xl p-6 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#4caf50]"></div>
                  <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4 pl-2">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">Delivery</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1">Order #{j.id.slice(-4)} • {j.quantity_kg} kg</p>
                    </div>
                    <span className="font-extrabold text-2xl text-[#388e3c]">₹{(j.quantity_kg <= 5) ? 10 : (j.quantity_kg <= 15) ? 25 : 35}</span>
                  </div>
                  
                  <div className="p-2 mb-6 text-sm pl-4 relative">
                    <div className="flex items-start mb-5 relative">
                      <div className="absolute left-[3px] top-4 w-[2px] h-8 bg-gray-200"></div>
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-white mt-1 mr-4 z-10"></div>
                      <div>
                        <p className="font-bold text-base text-gray-800 mb-0.5">Farm Pickup</p>
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">2.4 km away</p>
                      </div>
                    </div>
                    <div className="flex items-start relative">
                       <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50] mt-1 mr-4 z-10 shadow-[0_0_0_4px_rgba(76,175,80,0.1)]"></div>
                       <div>
                         <p className="font-bold text-base text-gray-800 mb-0.5">Consumer Dropoff</p>
                         <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">5.1 km trip</p>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                       if (['placed', 'farmer_confirmed'].includes(j.status)) {
                         api.updateOrderStatus(j.id, 'en_route_pickup').then(() => {
                           navigate(`/driver/active-job/${j.id}`);
                         });
                       } else {
                         navigate(`/driver/active-job/${j.id}`);
                       }
                    }} 
                    className="w-full bg-[#e8f5e9] text-[#2e7d32] py-4 rounded-xl font-bold text-lg shadow-sm border border-[#c8e6c9] hover:bg-[#c8e6c9] transition-colors"
                  >
                    {['placed', 'farmer_confirmed'].includes(j.status) ? 'Accept Job' : 'Continue Job'}
                  </button>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="text-center text-gray-400 font-medium mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                   <div className="animate-pulse w-12 h-12 bg-[#e8f5e9] rounded-full mx-auto mb-4 border border-[#c8e6c9] flex items-center justify-center">
                     <ListTodo className="w-5 h-5 text-[#388e3c]" />
                   </div>
                   Looking for jobs...
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}

export function ActiveJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);

  const load = () => {
    api.getJobs().then(res => setJob(res.find((j: any) => j.id === id)));
  };
  
  useEffect(() => { 
    load(); 
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (!job) return <div className="p-6">Loading job details...</div>;

  const nextStep = async () => {
    let nextStatus = '';
    if (job.status === 'en_route_pickup' || job.status === 'placed' || job.status === 'farmer_confirmed') nextStatus = 'picked_up';
    else if (job.status === 'picked_up') nextStatus = 'out_for_delivery';
    else if (job.status === 'out_for_delivery') {
        await api.updateOrderStatus(id!, 'delivered');
        const earningAmount = ((job.quantity_kg <= 5) ? 10 : (job.quantity_kg <= 15) ? 25 : 35);
        const history = JSON.parse(localStorage.getItem('driver_earnings_' + getUser().id) || '[]');
        history.push({ amount: earningAmount, date: new Date().toISOString(), orderId: job.id, quantity: job.quantity_kg });
        localStorage.setItem('driver_earnings_' + getUser().id, JSON.stringify(history));
        alert("Earnings Added: ₹" + earningAmount);
        navigate('/driver');
        return;
    }
    await api.updateOrderStatus(id!, nextStatus);
    load();
  };

  return (
    <div className="flex flex-col min-h-full bg-[#fbfbf9] relative pb-32">
      <div className="h-64 bg-[#e8f5e9] relative overflow-hidden flex items-center justify-center rounded-b-[40px] shadow-sm z-10 border-b border-[#c8e6c9]">
        <div className="absolute inset-0 opacity-40 text-[#4caf50]" style={{backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)', backgroundSize: '24px 24px'}}></div>
        <div className="bg-white p-5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-10 animate-bounce border-2 border-[#4caf50]">
          <Navigation className="w-8 h-8 text-[#388e3c] fill-[#4caf50]" />
        </div>
      </div>
      
      <div className="flex-1 bg-[#fbfbf9] relative pt-12 p-8 flex flex-col -mt-8">
        <div className="flex justify-between items-baseline mb-8 border-b-2 border-gray-100 pb-6 bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div>
            <h2 className="text-[10px] uppercase tracking-widest text-[#81c784] font-bold mb-1">Active Delivery</h2>
            <h1 className="text-3xl font-bold text-gray-800 leading-none">Order #{job.id.slice(-4)}</h1>
          </div>
          <div className="text-[10px] uppercase font-bold bg-[#e8f5e9] text-[#2e7d32] px-3 py-1.5 rounded-lg shadow-sm">
            {job.status.replace(/_/g, ' ')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 mb-6">
          <div className="space-y-10 relative border-l-2 border-gray-100 ml-3 pl-8 py-2">
            <div className="relative">
              <div className={`absolute -left-[45px] w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${['en_route_pickup', 'placed', 'farmer_confirmed'].includes(job.status) ? 'border-[#4caf50] shadow-[0_0_0_4px_rgba(76,175,80,0.1)]' : 'border-[#4caf50]'}`}>
                {['en_route_pickup', 'placed', 'farmer_confirmed'].includes(job.status) ? <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50]"></div> : <CheckCircle className="w-6 h-6 text-[#4caf50] bg-white rounded-full"/>}
              </div>
              <h3 className={`font-bold text-xl leading-none mb-1 ${['en_route_pickup', 'placed', 'farmer_confirmed'].includes(job.status) ? 'text-gray-800' : 'text-[#81c784]'}`}>Heading to Farm</h3>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mt-1">Pickup {job.quantity_kg} kg</p>
            </div>

            <div className="relative border-t border-gray-50 pt-5">
               {/* Line segment override for past/present states could go here in a more complex setup */}
              <div className={`absolute -left-[45px] top-6 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${job.status === 'picked_up' ? 'border-[#4caf50] shadow-[0_0_0_4px_rgba(76,175,80,0.1)]' : job.status === 'out_for_delivery' ? 'border-[#4caf50]' : 'border-gray-200'}`}>
                {job.status === 'out_for_delivery' ? <CheckCircle className="w-6 h-6 text-[#4caf50] bg-white rounded-full"/> : (job.status === 'picked_up' ? <div className="w-2.5 h-2.5 rounded-full bg-[#4caf50]"></div> : null)}
              </div>
              <h3 className={`font-bold text-xl leading-none mb-1 ${job.status === 'picked_up' ? 'text-gray-800' : job.status === 'out_for_delivery' ? 'text-[#81c784]' : 'text-gray-300'}`}>Picked Up</h3>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mt-1">Verify quantity</p>
            </div>

            <div className="relative border-t border-gray-50 pt-5">
              <div className={`absolute -left-[45px] top-6 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${job.status === 'out_for_delivery' ? 'border-[#4caf50] shadow-[0_0_0_4px_rgba(76,175,80,0.1)]' : 'border-gray-200'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${job.status === 'out_for_delivery' ? 'bg-[#4caf50]' : 'bg-transparent'}`}></div>
              </div>
              <h3 className={`font-bold text-xl leading-none mb-1 ${job.status === 'out_for_delivery' ? 'text-gray-800' : 'text-gray-300'}`}>Dropoff</h3>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mt-1">Deliver to consumer</p>
            </div>
          </div>
        </div>

        {job.delivery_address && (
          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#e0e0e0] mb-6">
            <h3 className="text-xs uppercase tracking-widest text-[#81c784] font-bold mb-2">Customer Address</h3>
            <p className="text-lg font-bold text-gray-800 mb-4">{job.delivery_address}</p>
            <div className="flex flex-col gap-3">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.delivery_address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#f1f8f2] text-[#388e3c] py-3 font-bold text-lg rounded-2xl flex justify-center items-center gap-2 border border-[#c8e6c9] hover:bg-[#e8f5e9] transition-colors"
              >
                <Navigation className="w-5 h-5" /> Navigate on Google Maps
              </a>
            </div>
          </div>
        )}

        {['en_route_pickup', 'placed', 'farmer_confirmed', 'picked_up', 'out_for_delivery'].includes(job.status) && (
          <button onClick={nextStep} className="w-full bg-[#388e3c] text-white py-4 font-bold text-xl rounded-2xl shadow-[0_8px_20px_rgba(56,142,60,0.3)] flex justify-center items-center hover:bg-[#2e7d32] transition-colors relative z-20">
            {['en_route_pickup', 'placed', 'farmer_confirmed'].includes(job.status) && 'Arrived at Farm'}
            {job.status === 'picked_up' && 'Start Delivery Route'}
            {job.status === 'out_for_delivery' && 'Mark Delivered'}
          </button>
        )}
      </div>
    </div>
  );
}

export function DriverEarnings() {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem('driver_earnings_' + getUser().id) || '[]').reverse());
  }, []);

  const totalEarnings = history.reduce((sum: number, h: any) => sum + h.amount, 0);

  return (
    <div className="p-6 pb-32 min-h-full bg-[#fbfbf9]">
      <h1 className="text-[36px] font-bold text-[#1b5e20] mb-6 mt-6 tracking-tight">Earnings</h1>
      
      <div className="bg-[#e8f5e9] p-8 rounded-3xl mb-8 border border-[#c8e6c9] shadow-[0_4px_12px_rgba(76,175,80,0.1)] relative overflow-hidden text-center">
         <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 text-[#81c784] opacity-20" />
         <h2 className="text-sm font-bold uppercase tracking-widest text-[#2e7d32] mb-2">Total Balance</h2>
         <p className="text-5xl font-extrabold text-[#1b5e20] tracking-tighter">₹{totalEarnings}</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">History</h3>
        <div className="space-y-4">
          {history.map((h: any, i: number) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-gray-800">Order #{h.orderId.slice(-4)}</p>
                <p className="text-xs font-bold text-gray-400 mt-0.5">{new Date(h.date).toLocaleDateString()} • {h.quantity} kg</p>
              </div>
              <div className="text-2xl font-extrabold text-[#388e3c]">
                +₹{h.amount}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center p-8 bg-gray-50 border border-gray-100 rounded-3xl text-gray-400 font-bold">
              No earnings yet. Start completing deliveries!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
