# 🚀 Quick Start Guide

## Installation & Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Open Browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Accounts

### Admin Access
```
Email: admin@bicycleshop.com
Password: admin123
```
**Features:** Full admin panel, product management, order management, inventory tracking, analytics

### Customer Access
```
Email: user@example.com
Password: user123
```
**Features:** Shopping, cart, wishlist, order tracking, account management

### Or Create New Account
Click "Sign up" on the login page to create a new customer account.

## 📍 Key Pages to Explore

### Customer Pages
- **Homepage:** `/` - Hero section, featured products, categories
- **Shop Bicycles:** `/shop/bicycles` - Browse all bicycles with filters
- **Shop Parts:** `/shop/parts` - Browse all parts and accessories
- **Product Details:** `/product/[id]` - Click any product to view details
- **Cart:** `/cart` - View and manage shopping cart
- **Checkout:** `/checkout` - Complete purchase (requires login)
- **Wishlist:** `/wishlist` - View saved items
- **Orders:** `/orders` - View order history (requires login)
- **Account:** `/account` - Manage profile (requires login)
- **Services:** `/services` - View available services
- **Gallery:** `/gallery` - Browse cycling gallery

### Admin Pages (Admin Login Required)
- **Admin Dashboard:** `/admin` - Overview and analytics
- **Product Management:** `/admin` → Products tab
- **Order Management:** `/admin` → Orders tab
- **Inventory:** `/admin` → Inventory tab
- **Analytics:** `/admin` → Analytics tab

## 🛒 Testing the Shopping Flow

1. **Browse Products**
   - Visit homepage or shop pages
   - Use filters to find products
   - Click on a product for details

2. **Add to Cart**
   - Click "Add to Cart" on product cards or details page
   - View cart by clicking cart icon in navbar
   - Adjust quantities or remove items

3. **Checkout**
   - Click "Proceed to Checkout" in cart
   - Login or create account
   - Fill shipping information
   - Enter payment details (dummy data)
   - Review and place order

4. **View Orders**
   - Go to Orders page to see order history
   - Check order status and tracking

## 🔍 Testing Search & Filters

1. **Search**
   - Click search icon in navbar
   - Type product name, brand, or category
   - Click result to view product

2. **Filters**
   - Visit shop pages
   - Use category checkboxes
   - Select brands
   - Adjust price range slider
   - Sort by price, rating, or name

## ❤️ Testing Wishlist

1. Click heart icon on any product card
2. View wishlist by clicking heart icon in navbar
3. Remove items by clicking heart again
4. Add wishlist items to cart

## 👤 Testing User Features

1. **Profile Management**
   - Login and go to Account page
   - Click "Edit Profile"
   - Update information
   - Save changes

2. **Order Tracking**
   - Place an order
   - View in Orders page
   - Check status and tracking number

## 🛡️ Testing Admin Features

1. **Login as Admin**
   - Use admin credentials
   - Access admin panel from user menu

2. **Dashboard**
   - View key metrics
   - Check recent orders
   - Monitor statistics

3. **Product Management**
   - View all products
   - Check stock levels
   - See low stock alerts

4. **Order Management**
   - View all orders
   - Update order status
   - Track customer orders

5. **Inventory**
   - Monitor stock levels
   - View low stock alerts
   - Manage inventory

## 🎨 Customization Tips

### Change Colors
Edit `app/globals.css`:
```css
:root {
  --primary: #2563eb;  /* Change primary color */
  --accent: #10b981;   /* Change accent color */
}
```

### Add Products
Edit `lib/data.ts` and add to the `products` array:
```typescript
{
  id: "new-product",
  name: "Product Name",
  description: "Description",
  price: 999.99,
  category: "bicycle" or "parts",
  // ... other fields
}
```

### Modify Navigation
Edit `components/Navbar.tsx` to add/remove nav links.

## 🐛 Troubleshooting

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
npm run dev -- -p 3001
```

### Images Not Loading
- Check internet connection (images from Unsplash)
- Verify Next.js image domains in `next.config.ts`

### State Not Persisting
- Clear browser localStorage
- Check browser console for errors

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

## 💡 Tips

- Use browser DevTools to inspect components
- Check console for any errors
- Cart and wishlist persist in localStorage
- All data is dummy/mock data
- Authentication is simulated (not secure for production)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://github.com/pmndrs/zustand)

---

Enjoy exploring the BikeShop! 🚴‍♂️
