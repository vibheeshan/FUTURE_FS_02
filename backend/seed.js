require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Lead = require('./models/Lead');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@crm.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('👤 Admin user created');
    console.log('   Email: admin@crm.com');
    console.log('   Password: admin123');

    // Sample leads
    const sampleLeads = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0101',
        company: 'Tech Solutions Inc',
        source: 'Website',
        status: 'new',
        message: 'Interested in website redesign services',
        budget: 5000,
        createdBy: adminUser._id
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1-555-0102',
        company: 'Marketing Pro',
        source: 'Referral',
        status: 'contacted',
        message: 'Looking for SEO optimization',
        budget: 3000,
        createdBy: adminUser._id,
        notes: [
          {
            content: 'Initial call completed. Very interested in our services.',
            createdBy: adminUser._id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        phone: '+1-555-0103',
        company: 'E-Commerce Plus',
        source: 'Social Media',
        status: 'qualified',
        message: 'Need help with e-commerce platform',
        budget: 10000,
        createdBy: adminUser._id,
        notes: [
          {
            content: 'Sent proposal. Waiting for feedback.',
            createdBy: adminUser._id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.r@example.com',
        phone: '+1-555-0104',
        company: 'Startup Ventures',
        source: 'Email Campaign',
        status: 'converted',
        message: 'Full branding package needed',
        budget: 15000,
        createdBy: adminUser._id,
        notes: [
          {
            content: 'Proposal accepted! Starting next week.',
            createdBy: adminUser._id,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            content: 'Contract signed and payment received.',
            createdBy: adminUser._id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        name: 'David Kim',
        email: 'david.kim@example.com',
        phone: '+1-555-0105',
        company: 'Finance Corp',
        source: 'Website',
        status: 'new',
        message: 'Interested in mobile app development',
        budget: 20000,
        createdBy: adminUser._id
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.a@example.com',
        phone: '+1-555-0106',
        company: 'Health & Wellness Co',
        source: 'Referral',
        status: 'contacted',
        message: 'Need a booking system for our clinic',
        budget: 7500,
        createdBy: adminUser._id
      },
      {
        name: 'James Wilson',
        email: 'james.w@example.com',
        phone: '+1-555-0107',
        company: 'Real Estate Group',
        source: 'Social Media',
        status: 'proposal',
        message: 'Property listing website needed',
        budget: 12000,
        createdBy: adminUser._id,
        notes: [
          {
            content: 'Met in person. Discussed requirements in detail.',
            createdBy: adminUser._id,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            content: 'Sent detailed proposal with timeline and pricing.',
            createdBy: adminUser._id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        name: 'Maria Garcia',
        email: 'maria.g@example.com',
        phone: '+1-555-0108',
        company: 'Restaurant Chain',
        source: 'Other',
        status: 'new',
        message: 'Online ordering system required',
        budget: 8000,
        createdBy: adminUser._id
      }
    ];

    // Create leads
    await Lead.insertMany(sampleLeads);
    console.log(`📊 Created ${sampleLeads.length} sample leads`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('   Email: admin@crm.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Remember to change the default password in production!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(() => seedData());
