'use strict';

/** Synthetic sector packs only — not Saqr/Rakan live catalogs or prices. */

module.exports = {
  wholesale_produce: {
    label: 'Wholesale produce (synthetic)',
    companyName: 'Demo Produce Desk',
    currency: 'JOD',
    taxBps: 0,
    discountBps: 0,
    requireDestination: true,
    destinations: [
      { match: 'عمان', label: 'Amman' },
      { match: 'amman', label: 'Amman' },
      { match: 'دبي', label: 'Dubai' }
    ],
    products: [
      {
        id: 'barhi',
        label: 'Barhi dates',
        family: 'dates',
        aliases: ['برحي', 'barhi'],
        complete: true,
        requiredAttrs: ['grade'],
        attrHints: [{ key: 'grade', value: 'اصفر' }, { key: 'grade', value: 'yellow' }]
      },
      {
        id: 'cucumber',
        label: 'Cucumber',
        family: 'vegetable',
        aliases: ['خيار', 'cucumber'],
        complete: true,
        requiredAttrs: [],
        attrHints: [{ key: 'pack', value: 'كرتون' }]
      },
      {
        id: 'dates_generic',
        label: 'Dates (unspecified)',
        family: 'dates',
        aliases: ['تمور', 'dates'],
        complete: false,
        requiredAttrs: ['variety']
      }
    ],
    priceBook: [
      { productId: 'cucumber', marketMin: '0.250', marketMax: '0.450' },
      { productId: 'barhi', marketMin: '1.200', marketMax: '1.800' }
    ]
  },

  electronic_components: {
    label: 'Electronic components (synthetic)',
    companyName: 'Demo Components Desk',
    requireDestination: false,
    destinations: [],
    products: [
      {
        id: 'esp32',
        label: 'ESP32 module',
        aliases: ['esp32', 'اي اس بي'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      },
      {
        id: 'relay',
        label: '5V relay',
        aliases: ['relay', 'ريليه', 'ريليه 5'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      }
    ],
    priceBook: [
      { productId: 'esp32', marketMin: '4.000', marketMax: '6.500' },
      { productId: 'relay', marketMin: '0.800', marketMax: '1.200' }
    ],
    quantityPatterns: [
      { re: /(\d+(?:[.,]\d+)?)\s*(pcs?|قطعه|قطعة|units?)/i, unit: 'unit' }
    ]
  },

  clinic_reception: {
    label: 'Clinic reception (synthetic)',
    companyName: 'Demo Clinic Desk',
    administrativeOnly: true,
    currency: 'JOD',
    requireDestination: false,
    products: [
      {
        id: 'gp_visit',
        label: 'GP visit',
        aliases: ['كشف', 'gp', 'doctor visit', 'موعد كشف'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      },
      {
        id: 'followup',
        label: 'Follow-up visit',
        aliases: ['متابعه', 'متابعة', 'follow-up', 'followup'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      }
    ],
    priceBook: [{ productId: 'gp_visit', marketMin: '20.000', marketMax: '35.000' }],
    quantityPatterns: [{ re: /(\d+(?:[.,]\d+)?)\s*(موعد|جلسه|جلسة|visits?)/i, unit: 'visit' }]
  },

  pharmacy_inquiries: {
    label: 'Pharmacy inquiries (synthetic)',
    companyName: 'Demo Pharmacy Desk',
    administrativeOnly: true,
    currency: 'JOD',
    requireDestination: false,
    products: [
      {
        id: 'otc_vitc',
        label: 'Vitamin C OTC',
        aliases: ['فيتامين سي', 'vitamin c', 'vit c'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      },
      {
        id: 'otc_paracetamol',
        label: 'Paracetamol OTC',
        aliases: ['باراسيتامول', 'paracetamol', 'بنادول'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      }
    ],
    priceBook: [
      { productId: 'otc_vitc', marketMin: '2.500', marketMax: '4.000' },
      { productId: 'otc_paracetamol', marketMin: '0.500', marketMax: '1.200' }
    ],
    quantityPatterns: [{ re: /(\d+(?:[.,]\d+)?)\s*(علبه|علبة|box(?:es)?|pcs?)/i, unit: 'box' }]
  },

  cctv_installation: {
    label: 'CCTV installation (synthetic)',
    companyName: 'Demo CCTV Desk',
    requireDestination: true,
    destinations: [
      { match: 'عمان', label: 'Amman' },
      { match: 'amman', label: 'Amman' },
      { match: 'zarqa', label: 'Zarqa' },
      { match: 'الزرقاء', label: 'Zarqa' }
    ],
    products: [
      {
        id: 'cam_4mp',
        label: '4MP camera install',
        aliases: ['كاميرا 4', '4mp', 'camera'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      },
      {
        id: 'nvr_8ch',
        label: '8ch NVR',
        aliases: ['nvr', 'مسجل'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      }
    ],
    priceBook: [
      { productId: 'cam_4mp', marketMin: '45.000', marketMax: '75.000' },
      { productId: 'nvr_8ch', marketMin: '120.000', marketMax: '180.000' }
    ],
    quantityPatterns: [
      { re: /(\d+(?:[.,]\d+)?)\s*(كاميرا|cameras?)/i, unit: 'camera' },
      { re: /(\d+(?:[.,]\d+)?)\s*(pcs?|units?|قطعه|قطعة)/i, unit: 'unit' }
    ]
  },

  general_business_services: {
    label: 'General business services (synthetic)',
    companyName: 'Demo Services Desk',
    requireDestination: false,
    products: [
      {
        id: 'consult_hour',
        label: 'Consulting hour',
        aliases: ['استشاره', 'استشارة', 'consulting', 'consultation'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      },
      {
        id: 'retainer',
        label: 'Monthly retainer',
        aliases: ['retainer', 'اشتراك شهري'],
        complete: true,
        requiredAttrs: [],
        attrHints: []
      }
    ],
    priceBook: [{ productId: 'consult_hour', marketMin: '50.000', marketMax: '120.000' }],
    quantityPatterns: [
      { re: /(\d+(?:[.,]\d+)?)\s*(hours?|ساعه|ساعة)/i, unit: 'hour' },
      { re: /(\d+(?:[.,]\d+)?)\s*(pcs?|units?)/i, unit: 'unit' }
    ]
  }
};
