import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.resolve(__dirname, '../dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@rokhaven.com' },
    update: {},
    create: { email: 'admin@rokhaven.com', name: 'RokHaven Admin', phone: '+2349167619009', role: 'ADMIN', passwordHash: adminHash },
  })

  const clientHash = await bcrypt.hash('client123', 12)
  await prisma.user.upsert({
    where: { email: 'adaeze@example.com' },
    update: {},
    create: { email: 'adaeze@example.com', name: 'Adaeze Okafor', phone: '+2348012345678', role: 'CLIENT', passwordHash: clientHash },
  })

  const principalHash = await bcrypt.hash('principal123', 12)
  const principal = await prisma.user.upsert({
    where: { email: 'emeka@example.com' },
    update: {},
    create: { email: 'emeka@example.com', name: 'Emeka Nwosu', phone: '+2348098765432', role: 'PRINCIPAL', passwordHash: principalHash },
  })

  const existingCount = await prisma.property.count()
  if (existingCount === 0) {
    const images = {
      arch: JSON.stringify(['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop']),
      prestige: JSON.stringify(['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80&auto=format&fit=crop']),
      lekki: JSON.stringify(['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop']),
    }
    const props = [
      { title: 'The Arch Residences', description: 'A spectacular fully detached mansion on the prestigious Banana Island, boasting panoramic waterfront views and world-class finishes throughout.', price: '₦850,000,000', location: 'Banana Island, Lagos', neighbourhood: 'Banana Island', type: 'Fully Detached', category: 'SALE' as const, bedrooms: 5, bathrooms: 6, sqm: 850, features: JSON.stringify(['Swimming Pool','Home Cinema','Smart Home','Generator','24/7 Security','BQ/Staff Quarters','Gym','Garden','Parking']), images: images.arch, badge: 'Featured', status: 'ACTIVE' as const, principalId: principal.id },
      { title: 'Prestige Towers, Ikoyi', description: 'An architectural masterpiece in the heart of Ikoyi, offering breathtaking city views and unparalleled luxury living.', price: '₦420,000,000', location: 'Ikoyi, Lagos', neighbourhood: 'Ikoyi', type: 'Penthouse', category: 'SALE' as const, bedrooms: 4, bathrooms: 5, sqm: 560, features: JSON.stringify(['Swimming Pool','Concierge','Smart Home','24/7 Security','Generator','Parking','Gym']), images: images.prestige, badge: 'New', status: 'ACTIVE' as const, principalId: principal.id },
      { title: 'Lekki Ocean Heights', description: 'A magnificent six-bedroom villa offering uninterrupted ocean views on Victoria Island\'s most coveted address.', price: '₦680,000,000', location: 'Victoria Island, Lagos', neighbourhood: 'Victoria Island', type: 'Villa', category: 'SALE' as const, bedrooms: 6, bathrooms: 7, sqm: 1200, features: JSON.stringify(['Swimming Pool','Tennis Court','Home Cinema','Smart Home','Generator','BQ/Staff Quarters','24/7 Security','Garden']), images: images.lekki, badge: 'Featured', status: 'ACTIVE' as const, principalId: principal.id },
      { title: 'Maitama Heritage Estate', description: 'Premium furnished apartment available for annual lease in the exclusive Lekki Phase 1 corridor.', price: '₦18,000,000/yr', location: 'Lekki Phase 1, Lagos', neighbourhood: 'Lekki Phase 1', type: 'Apartment', category: 'RENT' as const, bedrooms: 4, bathrooms: 4, sqm: 380, features: JSON.stringify(['Furnished','Swimming Pool','Generator','24/7 Security','Parking']), images: JSON.stringify(['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop']), badge: 'Featured', status: 'ACTIVE' as const },
      { title: 'Victoria Crown Shortlet', description: 'Exquisite short-let apartment in Victoria Island, fully furnished with premium finishes.', price: '₦450,000/night', location: 'Victoria Island, Lagos', neighbourhood: 'Victoria Island', type: 'Apartment', category: 'SHORTLET' as const, bedrooms: 2, bathrooms: 2, sqm: 180, features: JSON.stringify(['Furnished','Smart Home','Concierge','24/7 Security','Parking','Gym']), images: JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop']), badge: 'New', status: 'ACTIVE' as const },
    ]
    for (const p of props) await prisma.property.create({ data: p })
    console.log(`✅ Created ${props.length} properties`)
  }

  console.log('✅ Seed done — Admin: admin@rokhaven.com / admin123 | Client: adaeze@example.com / client123 | Principal: emeka@example.com / principal123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
