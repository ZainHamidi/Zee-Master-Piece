// npm run db:setup
// Prepares a new MongoDB database: indexes, the starting products and settings, and your first admin.
// Safe to run again: it never overwrites products, settings or admins that already exist.
import './load-env'
import { defaultSettings } from '../src/config'
import { products as builtInProducts } from '../src/products'
import { closeDb, collections, ensureIndexes } from '../server/db'
import { configured, env } from '../server/env'
import { createOrResetAdmin } from './admin'
import { ask } from './prompt'

if (!configured()) {
  console.error('MONGODB_URI is not set. Add it to .env.local first (see MONGODB_SETUP.md).')
  process.exit(1)
}

try {
  console.log(`Connecting to database “${env.dbName}”…`)
  await ensureIndexes()
  const { products, settings, admins } = await collections()

  if ((await products.countDocuments()) === 0) {
    const now = Date.now()
    await products.insertMany(
      builtInProducts.map((p, index) => ({
        _id: p.id,
        name_en: p.name.en,
        name_ar: p.name.ar,
        description_en: p.description.en,
        description_ar: p.description.ar,
        price: p.price,
        image_url: p.image ?? null,
        visible: true,
        sort_order: index + 1,
        created_at: new Date(now + index),
      })),
    )
    console.log(`✓ Added ${builtInProducts.length} starting products.`)
  } else {
    console.log('• Products already exist; left as they are.')
  }

  const inserted = await settings.updateOne(
    { _id: 'site' },
    {
      $setOnInsert: {
        whatsapp_number: defaultSettings.whatsappNumber,
        facebook_url: defaultSettings.facebookUrl,
        instagram_url: defaultSettings.instagramUrl,
        currency: defaultSettings.currency,
        hero_image_url: null,
        custom_image_url: null,
        content: { en: {}, ar: {} },
      },
    },
    { upsert: true },
  )
  console.log(inserted.upsertedCount ? '✓ Added store settings.' : '• Settings already exist; left as they are.')

  const adminCount = await admins.countDocuments()
  if (adminCount === 0) {
    console.log('\nNo dashboard admin yet. Let’s create yours.')
    await createOrResetAdmin()
  } else {
    console.log(`• ${adminCount} admin account${adminCount === 1 ? '' : 's'} already set up.`)
    if ((await ask('Add another admin or reset a password? (y/N) ')).toLowerCase().startsWith('y')) {
      await createOrResetAdmin()
    }
  }
  console.log('\nAll set. Run `npm run dev` and open http://localhost:5173/admin')
} finally {
  await closeDb()
}
