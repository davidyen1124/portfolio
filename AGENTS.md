# Agent Onboarding Guide

Welcome to the repository! This short document explains how to get oriented and which tools are already available. It assumes you are opening the project for the first time.

## Project Overview
- A personal portfolio site presented as a 3D museum.
- Built with **Three.js** and vanilla JavaScript. Core logic lives in `js/museum.js`.
- Styling is in `css/styles.css`; the main page is `index.html`.
- Latest commit message: _"Implement basic jumping physics"_ (commit `65fd2a9`).

## Getting Started
1. Install dependencies using **Node.js**:
   ```bash
   npm install
   ```
2. Run linters before committing:
   ```bash
   npm run lint
   ```
   - This runs HTML, CSS, and JS linters defined in `package.json`.
3. Open `index.html` in a browser to view the museum.

## Coding Guidelines
- JavaScript follows ESLint rules from `.eslintrc.json`:
  - 2‑space indentation.
  - Single quotes.
  - No semicolons.
- CSS is checked with Stylelint using `.stylelintrc.json`.
- HTML validation rules are defined in `.htmlvalidate.json`.

## What’s Already Implemented
- Complete scene setup with lighting, camera controls, and movement.
- Basic jumping physics as introduced in the latest commit.
- GitHub Actions workflow (`.github/workflows/lint.yml`) automatically runs linters on pushes and pull requests.

## Tips for New Agents
- Review the existing configuration files to understand linting and formatting expectations.
- Keep assets like `assets/resume.json` and `assets/resume.pdf` synchronized when updating résumé data.
- Avoid large binary additions without necessity since the repo is primarily code and small assets.

For additional project details, read `README.md`.
