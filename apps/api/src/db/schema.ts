import { pgTable, uuid, text, timestamp, numeric, integer } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const contacts = pgTable('contacts', {
    id: uuid('id').primaryKey().defaultRandom(),
    fname: text('fname').notNull(),
    lname: text('lname').notNull(),
    email: text('email'),
    phone: text('phone'),
    title: text('title'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull().default('user'),
    contactId: uuid('contact_id').references(() => contacts.id).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userSessions = pgTable('user_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    sessionToken: text('session_token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const locations = pgTable('locations', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    name: text('name').notNull(),
    address: text('address'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const departments = pgTable('departments', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const costCategories = pgTable('cost_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    departmentId: uuid('department_id').references(() => departments.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const subCategories = pgTable('sub_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    costCategoryId: uuid('cost_category_id').references(() => costCategories.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const vendors = pgTable('vendors', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    contactId: uuid('contact_id').references(() => contacts.id),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    locationId: uuid('location_id').references(() => locations.id).notNull(),
    vendorId: uuid('vendor_id').references(() => vendors.id).notNull(),
    importedBy: uuid('imported_by').references(() => users.id).notNull(),
    importedAt: timestamp('imported_at').notNull().defaultNow(),
    invoiceNumber: text('invoice_number'),
    invoiceDate: timestamp('invoice_date'),
    rawFileUrl: text('raw_file_url'),
    status: text('status').notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const invoiceItems = pgTable('invoice_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
    subCategoryId: uuid('sub_category_id').references(() => subCategories.id),
    aiSuggestedSubCategoryId: uuid('ai_suggested_sub_category_id').references(() => subCategories.id),
    confirmedBy: uuid('confirmed_by').references(() => users.id),
    confirmedAt: timestamp('confirmed_at'),
    description: text('description'),
    quantity: numeric('quantity').notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const lineItemEdits = pgTable('line_item_edits', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceItemId: uuid('invoice_item_id').references(() => invoiceItems.id).notNull(),
    fieldName: text('field_name').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    editedBy: uuid('edited_by').references(() => users.id).notNull(),
    editedAt: timestamp('edited_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const appTokens = pgTable('app_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    token: text('token').notNull().unique(),
    type: text('type').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const itemCategoryMemory = pgTable('item_category_memory', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    normalizedDescription: text('normalized_description').notNull(),
    subCategoryId: uuid('sub_category_id').references(() => subCategories.id),
    confirmationCount: integer('confirmation_count').notNull().default(0),
    lastConfirmedAt: timestamp('last_confirmed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});