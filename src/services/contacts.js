import { Contacts } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder = SORT_ORDER.ASC,
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const sortDirection = sortOrder === SORT_ORDER.DESC ? 1 : -1;

  const contactsQuery = Contacts.find(filter);

  const [contactsCount, contacts] = await Promise.all([
    Contacts.countDocuments(filter),
    contactsQuery
      .sort({ [sortBy]: sortDirection})
      .skip(skip)
      .limit(limit)
      .exec(),
  ]);

  const paginationData = calculatePaginationData(
    contactsCount,
    perPage,
    page,
  );

  return {
    data: contacts,
    ...paginationData,
  };
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

