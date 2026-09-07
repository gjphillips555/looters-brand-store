// Looters / Group Ltd - Shared JS

document.addEventListener('DOMContentLoaded', () => {
  // Mobile hamburger
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });
  }

  // Mock Google Auth
  const authBtn = document.querySelector('.google-auth');
  if (authBtn) {
    let signedIn = localStorage.getItem('looters_auth') === 'true';
    updateAuthUI(signedIn);

    authBtn.addEventListener('click', () => {
      signedIn = !signedIn;
      localStorage.setItem('looters_auth', signedIn);
      updateAuthUI(signedIn);
    });
  }

  function updateAuthUI(isSignedIn) {
    const authBtn = document.querySelector('.google-auth');
    if (!authBtn) return;
    if (isSignedIn) {
      authBtn.innerHTML = `
        <img src="https://lh3.googleusercontent.com/a/default-user" alt="Avatar" class="avatar" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%236b21a8%22><circle cx=%2212%22 cy=%228%22 r=%224%22/><path d=%22M4 20c0-4 4-6 8-6s8 2 8 6%22/></svg>'">
        <span>My Account</span>
      `;
    } else {
      authBtn.innerHTML = `
        <svg class="g-logo" viewBox="0 0 24 24" width="22" height="22">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Sign in with Google</span>
      `;
    }
  }

  // Crypto Ticker
  initCryptoTicker();

  // Highlight current page in nav
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

async function initCryptoTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;

  const coins = [
    { id: 'bitcoin', symbol: 'BTC' },
    { id: 'ethereum', symbol: 'ETH' },
    { id: 'solana', symbol: 'SOL' },
    { id: 'ripple', symbol: 'XRP' },
    { id: 'cardano', symbol: 'ADA' }
  ];

  try {
    const ids = coins.map(c => c.id).join(',');
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=nzd&include_24hr_change=true`);
    const data = await res.json();

    let html = '';
    // Duplicate for seamless loop
    for (let i = 0; i < 2; i++) {
      coins.forEach(coin => {
        const info = data[coin.id];
        if (!info) return;
        const price = info.nzd?.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' }) || '—';
        const change = info.nzd_24h_change || 0;
        const changeClass = change >= 0 ? 'up' : 'down';
        const changeStr = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        html += `
          <span class="ticker-item">
            <span class="symbol">${coin.symbol}</span>
            <span class="price">${price}</span>
            <span class="change ${changeClass}">${changeStr}</span>
          </span>
        `;
      });
    }
    track.innerHTML = html;
  } catch (e) {
    // Fallback static
    track.innerHTML = `
      <span class="ticker-item"><span class="symbol">BTC</span> <span class="price">NZ$145,200</span> <span class="change up">+1.2%</span></span>
      <span class="ticker-item"><span class="symbol">ETH</span> <span class="price">NZ$5,840</span> <span class="change up">+0.8%</span></span>
      <span class="ticker-item"><span class="symbol">SOL</span> <span class="price">NZ$248</span> <span class="change down">-0.4%</span></span>
      <span class="ticker-item"><span class="symbol">BTC</span> <span class="price">NZ$145,200</span> <span class="change up">+1.2%</span></span>
      <span class="ticker-item"><span class="symbol">ETH</span> <span class="price">NZ$5,840</span> <span class="change up">+0.8%</span></span>
      <span class="ticker-item"><span class="symbol">SOL</span> <span class="price">NZ$248</span> <span class="change down">-0.4%</span></span>
    `;
  }
}

// Simple cart helpers (localStorage)
const Cart = {
  get() {
    return JSON.parse(localStorage.getItem('looters_cart') || '[]');
  },
  save(items) {
    localStorage.setItem('looters_cart', JSON.stringify(items));
    updateCartBadge();
  },
  add(product) {
    const items = this.get();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    this.save(items);
  },
  calculateShipping(items, selectedOption) {
    if (!items.length) return 0;
    const costs = items.flatMap(item => {
      const cost = selectedOption === 'express' ? (item.shippingExpress || 15) : (item.shippingStandard || 8);
      return Array(item.qty).fill(cost);
    }).sort((a, b) => b - a);

    let total = 0;
    const maxCombined = 3;
    costs.slice(0, maxCombined).forEach((c) => {
      total += c;
    });
    if (costs.length > maxCombined) {
      const extra = costs.length - maxCombined;
      total += extra * (costs[2] || costs[costs.length - 1] || 0);
    }
    return total;
  }
};

function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  if (badge) {
    const count = Cart.get().reduce((sum, i) => sum + i.qty, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

window.Cart = Cart;
window.updateCartBadge = updateCartBadge;
