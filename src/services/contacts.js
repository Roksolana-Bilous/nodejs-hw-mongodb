import { Contacts } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  const contact = await Contacts.find();
  return contact;
};

export const getContactsById = async (contactId) => {
  const contact = await Contacts.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await Contacts.create(payload);
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