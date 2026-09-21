require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { generateOrderNumber } = require('../utils/helpers');

const categories = [
  { name: 'Web Development', icon: 'Globe', description: 'Custom websites, web apps, and landing pages' },
  { name: 'Mobile Development', icon: 'Smartphone', description: 'iOS and Android app development' },
  { name: 'Design', icon: 'Palette', description: 'Logo design, UI/UX, branding, and graphics' },
  { name: 'Writing', icon: 'PenTool', description: 'Content writing, copywriting, and editing' },
  { name: 'Digital Marketing', icon: 'TrendingUp', description: 'SEO, social media, and advertising' },
  { name: 'Video & Animation', icon: 'Video', description: 'Video editing, motion graphics, and animation' },
  { name: 'Music & Audio', icon: 'Music', description: 'Music production, voiceover, and sound design' },
  { name: 'AI & Machine Learning', icon: 'Cpu', description: 'AI solutions, data science, and machine learning' },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Service.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('   Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(
      categories.map((c) => ({
        ...c,
        slug: c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      }))
    );
    console.log(`   Created ${createdCategories.length} categories`);

    // Create demo users
    const hashedPassword = await bcrypt.hash('Demo@123', 12);

    const clientUser = await User.create({
      name: 'Alex Johnson',
      email: 'client@example.com',
      password: hashedPassword,
      role: 'client',
      bio: 'Startup founder looking for talented freelancers to bring ideas to life. Passionate about technology and design.',
      location: 'San Francisco, CA',
      avatar: { url: '', fileId: '' },
    });

    const freelancerUser = await User.create({
      name: 'Sarah Chen',
      email: 'freelancer@example.com',
      password: hashedPassword,
      role: 'freelancer',
      bio: 'Full-stack developer with 5+ years of experience. Specializing in React, Node.js, and modern web technologies. Let me help you build your next great project!',
      location: 'New York, NY',
      professionalTitle: 'Senior Full Stack Developer',
      experience: '5+ years',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'Python'],
      avatar: { url: '', fileId: '' },
    });

    // Additional freelancers
    const freelancers = await User.insertMany([
      {
        name: 'Marcus Rivera',
        email: 'marcus@example.com',
        password: hashedPassword,
        role: 'freelancer',
        bio: 'Creative UI/UX designer with a passion for clean, intuitive interfaces. I turn complex problems into simple, beautiful designs.',
        location: 'Austin, TX',
        professionalTitle: 'UI/UX Designer',
        experience: '4 years',
        skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
        avgRating: 4.8,
        totalReviews: 15,
        completedOrders: 22,
      },
      {
        name: 'Emily Watson',
        email: 'emily@example.com',
        password: hashedPassword,
        role: 'freelancer',
        bio: 'Professional content writer and SEO specialist. I create engaging content that ranks and converts.',
        location: 'London, UK',
        professionalTitle: 'Content Writer & SEO Expert',
        experience: '6 years',
        skills: ['SEO', 'Content Writing', 'Copywriting', 'Blog Writing', 'Social Media'],
        avgRating: 4.9,
        totalReviews: 28,
        completedOrders: 35,
      },
      {
        name: 'David Kim',
        email: 'david@example.com',
        password: hashedPassword,
        role: 'freelancer',
        bio: 'Mobile app developer specializing in React Native and Flutter. Building cross-platform apps that users love.',
        location: 'Seoul, South Korea',
        professionalTitle: 'Mobile App Developer',
        experience: '3 years',
        skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
        avgRating: 4.7,
        totalReviews: 12,
        completedOrders: 18,
      },
      {
        name: 'Lisa Patel',
        email: 'lisa@example.com',
        password: hashedPassword,
        role: 'freelancer',
        bio: 'Digital marketing strategist helping businesses grow their online presence through data-driven campaigns.',
        location: 'Mumbai, India',
        professionalTitle: 'Digital Marketing Strategist',
        experience: '5 years',
        skills: ['Google Ads', 'Facebook Ads', 'SEO', 'Analytics', 'Email Marketing'],
        avgRating: 4.6,
        totalReviews: 20,
        completedOrders: 30,
      },
      {
        name: 'James Thompson',
        email: 'james@example.com',
        password: hashedPassword,
        role: 'freelancer',
        bio: 'Professional video editor and motion graphics artist. Creating stunning visual stories that captivate audiences.',
        location: 'Los Angeles, CA',
        professionalTitle: 'Video Editor & Motion Designer',
        experience: '7 years',
        skills: ['Adobe Premiere', 'After Effects', 'DaVinci Resolve', 'Motion Graphics', '3D Animation'],
        avgRating: 4.9,
        totalReviews: 35,
        completedOrders: 45,
      },
      {
        name: 'Aisha Rahman',
        email: 'aisha@example.com',
        password: hashedPassword,
        role: 'freelancer',
        bio: 'AI/ML engineer with experience building intelligent systems. Specializing in NLP, computer vision, and predictive analytics.',
        location: 'Toronto, Canada',
        professionalTitle: 'AI/ML Engineer',
        experience: '4 years',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Data Science'],
        avgRating: 4.8,
        totalReviews: 10,
        completedOrders: 14,
      },
    ]);

    const allFreelancers = [freelancerUser, ...freelancers];
    console.log(`   Created ${allFreelancers.length + 1} users (1 client + ${allFreelancers.length} freelancers)`);

    // Category map for easy lookup
    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    // Create services
    const servicesData = [
      // Sarah Chen - Web Dev
      { title: 'Professional React Website Development', description: 'I will build a modern, responsive React website tailored to your business needs. Includes clean code architecture, SEO optimization, and mobile-first design. Perfect for startups and businesses looking for a professional web presence.', category: catMap['Web Development'], price: 299, deliveryTime: 7, freelancer: freelancerUser._id, tags: ['react', 'website', 'frontend', 'responsive'], requirements: 'Please provide your brand guidelines, content, and any design references.', isActive: true, avgRating: 4.8, totalReviews: 12, totalOrders: 15 },
      { title: 'Full Stack MERN Application', description: 'Get a complete full-stack web application built with MongoDB, Express, React, and Node.js. Includes user authentication, database design, REST API, and deployment assistance.', category: catMap['Web Development'], price: 599, deliveryTime: 14, freelancer: freelancerUser._id, tags: ['mern', 'fullstack', 'nodejs', 'mongodb'], requirements: 'Detailed project requirements document or wireframes.', isActive: true, avgRating: 4.9, totalReviews: 8, totalOrders: 10 },
      { title: 'Landing Page Design & Development', description: 'I will create a stunning, high-converting landing page for your product or service. Includes responsive design, smooth animations, and optimized performance.', category: catMap['Web Development'], price: 149, deliveryTime: 3, freelancer: freelancerUser._id, tags: ['landing-page', 'design', 'conversion', 'responsive'], requirements: 'Product details, target audience, and any branding materials.', isActive: true, avgRating: 4.7, totalReviews: 20, totalOrders: 25 },

      // Marcus Rivera - Design
      { title: 'Modern Logo Design Package', description: 'Get a unique, professional logo that captures your brand identity. Package includes 3 initial concepts, unlimited revisions, and all source files in multiple formats.', category: catMap['Design'], price: 199, deliveryTime: 5, freelancer: freelancers[0]._id, tags: ['logo', 'branding', 'graphic-design', 'identity'], requirements: 'Brand name, industry, preferred colors, and any style references.', isActive: true, avgRating: 4.8, totalReviews: 15, totalOrders: 22 },
      { title: 'Complete UI/UX Design for Web App', description: 'I will design a complete user interface and experience for your web application. Includes user research, wireframes, high-fidelity mockups, and interactive prototype.', category: catMap['Design'], price: 449, deliveryTime: 10, freelancer: freelancers[0]._id, tags: ['ui-ux', 'figma', 'prototype', 'web-design'], requirements: 'Project brief, user personas, and feature list.', isActive: true, avgRating: 4.9, totalReviews: 10, totalOrders: 12 },
      { title: 'Social Media Graphics Package', description: 'Professional social media graphics for your brand. Includes templates for Instagram, Facebook, Twitter, and LinkedIn. Consistent branding across all platforms.', category: catMap['Design'], price: 99, deliveryTime: 3, freelancer: freelancers[0]._id, tags: ['social-media', 'graphics', 'branding', 'instagram'], requirements: 'Brand guidelines, logo, and content calendar.', isActive: true, avgRating: 4.7, totalReviews: 8, totalOrders: 15 },

      // Emily Watson - Writing
      { title: 'SEO-Optimized Blog Articles', description: 'Get well-researched, engaging blog articles optimized for search engines. Each article includes keyword research, internal linking suggestions, and meta descriptions.', category: catMap['Writing'], price: 79, deliveryTime: 3, freelancer: freelancers[1]._id, tags: ['blog', 'seo', 'content-writing', 'articles'], requirements: 'Topic, target keywords, word count, and target audience.', isActive: true, avgRating: 4.9, totalReviews: 28, totalOrders: 35 },
      { title: 'Professional Website Copywriting', description: 'Compelling website copy that converts visitors into customers. Includes homepage, about page, services page, and all key landing pages.', category: catMap['Writing'], price: 249, deliveryTime: 5, freelancer: freelancers[1]._id, tags: ['copywriting', 'website', 'conversion', 'marketing'], requirements: 'Business overview, target audience, and tone preferences.', isActive: true, avgRating: 4.8, totalReviews: 15, totalOrders: 20 },

      // David Kim - Mobile
      { title: 'React Native Mobile App Development', description: 'Cross-platform mobile app built with React Native. Works on both iOS and Android from a single codebase. Includes push notifications, API integration, and app store submission.', category: catMap['Mobile Development'], price: 799, deliveryTime: 21, freelancer: freelancers[2]._id, tags: ['react-native', 'mobile', 'ios', 'android', 'cross-platform'], requirements: 'App requirements document, wireframes, and API documentation if available.', isActive: true, avgRating: 4.7, totalReviews: 12, totalOrders: 18 },
      { title: 'Flutter App UI Development', description: 'Beautiful, performant mobile app UI built with Flutter. Material Design and Cupertino widgets for a native feel on both platforms.', category: catMap['Mobile Development'], price: 399, deliveryTime: 10, freelancer: freelancers[2]._id, tags: ['flutter', 'mobile', 'ui', 'dart'], requirements: 'UI designs in Figma or similar tool, and project specifications.', isActive: true, avgRating: 4.6, totalReviews: 8, totalOrders: 10 },

      // Lisa Patel - Marketing
      { title: 'Complete SEO Audit & Strategy', description: 'Comprehensive SEO audit of your website with actionable recommendations. Includes technical SEO, on-page optimization, keyword strategy, and competitor analysis.', category: catMap['Digital Marketing'], price: 199, deliveryTime: 5, freelancer: freelancers[3]._id, tags: ['seo', 'audit', 'strategy', 'keywords'], requirements: 'Website URL, target keywords, and business goals.', isActive: true, avgRating: 4.6, totalReviews: 20, totalOrders: 30 },
      { title: 'Google Ads Campaign Management', description: 'Professional Google Ads campaign setup and management. Includes keyword research, ad copy creation, bid optimization, and monthly performance reports.', category: catMap['Digital Marketing'], price: 349, deliveryTime: 7, freelancer: freelancers[3]._id, tags: ['google-ads', 'ppc', 'advertising', 'sem'], requirements: 'Business details, budget, target audience, and campaign goals.', isActive: true, avgRating: 4.5, totalReviews: 12, totalOrders: 15 },

      // James Thompson - Video
      { title: 'Professional Video Editing', description: 'High-quality video editing for YouTube, social media, or marketing. Includes color grading, transitions, text overlays, background music, and sound mixing.', category: catMap['Video & Animation'], price: 149, deliveryTime: 3, freelancer: freelancers[4]._id, tags: ['video-editing', 'youtube', 'premiere', 'post-production'], requirements: 'Raw footage, desired style/mood, and any reference videos.', isActive: true, avgRating: 4.9, totalReviews: 35, totalOrders: 45 },
      { title: 'Motion Graphics & Animated Explainer Video', description: 'Engaging animated explainer video for your product or service. Includes script review, storyboard, animation, voiceover sync, and background music.', category: catMap['Video & Animation'], price: 499, deliveryTime: 10, freelancer: freelancers[4]._id, tags: ['motion-graphics', 'animation', 'explainer', 'after-effects'], requirements: 'Script or brief, brand colors, and preferred animation style.', isActive: true, avgRating: 4.8, totalReviews: 18, totalOrders: 22 },

      // Aisha Rahman - AI
      { title: 'Custom AI/ML Model Development', description: 'Custom machine learning model built for your specific use case. Includes data preprocessing, model training, evaluation, and deployment documentation.', category: catMap['AI & Machine Learning'], price: 699, deliveryTime: 14, freelancer: freelancers[5]._id, tags: ['machine-learning', 'ai', 'python', 'tensorflow'], requirements: 'Dataset, problem statement, and expected outcomes.', isActive: true, avgRating: 4.8, totalReviews: 10, totalOrders: 14 },
      { title: 'Data Analysis & Visualization Dashboard', description: 'Transform your data into actionable insights with a custom analytics dashboard. Includes data cleaning, analysis, and interactive visualizations.', category: catMap['AI & Machine Learning'], price: 349, deliveryTime: 7, freelancer: freelancers[5]._id, tags: ['data-analysis', 'visualization', 'dashboard', 'python'], requirements: 'Dataset, business questions, and preferred visualization tools.', isActive: true, avgRating: 4.7, totalReviews: 7, totalOrders: 9 },
    ];

    const createdServices = await Service.insertMany(servicesData);
    console.log(`   Created ${createdServices.length} services`);

    // Update category service counts
    const catCounts = {};
    servicesData.forEach((s) => {
      const catId = s.category.toString();
      catCounts[catId] = (catCounts[catId] || 0) + 1;
    });
    for (const [catId, count] of Object.entries(catCounts)) {
      await Category.findByIdAndUpdate(catId, { serviceCount: count });
    }

    // Create sample orders
    const orders = await Order.insertMany([
      {
        orderNumber: generateOrderNumber(),
        service: createdServices[0]._id,
        client: clientUser._id,
        freelancer: freelancerUser._id,
        status: 'completed',
        paymentStatus: 'paid',
        price: 299,
        requirements: 'Need a portfolio website for my startup. Clean and modern design.',
        deliveredWork: { message: 'Here is your completed website! All pages are responsive and optimized.', files: [], deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: generateOrderNumber(),
        service: createdServices[1]._id,
        client: clientUser._id,
        freelancer: freelancerUser._id,
        status: 'in_progress',
        paymentStatus: 'paid',
        price: 599,
        requirements: 'Building a task management application with team collaboration features.',
      },
      {
        orderNumber: generateOrderNumber(),
        service: createdServices[3]._id,
        client: clientUser._id,
        freelancer: freelancers[0]._id,
        status: 'pending',
        paymentStatus: 'paid',
        price: 199,
        requirements: 'Logo for my tech startup called "NexaFlow". Modern and minimal style.',
      },
    ]);
    console.log(`   Created ${orders.length} orders`);

    // Create reviews for completed orders
    const reviews = await Review.insertMany([
      {
        order: orders[0]._id,
        service: createdServices[0]._id,
        client: clientUser._id,
        freelancer: freelancerUser._id,
        rating: 5,
        comment: 'Absolutely fantastic work! Sarah delivered a beautiful website that exceeded my expectations. Communication was excellent throughout the project. Highly recommended!',
      },
    ]);
    console.log(`   Created ${reviews.length} reviews`);

    // Create a sample conversation
    const conversation = await Conversation.create({
      participants: [clientUser._id, freelancerUser._id],
      lastMessage: {
        content: 'Looking forward to working together!',
        sender: freelancerUser._id,
        createdAt: new Date(),
      },
      unreadCounts: new Map([
        [clientUser._id.toString(), 1],
        [freelancerUser._id.toString(), 0],
      ]),
    });

    await Message.insertMany([
      {
        conversation: conversation._id,
        sender: clientUser._id,
        content: 'Hi Sarah! I saw your React website development service. I have a project in mind.',
        readBy: [clientUser._id, freelancerUser._id],
      },
      {
        conversation: conversation._id,
        sender: freelancerUser._id,
        content: 'Hi Alex! Thanks for reaching out. I\'d love to hear about your project. What are you looking to build?',
        readBy: [clientUser._id, freelancerUser._id],
      },
      {
        conversation: conversation._id,
        sender: clientUser._id,
        content: 'I need a modern portfolio website for my startup. Clean design with animations.',
        readBy: [clientUser._id, freelancerUser._id],
      },
      {
        conversation: conversation._id,
        sender: freelancerUser._id,
        content: 'Looking forward to working together!',
        readBy: [freelancerUser._id],
      },
    ]);
    console.log('   Created sample conversation with messages');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('   Client:     client@example.com / Demo@123');
    console.log('   Freelancer: freelancer@example.com / Demo@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
