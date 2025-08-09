"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { FaCartPlus, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

/** Product type — status is optional because some responses may not include it */
interface Product {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  image: string;
  category?: string;
  quantity?: number;
  createdAt?: string;
  images?: string[];
  status?: string;
}

/** Wishlist item where productId is a Product object */
interface WishlistItem {
  _id: string; // wishlist document id
  productId: Product;
}

const Wishlist: FC = () => {
  const { data: session } = useSession();
  const userEmails = session?.user?.email;

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add item to cart (accepts a WishlistItem)
  const handleAddToCart = async (item: WishlistItem) => {
    if (!userEmails) {
      Swal.fire(
        "Not signed in",
        "Please sign in to add items to cart.",
        "warning"
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/cart?userEmail=${encodeURIComponent(userEmails)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: userEmails,
            items: {
              productId: item.productId._id,
              quantity: 1,
            },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to add to cart");

      // Remove from wishlist on success (call wishlist delete endpoint)
      const delRes = await fetch(
        `/api/wishlist?userEmail=${encodeURIComponent(userEmails)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: userEmails,
            productId: item.productId._id,
          }),
        }
      );
      await delRes.json();

      setWishlistItems((prev) =>
        prev.filter((w) => w.productId._id !== item.productId._id)
      );

      Swal.fire({
        title: "Added to Cart!",
        text: `${item.productId.title} has been added to your cart.`,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err instanceof Error ? err.message : "Failed to add item",
        "error"
      );
      console.error("Error adding item to cart:", err);
    }
  };

  // Delete wishlist item (accepts a WishlistItem)
  const handleDelete = async (item: WishlistItem) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Remove ${item.productId.title} from your wishlist?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `/api/wishlist?userEmail=${encodeURIComponent(userEmails ?? "")}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: userEmails,
            productId: item.productId._id,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Failed to remove from wishlist");

      setWishlistItems((prev) =>
        prev.filter((w) => w.productId._id !== item.productId._id)
      );

      Swal.fire(
        "Deleted!",
        "Item has been removed from your wishlist.",
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Error!",
        err instanceof Error ? err.message : "Failed to remove item.",
        "error"
      );
      console.error("Error deleting item:", err);
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userEmails) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/wishlist?userEmail=${encodeURIComponent(userEmails)}`
        );
        if (!response.ok) throw new Error("Failed to fetch wishlist");

        const wishListData = await response.json();
        // adjust depending on your API shape; this assumes data.items is an array of WishlistItem
        const items: WishlistItem[] = wishListData?.data?.items ?? [];
        setWishlistItems(items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching wishlist"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userEmails]);

  return (
    <div>
      <div className="text-center">
        <h3 className="text-4xl font-bold mb-2">
          Wishlist – Keep Track of What You Love
        </h3>
        <p>
          Easily store and manage your favorite items in one place. Revisit,
          organize, and shop whenever you&apos;re ready.
        </p>
      </div>

      {loading && (
        <div className="text-center my-12">
          <p className="text-lg">Loading your wishlist...</p>
        </div>
      )}

      {error && (
        <div className="text-center my-12">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto mt-12">
        <table className="table w-full border-collapse">
          <thead>
            <tr className="bg-gray-300 text-black text-center">
              <th className="py-2">Product Image</th>
              <th className="py-2">Product Name</th>
              <th className="py-2">Price</th>
              <th className="py-2">Status</th>
              <th className="py-2">View Product</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wishlistItems.map((item) => (
              <tr key={item._id} className="text-center">
                <td className="flex justify-center">
                  <Image
                    src={item.productId.image || "/assets/placeholder.png"}
                    alt={item.productId.title}
                    width={50}
                    height={40}
                    className="rounded mt-1"
                  />
                </td>
                <td>{item.productId.title}</td>
                <td>$ {item.productId.price}</td>
                <td>{item.productId.status ?? "N/A"}</td>
                <td>
                  <Link href={`/products/${item.productId.slug}`}>Link</Link>
                </td>
                <td>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="text-green-600 cursor-pointer"
                  >
                    <FaCartPlus size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 ml-4 cursor-pointer"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Wishlist;
