import { getSupabase } from './supabase';

export const api = {
  requestOtp: async (phone: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone.replace(/\D/g, '')}`,
    });
    if (error) throw new Error(error.message);
  },
  verifyOtp: async (phone: string, token: string) => {
    const supabase = getSupabase();
    const cleanPhone = phone.replace(/\D/g, '');
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${cleanPhone}`,
      token,
      type: 'sms',
    });
    if (error) throw new Error(error.message);
    
    // Check if user exists in custom table
    const { data: existingUser } = await supabase.from('users').select('*').eq('phone', cleanPhone).single();
    if (!existingUser) {
      return { needsSignup: true, phone: cleanPhone };
    }
    return { user: existingUser };
  },
  login: async (phone: string) => {
    // Legacy generic login, keep just in case
    const supabase = getSupabase();
    const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
    if (error || !data) throw new Error('User not found. Please sign up.');
    return { user: data };
  },
  signup: async (data: any) => {
    const supabase = getSupabase();
    // Check if user exists
    const { data: existing } = await supabase.from('users').select('*').eq('phone', data.phone).single();
    if (existing) throw new Error('User already exists. Please log in.');
    
    const { data: newUser, error } = await supabase.from('users').insert([
      { phone: data.phone, role: data.role, name: data.name || 'New User', location: data.address || 'Unknown', upi_id: data.upiId }
    ]).select().single();
    if (error) throw new Error(error.message);
    return { user: newUser };
  },
  getListings: async () => {
    const { data, error } = await getSupabase().from('listings').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
  uploadImage: async (file: File) => {
    const supabase = getSupabase();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  },
  createListing: async (data: any) => {
    const { data: newListing, error } = await getSupabase().from('listings').insert([data]).select().single();
    if (error) throw new Error(error.message);
    return newListing;
  },
  createOrder: async (data: any) => {
    // get listing details
    const { data: listing, error: listingError } = await getSupabase().from('listings').select('price_per_kg, quantity_kg').eq('id', data.listingId).single();
    if (listingError || !listing) {
       throw new Error(`Listing not found for id ${data.listingId}. Error: ${listingError?.message}`);
    }

    const orderData = { ...data, status: 'placed', price_at_order: listing.price_per_kg };
    const { data: newOrder, error } = await getSupabase().from('orders').insert([orderData]).select().single();
    if (error) {
       if (error.message.includes('price_at_order')) {
         // fallback if user hasn't run the schema update yet
         delete orderData.price_at_order;
         const { data: fallbackOrder, error: fallbackError } = await getSupabase().from('orders').insert([orderData]).select().single();
         if (fallbackError) throw new Error(fallbackError.message);
         
         const newQty = listing.quantity_kg - data.quantity_kg;
         await getSupabase().from('listings').update({
           quantity_kg: newQty
         }).eq('id', data.listingId);
         
         return fallbackOrder;
       }
       throw new Error(error.message);
    }

    const newQty = listing.quantity_kg - data.quantity_kg;
    await getSupabase().from('listings').update({
      quantity_kg: newQty
    }).eq('id', data.listingId);

    return newOrder;
  },
  getFarmerOrders: async (id: string) => {
    // We need to fetch orders where the listing belongs to the farmer
    // To keep it simple, we just fetch all orders and filter locally if a join is hard, 
    // but better to join: select('*, listings!inner(*)')
    const { data, error } = await getSupabase()
      .from('orders')
      .select('*, listing:listings!inner(*)')
      .eq('listings.farmerId', id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
  getConsumerOrders: async (id: string) => {
    const { data, error } = await getSupabase()
      .from('orders')
      .select('*, listing:listings(*)')
      .eq('consumerId', id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
  updateOrderStatus: async (id: string, status: string) => {
    const { data, error } = await getSupabase().from('orders').update({ status }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  getJobs: async () => {
    const { data, error } = await getSupabase().from('orders').select('*').in('status', ['placed', 'farmer_confirmed', 'en_route_pickup', 'picked_up', 'out_for_delivery']);
    if (error) throw new Error(error.message);
    return data;
  },
  createBasket: async (data: any) => {
    const basketData = { ...data, current_quantity_kg: 0, status: 'open' };
    const { data: newBasket, error } = await getSupabase().from('baskets').insert([basketData]).select().single();
    if (error) throw new Error(error.message);
    return newBasket;
  },
  getBaskets: async () => {
    const { data, error } = await getSupabase().from('baskets').select('*').eq('status', 'open').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },
  joinBasket: async (id: string, joinData: any) => {
    const supabase = getSupabase();
    // In a real app we'd use a transaction or rpc to update safely
    const { data: basket, error: fetchErr } = await supabase.from('baskets').select('*').eq('id', id).single();
    if (fetchErr) throw new Error(fetchErr.message);

    const newQty = basket.current_quantity_kg + joinData.quantity_kg;
    let status = basket.status;
    if (newQty >= basket.min_quantity_kg) {
      status = 'confirmed';
      const { data: listing } = await supabase.from('listings').select('price_per_kg, quantity_kg').eq('id', basket.listingId).single();
      const price_at_order = listing ? listing.price_per_kg : null;
      
      // Auto-create order when confirmed
      const orderPayload: any = {
        listingId: basket.listingId,
        consumerId: joinData.consumerId,
        basket_id: id,
        quantity_kg: newQty,
        delivery_address: basket.community_address || 'Community Location',
        status: 'placed'
      };
      if (price_at_order) orderPayload.price_at_order = price_at_order;
      
      const { error: insertErr } = await supabase.from('orders').insert([orderPayload]);
      if (insertErr && insertErr.message.includes('price_at_order')) {
        delete orderPayload.price_at_order;
        await supabase.from('orders').insert([orderPayload]);
      }
      
      if (listing) {
         const newListingQty = listing.quantity_kg - newQty;
         await supabase.from('listings').update({
           quantity_kg: newListingQty
         }).eq('id', basket.listingId);
      }
    }
    
    const { data, error } = await supabase.from('baskets').update({ current_quantity_kg: newQty, status }).eq('id', id).select().single();
    if (error) throw new Error(error.message);

    // Also track the participant
    await supabase.from('basket_participants').insert([{
      basket_id: id,
      consumer_id: joinData.consumerId,
      quantity_kg: joinData.quantity_kg
    }]);

    return data;
  },
};
