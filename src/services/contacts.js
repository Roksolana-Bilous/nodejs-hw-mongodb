import { Contacts } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

export const getAllContacts = async ({
  userId,
  page,
  perPage,
  sortBy,
  sortOrder = SORT_ORDER.ASC,
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const sortDirection = sortOrder === SORT_ORDER.DESC ? 1 : -1;

  const query = { userId, ...filter };

  const [contactsCount, contacts] = await Promise.all([
    Contacts.countDocuments(query),
    Contacts.find(query)
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

export const getContactsById = async (contactId, userId) => {
  return Contacts.findOne({ _id: contactId, userId });
};

export const createContact = async (payload) => {
  return Contacts.create(payload);
};

export const updateContact = async (contactId, payload, userId) => {
  return Contacts.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
    },
  );
};

export const deleteContact = async (contactId, userId) => {
  return Contacts.findByIdAndDelete({ _id: contactId, userId });
};

