# 🌾 Farm2Fork

A hyper-local, tripartite marketplace connecting farmers directly with consumers through independent delivery drivers. Eliminate middlemen, ensure fair farmer compensation, and deliver fresh produce to your doorstep.

## 🎯 Overview

Farm2Fork empowers three key stakeholders:
- **Farmers**: List produce, manage orders, and receive fair payments
- **Consumers**: Access fresh local produce with transparent pricing and community purchasing options
- **Drivers**: Earn through organized, volume-based deliveries

## ✨ Key Features

### 🤖 AI-Powered Onboarding
- Conversational chatbot using Google Gemini API
- Phone + OTP authentication
- Intelligent role assignment and profile creation

### 👨‍🌾 Farmer Dashboard
- List produce with images, pricing, and inventory
- Real-time earnings tracking
- Order management and confirmation system

### 🛒 Consumer Marketplace
- Browse local farmer listings
- Dynamic tiered delivery pricing:
  - 1-5 kg: ₹10 (Bike)
  - 6-15 kg: ₹25 (Auto)
  - 15+ kg: ₹35 (Minivan)
- Community baskets for bulk purchasing
- Transparent order history and billing

### 🚗 Driver Portal
- Auto-refreshing job board
- Delivery workflow: Accept → Pick Up → Deliver
- Earnings dashboard with payout history

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/farm2fork.git
cd farm2fork
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking
- `npm run clean` - Remove build artifacts

## 🏗️ Project Structure

```
farm2fork/
├── src/
│   ├── components/
│   │   ├── consumer/     # Consumer UI components
│   │   ├── farmer/       # Farmer UI components
│   │   ├── driver/       # Driver UI components
│   │   └── GeminiChatbot.tsx
│   ├── lib/
│   │   ├── api.ts        # API client
│   │   └── supabase.ts   # Supabase client
│   ├── App.tsx
│   └── main.tsx
├── server.ts             # Express backend
├── index.html
└── package.json
```

## 🔐 Authentication Flow

1. User opens chatbot
2. Provides 10-digit phone number
3. Receives OTP (dev mode: 123456)
4. New users provide name, role, address, and UPI ID (farmers only)
5. Redirected to role-specific dashboard

## 🌟 Future Enhancements

- Payment gateway integration (Razorpay/Stripe)
- Live GPS tracking for deliveries
- Push notifications via Firebase
- Rating and review system
- Quality control mechanisms

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for local farmers and communities
