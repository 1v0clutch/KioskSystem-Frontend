export interface ProductLike {
  id: number;
  sku: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
  image?: string | null;
  category_name?: string;
  category?: { name: string };
}

export interface VariantDefinition {
  sku: string;
  label: string;
  detail?: string;
}

export interface ProductGroupDefinition {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  unitLabel?: string;
  variants: VariantDefinition[];
}

export interface DirectCatalogCard {
  type: 'direct';
  id: string;
  product: ProductLike;
  name: string;
  categoryName: string;
  description: string;
  image?: string;
  priceLabel: string;
  stockLabel: string;
  totalStock: number;
}

export interface GroupCatalogCard {
  type: 'group';
  id: string;
  group: ProductGroupDefinition;
  products: ProductLike[];
  name: string;
  categoryName: string;
  description: string;
  image?: string;
  priceLabel: string;
  stockLabel: string;
  totalStock: number;
}

export type CatalogCard = DirectCatalogCard | GroupCatalogCard;

const assetModules = import.meta.glob('../assets/**/*.{jpg,jpeg,jfif,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const asset = (path: string) => assetModules[`../assets/${path}`];

export const productGroups: ProductGroupDefinition[] = [
  {
    id: 'hinge-sauce-cup',
    name: 'Hinge Sauce Cup w/ Lid',
    category: 'Mini Cups and Jars',
    image: 'Sauce & Salad Cup, PeanutButterJar/hinge-sauce-cup-w-lid.jpg',
    description: 'Choose sauce cup sizes for dips, condiments, and small servings.',
    variants: [
      { sku: 'HCJ01', label: '1oz' },
      { sku: 'HCJ02', label: '2oz' },
      { sku: 'HCJ03', label: '3oz' },
      { sku: 'HCJ04', label: '4oz' },
    ],
  },
  {
    id: 'peanut-butter-jar',
    name: 'Peanut Butter Jar Plastic',
    category: 'Mini Cups and Jars',
    image: 'Sauce & Salad Cup, PeanutButterJar/peanut-butter-jar-plastic.jpg',
    description: 'Small and large jars for spreads, sauces, and packed goods.',
    variants: [
      { sku: 'PBJ-SM', label: 'Small' },
      { sku: 'PBJ-LG', label: 'Large' },
    ],
  },
  {
    id: 'banana-chips-bag',
    name: 'Banana Chips Bags',
    category: 'Plastic Bags',
    image: 'Plastic SandoBags, Labos, Roll, Ice& IceCandy, Ziplocks and TakeAways/bananachips-bag-categories.jpg',
    description: 'Packed snack bag sizes grouped for faster selection.',
    variants: [
      { sku: 'BCB-9X14', label: '9x14' },
      { sku: 'BCB-10X15', label: '10x15' },
      { sku: 'BCB-12X20', label: '12x20' },
      { sku: 'BCB-14X20', label: '14x20' },
    ],
  },
  {
    id: 'plastic-labo',
    name: 'Plastic Labo',
    category: 'Plastic Bags',
    image: 'Plastic SandoBags, Labos, Roll, Ice& IceCandy, Ziplocks and TakeAways/plastic-8x11.jpg',
    description: 'Labo bag sizes for food packing and general use.',
    variants: [
      { sku: 'PLABO-8X11', label: '8x11' },
      { sku: 'PLABO-10X14', label: '10x14' },
      { sku: 'PLABO-12X18', label: '12x18' },
      { sku: 'PLABO-1.5X10', label: '1and1/2x10' },
    ],
  },
  {
    id: 'sando-bags',
    name: 'Sando Bags',
    category: 'Plastic Bags',
    image: 'Plastic SandoBags, Labos, Roll, Ice& IceCandy, Ziplocks and TakeAways/sando-bag-rectangle.jpg',
    description: 'Choose rectangle or square sando bag formats.',
    variants: [
      { sku: 'SB-RECT', label: 'Rectangle' },
      { sku: 'SB-SQUARE', label: 'Square' },
    ],
  },
  {
    id: 'trash-bags',
    name: 'Trash Bags',
    category: 'Plastic Bags',
    image: 'Plastic SandoBags, Labos, Roll, Ice& IceCandy, Ziplocks and TakeAways/trash-bag-black.jfif',
    description: 'Black and clear trash bag options.',
    variants: [
      { sku: 'TB-CLEAR', label: 'Clear' },
      { sku: 'TB-BLACK', label: 'Black' },
    ],
  },
  {
    id: 'milk-tea-cups',
    name: 'Milk Tea Cups',
    category: 'Plastic Cups and Milk Tea Containers',
    image: 'Plastic Cups/milktea-cup-domelid.jpg',
    description: 'Milk tea cup sizes with dome lid and flat lid options.',
    variants: [
      { sku: 'MTC-DOME-12', label: '12oz', detail: 'Dome lid' },
      { sku: 'MTC-DOME-16', label: '16oz', detail: 'Dome lid' },
      { sku: 'MTC-DOME-22', label: '22oz', detail: 'Dome lid' },
      { sku: 'PPY12', label: '12oz', detail: 'Flat lid' },
      { sku: 'PPY16', label: '16oz', detail: 'Flat lid' },
      { sku: 'PPY22', label: '22oz', detail: 'Flat lid' },
    ],
  },
  {
    id: 'plastic-cups',
    name: 'Plastic Cups',
    category: 'Plastic Cups and Milk Tea Containers',
    image: 'Plastic Cups/plastic-cups.jpg',
    description: 'Plastic cup pack sizes for drinks and service counters.',
    variants: [
      { sku: 'PLC6', label: '6oz' },
      { sku: 'PP8', label: '8oz' },
      { sku: 'PLC10', label: '10oz' },
      { sku: 'PLC12', label: '12oz' },
      { sku: 'PLC16', label: '16oz' },
    ],
  },
  {
    id: 'plastic-bilao',
    name: 'Plastic Bilao',
    category: 'Plastic Bilaos',
    image: 'Plastic Bilaos/bilao.jpg',
    description: 'Serving bilao sizes for party trays and packed food.',
    variants: [
      { sku: 'BIA010', label: '10in' },
      { sku: 'BIA012', label: '12in' },
      { sku: 'BIA014', label: '14in' },
      { sku: 'BIA016', label: '16in' },
      { sku: 'BIA018', label: '18in' },
    ],
  },
  {
    id: 'paper-cups',
    name: 'Paper Cups',
    category: 'Paper Packaging Items',
    image: 'Paper Packaging Items/paper-cup-8oz.jpg',
    description: 'Paper cup sizes for hot and cold drinks.',
    variants: [
      { sku: 'PCUP-6.5', label: '6.5oz' },
      { sku: 'PCUP-8', label: '8oz' },
    ],
  },
  {
    id: 'paper-meal-cups',
    name: 'Paper Meal Cups',
    category: 'Paper Packaging Items',
    image: 'Paper Packaging Items/paper-meal-cup-520cc.jpg',
    description: 'Paper meal cup capacities for rice meals and servings.',
    variants: [
      { sku: 'PMC-390', label: '390cc' },
      { sku: 'PMC-520', label: '520cc' },
    ],
  },
  {
    id: 'microwavable-divisions',
    name: 'Microwavable w/ Divisions',
    category: 'Microwavable Containers',
    image: 'Microwaveables/microwave-bento-box-4div.jpg',
    description: 'Divided microwavable trays for separated meal portions.',
    variants: [
      { sku: 'Bento2D', label: '2 Division' },
      { sku: 'Bento3D', label: '3 Division' },
      { sku: 'Bento4D', label: '4 Division' },
      { sku: 'Bento5D', label: '5 Division' },
    ],
  },
  {
    id: 'rectangular-microwavable',
    name: 'Rectangular Microwavable',
    category: 'Microwavable Containers',
    image: 'Microwaveables/microwave-rectangular.jpg',
    description: 'Rectangular microwavable containers with lids.',
    variants: [
      { sku: 'RES30', label: '500ml' },
      { sku: 'RES40', label: '650ml' },
      { sku: 'RES50', label: '750ml' },
      { sku: 'RES60', label: '1000ml' },
    ],
  },
  {
    id: 'round-microwavable',
    name: 'Round Microwavable',
    category: 'Microwavable Containers',
    image: 'Microwaveables/microwave-round.jpg',
    description: 'Round microwavable containers for soups, sauces, and meals.',
    variants: [
      { sku: 'RO250', label: '300ml' },
      { sku: 'RO350', label: '450ml' },
      { sku: 'RO450', label: '750ml' },
    ],
  },
  {
    id: 'bubble-wrap-yards',
    name: 'Bubble Wrap',
    category: 'Bubble Wraps and Straw',
    image: 'BubbleWrap & Plastic Twine/bubble-wrap.jpg',
    description: 'Choose how many yards of bubble wrap you want to avail.',
    unitLabel: 'yard',
    variants: [
      { sku: 'BubbleWrapYard', label: 'Per yard', detail: 'PHP 8.00 per yard' },
    ],
  },
  {
    id: 'rectangular-aluminum-trays',
    name: 'Rectangular Aluminum Foil Trays',
    category: 'Aluminum Pans with Lid',
    image: 'Aluminum Pans with Lid/aluminum-pans-w-plastic-lid.jpg',
    description: 'Rectangular foil trays with lid options for packed meals.',
    variants: [
      { sku: 'AFT-1100', label: '8.6x6.2x2in', detail: '1100ml' },
      { sku: 'AFT-700', label: '7.2x5.3x2in', detail: '700ml' },
    ],
  },
  {
    id: 'catering-aluminum-trays',
    name: 'Catering Aluminum Foil Trays',
    category: 'Aluminum Pans with Lid',
    image: 'Aluminum Pans with Lid/catering-aluminum-trays.jpg',
    description: 'Large foil trays for catering and party orders.',
    variants: [
      { sku: 'CAT-1750', label: '10x7.4x2.3in', detail: '1750ml' },
      { sku: 'CAT-4700', label: '10.63x14.75x2.76in', detail: '4700ml' },
      { sku: 'CAT-9700', label: '20.7x12.9x2.99in', detail: '9700ml' },
    ],
  },
  {
    id: 'round-aluminum-pans',
    name: 'Round Aluminum Pans',
    category: 'Aluminum Pans with Lid',
    image: 'Aluminum Pans with Lid/round-aluminum-pans-7-8-9in.jpg',
    description: 'Round aluminum pans in three serving sizes.',
    variants: [
      { sku: 'RAP-7', label: '7in' },
      { sku: 'RAP-8', label: '8in' },
      { sku: 'RAP-9', label: '9in' },
    ],
  },
  {
    id: 'loaf-pans',
    name: 'Loaf Pan with Lid',
    category: 'Aluminum Pans with Lid',
    image: 'Aluminum Pans with Lid/loaf-pan-with-lid.jpg',
    description: 'Loaf-style rectangular pans with matching lid sizes.',
    variants: [
      { sku: 'LOAF-450', label: '7x4x2in', detail: '450ml' },
      { sku: 'LOAF-550', label: '7.4x4.33x1.77in', detail: '550ml' },
      { sku: 'LOAF-670', label: '8x4x2.2in', detail: '670ml' },
      { sku: 'LOAF-900', label: '8.5x4.5x2.1in', detail: '900ml' },
    ],
  },
];

export const groupedSkus = new Set(productGroups.flatMap((group) => group.variants.map((variant) => variant.sku)));

const productImageBySku: Record<string, string> = {
  Spoon: 'Utensils/plastic-spoon-100s.jpg',
  Fork: 'Utensils/plastic-fork-100s.jpg',
  SmartSpoon: 'Utensils/plastic-spork.jpg',
  Chopsticks: 'Utensils/chopstick-wooden-bamboo.jpg',
  MTStraw: 'Utensils/pearl-straw.jpg',
  Styro2D: 'Styro/styro-meal-box-2division.jpg',
  Styro3D: 'Styro/styro-meal-box-spag.jpg',
  HCJ08: 'Sauce & Salad Cup, PeanutButterJar/salad-cup.jpg',
  HCJ05: 'Sauce & Salad Cup, PeanutButterJar/sauce-cup.jpg',
  PICE: 'Plastic SandoBags, Labos, Roll, Ice& IceCandy, Ziplocks and TakeAways/plastic-ice.jpg',
  BISO1: 'Paper Packaging Items/paper-meal-box.jpg',
  BurgerBox: 'Paper Packaging Items/burger-box.jpg',
  HotdogBox: 'Paper Packaging Items/hotdog-box.jpg',
  HotdogTray: 'Paper Packaging Items/hotdog-tray.jpg',
  KikiamTray: 'Paper Packaging Items/kikiam-tray.jpg',
  PaperPlate9: 'Paper Packaging Items/paper-plate-silver-laminated-9in.jpg',
  Napkin5x5: 'Paper Packaging Items/table-napkin-5x5in.jpg',
  RES90: 'Microwaveables/microwave-square.jpg',
  Gloves: 'Gloves/gloves-clear.jpg',
  Gloves8LK: 'Gloves/gloves-black.jpg',
  Clingwrap: 'Cling, Foil, BakingPaper, PlasticWrapBurger/clingwrap-12x20m.jpg',
  Foil: 'Cling, Foil, BakingPaper, PlasticWrapBurger/aluminum-foil-12inx8in.jpg',
  PPholder: 'Cling, Foil, BakingPaper, PlasticWrapBurger/baking-paper.jpg',
  BurgerWrap: 'Cling, Foil, BakingPaper, PlasticWrapBurger/burger-plastic-wrapper.jpg',
  PlasticTwine: 'BubbleWrap & Plastic Twine/plastic-twine-soft-straw.jpg',
  RE2320: 'Aluminum Pans with Lid/aluminum-square-pan-with-lid-1350ml-8x8x2inch.jpg',
};

export function getProductImage(product: ProductLike, fallbackAsset?: string) {
  if (product.image) return product.image;

  const productAsset = productImageBySku[product.sku];
  if (productAsset) return asset(productAsset);

  if (fallbackAsset) return asset(fallbackAsset);

  return undefined;
}

export function getGroupImage(group: ProductGroupDefinition) {
  return asset(group.image);
}

export function getVariantLabel(group: ProductGroupDefinition, sku: string) {
  return group.variants.find((variant) => variant.sku === sku);
}

export function createCatalogCards(products: ProductLike[]): CatalogCard[] {
  const productsBySku = new Map(products.map((product) => [product.sku, product]));
  const cards: CatalogCard[] = [];
  const usedProductIds = new Set<number>();

  for (const group of productGroups) {
    const groupProducts = group.variants
      .map((variant) => productsBySku.get(variant.sku))
      .filter((product): product is ProductLike => Boolean(product));

    if (groupProducts.length === 0) continue;

    groupProducts.forEach((product) => usedProductIds.add(product.id));
    const totalStock = groupProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0);

    cards.push({
      type: 'group',
      id: group.id,
      group,
      products: groupProducts,
      name: group.name,
      categoryName: group.category,
      description: group.description,
      image: getGroupImage(group),
      priceLabel: priceRangeLabel(groupProducts),
      stockLabel: stockLabel(totalStock),
      totalStock,
    });
  }

  for (const product of products) {
    if (usedProductIds.has(product.id) || groupedSkus.has(product.sku)) continue;

    const totalStock = Number(product.stock || 0);
    cards.push({
      type: 'direct',
      id: String(product.id),
      product,
      name: product.name,
      categoryName: product.category_name || product.category?.name || 'General',
      description: product.description || 'Quality plasticware product',
      image: getProductImage(product),
      priceLabel: peso(Number(product.price)),
      stockLabel: stockLabel(totalStock),
      totalStock,
    });
  }

  return cards;
}

export function peso(value: number) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

function priceRangeLabel(products: ProductLike[]) {
  const prices = products.map((product) => Number(product.price || 0));
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return peso(min);

  return `${peso(min)} - ${peso(max)}`;
}

function stockLabel(stock: number) {
  return stock > 0 ? `${stock} in stock` : 'Out of stock';
}
