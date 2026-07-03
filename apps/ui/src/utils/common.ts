export interface Contact {
    id: string;
    fname: string;
    lname: string;
    email: string;
    phone: string;
    title?: string;
}

export const joinContactName = (contact: Partial<Contact>) => {
    return `${contact.fname} ${contact.lname}`;
};