import type { CollectionData, Product } from '@/lib/types';

type ProductRecord = Record<string, Product>;
type CollectionRecord = Record<string, CollectionData>;

const clone = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const fallbackProducts: ProductRecord = {
  'innovation-biological-microscope': {
    id: 'gid://fallback/Product/innovation-biological-microscope',
    title: 'Innovation Biological Microscope',
    handle: 'innovation-biological-microscope',
    descriptionHtml:
      '<p>The Innovation Biological Microscope delivers research-grade clarity with infinity-corrected optics, smooth mechanical controls, and LED illumination tuned for daily lab use.</p><ul><li>Infinity plan optics with crisp, flat field imaging</li><li>Coaxial fine/coarse focus with adjustable tension stop</li><li>LED illumination with variable intensity control</li><li>Durable mechanical stage with smooth X-Y travel</li><li>Ergonomic Seidentopf head designed for extended sessions</li></ul>',
    tags: ['Microscopes', 'Clinical'],
    featuredImage: {
      url: '/images/default-microscope.jpg',
      altText: 'Innovation Biological Microscope',
    },
    images: {
      edges: [
        {
          node: {
            url: '/images/default-microscope.jpg',
            altText: 'Innovation Biological Microscope',
          },
        },
        {
          node: {
            url: '/placeholders/product1.jpg',
            altText: 'Innovation Biological Microscope side profile',
          },
        },
      ],
    },
    priceRange: {
      minVariantPrice: {
        amount: '1606.38',
        currencyCode: 'USD',
      },
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://fallback/Variant/innovation-biological-microscope-default',
            title: 'Standard Kit',
            price: {
              amount: '1606.38',
              currencyCode: 'USD',
            },
            availableForSale: true,
          },
        },
      ],
    },
    collections: {
      edges: [
        {
          node: {
            id: 'gid://fallback/Collection/microscopes',
            title: 'Microscopes',
            handle: 'microscopes',
          },
        },
        {
          node: {
            id: 'gid://fallback/Collection/featured-products',
            title: 'Featured Products',
            handle: 'featured-products',
          },
        },
      ],
    },
    metafields: [
      {
        namespace: 'custom',
        key: 'brand',
        value: 'Lab Essentials',
        type: 'single_line_text_field',
      },
      {
        namespace: 'custom',
        key: 'equipment_category',
        value: 'Microscopes',
        type: 'single_line_text_field',
      },
      {
        namespace: 'custom',
        key: 'features',
        value: JSON.stringify([
          'Infinity-corrected plan achromatic optics for crisp imaging',
          'Energy-efficient 3W LED illumination with adjustable output',
          'Ergonomic Seidentopf head with a 30-degree incline and full rotation',
          'Precision mechanical stage with smooth X/Y travel controls',
          'Coaxial fine and coarse focus with adjustable tension stop',
          'Optional trinocular head for camera-ready digital workflows',
        ]),
        type: 'json',
      },
      {
        namespace: 'custom',
        key: 'applications',
        value: JSON.stringify([
          'Clinical diagnostics and cytology',
          'Teaching and training laboratories',
          'Biological and veterinary sample examination',
          'General research requiring brightfield work',
        ]),
        type: 'json',
      },
    ],
  },
  'zipcombo-centrifuge': {
    id: 'gid://fallback/Product/zipcombo-centrifuge',
    title: 'ZipCombo Clinical Centrifuge',
    handle: 'zipcombo-centrifuge',
    descriptionHtml:
      '<p>The ZipCombo Clinical Centrifuge pairs a brushless motor with preset programs so labs can process blood, urine, and PCR tubes without swapping rotors.</p><ul><li>Dual 12-place swing-out and fixed-angle rotor support</li><li>Brushless DC motor for quiet, maintenance-free operation</li><li>Digital speed control from 500 to 6000 RPM</li><li>Compact footprint fits busy benches and mobile carts</li><li>Safety lock lid with imbalance detection</li></ul>',
    tags: ['Centrifuges', 'Clinical'],
    featuredImage: {
      url: '/images/default-centrifuge.jpg',
      altText: 'ZipCombo Clinical Centrifuge',
    },
    images: {
      edges: [
        {
          node: {
            url: '/images/default-centrifuge.jpg',
            altText: 'ZipCombo Clinical Centrifuge',
          },
        },
        {
          node: {
            url: '/placeholders/product2.jpg',
            altText: 'ZipCombo Centrifuge rotor detail',
          },
        },
      ],
    },
    priceRange: {
      minVariantPrice: {
        amount: '1899.00',
        currencyCode: 'USD',
      },
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://fallback/Variant/zipcombo-centrifuge-default',
            title: 'Standard Kit',
            price: {
              amount: '1899.00',
              currencyCode: 'USD',
            },
            availableForSale: true,
          },
        },
      ],
    },
    collections: {
      edges: [
        {
          node: {
            id: 'gid://fallback/Collection/centrifuges',
            title: 'Centrifuges',
            handle: 'centrifuges',
          },
        },
        {
          node: {
            id: 'gid://fallback/Collection/best-sellers',
            title: 'Best Sellers',
            handle: 'best-sellers',
          },
        },
      ],
    },
    metafields: [
      {
        namespace: 'custom',
        key: 'brand',
        value: 'Lab Essentials',
        type: 'single_line_text_field',
      },
      {
        namespace: 'custom',
        key: 'equipment_category',
        value: 'Centrifuges',
        type: 'single_line_text_field',
      },
      {
        namespace: 'custom',
        key: 'features',
        value: JSON.stringify([
          'Supports both 12-place swing-out and fixed-angle rotors',
          'Brushless DC motor delivers quiet, maintenance-free use',
          'Digital presets for blood, urine, and PCR workflows',
          'Compact footprint with vibration-dampening feet',
          'Auto-balancing sensors and safety interlock lid',
        ]),
        type: 'json',
      },
      {
        namespace: 'custom',
        key: 'applications',
        value: JSON.stringify([
          'Clinical sample preparation',
          'STAT labs needing rapid turnaround',
          'PCR and molecular workflows',
          'On-site diagnostics and mobile clinics',
        ]),
        type: 'json',
      },
    ],
  },
};

const fallbackCollections: CollectionRecord = {
  microscopes: {
    id: 'gid://fallback/Collection/microscopes',
    title: 'Microscopes',
    handle: 'microscopes',
    description:
      'Precision microscopes for clinical, teaching, and research environments, all calibrated and supported by Lab Essentials.',
    image: {
      url: '/images/default-microscope.jpg',
      altText: 'Microscope collection',
    },
    products: {
      edges: [
        { node: fallbackProducts['innovation-biological-microscope'] },
      ],
    },
  },
  centrifuges: {
    id: 'gid://fallback/Collection/centrifuges',
    title: 'Centrifuges',
    handle: 'centrifuges',
    description:
      'Clinical centrifuges engineered for reliable sample separation with quiet, brushless motors and smart safety controls.',
    image: {
      url: '/images/default-centrifuge.jpg',
      altText: 'Centrifuge collection',
    },
    products: {
      edges: [{ node: fallbackProducts['zipcombo-centrifuge'] }],
    },
  },
  'featured-products': {
    id: 'gid://fallback/Collection/featured-products',
    title: 'Featured Products',
    handle: 'featured-products',
    description:
      'Editor-curated picks that represent our top-performing lab instruments.',
    image: {
      url: '/placeholders/collection1.jpg',
      altText: 'Featured lab products',
    },
    products: {
      edges: [
        { node: fallbackProducts['innovation-biological-microscope'] },
        { node: fallbackProducts['zipcombo-centrifuge'] },
      ],
    },
  },
  'best-sellers': {
    id: 'gid://fallback/Collection/best-sellers',
    title: 'Best Sellers',
    handle: 'best-sellers',
    description:
      'Customer favorites chosen for reliability, throughput, and day-to-day efficiency.',
    image: {
      url: '/placeholders/collection2.jpg',
      altText: 'Best selling lab equipment',
    },
    products: {
      edges: [
        { node: fallbackProducts['zipcombo-centrifuge'] },
        { node: fallbackProducts['innovation-biological-microscope'] },
      ],
    },
  },
};

export function getFallbackProduct(handle: string): Product | null {
  const product = fallbackProducts[handle];
  if (!product) {
    return null;
  }
  return clone(product);
}

export function getFallbackCollection(handle: string): CollectionData | null {
  const collection = fallbackCollections[handle];
  if (!collection) {
    return null;
  }
  return clone(collection);
}

export function getFallbackCollectionHandles(): string[] {
  return Object.keys(fallbackCollections);
}
