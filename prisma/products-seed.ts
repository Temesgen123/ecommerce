// ============================================================
// prisma/products-seed.ts
// ============================================================
// Run with: npx tsx prisma/products-seed.ts
//
// Adds 3 products per category (48 products total).
// Images are from Unsplash (free, commercially licensed).
// Prices are in cents.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Fetch all categories ──────────────────────────────────
  const cats = await prisma.category.findMany();
  const cat = (slug: string) => {
    const found = cats.find((c) => c.slug === slug);
    if (!found) throw new Error(`Category not found: ${slug}`);
    return found.id;
  };

  const products = [
    // ── APPAREL ──────────────────────────────────────────────
    {
      name: 'Classic Oxford Shirt',
      slug: 'classic-oxford-shirt',
      description:
        'A timeless Oxford shirt crafted from 100% premium cotton. Features a button-down collar, chest pocket, and a relaxed regular fit perfect for casual or smart-casual occasions.',
      price: 5999,
      compareAt: 7999,
      stock: 45,
      published: true,
      featured: true,
      categoryId: cat('apparel'),
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
      ],
    },
    {
      name: "Women's Wool Blazer",
      slug: 'womens-wool-blazer',
      description:
        'Sophisticated single-breasted blazer in a soft wool blend. Tailored silhouette with notched lapels, two-button front, and a fully lined interior. Available in sizes XS–XL.',
      price: 12999,
      compareAt: 15999,
      stock: 28,
      published: true,
      featured: true,
      categoryId: cat('apparel'),
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4b4c7f?w=800&q=80',
        'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      ],
    },
    {
      name: 'Slim Fit Chinos',
      slug: 'slim-fit-chinos',
      description:
        'Versatile slim-fit chinos made from stretch cotton twill. Features a mid-rise waist, zip fly, and four-pocket design. Goes from office to weekend effortlessly.',
      price: 6499,
      stock: 60,
      published: true,
      featured: false,
      categoryId: cat('apparel'),
      images: [
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
        'https://images.unsplash.com/photo-1542060748-10c28b62716f?w=800&q=80',
      ],
    },

    // ── SHOES ────────────────────────────────────────────────
    {
      name: 'White Leather Sneakers',
      slug: 'white-leather-sneakers',
      description:
        'Minimalist low-top sneakers with a clean white leather upper, cushioned insole, and durable rubber outsole. The everyday sneaker that goes with everything.',
      price: 8999,
      compareAt: 11000,
      stock: 35,
      published: true,
      featured: true,
      categoryId: cat('shoes'),
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
      ],
    },
    {
      name: 'Chelsea Ankle Boots',
      slug: 'chelsea-ankle-boots',
      description:
        'Classic Chelsea boots in full-grain leather with elastic side panels and a pull tab at the back. Stacked heel, leather-lined interior, and rubber outsole for all-day comfort.',
      price: 14999,
      compareAt: 17999,
      stock: 20,
      published: true,
      featured: false,
      categoryId: cat('shoes'),
      images: [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80',
        'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?w=800&q=80',
      ],
    },
    {
      name: 'Trail Running Shoes',
      slug: 'trail-running-shoes',
      description:
        'High-performance trail runners with a breathable mesh upper, aggressive lugged outsole for grip on any terrain, and responsive foam midsole for long-distance comfort.',
      price: 11999,
      stock: 42,
      published: true,
      featured: true,
      categoryId: cat('shoes'),
      images: [
        'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
        'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80',
      ],
    },

    // ── COMPUTERS ────────────────────────────────────────────
    {
      name: 'Ultra-Slim Laptop 14"',
      slug: 'ultra-slim-laptop-14',
      description:
        'Powerful 14-inch ultrabook featuring a 12-core processor, 16GB RAM, 512GB NVMe SSD, and a stunning 2.8K OLED display. Weighs just 1.2kg and runs all day on a single charge.',
      price: 129999,
      compareAt: 149999,
      stock: 15,
      published: true,
      featured: true,
      categoryId: cat('computers'),
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
      ],
    },
    {
      name: '27" 4K Monitor',
      slug: '27-inch-4k-monitor',
      description:
        'Professional 27-inch IPS display with 4K UHD resolution, 99% sRGB colour accuracy, USB-C connectivity, and an ultra-thin bezel. Ideal for creative professionals and developers.',
      price: 49999,
      compareAt: 59999,
      stock: 18,
      published: true,
      featured: false,
      categoryId: cat('computers'),
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
        'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800&q=80',
        'https://images.unsplash.com/photo-1593640408182-31c228b29976?w=800&q=80',
      ],
    },
    {
      name: 'Mechanical Keyboard TKL',
      slug: 'mechanical-keyboard-tkl',
      description:
        'Tenkeyless mechanical keyboard with tactile brown switches, per-key RGB backlighting, aluminium top plate, and dual USB-C/USB-A connectivity. N-key rollover for gaming precision.',
      price: 13999,
      stock: 30,
      published: true,
      featured: false,
      categoryId: cat('computers'),
      images: [
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80',
      ],
    },

    // ── ELECTRONICS ──────────────────────────────────────────
    {
      name: 'Wireless Noise-Cancelling Headphones',
      slug: 'wireless-noise-cancelling-headphones',
      description:
        'Premium over-ear headphones with industry-leading active noise cancellation, 30-hour battery life, and Hi-Res Audio certification. Folds flat for easy travel.',
      price: 29999,
      compareAt: 34999,
      stock: 25,
      published: true,
      featured: true,
      categoryId: cat('electronics'),
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
      ],
    },
    {
      name: 'True Wireless Earbuds',
      slug: 'true-wireless-earbuds',
      description:
        'Compact true wireless earbuds with 6-hour playback (24 hours with case), IPX5 water resistance, transparency mode, and adaptive EQ. Compatible with all Bluetooth 5.2 devices.',
      price: 14999,
      compareAt: 17999,
      stock: 50,
      published: true,
      featured: true,
      categoryId: cat('electronics'),
      images: [
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&q=80',
      ],
    },
    {
      name: 'Smart Home Speaker',
      slug: 'smart-home-speaker',
      description:
        'Room-filling 360° speaker with built-in voice assistant, multi-room audio support, and a woven fabric exterior. Stream from any service or control your smart home hands-free.',
      price: 9999,
      stock: 40,
      published: true,
      featured: false,
      categoryId: cat('electronics'),
      images: [
        'https://images.unsplash.com/photo-1512446816042-444d641267d4?w=800&q=80',
        'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80',
        'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80',
      ],
    },

    // ── HOME GOODS ───────────────────────────────────────────
    {
      name: 'Egyptian Cotton Duvet Set',
      slug: 'egyptian-cotton-duvet-set',
      description:
        '400-thread-count Egyptian cotton duvet cover set including two pillowcases. Silky smooth, breathable, and easy to care for. Available in King, Queen, and Double.',
      price: 8999,
      compareAt: 11999,
      stock: 35,
      published: true,
      featured: true,
      categoryId: cat('home-goods'),
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
        'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
      ],
    },
    {
      name: 'Solid Acacia Wood Cutting Board',
      slug: 'acacia-wood-cutting-board',
      description:
        'Large end-grain cutting board made from sustainably sourced acacia wood. Features a juice groove, hand grips, and a naturally antimicrobial surface. 45 × 30 cm.',
      price: 4999,
      stock: 55,
      published: true,
      featured: false,
      categoryId: cat('home-goods'),
      images: [
        'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=800&q=80',
        'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&q=80',
        'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80',
      ],
    },
    {
      name: 'Scented Soy Candle Set',
      slug: 'scented-soy-candle-set',
      description:
        'Set of three hand-poured soy wax candles in glass jars — fragrances include cedarwood & vanilla, fresh linen, and eucalyptus & mint. Each burns for up to 50 hours.',
      price: 3499,
      compareAt: 4499,
      stock: 70,
      published: true,
      featured: false,
      categoryId: cat('home-goods'),
      images: [
        'https://images.unsplash.com/photo-1602178506500-1a0f0c5dbe6e?w=800&q=80',
        'https://images.unsplash.com/photo-1603905717836-75a5e8ee6e04?w=800&q=80',
        'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800&q=80',
      ],
    },

    // ── BOOKS ────────────────────────────────────────────────
    {
      name: 'The Art of Deep Work',
      slug: 'the-art-of-deep-work',
      description:
        'A practical guide to cultivating focused, distraction-free work in a world of constant interruptions. Packed with science-backed strategies used by top performers across industries. Hardcover, 320 pages.',
      price: 2499,
      stock: 80,
      published: true,
      featured: false,
      categoryId: cat('books'),
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
        'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80',
      ],
    },
    {
      name: 'Learn Python in 30 Days',
      slug: 'learn-python-in-30-days',
      description:
        'A beginner-friendly programming book with hands-on daily exercises. Covers variables, functions, OOP, file handling, and builds three real projects by the final chapter. Paperback, 480 pages.',
      price: 3499,
      compareAt: 3999,
      stock: 60,
      published: true,
      featured: true,
      categoryId: cat('books'),
      images: [
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80',
      ],
    },
    {
      name: 'World Atlas Deluxe Edition',
      slug: 'world-atlas-deluxe-edition',
      description:
        'Stunning large-format atlas with detailed political and physical maps of every country. Includes thematic maps covering climate, population, and ecosystems. Hardcover, 240 pages, 32 × 44 cm.',
      price: 5999,
      stock: 25,
      published: true,
      featured: false,
      categoryId: cat('books'),
      images: [
        'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
        'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
      ],
    },

    // ── SPORTS & OUTDOORS ────────────────────────────────────
    {
      name: 'Adjustable Dumbbell Set',
      slug: 'adjustable-dumbbell-set',
      description:
        'Space-saving adjustable dumbbells that replace 15 pairs of weights. Dial select from 2.5 to 25 kg in 2.5 kg increments. Includes two dumbbells and a storage tray.',
      price: 29999,
      compareAt: 34999,
      stock: 20,
      published: true,
      featured: true,
      categoryId: cat('sports-outdoors'),
      images: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
      ],
    },
    {
      name: '4-Person Camping Tent',
      slug: '4-person-camping-tent',
      description:
        'Freestanding dome tent for 4 people with a full-coverage rainfly, two doors, three mesh windows, and a gear loft. Sets up in under 5 minutes. Includes footprint.',
      price: 18999,
      stock: 18,
      published: true,
      featured: false,
      categoryId: cat('sports-outdoors'),
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
        'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
        'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&q=80',
      ],
    },
    {
      name: 'Yoga Mat Premium',
      slug: 'yoga-mat-premium',
      description:
        'Extra-thick 6mm natural rubber yoga mat with alignment lines, non-slip texture on both surfaces, and a carrying strap. 183 × 61 cm. Free from PVC and phthalates.',
      price: 6999,
      compareAt: 8999,
      stock: 50,
      published: true,
      featured: true,
      categoryId: cat('sports-outdoors'),
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      ],
    },

    // ── TOYS & GAMES ─────────────────────────────────────────
    {
      name: 'Strategy Board Game',
      slug: 'strategy-board-game',
      description:
        'Award-winning territory-building strategy game for 2–4 players. Easy to learn, endlessly replayable. Average playtime 60–90 minutes. Recommended ages 10+.',
      price: 4499,
      stock: 40,
      published: true,
      featured: false,
      categoryId: cat('toys-games'),
      images: [
        'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&q=80',
        'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800&q=80',
        'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&q=80',
      ],
    },
    {
      name: 'STEM Building Blocks Set',
      slug: 'stem-building-blocks-set',
      description:
        '520-piece magnetic building set that teaches geometry, engineering, and creative thinking. Compatible with major brick systems. Includes 30 build idea cards. Ages 6+.',
      price: 5999,
      compareAt: 7999,
      stock: 35,
      published: true,
      featured: true,
      categoryId: cat('toys-games'),
      images: [
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80',
      ],
    },
    {
      name: '1000-Piece Jigsaw Puzzle',
      slug: '1000-piece-jigsaw-puzzle',
      description:
        'High-quality 1000-piece puzzle featuring a stunning landscape illustration. Precision-cut pieces with a linen finish to reduce glare. Completed size: 68 × 48 cm.',
      price: 2499,
      stock: 60,
      published: true,
      featured: false,
      categoryId: cat('toys-games'),
      images: [
        'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80',
        'https://images.unsplash.com/photo-1551373884-8a0750074df7?w=800&q=80',
        'https://images.unsplash.com/photo-1593466149906-4c25c6b63e12?w=800&q=80',
      ],
    },

    // ── BEAUTY ───────────────────────────────────────────────
    {
      name: 'Vitamin C Brightening Serum',
      slug: 'vitamin-c-brightening-serum',
      description:
        '15% Vitamin C serum with ferulic acid and hyaluronic acid. Visibly reduces dark spots and brightens skin in 4 weeks. Lightweight, fast-absorbing formula. 30ml.',
      price: 3999,
      compareAt: 4999,
      stock: 65,
      published: true,
      featured: true,
      categoryId: cat('beauty'),
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',
        'https://images.unsplash.com/photo-1600428853876-fb0bce66a5d6?w=800&q=80',
      ],
    },
    {
      name: 'Hydrating Face Moisturiser',
      slug: 'hydrating-face-moisturiser',
      description:
        'Lightweight gel-cream moisturiser with ceramides, niacinamide, and shea butter. Clinically proven to hydrate for 72 hours. Suitable for all skin types, fragrance-free. 50ml.',
      price: 2999,
      stock: 80,
      published: true,
      featured: false,
      categoryId: cat('beauty'),
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
        'https://images.unsplash.com/photo-1614806687007-2215b77fbe66?w=800&q=80',
        'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80',
      ],
    },
    {
      name: 'Argan Oil Hair Treatment',
      slug: 'argan-oil-hair-treatment',
      description:
        'Leave-in hair treatment oil with 100% pure Moroccan argan oil. Tames frizz, adds shine, and protects against heat damage up to 230°C. For all hair types. 100ml.',
      price: 2499,
      compareAt: 2999,
      stock: 55,
      published: true,
      featured: false,
      categoryId: cat('beauty'),
      images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80',
      ],
    },

    // ── KITCHEN ──────────────────────────────────────────────
    {
      name: 'Cast Iron Dutch Oven 5.5qt',
      slug: 'cast-iron-dutch-oven-5pt5qt',
      description:
        'Enamelled cast iron Dutch oven with a tight-fitting lid and two loop handles. Retains heat evenly for braising, soups, bread baking, and slow cooking. Oven safe to 260°C.',
      price: 8999,
      compareAt: 12000,
      stock: 22,
      published: true,
      featured: true,
      categoryId: cat('kitchen'),
      images: [
        'https://images.unsplash.com/photo-1584990347449-39e67bc6d707?w=800&q=80',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        'https://images.unsplash.com/photo-1611694170809-4f6d8a7c1cfe?w=800&q=80',
      ],
    },
    {
      name: 'Pour-Over Coffee Set',
      slug: 'pour-over-coffee-set',
      description:
        'Complete pour-over kit including a borosilicate glass carafe, stainless steel dripper, precision gooseneck kettle (600ml), and a digital scale. Makes 2–4 cups.',
      price: 6999,
      stock: 30,
      published: true,
      featured: true,
      categoryId: cat('kitchen'),
      images: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
        'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=800&q=80',
      ],
    },
    {
      name: '8-Piece Knife Block Set',
      slug: '8-piece-knife-block-set',
      description:
        'Professional knife set forged from high-carbon stainless steel. Includes chef, bread, carving, utility, paring knives plus kitchen scissors and a honing steel, in a bamboo block.',
      price: 11999,
      compareAt: 14999,
      stock: 18,
      published: true,
      featured: false,
      categoryId: cat('kitchen'),
      images: [
        'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&q=80',
        'https://images.unsplash.com/photo-1566454419290-57a0589c9b17?w=800&q=80',
        'https://images.unsplash.com/photo-1602574975048-81c0a8e2e3a8?w=800&q=80',
      ],
    },

    // ── TOOLS & DIY ──────────────────────────────────────────
    {
      name: '20V Cordless Drill Driver',
      slug: '20v-cordless-drill-driver',
      description:
        '20V brushless drill driver with 21+1 clutch settings, two-speed gearbox, built-in LED light, and a 13mm keyless chuck. Includes two 2Ah batteries and a fast charger.',
      price: 9999,
      compareAt: 12999,
      stock: 25,
      published: true,
      featured: true,
      categoryId: cat('tools-diy'),
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
        'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80',
      ],
    },
    {
      name: 'Stanley 25-Piece Tool Set',
      slug: 'stanley-25-piece-tool-set',
      description:
        'Essential home tool kit with a hammer, screwdrivers, pliers, wrench, tape measure, and more. Stored in a blow-moulded case for easy organisation and transport.',
      price: 4999,
      stock: 40,
      published: true,
      featured: false,
      categoryId: cat('tools-diy'),
      images: [
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80',
        'https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?w=800&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      ],
    },
    {
      name: 'Laser Level 3D 12-Line',
      slug: 'laser-level-3d-12-line',
      description:
        'Self-levelling 12-line 3D green laser level with ±0.3mm/m accuracy, IP54 dust/water resistance, magnetic mounting bracket, and a 50m range. Includes carrying case.',
      price: 7999,
      compareAt: 9999,
      stock: 15,
      published: true,
      featured: false,
      categoryId: cat('tools-diy'),
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
      ],
    },

    // ── PET SUPPLIES ─────────────────────────────────────────
    {
      name: 'Orthopedic Dog Bed Large',
      slug: 'orthopedic-dog-bed-large',
      description:
        '4-inch memory foam orthopedic dog bed with a waterproof inner liner and removable, machine-washable cover. Ideal for senior dogs and those with joint problems. 100 × 70 cm.',
      price: 7999,
      compareAt: 9999,
      stock: 20,
      published: true,
      featured: true,
      categoryId: cat('pet-supplies'),
      images: [
        'https://images.unsplash.com/photo-1601758174493-fc8ada3439e2?w=800&q=80',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
        'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800&q=80',
      ],
    },
    {
      name: 'Interactive Cat Toy Set',
      slug: 'interactive-cat-toy-set',
      description:
        'Set of 6 interactive toys including a feather wand, crinkle balls, catnip mice, and a tunnel. Stimulates natural hunting instincts and keeps indoor cats active and engaged.',
      price: 1999,
      stock: 60,
      published: true,
      featured: false,
      categoryId: cat('pet-supplies'),
      images: [
        'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&q=80',
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
        'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800&q=80',
      ],
    },
    {
      name: 'Stainless Steel Pet Bowl Set',
      slug: 'stainless-steel-pet-bowl-set',
      description:
        'Set of two non-slip stainless steel bowls on a raised stand. Dishwasher safe, rust-resistant, and sized for medium to large dogs. Adjustable height: 15cm and 22cm.',
      price: 2999,
      stock: 45,
      published: true,
      featured: false,
      categoryId: cat('pet-supplies'),
      images: [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
        'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=800&q=80',
        'https://images.unsplash.com/photo-1605639901753-11e6b6cd6971?w=800&q=80',
      ],
    },

    // ── ACCESSORIES ──────────────────────────────────────────
    {
      name: 'Leather Crossbody Bag',
      slug: 'leather-crossbody-bag',
      description:
        'Compact full-grain leather crossbody bag with an adjustable strap, zip closure, interior card slots, and a key clip. The perfect size for everyday essentials. 24 × 16 cm.',
      price: 9999,
      compareAt: 12999,
      stock: 30,
      published: true,
      featured: true,
      categoryId: cat('accessories'),
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
        'https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=800&q=80',
      ],
    },
    {
      name: 'Minimalist Watch',
      slug: 'minimalist-watch',
      description:
        'Clean-dial minimalist watch with a 40mm stainless steel case, sapphire crystal glass, and a genuine leather strap. Powered by a Japanese quartz movement. Water resistant to 50m.',
      price: 14999,
      compareAt: 18000,
      stock: 22,
      published: true,
      featured: true,
      categoryId: cat('accessories'),
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        'https://images.unsplash.com/photo-1548171915-b7e15f09a1be?w=800&q=80',
        'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=80',
      ],
    },
    {
      name: 'Polarised Sunglasses',
      slug: 'polarised-sunglasses',
      description:
        'Lightweight acetate frame sunglasses with polarised UV400 lenses. Reduces glare for driving and outdoor activities. Includes a hard case and cleaning cloth.',
      price: 7999,
      compareAt: 9499,
      stock: 38,
      published: true,
      featured: false,
      categoryId: cat('accessories'),
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80',
      ],
    },

    // ── GAMING ───────────────────────────────────────────────
    {
      name: 'Pro Gaming Headset 7.1',
      slug: 'pro-gaming-headset-7-1',
      description:
        'Surround-sound gaming headset with 50mm drivers, virtual 7.1 surround, detachable noise-cancelling mic, and memory foam ear cushions. Compatible with PC, PS5, and Xbox.',
      price: 7999,
      compareAt: 9999,
      stock: 28,
      published: true,
      featured: true,
      categoryId: cat('gaming'),
      images: [
        'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80',
        'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&q=80',
        'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
      ],
    },
    {
      name: 'Wireless Gaming Controller',
      slug: 'wireless-gaming-controller',
      description:
        'Ergonomic wireless controller with Hall-effect thumbsticks, programmable rear buttons, 40-hour battery life, and USB-C charging. Works with PC and Android via Bluetooth.',
      price: 6999,
      stock: 35,
      published: true,
      featured: false,
      categoryId: cat('gaming'),
      images: [
        'https://images.unsplash.com/photo-1592840062661-a5a7f78e2056?w=800&q=80',
        'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      ],
    },
    {
      name: 'RGB Gaming Mouse',
      slug: 'rgb-gaming-mouse',
      description:
        'High-performance optical gaming mouse with a 25,600 DPI sensor, 8 programmable buttons, per-zone RGB lighting, and a braided cable. Weighs just 78g.',
      price: 4999,
      compareAt: 6499,
      stock: 45,
      published: true,
      featured: true,
      categoryId: cat('gaming'),
      images: [
        'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80',
        'https://images.unsplash.com/photo-1563297007-0686b7370c59?w=800&q=80',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
      ],
    },

    // ── GARDEN ───────────────────────────────────────────────
    {
      name: 'Ceramic Plant Pot Set',
      slug: 'ceramic-plant-pot-set',
      description:
        'Set of three matte ceramic planters in graduated sizes (10cm, 14cm, 18cm) with drainage holes and matching saucers. Hand-glazed in a contemporary speckled finish.',
      price: 3999,
      stock: 40,
      published: true,
      featured: false,
      categoryId: cat('garden'),
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      ],
    },
    {
      name: 'Garden Tool Set 5-Piece',
      slug: 'garden-tool-set-5-piece',
      description:
        'Five-piece stainless steel garden tool set including a trowel, transplanter, cultivator, weeder, and hand fork. Ergonomic handles with soft-grip rubber for reduced fatigue.',
      price: 3499,
      compareAt: 4499,
      stock: 35,
      published: true,
      featured: false,
      categoryId: cat('garden'),
      images: [
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
        'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=800&q=80',
        'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80',
      ],
    },
    {
      name: 'Raised Garden Bed Kit',
      slug: 'raised-garden-bed-kit',
      description:
        'Modular cedar wood raised garden bed that assembles in minutes with no tools. 120 × 90 × 30 cm. Naturally rot-resistant and untreated — safe for growing vegetables and herbs.',
      price: 12999,
      compareAt: 15999,
      stock: 12,
      published: true,
      featured: true,
      categoryId: cat('garden'),
      images: [
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
        'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800&q=80',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      ],
    },

    // ── HEALTH & PHARMACY ────────────────────────────────────
    {
      name: 'Vitamin D3 + K2 Supplement',
      slug: 'vitamin-d3-k2-supplement',
      description:
        'High-potency Vitamin D3 (2000 IU) combined with Vitamin K2 (MK-7) for optimal calcium absorption and bone health. 120 vegetarian capsules, one-a-day formula. Gluten-free.',
      price: 1999,
      compareAt: 2499,
      stock: 100,
      published: true,
      featured: false,
      categoryId: cat('health-pharmacy'),
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
        'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=800&q=80',
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80',
      ],
    },
    {
      name: 'Digital Blood Pressure Monitor',
      slug: 'digital-blood-pressure-monitor',
      description:
        'Clinically validated upper arm blood pressure monitor with a large backlit display, irregular heartbeat detection, 60-reading memory, and a storage case. Fits arms 22–42 cm.',
      price: 4999,
      stock: 30,
      published: true,
      featured: true,
      categoryId: cat('health-pharmacy'),
      images: [
        'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80',
        'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80',
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      ],
    },
    {
      name: 'Omega-3 Fish Oil 1000mg',
      slug: 'omega-3-fish-oil-1000mg',
      description:
        'Pharmaceutical-grade Omega-3 fish oil providing 300mg EPA and 200mg DHA per softgel. Molecularly distilled to remove heavy metals. Lemon-flavoured to prevent fish burps. 90 softgels.',
      price: 2499,
      compareAt: 2999,
      stock: 85,
      published: true,
      featured: false,
      categoryId: cat('health-pharmacy'),
      images: [
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80',
        'https://images.unsplash.com/photo-1550572017-edd951aa8ca6?w=800&q=80',
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80',
      ],
    },
  ];

  // Upsert all products
  let count = 0;
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        images: product.images,
        price: product.price,
        stock: product.stock,
      },
      create: product,
    });
    count++;
    process.stdout.write(`\r✓ ${count}/${products.length} products upserted`);
  }

  console.log(
    `\n\n✅ Done! ${count} products seeded across ${cats.length} categories.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
