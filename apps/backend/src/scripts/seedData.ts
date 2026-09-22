/**
 * ============================================================================
 * SEED DATA - Dataset demo embebido (única fuente de datos iniciales)
 * ============================================================================
 *
 * Este módulo contiene TODA la información que un proyecto necesita para
 * funcionar completo la primera vez que se conecta a una base vacía.
 * No existe ningún data.json ni mock: si la instancia de MongoDB está vacía,
 * el backend la puebla automáticamente con estos datos.
 *
 * orders y daily NO están aquí: se generan dinámicamente (relativos a hoy)
 * en seed.ts para que el dashboard tenga contenido fresco.
 *
 * NOTA: los _id son strings hex de 24 chars; seed.ts los convierte a ObjectId.
 */

export interface SeedDoc {
  _id: string;
  [key: string]: unknown;
}

export const SEED = {
  users: [
    {
      _id: 'a10000000000000000000001',
      email: 'admin@local.dev',
      name: 'Administrador',
      role: 'admin',
      active: true,
      createdAt: '2026-08-24T00:00:00.000Z',
    },
    {
      _id: 'a10000000000000000000002',
      email: 'supervisor@local.dev',
      name: 'Supervisor',
      role: 'admin',
      active: true,
      createdAt: '2026-08-24T00:00:00.000Z',
    },
  ] as SeedDoc[],

  categories: [
    { _id: 'b10000000000000000000001', name: 'Pizzas', icon: 'utensils', active: true, order: 1 },
    { _id: 'b10000000000000000000002', name: 'Empanadas', icon: 'beef', active: true, order: 2 },
    { _id: 'b10000000000000000000003', name: 'Hamburguesas', icon: 'sandwich', active: true, order: 3 },
    { _id: 'b10000000000000000000004', name: 'Bebidas', icon: 'cup-soda', active: true, order: 4 },
    { _id: 'b10000000000000000000005', name: 'Postres', icon: 'cake', active: true, order: 5 },
    { _id: 'b10000000000000000000006', name: 'Sándwiches', icon: 'bread', active: true, order: 6 },
    { _id: 'b10000000000000000000007', name: 'Combos', icon: 'gift', active: false, order: 7 },
  ] as SeedDoc[],

  addonCategories: [
    { _id: 'd20000000000000000000001', name: 'Extras', active: true },
    { _id: 'd20000000000000000000002', name: 'Salsas', active: true },
    { _id: 'd20000000000000000000003', name: 'Bebidas', active: true },
    { _id: 'd20000000000000000000004', name: 'Cocción', active: true },
  ] as SeedDoc[],

  addons: [
    { _id: 'd10000000000000000000001', name: 'Extra Muzzarella', price: 800, available: true, categories: ['d20000000000000000000001'] },
    { _id: 'd10000000000000000000002', name: 'Extra Cheddar', price: 700, available: true, categories: ['d20000000000000000000001'] },
    { _id: 'd10000000000000000000003', name: 'Champiñones', price: 800, available: true, categories: ['d20000000000000000000001'] },
    { _id: 'd10000000000000000000004', name: 'Bacon Crispy', price: 1000, available: true, categories: ['d20000000000000000000001'] },
    { _id: 'd10000000000000000000005', name: 'Salsa BBQ', price: 300, available: true, categories: ['d20000000000000000000002'] },
    { _id: 'd10000000000000000000006', name: 'Salsa Picante', price: 0, available: true, categories: ['d20000000000000000000002'] },
    { _id: 'd10000000000000000000007', name: 'Salsa Roquefort', price: 500, available: true, categories: ['d20000000000000000000002'] },
    { _id: 'd10000000000000000000008', name: 'Coca-Cola', price: 600, available: true, categories: ['d20000000000000000000003'] },
    { _id: 'd10000000000000000000009', name: 'Coca Zero', price: 600, available: true, categories: ['d20000000000000000000003'] },
    { _id: 'd1000000000000000000000a', name: 'Spright', price: 600, available: true, categories: ['d20000000000000000000003'] },
    { _id: 'd1000000000000000000000b', name: 'A pan pasado', price: 0, available: true, categories: ['d20000000000000000000004'] },
    { _id: 'd1000000000000000000000c', name: 'Hornalla a eléctrica', price: 0, available: true, categories: ['d20000000000000000000004'] },
    { _id: 'd1000000000000000000000d', name: 'Papas fritas extra', price: 900, available: true, categories: ['d20000000000000000000001'] },
  ] as SeedDoc[],

  products: [
    { _id: 'c10000000000000000000001', title: 'Pizza Muzzarella', description: 'Salsa de tomate, muzzarella derretida y aceitunas', price: 10500, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000001', available: true, featured: true, order: 1, addons: ['d10000000000000000000001', 'd10000000000000000000006'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000002', title: 'Pizza Napolitana', description: 'Tomate en rodajas, muzzarella y albahaca fresca', price: 11500, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000001', available: true, featured: false, order: 2, addons: ['d10000000000000000000001'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000003', title: 'Pizza Fugazzeta', description: 'Cebolla caramelizada y muzzarella', price: 12500, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000001', available: true, featured: false, order: 3, addons: ['d10000000000000000000001', 'd10000000000000000000004'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000004', title: 'Pizza de Pepperoni', description: 'Pepperoni importado, muzzarella y salsa especial', price: 13500, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000001', available: true, featured: true, order: 4, addons: ['d10000000000000000000004', 'd10000000000000000000007'], controlStock: false, stock: 0, promotionalLabel: 'Más pedida' },
    { _id: 'c10000000000000000000005', title: 'Calzone Fiamma', description: 'Masa rellena de jamón, muzzarella y salsa de tomate', price: 14500, image: 'https://images.unsplash.com/photo-1565299624947-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000001', available: true, featured: false, order: 5, addons: ['d10000000000000000000003', 'd10000000000000000000005'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000006', title: 'Pizza de Rúcula', description: 'Rúcula, jamón crudo y parmesano', price: 13000, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000001', available: true, featured: false, order: 6, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000007', title: 'Empanada de Carne', description: 'Carne cortada a cuchillo, cebolla y huevo duro', price: 900, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000002', available: true, featured: true, order: 1, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000008', title: 'Empanada de Jamón y Queso', description: 'Jamón cocido y muzzarella', price: 950, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000002', available: true, featured: false, order: 2, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000009', title: 'Empanada de Pollo', description: 'Pollo desmenuzado, verdeo y especias', price: 950, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000002', available: true, featured: false, order: 3, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c1000000000000000000000a', title: 'Docena de Empanadas', description: '12 empanadas surtidas a elección', price: 10800, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000002', available: true, featured: true, order: 4, addons: [], controlStock: true, stock: 12, promotionalLabel: 'Surtidas' },
    { _id: 'c1000000000000000000000b', title: 'Hamburguesa Clásica', description: 'Medallón de 150g, cheddar, lechuga y tomate', price: 9200, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000003', available: true, featured: true, order: 1, addons: ['d10000000000000000000004', 'd1000000000000000000000d'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c1000000000000000000000c', title: 'Hamburguesa Doble Cheddar', description: 'Doble medallón y doble cheddar, panceta crocante', price: 11500, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000003', available: true, featured: false, order: 2, addons: ['d10000000000000000000004', 'd1000000000000000000000d'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c1000000000000000000000d', title: 'Hamburguesa Veggie', description: 'Medallón de lentejas, rúcula y queso de cabra', price: 8800, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000003', available: true, featured: false, order: 3, addons: ['d1000000000000000000000d'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c1000000000000000000000e', title: 'Sándwich de Bondiola', description: 'Bondiola braseada, cebolla crispy y salsa bbq', price: 6800, image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000006', available: true, featured: true, order: 1, addons: ['d10000000000000000000005'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c1000000000000000000000f', title: 'Sándwich de Milanesa', description: 'Milanesa de carne, lechuga, tomate y mayonesa', price: 6200, image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000006', available: true, featured: false, order: 2, addons: ['d1000000000000000000000b'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000010', title: 'Coca-Cola 1.25L', description: 'Gaseosa cola 1.25 litros bien fría', price: 3000, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000004', available: true, featured: false, order: 1, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000011', title: 'Coca-Cola Zero 1.25L', description: 'Gaseosa sin azúcar 1.25 litros', price: 3000, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000004', available: true, featured: false, order: 2, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000012', title: 'Spright 1.25L', description: 'Gaseosa lima limón 1.25 litros', price: 3000, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000004', available: true, featured: false, order: 3, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000013', title: 'Limonada de Naranja', description: 'Naranja recién exprimida con hielo', price: 2000, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000004', available: true, featured: false, order: 4, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000014', title: 'Agua Mineral 500ml', description: 'Agua mineral sin gas', price: 1200, image: 'https://images.unsplash.com/photo-1616118132534-381148898bb4?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000004', available: true, featured: false, order: 5, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000015', title: 'Milo Helado', description: 'Batido de Milo con crema chantilly', price: 2500, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000004', available: true, featured: false, order: 6, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000016', title: 'Helado de Chocolate', description: 'Helado artesanal de chocolate, 2 bochas', price: 2500, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000005', available: true, featured: true, order: 1, addons: ['d10000000000000000000001'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000017', title: 'Flan con Dulce de Leche', description: 'Flan casero con dulce de leche y crema', price: 2000, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000005', available: true, featured: false, order: 2, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000018', title: 'Brownie con Helado', description: 'Brownie tibio, nueces y helado de vainilla', price: 2600, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000005', available: true, featured: false, order: 3, addons: ['d10000000000000000000001'], controlStock: false, stock: 0, promotionalLabel: '' },
    { _id: 'c10000000000000000000019', title: 'Combo Familiar', description: '2 Pizzas Muzzarella + 6 Empanadas + 2 Bebidas', price: 24500, image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000007', available: true, featured: true, order: 1, addons: [], controlStock: true, stock: 5, promotionalLabel: '' },
    { _id: 'c1000000000000000000001a', title: 'Combo Pareja', description: '1 Pizza grande + 4 Empanadas + 1 Bebida', price: 18500, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', category: 'b10000000000000000000007', available: true, featured: false, order: 2, addons: [], controlStock: false, stock: 0, promotionalLabel: '' },
  ] as SeedDoc[],

  coupons: [
    { _id: 'e20000000000000000000001', code: 'BIENVENIDO', discountType: 'percentage', discountValue: 10, active: true, validDays: [0, 1, 2, 3, 4, 5, 6], validPaymentMethods: ['cash', 'debito', 'credito', 'transferencia'] },
    { _id: 'e20000000000000000000002', code: 'FINDE10', discountType: 'percentage', discountValue: 10, active: true, validDays: [5, 6], validPaymentMethods: ['cash', 'debito', 'credito', 'transferencia'] },
    { _id: 'e20000000000000000000003', code: 'FIJO500', discountType: 'fixed', discountValue: 500, active: true, validDays: [0, 1, 2, 3, 4, 5, 6], validPaymentMethods: ['cash', 'debito'] },
    { _id: 'e20000000000000000000004', code: 'MARTES2X1', discountType: 'fixed', discountValue: 10500, active: true, validDays: [2], validPaymentMethods: ['cash', 'debito', 'transferencia'] },
    { _id: 'e20000000000000000000005', code: 'VENCIDO', discountType: 'percentage', discountValue: 25, active: false, validDays: [0, 1, 2, 3, 4, 5, 6], validPaymentMethods: ['cash', 'debito', 'credito', 'transferencia'] },
  ] as SeedDoc[],

  schedules: [
    {
      _id: 'f30000000000000000000001',
      timezone: 'America/Argentina/Buenos_Aires',
      days: [
        { day: 1, open: '11:00', close: '14:30', active: true },
        { day: 1, open: '19:00', close: '23:30', active: true },
        { day: 2, open: '11:00', close: '14:30', active: true },
        { day: 2, open: '19:00', close: '23:30', active: true },
        { day: 3, open: '11:00', close: '14:30', active: true },
        { day: 3, open: '19:00', close: '23:30', active: true },
        { day: 4, open: '11:00', close: '14:30', active: true },
        { day: 4, open: '19:00', close: '23:30', active: true },
        { day: 5, open: '11:00', close: '14:30', active: true },
        { day: 5, open: '19:00', close: '00:30', active: true },
        { day: 6, open: '11:00', close: '00:30', active: true },
        { day: 0, open: '11:00', close: '23:00', active: true },
      ],
      emergencyClosed: false,
      bannerUrl: null,
    },
  ] as SeedDoc[],

  deliveryRanges: [
    { _id: 'f40000000000000000000001', minKm: 0, maxKm: 2, price: 300 },
    { _id: 'f40000000000000000000002', minKm: 2.01, maxKm: 5, price: 500 },
    { _id: 'f40000000000000000000003', minKm: 5.01, maxKm: 8, price: 800 },
    { _id: 'f40000000000000000000004', minKm: 8.01, maxKm: 12, price: 1200 },
  ] as SeedDoc[],

  gallery: [
    { _id: 'f20000000000000000000001', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', alt: 'Interior del local', order: 1 },
    { _id: 'f20000000000000000000002', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', alt: 'Nuestro salón principal', order: 2 },
    { _id: 'f20000000000000000000003', url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80', alt: 'Mesa lista para servir', order: 3 },
    { _id: 'f20000000000000000000004', url: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80', alt: 'Presentación de platos', order: 4 },
    { _id: 'f20000000000000000000005', url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80', alt: 'Nuestro chef en acción', order: 5 },
    { _id: 'f20000000000000000000006', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80', alt: 'Plato servido al momento', order: 6 },
    { _id: 'f20000000000000000000007', url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80', alt: 'Mano de obra calificada', order: 7 },
    { _id: 'f20000000000000000000008', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80', alt: 'Nuestras elaboraciones', order: 8 },
  ] as SeedDoc[],
};