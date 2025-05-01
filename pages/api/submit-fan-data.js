// pages/api/submit-fan-data.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import dbConnect from '../../lib/db';
import User from '../../models/User';

// Disable the default body parser to handle form data with files
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await dbConnect();
    
    // Parse the form data
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Ensure uploads directory exists
    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, { recursive: true });
    }

    // Parse the form
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Process the data
    const userData = {
      name: fields.name,
      email: fields.email,
      cpf: fields.cpf,
      birthDate: new Date(fields.birthDate),
      phone: fields.phone,
      address: {
        street: fields['address.street'],
        number: fields['address.number'],
        complement: fields['address.complement'],
        neighborhood: fields['address.neighborhood'],
        city: fields['address.city'],
        state: fields['address.state'],
        zipCode: fields['address.zipCode'],
      },
      favoriteGames: JSON.parse(fields.favoriteGames || '[]'),
      favoriteTeams: JSON.parse(fields.favoriteTeams || '[]'),
      favoritePlayers: JSON.parse(fields.favoritePlayers || '[]'),
      attendedEvents: JSON.parse(fields.attendedEvents || '[]'),
      purchasedMerchandise: JSON.parse(fields.purchasedMerchandise || '[]'),
      socialMedia: {
        instagram: { 
          username: fields['socialMedia.instagram'] || '',
          connected: false
        },
        twitter: { 
          username: fields['socialMedia.twitter'] || '',
          connected: false
        },
        facebook: { 
          username: fields['socialMedia.facebook'] || '',
          connected: false
        },
        twitch: { 
          username: fields['socialMedia.twitch'] || '',
          connected: false
        },
        youtube: { 
          username: fields['socialMedia.youtube'] || '',
          connected: false
        },
      },
      gamingProfiles: {
        steam: fields['gamingProfiles.steam'] || '',
        epic: fields['gamingProfiles.epic'] || '',
        battleNet: fields['gamingProfiles.battleNet'] || '',
        riotGames: fields['gamingProfiles.riotGames'] || '',
        origin: fields['gamingProfiles.origin'] || '',
      },
      documents: {
        idDocument: files.idDocument ? {
          filename: path.basename(files.idDocument.filepath),
          verified: false
        } : null,
        selfie: files.selfie ? {
          filename: path.basename(files.selfie.filepath),
          verified: false
        } : null,
      }
    };

    // Save user to database
    const user = new User(userData);
    await user.save();
    
    // Generate a session token for the user
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');
    
    // Return success response with token
    return res.status(200).json({ 
      success: true,
      token,
      userId: user._id
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
