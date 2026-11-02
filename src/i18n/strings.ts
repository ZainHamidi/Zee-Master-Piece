// All interface text, in English and Arabic. Add a key to `en` and TypeScript will ask for it in `ar`.

export type Lang = 'en' | 'ar'

// Text that differs per language, e.g. product names.
export type Localized = Record<Lang, string>

const en = {
  langName: 'English',
  changeLanguage: 'Change language',

  mainNav: 'Main',
  home: 'Home',
  about: 'About ZEE Masterpiece',
  contact: 'Contact Us',
  homeLink: (store: string) => `${store} home`,
  searchProducts: 'Search products',
  showFavorites: 'Your favorites',
  openCart: 'Open cart',
  searchPlaceholder: 'Search the collection…',

  heroLine1: 'Handmade Acrylic Art,',
  heroLine2: 'Crafted with ',
  heroAccent: 'Elegance',
  heroText:
    'Unique acrylic decorations for your home, special moments and meaningful gifts designed with love, inspired by heritage, made for modern spaces.',
  heroAlt: 'Ramadan Mubarak acrylic arch beside a glowing lantern',
  shopCollection: 'Shop Collection',
  orderNow: 'Order Now',

  collectionTitle: 'Shop Our Collection',
  favoritesTitle: 'Your Favorites',
  emptyFavorites: 'Tap the heart on any piece to save it here.',
  favoritesIntro: 'The pieces you love, saved in one place.',
  favoritesCount: (count: number) => (count === 1 ? '1 saved piece' : `${count} saved pieces`),
  noFavoritesTitle: 'No favorites yet',
  browseCollection: 'Browse the Collection',
  backToCollection: 'Back to collection',
  showAllFavorites: 'Show all favorites',
  addAllToCart: 'Add all to cart',
  addedAllToCart: 'All added to cart',
  noMatches: (query: string) => `Nothing matches “${query}”.`,
  showEverything: 'Show everything',
  photoComingSoon: 'Photo coming soon',

  customTitle: 'Custom Orders ',
  customAccent: 'Made Simple',
  customText:
    'Every piece starts with an idea. Whether you have something specific in mind or just a vision you want to bring to life, we make the custom ordering process easy and personal. From the first detail to the final piece, we work with you to create something that feels uniquely yours.',
  customAlt: 'Hand-finishing a personalised acrylic name sign',
  startCustomOrder: 'Start a Custom Order',

  footerTagline: 'Let’s Create A Masterpiece Together',
  rights: (year: number, store: string) => `All Rights Reserved. ©${year} ${store}`,

  inquire: 'Inquire',
  viewProduct: (name: string) => `View ${name}`,
  addToCartNamed: (name: string) => `Add ${name} to cart`,
  inCartCount: (count: number) => `${count} in cart`,
  saveFavoriteNamed: (name: string) => `Save ${name} to favorites`,
  removeFavoriteNamed: (name: string) => `Remove ${name} from favorites`,

  saveFavorite: 'Save to favorites',
  removeFavorite: 'Remove from favorites',
  close: 'Close',
  productNote: 'Handmade with love. Want a different size, colour or a personal touch? Ask us on WhatsApp.',
  quantity: 'Quantity',
  decrease: 'Decrease quantity',
  increase: 'Increase quantity',
  addToCart: 'Add to cart',
  addedToCart: 'Added to cart',
  inquireWhatsApp: 'Inquire on WhatsApp',
  inCartViewCart: (count: number) => `${count} in your cart · View cart`,

  cartTitle: 'Your Cart',
  closeCart: 'Close cart',
  cartEmpty: 'Your cart is empty. Add something you like!',
  priceEach: (price: string) => `${price} each`,
  removeOne: (name: string) => `Remove one ${name}`,
  addOne: (name: string) => `Add one ${name}`,
  noteLabel: 'Note for the seller (optional)',
  notePlaceholder: 'Personalisation, colour, delivery address…',
  total: 'Total',
  orderOnWhatsApp: 'Order on WhatsApp',
  orderHint: 'You’ll finish your order and arrange payment in the WhatsApp chat.',
  clearCart: 'Clear cart',

  // WhatsApp messages are sent in the language the visitor is browsing in.
  msgGreeting: (store: string) => `Hi ${store}! I'd like to place an order.`,
  msgCustom: (store: string) => `Hi ${store}! I have an idea for a custom piece I'd like to discuss.`,
  msgInquiry: (store: string, product: string) =>
    `Hi ${store}! I'm interested in the ${product}. Could you tell me more about it?`,
  msgOrderIntro: (store: string) => `Hi ${store}! I'd like to order:`,
  msgTotal: 'Total',
  msgNote: 'Note',
}

export type Strings = typeof en

const ar: Strings = {
  langName: 'العربية',
  changeLanguage: 'تغيير اللغة',

  mainNav: 'القائمة الرئيسية',
  home: 'الرئيسية',
  about: 'عن ZEE Masterpiece',
  contact: 'تواصل معنا',
  homeLink: (store) => `الصفحة الرئيسية لـ ${store}`,
  searchProducts: 'ابحث في المنتجات',
  showFavorites: 'مفضلاتك',
  openCart: 'فتح السلة',
  searchPlaceholder: 'ابحث في المجموعة…',

  heroLine1: 'فنّ أكريليك مصنوع يدويًا،',
  heroLine2: 'صُنع بكل ',
  heroAccent: 'أناقة',
  heroText:
    'قطع ديكور أكريليك فريدة لمنزلك ولحظاتك المميزة وهدايا ذات معنى، صُمّمت بحب، مستوحاة من التراث، ومصنوعة لتناسب المساحات العصرية.',
  heroAlt: 'لوحة أكريليك «رمضان مبارك» بجانب فانوس مضيء',
  shopCollection: 'تسوّق المجموعة',
  orderNow: 'اطلب الآن',

  collectionTitle: 'تسوّق مجموعتنا',
  favoritesTitle: 'مفضلاتك',
  emptyFavorites: 'اضغط على القلب في أي قطعة لحفظها هنا.',
  favoritesIntro: 'القطع التي أحببتها، محفوظة في مكان واحد.',
  // Arabic plural forms: 1, 2, 3–10, 11+.
  favoritesCount: (count) =>
    count === 1
      ? 'قطعة محفوظة واحدة'
      : count === 2
        ? 'قطعتان محفوظتان'
        : count <= 10
          ? `${count} قطع محفوظة`
          : `${count} قطعة محفوظة`,
  noFavoritesTitle: 'لا توجد مفضلات بعد',
  browseCollection: 'تصفّح المجموعة',
  backToCollection: 'العودة إلى المجموعة',
  showAllFavorites: 'عرض كل المفضلات',
  addAllToCart: 'أضف الكل إلى السلة',
  addedAllToCart: 'أُضيفت جميعها إلى السلة',
  noMatches: (query) => `لا توجد نتائج لـ «${query}».`,
  showEverything: 'عرض كل المنتجات',
  photoComingSoon: 'الصورة قريبًا',

  customTitle: 'طلبات خاصة ',
  customAccent: 'بكل سهولة',
  customText:
    'كل قطعة تبدأ بفكرة. سواء كان لديك تصميم محدد أو مجرد تصوّر تريد تحويله إلى حقيقة، نجعل تجربة الطلب الخاص سهلة وشخصية. من أول تفصيلة حتى القطعة النهائية، نعمل معك لنصنع شيئًا يعبّر عنك وحدك.',
  customAlt: 'لمسات يدوية أخيرة على لوحة اسم أكريليك مخصصة',
  startCustomOrder: 'ابدأ طلبك الخاص',

  footerTagline: 'لنصنع تحفة فنية معًا',
  rights: (year, store) => `جميع الحقوق محفوظة. ©${year} ${store}`,

  inquire: 'استفسر',
  viewProduct: (name) => `عرض ${name}`,
  addToCartNamed: (name) => `أضف ${name} إلى السلة`,
  inCartCount: (count) => `${count} في السلة`,
  saveFavoriteNamed: (name) => `احفظ ${name} في المفضلة`,
  removeFavoriteNamed: (name) => `أزل ${name} من المفضلة`,

  saveFavorite: 'أضف إلى المفضلة',
  removeFavorite: 'أزل من المفضلة',
  close: 'إغلاق',
  productNote: 'مصنوعة يدويًا بحب. تريد مقاسًا أو لونًا مختلفًا أو لمسة شخصية؟ اسألنا عبر واتساب.',
  quantity: 'الكمية',
  decrease: 'إنقاص الكمية',
  increase: 'زيادة الكمية',
  addToCart: 'أضف إلى السلة',
  addedToCart: 'أُضيفت إلى السلة',
  inquireWhatsApp: 'استفسر عبر واتساب',
  inCartViewCart: (count) => `${count} في سلتك · عرض السلة`,

  cartTitle: 'سلة التسوق',
  closeCart: 'إغلاق السلة',
  cartEmpty: 'سلتك فارغة. أضف ما يعجبك!',
  priceEach: (price) => `${price} للقطعة`,
  removeOne: (name) => `إزالة قطعة من ${name}`,
  addOne: (name) => `إضافة قطعة من ${name}`,
  noteLabel: 'ملاحظة للبائع (اختياري)',
  notePlaceholder: 'التخصيص، اللون، عنوان التوصيل…',
  total: 'المجموع',
  orderOnWhatsApp: 'اطلب عبر واتساب',
  orderHint: 'ستُكمل طلبك وتتفق على طريقة الدفع في محادثة واتساب.',
  clearCart: 'إفراغ السلة',

  msgGreeting: (store) => `مرحبًا ${store}! أرغب في تقديم طلب.`,
  msgCustom: (store) => `مرحبًا ${store}! لديّ فكرة لقطعة خاصة وأودّ مناقشتها معكم.`,
  msgInquiry: (store, product) => `مرحبًا ${store}! أودّ معرفة المزيد عن «${product}».`,
  msgOrderIntro: (store) => `مرحبًا ${store}! أرغب في طلب:`,
  msgTotal: 'المجموع',
  msgNote: 'ملاحظة',
}

export const strings: Record<Lang, Strings> = { en, ar }

export const languages: Lang[] = ['en', 'ar']
