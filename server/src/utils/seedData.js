const Clinic = require('../models/Clinic');
const Pharmacy = require('../models/Pharmacy');

async function seedInitialData() {
  try {
    const clinicCount = await Clinic.countDocuments();
    if (clinicCount === 0) {
      console.log('Seeding initial registered clinics into MongoDB...');
      await Clinic.create([
        {
          clinicName: 'CareFlow Central Hospital & Medical Center',
          firstName: 'Sarah',
          lastName: 'Jenkins',
          email: 'central@careflow-health.com',
          phoneNumber: '+1 (555) 234-5678',
          address: '742 Evergreen Terrace, Medical District, Sector 4',
          password: 'password123',
          rating: 4.9,
          distance: '0.6 miles',
          openStatus: 'Open Now',
          departments: ['General Physician', 'Pulmonology', 'Cardiology', 'Emergency Medicine'],
          estimatedWaitTime: '5-10 mins',
          logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=150&q=80'
        },
        {
          clinicName: 'Apex Family Wellness Clinic',
          firstName: 'Robert',
          lastName: 'Chen',
          email: 'apex@careflow-health.com',
          phoneNumber: '+1 (555) 876-5432',
          address: '1088 Innovation Parkway, Suite 200',
          password: 'password123',
          rating: 4.8,
          distance: '1.2 miles',
          openStatus: 'Open Now',
          departments: ['General Physician', 'Pediatrics', 'Dermatology'],
          estimatedWaitTime: '10-15 mins',
          logoUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=150&q=80'
        },
        {
          clinicName: 'St. Jude Heart & Respiratory Institute',
          firstName: 'Elena',
          lastName: 'Rostova',
          email: 'stjude@careflow-health.com',
          phoneNumber: '+1 (555) 345-6789',
          address: '450 Healthcare Boulevard, Block B',
          password: 'password123',
          rating: 4.95,
          distance: '2.1 miles',
          openStatus: 'Open 24/7',
          departments: ['Cardiology', 'Pulmonology', 'Emergency Medicine'],
          estimatedWaitTime: '15-20 mins',
          logoUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=150&q=80'
        },
        {
          clinicName: 'Metro Neuro & Orthopedic Care Center',
          firstName: 'Marcus',
          lastName: 'Vance',
          email: 'metroneuro@careflow-health.com',
          phoneNumber: '+1 (555) 901-2345',
          address: '320 University Avenue, Suite 500',
          password: 'password123',
          rating: 4.75,
          distance: '3.4 miles',
          openStatus: 'Open Now',
          departments: ['Neurology', 'Orthopedics', 'General Physician'],
          estimatedWaitTime: '10 mins',
          logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=150&q=80'
        }
      ]);
      console.log('Successfully seeded registered clinics.');
    }

    const pharmacyCount = await Pharmacy.countDocuments();
    if (pharmacyCount === 0) {
      console.log('Seeding registered partner pharmacies into MongoDB...');
      await Pharmacy.create([
        {
          name: 'CareFlow Express Pharmacy & Wellness',
          address: '744 Evergreen Terrace (Adjacent to Central Hospital)',
          phoneNumber: '+1 (555) 111-2233',
          rating: 4.9,
          openStatus: 'Open 24/7',
          distance: '0.6 miles',
          availableMedicines: ['Paracetamol 500mg', 'Amoxicillin', 'Cetirizine', 'Ibuprofen', 'Cough Syrup']
        },
        {
          name: 'Walgreens Health & Meds Center',
          address: '1090 Innovation Parkway',
          phoneNumber: '+1 (555) 444-5566',
          rating: 4.8,
          openStatus: 'Open Now',
          distance: '1.3 miles',
          availableMedicines: ['Paracetamol', 'Multivitamins', 'Azithromycin', 'ORSL Solution']
        },
        {
          name: 'CVS Pharmacy Operations Partner',
          address: '452 Healthcare Boulevard',
          phoneNumber: '+1 (555) 777-8899',
          rating: 4.85,
          openStatus: 'Open 24/7',
          distance: '2.2 miles',
          availableMedicines: ['Inhalers', 'Pain Relief Gel', 'Fever Control Suspension', 'Antibiotics']
        }
      ]);
      console.log('Successfully seeded partner pharmacies.');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}

module.exports = seedInitialData;
