import { Contacts } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  const contacts = await Contacts.find();
  return contacts;
};

export const getContactsById = async (contactsId) => {
  const contacts = await Contacts.findById(contactsId);
  return contacts;
};