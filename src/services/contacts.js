import { Contacts } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  const contacts = await Contacts.find();
  return contacts;
};

export const getContactsById = async (contactsId) => {
  const contacts = await Contacts.findById(contactsId);
  return contacts;
};

export const createContact = async (playload) => {
  const contact = await Contacts.create(playload);
  return contact;
};

export const updateContact = async (contactId, payload) => {
  const result = await Contacts.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
    },
  );
  return result;
};

export const deleteContact = async (contactId) => {
  const result = await Contacts.findByIdAndDelete(contactId);
  return result;
};