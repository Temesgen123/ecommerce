// ============================================================
// prisma/new-category-products-seed.ts
// ============================================================
// Adds 3 products per new category (21 products total).
// Run with: npx tsx prisma/new-category-products-seed.ts
// Safe to run multiple times — uses upsert.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cats = await prisma.category.findMany();
  const cat = (slug: string) => {
    const found = cats.find((c) => c.slug === slug);
    if (!found)
      throw new Error(
        `Category not found: ${slug}. Run new-categories-seed.ts first.`,
      );
    return found.id;
  };

  const products = [
    // ── SMARTPHONES ──────────────────────────────────────────
    {
      name: 'ProMax Smartphone 256GB',
      slug: 'promax-smartphone-256gb',
      description:
        'Flagship smartphone with a 6.7" AMOLED 120Hz display, triple 50MP camera system, 5000mAh battery with 65W fast charging, and 256GB storage. Available in Midnight Black and Pearl White.',
      price: 99999,
      compareAt: 119999,
      stock: 30,
      published: true,
      featured: true,
      categoryId: cat('smartphones'),
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
      ],
    },
    {
      name: 'Budget 4G Smartphone 128GB',
      slug: 'budget-4g-smartphone-128gb',
      description:
        'Reliable everyday smartphone with a 6.5" IPS LCD display, 48MP dual camera, 5000mAh battery, and 128GB expandable storage. Perfect for first-time smartphone users.',
      price: 19999,
      compareAt: 24999,
      stock: 60,
      published: true,
      featured: false,
      categoryId: cat('smartphones'),
      images: [
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
      ],
    },
    {
      name: 'Foldable Smartphone 512GB',
      slug: 'foldable-smartphone-512gb',
      description:
        'Next-generation foldable phone with a 7.6" inner display that unfolds to reveal a full tablet experience. Features a 12MP under-display camera, S Pen support, and 512GB storage.',
      price: 179999,
      compareAt: 199999,
      stock: 12,
      published: true,
      featured: true,
      categoryId: cat('smartphones'),
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
        'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
      ],
    },

    // ── AUTO PARTS & ACCESSORIES ─────────────────────────────
    {
      name: 'Dash Cam 4K Front & Rear',
      slug: 'dash-cam-4k-front-rear',
      description:
        'Dual-channel 4K dash cam with Sony STARVIS night vision, GPS logger, Wi-Fi app control, parking mode, and a 3" IPS touchscreen. Includes 32GB microSD card.',
      price: 14999,
      compareAt: 18999,
      stock: 25,
      published: true,
      featured: true,
      categoryId: cat('auto-parts-accessories'),
      images: [
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      ],
    },
    {
      name: 'Car Vacuum Cleaner Cordless',
      slug: 'car-vacuum-cleaner-cordless',
      description:
        'Powerful 9000Pa cordless car vacuum with a HEPA filter, 25-minute runtime, multiple attachments for tight spaces, and a USB-C charging case. Weighs just 600g.',
      price: 5999,
      compareAt: 7999,
      stock: 40,
      published: true,
      featured: false,
      categoryId: cat('auto-parts-accessories'),
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
        'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&q=80',
      ],
    },
    {
      name: 'Universal Car Phone Mount',
      slug: 'universal-car-phone-mount',
      description:
        'One-touch magnetic car phone mount with a 360° swivel arm, strong suction cup base, and compatibility with all smartphones from 4–7 inches. No blocking of air vents.',
      price: 2499,
      stock: 80,
      published: true,
      featured: false,
      categoryId: cat('auto-parts-accessories'),
      images: [
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
        'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
      ],
    },

    // ── MUSICAL INSTRUMENTS ───────────────────────────────────
    {
      name: 'Acoustic Guitar Starter Pack',
      slug: 'acoustic-guitar-starter-pack',
      description:
        'Full-size dreadnought acoustic guitar with a spruce top, mahogany back and sides, and a rosewood fretboard. Includes a padded gig bag, tuner, picks, capo, and a strap.',
      price: 12999,
      compareAt: 15999,
      stock: 20,
      published: true,
      featured: true,
      categoryId: cat('musical-instruments'),
      images: [
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
        'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80',
        'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&q=80',
      ],
    },
    {
      name: '61-Key Digital Piano',
      slug: '61-key-digital-piano',
      description:
        'Semi-weighted 61-key digital piano with 128 polyphony, 400 built-in tones, USB MIDI connectivity, and a built-in metronome. Includes a stand, sustain pedal, and headphones.',
      price: 24999,
      compareAt: 29999,
      stock: 15,
      published: true,
      featured: true,
      categoryId: cat('musical-instruments'),
      images: [
        'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80',
        'https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&q=80',
        'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80',
      ],
    },
    {
      name: 'Professional Drum Kit 5-Piece',
      slug: 'professional-drum-kit-5-piece',
      description:
        '5-piece acoustic drum kit with a 22" bass drum, poplar shells, chrome hardware, and Remo heads. Includes hi-hats, crash cymbal, drum throne, and sticks. Assembly required.',
      price: 49999,
      compareAt: 59999,
      stock: 8,
      published: true,
      featured: false,
      categoryId: cat('musical-instruments'),
      images: [
        'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&q=80',
        'https://images.unsplash.com/photo-1524230616393-d6929664aedb?w=800&q=80',
        'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80',
      ],
    },

    // ── HEALTH & WELLNESS ─────────────────────────────────────
    {
      name: 'Smart Fitness Tracker',
      slug: 'smart-fitness-tracker',
      description:
        'Advanced fitness band with 24/7 heart rate monitoring, SpO2 tracking, sleep analysis, 14-day battery, 5ATM water resistance, and 100+ workout modes. Compatible with iOS and Android.',
      price: 7999,
      compareAt: 9999,
      stock: 45,
      published: true,
      featured: true,
      categoryId: cat('health-wellness'),
      images: [
        'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
        'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&q=80',
      ],
    },
    {
      name: 'Percussion Massage Gun',
      slug: 'percussion-massage-gun',
      description:
        'Professional-grade percussion massager with 6 speed levels, 6 interchangeable heads, 3200RPM motor, and 8-hour battery. Ultra-quiet at just 40dB. Relieves muscle soreness and stiffness.',
      price: 8999,
      compareAt: 11999,
      stock: 30,
      published: true,
      featured: true,
      categoryId: cat('health-wellness'),
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      ],
    },
    {
      name: 'Foam Roller Set',
      slug: 'foam-roller-set',
      description:
        'High-density foam roller set including a full 90cm roller, a trigger point ball, and a resistance band. Perfect for myofascial release, stretching, and injury prevention.',
      price: 3499,
      compareAt: 4499,
      stock: 55,
      published: true,
      featured: false,
      categoryId: cat('health-wellness'),
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      ],
    },

    // ── TRAVEL & LUGGAGE ──────────────────────────────────────
    {
      name: 'Hardshell Carry-On Suitcase',
      slug: 'hardshell-carry-on-suitcase',
      description:
        'Lightweight polycarbonate carry-on with 360° spinner wheels, a TSA-approved lock, telescoping handle, and a fully lined interior with packing straps. Fits most airline overhead bins. 55 × 40 × 20 cm.',
      price: 14999,
      compareAt: 19999,
      stock: 25,
      published: true,
      featured: true,
      categoryId: cat('travel-luggage'),
      images: [
        'https://images.unsplash.com/photo-1553531087-b7dde5b6adfc?w=800&q=80',
        'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=800&q=80',
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      ],
    },
    {
      name: 'Anti-Theft Travel Backpack 35L',
      slug: 'anti-theft-travel-backpack-35l',
      description:
        '35L travel backpack with a hidden back-panel zipper, RFID-blocking pocket, USB charging port, 17" laptop compartment, and TSA-friendly lay-flat design. Water-resistant 600D polyester.',
      price: 8999,
      compareAt: 10999,
      stock: 35,
      published: true,
      featured: true,
      categoryId: cat('travel-luggage'),
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
        'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80',
      ],
    },
    {
      name: 'Travel Packing Cubes Set of 6',
      slug: 'travel-packing-cubes-set-6',
      description:
        'Set of 6 lightweight packing cubes in three sizes — 2 large, 2 medium, 2 small. Two-way zippers, mesh top panels for ventilation, and a matching laundry bag. Fits standard carry-on luggage.',
      price: 2999,
      compareAt: 3999,
      stock: 70,
      published: true,
      featured: false,
      categoryId: cat('travel-luggage'),
      images: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
      ],
    },

    // ── OFFICE SUPPLIES ───────────────────────────────────────
    {
      name: 'Ergonomic Mesh Office Chair',
      slug: 'ergonomic-mesh-office-chair',
      description:
        'Fully adjustable ergonomic office chair with lumbar support, breathable mesh back, 4D armrests, headrest, and a heavy-duty aluminium base with smooth-rolling castors. Supports up to 150kg.',
      price: 39999,
      compareAt: 49999,
      stock: 15,
      published: true,
      featured: true,
      categoryId: cat('office-supplies'),
      images: [
        'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
        'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      ],
    },
    {
      name: 'Wireless Charging Desk Pad',
      slug: 'wireless-charging-desk-pad',
      description:
        'Extra-large 90 × 40cm desk mat with a built-in 15W Qi wireless charging zone, USB-A hub, cable management slot, and a non-slip rubber base. Faux leather surface protects your desk.',
      price: 5999,
      compareAt: 7499,
      stock: 40,
      published: true,
      featured: false,
      categoryId: cat('office-supplies'),
      images: [
        'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
        'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=800&q=80',
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
      ],
    },
    {
      name: 'Premium Notebook Set A5',
      slug: 'premium-notebook-set-a5',
      description:
        'Set of 3 hardcover A5 notebooks with 192 pages of 100gsm ivory paper each. Dot-grid, ruled, and blank layouts. Lay-flat binding, ribbon bookmark, and elastic closure.',
      price: 1999,
      compareAt: 2499,
      stock: 90,
      published: true,
      featured: false,
      categoryId: cat('office-supplies'),
      images: [
        'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
      ],
    },

    // ── BABY & KIDS ───────────────────────────────────────────
    {
      name: 'Convertible Baby Car Seat',
      slug: 'convertible-baby-car-seat',
      description:
        'Rear and forward-facing convertible car seat suitable from birth to 29kg. Features a 10-position headrest, 5-point harness, side-impact protection, and machine-washable covers.',
      price: 29999,
      compareAt: 34999,
      stock: 18,
      published: true,
      featured: true,
      categoryId: cat('baby-kids'),
      images: [
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
        'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80',
      ],
    },
    {
      name: 'Baby Monitor with Camera',
      slug: 'baby-monitor-with-camera',
      description:
        '1080p HD baby monitor with night vision, two-way audio, temperature sensor, lullabies, 5" parent display, and a 12-hour battery. No Wi-Fi needed — dedicated 300m FHSS signal.',
      price: 11999,
      compareAt: 14999,
      stock: 22,
      published: true,
      featured: true,
      categoryId: cat('baby-kids'),
      images: [
        'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
        'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
        'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&q=80',
      ],
    },
    {
      name: 'Wooden Activity Cube',
      slug: 'wooden-activity-cube',
      description:
        'Five-sided wooden activity cube with a bead maze, shape sorter, spinning gears, abacus, and a mini maze. Made from FSC-certified birch wood with non-toxic paint. Ages 12 months+.',
      price: 3999,
      compareAt: 4999,
      stock: 35,
      published: true,
      featured: false,
      categoryId: cat('baby-kids'),
      images: [
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80',
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80',
      ],
    },
  ];

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

  console.log(`\n\n✅ Done! ${count} products added across 7 categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
