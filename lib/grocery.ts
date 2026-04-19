import { Category, Product } from '@/lib/types'

export const GROCERY_CATEGORY_CONFIG = [
  {
    slug: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    shortName: 'Fresh',
    description: 'Fresh fruits, seasonal greens & farm veggies.',
    image: '/categories/fruits-veggies.png',
    accent: 'linear-gradient(135deg, #eefdf4 0%, #dcfce7 100%)',
  },
  {
    slug: 'atta-rice-dals',
    name: 'Atta, Rice & Dals',
    shortName: 'Staples',
    description: 'Grains, flours, pulses & kitchen staples.',
    image: '/categories/staples-dals.png',
    accent: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  },
  {
    slug: 'masala-oil-ghee',
    name: 'Masala, Oil & Ghee',
    shortName: 'Cooking',
    description: 'Pure oils, spices & authentic masalas.',
    image: '/categories/oil-spices.png',
    accent: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
  },
  {
    slug: 'dairy',
    name: 'Dairy, Bread & Eggs',
    shortName: 'Dairy',
    description: 'Milk, bread, eggs, butter & more.',
    image: '/categories/dairy-eggs.png',
    accent: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
  },
  {
    slug: 'breakfast',
    name: 'Breakfast & Sauces',
    shortName: 'Breakfast',
    description: 'Jams, spreads, honey & breakfast cereal.',
    image: '/categories/dairy-eggs.png',
    accent: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
  },
  {
    slug: 'snacks',
    name: 'Munchies',
    shortName: 'Munchies',
    description: 'Chips, namkeen, biscuits & crunchy snacks.',
    image: '/categories/munchies.png',
    accent: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)',
  },
  {
    slug: 'beverages',
    name: 'Tea, Coffee & Drinks',
    shortName: 'Beverages',
    description: 'Refreshing juices, tea, coffee & soda.',
    image: '/categories/beverages.png',
    accent: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
  },
  {
    slug: 'chocolates-sweets',
    name: 'Chocolates & Sweets',
    shortName: 'Sweets',
    description: 'Chocolates, candies & traditional sweets.',
    image: '/categories/chocolates.png',
    accent: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
  },
  {
    slug: 'frozen-foods',
    name: 'Frozen Foods',
    shortName: 'Frozen',
    description: 'Ice creams, frozen meals & green peas.',
    image: '/categories/frozen.png',
    accent: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
  },
  {
    slug: 'instant-food',
    name: 'Instant Food',
    shortName: 'Instant',
    description: 'Noodles, pasta & ready-to-eat meals.',
    image: '/categories/instant.png',
    accent: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
  },
  {
    slug: 'personal-care',
    name: 'Personal Care',
    shortName: 'Personal Care',
    description: 'Skin care, soaps, shampoos & oral care.',
    image: '/categories/personal-care.png',
    accent: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
  },
  {
    slug: 'cleaning-household',
    name: 'Cleaning Essentials',
    shortName: 'Cleaning',
    description: 'Dishwash, detergents & house cleaning.',
    image: '/categories/cleaning-essentials.png',
    accent: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
  },
] as const

export const GROCERY_CATEGORY_SLUGS = GROCERY_CATEGORY_CONFIG.map(category => category.slug)

const grocerySlugSet = new Set(GROCERY_CATEGORY_SLUGS)
const orderMap = new Map<string, number>(GROCERY_CATEGORY_CONFIG.map((category, index) => [category.slug, index]))

export function getGroceryCategoryConfig(slug?: string | null) {
  return GROCERY_CATEGORY_CONFIG.find(category => category.slug === slug)
}

export function isGroceryCategory(category?: Pick<Category, 'slug' | 'name'> | null) {
  if (!category) return false
  if (category.slug && grocerySlugSet.has(category.slug as (typeof GROCERY_CATEGORY_SLUGS)[number])) {
    return true
  }

  const name = category.name?.toLowerCase() ?? ''
  return GROCERY_CATEGORY_CONFIG.some(config => name.includes(config.shortName.toLowerCase()) || name.includes(config.name.toLowerCase()))
}

export function filterGroceryCategories(categories: Category[]) {
  return categories
    .filter(category => isGroceryCategory(category))
    .sort((first, second) => {
      const firstOrder = orderMap.get(first.slug) ?? first.sort_order
      const secondOrder = orderMap.get(second.slug) ?? second.sort_order
      return firstOrder - secondOrder
    })
}

export function filterGroceryProducts(products: Product[]) {
  return products.filter(product => isGroceryCategory(product.category as Category | undefined))
}

export function getProductCategoryName(product: Product) {
  const config = getGroceryCategoryConfig(product.category?.slug)
  return config?.name ?? product.category?.name ?? 'Groceries'
}
