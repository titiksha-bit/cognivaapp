const mongoose = require('mongoose');
require('dotenv').config();
const Reel = require('./models/Reel');

const reelsData = [
  {
    title: "5 most common medicine and their uses",
    author: "The Diagnostic Book",
    role: "Medical Educator",
    likes: 0,
    tags: ["medicine", "pharmacology"],
    videoUrl: "https://youtube.com/shorts/6nM8AlJQD4U",
    keyTip: "Always check expiry date and dosage before taking any medicine."
  },
  {
    title: "Common Medicine And Their Uses",
    author: "immgpharmacistt",
    role: "Pharmacist",
    likes: 0,
    tags: ["medicine", "pharmacy"],
    videoUrl: "https://youtube.com/shorts/b5hmETF9VeE",
    keyTip: "Never self-medicate. Always consult a doctor."
  },
  {
    title: "Medical Terminology (itis - Inflammation)",
    author: "Medical Guideline",
    role: "Medical Educator",
    likes: 0,
    tags: ["medical terminology"],
    videoUrl: "https://youtube.com/shorts/PRSTHiBTu60",
    keyTip: "'Itis' means inflammation. Example: appendicitis."
  },
  {
    title: "Top 5 Common Antibiotics",
    author: "Spharmalab",
    role: "Pharmacist",
    likes: 0,
    tags: ["antibiotics", "pharmacology"],
    videoUrl: "https://youtube.com/shorts/hJIFP40nqGU",
    keyTip: "Antibiotics only work against bacteria, not viruses."
  },
  {
    title: "Smoking kills - How Smoking Affects Your Body",
    author: "Dr. Raza Health 360",
    role: "Doctor",
    likes: 0,
    tags: ["smoking", "health awareness"],
    videoUrl: "https://youtube.com/shorts/t9lNonmqmOY",
    keyTip: "Smoking damages nearly every organ. Quit for better health."
  },
  {
    title: "5 most common injection and their uses",
    author: "The Diagnostic Book",
    role: "Medical Educator",
    likes: 0,
    tags: ["injection", "medicine"],
    videoUrl: "https://youtube.com/shorts/8b7s4HuWn4k",
    keyTip: "Injections must be given by trained professionals."
  },
  {
    title: "What Really Happens During Stomach Pain",
    author: "Health IQ",
    role: "Medical Educator",
    likes: 0,
    tags: ["stomach pain", "3d animation"],
    videoUrl: "https://youtube.com/shorts/4HiVcXrIZ3E",
    keyTip: "Stomach pain causes include overeating, stress, infection."
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Reel.deleteMany({});
    await Reel.insertMany(reelsData);
    console.log(`✅ ${reelsData.length} reels added to database`);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });