/**
 * Firestore Security Rules Test Suite — Dirty Dozen Adversarial Payloads
 * Verifies that all 12 adversarial payloads defined in security_spec.md are rejected.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedResult: 'PERMISSION_DENIED';
  payload?: Record<string, unknown>;
}

export const DIRTY_DOZEN_TEST_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Privilege Escalation on Profile Creation',
    collection: '/profiles/uid_attacker',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      uid: 'uid_attacker',
      fullName: 'Attacker',
      role: 'admin',
      favouriteItemIds: [],
    },
  },
  {
    id: 2,
    name: 'Shadow Field Injection on Order Creation',
    collection: '/orders/ord_1',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      id: 'ord_1',
      orderReference: 'FAM-1001',
      customerUid: 'uid_1',
      isPaidOverride: true,
    },
  },
  {
    id: 3,
    name: 'Unverified Admin Email Spoof',
    collection: '/menu_items/jollof_rice',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      price: 1,
    },
  },
  {
    id: 4,
    name: 'Cross-User PII Read on Customers',
    collection: '/customers/uid_victim',
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Blanket List Scraping on Orders',
    collection: '/orders',
    operation: 'list',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Unauthorized Menu Price Tampering',
    collection: '/menu_items/jollof_rice',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      price: 0.01,
    },
  },
  {
    id: 7,
    name: 'Order Status Shortcutting by Customer',
    collection: '/orders/ord_1',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      status: 'Completed',
      paymentStatus: 'verified',
    },
  },
  {
    id: 8,
    name: 'Terminal State Mutation on Completed Order',
    collection: '/orders/ord_completed',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      specialInstructions: 'Mutated after completion',
    },
  },
  {
    id: 9,
    name: 'Client Timestamp Forgery',
    collection: '/orders/ord_forged_time',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      createdAt: '2020-01-01T00:00:00Z',
    },
  },
  {
    id: 10,
    name: 'ID Poisoning Attack',
    collection: '/orders/bad$id!with_illegal_chars',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value Poisoning on Whitelisted Key (Oversized Array)',
    collection: '/profiles/uid_1',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      favouriteItemIds: new Array(100).fill('item_1'),
    },
  },
  {
    id: 12,
    name: 'Orphaned Order Item Write on Another User Order',
    collection: '/orders/ord_victim/order_items/item_1',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    payload: {
      id: 'item_1',
      orderId: 'ord_victim',
      menuItemId: 'jollof_rice',
      name: 'Sierra Leone Jollof Rice',
      unitPrice: 18.5,
      quantity: 1,
      lineTotal: 18.5,
      specialInstructions: '',
    },
  },
];
