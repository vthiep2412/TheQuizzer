# The Quizzer - Aviation Exam Prep

A modern, high-performance web application designed for aviation students to practice and master aviation exam question banks (Air Law, Meteorology, Navigation, ATK Aerodynamics, etc.).

## Features

- **Dynamic Question Bank Parsing**: Seamlessly loads subjects from JSON question banks.
- **Diagram & Image Support**: Automatically detects questions with diagrams (`img` property), dynamically adjusting the interface into a 2-column layout with constrained aspect-ratio scaling (`object-fit: contain`) for diagrams.
- **Crypto-Secure Question Sampling & Shuffling**: Utilizes `crypto.getRandomValues()` with Fisher-Yates shuffle to pick random sub-sets (e.g. 20 out of 200+ questions) uniformly from the entire question bank.
- **Study & Exam Modes**: Practice with instant feedback and explanations, or test knowledge under timed exam conditions.
- **Keyboard Shortcuts & Accessibility**: Quick navigation using keys `A-D` / `1-4`, `Enter`, `Arrow keys`, and `F` to flag questions.
- **Bilingual Interface**: Full support for English (`EN`) and Vietnamese (`VI`).
- **Dark / Light Glassmorphism UI**: Styled with responsive CSS variables, modern typography (Outfit & Inter), and glassmorphism.

## Getting Started

Open `index.html` in any modern web browser or serve via local development server:

```bash
# Example using live-server or static server
npx serve .
```
