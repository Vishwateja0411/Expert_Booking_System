import { Expert } from '../models/Expert.js';

const sampleExperts = [
  {
    name: 'Dr. Ananya Rao',
    category: 'Career Coaching',
    experience: 12,
    rating: 4.9,
    price: 1800,
    bio: 'Helps early and mid-career professionals choose roles, prepare interviews, and build practical growth plans.',
    availableSlots: [
      { date: '2026-05-10', times: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'] },
      { date: '2026-05-11', times: ['11:00 AM', '01:30 PM', '05:00 PM'] },
      { date: '2026-05-12', times: ['09:30 AM', '12:00 PM', '03:30 PM'] }
    ]
  },
  {
    name: 'Rahul Mehta',
    category: 'Product Strategy',
    experience: 9,
    rating: 4.7,
    price: 2200,
    bio: 'Product leader specializing in discovery, roadmapping, stakeholder alignment, and MVP planning.',
    availableSlots: [
      { date: '2026-05-10', times: ['10:00 AM', '12:30 PM', '03:00 PM'] },
      { date: '2026-05-11', times: ['09:30 AM', '02:30 PM', '06:00 PM'] },
      { date: '2026-05-13', times: ['11:30 AM', '04:00 PM'] }
    ]
  },
  {
    name: 'Meera Iyer',
    category: 'Mental Wellness',
    experience: 15,
    rating: 4.8,
    price: 2000,
    bio: 'Supports stress management, workplace burnout recovery, and sustainable habit design.',
    availableSlots: [
      { date: '2026-05-10', times: ['08:30 AM', '01:00 PM', '05:30 PM'] },
      { date: '2026-05-12', times: ['10:00 AM', '02:00 PM', '04:00 PM'] },
      { date: '2026-05-14', times: ['09:00 AM', '12:30 PM'] }
    ]
  },
  {
    name: 'Arjun Sen',
    category: 'Technology',
    experience: 11,
    rating: 4.6,
    price: 2500,
    bio: 'Engineering mentor for architecture reviews, system design interviews, and full-stack project planning.',
    availableSlots: [
      { date: '2026-05-11', times: ['10:00 AM', '03:00 PM', '07:00 PM'] },
      { date: '2026-05-12', times: ['09:00 AM', '01:00 PM', '06:30 PM'] },
      { date: '2026-05-13', times: ['11:00 AM', '02:00 PM'] }
    ]
  },
  {
    name: 'Nisha Kapoor',
    category: 'Finance',
    experience: 10,
    rating: 4.5,
    price: 1700,
    bio: 'Guides budgeting, savings goals, personal finance foundations, and first-time investing discipline.',
    availableSlots: [
      { date: '2026-05-10', times: ['09:30 AM', '11:30 AM', '04:00 PM'] },
      { date: '2026-05-12', times: ['10:30 AM', '03:30 PM', '05:30 PM'] },
      { date: '2026-05-15', times: ['12:00 PM', '06:00 PM'] }
    ]
  },
  {
    name: 'Vikram Shah',
    category: 'Legal Advice',
    experience: 14,
    rating: 4.7,
    price: 2400,
    bio: 'Advises founders and freelancers on contracts, compliance basics, and practical legal risk review.',
    availableSlots: [
      { date: '2026-05-11', times: ['09:00 AM', '12:00 PM', '05:00 PM'] },
      { date: '2026-05-13', times: ['10:30 AM', '01:30 PM', '04:30 PM'] },
      { date: '2026-05-15', times: ['11:00 AM', '03:00 PM'] }
    ]
  },
  {
    name: 'Sara Thomas',
    category: 'Marketing',
    experience: 8,
    rating: 4.4,
    price: 1600,
    bio: 'Works with small teams on brand positioning, campaign planning, and content calendars that can actually ship.',
    availableSlots: [
      { date: '2026-05-10', times: ['10:30 AM', '02:30 PM', '06:30 PM'] },
      { date: '2026-05-14', times: ['09:30 AM', '12:30 PM', '05:30 PM'] },
      { date: '2026-05-16', times: ['11:00 AM', '04:00 PM'] }
    ]
  },
  {
    name: 'Kabir Malhotra',
    category: 'Technology',
    experience: 7,
    rating: 4.3,
    price: 1500,
    bio: 'Frontend mentor focused on React, performance, clean UI architecture, and portfolio project reviews.',
    availableSlots: [
      { date: '2026-05-12', times: ['08:30 AM', '10:30 AM', '02:30 PM'] },
      { date: '2026-05-14', times: ['11:30 AM', '03:30 PM', '07:00 PM'] },
      { date: '2026-05-16', times: ['09:00 AM', '01:00 PM'] }
    ]
  }
];

export async function seedExperts() {
  const count = await Expert.countDocuments();

  if (count > 0) return;

  await Expert.insertMany(sampleExperts);
  console.log('Sample experts seeded');
}
