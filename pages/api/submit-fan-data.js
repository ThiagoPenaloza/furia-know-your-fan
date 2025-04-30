// pages/api/submit-fan-data.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

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
    const fanData = {
      name: fields.name,
      email: fields.email,
      cpf: fields.cpf,
      birthDate: fields.birthDate,
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
        instagram: fields['socialMedia.instagram'] || '',
        twitter: fields['socialMedia.twitter'] || '',
        facebook: fields['socialMedia.facebook'] || '',
        twitch: fields['socialMedia.twitch'] || '',
        youtube: fields['socialMedia.youtube'] || '',
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
          size: files.idDocument.size,
          mimetype: files.idDocument.mimetype,
        } : null,
        selfie: files.selfie ? {
          filename: path.basename(files.selfie.filepath),
          size: files.selfie.size,
          mimetype: files.selfie.mimetype,
        } : null,
      },
      createdAt: new Date().toISOString(),
    };

    // In a real application, you would save this data to a database
    // For this example, we'll save it to a JSON file
    const dataFilePath = path.join(process.cwd(), 'data', 'fans.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(path.dirname(dataFilePath))) {
      fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
    }
    
    // Read existing data or create empty array
    let existingData = [];
    try {
      if (fs.existsSync(dataFilePath)) {
        existingData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading existing data:', error);
    }
    
    // Add new data and save
    existingData.push(fanData);
    fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}