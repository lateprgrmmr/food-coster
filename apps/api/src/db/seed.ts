import bcrypt from 'bcrypt';
import db from './index.js';
import {
    organizations, users, contacts, locations, departments,
    costCategories, subCategories, vendors, invoices, invoiceItems,
} from './schema.js';

const org = await db.insert(organizations).values({ name: 'The Rusty Spoon' }).returning().then(r => r[0]!);

const contact = await db.insert(contacts).values({
    fname: 'Sam',
    lname: 'Rivera',
    email: 'demo@rustyspoon.com',
    phone: '123-456-7890',
}).returning().then(r => r[0]!);

const user = await db.insert(users).values({
    organizationId: org.id,
    email: 'demo@rustyspoon.com',
    password: await bcrypt.hash('password', 10),
    contactId: contact.id,
}).returning().then(r => r[0]!);


const location = await db.insert(locations).values({
    organizationId: org.id,
    name: 'Main Street',
    address: '123 Main St, Springfield, IL 62701',
}).returning().then(r => r[0]!);

const [kitchen, bar] = await db.insert(departments).values([
    { organizationId: org.id, name: 'Kitchen' },
    { organizationId: org.id, name: 'Bar' },
]).returning();

const [foodCost, kitchenSupplies, beverageCost] = await db.insert(costCategories).values([
    { departmentId: kitchen!.id, name: 'Food Cost' },
    { departmentId: kitchen!.id, name: 'Kitchen Supplies' },
    { departmentId: bar!.id, name: 'Beverage Cost' },
]).returning();

const [produce, meat, dairy, dryGoods, disposables, beer, spirits, nonAlc] = await db.insert(subCategories).values([
    { costCategoryId: foodCost!.id, name: 'Produce' },
    { costCategoryId: foodCost!.id, name: 'Meat & Seafood' },
    { costCategoryId: foodCost!.id, name: 'Dairy & Eggs' },
    { costCategoryId: foodCost!.id, name: 'Dry Goods & Pantry' },
    { costCategoryId: kitchenSupplies!.id, name: 'Disposables & Cleaning' },
    { costCategoryId: beverageCost!.id, name: 'Beer & Wine' },
    { costCategoryId: beverageCost!.id, name: 'Spirits' },
    { costCategoryId: beverageCost!.id, name: 'Non-Alcoholic Beverages' },
]).returning();

const [syscoContact, glazersContact] = await db.insert(contacts).values([
    { fname: 'Marcus', lname: 'Chen', email: 'marcus.chen@sysco.com', phone: '312-555-0142', title: 'Account Manager' },
    { fname: 'Priya', lname: 'Nair', email: 'priya.nair@sglazers.com', phone: '312-555-0199', title: 'Sales Rep' },
]).returning();


const [sysco, usfoods, localProduce, southernGlazers] = await db.insert(vendors).values([
    { organizationId: org.id, name: 'Sysco', description: 'Broadline food distributor', contactId: syscoContact!.id },
    { organizationId: org.id, name: 'US Foods', description: 'Broadline food distributor' },
    { organizationId: org.id, name: 'Local Produce Co.', description: 'Local farm-direct produce' },
    { organizationId: org.id, name: "Southern Glazer's", description: 'Beverage distributor', contactId: glazersContact!.id },
]).returning();


// Invoice 1: Sysco weekly food order
const inv1 = await db.insert(invoices).values({
    locationId: location.id,
    vendorId: sysco!.id,
    importedBy: user.id,
    invoiceNumber: 'SYS-2024-00183',
    invoiceDate: new Date('2024-04-01'),
    status: 'pending',
}).returning().then(r => r[0]!);

await db.insert(invoiceItems).values([
    { invoiceId: inv1.id, subCategoryId: meat!.id,   description: 'Chicken Breast, Boneless Skinless',  quantity: '40',  unitPrice: '3.89',  totalPrice: '155.60' },
    { invoiceId: inv1.id, subCategoryId: meat!.id,   description: 'Ground Beef 80/20',                  quantity: '20',  unitPrice: '4.25',  totalPrice: '85.00' },
    { invoiceId: inv1.id, subCategoryId: meat!.id,   description: 'Atlantic Salmon Portions',            quantity: '10',  unitPrice: '12.99', totalPrice: '129.90' },
    { invoiceId: inv1.id, subCategoryId: produce!.id, description: 'Iceberg Lettuce, 24ct Case',         quantity: '1',   unitPrice: '18.50', totalPrice: '18.50' },
    { invoiceId: inv1.id, subCategoryId: produce!.id, description: 'Roma Tomatoes',                      quantity: '25',  unitPrice: '1.89',  totalPrice: '47.25' },
    { invoiceId: inv1.id, subCategoryId: produce!.id, description: 'Russet Potatoes',                    quantity: '50',  unitPrice: '0.65',  totalPrice: '32.50' },
    { invoiceId: inv1.id, subCategoryId: dairy!.id,  description: 'Heavy Cream',                         quantity: '6',   unitPrice: '4.25',  totalPrice: '25.50' },
    { invoiceId: inv1.id, subCategoryId: dairy!.id,  description: 'Shredded Cheddar',                    quantity: '5',   unitPrice: '5.99',  totalPrice: '29.95' },
    { invoiceId: inv1.id, subCategoryId: dryGoods!.id, description: 'All Purpose Flour',                 quantity: '50',  unitPrice: '0.45',  totalPrice: '22.50' },
    { invoiceId: inv1.id, subCategoryId: dryGoods!.id, description: 'Olive Oil Extra Virgin, 1 gal',     quantity: '4',   unitPrice: '18.99', totalPrice: '75.96' },
]);

// Invoice 2: US Foods weekly food order
const inv2 = await db.insert(invoices).values({
    locationId: location.id,
    vendorId: usfoods!.id,
    importedBy: user.id,
    invoiceNumber: 'USF-449012',
    invoiceDate: new Date('2024-04-03'),
    status: 'pending',
}).returning().then(r => r[0]!);

await db.insert(invoiceItems).values([
    { invoiceId: inv2.id, subCategoryId: meat!.id,    description: 'Pork Tenderloin',                    quantity: '15',  unitPrice: '5.49',  totalPrice: '82.35' },
    { invoiceId: inv2.id, subCategoryId: meat!.id,    description: 'Shrimp 16/20, Peeled & Deveined',    quantity: '10',  unitPrice: '14.99', totalPrice: '149.90' },
    { invoiceId: inv2.id, subCategoryId: produce!.id, description: 'Romaine Hearts, 24ct Case',           quantity: '1',   unitPrice: '22.50', totalPrice: '22.50' },
    { invoiceId: inv2.id, subCategoryId: produce!.id, description: 'Cherry Tomatoes, 1pt',                quantity: '12',  unitPrice: '2.99',  totalPrice: '35.88' },
    { invoiceId: inv2.id, subCategoryId: dairy!.id,   description: 'Butter, Unsalted',                    quantity: '36',  unitPrice: '3.25',  totalPrice: '117.00' },
    { invoiceId: inv2.id, subCategoryId: dairy!.id,   description: 'Whole Milk, 1 gal',                   quantity: '4',   unitPrice: '4.99',  totalPrice: '19.96' },
    { invoiceId: inv2.id, subCategoryId: dryGoods!.id, description: 'Penne Pasta',                        quantity: '20',  unitPrice: '1.89',  totalPrice: '37.80' },
    { invoiceId: inv2.id, subCategoryId: dryGoods!.id, description: 'Panko Breadcrumbs',                  quantity: '10',  unitPrice: '2.45',  totalPrice: '24.50' },
    { invoiceId: inv2.id, subCategoryId: dryGoods!.id, description: 'Canola Oil, 1 gal',                  quantity: '6',   unitPrice: '12.99', totalPrice: '77.94' },
    { invoiceId: inv2.id, subCategoryId: dryGoods!.id, description: 'Kosher Salt',                        quantity: '25',  unitPrice: '0.89',  totalPrice: '22.25' },
]);

// Invoice 3: Local Produce Co.
const inv3 = await db.insert(invoices).values({
    locationId: location.id,
    vendorId: localProduce!.id,
    importedBy: user.id,
    invoiceNumber: 'LPC-0412',
    invoiceDate: new Date('2024-04-05'),
    status: 'pending',
}).returning().then(r => r[0]!);

await db.insert(invoiceItems).values([
    { invoiceId: inv3.id, subCategoryId: produce!.id, description: 'Heirloom Tomatoes',   quantity: '10', unitPrice: '4.50',  totalPrice: '45.00' },
    { invoiceId: inv3.id, subCategoryId: produce!.id, description: 'Fresh Basil',          quantity: '2',  unitPrice: '12.00', totalPrice: '24.00' },
    { invoiceId: inv3.id, subCategoryId: produce!.id, description: 'Baby Arugula',         quantity: '5',  unitPrice: '8.99',  totalPrice: '44.95' },
    { invoiceId: inv3.id, subCategoryId: produce!.id, description: 'Yellow Onions',        quantity: '50', unitPrice: '0.49',  totalPrice: '24.50' },
    { invoiceId: inv3.id, subCategoryId: produce!.id, description: 'Garlic',               quantity: '10', unitPrice: '3.99',  totalPrice: '39.90' },
    { invoiceId: inv3.id, subCategoryId: produce!.id, description: 'Jalapeños',            quantity: '5',  unitPrice: '2.99',  totalPrice: '14.95' },
    { invoiceId: inv3.id, subCategoryId: produce!.id, description: 'Lemons, 113ct Case',   quantity: '1',  unitPrice: '28.00', totalPrice: '28.00' },
    { invoiceId: inv3.id, subCategoryId: produce!.id, description: 'Fresh Thyme',          quantity: '1',  unitPrice: '15.00', totalPrice: '15.00' },
]);

// Invoice 4: Southern Glazer's beverage order
const inv4 = await db.insert(invoices).values({
    locationId: location.id,
    vendorId: southernGlazers!.id,
    importedBy: user.id,
    invoiceNumber: 'SG-88204',
    invoiceDate: new Date('2024-04-02'),
    status: 'pending',
}).returning().then(r => r[0]!);

await db.insert(invoiceItems).values([
    { invoiceId: inv4.id, subCategoryId: spirits!.id, description: "Tito's Handmade Vodka 750ml",     quantity: '12', unitPrice: '18.99', totalPrice: '227.88' },
    { invoiceId: inv4.id, subCategoryId: spirits!.id, description: 'Tanqueray London Dry Gin 750ml',  quantity: '6',  unitPrice: '24.99', totalPrice: '149.94' },
    { invoiceId: inv4.id, subCategoryId: spirits!.id, description: 'Woodford Reserve Bourbon 750ml',  quantity: '6',  unitPrice: '29.99', totalPrice: '179.94' },
    { invoiceId: inv4.id, subCategoryId: beer!.id,    description: 'Modelo Especial, 24-pk',           quantity: '4',  unitPrice: '32.99', totalPrice: '131.96' },
    { invoiceId: inv4.id, subCategoryId: beer!.id,    description: 'Stella Artois, 24-pk',             quantity: '3',  unitPrice: '35.99', totalPrice: '107.97' },
    { invoiceId: inv4.id, subCategoryId: beer!.id,    description: 'House Chardonnay 750ml',           quantity: '12', unitPrice: '8.99',  totalPrice: '107.88' },
    { invoiceId: inv4.id, subCategoryId: beer!.id,    description: 'House Cabernet 750ml',             quantity: '12', unitPrice: '9.99',  totalPrice: '119.88' },
    { invoiceId: inv4.id, subCategoryId: nonAlc!.id,  description: 'Coca-Cola Syrup, 5 gal',           quantity: '2',  unitPrice: '89.99', totalPrice: '179.98' },
    { invoiceId: inv4.id, subCategoryId: nonAlc!.id,  description: 'San Pellegrino Sparkling, 24-pk',  quantity: '2',  unitPrice: '28.99', totalPrice: '57.98' },
]);

  // --- Second org: demonstrates cross-org super user visibility ---
  const org2 = await db.insert(organizations).values({ name: 'Blue Harbor Cafe' }).returning().then(r => r[0]!);

  const contact2 = await db.insert(contacts).values({
    fname: 'Jordan',
    lname: 'Lee',
    email: 'demo@blueharbor.com',
    phone: '123-456-7890',
}).returning().then(r => r[0]!);

const user2 = await db.insert(users).values({
    organizationId: org2.id,
    email: 'demo@blueharbor.com',
    password: await bcrypt.hash('password', 10),
    contactId: contact2.id,
}).returning().then(r => r[0]!);

  const location2 = await db.insert(locations).values({
      organizationId: org2.id,
      name: 'Harborfront',
      address: '88 Dock St, Portland, ME 04101',
  }).returning().then(r => r[0]!);

  const [coastal] = await db.insert(vendors).values([
      { organizationId: org2.id, name: 'Coastal Seafood Co.', description: 'Local seafood supplier' },
  ]).returning();

  const inv5 = await db.insert(invoices).values({
      locationId: location2.id,
      vendorId: coastal!.id,
      importedBy: user2.id,
      invoiceNumber: 'CSC-1099',
      invoiceDate: new Date('2024-04-04'),
      status: 'pending',
  }).returning().then(r => r[0]!);
  
  await db.insert(invoiceItems).values([
      { invoiceId: inv5.id, description: 'Maine Lobster, live',  quantity: '20', unitPrice: '11.50', totalPrice: '230.00' },
      { invoiceId: inv5.id, description: 'Day-boat Scallops',    quantity: '15', unitPrice: '18.99', totalPrice: '284.85' },
  ]);
  
  // --- Platform super user: can see invoices across ALL orgs ---
  const platformOrg = await db.insert(organizations).values({ name: 'FoodCoster Platform' }).returning().then(r => r[0]!);

  const adminContact = await db.insert(contacts).values({
    fname: 'Alex',
    lname: 'Admin',
    email: 'admin@foodcoster.com',
    phone: '123-456-7890',
}).returning().then(r => r[0]!);

await db.insert(users).values({
    organizationId: platformOrg.id,
    email: 'admin@foodcoster.com',
    password: await bcrypt.hash('password', 10),
    role: 'superuser',
    contactId: adminContact.id,
});


console.log('Seeded successfully.');
console.log(`  Org:      ${org.name}`);
console.log(`  Login:    demo@rustyspoon.com / password`);
console.log(`  Invoices: 4 (Sysco, US Foods, Local Produce Co., Southern Glazer's)`);
console.log(`  Org 2:    Blue Harbor Cafe — demo@blueharbor.com / password`);
console.log(`  Admin:    admin@foodcoster.com / password (superuser, sees all orgs)`);
process.exit(0);
