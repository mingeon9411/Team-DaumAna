import { useEffect, useRef, useState } from 'react';
import { fetchWishlist, addWishlistItem, deleteWishlistItem } from '../api';
import { useAuthModal } from '../context/AuthModalContext';

const pending = new Set();

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { openLogin } = useAuthModal();
  const items = useRef([]);

  useEffect(() => {
    let revision = 0;
    const refresh = async () => {
      const request = ++revision;
      const token = localStorage.getItem('access_token');
      items.current = [];
      setWishlist([]);
      setError('');
      setLoading(Boolean(token));
      if (!token) return;
      try {
        const { data } = await fetchWishlist();
        if (request !== revision || !localStorage.getItem('access_token')) return;
        items.current = data;
        setWishlist(data);
      } catch {
        if (request === revision) setError('위시리스트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        if (request === revision) setLoading(false);
      }
    };
    refresh();
    const events = ['wishlistchange', 'authchange', 'storage', 'focus'];
    events.forEach((event) => window.addEventListener(event, refresh));
    return () => {
      ++revision;
      events.forEach((event) => window.removeEventListener(event, refresh));
    };
  }, []);

  const change = async (id, wished) => {
    if (!localStorage.getItem('access_token')) { openLogin(); return; }
    if (loading) return;
    if (error) { window.dispatchEvent(new Event('wishlistchange')); return; }
    if (pending.has(id)) return;
    pending.add(id);
    try {
      await (wished ? addWishlistItem(id) : deleteWishlistItem(id));
      window.dispatchEvent(new Event('wishlistchange'));
    } catch { alert('위시리스트 변경에 실패했습니다. 다시 시도해주세요.'); }
    finally { pending.delete(id); }
  };

  return {
    wishlist, loading, error,
    toggleWish: (product) => {
      const id = Number(typeof product === 'object' ? product.id : product);
      return change(id, !items.current.some((item) => item.id === id));
    },
    removeWish: (id) => change(Number(id), false),
  };
}
