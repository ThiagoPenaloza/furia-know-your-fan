// pages/api/create-test-user.js
import dbConnect from '../../lib/db';
import Fan from '../../models/Fan';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Gerar email e CPF aleatórios
    const randomId = Math.floor(Math.random() * 10000);
    const email = `teste${randomId}@example.com`;
    const cpf = `12345678900`;
    
    // Criar um usuário de teste
    const testUser = {
      name: `Usuário Teste ${randomId}`,
      email: email,
      cpf: cpf,
      birthDate: new Date(),
      phone: '11999999999',
      address: {
        street: 'Rua de Teste',
        number: '123',
        complement: 'Apto 456',
        neighborhood: 'Bairro Teste',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567'
      },
      favoriteGames: ['CS:GO', 'Valorant'],
      favoriteTeams: ['FURIA', 'LOUD'],
      favoritePlayers: ['arT', 'KSCERATO'],
      attendedEvents: [],
      purchasedMerchandise: [],
      socialMedia: {
        instagram: '',
        twitter: '',
        facebook: '',
        twitch: '',
        youtube: ''
      },
      gamingProfiles: {
        steam: '',
        epic: '',
        battleNet: '',
        riotGames: '',
        origin: ''
      }
    };
    
    // Usar create em vez de new + save
    const createdUser = await Fan.create(testUser);
    
    return res.status(201).json({
      success: true,
      message: 'Usuário de teste criado com sucesso',
      email: email,
      cpf: cpf,
      userId: createdUser._id
    });
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}