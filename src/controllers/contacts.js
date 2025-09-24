import { getAllContacts, getContactsById, updateContact, deleteContact } from "../services/contacts.js";
import createHttpError from "http-errors";
import { createContact } from "../services/contacts.js";

export const getContactsController = async (req, res, next) => {
    try {
        const contacts = await getAllContacts();

        res.json({
            status: 200,
            message: "Successfully found contacts!",
            data: contacts,
        });
    }
    catch (err) {
        next(err);
    }
};

export const getContactByIdController = async (req, res, next) => {
    const { contactsId } = req.params;
    const contacts = await getContactsById(contactsId);

    if (!contacts) {
        throw createHttpError(404, `Contact with id not found`);
    }

    res.json({
        status: 200,
        message: `Successfully found contact with id ${contactsId}!`,
        data: contacts,
    });
};

export const createContactController = async (req, res) => {
    const contact = await createContact(req.body);

    res.json({
        status: 201,
        message: "Successfully created a contact!",
        data: contact,
    });
};

export const patchContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await updateContact(contactId, req.body);
    if (!result) {
        next(createHttpError(404, `Contact not found`));
        return;
    }
    res.json({
        status: 200,
        message: "Successfully patched a contact!",
        data: {},
    });
};

export const deleteContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await deleteContact(contactId);
    if (!contact) {
        next(createHttpError(404, `Contact not found`));
        return;
    }
    res.status(204).send();
};