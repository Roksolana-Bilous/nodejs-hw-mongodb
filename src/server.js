import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { getAllContacts, getContactsById } from './services/contacts.js';
import { getEnvVar } from './utils/getEnvVar.js';

const PORT = Number(getEnvVar('PORT', '3000'));

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();

      res.status(200).json({
          status: 200,
          message: 'Successfully found contacts!',
          data: contacts,
    });
  });

  app.get('/contacts/:contactsId', async (req, res, next) => {
    const { contactsId } = req.params;
      const contacts = await getContactsById(contactsId);
	if (!contacts) {
	  res.status(404).json({
		  message: 'Contact not found'
	  });
	  return;
	}

      res.status(200).json({
            status: 200,
            message: 'Successfully found contact with id {contactId}!',
            data: contacts,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

    app.use((req, res) => {
    res.status(404).json({status: 404, message: 'Not found'});
  });
};

