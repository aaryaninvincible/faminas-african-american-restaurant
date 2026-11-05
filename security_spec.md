# Security Specification — Faminas African and Americans Restaurant

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every unmatched document path in Firestore is denied for both `read` and `write`.
2. **Admin Privilege Verification**: Admin status (`isAdmin()`) is never trusted from client-writable profile fields. It is verified via the bootstrapped owner email (`swaraysheku12@gmail.com` with `email_verified == true`) or existence of `/admins/$(request.auth.uid)`.
3. **Self-Assigned Role Prevention**: Customers creating a `/profiles/{userId}` document can only set `role == 'customer'` unless `isAdmin()` is true. During profile updates, `role`, `uid`, and `createdAt` are immutable for non-admins.
4. **Menu & Settings Integrity**: Only verified admins (`isAdmin()`) may create, update, or delete documents in `/categories`, `/menu_items`, `/food_images`, `/restaurant_settings`, `/delivery_zones`, and `/gallery_images`.
5. **PII Isolation**:
   - `/customers/{customerId}` is strictly isolated to `request.auth.uid == customerId || isAdmin()`.
   - `/orders/{orderId}` contains customer contact details and is strictly restricted to `resource.data.customerUid == request.auth.uid || isAdmin()`.
   - `/catering_enquiries/{enquiryId}` is restricted to `resource.data.customerUid == request.auth.uid || isAdmin()`.
6. **Master Gate for Order Items**: `/orders/{orderId}/order_items/{orderItemId}` verifies the parent `/orders/{orderId}` document via `get()` to ensure only the order owner or an admin can read or create order items, and that `orderId` matches the parent path.
7. **Terminal State Locking**: Once an `/orders/{orderId}` document reaches a terminal status (`'Completed'` or `'Cancelled'`), non-admin users cannot update it.
8. **Temporal Integrity**: Every `createdAt` and `updatedAt` timestamp must equal `request.time`.
9. **Path & Volumetric Guards**: Every target document ID is checked with `isValidId(id)` (`<= 128` chars, alphanumeric/hyphen/underscore) and every string/array has explicit `.size()` boundaries matching `firebase-blueprint.json`.

---

## 2. The "Dirty Dozen" Payloads

1. **Privilege Escalation on Profile Creation**: User `uid_attacker` creates `/profiles/uid_attacker` with `role: "admin"`. -> `PERMISSION_DENIED`
2. **Shadow Field Injection on Order Creation**: User creates `/orders/ord_1` with an extra field `"isPaidOverride": true`. -> `PERMISSION_DENIED`
3. **Unverified Admin Email Spoof**: User with `email: "swaraysheku12@gmail.com"` but `email_verified: false` attempts to update `/menu_items/item_1`. -> `PERMISSION_DENIED`
4. **Cross-User PII Read on Customers**: Authenticated user `uid_2` attempts `get(/customers/uid_1)`. -> `PERMISSION_DENIED`
5. **Blanket List Scraping on Orders**: Authenticated user `uid_2` executes an unconstrained `list` on `/orders` without filtering `customerUid == request.auth.uid`. -> `PERMISSION_DENIED`
6. **Unauthorized Menu Price Tampering**: Customer attempts to update `price: 0.01` on `/menu_items/jollof_rice`. -> `PERMISSION_DENIED`
7. **Order Status Shortcutting by Customer**: Customer attempts to update `/orders/ord_1` `status` from `"New Order"` to `"Completed"` or `"paymentStatus": "verified"`. -> `PERMISSION_DENIED`
8. **Terminal State Mutation**: Customer attempts to modify `specialInstructions` on an order whose status is already `"Completed"`. -> `PERMISSION_DENIED`
9. **Client Timestamp Forgery**: User creates `/orders/ord_1` with a forged past timestamp `createdAt` != `request.time`. -> `PERMISSION_DENIED`
10. **ID Poisoning Attack**: User creates a document with a 500-character or special-character ID `/orders/bad$id!`. -> `PERMISSION_DENIED`
11. **Value Poisoning on Whitelisted Key**: User updates `favouriteItemIds` on `/profiles/uid_1` with 200 items (exceeding max 50) or non-string element. -> `PERMISSION_DENIED`
12. **Orphaned Order Item Write**: User `uid_attacker` attempts to create `/orders/ord_victim/order_items/item_1` where parent order `ord_victim` belongs to `uid_victim`. -> `PERMISSION_DENIED`
