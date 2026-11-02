import type { Product } from './types'

// Your catalog, with each name and description in English and Arabic.
// Put photos in public/images/ and set image: '/images/your-file.jpg'.
// Prices are placeholders: set your real prices before going live.
export const products: Product[] = [
  {
    id: 'dessert-container',
    name: { en: 'Dessert Container', ar: 'علبة حلويات' },
    description: {
      en: 'A sleek clear box with a gold knot lid to impress your guests with.',
      ar: 'علبة شفافة أنيقة بغطاء مزيّن بعقدة ذهبية تبهر ضيوفك.',
    },
    price: 45,
    image: '/images/dessert-container.jpg',
  },
  {
    id: 'xo-display',
    name: { en: 'XO Display', ar: 'لعبة إكس أو' },
    description: {
      en: 'A black and gold tic-tac-toe set that doubles as table decor.',
      ar: 'لعبة إكس أو باللونين الأسود والذهبي، وقطعة ديكور لطاولتك في الوقت نفسه.',
    },
    price: 40,
    image: '/images/xo-display.jpg',
  },
  {
    id: 'ramadan-calendar',
    name: { en: 'Ramadan Calendar', ar: 'تقويم رمضان' },
    description: {
      en: 'Count down the blessed month with a gold-mirrored arch calendar.',
      ar: 'عُدّ أيام الشهر الفضيل مع تقويم على شكل قوس بلمسات ذهبية لامعة.',
    },
    price: 55,
    image: '/images/ramadan-calendar.jpg',
  },
  {
    id: 'palestine-map',
    name: { en: 'Palestine Map', ar: 'خريطة فلسطين' },
    description: {
      en: 'A gold calligraphy map on a natural wood base, made with love.',
      ar: 'خريطة بالخط العربي الذهبي على قاعدة من الخشب الطبيعي، صُنعت بحب.',
    },
    price: 50,
    image: '/images/palestine-map.jpg',
  },

  // Placeholder pieces (no photos yet): replace with your real products.
  {
    id: 'name-sign',
    name: { en: 'Custom Name Sign', ar: 'لوحة اسم مخصصة' },
    description: {
      en: 'Your name in gold acrylic script on a warm wooden base.',
      ar: 'اسمك بخط ذهبي من الأكريليك على قاعدة خشبية دافئة.',
    },
    price: 35,
  },
  {
    id: 'verse-frame',
    name: { en: 'Quran Verse Frame', ar: 'إطار آية قرآنية' },
    description: {
      en: 'A verse in mirrored gold, a blessing for any room.',
      ar: 'آية بخط ذهبي لامع، بركة لكل ركن في بيتك.',
    },
    price: 60,
  },
  {
    id: 'eid-tray',
    name: { en: 'Eid Serving Tray', ar: 'صينية العيد' },
    description: {
      en: 'A clear tray with gold accents for sweets and dates.',
      ar: 'صينية شفافة بلمسات ذهبية لتقديم الحلويات والتمر.',
    },
    price: 48,
  },
  {
    id: 'coaster-set',
    name: { en: 'Coaster Set', ar: 'طقم قواعد أكواب' },
    description: {
      en: 'Four gold-edged acrylic coasters in a matching holder.',
      ar: 'أربع قواعد أكواب من الأكريليك بحواف ذهبية مع حامل متناسق.',
    },
    price: 30,
  },
]
