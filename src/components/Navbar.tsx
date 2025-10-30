"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const role = user?.role || "";

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const closeAll = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* --- Logo --- */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90"
          onClick={closeAll}
        >
          <div className="h-10 w-10 rounded-full bg-white border border-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src="/images/logoshopbbk.png"
              alt="Shop BBK Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          <span className="text-lg sm:text-xl font-bold text-blue-900">
            Shop BBK
          </span>
        </Link>

        {/* --- Burger menu (mobile) --- */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden focus:outline-none text-2xl"
        >
          {isMobileMenuOpen ? "✖️" : "☰"}
        </button>

        {/* --- Menu principal (desktop) --- */}
        <div className="hidden sm:flex items-center gap-6">
          {(role === "Admin" || role === "SuperAdmin") && (
            <Dropdown
              label="📊 Tableau de bord"
              links={[
                { href: "/admin/dashboard/orders", text: "📦 Commandes globales" },
                { href: "/admin/orders", text: "📋 Commandes par utilisateur" },
              ]}
            />
          )}

          {(role === "Admin" || role === "SuperAdmin") && (
            <Dropdown
              label="📚 Catégories"
              links={[
                { href: "/admin/categories", text: "📋 Liste des catégories" },
                { href: "/admin/categories/add", text: "➕ Ajouter une catégorie" },
              ]}
            />
          )}

          {(role === "Admin" || role === "SuperAdmin") && (
            <Dropdown
              label="🛒 Produits"
              links={[
                { href: "/admin/products", text: "🏷️ Liste des produits" },
                { href: "/admin/products/add", text: "➕ Ajouter un produit" },
              ]}
            />
          )}

          {role === "SuperAdmin" && (
            <Dropdown
              label="👥 Utilisateurs"
              links={[
                { href: "/admin/users", text: "👤 Liste des utilisateurs" },
                { href: "/admin/users/add", text: "➕ Ajouter un utilisateur" },
                { href: "/admin/roles", text: "⚙️ Gérer les rôles" },
              ]}
            />
          )}

          {user && (
            <Link href="/orders" className="hover:underline">
              📦 Mes commandes
            </Link>
          )}

          {user && (
            <Link href="/cart" className="relative hover:underline">
              🛍️ Panier
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <button onClick={logout} className="hover:underline">
              🔓 Déconnexion ({user.email})
            </button>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                🔐 Connexion
              </Link>
              <Link href="/register" className="hover:underline">
                📝 Inscription
              </Link>
            </>
          )}
        </div>
      </div>

      {/* --- Menu mobile --- */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-blue-700 px-4 pb-4 space-y-2">
          {(role === "Admin" || role === "SuperAdmin") && (
            <AccordionMenu
              title="📊 Tableau de bord"
              links={[
                { href: "/admin/dashboard/orders", text: "📦 Commandes globales" },
                { href: "/admin/orders", text: "📋 Commandes par utilisateur" },
              ]}
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
            />
          )}

          {(role === "Admin" || role === "SuperAdmin") && (
            <AccordionMenu
              title="📚 Catégories"
              links={[
                { href: "/admin/categories", text: "📋 Liste des catégories" },
                { href: "/admin/categories/add", text: "➕ Ajouter une catégorie" },
              ]}
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
            />
          )}

          {(role === "Admin" || role === "SuperAdmin") && (
            <AccordionMenu
              title="🛒 Produits"
              links={[
                { href: "/admin/products", text: "🏷️ Liste des produits" },
                { href: "/admin/products/add", text: "➕ Ajouter un produit" },
              ]}
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
            />
          )}

          {role === "SuperAdmin" && (
            <AccordionMenu
              title="👥 Utilisateurs"
              links={[
                { href: "/admin/users", text: "👤 Liste des utilisateurs" },
                { href: "/admin/users/add", text: "➕ Ajouter un utilisateur" },
                { href: "/admin/roles", text: "⚙️ Gérer les rôles" },
              ]}
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
            />
          )}

          {user && (
            <Link
              href="/orders"
              onClick={closeAll}
              className="block px-2 py-1 hover:bg-blue-600 rounded"
            >
              📦 Mes commandes
            </Link>
          )}

          {user && (
            <Link
              href="/cart"
              onClick={closeAll}
              className="block px-2 py-1 hover:bg-blue-600 rounded relative"
            >
              🛍️ Panier
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <button
              onClick={() => {
                logout();
                closeAll();
              }}
              className="w-full text-left px-2 py-1 hover:bg-blue-600 rounded"
            >
              🔓 Déconnexion ({user.email})
            </button>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeAll}
                className="block px-2 py-1 hover:bg-blue-600 rounded"
              >
                🔐 Connexion
              </Link>
              <Link
                href="/register"
                onClick={closeAll}
                className="block px-2 py-1 hover:bg-blue-600 rounded"
              >
                📝 Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

/* --- Composants utilitaires --- */

function Dropdown({
  label,
  links,
}: {
  label: string;
  links: { href: string; text: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 hover:underline focus:outline-none"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg z-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 hover:bg-blue-100"
              onClick={() => setOpen(false)}
            >
              {link.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AccordionMenu({
  title,
  links,
  openDropdown,
  toggleDropdown,
}: {
  title: string;
  links: { href: string; text: string }[];
  openDropdown: string | null;
  toggleDropdown: (title: string) => void;
}) {
  const isOpen = openDropdown === title;

  return (
    <div>
      <button
        onClick={() => toggleDropdown(title)}
        className="w-full flex justify-between items-center px-2 py-2 bg-blue-600 rounded hover:bg-blue-500"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-2 py-1 text-sm hover:bg-blue-500 rounded"
              onClick={() => toggleDropdown("")}
            >
              {link.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
