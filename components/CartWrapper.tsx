"use client";

import { useState } from "react";
import Cart from "./Cart";

export default function CartWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  // This will be triggered from the Navbar cart button
  // You can use a global state or event system if needed
  return <Cart isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
