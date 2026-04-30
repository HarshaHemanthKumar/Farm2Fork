import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

// --- MOCK DATABASE ---
const db = {
  users: [
    { id: '1', role: 'farmer', name: 'Ramu', phone: '1234567890', location: 'Anekal' },
    { id: '2', role: 'consumer', name: 'Priya', phone: '0987654321', location: 'Whitefield' },
    { id: '3', role: 'driver', name: 'Raju', phone: '1122334455', location: 'Marathahalli', status: 'online' },
  ],
  listings: [
    { id: '101', farmerId: '1', crop_name: 'Tomato', quantity_kg: 50, price_per_kg: 15, harvest_date: new Date().toISOString().split('T')[0], status: 'active', farmerName: 'Ramu', distance: 15 }
  ],
  orders: [],
  baskets: []
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---
  app.post('/api/auth/login', (req, res) => {
    const { phone } = req.body;
    let user = db.users.find(u => u.phone === phone);
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please sign up.' });
    }
    res.json({ token: 'mock-jwt-token', user });
  });

  app.post('/api/auth/signup', (req, res) => {
    const { phone, role, name } = req.body;
    let user = db.users.find(u => u.phone === phone);
    if (user) {
      return res.status(400).json({ error: 'User already exists. Please log in.' });
    }
    if (!role) return res.status(400).json({ error: 'Role is required' });
    user = { id: Date.now().toString(), phone, role, name: name || 'New User', location: 'Unknown' };
    db.users.push(user);
    res.json({ token: 'mock-jwt-token', user });
  });

  app.get('/api/listings', (req, res) => {
    res.json(db.listings.filter(l => l.status === 'active'));
  });

  app.post('/api/listings', (req, res) => {
    const listing = {
      id: Date.now().toString(),
      ...req.body,
      status: 'active',
      farmerName: db.users.find(u => u.id === req.body.farmerId)?.name || 'Farmer',
      distance: Math.floor(Math.random() * 20) + 1
    };
    db.listings.push(listing);
    res.json(listing);
  });

  app.post('/api/orders', (req, res) => {
    const order = { id: Date.now().toString(), ...req.body, status: 'placed', created_at: new Date().toISOString() };
    db.orders.push(order);

    // Decrease listing quantity
    if (!req.body.basket_id) {
      const listing = db.listings.find(l => l.id === req.body.listingId);
      if (listing) {
        listing.quantity_kg -= req.body.quantity_kg;
        if (listing.quantity_kg <= 0) listing.status = 'sold';
      }
    }
    res.json(order);
  });

  app.get('/api/orders/consumer/:id', (req, res) => {
    res.json(db.orders.filter(o => o.consumerId === req.params.id));
  });

  app.get('/api/orders/farmer/:id', (req, res) => {
    // Find all orders where listing.farmerId === farmerId
    const farmerListings = db.listings.filter(l => l.farmerId === req.params.id).map(l => l.id);
    res.json(db.orders.filter(o => farmerListings.includes(o.listingId)));
  });

  app.get('/api/jobs', (req, res) => {
    // Return confirmed orders that need drivers
    res.json(db.orders.filter(o => o.status === 'placed' || o.status === 'farmer_confirmed'));
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const order = db.orders.find(o => o.id === req.params.id);
    if (order) {
      order.status = req.body.status;
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  });

  // Baskets logic
  app.post('/api/baskets', (req, res) => {
    const basket = { id: Date.now().toString(), ...req.body, current_quantity_kg: 0, status: 'open', members: [] };
    db.baskets.push(basket);
    res.json(basket);
  });

  app.get('/api/baskets', (req, res) => {
    res.json(db.baskets);
  });

  app.post('/api/baskets/:id/join', (req, res) => {
    const basket = db.baskets.find(b => b.id === req.params.id);
    if (!basket) return res.status(404).json({ error: 'Basket not found' });

    basket.members.push({ consumerId: req.body.consumerId, qty: req.body.quantity_kg });
    basket.current_quantity_kg += req.body.quantity_kg;

    if (basket.current_quantity_kg >= basket.min_quantity_kg) {
      basket.status = 'confirmed';
      // Create an order for this basket automatically
      const order = {
        id: Date.now().toString(),
        listingId: basket.listingId,
        quantity_kg: basket.current_quantity_kg,
        basket_id: basket.id,
        status: 'placed',
        created_at: new Date().toISOString()
      };
      db.orders.push(order);
      const listing = db.listings.find(l => l.id === basket.listingId);
      if (listing) {
        listing.quantity_kg -= basket.current_quantity_kg;
        if (listing.quantity_kg <= 0) listing.status = 'sold';
      }
    }
    res.json(basket);
  });

  // --- AI Chat Endpoint ---
  const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, sessionPhone: clientPhone } = req.body as {
        messages: { role: 'user' | 'model'; content: string }[];
        sessionPhone: string;
      };

      let sessionPhone = clientPhone || '';
      let loggedInUser: any = null;

      const formattedHistory = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const SYSTEM = "You are the helpful assistant for the Farm2Fork app. Your primary goal is to help users authenticate (login/signup), or answer general questions. " +
        "If the user wants to login/signup, first ask for their 10 digit phone number and call requestOtp. " +
        "Then ask for the OTP and call verifyOtp. " +
        "If verifyOtp returns needsSignup=true, ask them for their full name, address, role ('consumer', 'farmer', 'driver') and UPI ID (only if they are a 'farmer'), then call signup tool. " +
        "If verifyOtp returns needsSignup=false, they are successfully logged in (tell them).";

      let response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: formattedHistory,
        config: {
          systemInstruction: SYSTEM,
          tools: [{
            functionDeclarations: [
              {
                name: 'requestOtp',
                description: "Send an OTP to the user's phone number.",
                parameters: { type: Type.OBJECT, properties: { phone: { type: Type.STRING, description: '10-digit phone number' } }, required: ['phone'] },
              },
              {
                name: 'verifyOtp',
                description: "Verify the OTP sent to the user's phone number.",
                parameters: { type: Type.OBJECT, properties: { otp: { type: Type.STRING, description: '6-digit OTP' } }, required: ['otp'] },
              },
              {
                name: 'signup',
                description: 'Complete signup for a new user.',
                parameters: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role: { type: Type.STRING }, upiId: { type: Type.STRING }, address: { type: Type.STRING } }, required: ['name', 'role', 'address'] },
              },
            ],
          }],
        },
      });

      // Agentic loop — execute tools server-side using DB directly
      const MAX_TURNS = 5;
      let turns = 0;
      while (response.functionCalls && response.functionCalls.length > 0 && turns < MAX_TURNS) {
        turns++;
        const call = response.functionCalls[0];
        let toolResult = '';

        try {
          if (call.name === 'requestOtp') {
            const phone = call.args.phone as string;
            sessionPhone = phone;
            // Mock: just confirm OTP sent (in real app, send SMS)
            toolResult = 'OTP sent successfully. Ask user for OTP. (Dev mode: OTP is 123456)';
          } else if (call.name === 'verifyOtp') {
            const otp = call.args.otp as string;
            if (!sessionPhone) {
              toolResult = 'Error: no phone number. Ask user to start again.';
            } else {
              const existingUser = db.users.find((u) => u.phone === sessionPhone);
              if (otp === '123456' || otp.length === 6) {
                if (existingUser) {
                  loggedInUser = existingUser;
                  toolResult = 'OTP verified. needsSignup is false. User is logged in.';
                } else {
                  toolResult = 'OTP verified. needsSignup is true. Ask user for name, role, and address.';
                }
              } else {
                toolResult = 'OTP is incorrect. Ask user to try again.';
              }
            }
          } else if (call.name === 'signup') {
            const { name, role, upiId, address } = call.args as Record<string, string>;
            if (!sessionPhone) {
              toolResult = 'Error: no phone number. Ask user to start again.';
            } else {
              const newUser: any = { id: Date.now().toString(), phone: sessionPhone, name, role, location: address || 'Unknown' };
              if (upiId) newUser.upiId = upiId;
              db.users.push(newUser);
              loggedInUser = newUser;
              toolResult = 'Signup complete. User is now logged in.';
            }
          }
        } catch (e: any) {
          toolResult = `Error: ${e.message}`;
        }

        const toolFeedback = `System: [Tool ${call.name} executed. Result: ${toolResult}] Answer the user based on this result.`;
        response = await gemini.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            ...formattedHistory,
            { role: 'model', parts: [{ text: 'Executing tool...' }] },
            { role: 'user', parts: [{ text: toolFeedback }] },
          ],
        });
      }

      res.json({
        text: response.text || 'Done.',
        sessionPhone,
        loggedInUser,
      });
    } catch (err: any) {
      console.error('Chat error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
