# BikeShop - Premium E-Commerce Store

A beautiful, fully-featured e-commerce store for bicycles and bicycle parts built with Next.js, React 19, TypeScript, Tailwind CSS, and Framer Motion.

## Features

### Customer Features
- **Beautiful Homepage** - Animated hero section, featured products, and category browsing
- **Product Catalog** - Separate shops for bicycles and parts with advanced filtering
- **Product Details** - Comprehensive product pages with images, specifications, reviews, and ratings
- **Search & Filters** - Real-time search with category, brand, and price filters
- **Shopping Cart** - Full cart management with quantity updates and price calculations
- **Wishlist** - Save favorite products for later
- **Checkout Process** - Multi-step checkout with shipping and payment information
- **User Authentication** - Login and registration with demo accounts
- **User Account** - Profile management and order history
- **Order Tracking** - View order status and tracking information
- **Services Page** - Information about bike repair, maintenance, and custom builds
- **Gallery** - Beautiful image gallery showcasing cycling moments

### Admin Features
- **Admin Dashboard** - Overview of sales, orders, and inventory
- **Product Management** - Add, edit, and remove products
- **Order Management** - View and update order statuses
- **Inventory Management** - Track stock levels with low stock alerts
- **Analytics** - Sales insights and revenue tracking

### Design Features
- **Responsive Design** - Fully responsive across all devices
- **Smooth Animations** - Framer Motion animations throughout
- **Modern UI** - Clean, professional design with Tailwind CSS
- **Dark Mode Support** - Automatic dark mode detection
- **Fast Performance** - Optimized images and caching

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Accounts

### Admin Account
- **Email:** admin@bicycleshop.com
- **Password:** admin123
- **Access:** Full admin panel access

### Customer Account
- **Email:** user@example.com
- **Password:** user123
- **Access:** Customer features

## Project Structure

```
bicycle-shop/
├── app/                      # Next.js app directory
│   ├── account/             # User account page
│   ├── admin/               # Admin dashboard
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── cart/                # Shopping cart page
│   ├── checkout/            # Checkout process
│   ├── gallery/             # Image gallery
│   ├── orders/              # Order history
│   ├── product/[id]/        # Product details
│   ├── services/            # Services page
│   ├── shop/                # Shop pages
│   │   ├── bicycles/
│   │   └── parts/
│   ├── wishlist/            # Wishlist page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Cart.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   └── SearchModal.tsx
├── lib/                     # Utility functions and data
│   ├── data.ts             # Dummy data
│   ├── store.ts            # Zustand state management
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
└── public/                  # Static assets
```

## Technologies Used

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **Icons:** Lucide React
- **Image Optimization:** Next.js Image

## Key Dependencies

```json
{
  "next": "15.5.4",
  "react": "19.1.0",
  "framer-motion": "^11.0.0",
  "zustand": "^4.5.0",
  "lucide-react": "^0.344.0",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

## Features Breakdown

### Product Management
- Category-wise product organization (Bicycles & Parts)
- Multiple product images
- Detailed specifications
- Stock management
- Price and discount handling
- Product ratings and reviews

### Shopping Experience
- Real-time cart updates
- Persistent cart (localStorage)
- Price calculations with tax and shipping
- Free shipping threshold
- Quantity management
- Stock validation

### User Management
- Secure authentication (demo implementation)
- User profiles
- Address management
- Order history
- Wishlist persistence

### Admin Capabilities
- Dashboard with key metrics
- Product CRUD operations
- Order status management
- Inventory tracking
- Low stock alerts
- Sales analytics

## Customization

### Colors
Edit `app/globals.css` to customize the color scheme:
```css
:root {
  --primary: #2563eb;
  --accent: #10b981;
  /* Add more custom colors */
}
```

### Dummy Data
Modify `lib/data.ts` to add or change products, reviews, and orders.

## Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Deploy with one click

### Other platforms
```bash
npm run build
npm start
```

## State Management

The app uses Zustand for state management with the following stores:
- **Cart Store:** Shopping cart management
- **Wishlist Store:** Wishlist functionality
- **Auth Store:** User authentication
- **UI Store:** UI state (modals, menus)

## Animations

Framer Motion is used throughout for:
- Page transitions
- Hover effects
- Scroll animations
- Modal animations
- Loading states

## Notes

- This is a demo application with dummy data
- Authentication is simulated (not production-ready)
- Payment processing is not implemented
- Images are sourced from Unsplash

## Contributing

Feel free to fork this project and customize it for your needs!

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- Lucide for beautiful icons
- Unsplash for high-quality images
